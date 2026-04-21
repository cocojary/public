"use client";

import { useState } from "react";
import Link from "next/link";
import type { UnifiedScoringResult } from "@/features/assessment/utils/unifiedEngine";
import type { DbDimension } from "@/server/services/assessmentDataService";

interface Props {
  user: { fullName: string; department?: string | null };
  resultData: UnifiedScoringResult;
  activeDimensions: DbDimension[];
  date: string;
  recordId: string;
}

/** Chuyển đổi scaled 1-10 → thang 1-5 để hiển thị thân thiện */
function scaledToScore(scaled: number): number {
  return Math.round((scaled / 10) * 5 * 10) / 10;
}

function getBarColor(score: number) {
  if (score >= 4) return "#6366f1";   // indigo
  if (score >= 3) return "#059669";   // emerald
  if (score >= 2) return "#f59e0b";   // amber
  return "#ef4444";                   // red
}

function scoreBand(score: number) {
  if (score >= 4.5) return { label: "Xuất sắc", color: "text-indigo-600 bg-indigo-50 border-indigo-200" };
  if (score >= 3.8) return { label: "Tốt", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  if (score >= 3.0) return { label: "Trung bình", color: "text-amber-600 bg-amber-50 border-amber-200" };
  return { label: "Cần cải thiện", color: "text-red-600 bg-red-50 border-red-200" };
}

export function PublicResultView({ user, resultData, activeDimensions, date, recordId }: Props) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Build a lookup map: dimensionId → dimension metadata
  const dimMeta: Record<string, DbDimension> = {};
  for (const d of activeDimensions) {
    dimMeta[d.id] = d;
  }

  // Engine returns dimensions as UnifiedDimensionScore[] with dimensionId + scaled (1-10)
  const rawDimensions = resultData?.dimensions ?? [];

  // Map to display-friendly format — convert scaled (1-10) → user-facing score (1-5)
  const displayDimensions = rawDimensions
    .filter(d => d.count > 0) // Chỉ hiển thị dimension có câu hỏi được trả lời
    .map(d => ({
      id: d.dimensionId,
      nameVi: (dimMeta[d.dimensionId] as any)?.nameVi ?? dimMeta[d.dimensionId]?.name ?? d.dimensionId,
      score: scaledToScore(d.scaled),          // 1-5 scale
      scaled: d.scaled,                         // 1-10 (for internal use)
      percentile: d.percentile,
    }));

  const avgScore = displayDimensions.length > 0
    ? displayDimensions.reduce((sum, d) => sum + d.score, 0) / displayDimensions.length
    : 0;
  const avg = Math.round(avgScore * 10) / 10;
  const band = scoreBand(avg);

  // Tìm điểm mạnh và điểm yếu
  const sorted = [...displayDimensions].sort((a, b) => b.score - a.score);
  const topStrengths = sorted.slice(0, 2);
  const topWeaknesses = sorted.slice(-2).reverse();

  return (
    <div className="w-full min-h-screen bg-slate-100 pb-20">
      {/* Top nav */}
      <div className="bg-indigo-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-black">T</div>
          <span className="font-bold text-sm">Techzen Assessment <span className="text-indigo-300 font-normal">· Lite</span></span>
        </div>
        <Link href="/" className="text-indigo-300 hover:text-white text-sm transition-colors">← Trang chủ</Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-6">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white p-8">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <div className="text-indigo-300 text-xs font-medium mb-1 uppercase tracking-widest">Kết quả đánh giá · Lite Version</div>
                <h1 className="text-3xl font-extrabold mb-1">{user.fullName}</h1>
                {user.department && (
                  <span className="text-indigo-200 text-sm">{user.department}</span>
                )}
                <p className="text-indigo-300 text-xs mt-2">{new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}</p>
              </div>

              <div className="text-center bg-white/10 backdrop-blur px-6 py-4 rounded-xl border border-white/20">
                <div className="text-xs text-indigo-300 mb-1">Điểm trung bình</div>
                <div className="text-5xl font-black text-white mb-1">{avg.toFixed(1)}</div>
                <div className="text-xs text-indigo-300">/ 5.0</div>
                <span className={`mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${band.color}`}>
                  {band.label}
                </span>
              </div>
            </div>
          </div>

          {/* Alert: Free version notice */}
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center gap-3">
            <span className="text-amber-500">💡</span>
            <div className="text-sm text-amber-700">
              <strong>Đây là báo cáo Lite (miễn phí)</strong> — Nâng cấp Premium để xem phân tích AI chuyên sâu và Năng lực Thực chiến™
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="ml-auto flex-shrink-0 text-xs font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Xem ưu đãi
            </button>
          </div>
        </div>

        {/* Dimensions grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5">📊 Điểm số theo từng chiều năng lực</h2>
          {displayDimensions.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Chưa có dữ liệu chiều năng lực.</p>
          ) : (
            <div className="space-y-4">
              {displayDimensions.map((dim) => {
                const pct = Math.round((dim.score / 5) * 100);
                return (
                  <div key={dim.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold text-slate-700">{dim.nameVi}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black" style={{ color: getBarColor(dim.score) }}>
                          {dim.score.toFixed(1)}
                        </span>
                        <span className="text-slate-300 text-xs">/ 5</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: getBarColor(dim.score) }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Strengths & Weaknesses */}
        {displayDimensions.length >= 2 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <h3 className="font-bold text-emerald-800 text-sm mb-3 flex items-center gap-2">
                <span>💪</span> Điểm nổi bật
              </h3>
              <ul className="space-y-2">
                {topStrengths.map(d => (
                  <li key={d.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-emerald-900 font-medium">{d.nameVi}</span>
                    <span className="ml-auto text-sm font-black text-emerald-700">{d.score.toFixed(1)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
              <h3 className="font-bold text-rose-800 text-sm mb-3 flex items-center gap-2">
                <span>🎯</span> Cần cải thiện
              </h3>
              <ul className="space-y-2">
                {topWeaknesses.map(d => (
                  <li key={d.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
                    <span className="text-sm text-rose-900 font-medium">{d.nameVi}</span>
                    <span className="ml-auto text-sm font-black text-rose-700">{d.score.toFixed(1)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Locked sections — Premium teaser */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <span>🔒</span> Phân tích chuyên sâu
              <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full ml-auto">PREMIUM</span>
            </h2>
          </div>
          <div className="p-6 relative">
            <div className="blur-sm pointer-events-none space-y-3">
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-4/5" />
              <div className="h-4 bg-slate-100 rounded w-3/5" />
              <div className="h-20 bg-slate-100 rounded mt-4" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/95 backdrop-blur rounded-xl p-6 shadow-lg text-center max-w-xs mx-4">
                <div className="text-3xl mb-3">🤖</div>
                <p className="text-slate-700 font-semibold mb-1 text-sm">Phân tích bằng AI chuyên dụng</p>
                <p className="text-slate-400 text-xs mb-4">Báo cáo chuyên sâu về điểm yếu và lộ trình phát triển cá nhân</p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
                >
                  Nâng cấp Premium
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Muốn phân tích sâu hơn?</h3>
          <p className="text-indigo-200 mb-6">
            Bản Premium bao gồm: Phân tích chuyên sâu bằng AI chuyên dụng, Năng lực Thực chiến™, phát hiện điểm yếu ẩn và báo cáo PDF.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold px-8 py-3 rounded-xl transition-all"
            >
              💎 Xem gói Premium — ~99K
            </button>
            <Link
              href="/"
              className="border border-white/30 hover:border-white/60 text-white font-medium px-6 py-3 rounded-xl transition-all"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="float-right text-slate-400 hover:text-slate-600 text-xl leading-none"
            >
              ✕
            </button>
            <div className="text-center">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">Gói Premium</h3>
              <div className="text-4xl font-black text-indigo-600 mb-1">~99.000₫</div>
              <p className="text-slate-400 text-sm mb-6">Thanh toán 1 lần · Không gia hạn</p>
              <ul className="text-left space-y-2 mb-8">
                {[
                  "Phân tích chuyên sâu bằng AI chuyên dụng",
                  "Năng lực Thực chiến™ score",
                  "Phát hiện điểm yếu tiềm ẩn",
                  "80+ câu hỏi toàn diện",
                  "Culture Fit với tổ chức",
                  "Xuất báo cáo PDF",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-slate-700 text-sm">
                    <span className="text-emerald-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm mb-4">
                🚧 Tính năng thanh toán đang được phát triển. Vui lòng liên hệ HR để được hỗ trợ.
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full bg-slate-100 text-slate-600 font-medium py-2.5 rounded-xl"
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
