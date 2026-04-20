"use server";

import { headers } from "next/headers";
import db from "@/server/db";
import { calculateUnifiedScores } from "@/features/assessment/utils/unifiedEngine";
import { checkRateLimit } from "@/server/utils/rateLimit";
import {
  getActiveDimensions,
  getDimensionRelations,
  toEngineQuestion,
} from "@/server/services/assessmentDataService";

// ──────────────────────────────────────────────────────────────
// GET QUESTION SET — đọc từ DB (không dùng role param nữa)
// ──────────────────────────────────────────────────────────────

export async function getDefaultQuestionSet() {
  try {
    const qSet = await db.questionSet.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { questions: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } } },
    });
    if (!qSet) {
      return { success: false, error: "Không tìm thấy bộ câu hỏi. Vui lòng liên hệ Admin." };
    }
    // Trả về tất cả câu hỏi (main + lie) đã được sắp xếp xen kẽ theo displayOrder
    // Lie questions được ẩn về mặt phân loại nhưng người dùng vẫn trả lời — cần thiết cho Lie Scale detection
    return { success: true, questions: qSet.questions, setId: qSet.id };
  } catch (error) {
    console.error("Lỗi khi lấy câu hỏi:", error);
    return { success: false, error: "Lỗi hệ thống khi tải câu hỏi." };
  }
}

// ──────────────────────────────────────────────────────────────
// SUBMIT ASSESSMENT
// ──────────────────────────────────────────────────────────────

export async function submitAssessmentAction(
  userId: string,
  answers: Record<string, number>,
  setId: string,
  lang: 'vi' | 'en' | 'ja',
  startTime: number,
) {
  try {
    // Rate limit kiểm tra
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

    // Lấy toàn bộ câu hỏi (bao gồm lie) từ DB
    const qSet = await db.questionSet.findUnique({
      where: { id: setId },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!qSet) throw new Error("Question set not found");

    // Lấy dimension info và relations từ DB (thay vì hardcode)
    const [activeDims, dimRelations] = await Promise.all([
      getActiveDimensions(),
      getDimensionRelations(),
    ]);

    const activeDimIds = activeDims.map(d => d.id);

    // Convert câu hỏi DB sang format engine cần
    const engineQuestions = qSet.questions.map(toEngineQuestion);

    const endTime = Date.now();
    const version = "4.2-SPI-UNIFIED";

    const resultData = calculateUnifiedScores(
      answers,
      engineQuestions,
      startTime,
      endTime,
      activeDimIds,
      dimRelations,
    );

    const record = await db.assessmentRecord.create({
      data: {
        userId,
        questionSetId: setId,
        version,
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
