"use client";

import React from "react";
import { DevScoringResult } from "../utils/devScoring";
import { DevRadarChart } from "./DevRadarChart";
import { AIReport } from "../utils/openaiService";
import { AlertTriangle, CheckCircle, Info, ShieldAlert, Zap, Target, Users, BrainCircuit } from "lucide-react";

interface DevReportContentProps {
  result: DevScoringResult;
  aiReport?: AIReport | null;
}

export const DevReportContent: React.FC<DevReportContentProps> = ({ result, aiReport }) => {
  const radarData = result.scores.map((s) => ({
    name: s.name,
    score: s.score,
    fullMark: 10,
  }));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 bg-white rounded-2xl shadow-sm border border-slate-100">
      {/* Header & Reliability Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">
            Báo cáo Năng lực Kỹ thuật <span className="text-blue-600">SOTA V3.0</span>
          </h1>
          <p className="text-slate-500 mt-1">Hệ thống phân tích hành vi và tư duy lập trình viên cao cấp</p>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
          result.reliabilityStatus === "Reliable" 
            ? "bg-green-50 border-green-200 text-green-700" 
            : result.reliabilityStatus === "Suspect"
            ? "bg-yellow-50 border-yellow-200 text-yellow-700"
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {result.reliabilityStatus === "Reliable" && <CheckCircle className="w-5 h-5" />}
          {result.reliabilityStatus === "Suspect" && <AlertTriangle className="w-5 h-5" />}
          {result.reliabilityStatus === "Invalid" && <ShieldAlert className="w-5 h-5" />}
          <span className="font-semibold">
            Độ tin cậy: {
              result.reliabilityStatus === "Reliable" ? "Cao" : 
              result.reliabilityStatus === "Suspect" ? "Trung bình (Cần kiểm chứng)" : "Thấp (Kết quả không tin cậy)"
            }
          </span>
        </div>
      </div>

      {result.reliabilityStatus === "Invalid" && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex gap-3">
            <ShieldAlert className="text-red-600 shrink-0" />
            <p className="text-red-800 text-sm leading-relaxed">
              <strong>Cảnh báo:</strong> Ứng viên có dấu hiệu "tô hồng" hồ sơ quá mức (Lie Score: {result.lieScore}/10). 
              Các chỉ số năng lực bên dưới có thể không phản ánh đúng thực tế. Đề nghị phỏng vấn trực tiếp để kiểm tra tính trung thực.
            </p>
          </div>
        </div>
      )}

      {result.penaltyApplied && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
          <div className="flex gap-3">
            <Info className="text-yellow-600 shrink-0" />
            <p className="text-yellow-800 text-sm leading-relaxed">
              <strong>Lưu ý:</strong> Kết quả đã bị trừ {Math.round((1 - result.penaltyMultiplier) * 100)}% tổng điểm do chỉ số tin cậy ở mức nghi ngờ.
            </p>
          </div>
        </div>
      )}

      {/* Data Quality Index Section */}
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <ShieldAlert className="text-blue-600" /> Chỉ số Chất lượng Dữ liệu (Data Quality Index)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(result.dataQuality).map(([key, metric]) => (
            <div key={key} className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col items-center text-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {key === "lieScale" ? "Độ trung thực" : 
                 key === "consistency" ? "Tính nhất quán" : 
                 key === "neutralBias" ? "Tính cam kết" : 
                 key === "timeTracking" ? "Sự tập trung" : "Khuôn mẫu"}
              </span>
              <div className={`text-xl font-black ${
                metric.status === "Ok" ? "text-green-600" : 
                metric.status === "Warning" ? "text-yellow-600" : "text-red-600"
              }`}>
                {metric.score}
              </div>
              <div className={`w-2 h-2 rounded-full ${
                metric.status === "Ok" ? "bg-green-500" : 
                metric.status === "Warning" ? "bg-yellow-500" : "bg-red-500"
              }`} />
              <p className="text-[10px] text-slate-500 leading-tight min-h-[2.5rem] flex items-center">
                {metric.message}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Classification & Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="text-blue-600" /> Phân loại ứng viên
            </h2>
            <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm mb-4">
              <div className="text-2xl font-black text-blue-700 mb-1 uppercase tracking-wider uppercase">
                {result.classification.type}
              </div>
              <p className="text-slate-600 text-sm italic leading-relaxed">
                {result.classification.description}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <Target className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                <span>Phù hợp nhất với các dự án yêu cầu <strong>{result.classification.type.includes("Chuyên gia") ? "Kỹ thuật chuyên sâu" : result.classification.type.includes("Sản phẩm") ? "Tốc độ và sự sáng tạo" : "Sự ổn định và dẫn dắt"}</strong>.</span>
              </div>
            </div>
          </div>

          {/* AI Executive Summary (CTO Perspective) — dùng format mới nếu có */}
          {aiReport && (
            <div className="p-6 bg-blue-900 text-white rounded-2xl border border-blue-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BrainCircuit className="w-20 h-20" />
              </div>
              <h2 className="text-xl font-black text-blue-300 mb-3 flex items-center gap-2 uppercase tracking-tight">
                <BrainCircuit className="w-5 h-5" /> Nhận xét tổng quan (AI-CTO)
              </h2>
              <p className="text-sm leading-relaxed text-blue-50 relative z-10 italic">
                "{(aiReport as any).personaDescription ?? (aiReport as any).executiveSummary ?? 'Đang tải phân tích...'}"
              </p>
              {(aiReport as any).personaTitle && (
                <div className="mt-3 text-xs font-bold text-blue-300 flex items-center gap-2">
                  <span>{(aiReport as any).personaEmoji}</span>
                  <span>{(aiReport as any).personaTitle}</span>
                </div>
              )}
            </div>
          )}


          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="text-blue-600" /> Tóm tắt thế mạnh
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {result.recommendations.filter(r => r.level === "High").slice(0, 3).map((rec, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg text-green-800 text-sm border border-green-100">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <strong>{rec.traitName}:</strong> {rec.content}
                </div>
              ))}
              {result.recommendations.filter(r => r.level === "High").length === 0 && (
                <p className="text-sm text-slate-400 italic">Không có nhóm năng lực vượt trội rõ rệt.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold text-slate-900 mb-4 self-start">Biểu đồ Radar Năng lực</h2>
          <DevRadarChart data={radarData} />
          <p className="text-xs text-slate-400 mt-4 text-center">
            * Thang điểm 1-10. Trục càng rộng thể hiện năng lực càng mạnh ở nhóm đó.
          </p>
        </div>
      </div>

      {/* Recommendations Table */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Chi tiết 11 Nhóm Năng lực Kỹ thuật</h2>
        <div className="overflow-hidden border border-slate-200 rounded-xl">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nhóm năng lực</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Điểm số</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nhận xét & Lời khuyên</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {result.scores.map((score, idx) => {
                const rec = result.recommendations.find(r => r.traitId === score.traitId);
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{score.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                        score.score >= 7 ? "bg-green-100 text-green-700" :
                        score.score >= 5 ? "bg-blue-100 text-blue-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {score.score}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 leading-relaxed">
                        {rec?.content}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 border-t border-slate-100 text-center text-slate-400 text-xs">
        Báo cáo được tạo tự động bởi Hệ thống đánh giá Techzen SPI SOTA V3.0 • {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};
