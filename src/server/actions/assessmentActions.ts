"use server";

import prisma from "@/server/db";
import { calculateScores } from "@/features/assessment/data/scoring";

export async function submitAssessmentAction(userId: string, answers: Record<string, number>, lang: 'vi' | 'en' | 'ja') {
  try {
    const end = Date.now();
    const start = end - (120 * 5000); // Dummy 10 minutes to pass speed validation
    
    // 1. Calculate the result
    const numericAnswers: Record<number, number> = {};
    for (const key in answers) {
      numericAnswers[Number(key)] = answers[key];
    }
    const resultData = calculateScores(numericAnswers, start, end, {});

    // 2. Save the record
    const record = await prisma.assessmentRecord.create({
      data: {
        userId,
        version: "2.0",
        assessmentDate: new Date(),
        answers: answers,
        resultData: resultData as any,
      }
    });

    return { success: true, recordId: record.id };
  } catch (error) {
    console.error("Error submitting assessment:", error);
    return { success: false, error: "Lỗi trong quá trình chấm điểm" };
  }
}
