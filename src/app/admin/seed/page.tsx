"use client";

import { useState } from "react";
import { seedLeadershipQuestions } from "@/server/actions/seedLeadershipAction";
import Link from "next/link";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    setResults([]);
    try {
      const res = await seedLeadershipQuestions();
      setResults(res.results);
      setDone(true);
    } catch (e: any) {
      setResults([`❌ Lỗi: ${e.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl w-full">
        <div className="mb-6">
          <Link href="/admin" className="text-sm text-indigo-600 hover:underline">← Về Admin Dashboard</Link>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">Seed Leadership Questions</h1>
        <p className="text-slate-500 text-sm mb-6">
          Thêm 56 câu hỏi lãnh đạo (14 dimensions × 4 câu) vào question sets của các role:{" "}
          <strong>DIR, HEAD, MANAGER</strong>. Action này an toàn — tự động bỏ qua nếu đã có leadership questions.
        </p>

        <button
          onClick={handleSeed}
          disabled={loading || done}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-colors"
        >
          {loading ? "Đang seed..." : done ? "Đã seed xong" : "Chạy Seed Leadership Questions"}
        </button>

        {results.length > 0 && (
          <div className="mt-6 space-y-2">
            <h2 className="font-semibold text-slate-700">Kết quả:</h2>
            {results.map((r, i) => (
              <div key={i} className="text-sm p-3 bg-slate-50 rounded-lg font-mono border border-slate-200">
                {r}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
