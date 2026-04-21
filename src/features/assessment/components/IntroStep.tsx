"use client";

import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: "🧠", label: "Big Five Personality Model", desc: "Phương pháp tâm lý học được kiểm chứng khoa học tại 50+ quốc gia" },
  { icon: "⚡", label: "Năng lực thực chiến", desc: "Thuật toán độc quyền đo lường khả năng tạo kết quả trong thực tế" },
  { icon: "🛡️", label: "Chống gian lận", desc: "Hệ thống phát hiện câu trả lời tô hồng và trả lời lụi tự động" },
  { icon: "📊", label: "Báo cáo chuyên sâu", desc: "Phân tích điểm yếu, rủi ro tiềm ẩn và gợi ý phát triển cá nhân" },
];

export function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white rounded-2xl shadow-2xl p-10 mb-6 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-indigo-200 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Techzen HR Assessment System
          </div>

          <h1 className="text-4xl font-extrabold mb-4 tracking-tight leading-tight">
            Khám Phá Năng Lực<br />
            <span className="text-indigo-300">Thực Chiến Của Bạn</span>
          </h1>

          <p className="text-indigo-200 text-lg leading-relaxed max-w-xl mx-auto mb-8">
            Bài đánh giá tính cách và năng lực được thiết kế khoa học, giúp bạn hiểu rõ điểm mạnh, điểm yếu và xu hướng hành vi trong môi trường công việc.
          </p>

          {/* Stats row */}
          <div className="flex justify-center gap-8 mb-8 flex-wrap">
            {[
              { num: "~20", unit: "phút", label: "Thời gian làm bài" },
              { num: "80+", unit: "câu", label: "Câu hỏi đa chiều" },
              { num: "6", unit: "chiều", label: "Năng lực đo lường" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-white">
                  {s.num}<span className="text-indigo-300 text-base font-semibold ml-0.5">{s.unit}</span>
                </div>
                <div className="text-indigo-300 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <Button
            onClick={onNext}
            size="lg"
            className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-lg px-10 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Bắt đầu ngay →
          </Button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {FEATURES.map(f => (
          <div key={f.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all">
            <div className="text-2xl mb-2">{f.icon}</div>
            <div className="font-bold text-slate-800 text-sm mb-1">{f.label}</div>
            <div className="text-slate-500 text-xs leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
          <span>⚠️</span> Lưu ý quan trọng trước khi làm bài
        </h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
            Bài kiểm tra <strong>không có câu trả lời đúng sai</strong> tuyệt đối.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
            Hãy trả lời <strong>theo thiên hướng tự nhiên nhất</strong> của cá nhân bạn.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
            Hệ thống phát hiện các câu trả lời <strong>thiếu trung thực</strong> — kết quả sẽ chính xác hơn khi bạn thành thật.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
            Tiến trình làm bài được <strong>tự động lưu</strong> — bạn có thể tiếp tục nếu bị gián đoạn.
          </li>
        </ul>
      </div>
    </div>
  );
}
