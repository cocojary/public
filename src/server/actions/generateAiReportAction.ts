"use server";

import { generateAIReport } from "@/features/assessment/utils/openaiService";
import type { AssessmentResult } from "@/features/assessment/data/scoring";
import { detectPersona, calcCombatPower, calcDutySuitability } from "@/features/assessment/data/aiAnalysis";

export async function fetchAiReportAction(resultData: any, lang: 'vi' | 'en' | 'ja' = 'vi') {
  try {
    const result = resultData as AssessmentResult;
    const persona = detectPersona(result);
    const combatPower = calcCombatPower(result);
    const duties = calcDutySuitability(result);

    const report = await generateAIReport(result, persona, combatPower, duties, lang);
    return { success: true, data: report };
  } catch (error) {
    console.error("fetchAiReportAction errored:", error);
    return { success: false, error: "Không thể lấy dự đoán AI lúc này" };
  }
}
