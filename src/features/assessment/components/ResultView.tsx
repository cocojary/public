"use client";

import { useState, useEffect, useRef } from "react";
import type { AssessmentResult } from "@/features/assessment/data/scoring";
import { Button } from "@/components/ui/button";
import { fetchAiReportAction } from "@/server/actions/generateAiReportAction";
import type { AIReport } from "@/features/assessment/utils/openaiService";
import { Loader2, Download, AlertCircle, RefreshCw } from "lucide-react";
import ScouterReport from "./ScouterReport";
import HRCommentSection, { HRNote } from "./HRCommentSection";
import type { FlaggedAnswer } from "@/server/actions/getFlaggedAnswersAction";

interface ResultViewProps {
  recordId: string;
  user: any;
  resultData: AssessmentResult;
  date: Date;
  cachedAiReport: AIReport | null;
  initialHrNotes?: HRNote[];
  flaggedAnswers?: FlaggedAnswer[];
}

export function ResultView({ recordId, user, resultData, date, cachedAiReport, initialHrNotes = [], flaggedAnswers = [] }: ResultViewProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const [aiReport, setAiReport] = useState<AIReport | null>(cachedAiReport);
  const [loadingAi, setLoadingAi] = useState(!cachedAiReport);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    // Nếu đã có cache từ server thì không cần fetch
    if (cachedAiReport) return;

    generateReport();
  }, []);

  async function generateReport() {
    setLoadingAi(true);
    setAiError(null);
    try {
      const res = await fetchAiReportAction(recordId, resultData, 'vi');
      if (res.success && res.data) {
        setAiReport(res.data as AIReport);
      } else {
        setAiError(res.error ?? "Không thể tạo báo cáo AI");
      }
    } catch {
      setAiError("Mất kết nối. Vui lòng thử lại.");
    } finally {
      setLoadingAi(false);
    }
  }

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col items-center space-y-6 pb-20 bg-slate-100 min-h-screen pt-8 print:bg-white print:pt-0 print:pb-0">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:break-inside-avoid { break-inside: avoid; }
        }
      `}} />

      {/* Action Bar */}
      <div className="print:hidden w-full max-w-[1000px] flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
        <div className="text-slate-600 font-bold flex items-center gap-2 min-w-0">
          {loadingAi && (
            <>
              <Loader2 className="animate-spin h-4 w-4 shrink-0" />
              <span>Đang chờ AI phân tích hồ sơ...</span>
            </>
          )}
          {!loadingAi && !aiError && aiReport && (
            <span className="text-green-600">
              ✓ AI đã hoàn tất phân tích {aiReport.fromCache ? "(từ cache)" : ""}
            </span>
          )}
          {!loadingAi && aiError && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm">{aiError}</span>
              <button
                onClick={generateReport}
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline ml-1"
              >
                <RefreshCw className="h-3 w-3" /> Thử lại
              </button>
            </div>
          )}
        </div>
        <Button
          onClick={handleExportPDF}
          className="bg-blue-800 hover:bg-blue-900 shadow-md shrink-0"
        >
          <><Download className="mr-2 h-4 w-4" /> Xuất dữ liệu ra file PDF</>
        </Button>
      </div>

      {/* Report */}
      <div className="overflow-x-auto w-full flex justify-center pb-8 p-4 print:p-0 print:m-0 print:block">
        <div ref={reportRef} className="shadow-2xl print:shadow-none print:w-full max-w-[1000px]">
          <ScouterReport
            user={user}
            resultData={resultData}
            date={date}
            aiReport={aiReport}
          />

          <div className="print:hidden space-y-6 mt-8">
            {flaggedAnswers && flaggedAnswers.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 p-6 rounded-md shadow-sm">
                <h4 className="text-sm font-bold text-rose-800 mb-2 flex items-center gap-2">
                  <AlertCircle size={18} /> Phân Tích Độ Tin Cậy Thấp (Chỉ Dành Cho HR)
                </h4>
                <p className="text-xs text-rose-700 mb-4 bg-white/50 p-2 rounded">
                  Hệ thống phát hiện một số câu trả lời có nguy cơ làm giảm độ chính xác của báo cáo. Đặc biệt lưu ý các câu hỏi Tô Hồng (nói dối tuyệt đối).
                </p>
                <div className="space-y-3">
                  {flaggedAnswers.map((f, i) => (
                    <div key={i} className="text-xs bg-white p-3 border-l-4 border-rose-400 rounded-sm shadow-sm flex flex-col gap-1.5">
                      <div className="font-medium text-slate-800 flex items-start gap-2">
                        <span className="text-slate-400 mt-0.5">•</span>
                        <span dangerouslySetInnerHTML={{ __html: f.textVi }} />
                      </div>
                      <div className="flex flex-wrap gap-2 items-center mt-1 ml-4 text-[11px]">
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          Mức chọn: {f.answerValue} {f.answerValue >= 4 ? "(Cao bất thường)" : ""}
                        </span>
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                          {f.type === 'lie_scale' ? '🚨 Tô Hồng' : '⏱️ Trả Lời Nhanh'}
                        </span>
                        <span className="text-amber-700 italic">{f.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <HRCommentSection
              recordId={recordId}
              initialNotes={initialHrNotes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
