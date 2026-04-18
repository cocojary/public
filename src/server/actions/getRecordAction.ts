"use server";

import prisma from "@/server/db";

export async function getAssessmentRecord(recordId: string) {
  try {
    const record = await prisma.assessmentRecord.findUnique({
      where: { id: recordId },
      include: {
        user: true
      }
    });
    if (!record) return null;
    return record;
  } catch (e) {
    console.error(e);
    return null;
  }
}
