"use client";

import React, { useMemo } from "react";
import type { AssessmentResult, DimensionScore } from "../data/scoring";
import { detectPersona, calcCombatPower, calcDutySuitability, analyzeNegativeTendencies } from "../data/aiAnalysis";
import { DIMENSIONS } from "../data/dimensions";

// Helper components for the dense tables

const BlockHeader = ({ num, title, desc }: { num: string; title: string; desc: string }) => (
  <div className="flex items-center mb-1">
    <div className="bg-blue-800 text-white font-bold text-lg w-8 h-8 flex items-center justify-center mr-2 relative z-10 shrink-0">
      {num}
    </div>
    <div className="flex-1 bg-gradient-to-r from-blue-100 to-transparent py-1 pl-2">
      <span className="font-bold text-blue-900 text-sm">{title}</span>
      <span className="text-xs text-slate-600 ml-4 hidden sm:inline">{desc}</span>
    </div>
  </div>
);

const ChartHeaderRow = ({ hasHighLow = true }: { hasHighLow?: boolean }) => (
  <div className="grid grid-cols-12 gap-1 text-[10px] font-bold text-center bg-slate-200 py-1 mb-1 shadow-sm">
    <div className="col-span-2">Thước đo</div>
    <div className="col-span-1">Điểm</div>
    {hasHighLow && <div className="col-span-3 text-left pl-2">Khuynh hướng điểm thấp</div>}
    <div className={`flex flex-col ${hasHighLow ? 'col-span-3' : 'col-span-6'}`}>
      <div className="flex justify-between w-full px-2 text-[8px] text-slate-500">
        <span>20%</span><span>40%</span><span className="text-blue-800 font-bold">50%</span><span>60%</span><span>80%</span>
      </div>
      <div className="flex justify-between w-full h-[2px] bg-slate-300 mt-[2px] relative">
        <div className="absolute left-[50%] top-[-4px] bottom-[-10px] w-[1px] bg-blue-400 z-0"></div>
      </div>
    </div>
    {hasHighLow && <div className="col-span-3 text-left pl-2">Khuynh hướng điểm cao</div>}
  </div>
);

