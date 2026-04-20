// ============================================================
// SCORING ENGINE — Techzen HR Assessment v2.1
// ============================================================

// DbDimension imported from server services for optional use in scoring context
import type { DbDimension } from '@/server/services/assessmentDataService';

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
  lieScore: number;         // 0–100 (cao = tô vẽ bản thân)
  consistencyScore: number; // 0–100 (cao = nhất quán)
  speedFlag: boolean;
  avgSecondsPerQ: number;
  details: string;
}

export interface AssessmentResult {
  dimensions: DimensionScore[];
  reliability: ReliabilityResult;
  completedAt: string;
  durationSeconds: number;
  traits?: Array<{ trait: string; score: number }>;
}

/**
 * Tính điểm từng dimension từ DB questions (UUID id).
 * answers: { [questionUUID]: 1-5 }
 * questions: array từ DB (có fields: id, dimensionId, reversed, isLieScale, consistencyGroup)
 */
export function calculateScores(
  answers: Record<string, number>,
  questions: any[],
  startTime: number,
  endTime: number,
  _questionTimestamps: Record<string, number>,
  dbDimensions?: DbDimension[],
): AssessmentResult {
  // 1. Tổng điểm từng dimension
  const dimensionScores: Record<string, { raw: number; count: number }> = {};

  for (const q of questions) {
    if (q.isLieScale) continue;
    const ans = answers[q.id];
    if (ans === undefined || ans === null) continue;

    // Điểm thực = thuận: ans, nghịch: 6 - ans
    const score = q.reversed ? 6 - ans : ans;

    if (!dimensionScores[q.dimensionId]) {
      dimensionScores[q.dimensionId] = { raw: 0, count: 0 };
    }
    dimensionScores[q.dimensionId].raw += score;
    dimensionScores[q.dimensionId].count += 1;
  }

  // 2. Scale sang 1–10  (percentile 0–100 → scaled 1–10)
  // Công thức chuẩn: percentile 0-9% → 1, 10-19% → 2, ..., 90-100% → 10
  const dimList = dbDimensions?.length ? dbDimensions : [];
  const dimensionsScored: DimensionScore[] = dimList.map(dim => {
    const data = dimensionScores[dim.id];

    if (!data || data.count === 0) {
      // Không có câu hỏi nào cho dimension này → giữ nguyên = null (không có dữ liệu)
      return { dimensionId: dim.id, raw: 0, max: 0, scaled: 0, percentile: 0 };
    }

    const minPossible = data.count;     // Tất cả câu = 1
    const maxPossible = data.count * 5; // Tất cả câu = 5
    const range = maxPossible - minPossible;

    // Percentile: vị trí tương đối trong khoảng [0, 100]
    const percentile = range > 0
      ? Math.max(0, Math.min(100, ((data.raw - minPossible) / range) * 100))
      : 50;

    // Scale 1–10: ceil(percentile/10), minimum 1
    const scaled = Math.max(1, Math.min(10, Math.ceil(percentile / 10)));

    return {
      dimensionId: dim.id,
      raw: data.raw,
      max: maxPossible,
      scaled,
      percentile: Math.round(percentile),
    };
  });

  // Rename to avoid shadowing
  const scoredDimensions: DimensionScore[] = dimensionsScored;

  // 3. Lie Scale — các câu isLieScale luôn là forward (càng đồng ý = càng tô vẽ)
  let lieRaw = 0;
  let lieMax = 0;
  for (const q of questions) {
    if (!q.isLieScale) continue;
    const ans = answers[q.id];
    if (ans !== undefined && ans !== null) {
      lieRaw += ans; // Lie scale KHÔNG reversed
      lieMax += 5;
    }
  }
  const lieScore = lieMax > 0 ? Math.round((lieRaw / lieMax) * 100) : 0;

  // 4. Consistency Check — dùng consistencyGroup, không phụ thuộc numeric ID
  // Nhóm questions theo consistencyGroup, tính độ mâu thuẫn giữa các cặp trong nhóm
  const groups: Record<string, any[]> = {};
  for (const q of questions) {
    if (!q.consistencyGroup) continue;
    const ans = answers[q.id];
    if (ans === undefined || ans === null) continue;
    if (!groups[q.consistencyGroup]) groups[q.consistencyGroup] = [];
    groups[q.consistencyGroup].push({ ...q, ans });
  }

  let totalInconsistency = 0;
  let pairsCount = 0;

  for (const group of Object.values(groups)) {
    if (group.length < 2) continue;
    // So sánh tất cả cặp trong nhóm
    for (let i = 0; i < group.length - 1; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const q1 = group[i];
        const q2 = group[j];
        // Effective score sau khi áp dụng reversed
        const v1 = q1.reversed ? 6 - q1.ans : q1.ans;
        const v2 = q2.reversed ? 6 - q2.ans : q2.ans;
        totalInconsistency += Math.abs(v1 - v2);
        pairsCount++;
      }
    }
  }

  // Max inconsistency per pair = 4 (1 vs 5 after reversal)
  const maxInconsistency = pairsCount * 4;
  const consistencyScore = pairsCount > 0
    ? Math.round(100 - (totalInconsistency / maxInconsistency) * 100)
    : 100;
  const inconsistencyRate = 100 - consistencyScore;

  // 5. Speed Check — ngưỡng chuẩn psychometric: < 2.0s/câu là quá nhanh
  const durationSeconds = Math.max(1, Math.round((endTime - startTime) / 1000));
  const totalAnswered = Object.keys(answers).length;
  const avgSecondsPerQ = totalAnswered > 0 ? durationSeconds / totalAnswered : 999;
  const speedFlag = avgSecondsPerQ < 2.0;

  // 6. Reliability Level — ngưỡng chuẩn hóa theo Scouter SS
  let level: ReliabilityLevel = 'high';
  let details = '✅ Kết quả đáng tin cậy. Ứng viên trả lời nghiêm túc và nhất quán.';

  if (speedFlag) {
    level = 'invalid';
    details = `⚠️ Trả lời quá nhanh (${avgSecondsPerQ.toFixed(1)}s/câu, chuẩn tối thiểu 2.0s). Kết quả không đáng tin cậy — cần làm lại.`;
  } else if (lieScore > 80 || inconsistencyRate > 40) {
    level = 'invalid';
    details = '❌ Phát hiện mức độ tô vẽ bản thân quá cao hoặc trả lời mâu thuẫn nghiêm trọng. Cần phỏng vấn lại để xác minh.';
  } else if (lieScore > 65 || inconsistencyRate > 30) {
    level = 'low';
    details = '⚠️ Có dấu hiệu muốn tạo ấn tượng tốt hoặc trả lời chưa nhất quán. HR cần xác minh thêm trong phỏng vấn.';
  } else if (lieScore > 50 || inconsistencyRate > 15) {
    level = 'medium';
    details = '🟡 Kết quả tương đối đáng tin cậy. Một số điểm cần xác nhận thêm — xem xét trong phỏng vấn.';
  }

  return {
    dimensions: scoredDimensions,
    reliability: { level, lieScore, consistencyScore, speedFlag, avgSecondsPerQ, details },
    completedAt: new Date().toISOString(),
    durationSeconds,
  };
}

