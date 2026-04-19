"use client";

import React from "react";
import {
  UnifiedReportData,
  UnifiedGroup,
  SuitabilityRole,
  CombatPowerResult,
} from "@/features/assessment/utils/unifiedScoring";
import {
  ShieldCheck, ShieldAlert, AlertTriangle, Zap, Brain, Flame,
  Users, Leaf, ChevronRight, Star, TrendingUp
} from "lucide-react";

interface UnifiedReportProps {
  data: UnifiedReportData;
  candidateName?: string;
  reportDate?: Date;
}

// ── Màu sắc theo mức độ ─────────────────────────────────────

const levelColors = {
  high:   { bg: "bg-emerald-100", text: "text-emerald-700", bar: "#10B981", dot: "bg-emerald-500" },
  medium: { bg: "bg-sky-100",     text: "text-sky-700",     bar: "#3B82F6", dot: "bg-sky-500" },
  low:    { bg: "bg-red-100",     text: "text-red-700",     bar: "#EF4444", dot: "bg-red-500"  },
};

const levelLabels = { high: "Mạnh", medium: "Trung bình", low: "Cần cải thiện" };

// ── Icon nhóm ────────────────────────────────────────────────

const GroupIconMap: Record<string, React.ReactNode> = {
  integrity:   <ShieldCheck className="w-5 h-5" />,
  personality: <Brain className="w-5 h-5" />,
  cognitive:   <Zap className="w-5 h-5" />,
  motivation:  <Flame className="w-5 h-5" />,
  resilience:  <TrendingUp className="w-5 h-5" />,
  culture:     <Leaf className="w-5 h-5" />,
};

// ── Thanh điểm trực quan ─────────────────────────────────────

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${score * 10}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ── Một dòng chỉ số ─────────────────────────────────────────

function ScoreRow({ item, barColor }: { item: UnifiedReportData["groups"][0]["items"][0]; barColor: string }) {
  const c = levelColors[item.level];
  return (
    <div className="py-3 border-b border-slate-50 last:border-0 space-y-1.5">
      {/* Hàng trên: nhãn + điểm + badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-800">{item.label}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-lg font-black ${c.text}`}>{item.score}</span>
          <span className="text-slate-400 text-[10px] font-medium">/10</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
            {levelLabels[item.level]}
          </span>
        </div>
      </div>
      {/* Thanh điểm */}
      <ScoreBar score={item.score} color={barColor} />
      {/* Mô tả — không bị cắt */}
      <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
    </div>
  );
}

// ── Card nhóm năng lực ───────────────────────────────────────

function GroupCard({ group }: { group: UnifiedGroup }) {
  return (
    <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ backgroundColor: group.color + "15", borderBottom: `2px solid ${group.color}` }}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: group.color }}>{GroupIconMap[group.id]}</span>
          <div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight">{group.title}</h3>
            <p className="text-[11px] text-slate-500">{group.subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black" style={{ color: group.color }}>{group.groupScore}</div>
          <div className="text-[10px] text-slate-500 font-medium">Trung bình</div>
        </div>
      </div>
      <div className="px-5 py-2 bg-white divide-y divide-slate-50">
        {group.items.map((item) => (
          <ScoreRow key={item.id} item={item} barColor={group.color} />
        ))}
      </div>
    </div>
  );
}

// ── Bảng phân vai ─────────────────────────────────────────────

