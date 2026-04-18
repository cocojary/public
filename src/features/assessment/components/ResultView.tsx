"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { detectPersona, calcCombatPower, calcDutySuitability } from "@/features/assessment/data/aiAnalysis";
import { AssessmentResult } from "@/features/assessment/data/scoring";
import { Button } from "@/components/ui/button";
import { fetchAiReportAction } from "@/server/actions/generateAiReportAction";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Loader2, Download } from "lucide-react";

export function ResultView({ user, resultData, date }: { user: any, resultData: AssessmentResult, date: Date }) {
  const reportRef = useRef<HTMLDivElement>(null);
  
  const persona = useMemo(() => detectPersona(resultData.dimensions), [resultData.dimensions]);
  const combatPower = useMemo(() => calcCombatPower(resultData.dimensions), [resultData.dimensions]);
  const duties = useMemo(() => calcDutySuitability(resultData.dimensions), [resultData.dimensions]);

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
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Kết_quả_${user.fullName || "UngVien"}.pdf`);
  };

  const radarData = resultData.dimensions.filter(d => d.dimensionId !== 'lie_scale').map(d => ({
    name: ['E','A','C','N','O'][['extroversion','agreeableness','conscientiousness','neuroticism','openness'].indexOf(d.dimensionId)] || d.dimensionId.substring(0, 3).toUpperCase(),
    value: d.scaled,
    fullMark: 10,
  }));

  const barData = resultData.dimensions.filter(d => d.dimensionId !== 'lie_scale').map(d => ({
    name: d.name,
    Điểm: d.scaled,
  }));

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col space-y-6">
      <div className="flex justify-end pr-2">
        <Button onClick={handleExportPDF} className="bg-blue-600 hover:bg-blue-700">
          <Download className="mr-2 h-4 w-4" /> Xuất PDF
        </Button>
      </div>

      <div ref={reportRef} className="bg-white p-10 rounded-2xl shadow-xl w-full">
        {/* Header */}
        <div className="border-b-4 border-blue-800 pb-4 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-blue-900 uppercase">Hồ sơ Đánh giá Năng lực</h1>
            <p className="text-slate-500 mt-2 font-medium">Model: Big Five & HR Combat Power</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-slate-800">{user.fullName || "Ứng viên ẩn danh"}</h2>
            <p className="text-slate-500">Mã NV: {user.employeeId || "N/A"}</p>
            <p className="text-sm text-slate-400">Ngày làm bài: {new Date(date).toLocaleDateString("vi-VN")}</p>
          </div>
        </div>

        {/* Combat Power & Persona Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Sức chiến đấu */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col items-center justify-center">
            <h3 className="uppercase text-sm font-bold text-slate-500 mb-2">Chỉ số Năng lực (Combat Power)</h3>
            <div className="text-6xl font-black text-blue-700">{combatPower.total}</div>
            <div className={`mt-3 px-4 py-1 rounded-full text-sm font-bold ${
              combatPower.rank === 'S' || combatPower.rank === 'A' ? 'bg-green-100 text-green-800' :
              combatPower.rank === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              Hạng {combatPower.rank}
            </div>
            <p className="text-center text-sm text-slate-600 mt-2">{combatPower.label}</p>
          </div>

          {/* Persona */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="uppercase text-sm font-bold text-slate-500 mb-4">Loại hình tính cách (Persona)</h3>
            <div className="text-2xl font-bold text-slate-800 mb-2">
              <span className="text-4xl mr-2">{persona.emoji}</span> {persona.title}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{persona.description}</p>
          </div>
        </div>

        {/* AI Evaluation */}
        <div className="mb-10 bg-blue-50 border border-blue-200 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <h3 className="uppercase tracking-widest text-xs font-bold text-blue-800 mb-4 flex items-center">
            Đánh giá Tổng quan (Bởi AI)
          </h3>
          {loadingAi ? (
            <div className="flex items-center text-slate-500 py-4">
              <Loader2 className="animate-spin mr-3 h-5 w-5" /> Đang tổng hợp phân tích AI...
            </div>
          ) : aiReport ? (
            <div className="space-y-4 text-sm text-slate-800">
              <p><strong className="text-blue-900">Tóm tắt:</strong> {aiReport.executiveSummary}</p>
              <p><strong className="text-green-800">Điểm mạnh:</strong> {aiReport.strengthsNarrative}</p>
              <p><strong className="text-amber-800">Điểm cần phát triển:</strong> {aiReport.developmentNarrative}</p>
              <p><strong className="text-violet-800">Độ phù hợp:</strong> {aiReport.fitAnalysis}</p>
            </div>
          ) : (
            <p className="text-red-500 text-sm italic">Không thể phân tích AI lúc này.</p>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="uppercase text-sm font-bold text-slate-500 mb-4 text-center">Bản đồ Năng lực (Radar)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar name="Ứng viên" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="uppercase text-sm font-bold text-slate-500 mb-4 text-center">Chỉ số Big Five</h3>
            <div className="h-[300px] w-[110%] -ml-[5%]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 10]} hide />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="Điểm" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer info: Lie scale & Reliability */}
        <div className="mt-8 border-t border-slate-200 pt-6 flex justify-between items-center text-sm">
          <div>
            <span className="font-bold text-slate-600">Độ tin cậy bài test (Lie Scale): </span>
            <span className={`font-bold ${resultData.reliability.lieScore > 50 ? 'text-red-600' : 'text-green-600'}`}>
              {resultData.reliability.lieScore}% ({resultData.reliability.level})
            </span>
          </div>
          <div className="text-slate-400 font-medium italic">
            Techzen Internal HR Assessment
          </div>
        </div>

      </div>
    </div>
  );
}
