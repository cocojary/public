// ============================================================
// UNIFIED SCORING ENGINE — Techzen SPI V4.1
// Thay thế scoring.ts (V2) + devScoring.ts (V3)
// Một engine duy nhất cho tất cả vị trí.
//
// Input:  answers (UUID → 1-5) + questions từ DB
// Output: UnifiedScoringResult — 20 dimensions + 8 quality metrics
//
// [v4.1] Continuous scoring — scaledContinuous (1.0-10.0)
// [v4.1] Weighted reliability score (0-100) thay vì đếm Risk/Warning cứng
// [v4.1] 4-tier reliability: reliable | mostly-reliable | use-with-caution | low-interpretability
// [v4.1] Penalty được tách khỏi dimension scores — chỉ áp vào interpretationConfidence
// ============================================================

import { DIMENSIONS } from '@/features/assessment/data/dimensions';

// ── Kiểu dữ liệu đầu ra ──────────────────────────────────────

export interface QualityMetric {
  score: number | string;
  status: 'Ok' | 'Warning' | 'Risk';
  message: string;
}

export interface UnifiedDimensionScore {
  dimensionId: string;
  raw: number;              // Tổng điểm thô (sau đảo chiều)
  count: number;            // Số câu đã trả lời
  scaled: number;           // Thang 1–10 (integer, dùng cho UI display — backward compat)
  scaledContinuous: number; // Thang 1.0–10.0 (float, dùng cho tính toán SMA/Persona nội bộ)
  percentile: number;       // 0–100 (vị trí trong khoảng min–max)
}

export interface UnifiedScoringResult {
  type: 'SPI_UNIFIED_V4';
  dimensions: UnifiedDimensionScore[];
  dataQuality: {
    lieScale:         QualityMetric;
    consistency:      QualityMetric; // So sánh forward vs reversed avg
    neutralBias:      QualityMetric; // Tỉ lệ câu trả lời "3"
    timeTracking:     QualityMetric;
    patternDetection: QualityMetric; // Straight-lining / Zig-zac
    acquiescenceBias: QualityMetric; // Yes-saying / Nay-saying bias
    extremeResponder: QualityMetric; // Tỉ lệ chọn điểm cực (1 hoặc 5)
    quickAnswers:     QualityMetric; // Số câu trả lời dưới 2 giây
  };
  // [v4.1] Weighted score 0-100 (0 = tệ nhất, 100 = tốt nhất)
  reliabilityScore: number;
  // [v4.1] 4-tier thay vì 3-tier cũ
  // 'reliable'              → Không cần lưu ý
  // 'mostly-reliable'       → Có 1-2 cảnh báo nhỏ, kết quả vẫn tham khảo tốt
  // 'use-with-caution'      → Có vấn đề đáng kể, cần xác minh phỏng vấn
  // 'low-interpretability'  → Dữ liệu quá nhiễu, diễn giải không đáng tin
  reliabilityLevel: 'reliable' | 'mostly-reliable' | 'use-with-caution' | 'low-interpretability';
  // [v4.1] Penalty nhẹ hơn — chỉ áp vào Combat Power display, không làm hỏng dimension scores
  penaltyMultiplier: number;
  // [v4.1] Confidence của phần diễn giải (Persona, Duty Suitability, Risk)
  interpretationConfidence: 'high' | 'medium' | 'low';
  interpretationCaveat: string; // Cảnh báo hiển thị trong UI cho phần Tầng 3
}

// ── Hàm trợ giúp ─────────────────────────────────────────────

/** Xấp xỉ Normal CDF từ z-score */
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2315419 * Math.abs(z));
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const cdf = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly;
  return z >= 0 ? cdf : 1 - cdf;
}

// ── Engine chính ─────────────────────────────────────────────

