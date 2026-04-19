"use server";

import prisma from "@/server/db";

export async function getAssessmentRecord(recordId: string) {
  try {
    const record = await prisma.assessmentRecord.findUnique({
      where: { id: recordId },
      include: { user: true },
    });
    if (!record) return null;

    // Cập nhật view count và thời gian xem cuối
    await prisma.assessmentRecord.update({
      where: { id: recordId },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });

    return record;
  } catch (e) {
    console.error(e);
    return null;
  }
}