// Renders the ZigZag line chart (for personality)
const ZigZagMatrix = ({ dimensions }: { dimensions: DimensionScore[] }) => {
  return (
    <div className="mt-2 text-xs border border-slate-300 relative bg-white">
      <ChartHeaderRow />
      {/* SVG overlay for drawing lines */}
      <svg className="absolute w-[25%] h-full pointer-events-none z-10" style={{ left: '50%' }}>
        <polyline 
          fill="none" 
          stroke="#2563eb" 
          strokeWidth="2" 
          points={dimensions.map((d, i) => {
            const pct = Math.max(20, Math.min(80, d.percentile));
            const x = ((pct - 20) / 60) * 100; // Map 20-80 to 0-100% of the SVG width
            const y = (i * 28) + 14 + 20; // 28px height per row, offset 20px for header
            return `${x}%, ${y}`;
          }).join(' ')} 
        />
        {dimensions.map((d, i) => {
          const pct = Math.max(20, Math.min(80, d.percentile));
          const x = ((pct - 20) / 60) * 100;
          const y = (i * 28) + 14 + 20;
          return (
            <circle key={i} cx={`${x}%`} cy={y} r="3" fill="#2563eb" />
          );
        })}
      </svg>

      {dimensions.map((d, i) => {
        const info = DIMENSIONS.find(x => x.id === d.dimensionId);
        return (
          <div key={d.dimensionId} className={`grid grid-cols-12 gap-1 items-center h-[28px] border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
            <div className="col-span-2 font-bold px-1 overflow-hidden whitespace-nowrap text-ellipsis">{info?.nameVi}</div>
            <div className="col-span-1 text-center font-bold text-blue-800">{d.percentile}</div>
            <div className="col-span-3 text-[9px] px-1 text-slate-600 leading-tight border-r border-slate-200 flex items-center pr-2">
              <span className="line-clamp-2">{info?.descLow}</span>
            </div>
            <div className="col-span-3 border-r border-slate-200 relative bg-slate-50/50">
              <div className="absolute left-[50%] h-full w-[1px] bg-slate-300"></div>
            </div>
            <div className="col-span-3 text-[9px] px-1 text-slate-600 leading-tight flex items-center pl-2">
              <span className="line-clamp-2">{info?.descHigh}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Horizontal Bar Matrix 
const HorizontalBarMatrix = ({ dimensions, color = "bg-slate-700" }: { dimensions: DimensionScore[], color?: string }) => {
  return (
    <div className="mt-2 text-xs border border-slate-300 bg-white">
      <ChartHeaderRow hasHighLow={false} />
      {dimensions.map((d, i) => {
        const info = DIMENSIONS.find(x => x.id === d.dimensionId);
        const w = Math.max(0, Math.min(100, ((d.percentile - 20) / 60) * 100));
        return (
          <div key={d.dimensionId} className={`grid grid-cols-12 gap-1 items-center h-[24px] border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
            <div className="col-span-2 font-bold px-1 overflow-hidden whitespace-nowrap">{info?.nameVi}</div>
            <div className="col-span-1 text-center font-bold text-blue-800">{d.percentile}</div>
            <div className="col-span-3 text-[9px] px-1 text-slate-600 border-r border-slate-200 truncate pr-2">
              {info?.descHigh.split(',')[0]}
            </div>
            <div className="col-span-6 border-r border-slate-200 relative flex items-center px-1">
              <div className="absolute left-[50%] h-full w-[1px] bg-slate-300 z-0"></div>
              <div className={`h-[10px] ${color} z-10 transition-all`} style={{ width: `${w}%` }}></div>
            </div>
          </div>
        );
      })}
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
    <div className="bg-white text-slate-900 mx-auto w-[1000px] shadow-2xl overflow-hidden font-sans">
      {/* SCOUTER HEADER */}
      <div className="flex border-b-[6px] border-blue-900 pb-2 mb-4 px-8 mt-8 justify-between items-end">
        <div className="flex items-baseline space-x-6">
          <h1 className="text-4xl font-black text-blue-800 tracking-tighter">Scouter SS</h1>
          <div className="text-xl font-bold bg-blue-100 px-4 py-1 rounded-sm border border-blue-200 text-blue-900">
            Báo Cáo Đánh Giá Năng Lực [Dành Cho HR]
          </div>
        </div>
      </div>

      <div className="px-8 pb-4 flex text-xs font-bold items-center space-x-2 border-b border-slate-300 mb-4 mx-8">
        <div className="bg-black text-white px-3 py-1">THÔNG TIN ỨNG VIÊN</div>
        <div className="border border-slate-400 px-2 flex">
          <span className="bg-slate-200 px-2 py-1 border-r border-slate-400 mr-2">Mã NV / ID</span>
          <span className="py-1 min-w-[80px]">{user?.employeeId || "N/A"}</span>
        </div>
        <div className="border border-slate-400 px-2 flex">
          <span className="bg-slate-200 px-2 py-1 border-r border-slate-400 mr-2">Họ & Tên</span>
          <span className="py-1 min-w-[150px]">{user?.fullName || "Ẩn Danh"}</span>
        </div>
        <div className="border border-slate-400 px-2 flex">
          <span className="bg-slate-200 px-2 py-1 border-r border-slate-400 mr-2">Thời gian Test</span>
          <span className="py-1 min-w-[100px]">{new Date(date).toLocaleDateString("vi-VN")}</span>
        </div>
      </div>

      {/* 2-COLUMN GRID */}
      <div className="grid grid-cols-2 gap-x-8 px-8 pb-8">
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
            <BlockHeader num="5" title="Giá Trị Quan" desc="Khuynh hướng coi trọng đóng góp xã hội hay ổn định cá nhân" />
            <ZigZagMatrix dimensions={valueDims} />
          </div>

          {/* Section 6 - Negatives */}
          <div>
            <BlockHeader num="6" title="Xu Hướng Rủi Ro" desc="Các yếu tố tiêu cực có thể gây cản trở công việc (Điểm CÀNG CAO CÀNG NGUY HIỂM)" />
            <div className="mt-2 border border-slate-300 bg-white text-xs">
              <div className="grid grid-cols-12 gap-1 text-[10px] font-bold text-center bg-slate-200 py-1 mb-1 border-b border-slate-300">
                <div className="col-span-3">Thước đo</div>
                <div className="col-span-1">Điểm</div>
                <div className="col-span-8 flex justify-between px-2 text-[8px]">
                  <span className="w-1/3 bg-green-200 text-green-800 border-r border-green-300 py-0.5">Safe (0-30)</span>
                  <span className="w-1/3 bg-yellow-200 text-yellow-800 border-r border-yellow-300 py-0.5">Watch (40-60)</span>
                  <span className="w-1/3 bg-red-200 text-red-800 py-0.5">Hazard (70-100)</span>
                </div>
              </div>
              {negatives.map((neg, i) => (
                <div key={neg.id} className={`grid grid-cols-12 gap-1 h-[24px] items-center text-[10px] ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                  <div className="col-span-3 font-bold px-1 whitespace-nowrap overflow-hidden text-ellipsis">{neg.nameVi}</div>
                  <div className={`col-span-1 text-center font-bold px-1 ${neg.level === 'risk' ? 'text-red-600 bg-red-100' : neg.level === 'caution' ? 'text-yellow-600' : 'text-slate-600'}`}>
                    {neg.score}
                  </div>
                  <div className="col-span-8 px-1 relative h-full flex items-center">
                    {/* Background zoning markers */}
                    <div className="absolute inset-0 flex">
                      <div className="w-1/3 border-r border-slate-100"></div>
                      <div className="w-1/3 border-r border-slate-100"></div>
                      <div className="w-1/3"></div>
                    </div>
                    {/* Progress Bar */}
                    <div 
                      className={`h-[10px] z-10 transition-all ${neg.level === 'risk' ? 'bg-red-500' : neg.level === 'caution' ? 'bg-yellow-400' : 'bg-slate-500'}`} 
                      style={{ width: `${Math.min(100, Math.max(5, neg.score))}%` }}>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 7 - Duty Suitability */}
          <div>
            <BlockHeader num="7" title="Độ Phù Hợp Nghề Nghiệp" desc="Xác suất tương thích với các nhóm công việc đặc thù" />
            <div className="mt-2 border border-slate-300 bg-white grid grid-cols-2 gap-x-2 p-1">
              {duties.slice(0, 6).map((duty, idx) => (
                <div key={idx} className="flex flex-col mb-1 text-[10px]">
                  <div className="flex justify-between font-bold px-1">
                    <span className="truncate w-[80%] text-blue-900">{duty.duty}</span>
                    <span>{duty.score}</span>
                  </div>
                  <div className="w-full h-[8px] bg-slate-200 mt-0.5 flex relative">
                    {/* Markers */}
                    <div className="absolute w-[1px] h-full bg-slate-400 left-[30%]"></div>
                    <div className="absolute w-[1px] h-full bg-slate-400 left-[70%]"></div>
                    {/* Fill */}
                    <div className={`h-full ${duty.score > 70 ? 'bg-green-600' : duty.score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${duty.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 8 & 9 */}
          <div className="grid grid-cols-2 gap-4">
            {/* Section 8 */}
            <div>
              <BlockHeader num="8" title="Chỉ Số Chiến Lực" desc="Sức mạnh tổng hợp doanh nghiệp" />
              <div className="border border-slate-300 mt-2 p-4 flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden h-[100px]">
                <div className="absolute opacity-10 text-[60px] font-black top-[-10px] right-2">{combatPower.rank}</div>
                <div className="text-4xl font-black tracking-tighter text-blue-800">{combatPower.total.toLocaleString()}</div>
                <div className="text-xs font-bold text-slate-500 mt-1 uppercase border-t border-slate-300 pt-1 w-full text-center">
                  Hạng {combatPower.rank} - {combatPower.label}
                </div>
              </div>
            </div>

            {/* Section 9 */}
            <div>
              <BlockHeader num="9" title="Validation" desc="Kiểm tra mức độ thành thật" />
              <div className="border border-slate-300 mt-2 p-2 bg-white flex flex-col h-[100px]">
                <div className="flex justify-between items-center text-xs font-bold border-b border-slate-100 pb-1 mb-2">
                  <span>Lie Scale Deviation</span>
                  <span className={`px-2 py-0.5 rounded-sm text-white ${resultData.reliability.lieScore > 60 ? 'bg-red-500' : 'bg-green-500'}`}>
                    {resultData.reliability.lieScore}%
                  </span>
                </div>
                <div className="w-full h-4 bg-slate-200 relative mb-1">
                  <div className={`h-full ${resultData.reliability.lieScore > 60 ? 'bg-red-500' : 'bg-slate-700'}`} style={{ width: `${resultData.reliability.lieScore}%` }}></div>
                </div>
                <div className="text-[9px] text-slate-500 leading-tight">
                  <span className="font-bold text-slate-700">Level: {resultData.reliability.level.toUpperCase()}.</span> {resultData.reliability.details}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER COMMENT SECTION */}
      <div className="mx-8 mb-8 border border-blue-200 bg-blue-50/50 p-4">
        <h3 className="bg-blue-800 text-white inline-block px-3 py-1 font-bold text-sm mb-3 shadow-md">
          Nhận xét tổng quan AI (人物像および人材活用に関するコメント)
        </h3>
        {aiReport ? (
          <div className="text-sm text-slate-800 leading-relaxed space-y-4 indent-4">
            <p><strong className="text-blue-900 border-b border-blue-200 mr-2">Tổng thể:</strong> {aiReport.executiveSummary}</p>
            <p><strong className="text-green-800 border-b border-green-200 mr-2">Điểm mạnh & Cống hiến:</strong> {aiReport.strengthsNarrative}</p>
            <p><strong className="text-amber-800 border-b border-amber-200 mr-2">Rủi ro / Lưu ý quản lý:</strong> {aiReport.developmentNarrative}</p>
          </div>
        ) : (
          <div className="text-sm text-slate-400 italic">Đang tải phân tích AI...</div>
        )}
      </div>

    </div>
  );
}
