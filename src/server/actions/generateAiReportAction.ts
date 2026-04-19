"use server";

import prisma from "@/server/db";
import { generateAIReport } from "@/features/assessment/utils/openaiService";
import type { AssessmentResult } from "@/features/assessment/data/scoring";
import { detectPersona, calcCombatPower, calcDutySuitability } from "@/features/assessment/data/aiAnalysis";
import type { AIReport } from "@/features/assessment/utils/openaiService";

export async function fetchAiReportAction(
  recordId: string,
  resultData: AssessmentResult,
  lang: 'vi' | 'en' | 'ja' = 'vi',
) {
  try {
    // 1. Kiểm tra cache trong DB trước
    const record = await prisma.assessmentRecord.findUnique({
      where: { id: recordId },
      select: { aiReport: true },
    });

    if (record?.aiReport) {
      const cached = record.aiReport as unknown as AIReport;
      // Nếu đã có cache cùng ngôn ngữ, trả về ngay
      if (cached.language === lang) {
        return { success: true, data: { ...cached, fromCache: true } };
      }
    }

    // 2. Chưa có cache → gọi OpenAI
    // 2. Chạy logic phân tích AI dựa trên điểm số (Rule-based AI)
    const result = resultData as AssessmentResult;
    const persona = detectPersona(result.dimensions);
    const combatPower = calcCombatPower(result.dimensions);
    const duties = calcDutySuitability(result.dimensions);

    // 3. Gọi OpenAI để tạo nội dung nhận xét chuyên sâu
    const report = await generateAIReport(result, persona, combatPower, duties, lang);

    if (!report) {
      return { success: false, error: "Không thể kết nối AI. Vui lòng thử lại sau." };
    }

    // 3. Lưu vào DB để cache
    await prisma.assessmentRecord.update({
      where: { id: recordId },
      data: { aiReport: report as any },
    });

    return { success: true, data: report };
  } catch (error) {
    console.error("fetchAiReportAction error:", error);
    return { success: false, error: "Lỗi hệ thống khi tạo báo cáo AI" };
  }
}
