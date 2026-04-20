"use client";

import { useState } from "react";
import ScouterReport from "@/features/assessment/components/ScouterReport";
import validationResults from "@/features/assessment/data/validation_results_50.json";
import { ADMIN_AI_REPORT_MOCK } from "@/features/assessment/data/aiReportMock";

export default function TestReportPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const selectedPersona = validationResults[selectedIndex];
  const { persona, scoringResult, flags, pass } = selectedPersona;

  const mockUser = {
    fullName: persona.name,
    email: `test_${persona.id}@techzen.vn`,
    department: persona.group,
    targetRole: persona.name
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-[1000px] mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg text-blue-800 text-sm">
        <h2 className="font-bold mb-1 italic">Chế độ kiểm thử báo cáo (Test Report Mode) - 50 Personas</h2>
        <p>Báo cáo này sử dụng dữ liệu từ kết quả validation của 50 personas. Bạn có thể chọn từng persona ở dưới để kiểm tra giao diện SCouterReport tương ứng.</p>

        <div className="mt-4 flex flex-col gap-2">
          <label className="font-semibold" htmlFor="persona-select">Chọn Persona để xem kết quả:</label>
          <select 
            id="persona-select"
            className="p-2 border border-gray-300 rounded text-black font-medium"
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
          >
            {validationResults.map((v, idx) => (
              <option key={v.persona.id} value={idx}>
                [{v.pass ? "✅ PASS" : "❌ FAIL"}] #{v.persona.id}. {v.persona.name} - Reliability: {v.scoringResult.reliabilityLevel}
              </option>
            ))}
          </select>
        </div>

        {flags.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            <strong>❌ Các lỗi không đạt Validation:</strong>
            <ul className="list-disc pl-5 mt-1">
              {flags.map((f: string, i: number) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="shadow-2xl">
        <ScouterReport
          user={mockUser}
          resultData={scoringResult as any}
          date={new Date()}
          aiReport={ADMIN_AI_REPORT_MOCK}
        />
      </div>
    </main>
  );
}