/**
 * Tính điểm thống nhất V4 cho một lần đánh giá.
 *
 * @param answers  Map từ questionId (UUID) → giá trị 1–5
 * @param questions Danh sách câu hỏi từ DB (có id, dimensionId, reversed, isLieScale)
 * @param startTime  Unix timestamp ms (bắt đầu)
 * @param endTime    Unix timestamp ms (kết thúc)
 */
export function calculateUnifiedScores(
  answers: Record<string, number>,
  questions: Array<{
    id: string;
    dimensionId: string;
    reversed: boolean;
    isLieScale?: boolean;
  }>,
  startTime: number,
  endTime: number,
  answerTimes?: Record<string, number>, // questionId → ms để trả lời
): UnifiedScoringResult {
  const durationSeconds = (endTime - startTime) / 1000;
  const totalAnswered = Object.keys(answers).length;

  // 1. Gom điểm theo dimension + tách forward/reversed cho consistency check
  const dimData: Record<string, {
    rawSum: number;
    count: number;
    posSum: number; posCount: number;   // forward
    negSum: number; negCount: number;   // reversed (after inversion)
  }> = {};

  let neutralCount = 0; // Câu trả lời "3"
  let lieCount = 0;     // Lie scale: trả lời 4 hoặc 5

  // Mảng thứ tự câu trả lời để detect pattern
  const orderedValues: number[] = [];

  for (const q of questions) {
    const ans = answers[q.id];
    if (ans === undefined || ans === null) continue;

    if (ans === 3) neutralCount++;

    if (q.isLieScale) {
      if (ans >= 4) lieCount++;
      continue; // Không tính vào dimension
    }

    const scored = q.reversed ? 6 - ans : ans;
    orderedValues.push(ans); // Thứ tự gốc để detect pattern

    if (!dimData[q.dimensionId]) {
      dimData[q.dimensionId] = { rawSum: 0, count: 0, posSum: 0, posCount: 0, negSum: 0, negCount: 0 };
    }

    dimData[q.dimensionId].rawSum += scored;
    dimData[q.dimensionId].count += 1;

    if (q.reversed) {
      dimData[q.dimensionId].negSum += scored;
      dimData[q.dimensionId].negCount += 1;
    } else {
      dimData[q.dimensionId].posSum += scored;
      dimData[q.dimensionId].posCount += 1;
    }
  }

  // 2. Tính scaled 1–10 cho từng dimension (dùng percentile nội bộ)
  const activeDimIds = DIMENSIONS.filter(d => d.group !== 'leadership').map(d => d.id);

  const dimensions: UnifiedDimensionScore[] = activeDimIds.map(dimId => {
    const data = dimData[dimId];

    if (!data || data.count === 0) {
      return { dimensionId: dimId, raw: 0, count: 0, scaled: 0, scaledContinuous: 0, percentile: 0 };
    }

    const minPossible = data.count;       // Tất cả = 1
    const maxPossible = data.count * 5;   // Tất cả = 5
    const range = maxPossible - minPossible;

    const percentile = range > 0
      ? Math.max(0, Math.min(100, ((data.rawSum - minPossible) / range) * 100))
      : 50;

    // [v4.1] scaledContinuous: 1.0–10.0 — giữ đầy đủ thông tin, dùng cho tính toán nội bộ
    const scaledContinuous = Math.round((1 + (percentile / 100) * 9) * 100) / 100;

    // scaled: 1–10 integer — backward compat, chỉ dùng cho UI display
    const scaled = Math.min(10, Math.max(1, Math.floor(percentile / 10) + 1));

    return {
      dimensionId: dimId,
      raw: data.rawSum,
      count: data.count,
      scaled,
      scaledContinuous,
      percentile: Math.round(percentile),
    };
  });

  // 3. Data Quality Metrics (kế thừa V3 — 5 chỉ số)

  // 3.1 Lie Scale
  const lieMetric: QualityMetric = {
    score: lieCount,
    status: lieCount >= 7 ? 'Risk' : lieCount >= 4 ? 'Warning' : 'Ok',
    message:
      lieCount >= 7 ? 'Dấu hiệu tô hồng hồ sơ quá mức. Cần phỏng vấn xác minh trực tiếp.' :
      lieCount >= 4 ? 'Có thiên kiến phản hồi tích cực. Kết quả cần thận trọng.' :
      'Phản hồi trong ngưỡng trung thực.',
  };

  // 3.2 Consistency: so sánh avg forward vs avg reversed (V3 approach)
  let consistencyIssueCount = 0;
  for (const dimId of activeDimIds) {
    const data = dimData[dimId];
    if (!data) continue;
    if (data.posCount > 0 && data.negCount > 0) {
      const avgPos = data.posSum / data.posCount;
      const avgNeg = data.negSum / data.negCount;
      if (Math.abs(avgPos - avgNeg) > 1.5) consistencyIssueCount++;
    }
  }
  const consistencyMetric: QualityMetric = {
    score: `${consistencyIssueCount} nhóm mâu thuẫn`,
    status: consistencyIssueCount >= 5 ? 'Risk' : consistencyIssueCount >= 3 ? 'Warning' : 'Ok',
    message:
      consistencyIssueCount >= 5 ? 'Mâu thuẫn logic lớn giữa các câu hỏi thuận/nghịch. Kết quả không đáng tin.' :
      consistencyIssueCount >= 3 ? 'Một số nhóm có câu trả lời thiếu nhất quán.' :
      'Trả lời nhất quán, đáng tin cậy.',
  };

  // 3.3 Neutral Bias: tỉ lệ trả lời "3"
  const neutralRatio = totalAnswered > 0 ? neutralCount / totalAnswered : 0;
  const neutralMetric: QualityMetric = {
    score: `${Math.round(neutralRatio * 100)}%`,
    status: neutralRatio > 0.5 ? 'Risk' : neutralRatio > 0.3 ? 'Warning' : 'Ok',
    message:
      neutralRatio > 0.5 ? 'Quá nhiều câu trả lời trung lập — kết quả mất ý nghĩa phân loại.' :
      neutralRatio > 0.3 ? 'Xu hướng né tránh bộc lộ quan điểm rõ ràng.' :
      'Sẵn sàng biểu đạt quan điểm.',
  };

  // 3.4 Time Tracking — ngưỡng tính động theo số câu chính (không tính lie)
  const mainQCount    = questions.filter(q => !q.isLieScale).length;
  const minRiskSec    = mainQCount * 3; // 3s/câu — chỉ đủ lướt mắt qua
  const minWarnSec    = mainQCount * 5; // 5s/câu — đọc và suy nghĩ tối thiểu
  const timeMetric: QualityMetric = {
    score: `${Math.round(durationSeconds)} giây`,
    status: durationSeconds < minRiskSec ? 'Risk' : durationSeconds < minWarnSec ? 'Warning' : 'Ok',
    message:
      durationSeconds < minRiskSec
        ? `Làm bài quá nhanh (${Math.round(durationSeconds)}s / ${mainQCount} câu chính) — không đủ thời gian đọc hiểu.`
      : durationSeconds < minWarnSec
        ? 'Tốc độ làm bài nhanh hơn trung bình.'
      : 'Thời gian làm bài hợp lý.',
  };

  // 3.5 Pattern Detection: Straight-lining (cùng giá trị liên tiếp) / Zig-zac (1-5-1-5)
  let maxConsecutive = 1, currentConsecutive = 1;
  let maxZigzac = 1, currentZigzac = 1;

  for (let i = 1; i < orderedValues.length; i++) {
    // Straight-lining
    if (orderedValues[i] === orderedValues[i - 1]) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 1;
    }
    // Zig-zac (A-B-A pattern)
    if (i >= 2 &&
        orderedValues[i] === orderedValues[i - 2] &&
        orderedValues[i] !== orderedValues[i - 1]) {
      currentZigzac++;
      maxZigzac = Math.max(maxZigzac, currentZigzac);
    } else {
      currentZigzac = 1;
    }
  }

  const maxPattern = Math.max(maxConsecutive, maxZigzac);
  const patternMetric: QualityMetric = {
    score: `Max ${maxPattern} câu liên tiếp`,
    status: maxPattern >= 10 ? 'Risk' : maxPattern >= 7 ? 'Warning' : 'Ok',
    message:
      maxPattern >= 10 ? 'Phát hiện khuôn mẫu trả lời giả lập (straight-lining/zig-zac).' :
      maxPattern >= 7  ? 'Có dấu hiệu trả lời theo khuôn mẫu — kiểm tra thêm.' :
      'Khuôn mẫu phản hồi tự nhiên.',
  };

  // 3.6 Acquiescence Bias: xu hướng đồng ý / phủ nhận tất cả (raw answers trước đảo chiều)
  const rawMean = orderedValues.length > 0
    ? orderedValues.reduce((a, b) => a + b, 0) / orderedValues.length
    : 3;
  const acquiescenceMetric: QualityMetric = {
    score: rawMean.toFixed(2),
    status:
      rawMean > 4.2 || rawMean < 1.8 ? 'Risk' :
      rawMean > 3.8 || rawMean < 2.2 ? 'Warning' : 'Ok',
    message:
      rawMean > 4.2 ? 'Cực đoan đồng ý (yes-saying) — câu trả lời mất khả năng phân biệt năng lực.' :
      rawMean > 3.8 ? 'Xu hướng đồng ý với hầu hết phát biểu bất kể nội dung.' :
      rawMean < 1.8 ? 'Cực đoan phủ nhận (nay-saying) — cố tình đánh thấp hoặc không hợp tác.' :
      rawMean < 2.2 ? 'Xu hướng phủ nhận hầu hết phát biểu.' :
      'Phân phối phản hồi cân bằng.',
  };

  // 3.7 Extreme Responder: tỉ lệ chọn điểm cực 1 hoặc 5
  const extremeCount = orderedValues.filter(v => v === 1 || v === 5).length;
  const extremeRatio  = orderedValues.length > 0 ? extremeCount / orderedValues.length : 0;
  const extremeMetric: QualityMetric = {
    score: `${Math.round(extremeRatio * 100)}%`,
    status: extremeRatio > 0.9 ? 'Risk' : extremeRatio > 0.75 ? 'Warning' : 'Ok',
    message:
      extremeRatio > 0.9 ? 'Gần như chỉ chọn điểm cực (1 hoặc 5) — không có biến thiên tự nhiên, kết quả vô nghĩa.' :
      extremeRatio > 0.75 ? 'Tỉ lệ điểm cực cao — phản hồi có thể không phản ánh thực tế.' :
      'Biên độ phản hồi tự nhiên.',
  };

  // 3.8 Quick Answers: câu trả lời dưới 2 giây
  const quickEntries   = answerTimes ? Object.entries(answerTimes) : [];
  const quickCount     = quickEntries.filter(([, t]) => t < 2000).length;
  const quickTotal     = quickEntries.length > 0 ? quickEntries.length : totalAnswered;
  const quickRatio     = quickTotal > 0 ? quickCount / quickTotal : 0;
  const quickMetric: QualityMetric = {
    score: answerTimes ? `${quickCount}/${quickTotal} câu` : 'N/A',
    status: !answerTimes ? 'Ok' : quickRatio > 0.4 ? 'Risk' : quickRatio > 0.2 ? 'Warning' : 'Ok',
    message:
      !answerTimes
        ? 'Không có dữ liệu thời gian từng câu.' :
      quickRatio > 0.4
        ? `${Math.round(quickRatio * 100)}% câu trả lời dưới 2 giây — không đủ thời gian đọc hiểu nội dung.` :
      quickRatio > 0.2
        ? `${Math.round(quickRatio * 100)}% câu trả lời dưới 2 giây — có dấu hiệu làm vội một số phần.` :
      'Thời gian phản hồi từng câu hợp lý.',
  };

  // ── 4. [v4.1] Weighted Reliability Score (0–100) ──────────────────────────
  // Mỗi chỉ số có trọng số riêng phản ánh tầm quan trọng thực sự.
  // Lie Scale + Consistency chiếm weight cao nhất vì chúng chủ động nhất.
  // Time + Quick Answers weight thấp vì có thể do phong cách đọc nhanh tự nhiên.
  const RELIABILITY_WEIGHTS = {
    lieScale:         0.30, // Chủ động gian lận → weight cao nhất
    consistency:      0.25, // Mâu thuẫn logic → rất đáng ngờ
    patternDetection: 0.15, // Đánh máy khuôn mẫu → đáng kể
    neutralBias:      0.10, // Ba phải → giảm tính phân loại
    acquiescenceBias: 0.10, // Đồng ý/phủ nhận cực đoan
    timeTracking:     0.05, // Đọc nhanh tự nhiên → weight thấp
    extremeResponder: 0.03, // Ít phổ biến hơn
    quickAnswers:     0.02, // Weight thấp nhất — thiếu data
  };

  // Hàm chuyển QualityMetric status → penalty score (0 = bình thường, 1 = tệ nhất)
  const statusToPenalty = (m: QualityMetric): number => {
    if (m.status === 'Risk')    return 1.0;
    if (m.status === 'Warning') return 0.4;
    return 0.0;
  };

  const weightedPenalty =
    statusToPenalty(lieMetric)         * RELIABILITY_WEIGHTS.lieScale +
    statusToPenalty(consistencyMetric) * RELIABILITY_WEIGHTS.consistency +
    statusToPenalty(patternMetric)     * RELIABILITY_WEIGHTS.patternDetection +
    statusToPenalty(neutralMetric)     * RELIABILITY_WEIGHTS.neutralBias +
    statusToPenalty(acquiescenceMetric)* RELIABILITY_WEIGHTS.acquiescenceBias +
    statusToPenalty(timeMetric)        * RELIABILITY_WEIGHTS.timeTracking +
    statusToPenalty(extremeMetric)     * RELIABILITY_WEIGHTS.extremeResponder +
    statusToPenalty(quickMetric)       * RELIABILITY_WEIGHTS.quickAnswers;

  // reliabilityScore: 0 = tệ nhất, 100 = tốt nhất
  const reliabilityScore = Math.round(Math.max(0, Math.min(100, (1 - weightedPenalty) * 100)));

  // [v4.1] 4-tier dựa trên reliabilityScore thay vì đếm Risk/Warning cứng
  let reliabilityLevel: UnifiedScoringResult['reliabilityLevel'];
  if (reliabilityScore >= 80)      reliabilityLevel = 'reliable';
  else if (reliabilityScore >= 60) reliabilityLevel = 'mostly-reliable';
  else if (reliabilityScore >= 35) reliabilityLevel = 'use-with-caution';
  else                             reliabilityLevel = 'low-interpretability';

  // [v4.1] Penalty nhẹ hơn — giảm tác động cực đoan trên Combat Power
  // Dimension scores KHÔNG bị ảnh hưởng, chỉ Combat Power display bị điều chỉnh nhẹ
  let penaltyMultiplier = 1.0;
  if      (reliabilityLevel === 'low-interpretability') penaltyMultiplier = 0.88;
  else if (reliabilityLevel === 'use-with-caution')     penaltyMultiplier = 0.94;
  else if (reliabilityLevel === 'mostly-reliable')      penaltyMultiplier = 0.97;
  // reliable → 1.0 (không phạt)

  // [v4.1] Confidence của tầng Diễn giải (Persona, Duty, Risk Warnings)
  let interpretationConfidence: UnifiedScoringResult['interpretationConfidence'];
  let interpretationCaveat: string;
  if (reliabilityScore >= 75) {
    interpretationConfidence = 'high';
    interpretationCaveat = '';
  } else if (reliabilityScore >= 50) {
    interpretationConfidence = 'medium';
    interpretationCaveat = '💡 Các diễn giải dưới đây ở mức tham khảo — có một số dấu hiệu thiếu nhất quán trong bài làm.';
  } else {
    interpretationConfidence = 'low';
    interpretationCaveat = '⚠️ Độ tin cậy thấp — dữ liệu bài làm có nhiều bất thường. Các diễn giải chỉ mang tính chất tham khảo. Khuyến nghị xác minh qua phỏng vấn trực tiếp.';
  }

  return {
    type: 'SPI_UNIFIED_V4',
    dimensions,
    dataQuality: {
      lieScale:         lieMetric,
      consistency:      consistencyMetric,
      neutralBias:      neutralMetric,
      timeTracking:     timeMetric,
      patternDetection: patternMetric,
      acquiescenceBias: acquiescenceMetric,
      extremeResponder: extremeMetric,
      quickAnswers:     quickMetric,
    },
    reliabilityScore,
    reliabilityLevel,
    penaltyMultiplier,
    interpretationConfidence,
    interpretationCaveat,
  };
}

