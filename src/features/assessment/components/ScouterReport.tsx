"use client";

import React, { useMemo } from "react";
import type { AssessmentResult, DimensionScore } from "../data/scoring";
import { detectPersona, calcCombatPower, calcDutySuitability, analyzeNegativeTendencies } from "../data/aiAnalysis";
import { DIMENSIONS } from "../data/dimensions";

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
              const y = (i / (dimensions.length - 1)) * 100;
              return `${x},${y}`;
            }).join(' ')} 
          />
          {dimensions.map((d, i) => {
            const pct = Math.max(20, Math.min(80, d.percentile));
            const x = ((pct - 20) / 60) * 100;
            const y = (i / (dimensions.length - 1)) * 100;
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
  const getDims = (group: string) => resultData.dimensions.filter(d => {
    const dimInfo = DIMENSIONS.find(x => x.id === d.dimensionId);
    return dimInfo?.group === group;
  });

  const getExactDims = (ids: string[]) => ids.map(id => resultData.dimensions.find(d => d.dimensionId === id)).filter(Boolean) as DimensionScore[];

  const personalityDims = getExactDims(['extraversion', 'agreeableness', 'conscientiousness', 'openness', 'emotional_stability', 'execution_speed']);
  const motivationDims = getExactDims(['achievement_drive', 'challenge_spirit', 'autonomy', 'learning_curiosity', 'recognition_need']);
  const thinkingDims = getExactDims(['logical_thinking', 'empathy', 'caution']);
  const stressDims = getExactDims(['stress_mental', 'stress_physical']);
  const valueDims = getExactDims(['growth_orientation', 'stability_orientation', 'social_contribution']);

  const negatives = useMemo(() => analyzeNegativeTendencies(resultData), [resultData]);
  const combatPower = useMemo(() => calcCombatPower(resultData.dimensions), [resultData.dimensions]);
  const duties = useMemo(() => calcDutySuitability(resultData.dimensions), [resultData.dimensions]);

  return (
    <div className="bg-white text-slate-900 mx-auto max-w-5xl w-full shadow-2xl overflow-hidden font-sans border border-slate-200">
      {/* SCOUTER HEADER */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-8 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full -ml-20 -mb-20 blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-4">
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tighter flex items-center">
              SCOUTER <span className="text-indigo-400 ml-2">SS</span>
            </h1>
            <p className="text-indigo-200 font-medium tracking-widest text-xs uppercase">Powered by Techzen AI Assessment System</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-sm shadow-xl self-start md:self-center">
            <span className="text-lg font-bold block leading-none">BÁO CÁO NĂNG LỰC NHÂN SỰ</span>
            <span className="text-[10px] text-indigo-300 font-bold tracking-tighter uppercase whitespace-nowrap mt-1 block">HR Management Perspective Assessment</span>
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

      {/* 2-COLUMN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 px-8 py-10">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          
          {/* Section 1 */}
          <div>
            <BlockHeader num="1" title="Xu Hướng Tính Cách" desc="Mô phỏng phản ứng vô thức và hành vi tự nhiên" />
            <ZigZagMatrix dimensions={personalityDims} />
          </div>

          {/* Section 2 */}
          <div>
            <BlockHeader num="2" title="Động Lực Thúc Đẩy" desc="Cường độ của khao khát phát triển và năng lượng" />
            <HorizontalBarMatrix dimensions={motivationDims} color="bg-slate-800" />
          </div>

          {/* Section 3 */}
          <div>
            <BlockHeader num="3" title="Khuynh Hướng Tư Duy" desc="Năng lực nhận thức, giải quyết vấn đề và đồng cảm" />
            <HorizontalBarMatrix dimensions={thinkingDims} color="bg-slate-800" />
          </div>

          {/* Section 4 */}
          <div>
            <BlockHeader num="4" title="Sức Chịu Đựng Stress" desc="Giới hạn chịu đựng về mặt tâm lý và thể chất" />
            <HorizontalBarMatrix dimensions={stressDims} color="bg-slate-800" />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Section 5 */}
          <div>
            <BlockHeader num="5" title="Giá Trị Quan" desc="Khuynh hướng coi trọng đóng góp xã hội hay cá nhân" />
            <ZigZagMatrix dimensions={valueDims} />
          </div>

          {/* Section 6 - Negatives */}
          <div>
            <BlockHeader num="6" title="Xu Hướng Rủi Ro" desc="Các yếu tố rủi ro nội tại (Điểm CÀNG CAO CÀNG NGUY HIỂM)" />
            <div className="mt-2 border border-slate-200 bg-white shadow-sm rounded-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-1 text-[10px] font-bold text-center bg-slate-100 py-1.5 border-b border-slate-200">
                <div className="col-span-3 text-slate-500 uppercase tracking-tighter self-center">Thước đo</div>
                <div className="col-span-1 text-slate-500 uppercase tracking-tighter self-center">Điểm</div>
                <div className="col-span-8 flex justify-between px-2 gap-0.5">
                  <span className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-100 py-0.5 rounded-sm">Safe (0-30)</span>
                  <span className="flex-1 bg-amber-50 text-amber-700 border border-amber-100 py-0.5 rounded-sm">Watch (40-60)</span>
                  <span className="flex-1 bg-rose-50 text-rose-700 border border-rose-100 py-0.5 rounded-sm">Hazard (70+)</span>
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

          {/* Section 7 - Duty Suitability */}
          <div>
            <BlockHeader num="7" title="Độ Phù Hợp Nghề Nghiệp" desc="Xác suất tương thích với các vị trí công việc" />
            <div className="mt-2 border border-slate-200 bg-white shadow-sm rounded-sm p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {duties.slice(0, 6).map((duty, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-bold text-slate-700">{duty.duty}</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-sm ${duty.score > 70 ? 'bg-emerald-100 text-emerald-700' : duty.score > 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {duty.score}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full relative overflow-hidden border border-slate-200">
                    <div className={`h-full transition-all duration-1000 ${duty.score > 70 ? 'bg-emerald-500' : duty.score > 40 ? 'bg-amber-400' : 'bg-rose-500'}`} style={{ width: `${duty.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 8 & 9 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Section 8 */}
            <div className="flex flex-col">
              <BlockHeader num="8" title="Chỉ Số Chiến Lực" desc="Sức mạnh tổng hợp & Tiềm năng" />
              <div className="flex-1 border border-indigo-200 mt-2 p-6 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white relative overflow-hidden rounded-sm shadow-inner min-h-[120px]">
                <div className="absolute opacity-5 text-[100px] font-black top-[-20px] right-[-10px] text-indigo-900 pointer-events-none">{combatPower.rank}</div>
                <div className="text-5xl font-black tracking-tighter text-indigo-800 drop-shadow-sm">{combatPower.total.toLocaleString()}</div>
                <div className="mt-3 px-4 py-1 bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md z-10 transition-transform hover:scale-105">
                  HANG {combatPower.rank} — {combatPower.label}
                </div>
              </div>
            </div>

            {/* Section 9 */}
            <div className="flex flex-col">
              <BlockHeader num="9" title="Validation" desc="Mức độ tin cậy của dữ liệu" />
              <div className="flex-1 border border-slate-200 mt-2 p-4 bg-white rounded-sm shadow-sm flex flex-col min-h-[120px]">
                <div className="flex justify-between items-center text-xs font-bold border-b border-slate-100 pb-2 mb-3">
                  <span className="text-slate-500 text-[10px] uppercase">Lie Scale Deviation</span>
                  <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black text-white shadow-sm ${resultData.reliability.lieScore > 60 ? 'bg-rose-500' : 'bg-indigo-600'}`}>
                    {resultData.reliability.lieScore}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full relative mb-3 overflow-hidden border border-slate-200">
                  <div className={`h-full transition-all duration-700 ${resultData.reliability.lieScore > 60 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-indigo-600'}`} style={{ width: `${resultData.reliability.lieScore}%` }}></div>
                </div>
                <div className="text-[11px] text-slate-600 font-medium leading-relaxed italic">
                  <span className="font-bold text-slate-800 uppercase not-italic">Level {resultData.reliability.level}:</span> {resultData.reliability.details}
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
            Nhận xét tổng quan AI <span className="text-[10px] font-normal text-slate-400 block sm:inline sm:ml-2">(人物像および人材活用に関するコメント)</span>
          </h3>
        </div>
        
        {aiReport ? (
          <div className="space-y-6">
            <div className="relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-200"></div>
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold text-[10px] uppercase rounded-sm mr-2 mb-1">Tổng thể</span>
                {aiReport.executiveSummary}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white/60 p-4 border border-emerald-100 rounded-sm">
                <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase rounded-sm mb-2">Điểm mạnh & Cống hiến</span>
                <p className="text-sm text-slate-600 leading-relaxed">{aiReport.strengthsNarrative}</p>
              </div>
              
              <div className="bg-white/60 p-4 border border-amber-100 rounded-sm">
                <span className="inline-block px-3 py-0.5 bg-amber-100 text-amber-700 font-bold text-[10px] uppercase rounded-sm mb-2">Rủi ro / Lưu ý quản lý</span>
                <p className="text-sm text-slate-600 leading-relaxed">{aiReport.developmentNarrative}</p>
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
  );
}
