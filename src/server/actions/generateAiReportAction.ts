"use server";

import prisma from "@/server/db";
import { generateAIReport } from "@/features/assessment/utils/openaiService";
import type { AssessmentResult } from "@/features/assessment/data/scoring";
import { detectPersona, calcCombatPower, calcDutySuitability } from "@/features/assessment/data/aiAnalysis";
import type { AIReport } from "@/features/assessment/utils/openaiService";
import type { UnifiedScoringResult } from "@/features/assessment/utils/unifiedEngine";
import { adaptToAssessmentResult } from "@/features/assessment/utils/unifiedEngine";
import { calcCultureFit } from "@/features/assessment/utils/unifiedScoring";

export async function fetchAiReportAction(
  recordId: string,
  resultData: AssessmentResult | UnifiedScoringResult,
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
      if (cached.language === lang) {
        return { success: true, data: { ...cached, fromCache: true } };
      }
    }

    // 2. Chuẩn hóa data đầu vào — hỗ trợ V4 (mới) và V2 (legacy)
    const isV4 = 'type' in resultData && resultData.type === 'SPI_UNIFIED_V4';
    const standardResult: AssessmentResult = isV4
      ? adaptToAssessmentResult(resultData as UnifiedScoringResult) as AssessmentResult
      : resultData as AssessmentResult;

    if (!standardResult.dimensions || standardResult.dimensions.length === 0) {
      return { success: false, error: "Dữ liệu bài kiểm tra không đầy đủ để phân tích AI." };
    }

    // 3. Phân tích: persona, combat power, duty fit
    const persona     = detectPersona(standardResult.dimensions);
    const combatPower = calcCombatPower(standardResult.dimensions);
    const duties      = calcDutySuitability(standardResult.dimensions);
    const cultureFit  = calcCultureFit(standardResult.dimensions);

    // 4. Gọi AI
    const report = await generateAIReport(standardResult, persona, combatPower, duties, cultureFit, lang);

    if (!report) {
      return {
        success: false,
        error: "Không thể kết nối dịch vụ AI. Vui lòng kiểm tra API key hoặc thử lại sau.",
      };
    }

    // 5. Lưu cache vào DB
    await prisma.assessmentRecord.update({
      where: { id: recordId },
      data: { aiReport: report as object },
    });

    return { success: true, data: report };
  } catch (error) {
    console.error("fetchAiReportAction error:", error);
    const msg = error instanceof Error ? error.message : "Lỗi không xác định";
    return { success: false, error: `Lỗi hệ thống: ${msg}` };
  }
}
