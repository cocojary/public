import { PublicAssessmentProcess } from "@/features/assessment/components/PublicAssessmentProcess";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đánh giá Năng lực Miễn phí — Techzen Assessment",
  description:
    "Khám phá điểm mạnh, điểm yếu và năng lực thực chiến của bạn với bài trắc nghiệm 35 câu dựa trên mô hình Big Five. Hoàn toàn miễn phí.",
};

export default function PublicAssessmentPage() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl">
        <PublicAssessmentProcess />
      </div>
    </main>
  );
}