/**
 * Diễn giải điểm theo 5 mức — chuẩn hóa với DIMENSIONS.descLow / descHigh
 */
export function getInterpretation(dimId: string, scaled: number, dbDimensions?: DbDimension[]): string {
  const dim = dbDimensions?.find(d => d.id === dimId);
  if (!dim) return '';

  if (scaled === 0) return 'Không có dữ liệu cho chiều đánh giá này.';
  if (scaled <= 2) return dim.descLow;
  if (scaled <= 4) {
    const lowSnippet = dim.descLow.split('.')[0].toLowerCase();
    return `Hơi thiên về: ${lowSnippet}. Vẫn có khả năng ở phía kia tùy ngữ cảnh.`;
  }
  if (scaled <= 6) {
    const highSnippet = dim.descHigh.split(',')[0].toLowerCase();
    return `Cân bằng — có khả năng ${highSnippet} nhưng không nổi bật. Phù hợp nhiều môi trường.`;
  }
  if (scaled <= 8) {
    const highSnippet = dim.descHigh.split('.')[0].toLowerCase();
    return `Thiên rõ về: ${highSnippet}. Biểu hiện tích cực trong phần lớn tình huống.`;
  }
  return dim.descHigh;
}

/** Top 3 điểm mạnh (chỉ lấy dimensions có dữ liệu) */
export function getTopStrengths(dimensions: DimensionScore[]): DimensionScore[] {
  return [...dimensions]
    .filter(d => d.scaled > 0 && d.dimensionId !== 'lie_scale')
    .sort((a, b) => b.scaled - a.scaled)
    .slice(0, 3);
}

/** Top 2 điểm cần cải thiện (chỉ lấy dimensions có dữ liệu) */
export function getTopWeaknesses(dimensions: DimensionScore[]): DimensionScore[] {
  return [...dimensions]
    .filter(d => d.scaled > 0 && d.dimensionId !== 'lie_scale')
    .sort((a, b) => a.scaled - b.scaled)
    .slice(0, 2);
}

/**
 * Gợi ý vị trí phù hợp — chỉ chạy khi reliability đủ tin cậy
 */
export function getSuitableRoles(
  dimensions: DimensionScore[],
  reliability?: ReliabilityResult,
): string[] {
  if (reliability && (reliability.level === 'invalid' || reliability.level === 'low')) {
    return ['⚠️ Không thể đề xuất vị trí do kết quả chưa đủ độ tin cậy. Cần phỏng vấn trực tiếp để xác định.'];
  }

  const get = (id: string) => {
    const d = dimensions.find(x => x.dimensionId === id);
    return d && d.scaled > 0 ? d.scaled : 5; // 5 nếu không có dữ liệu
  };

  const roles: string[] = [];

  if (get('extraversion') >= 7 && get('agreeableness') >= 7) roles.push('Sales / Business Development');
  if (get('logical_thinking') >= 7 && get('conscientiousness') >= 7) roles.push('Kỹ thuật / Lập trình / Phân tích');
  if (get('empathy') >= 7 && get('agreeableness') >= 7) roles.push('Chăm sóc khách hàng / HR / Đào tạo');
  if (get('openness') >= 7 && get('challenge_spirit') >= 7) roles.push('R&D / Sản phẩm / Thiết kế sáng tạo');
  if (get('conscientiousness') >= 8 && get('caution') >= 7) roles.push('Kế toán / Kiểm soát nội bộ / QA');
  if (get('autonomy') >= 7 && get('achievement_drive') >= 7) roles.push('Quản lý dự án / Team Lead');
  if (get('social_contribution') >= 7 && get('empathy') >= 7) roles.push('Công tác xã hội / ESG / CSR');
  if (get('stress_mental') >= 7 && get('stress_physical') >= 7) roles.push('Vị trí áp lực cao / Môi trường tốc độ nhanh');

  return roles.length > 0
    ? roles.slice(0, 4)
    : ['Phù hợp nhiều vị trí — cần phỏng vấn thêm để xác định rõ hướng phát triển'];
}
