"use server";

import prisma from "@/server/db";

export type FlaggedAnswer = {
  questionId: string;
  textVi: string;
  answerValue: number;
  type: 'lie_scale' | 'speed';
  reason: string;
  dimensionNameVi: string;
};

export async function getFlaggedAnswers(recordId: string): Promise<FlaggedAnswer[]> {
  try {
    const record = await prisma.assessmentRecord.findUnique({
      where: { id: recordId },
      select: { answers: true, answerTimes: true, questionSetId: true },
    });

    if (!record || !record.questionSetId) return [];

    const questions = await prisma.question.findMany({
      where: { setId: record.questionSetId, isActive: true },
      include: { dimension: true },
    });

    const flagged: FlaggedAnswer[] = [];
    const answers = record.answers as Record<string, number>;
    const times = record.answerTimes as Record<string, number> | null;

    for (const q of questions) {
      const ans = answers[q.id];
      if (ans === undefined || ans === null) continue;

      // 1. Lie Scale (Tô hồng tích cực)
      if (q.questionType === 'lie_absolute' || q.questionType === 'lie_subtle') {
        if (ans >= 4) {
          flagged.push({
            questionId: q.id,
            textVi: q.textVi,
            answerValue: ans,
            type: 'lie_scale',
            reason: q.questionType === 'lie_absolute' 
                ? 'Câu hỏi bẫy nói dối tuyệt đối (chọn mức cao là bất hợp lý).' 
                : 'Thiên kiến phản hồi tích cực tế nhị (cố làm đẹp hình ảnh).',
            dimensionNameVi: q.dimension?.nameVi || 'Kiểm tra độ tin cậy',
          });
        }
      }

      // 2. Tốc độ trả lời quá nhanh (< 1.5 giây)
      if (times && times[q.id] !== undefined && times[q.id] < 1500) {
        // Đôi khi người dùng đọc lướt, nhưng nếu rất nhanh thì nghi ngờ đánh bừa
        flagged.push({
          questionId: q.id,
          textVi: q.textVi,
          answerValue: ans,
          type: 'speed',
          reason: `Trả lời quá nhanh (${(times[q.id] / 1000).toFixed(1)}s), nghi vấn đánh lụi mà không đọc kỹ.`,
          dimensionNameVi: q.dimension?.nameVi || 'Không xác định',
        });
      }
    }

    return flagged;
  } catch (error) {
    console.error("Lỗi khi fetch flagged answers:", error);
    return [];
  }
}
