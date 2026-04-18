"use client";

import { useState, useEffect, useRef } from "react";
import { AssessmentResult } from "@/features/assessment/data/scoring";
import { Button } from "@/components/ui/button";
import { fetchAiReportAction } from "@/server/actions/generateAiReportAction";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Loader2, Download } from "lucide-react";
import ScouterReport from "./ScouterReport";

export function ResultView({ user, resultData, date }: { user: any, resultData: AssessmentResult, date: Date }) {
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [aiReport, setAiReport] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(true);

  useEffect(() => {
    // Fetch AI Evaluation
    fetchAiReportAction(resultData, 'vi').then(res => {
      if (res.success) {
        setAiReport(res.data);
      }
      setLoadingAi(false);
    });
  }, [resultData]);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 3, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("l", "mm", "a4"); // Landscape for Scouter Report since it's wide (1000px)
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ScouterSS_Result_${user.fullName || "UngVien"}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
    }
  };

  return (
    <div className="w-full flex flex-col items-center space-y-6 pb-20 bg-slate-100 min-h-screen pt-8">
      {/* Action Bar */}
      <div className="w-[1000px] flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="text-slate-600 font-bold flex items-center">
          {loadingAi && <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Đang chờ AI phân tích hồ sơ...</>}
          {!loadingAi && <span className="text-green-600">✓ AI đã hoàn tất phân tích</span>}
        </div>
        <Button onClick={handleExportPDF} className="bg-blue-800 hover:bg-blue-900 shadow-md">
          <Download className="mr-2 h-4 w-4" /> Xuất Báo Cáo A4 (PDF)
        </Button>
      </div>

      {/* Report Wrapper to capture via html2canvas */}
      <div className="overflow-x-auto w-full flex justify-center pb-8 p-4">
        <div ref={reportRef} className="shadow-2xl">
          <ScouterReport user={user} resultData={resultData} date={date} aiReport={aiReport} />
        </div>
      </div>
    </div>
  );
}

