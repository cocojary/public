import { notFound } from "next/navigation";
import prisma from "@/server/db";
import type { UnifiedScoringResult } from "@/features/assessment/utils/unifiedEngine";
import { PublicResultView } from "@/features/assessment/components/PublicResultView";
import type { Metadata } from "next";
import { getActiveDimensions } from "@/server/services/assessmentDataService";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const record = await prisma.assessmentRecord.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!record) return { title: "Không tìm thấy kết quả" };
  return {
    title: `Kết quả đánh giá của ${record.user.fullName} — Techzen Assessment`,
    description: "Báo cáo năng lực Lite version từ Techzen HR Assessment.",
  };
}

export default async function PublicResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [record, activeDims] = await Promise.all([
    prisma.assessmentRecord.findUnique({
      where: { id },
      include: { user: true },
    }),
    getActiveDimensions(),
  ]);

  if (!record) notFound();

  const resultData = record.resultData as unknown as UnifiedScoringResult;
  const user = record.user;

  return (
    <PublicResultView
      user={{
        fullName: user.fullName,
        department: user.department ?? null,
      }}
      resultData={resultData}
      activeDimensions={activeDims}
      date={record.assessmentDate.toISOString()}
      recordId={record.id}
    />
  );
}
