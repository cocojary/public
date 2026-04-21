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

const LITE_MAX_QUESTIONS = 35; // Public free tier — giới hạn 35 câu

// ──────────────────────────────────────────────────────────────
// GET LITE QUESTION SET — dành cho Public Freemium
// Chỉ lấy các main questions (bỏ lie questions để nhanh hơn),
// giới hạn số câu để giảm thời gian làm bài (~10 phút)
// ──────────────────────────────────────────────────────────────
export async function getLiteQuestionSet() {
  try {
    const qSet = await db.questionSet.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        questions: {
          where: {
            isActive: true,
            questionType: "main", // Chỉ lấy main questions — bỏ lie scale cho Lite
          },
          orderBy: { displayOrder: "asc" },
          take: LITE_MAX_QUESTIONS,
        },
      },
    });

    if (!qSet) {
      return { success: false, error: "Không tìm thấy bộ câu hỏi." };
    }

    return {
      success: true,
      questions: qSet.questions,
      setId: qSet.id,
      isLite: true,
      totalQuestions: LITE_MAX_QUESTIONS,
    };
  } catch (error) {
    console.error("getLiteQuestionSet error:", error);
    return { success: false, error: "Lỗi hệ thống khi tải câu hỏi." };
  }
}

// ──────────────────────────────────────────────────────────────
// SUBMIT PUBLIC ASSESSMENT
// Không trigger OpenAI AI report — để tiết kiệm chi phí API
// ──────────────────────────────────────────────────────────────
export async function submitPublicAssessmentAction(
  userId: string,
  answers: Record<string, any>,
  answerTimes: Record<string, number>,
  setId: string,
  leadEmail: string | null,
  leadPhone: string | null,
  startTime: number,
) {
  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      "unknown";

    // Rate limit riêng cho public (prefix khác để tách biệt với internal)
    const { allowed } = await checkRateLimit(`public:${ip}`);
    if (!allowed) {
      return {
        success: false,
        error: "Bạn đã nộp quá nhiều lần. Vui lòng thử lại sau 1 giờ.",
      };
    }

    // Lấy đúng câu hỏi mà user đã trả lời (khớp với getLiteQuestionSet)
    const answeredIds = Object.keys(answers);
    const qSet = await db.questionSet.findUnique({
      where: { id: setId },
      include: {
        questions: {
          where: {
            isActive: true,
            id: { in: answeredIds },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });
    if (!qSet) throw new Error("Question set not found");
    if (qSet.questions.length === 0) throw new Error("Không tìm thấy câu hỏi phù hợp với bài nộp");

    const [activeDims, dimRelations, roleTemplates] = await Promise.all([
      getActiveDimensions(),
      getDimensionRelations(),
      db.roleTemplate.findMany({ where: { isActive: true } }),
    ]);

    const activeDimIds = activeDims.map((d) => d.id);
    const engineQuestions = qSet.questions.map(toEngineQuestion);

    const endTime = Date.now();
    const version = "4.2-SPI-LITE-PUBLIC";

    const resultData = calculateUnifiedScores(
      answers,
      engineQuestions,
      startTime,
      endTime,
      activeDimIds,
      dimRelations,
      answerTimes,
      roleTemplates,
    );

    // Lưu kết quả — gắn tag public + lead info vào hrNotes để phân biệt
    const leadNote = {
      id: crypto.randomUUID(),
      author: "System — Public Lead",
      content: `[PUBLIC SUBMISSION] Email: ${leadEmail ?? "—"} | Phone: ${leadPhone ?? "—"}`,
      createdAt: new Date().toISOString(),
      isSystem: true,
    };

    const record = await db.assessmentRecord.create({
      data: {
        userId,
        questionSetId: setId,
        version, // 'LITE-PUBLIC' tag để phân biệt với internal
        assessmentDate: new Date(),
        answers,
        answerTimes,
        resultData: resultData as any,
        submissionIp: ip,
        hrNotes: [leadNote], // Lưu lead info vào hrNotes
        // aiReport: null — PUBLIC không generate AI report tự động
      },
    });

    return { success: true, recordId: record.id };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("submitPublicAssessmentAction error:", msg, error);
    return { success: false, error: `Lỗi khi nộp bài: ${msg}` };
  }
}

// ──────────────────────────────────────────────────────────────
// SAVE LEAD — Cập nhật thông tin lead vào record sau khi submit
// ──────────────────────────────────────────────────────────────
export async function savePublicLeadAction(
  recordId: string,
  email: string | null,
  phone: string | null,
) {
  try {
    const record = await db.assessmentRecord.findUnique({
      where: { id: recordId },
      select: { hrNotes: true },
    });
    if (!record) return { success: false, error: "Không tìm thấy hồ sơ" };

    let notes: any[] = Array.isArray(record.hrNotes) ? [...record.hrNotes] : [];

    // Cập nhật hoặc thêm lead note
    const systemNoteIdx = notes.findIndex((n: any) => n.isSystem === true);
    const updatedNote = {
      id: systemNoteIdx >= 0 ? notes[systemNoteIdx].id : crypto.randomUUID(),
      author: "System — Public Lead",
      content: `[PUBLIC SUBMISSION] Email: ${email ?? "—"} | Phone: ${phone ?? "—"}`,
      createdAt: systemNoteIdx >= 0 ? notes[systemNoteIdx].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSystem: true,
    };

    if (systemNoteIdx >= 0) {
      notes[systemNoteIdx] = updatedNote;
    } else {
      notes.push(updatedNote);
    }

    await db.assessmentRecord.update({
      where: { id: recordId },
      data: { hrNotes: notes },
    });

    return { success: true };
  } catch (error) {
    console.error("savePublicLeadAction error:", error);
    return { success: false, error: "Lỗi khi lưu thông tin" };
  }
}
