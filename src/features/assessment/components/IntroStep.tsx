"use client";

import { Button } from "@/components/ui/button";

export function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-3xl mx-auto p-10 bg-white rounded-2xl shadow-xl mt-12 text-center">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-6 tracking-tight">Hệ thống Đánh giá Nhân sự</h1>
      <p className="text-lg text-slate-600 mb-8 leading-relaxed">
        Chào mừng bạn đến với hệ thống đánh giá tính cách và năng lực. Bài trắc nghiệm bao gồm các câu hỏi thiết kế khoa học nhằm đánh giá phong cách làm việc, mức độ phù hợp văn hoá và các xu hướng hành vi của bạn tại nơi làm việc.
      </p>
      
      <div className="bg-slate-50 p-6 rounded-lg mb-10 text-left border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Lưu ý trước khi làm bài:</h3>
        <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium">
          <li>Bài kiểm tra không có câu trả lời đúng sai tuyệt đối.</li>
          <li>Hãy trả lời theo thiên hướng tự nhiên nhất của cá nhân bạn.</li>
          <li>Nếu bạn phân vân, hãy chọn đáp án thiên về tính cách thường ngày của bạn hơn.</li>
        </ul>
      </div>

      <Button onClick={onNext} size="lg" className="px-10 py-6 text-xl bg-blue-600 hover:bg-blue-700 rounded-full font-bold shadow-md hover:shadow-lg transition-all">
        Bắt đầu làm bài
      </Button>
    </div>
  );
}