function SuitabilityCard({ roles }: { roles: SuitabilityRole[] }) {
  return (
    <div className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="bg-slate-900 px-5 py-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-400" />
          Bản đồ Phân vai & Phù hợp Vị trí
        </h3>
        <p className="text-slate-400 text-xs mt-1">Hệ thống tự động tính toán mức độ phù hợp cho từng vai trò công việc</p>
      </div>
      <div className="bg-white divide-y divide-slate-50">
        {roles.map((r, idx) => (
          <div key={r.role} className={`flex items-center gap-4 px-5 py-3 ${idx === 0 ? "bg-amber-50" : ""}`}>
            <div className="text-2xl">{r.badge}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{r.role}</span>
                {idx === 0 && (
                  <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                    ĐỀ XUẤT HÀNG ĐẦU
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {r.positions.map((p) => (
                  <span key={p} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div
                className={`text-xl font-black ${
                  r.matchLevel === "strong" ? "text-emerald-600" :
                  r.matchLevel === "moderate" ? "text-sky-600" : "text-slate-400"
                }`}
              >
                {r.matchScore}%
              </div>
              <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${
                    r.matchLevel === "strong" ? "bg-emerald-500" :
                    r.matchLevel === "moderate" ? "bg-sky-500" : "bg-slate-300"
                  }`}
                  style={{ width: `${r.matchScore}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Chỉ số Combat Power ──────────────────────────────────────

function CombatPowerCard({ cp }: { cp: CombatPowerResult }) {
  const color =
    cp.total >= 85 ? "#10B981" :
    cp.total >= 70 ? "#3B82F6" :
    cp.total >= 55 ? "#F59E0B" :
    cp.total >= 40 ? "#F97316" : "#EF4444";

  const pillars = [
    { label: "Tư duy", value: cp.cognitive, desc: "40% trọng số" },
    { label: "Động lực", value: cp.motivation, desc: "30% trọng số" },
    { label: "Ổn định", value: cp.stability, desc: "30% trọng số" },
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Chỉ số Sức mạnh Chiến đấu (Combat Power)
            </h3>
            <p className="text-slate-400 text-xs mt-1">Điểm tổng hợp phản ánh năng lực thực thi toàn diện</p>
          </div>
          <div
            className="flex items-end gap-1 text-right"
            style={{ color }}
          >
            <span className="text-5xl font-black leading-none">{cp.total}</span>
            <span className="text-slate-400 text-sm mb-1">/100</span>
          </div>
        </div>
        {cp.penaltyApplied && (
          <div className="mt-2 text-xs text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Đã áp dụng hệ số phạt 15% do chỉ số tin cậy cần kiểm chứng.
          </div>
        )}
      </div>

      <div className="bg-white px-5 py-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {pillars.map((p) => (
            <div key={p.label} className="text-center p-3 bg-slate-50 rounded-xl">
              <div className="text-2xl font-black text-slate-900">{p.value}</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">{p.label}</div>
              <div className="text-[10px] text-slate-400">{p.desc}</div>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-xl text-sm font-semibold text-center" style={{ backgroundColor: color + "15", color }}>
          {cp.label}
        </div>
      </div>
    </div>
  );
}

// ── Component tổng quan: Header ─────────────────────────────

function ReportHeader({
  data,
  candidateName,
  reportDate,
}: {
  data: UnifiedReportData;
  candidateName?: string;
  reportDate?: Date;
}) {
  const integrityConfig = {
    ok:      { icon: <ShieldCheck className="w-5 h-5" />, text: "Tin cậy cao", bg: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    warning: { icon: <AlertTriangle className="w-5 h-5" />, text: "Cần kiểm chứng thêm", bg: "bg-amber-50 border-amber-200 text-amber-700" },
    risk:    { icon: <ShieldAlert className="w-5 h-5" />, text: "Kết quả không tin cậy", bg: "bg-red-50 border-red-200 text-red-700" },
  }[data.integrityLevel];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-8 py-8 text-white">
      {/* Trang trí */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
        <div>
          <div className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">
            Techzen SPI SOTA Universal — Báo cáo Năng lực Hợp nhất
          </div>
          <h1 className="text-3xl font-black text-white leading-tight">
            {candidateName ?? "Ứng viên"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Nguồn: {data.sourceType === "SPI_DEV_V3" ? "SPI DEV V3.0 — Kỹ thuật chuyên sâu" : "SPI V2 — Tâm lý học toàn diện"}
            {" · "}{reportDate ? reportDate.toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Trạng thái tin cậy */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${integrityConfig.bg}`}>
            {integrityConfig.icon}
            <span>Độ tin cậy: {integrityConfig.text}</span>
          </div>
          {/* Top role */}
          <div className="text-right">
            <div className="text-xs text-slate-400">Vai trò đề xuất hàng đầu</div>
            <div className="text-xl font-black text-amber-400">
              {data.topRole.badge} {data.topRole.role}
              <span className="text-base font-bold text-slate-400 ml-2">({data.topRole.matchScore}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cảnh báo integrity nếu cần */}
      {data.integrityLevel !== "ok" && (
        <div className={`mt-4 p-3 rounded-lg text-xs border ${integrityConfig.bg}`}>
          {data.integrityNote}
        </div>
      )}
    </div>
  );
}

// ── Component chính xuất ra ──────────────────────────────────

export function UnifiedReport({ data, candidateName, reportDate }: UnifiedReportProps) {
  // Tách nhóm 1 (Integrity) ra hiển thị riêng ở trên
  const integrityGroup = data.groups.find((g) => g.id === "integrity");
  const mainGroups = data.groups.filter((g) => g.id !== "integrity");

  return (
    <div className="bg-white text-slate-900 w-full max-w-5xl mx-auto shadow-2xl overflow-hidden rounded-2xl relative">
      {/* Header */}
      <div className="relative">
        <ReportHeader data={data} candidateName={candidateName} reportDate={reportDate} />
      </div>

      <div className="p-6 space-y-6">
        {/* Nhóm 1: Chỉ số Tin cậy — luôn hiển thị đầu tiên */}
        {integrityGroup && <GroupCard group={integrityGroup} />}

        {/* Combat Power */}
        <CombatPowerCard cp={data.combatPower} />

        {/* Các nhóm năng lực chính (2 cột) */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ChevronRight className="w-5 h-5 text-indigo-500" />
            Phân tích Chi tiết Năng lực
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {mainGroups.map((g) => (
              <GroupCard key={g.id} group={g} />
            ))}
          </div>
        </div>

        {/* Bảng phân vai */}
        <SuitabilityCard roles={data.suitability} />

        {/* Footer */}
        <div className="pt-6 border-t border-slate-100 text-center text-slate-400 text-xs">
          Báo cáo được tạo tự động bởi Hệ thống đánh giá Techzen SPI SOTA Universal
          {" · "}{new Date().toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>
    </div>
  );
}
