"use client";

import React, { useMemo } from "react";
import type { AssessmentResult, DimensionScore } from "../data/scoring";
import { detectPersona, detectCEOPersona, calcCombatPower, calcDutySuitability, analyzeNegativeTendencies, getReliabilityNarrative } from "../data/aiAnalysis";
import { DIMENSIONS } from "../data/dimensions";
import type { AIReport } from "../utils/openaiService";
import { buildUnifiedFromV2, buildUnifiedFromV4 } from "../utils/unifiedScoring";
import type { UnifiedScoringResult } from "../utils/unifiedEngine";
import UnifiedReport from "./UnifiedReport";

export interface ScouterReportProps {
  user: {
    fullName?: string;
    employeeId?: string;
  } | null;
  resultData: AssessmentResult;
  date: string | number | Date;
  aiReport?: AIReport | null;
}

// Helper components for the dense tables

const BlockHeader = ({ num, title, desc }: { num: string; title: string; desc: string }) => (
  <div className="flex items-center mb-3">
    <div className="bg-indigo-700 text-white font-black text-xl w-10 h-10 flex items-center justify-center mr-3 shadow-lg rounded-sm shrink-0">
      {num}
    </div>
    <div className="flex-1 bg-gradient-to-r from-indigo-50 to-transparent py-1.5 pl-3 border-l-4 border-indigo-700">
      <div className="font-bold text-indigo-950 text-base flex flex-col sm:flex-row sm:items-center">
        <span>{title}</span>
        <span className="text-slate-500 text-xs font-normal sm:ml-4 sm:border-l sm:border-slate-300 sm:pl-4 mt-0.5 sm:mt-0">
          {desc}
        </span>
      </div>
    </div>
  </div>
);

const ChartHeaderRow = ({ hasHighLow = true }: { hasHighLow?: boolean }) => (
  <div className="grid grid-cols-12 gap-1 text-xs font-bold text-center bg-slate-100 py-2 mb-1 border-b border-slate-200">
    <div className="col-span-2 text-slate-700">Thước đo</div>
    <div className="col-span-1 text-indigo-700">Điểm</div>
    {hasHighLow && <div className="col-span-3 text-left pl-3 text-slate-500 font-medium">Khuynh hướng điểm thấp</div>}
    <div className={`flex flex-col ${hasHighLow ? 'col-span-3' : 'col-span-6'}`}>
      <div className="flex justify-between w-full px-2 text-[10px] text-slate-400 font-medium">
        <span>20</span><span>40</span><span className="text-indigo-600 font-bold">50</span><span>60</span><span>80</span>
      </div>
      <div className="flex justify-between w-full h-1 bg-slate-200 mt-1 rounded-full relative overflow-hidden">
        <div className="absolute left-[50%] top-0 bottom-0 w-[2px] bg-indigo-400 z-0"></div>
      </div>
    </div>
    {hasHighLow && <div className="col-span-3 text-left pl-3 text-slate-500 font-medium">Khuynh hướng điểm cao</div>}
  </div>
);

