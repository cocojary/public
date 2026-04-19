"use server";

import { headers } from "next/headers";
import prisma from "@/server/db";
import { calculateScores } from "@/features/assessment/data/scoring";
import { calculateDevResults } from "@/features/assessment/utils/devScoring";
import { checkRateLimit } from "@/server/utils/rateLimit";

export async function getQuestionsByRole(roleCode: string) {
  try {
    const role = await prisma.targetRole.findUnique({
      where: { code: roleCode },
      include: {
        questionSets: {
          where: { isActive: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { questions: true },
        },
      },
    });

    if (!role || !role.questionSets[0]) {
      return { success: false, error: "Không tìm thấy bộ câu hỏi cho vị trí này." };
    }

    return {
      success: true,
      questions: role.questionSets[0].questions,
      setId: role.questionSets[0].id,
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
  lang: 'vi' | 'en' | 'ja',
  startTime: number,
) {
  try {
    // Lấy IP để rate limit
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      "unknown";

    const { allowed } = await checkRateLimit(`submit:${ip}`);
    if (!allowed) {
      return {
        success: false,
        error: "Bạn đã nộp quá nhiều lần. Vui lòng chờ 1 giờ trước khi thử lại.",
      };
    }

    const qSet = await prisma.questionSet.findUnique({
      where: { id: setId },
      include: { questions: true },
    });

    if (!qSet) throw new Error("Question set not found");

    // Lấy thông tin Role của QuestionSet để xác định logic chấm điểm
    const role = await prisma.targetRole.findUnique({
      where: { id: qSet.roleId },
      select: { code: true }
    });

    const endTime = Date.now();
    let resultData;
    let version = "2.0";

    // Phân nhánh logic chấm điểm dựa trên Role Code
    if (role?.code === "DEV") {
      const answersArray = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value: Number(value),
      }));
      resultData = calculateDevResults(answersArray, qSet.questions, startTime, endTime);
      version = "3.0-SPI-DEV";
    } else {
      resultData = calculateScores(answers, qSet.questions, startTime, endTime, {});
    }

    const record = await prisma.assessmentRecord.create({
      data: {
        userId,
        questionSetId: setId,
        version: version,
        assessmentDate: new Date(),
        answers: answers,
        resultData: resultData as any,
        submissionIp: ip,
      },
    });

    return { success: true, recordId: record.id };
  } catch (error) {
    console.error("Error submitting assessment:", error);
    return { success: false, error: "Lỗi trong quá trình chấm điểm" };
  }
}
