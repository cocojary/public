"use server";

import prisma from "@/server/db";
import { calculateScores } from "@/features/assessment/data/scoring";

export async function getQuestionsByRole(roleCode: string) {
  try {
    const role = await prisma.targetRole.findUnique({
      where: { code: roleCode },
      include: {
        questionSets: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { questions: true }
        }
      }
    });

    if (!role || !role.questionSets[0]) return { success: false, error: "Không tìm thấy bộ câu hỏi cho vị trí này." };

    return { 
      success: true, 
      questions: role.questionSets[0].questions,
      setId: role.questionSets[0].id
    };
  } catch (error) {
    console.error("Lỗi khi lấy câu hỏi:", error);
    return { success: false, error: "Lỗi hệ thống khi tải câu hỏi." };
  }
}

export async function submitAssessmentAction(
  userId: string, 
  answers: Record<string, number>, 
  setId: string,
  lang: 'vi' | 'en' | 'ja'
) {
  try {
    const end = Date.now();
    const start = end - (120 * 5000); 
    
    // Fetch the set to get questions for scoring
    const qSet = await prisma.questionSet.findUnique({
      where: { id: setId },
      include: { questions: true }
    });

    if (!qSet) throw new Error("Question set not found");

    // 1. Calculate the result
    const numericAnswers: Record<number, number> = {};
    for (const key in answers) {
      numericAnswers[Number(key)] = answers[key];
    }
    const resultData = calculateScores(numericAnswers, qSet.questions, start, end, {});

    // 2. Save the record
    const record = await prisma.assessmentRecord.create({
      data: {
        userId,
        questionSetId: setId,
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
