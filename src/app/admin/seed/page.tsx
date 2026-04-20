"use client";

import { useState } from "react";
import Link from "next/link";

export default function SeedPage() {
  const [message] = useState("Seed đã được thực hiện qua script prisma/seed-dev.ts. Trang này không còn cần thiết.");

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl w-full">
        <div className="mb-6">
          <Link href="/admin" className="text-sm text-indigo-600 hover:underline">← Về Admin Dashboard</Link>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">Seed Database</h1>
        <p className="text-slate-500 text-sm mb-6">
          Hệ thống SPI V4.2 đã được seed đầy đủ qua script{" "}
          <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">
            npx tsx prisma/seed-dev.ts
          </code>
          . Dữ liệu bao gồm <strong>34 dimensions</strong>, <strong>132 câu hỏi</strong>,
          và <strong>4 cross-dimension relations</strong>.
        </p>

        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
          ✅ {message}
        </div>

        <div className="mt-4 text-xs text-slate-400 space-y-1">
          <p>• Để re-seed, chạy: <code className="bg-slate-100 px-1 rounded">npx prisma db push --force-reset && npx tsx --env-file=.env prisma/seed-dev.ts</code></p>
          <p>• Dữ liệu hiện tại được quản lý tập trung trong DB PostgreSQL.</p>
        </div>
      </div>
    </div>
  );
}
