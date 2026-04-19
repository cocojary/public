import { getValidationReport, type ValidationReport } from "@/server/actions/validationAction";
import Link from "next/link";

function alphaBadge(alpha: number | null) {
  if (alpha === null) return <span className="text-xs text-slate-400 italic">N/A</span>;
  if (alpha >= 0.7) return <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{alpha} ✓ Tốt</span>;
  if (alpha >= 0.5) return <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{alpha} ~ Chấp nhận</span>;
  return <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">{alpha} ✗ Kém</span>;
}

function reliabilityColor(level: string) {
  if (level === "high") return "bg-emerald-100 text-emerald-800";
  if (level === "medium") return "bg-amber-100 text-amber-800";
  if (level === "low") return "bg-orange-100 text-orange-800";
  if (level === "invalid") return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-600";
}

function reliabilityLabel(level: string) {
  if (level === "high") return "Cao";
  if (level === "medium") return "Trung bình";
  if (level === "low") return "Thấp";
  if (level === "invalid") return "Không hợp lệ";
  return level;
}

const RELIABILITY_ORDER = ["high", "medium", "low", "invalid"];

export default async function ValidationPage() {
  let report: ValidationReport | null = null;
  let error: string | null = null;

  try {
    report = await getValidationReport();
  } catch (e: any) {
    error = e.message ?? "Lỗi không xác định";
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sm text-indigo-600 hover:underline">← Về Admin Dashboard</Link>
            <h1 className="text-2xl font-bold text-slate-800 mt-1">Báo cáo Xác thực Tâm lý trắc lượng</h1>
            <p className="text-sm text-slate-500">Cronbach's Alpha · Phân phối độ tin cậy · Thống kê chiều đo</p>
          </div>
          {report && (
            <div className="text-right text-xs text-slate-400">
              <div>{report.totalRecords} records phân tích</div>
              <div>Cập nhật: {new Date(report.generatedAt).toLocaleString("vi-VN")}</div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            Lỗi tải dữ liệu: {error}
          </div>
        )}

        {report && report.totalRecords === 0 && (
          <div className="bg-white rounded-2xl shadow p-12 text-center text-slate-400">
            Chưa có dữ liệu đánh giá trong hệ thống.
          </div>
        )}

        {report && report.totalRecords > 0 && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow p-4">
                <div className="text-xs text-slate-500 mb-1">Tổng records</div>
                <div className="text-3xl font-bold text-slate-800">{report.totalRecords}</div>
              </div>
              <div className="bg-white rounded-2xl shadow p-4">
                <div className="text-xs text-slate-500 mb-1">Thời gian TB</div>
                <div className="text-3xl font-bold text-slate-800">
                  {Math.round(report.avgDurationSeconds / 60)}
                  <span className="text-base font-normal text-slate-400 ml-1">phút</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow p-4">
                <div className="text-xs text-slate-500 mb-1">Tỷ lệ trả lời nhanh</div>
                <div className={`text-3xl font-bold ${report.speedAnomalyRate > 20 ? "text-red-600" : "text-slate-800"}`}>
                  {report.speedAnomalyRate}%
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow p-4">
                <div className="text-xs text-slate-500 mb-1">Độ tin cậy cao</div>
                <div className="text-3xl font-bold text-emerald-600">
                  {report.reliabilityDistribution["high"] ?? 0}
                </div>
              </div>
            </div>

            {/* Reliability distribution */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-semibold text-slate-700 mb-4">Phân phối Độ tin cậy</h2>
              <div className="space-y-3">
                {RELIABILITY_ORDER.map(level => {
                  const count = report!.reliabilityDistribution[level] ?? 0;
                  const pct = report!.totalRecords > 0 ? Math.round(count / report!.totalRecords * 100) : 0;
                  return (
                    <div key={level} className="flex items-center gap-3">
                      <div className={`text-xs font-medium px-2 py-0.5 rounded w-28 text-center ${reliabilityColor(level)}`}>
                        {reliabilityLabel(level)}
                      </div>
                      <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            level === "high" ? "bg-emerald-400" :
                            level === "medium" ? "bg-amber-400" :
                            level === "low" ? "bg-orange-400" : "bg-red-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-sm text-slate-600 w-20 text-right">{count} ({pct}%)</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lie Score distribution */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-semibold text-slate-700 mb-1">Phân phối Lie Score</h2>
              <p className="text-xs text-slate-400 mb-4">Điểm cao = xu hướng trả lời theo mong đợi xã hội (social desirability bias)</p>
              <div className="flex items-end gap-3 h-32">
                {report.lieScoreDistribution.map(({ range, count }) => {
                  const maxCount = Math.max(...report!.lieScoreDistribution.map(d => d.count), 1);
                  const heightPct = maxCount > 0 ? Math.round(count / maxCount * 100) : 0;
                  return (
                    <div key={range} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-xs text-slate-500">{count}</div>
                      <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                        <div
                          className={`w-full rounded-t ${
                            range.startsWith("81") || range.startsWith("61") ? "bg-red-400" :
                            range.startsWith("41") ? "bg-amber-400" : "bg-emerald-400"
                          }`}
                          style={{ height: `${Math.max(heightPct, 4)}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-400">{range}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dimension stats table */}
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-semibold text-slate-700">Thống kê từng Chiều đo</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Cronbach's alpha ≥ 0.7 = tốt · 0.5–0.7 = chấp nhận · &lt; 0.5 = cần xem xét lại câu hỏi
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Dimension ID</th>
                      <th className="px-4 py-3 text-right">N</th>
                      <th className="px-4 py-3 text-right">Mean</th>
                      <th className="px-4 py-3 text-right">SD</th>
                      <th className="px-4 py-3 text-right">Min</th>
                      <th className="px-4 py-3 text-right">Max</th>
                      <th className="px-4 py-3 text-center">Cronbach's α</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {report.dimensionStats.map(dim => (
                      <tr key={dim.dimensionId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-700">{dim.dimensionId}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{dim.count}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-medium ${
                            dim.mean >= 7 ? "text-emerald-600" :
                            dim.mean >= 4 ? "text-slate-700" : "text-red-500"
                          }`}>
                            {dim.mean}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500">{dim.stdDev}</td>
                        <td className="px-4 py-3 text-right text-slate-400">{dim.min}</td>
                        <td className="px-4 py-3 text-right text-slate-400">{dim.max}</td>
                        <td className="px-4 py-3 text-center">{alphaBadge(dim.cronbachAlpha)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alpha legend */}
            <div className="bg-white rounded-2xl shadow p-4 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Giải thích Cronbach's alpha: </span>
              Đo tính nhất quán nội bộ của một nhóm câu hỏi (dimension).
              Alpha tính từ dữ liệu thực tế (item-level responses) theo nhóm questionSet.
              Nếu hiện N/A — questionSet chưa có đủ ≥5 người làm hoặc &lt;2 câu hỏi trong dimension.
              Ngưỡng chuẩn APA: α ≥ 0.7 là đáng tin cậy.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