// ── Adapter: chuyển UnifiedScoringResult → format AssessmentResult ──────────
// Dùng để tương thích với các hàm cũ (aiAnalysis, buildUnifiedFromV2, etc.)
export function adaptToAssessmentResult(result: UnifiedScoringResult) {
  const lieScoreNormalized = (() => {
    const m = result.dataQuality.lieScale;
    const count = typeof m.score === 'number' ? m.score : 0;
    return Math.min(100, count * 12.5); // 0–8 lie answers → 0–100
  })();

  const consistencyScore = (() => {
    if (result.dataQuality.consistency.status === 'Ok') return 90;
    if (result.dataQuality.consistency.status === 'Warning') return 65;
    return 35;
  })();

  // [v4.1] Backward compat: map 4-tier mới → 3-tier cũ cho các component legacy
  const legacyLevel =
    result.reliabilityLevel === 'reliable'            ? 'high' :
    result.reliabilityLevel === 'mostly-reliable'     ? 'high' :   // mostly-reliable → high (không cần cảnh báo mạnh)
    result.reliabilityLevel === 'use-with-caution'    ? 'medium' :
    'low'; // low-interpretability → low

  const legacyReliabilityNote =
    result.reliabilityLevel === 'low-interpretability'
      ? '⚠️ Kết quả không đáng tin cậy — cần phỏng vấn trực tiếp xác minh.'
    : result.reliabilityLevel === 'use-with-caution'
      ? `🟡 Kết quả cần thận trọng khi diễn giải (điểm tin cậy: ${result.reliabilityScore}/100).`
    : result.reliabilityLevel === 'mostly-reliable'
      ? `✅ Kết quả đáng tin cậy (điểm tin cậy: ${result.reliabilityScore}/100 — có một số lưu ý nhỏ).`
      : `✅ Kết quả đáng tin cậy (điểm tin cậy: ${result.reliabilityScore}/100).`;

  return {
    dimensions: result.dimensions.map(d => ({
      dimensionId: d.dimensionId,
      raw: d.raw,
      max: d.count * 5,
      scaled: d.scaled,
      scaledContinuous: d.scaledContinuous, // [v4.1] expose cho các hàm downstream
      percentile: d.percentile,
    })),
    reliability: {
      level: legacyLevel,
      lieScore: lieScoreNormalized,
      consistencyScore,
      speedFlag: result.dataQuality.timeTracking.status === 'Risk',
      avgSecondsPerQ: 0,
      details: legacyReliabilityNote,
      // [v4.1] Thêm các field mới để phần diễn giải downstream có thể đọc
      reliabilityScore: result.reliabilityScore,
      reliabilityLevel: result.reliabilityLevel,
      interpretationConfidence: result.interpretationConfidence,
      interpretationCaveat: result.interpretationCaveat,
    },
    completedAt: new Date().toISOString(),
    durationSeconds: 0,
  };
}