// Renders the ZigZag line chart (for personality)
const ZigZagMatrix = ({ dimensions }: { dimensions: DimensionScore[] }) => {
  return (
    <div className="mt-2 text-sm border border-slate-200 relative bg-white shadow-sm rounded-sm">
      <ChartHeaderRow />
      {/* SVG overlay for drawing lines - Responsive with viewBox */}
      <div className="absolute w-[25%] h-[calc(100%-40px)] pointer-events-none z-10 top-[40px]" style={{ left: '50%' }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline 
            fill="none" 
            stroke="#4f46e5" 
            strokeWidth="2" 
            strokeLinejoin="round"
            points={dimensions.map((d, i) => {
              const pct = Math.max(20, Math.min(80, d.percentile));
              const x = ((pct - 20) / 60) * 100;
              const y = dimensions.length > 1 ? (i / (dimensions.length - 1)) * 100 : 50;
              return `${x},${y}`;
            }).join(' ')} 
          />
          {dimensions.map((d, i) => {
            const pct = Math.max(20, Math.min(80, d.percentile));
            const x = ((pct - 20) / 60) * 100;
            const y = dimensions.length > 1 ? (i / (dimensions.length - 1)) * 100 : 50;
            return (
              <circle key={i} cx={x} cy={y} r="3" fill="#4f46e5" />
            );
          })}
        </svg>
      </div>

      <div className="flex flex-col">
        {dimensions.map((d, i) => {
          const info = DIMENSIONS.find(x => x.id === d.dimensionId);
          return (
            <div key={d.dimensionId} className={`grid grid-cols-12 gap-1 items-stretch min-h-[36px] border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
              <div className="col-span-2 font-bold px-3 py-2 text-slate-700 flex items-center text-xs border-r border-slate-100">{info?.nameVi}</div>
              <div className="col-span-1 text-center font-black text-indigo-700 flex items-center justify-center bg-indigo-50/30">{d.percentile}</div>
              <div className="col-span-3 text-[11px] px-3 py-2 text-slate-500 leading-snug border-r border-slate-100 flex items-center italic">
                {info?.descLow}
              </div>
              <div className="col-span-3 border-r border-slate-100 relative">
                <div className="absolute left-[50%] h-full w-[1px] bg-slate-200"></div>
              </div>
              <div className="col-span-3 text-[11px] px-3 py-2 text-slate-500 leading-snug flex items-center italic">
                {info?.descHigh}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Horizontal Bar Matrix 
const HorizontalBarMatrix = ({ dimensions, color = "bg-indigo-600" }: { dimensions: DimensionScore[], color?: string }) => {
  return (
    <div className="mt-2 text-sm border border-slate-200 bg-white shadow-sm rounded-sm overflow-hidden">
      <ChartHeaderRow hasHighLow={false} />
      <div className="flex flex-col">
        {dimensions.map((d, i) => {
          const info = DIMENSIONS.find(x => x.id === d.dimensionId);
          const w = Math.max(0, Math.min(100, ((d.percentile - 20) / 60) * 100));
          return (
            <div key={d.dimensionId} className={`grid grid-cols-12 gap-1 items-stretch min-h-[32px] border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
              <div className="col-span-2 font-bold px-3 py-1.5 text-slate-700 flex items-center text-xs border-r border-slate-100">{info?.nameVi}</div>
              <div className="col-span-1 text-center font-black text-indigo-700 flex items-center justify-center bg-indigo-50/30">{d.percentile}</div>
              <div className="col-span-3 text-[10px] px-3 py-1.5 text-slate-500 border-r border-slate-100 flex items-center font-medium leading-tight italic">
                {info?.descHigh.split(',')[0]}
              </div>
              <div className="col-span-6 border-r border-slate-100 relative flex items-center px-4 bg-slate-50/30">
                <div className="absolute left-[50%] h-full w-[1px] bg-slate-200 z-0"></div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden relative z-10">
                   <div className={`h-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${w}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ScouterReport({ user, resultData, date, aiReport }: ScouterReportProps) {
  const isV4 = (resultData as any).type === "SPI_UNIFIED_V4";

  if (!resultData) {
    return (
      <div className="p-10 text-center bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi Dữ Liệu</h2>
        <p className="text-slate-600">Không tìm thấy thông tin kết quả đánh giá. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  // ── V4 (SPI_UNIFIED_V4) — render qua UnifiedReport ──────────
  if (isV4) {
    const v4Result = resultData as unknown as UnifiedScoringResult;
    const unifiedData = buildUnifiedFromV4(v4Result, DIMENSIONS);
    return (
      <div>
        <UnifiedReport
          data={unifiedData}
          aiReport={aiReport}
          candidateName={user?.fullName}
          reportDate={date ? new Date(date) : undefined}
        />
      </div>
    );
  }

  if (!resultData.dimensions) {
    return (
      <div className="p-10 text-center bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-amber-600 mb-2">Dữ Liệu Không Tương Thích</h2>
        <p className="text-slate-600">Báo cáo này có thể thuộc phiên bản cũ hoặc bị thiếu sơ đồ năng lực. Vui lòng liên hệ quản trị viên.</p>
      </div>
    );
  }

  // Tạo dữ liệu Unified cho V2 (legacy)
  const unifiedDataV2 = buildUnifiedFromV2(resultData, DIMENSIONS);

  const getDims = (group: string) => (resultData.dimensions || []).filter((d: DimensionScore) => {
    const dimInfo = DIMENSIONS.find(x => x.id === d.dimensionId);
    return dimInfo?.group === group && d.scaled > 0;
  });

  const getExactDims = (ids: string[]) => ids.map(id => (resultData.dimensions || []).find((d: DimensionScore) => d.dimensionId === id)).filter((d): d is DimensionScore => !!d && d.scaled > 0);

  const personalityDims = getExactDims(['extraversion', 'agreeableness', 'conscientiousness', 'openness', 'emotional_stability', 'execution_speed']);
  const motivationDims = getExactDims(['achievement_drive', 'challenge_spirit', 'autonomy', 'learning_curiosity', 'recognition_need']);
  const thinkingDims = getExactDims(['logical_thinking', 'empathy', 'caution']);
  const stressDims = getExactDims(['stress_mental', 'stress_physical']);
  const valueDims = getExactDims(['growth_orientation', 'stability_orientation', 'social_contribution']);
  const leadershipDims = getDims('leadership');

  const isCEO = leadershipDims.length > 0;
  const ceoPersona = isCEO ? detectCEOPersona(resultData.dimensions) : null;

  const negatives = useMemo(() => analyzeNegativeTendencies(resultData), [resultData]);
  const combatPower = useMemo(() => calcCombatPower(resultData.dimensions || []), [resultData]);
  const duties = useMemo(() => calcDutySuitability(resultData.dimensions || []), [resultData]);

  // Lấy diễn giải về độ tin cậy từ AI Engine
  const reliabilityNarrative = useMemo(() => {
    return getReliabilityNarrative(resultData.reliability);
  }, [resultData.reliability]);

  const reliabilityScore = 100 - resultData.reliability.lieScore;

  return (
    <div className="space-y-0">
      {/* ── PHẦN 1: Báo cáo Tổng Quan (UnifiedReport) ────────── */}
      <UnifiedReport
        data={unifiedDataV2}
        aiReport={aiReport}
        candidateName={user?.fullName}
        reportDate={date ? new Date(date) : undefined}
      />

      {/* ── DIVIDER ─────────────────────────────────────────── */}
      <div style={{ margin: '32px 0', padding: '0 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          borderTop: '2px dashed #E0E7FF',
        }}>
          <div style={{
            background: 'linear-gradient(135deg,#1E3A8A,#2563EB)',
            color: 'white', padding: '8px 24px', borderRadius: 8,
            fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
          }}>📋 Chi Tiết Năng Lực</div>
          <div style={{ flex: 1, height: 1, background: '#E0E7FF' }} />
          <span style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap' }}>Dữ liệu thô · Dimension Level</span>
        </div>
      </div>

      {/* ── PHẦN 2: Classic Detail Report ───────────────────── */}
      <div className="bg-white text-slate-900 mx-auto max-w-5xl w-full shadow-2xl overflow-hidden font-sans border border-slate-200">
      {/* SCOUTER HEADER */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-8 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full -ml-20 -mb-20 blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-4">
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tighter flex items-center">
              SCOUTER <span className={isCEO ? "text-amber-400 ml-2" : "text-indigo-400 ml-2"}>SS</span>
            </h1>
            <p className="text-indigo-200 font-medium tracking-widest text-xs uppercase">Powered by Techzen AI Assessment System</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-sm shadow-xl self-start md:self-center">
            <span className="text-lg font-bold block leading-none">{isCEO ? "BÁO CÁO CẤP LÃNH ĐẠO (CEO)" : "BÁO CÁO NĂNG LỰC NHÂN SỰ"}</span>
            <span className="text-[10px] text-indigo-300 font-bold tracking-tighter uppercase whitespace-nowrap mt-1 block">
              {isCEO ? "Đánh Giá Tầm Nhìn Chiến Lược (C-Level)" : "Đánh Giá Năng Lực Nhân Sự Toàn Diện"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 flex flex-col md:flex-row gap-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-3 border border-slate-200 shadow-sm flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Mã NV / ID</span>
            <span className="text-sm font-black text-slate-700">{user?.employeeId || "—"}</span>
          </div>
          <div className="bg-white p-3 border border-slate-200 shadow-sm flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Họ & Tên</span>
            <span className="text-sm font-black text-indigo-900 whitespace-nowrap overflow-hidden text-ellipsis">{user?.fullName || "Ẩn Danh"}</span>
          </div>
          <div className="bg-white p-3 border border-slate-200 shadow-sm flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Thời gian Đánh giá</span>
            <span className="text-sm font-black text-slate-700">{new Date(date).toLocaleDateString("vi-VN", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* 1-COLUMN LAYOUT */}
      <div className="flex flex-col space-y-8 px-8 py-10">
          
          {/* Section 1: Validation - ĐỘ TIN CẬY DỮ LIỆU */}
          <div>
            <BlockHeader num="1" title="Độ Tin Cậy Của Dữ Liệu" desc="Phân tích tính trung thực và sự nhất quán trong phản ứng" />
            <div className={`mt-4 p-6 rounded-sm border-l-4 ${resultData.reliability.level === 'high' ? 'bg-emerald-50 border-emerald-500' : 'bg-amber-50 border-amber-500'} shadow-sm`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                {/* Lie Scale */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                    <span>Độ lệch Lửa dối (Lie Scale)</span>
                    <span className={resultData.reliability.lieScore > 50 ? "text-rose-600" : "text-emerald-600"}>{resultData.reliability.lieScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${resultData.reliability.lieScore > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${resultData.reliability.lieScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Consistency */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                    <span>Tính nhất quán (Consistency)</span>
                    <span className={resultData.reliability.consistencyScore < 70 ? "text-amber-600" : "text-emerald-600"}>{resultData.reliability.consistencyScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${resultData.reliability.consistencyScore < 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${resultData.reliability.consistencyScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Speed */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                    <span>Tốc độ phản ứng (Speed)</span>
                    <span className={resultData.reliability.speedFlag ? "text-rose-600" : "text-emerald-600"}>{resultData.reliability.speedFlag ? "QUÁ NHANH" : "ỐN ĐỊNH"}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${resultData.reliability.speedFlag ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 p-4 rounded-sm border border-slate-200/50">
                <div className="text-xs font-black text-slate-800 uppercase mb-2 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${resultData.reliability.level === 'high' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  Căn cứ đánh giá: {reliabilityNarrative.label}
                </div>
                <ul className="space-y-1.5">
                  {reliabilityNarrative.details.map((detail: string, dIdx: number) => (
                    <li key={dIdx} className="text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Section 2 */}
          <div>
            <BlockHeader num="2" title="Xu Hướng Tính Cách" desc="Mô phỏng phản ứng vô thức và hành vi tự nhiên" />
            <ZigZagMatrix dimensions={personalityDims} />
          </div>

          {/* Section 3 */}
          <div>
            <BlockHeader num="3" title="Động Lực Thúc Đẩy" desc="Cường độ của khao khát phát triển và năng lượng" />
            <HorizontalBarMatrix dimensions={motivationDims} color="bg-slate-800" />
          </div>

          {/* Section 4 */}
          <div>
            <BlockHeader num="4" title="Khuynh Hướng Tư Duy" desc="Năng lực nhận thức, giải quyết vấn đề và đồng cảm" />
            <HorizontalBarMatrix dimensions={thinkingDims} color="bg-slate-800" />
          </div>

          {/* Section 5 */}
          <div>
            <BlockHeader num="5" title="Sức Chịu Đựng Stress" desc="Giới hạn chịu đựng về mặt tâm lý và thể chất" />
            <HorizontalBarMatrix dimensions={stressDims} color="bg-slate-800" />
          </div>

          
          {/* Section 6 */}
          <div>
            <BlockHeader num="6" title="Giá Trị Quan" desc="Khuynh hướng coi trọng đóng góp xã hội hay cá nhân" />
            <ZigZagMatrix dimensions={valueDims} />
          </div>

          {/* Section CEO Leadership (Conditional) */}
          {isCEO && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-[1px] rounded-sm shadow-2xl">
              <div className="bg-white p-6 rounded-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-amber-500 text-white font-black text-xl w-10 h-10 flex items-center justify-center mr-3 shadow-lg rounded-sm shrink-0">
                    7
                  </div>
                  <div className="flex-1 bg-gradient-to-r from-amber-50 to-transparent py-1.5 pl-3 border-l-4 border-amber-600">
                    <div className="font-bold text-amber-950 text-base">
                      Năng Lực Lãnh Đạo (CEO Strategy)
                      <span className="text-amber-700 text-[10px] font-black uppercase ml-4 tracking-widest bg-amber-100 px-2 py-0.5 rounded-full">
                        Phân tích Cấp Lãnh Đạo
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* CEO Persona Card */}
                {ceoPersona && (
                  <div className="mb-6 bg-slate-900 text-white p-6 rounded-sm border-r-8 border-amber-500 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl grayscale-0">{ceoPersona.emoji}</div>
                    <div className="relative z-10 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                         <span className="text-2xl">{ceoPersona.emoji}</span>
                         <span className="text-xl font-black tracking-tight text-amber-400 uppercase italic">Danh hiệu: {ceoPersona.title}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                         {ceoPersona.traits.map((t, idx) => (
                           <div key={idx} className="bg-white/10 px-3 py-1.5 border border-white/20 rounded-sm text-xs font-bold text-indigo-100">
                             • {t}
                           </div>
                         ))}
                      </div>
                      <div className="mt-4 text-[11px] leading-relaxed">
                        <span className="text-amber-500 font-bold uppercase tracking-tighter mr-2">Bối cảnh tối ưu:</span>
                        <span className="text-slate-300">{ceoPersona.bestEnvironment}</span>
                      </div>
                    </div>
                  </div>
                )}

                <HorizontalBarMatrix dimensions={leadershipDims} color="bg-amber-600" />
              </div>
            </div>
          )}

          {/* Section 7/8 - Negatives */}
          <div>
            <BlockHeader num={isCEO ? "8" : "7"} title="Xu Hướng Rủi Ro" desc="Các yếu tố rủi ro nội tại (Điểm CÀNG CAO CÀNG NGUY HIỂM)" />
            <div className="mt-2 border border-slate-200 bg-white shadow-sm rounded-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-1 text-[10px] font-bold text-center bg-slate-100 py-1.5 border-b border-slate-200">
                <div className="col-span-3 text-slate-500 uppercase tracking-tighter self-center">Thước đo</div>
                <div className="col-span-1 text-slate-500 uppercase tracking-tighter self-center">Điểm</div>
                <div className="col-span-8 flex justify-between px-2 gap-0.5">
                  <span className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-100 py-0.5 rounded-sm">An Toàn (0-30)</span>
                  <span className="flex-1 bg-amber-50 text-amber-700 border border-amber-100 py-0.5 rounded-sm">Chú Ý (40-60)</span>
                  <span className="flex-1 bg-rose-50 text-rose-700 border border-rose-100 py-0.5 rounded-sm">Nguy Cơ (70+)</span>
                </div>
              </div>
              {negatives.map((neg, i) => (
                <div key={neg.id} className={`grid grid-cols-12 gap-1 min-h-[32px] items-stretch text-xs border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  <div className="col-span-3 font-bold px-3 py-1.5 text-slate-700 flex items-center border-r border-slate-100">{neg.nameVi}</div>
                  <div className={`col-span-1 text-center font-black flex items-center justify-center border-r border-slate-100 ${neg.level === 'risk' ? 'text-rose-600 bg-rose-50' : neg.level === 'caution' ? 'text-amber-600 bg-amber-50' : 'text-slate-600 bg-slate-50'}`}>
                    {neg.score}
                  </div>
                  <div className="col-span-8 px-4 relative flex items-center bg-slate-50/20">
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden relative z-10 border border-slate-300/30">
                      <div 
                        className={`h-full z-10 transition-all duration-1000 ${neg.level === 'risk' ? 'bg-rose-500' : neg.level === 'caution' ? 'bg-amber-400' : 'bg-slate-500'}`} 
                        style={{ width: `${Math.min(100, Math.max(5, neg.score))}%` }}>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 8/9 - Duty Suitability (Duy nhất 1 cột, thiết kế Premium) */}
          <div className="space-y-4">
            <BlockHeader num={isCEO ? "9" : "8"} title="Vị Trí Công Việc Phù Hợp" desc="Tương thích dựa trên Ma trận Năng lực & Thái độ" />
            
            <div className="mt-4 grid grid-cols-1 gap-4">
              {duties.map((duty, idx) => {
                // Ánh xạ comment từ AI report nếu có (dựa trên keyword match)
                const aiFit = aiReport?.jobFit;
                let aiComment = "";
                if (aiFit) {
                  const dName = duty.duty.toLowerCase();
                  if (dName.includes('kỹ thuật') || dName.includes('dev')) aiComment = aiFit.technical?.comment;
                  else if (dName.includes('kinh doanh') || dName.includes('sales')) aiComment = aiFit.business?.comment;
                  else if (dName.includes('kế toán') || dName.includes('hành chính') || dName.includes('vận hành')) aiComment = aiFit.operations?.comment;
                  else if (dName.includes('ceo') || dName.includes('quản lý')) aiComment = aiFit.management?.comment;
                }

                return (
                  <div 
                    key={idx} 
                    className={`relative p-4 rounded-sm border transition-all duration-300 ${
                      duty.suitable 
                        ? 'bg-gradient-to-r from-emerald-50 to-white border-emerald-200 shadow-sm' 
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-sm flex items-center justify-center text-2xl shadow-inner ${
                            duty.suitable ? 'bg-emerald-100' : 'bg-slate-100'
                          }`}>
                            {duty.duty.split(' ')[0]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">
                                {duty.duty.split(' ').slice(1).join(' ')}
                              </h4>
                              {duty.suitable && (
                                <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                                  Rất Phù Hợp
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 italic leading-snug">
                              {duty.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 sm:w-64">
                          <div className="flex-1 space-y-1">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-400">Độ Phù Hợp</span>
                                <span className={duty.suitable ? "text-emerald-700" : "text-slate-600"}>{duty.score}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-[1px]">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${
                                    duty.suitable ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-slate-400'
                                  }`} 
                                  style={{ width: `${duty.score}%` }}
                                ></div>
                              </div>
                              <div className="text-[9px] text-slate-400 font-medium tracking-tight pt-0.5">
                                S≥80 · A≥70 · B≥60 · C&lt;60
                              </div>
                          </div>
                          <div className={`text-2xl font-black italic tracking-tighter ${
                            duty.suitable ? 'text-emerald-600' : 'text-slate-300'
                          }`}>
                            {duty.score > 80 ? 'S' : duty.score > 70 ? 'A' : duty.score > 60 ? 'B' : 'C'}
                          </div>
                        </div>
                      </div>

                      {/* AI Niche Role Comment */}
                      {aiComment && (
                        <div className="bg-white/50 border-l-2 border-indigo-400 p-2.5 mt-1">
                          <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                            Gợi ý vị trí ngách từ AI
                          </div>
                          <p className="text-[11px] text-indigo-900 leading-relaxed font-medium">
                            {aiComment}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {isCEO && (
               <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-sm italic text-[11px] text-amber-900 leading-relaxed shadow-inner">
                 <span className="font-bold uppercase mr-2">💡 Ghi chú:</span>
                 Báo cáo này ưu tiên các vị trí trong Ban điều hành (C-Level). Điểm số phản ánh khả năng duy trì hiệu suất dưới áp lực cao và tư duy quản trị hệ thống.
               </div>
            )}
          </div>

          {/* Section 8 & 9 */}
          <div className="flex flex-col gap-8">
          {/* Section 9/10: Chỉ số Chiến Lực - Anthropology Model */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col">
              <BlockHeader num={isCEO ? "10" : "9"} title="Chỉ Số Chiến Lực" desc="Sức mạnh tổng hợp dựa trên 4 trụ cột thực chiến (Anthropology Model)" />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                {/* Main Score Display */}
                <div className="lg:col-span-1 border border-indigo-200 p-8 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-indigo-950 relative overflow-hidden rounded-sm shadow-2xl text-white">
                  <div className="absolute opacity-10 text-[120px] font-black top-[-20px] right-[-10px] pointer-events-none italic">{combatPower.rank}</div>
                  <div className="text-[10px] font-bold tracking-widest uppercase mb-4 text-indigo-300">Tổng Năng Lực Chiến Lược</div>
                  <div className="text-6xl font-black tracking-tighter drop-shadow-lg mb-4">{combatPower.total.toLocaleString()}</div>
                  <div className="px-6 py-2 bg-amber-500 text-slate-900 text-xs font-black uppercase tracking-widest rounded-full shadow-lg z-10">
                    HẠNG {combatPower.rank} — {combatPower.label}
                  </div>
                </div>

                {/* 4 Pillars Details */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  {Object.entries(combatPower.pillars || {}).map(([key, val]: [string, any]) => (
                    <div key={key} className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{(val as any).name}</span>
                        <span className="text-lg font-black text-indigo-700">{(val as any).value}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600" style={{ width: `${(val as any).value}%` }}></div>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-2 leading-tight italic">{(val as any).desc}</p>
                    </div>
                  ))}
                  
                  {/* Penalty/Bonus Indicators */}
                  {(combatPower.penaltyFactor && combatPower.penaltyFactor < 1) && (
                    <div className="col-span-2 bg-rose-50 border border-rose-100 p-2 px-3 rounded-sm text-[10px] text-rose-700 flex items-center gap-2">
                       <span className="font-black underline uppercase">Cảnh báo:</span>
                       <span>Phát hiện "Gót chân Achilles" (Năng lực cốt lõi bị mất cân bằng trầm trọng).</span>
                    </div>
                  )}
                  {(combatPower.bonusPoints && combatPower.bonusPoints > 0) && (
                    <div className="col-span-2 bg-emerald-50 border border-emerald-100 p-2 px-3 rounded-sm text-[10px] text-emerald-700 flex items-center gap-2">
                       <span className="font-black underline uppercase">Ưu thế:</span>
                       <span>Sự cộng hưởng giữa các năng lực lãnh đạo tạo ra hiệu ứng khuếch đại sức mạnh.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
      </div>

      {/* FOOTER COMMENT SECTION */}
      <div className="mx-6 sm:mx-8 mb-10 border border-indigo-100 bg-slate-50/50 p-6 rounded-sm shadow-sm">
        <div className="flex items-center gap-3 mb-5 border-b border-indigo-100 pb-3">
          <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
          <h3 className="text-slate-800 font-black text-base tracking-tight">
            Nhận xét tổng quan AI <span className="text-[10px] font-normal text-slate-400 block sm:inline sm:ml-2">(Phân tích chuyên sâu từ mô hình ngôn ngữ lớn)</span>
          </h3>
        </div>
        
        {aiReport ? (
          <div className="space-y-8">
            {/* Persona Description */}
            <div className="relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
              <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span>{aiReport.personaEmoji}</span>
                Cốt cách & Chân dung bản ngã
              </div>
              <h4 className="text-lg font-black text-slate-800 mb-2 italic">"{aiReport.personaTitle}"</h4>
              <p className="text-sm text-slate-700 leading-relaxed text-justify">
                {aiReport.personaDescription}
              </p>
            </div>

            {/* Job Fit Niche Analysis */}
            <div className="bg-slate-100/50 p-5 rounded-sm border border-slate-200">
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="p-1 bg-slate-200 rounded text-xs">🎯</span>
                Phân tích vai trò & Độ tương thích (AI Niche Fit)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(aiReport.jobFit).map(([key, data]) => {
                  const JOB_FIT_LABEL: Record<string, string> = {
                    technical:  '💻 Kỹ Thuật',
                    business:   '💰 Kinh Doanh',
                    operations: '🗂️ Vận Hành',
                    management: '🌟 Quản Lý',
                  };
                  return (
                  <div key={key} className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold uppercase text-slate-500">{JOB_FIT_LABEL[key] ?? key}</span>
                      <span className="text-sm font-black text-indigo-700">{data.score}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${data.score}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-tight italic mt-1">{data.comment}</p>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Strengths & Blind Spots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50/50 p-4 rounded-sm border border-emerald-100">
                <div className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Ưu thế vượt trội
                </div>
                <ul className="space-y-2">
                  {aiReport.strengthsBlindSpots.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-slate-700 leading-tight">
                      <span className="font-bold text-emerald-800">· {s.title}:</span> {s.behavior}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-rose-50/50 p-4 rounded-sm border border-rose-100">
                <div className="text-[10px] font-black text-rose-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                  Điểm mù & Rủi ro
                </div>
                <ul className="space-y-2">
                  {aiReport.strengthsBlindSpots.blindSpots.map((s, i) => (
                    <li key={i} className="text-sm text-slate-700 leading-tight">
                      <span className="font-bold text-rose-800">· {s.title}:</span> {s.risk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Coaching Advice */}
            <div className="bg-white p-5 rounded-sm border border-indigo-100 shadow-sm">
              <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="p-1 bg-indigo-100 rounded text-xs">🚀</span>
                Lộ trình phát triển & Lời khuyên chiến lược
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aiReport.coachingAdvice.map((advice, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="text-indigo-300 font-black text-xl leading-none">{i + 1}</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{advice.area}</span>
                        <span className="text-[9px] text-slate-400">|</span>
                        <span className="text-[10px] font-bold text-indigo-600">{advice.action}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-normal italic">{advice.rationale}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps & Interview Questions (Nội dung HR) */}
            <div className="mt-8 bg-slate-900 text-white p-6 rounded-sm shadow-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-3">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                <h3 className="font-black text-base tracking-tight uppercase">Bảng Điều Khiển Nhân Sự (HR Dashboard)</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hành động tiếp theo */}
                <div className="bg-slate-800/50 p-5 rounded-sm border border-slate-700">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Hành động Đề xuất</h4>
                  <div className="space-y-3">
                    {reliabilityScore < 60 ? (
                      <p className="text-[11px] text-rose-300 leading-relaxed">
                        <strong className="text-white block mb-1">🔴 Độ tin cậy thấp ({reliabilityScore}%):</strong> Kết quả bài test có dấu hiệu người làm trả lời không trung thực để tạo ấn tượng tốt (Lie Scale cao). Đề xuất yêu cầu ứng viên làm lại bài hoặc sử dụng các câu hỏi phỏng vấn hành vi để xác minh lại. Không nên dùng kết quả này làm tiêu chí duy nhất.
                      </p>
                    ) : reliabilityScore < 80 ? (
                      <p className="text-[11px] text-amber-300 leading-relaxed">
                        <strong className="text-white block mb-1">🟡 Cần xác nhận thêm ({reliabilityScore}%):</strong> Ứng viên có xu hướng thể hiện bản thân tốt hơn thực tế đôi chút (Social Desirability). Kết quả có thể dùng được nhưng cần đối chiếu thêm qua phỏng vấn.
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-300 leading-relaxed">
                        <strong className="text-white block mb-1">✅ Kết quả đáng tin ({reliabilityScore}%):</strong> Hình mẫu phân tích qua bài test phản ánh sát với thực tế của ứng viên. Có thể dùng ngay kết quả này để tư vấn phân công hoặc cá nhân hóa lộ trình hội nhập/huấn luyện.
                      </p>
                    )}
                  </div>
                </div>

                {/* Câu hỏi phỏng vấn gợi ý */}
                <div className="bg-slate-800/50 p-5 rounded-sm border border-slate-700">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Gợi ý Câu hỏi Phỏng vấn</h4>
                  <ul className="space-y-4">
                    {(() => {
                      const INTERVIEW_QUESTIONS: Record<string, string> = {
                        'self_enhancement': 'Hãy kể một tình huống bạn nhận ra mình đánh giá sai năng lực của bản thân. Bạn đã xử lý thế nào?',
                        'inconsistency':    'Mô tả cách bạn đưa ra quyết định khi gặp dữ liệu mâu thuẫn hoặc thiếu thông tin. Ví dụ cụ thể?',
                        'burnout_risk':     'Chia sẻ một thời điểm bạn phải đối mặt với áp lực lớn. Bạn quản lý năng lượng và stress ra sao?',
                        'conflict_risk':    'Hãy kể lần bạn bất đồng quan điểm gay gắt với đồng nghiệp hoặc người quản lý. Kết quả thế nào?',
                        'early_quit_risk':  'Trong quá khứ, yếu tố then chốt nào khiến bạn quyết định rời bỏ một tổ chức?',
                        'speed_anomaly':    'Trước khi ra một quyết định quan trọng nhưng cần gấp rút, bạn ưu tiên điều gì?',
                      };
                      
                      const topRisks = negatives.filter(n => n.level === 'risk' || n.level === 'caution').slice(0, 2);
                      
                      if (topRisks.length === 0) {
                        return <li className="text-[11px] text-slate-300 italic py-2">✅ Không phát hiện rủi ro nghiêm trọng. Có thể tập trung hỏi sâu về động lực thay vì rủi ro.</li>;
                      }

                      return topRisks.map((risk, idx) => (
                        <li key={idx} className="text-[11px] text-slate-300 leading-relaxed bg-slate-800 p-3 rounded-sm border border-slate-700/50">
                          <strong className="text-amber-400 block mb-1 text-[10px] uppercase tracking-widest">
                            Xác minh: {risk.nameVi}
                          </strong>
                          {INTERVIEW_QUESTIONS[risk.id] || 'Hãy kể một trải nghiệm thực tế bạn từng gặp liên quan đến vấn đề này.'}
                        </li>
                      ));
                    })()}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium animate-pulse">Hệ thống AI đang phân tích dữ liệu ứng viên...</p>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
