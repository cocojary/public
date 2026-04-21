import { AssessmentProcess } from "@/features/assessment/components/AssessmentProcess";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đánh giá Năng lực — Nội bộ Techzen",
  description: "Hệ thống đánh giá tính cách và năng lực dành cho nhân sự Techzen.",
};

export default function AssessPage() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 selection:bg-blue-200">
      <AssessmentProcess />
    </main>
  );
}
