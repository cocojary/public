import ScouterReport from "@/features/assessment/components/ScouterReport";
import { ADMIN_PROFILE_MOCK } from "@/features/assessment/data/adminProfileMock";
import { ADMIN_AI_REPORT_MOCK } from "@/features/assessment/data/aiReportMock";

export default function TestReportPage() {
  const mockUser = {
    fullName: "Nguyễn Văn Hành Chính",
    email: "admin.test@techzen.vn",
    department: "Hành chính - Nhân sự",
    targetRole: "Chuyên viên Hành chính cấp cao"
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-[1000px] mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg text-blue-800 text-sm">
        <h2 className="font-bold mb-1 italic">Chế độ kiểm thử báo cáo (Test Report Mode)</h2>
        <p>Báo cáo này sử dụng dữ liệu mẫu cho vị trí <strong>Hành chính</strong> để kiểm tra độ trung tính của AI, các đề xuất vai trò ngách và cấu trúc báo cáo 1-1 (Behavior-Result).</p>
      </div>
      
      <div className="shadow-2xl">
        <ScouterReport
          user={mockUser}
          resultData={ADMIN_PROFILE_MOCK}
          date={new Date()}
          aiReport={ADMIN_AI_REPORT_MOCK}
        />
      </div>
    </main>
  );
}
