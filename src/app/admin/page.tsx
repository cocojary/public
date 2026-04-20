import { getAllAssessments, getAdminStats } from "@/server/actions/adminActions";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — HR Assessment Dashboard" };

const ROLES = [
  { code: '', label: 'Tất cả' },
  { code: 'DIR', label: 'Giám đốc' },
  { code: 'HEAD', label: 'Trưởng bộ phận' },
  { code: 'DEV', label: 'Lập trình viên' },
  { code: 'TESTER', label: 'Tester' },
  { code: 'MANAGER', label: 'Manager' },
  { code: 'PM', label: 'Project Manager' },
  { code: 'HR', label: 'Nhân sự' },
  { code: 'SALES', label: 'Kinh doanh' },
  { code: 'BRSE', label: 'BrSE' },
  { code: 'COMTOR', label: 'Comtor' },
  { code: 'ACC', label: 'Kế toán' },
  { code: 'MKT', label: 'Marketing' },
];

function getReliabilityBadge(level: string) {
  const map: Record<string, string> = {
    high: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-orange-100 text-orange-700',
    invalid: 'bg-red-100 text-red-700',
  };
  return map[level?.toLowerCase()] ?? 'bg-slate-100 text-slate-600';
}

function getCombatPower(resultData: any): number | null {
  try {
    return (resultData as any)?.combatPower?.total ?? null;
  } catch {
    return null;
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; role?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const roleFilter = params.role ?? '';

  const [stats, { records, total, pages }] = await Promise.all([
    getAdminStats(),
    getAllAssessments(page, 20, roleFilter || undefined),
  ]);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-indigo-800 text-white px-6 py-5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">HR Assessment — Admin Dashboard</h1>
            <p className="text-indigo-200 text-sm mt-0.5">Quản lý kết quả đánh giá ứng viên</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/admin/validation"
              className="text-sm bg-indigo-900 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors border border-indigo-600"
            >
              Báo cáo xác thực
            </Link>
            <Link
              href="/admin/seed"
              className="text-sm bg-indigo-900 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors border border-indigo-600"
            >
              Seed dữ liệu
            </Link>
            <Link
              href="/"
              className="text-sm bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg transition-colors"
            >
              ← Về trang làm bài
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Tổng bài đánh giá', value: stats.totalAssessments, color: 'bg-blue-600' },
            { label: 'Tổng ứng viên', value: stats.totalUsers, color: 'bg-indigo-600' },
            { label: 'Trang hiện tại', value: `${page} / ${pages}`, color: 'bg-slate-600' },
            { label: 'Lọc vị trí', value: roleFilter || 'Tất cả', color: 'bg-emerald-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm p-5">
              <div className={`text-white text-xs font-semibold px-2 py-0.5 rounded inline-block mb-2 ${s.color}`}>
                {s.label}
              </div>
              <div className="text-2xl font-black text-slate-800">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-slate-500 mr-1">Lọc theo vị trí:</span>
            {ROLES.map(r => (
              <Link
                key={r.code}
                href={`/admin?role=${r.code}&page=1`}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  roleFilter === r.code
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">
              Danh sách bài đánh giá ({total} kết quả)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Ứng viên</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Vị trí</th>
                  <th className="px-4 py-3 text-center font-semibold">Điểm NL</th>
                  <th className="px-4 py-3 text-center font-semibold">Độ tin cậy</th>
                  <th className="px-4 py-3 text-center font-semibold">AI Report</th>
                  <th className="px-4 py-3 text-center font-semibold">Lượt xem</th>
                  <th className="px-4 py-3 text-left font-semibold">Ngày làm bài</th>
                  <th className="px-4 py-3 text-center font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                      Chưa có bài đánh giá nào
                    </td>
                  </tr>
                )}
                {records.map(rec => {
                  const resultData = rec.resultData as any;
                  const reliability = resultData?.reliability?.level ?? '—';
                  const combatPower = getCombatPower(rec.resultData);
                  const hasAiReport = !!rec.aiReport;
                  const roleName = rec.questionSet?.version ?? '—';
                  const recUser = (rec as any).user;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {recUser?.fullName ?? '—'}
                        {recUser?.employeeId && (
                          <span className="ml-1.5 text-xs text-slate-400">#{recUser.employeeId}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{recUser?.email ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-1 rounded">
                          {roleName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {combatPower !== null ? (
                          <span className={`font-black text-lg ${combatPower >= 70 ? 'text-green-600' : combatPower >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                            {combatPower}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getReliabilityBadge(reliability)}`}>
                          {reliability}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasAiReport
                          ? <span className="text-green-500 font-bold">✓</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-500">{(rec as any).viewCount ?? 0}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(rec.assessmentDate).toLocaleDateString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/result/${rec.id}`}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs underline"
                          target="_blank"
                        >
                          Xem báo cáo
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="px-5 py-4 border-t border-slate-100 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <Link
                  key={p}
                  href={`/admin?page=${p}&role=${roleFilter}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                    p === page
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
