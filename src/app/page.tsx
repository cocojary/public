import { AssessmentProcess } from "@/features/assessment/components/AssessmentProcess";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đánh giá Năng lực - Hệ thống HR",
  description: "Trắc nghiệm tính cách cá nhân và phân tích điểm mạnh yếu theo mô hình Big Five.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 selection:bg-blue-200">
      <AssessmentProcess />
    </main>
  );
}
