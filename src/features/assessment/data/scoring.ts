// ============================================================
// SCORING ENGINE — Techzen HR Assessment
// ============================================================

import { QUESTIONS, CONSISTENCY_PAIRS, LIE_QUESTION_IDS } from './questions';
import { DIMENSIONS } from './dimensions';

export interface DimensionScore {
  dimensionId: string;
  raw: number;
  max: number;
  scaled: number;     // 1–10
  percentile: number; // 0–100
}

export type ReliabilityLevel = 'high' | 'medium' | 'low' | 'invalid';

export interface ReliabilityResult {
  level: ReliabilityLevel;
  lieScore: number;        // 0–100
  consistencyScore: number; // 0–100 (nhất quán)
  speedFlag: boolean;       // true nếu trả lời quá nhanh
  details: string;
}

export interface AssessmentResult {
  dimensions: DimensionScore[];
  reliability: ReliabilityResult;
  completedAt: string;
  durationSeconds: number;
}

/** Tính điểm từng dimension */
export function calculateScores(
  answers: Record<number, number>, // { questionId: 1-5 }
  questions: any[],                // Dynamic questions from DB
  startTime: number,
  endTime: number,
  questionTimestamps: Record<number, number>,
): AssessmentResult {
  const dimensionScores: Record<string, { raw: number; count: number }> = {};

  // 1. Tổng điểm từng dimension (bỏ Lie Scale)
  for (const q of questions) {
    if (q.isLieScale) continue;
    if (!answers[q.id]) continue;

    const score = q.reversed ? (6 - answers[q.id]) : answers[q.id];
    if (!dimensionScores[q.dimensionId]) {
      dimensionScores[q.dimensionId] = { raw: 0, count: 0 };
    }
    dimensionScores[q.dimensionId].raw += score;
    dimensionScores[q.dimensionId].count += 1;
  }

  // 2. Scale sang 1–10
  const dimensions: DimensionScore[] = DIMENSIONS.map(dim => {
    const data = dimensionScores[dim.id] || { raw: 0, count: 1 };
    const min = data.count;        // min: mọi câu = 1
    const max = data.count * 5;    // max: mọi câu = 5
    const percentile = max > min ? ((data.raw - min) / (max - min)) * 100 : 50;
    const scaled = Math.max(1, Math.min(10, Math.round(percentile / 10) + 1));

    return {
      dimensionId: dim.id,
      raw: data.raw,
      max,
      scaled,
      percentile: Math.round(percentile),
    };
  });

  // 3. Lie Scale
  let lieRaw = 0;
  let lieMax = 0;
  const lieQuestions = questions.filter(q => q.isLieScale);
  for (const q of lieQuestions) {
    if (answers[q.id] !== undefined) {
      lieRaw += q.reversed ? (6 - answers[q.id]) : answers[q.id];
      lieMax += 5;
    }
  }
  const lieScore = lieMax > 0 ? Math.round((lieRaw / lieMax) * 100) : 0;

  // 4. Consistency Check (Simplified for dynamic questions: Variance measure)
  // Trong tương lai có thể thêm metadata cặp câu hỏi để check kỹ hơn
  const consistencyScore = 100; // Mặc định 100 cho bản động (placeholder)
  const inconsistencyRate = 0; 


  // 5. Speed Check
  const durationSeconds = Math.round((endTime - startTime) / 1000);
  const totalAnswered = Object.keys(answers).length;
  const avgSecondsPerQ = totalAnswered > 0 ? durationSeconds / totalAnswered : 999;
  const speedFlag = avgSecondsPerQ < 2.5; // < 2.5 giây/câu là quá nhanh

  // 6. Reliability Level
  let level: ReliabilityLevel = 'high';
  let details = 'Kết quả đáng tin cậy, nhân viên trả lời nghiêm túc và nhất quán.';

  if (speedFlag) {
    level = 'invalid';
    details = `⚠️ Phát hiện trả lời quá nhanh (${avgSecondsPerQ.toFixed(1)}s/câu). Kết quả không đáng tin cậy.`;
  } else if (lieScore > 70 || inconsistencyRate > 40) {
    level = 'invalid';
    details = '❌ Phát hiện câu trả lời không nhất quán hoặc có xu hướng chọn đáp án "lý tưởng". Cần làm lại.';
  } else if (lieScore > 55 || inconsistencyRate > 25) {
    level = 'low';
    details = '⚠️ Có một số dấu hiệu lo ngại về độ chân thực. HR cần xem xét thêm trong buổi phỏng vấn.';
  } else if (lieScore > 40 || inconsistencyRate > 15) {
    level = 'medium';
    details = '🟡 Kết quả tương đối đáng tin cậy. Một số câu trả lời cần xác nhận thêm.';
  }

  return {
    dimensions,
    reliability: {
      level,
      lieScore,
      consistencyScore,
      speedFlag,
      details,
    },
    completedAt: new Date().toISOString(),
    durationSeconds,
  };
}

/** Lấy nhận xét tự động dựa trên điểm */
export function getInterpretation(dimId: string, scaled: number): string {
  const dim = DIMENSIONS.find(d => d.id === dimId);
  if (!dim) return '';
  if (scaled <= 3) return dim.descLow;
  if (scaled >= 8) return dim.descHigh;
  return `Mức trung bình — ${dim.descHigh.split(',')[0].toLowerCase()}.`;
}

/** Top 3 điểm mạnh */
export function getTopStrengths(dimensions: DimensionScore[]): DimensionScore[] {
  return [...dimensions]
    .filter(d => !['lie_scale'].includes(d.dimensionId))
    .sort((a, b) => b.scaled - a.scaled)
    .slice(0, 3);
}

/** Top 2 điểm cần cải thiện */
export function getTopWeaknesses(dimensions: DimensionScore[]): DimensionScore[] {
  return [...dimensions]
    .filter(d => !['lie_scale'].includes(d.dimensionId))
    .sort((a, b) => a.scaled - b.scaled)
    .slice(0, 2);
}

/** Gợi ý vị trí phù hợp */
export function getSuitableRoles(dimensions: DimensionScore[]): string[] {
  const get = (id: string) => dimensions.find(d => d.dimensionId === id)?.scaled ?? 5;

  const roles: string[] = [];

  if (get('extraversion') >= 7 && get('agreeableness') >= 7) roles.push('Sales / Business Development');
  if (get('logical_thinking') >= 7 && get('conscientiousness') >= 7) roles.push('Kỹ thuật / Lập trình / Phân tích');
  if (get('empathy') >= 7 && get('agreeableness') >= 7) roles.push('Chăm sóc khách hàng / HR / Đào tạo');
  if (get('openness') >= 7 && get('challenge_spirit') >= 7) roles.push('R&D / Sản phẩm / Thiết kế sáng tạo');
  if (get('conscientiousness') >= 8 && get('caution') >= 7) roles.push('Kế toán / Kiểm soát nội bộ / QA');
  if (get('autonomy') >= 7 && get('achievement_drive') >= 7) roles.push('Quản lý dự án / Team Lead');
  if (get('social_contribution') >= 7 && get('empathy') >= 7) roles.push('Công tác xã hội / ESG / CSR');
  if (get('stress_mental') >= 7 && get('stress_physical') >= 7) roles.push('Vị trí áp lực cao / Môi trường tốc độ nhanh');

  return roles.length > 0 ? roles.slice(0, 4) : ['Phù hợp nhiều vị trí — cần phỏng vấn thêm để xác định'];
}
