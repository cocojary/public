// ============================================================
// NORMING ENGINE — Chuẩn hóa điểm theo nhóm nội bộ
// So sánh cá nhân với trung bình công ty / phòng ban / vị trí
// ============================================================

import type { DimensionScore } from '../data/scoring';
import type { AssessmentRecord } from '@/types';

export interface NormedScore {
  dimensionId: string;
  scaled: number;         // điểm gốc 1-10
  zScore: number;         // điểm chuẩn hóa
  percentileRank: number; // 0-100 (% người đạt thấp hơn)
  label: 'Cao hơn nhóm' | 'Tương đương' | 'Thấp hơn nhóm' | 'Thiếu dữ liệu';
  diff: number;           // khác biệt so với trung bình nhóm (+/-)
}

export interface GroupNorm {
  groupLabel: string;     // "Kỹ thuật / IT" / "Toàn công ty"
  sampleSize: number;
  means: Record<string, number>;   // dimensionId → mean
  stDevs: Record<string, number>;  // dimensionId → stDev
}

// ─── Tính chuẩn nhóm từ danh sách records ───────────────────
export function buildGroupNorm(records: AssessmentRecord[], label: string): GroupNorm {
  const sums: Record<string, number[]> = {};

  for (const rec of records) {
    for (const dim of rec.result.dimensions) {
      if (!sums[dim.dimensionId]) sums[dim.dimensionId] = [];
      sums[dim.dimensionId].push(dim.scaled);
    }
  }

  const means: Record<string, number> = {};
  const stDevs: Record<string, number> = {};

  for (const [id, vals] of Object.entries(sums)) {
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
    means[id] = Math.round(mean * 100) / 100;
    stDevs[id] = Math.round(Math.sqrt(variance) * 100) / 100;
  }

  return { groupLabel: label, sampleSize: records.length, means, stDevs };
}

// ─── Tính điểm chuẩn hóa cho một nhân viên ──────────────────
export function normalizeDimensions(
  dimensions: DimensionScore[],
  norm: GroupNorm,
): NormedScore[] {
  return dimensions.map(d => {
    const mean = norm.means[d.dimensionId];
    const std = norm.stDevs[d.dimensionId];

    if (mean === undefined || norm.sampleSize < 3) {
      return {
        dimensionId: d.dimensionId,
        scaled: d.scaled,
        zScore: 0,
        percentileRank: 50,
        label: 'Thiếu dữ liệu',
        diff: 0,
      };
    }

    const diff = Math.round((d.scaled - mean) * 10) / 10;
    const zScore = std > 0 ? Math.round((d.scaled - mean) / std * 100) / 100 : 0;

    // Xấp xỉ percentile từ z-score (dùng công thức đơn giản)
    const percentileRank = Math.round(normalCDF(zScore) * 100);

    let label: NormedScore['label'] = 'Tương đương';
    if (diff > 1.5) label = 'Cao hơn nhóm';
    else if (diff < -1.5) label = 'Thấp hơn nhóm';

    return { dimensionId: d.dimensionId, scaled: d.scaled, zScore, percentileRank, diff, label };
  });
}

/** Xấp xỉ Normal CDF (0-1) */
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2315419 * Math.abs(z));
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const cdf = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly;
  return z >= 0 ? cdf : 1 - cdf;
}

// ─── Benchmark profiles (mặc định nếu chưa đủ data thực) ────
// Dựa trên nghiên cứu Big Five cho ngành IT/Tech
export const BENCHMARK_PROFILES: Record<string, Record<string, number>> = {
  'Kỹ thuật / IT': {
    extraversion: 4.5, agreeableness: 6.0, conscientiousness: 7.0,
    openness: 7.5, emotional_stability: 6.5, achievement_drive: 7.0,
    challenge_spirit: 7.0, autonomy: 7.5, learning_curiosity: 8.0,
    recognition_need: 4.5, logical_thinking: 8.0, empathy: 5.5,
    execution_speed: 6.0, caution: 7.0, growth_orientation: 7.5,
    stability_orientation: 5.5, social_contribution: 6.0,
    stress_mental: 6.0, stress_physical: 6.0,
  },
  'Kinh doanh / Sales': {
    extraversion: 8.0, agreeableness: 7.0, conscientiousness: 6.5,
    openness: 6.5, emotional_stability: 7.0, achievement_drive: 8.5,
    challenge_spirit: 8.0, autonomy: 6.5, learning_curiosity: 6.5,
    recognition_need: 7.5, logical_thinking: 6.0, empathy: 7.5,
    execution_speed: 8.0, caution: 5.0, growth_orientation: 7.5,
    stability_orientation: 4.5, social_contribution: 6.5,
    stress_mental: 7.0, stress_physical: 7.5,
  },
  'HR / Nhân sự': {
    extraversion: 6.5, agreeableness: 8.5, conscientiousness: 7.0,
    openness: 6.5, emotional_stability: 7.0, achievement_drive: 6.0,
    challenge_spirit: 5.5, autonomy: 5.5, learning_curiosity: 7.0,
    recognition_need: 6.0, logical_thinking: 6.5, empathy: 8.5,
    execution_speed: 6.0, caution: 7.0, growth_orientation: 7.0,
    stability_orientation: 6.5, social_contribution: 8.0,
    stress_mental: 7.0, stress_physical: 5.5,
  },
  'Quản lý cấp cao': {
    extraversion: 7.5, agreeableness: 7.0, conscientiousness: 7.5,
    openness: 7.5, emotional_stability: 8.0, achievement_drive: 8.5,
    challenge_spirit: 7.5, autonomy: 8.5, learning_curiosity: 7.5,
    recognition_need: 6.5, logical_thinking: 8.0, empathy: 7.5,
    execution_speed: 7.5, caution: 6.5, growth_orientation: 8.0,
    stability_orientation: 5.0, social_contribution: 7.5,
    stress_mental: 8.0, stress_physical: 7.5,
  },
};

// ─── So sánh với benchmark cố định ──────────────────────────
export function compareWithBenchmark(
  dimensions: DimensionScore[],
  department: string,
): { dimId: string; actual: number; benchmark: number; diff: number; status: 'above' | 'match' | 'below' }[] {
  const profile = BENCHMARK_PROFILES[department] ?? BENCHMARK_PROFILES['Kỹ thuật / IT'];
  return dimensions.map(d => {
    const benchmark = profile[d.dimensionId] ?? 5;
    const diff = Math.round((d.scaled - benchmark) * 10) / 10;
    return {
      dimId: d.dimensionId,
      actual: d.scaled,
      benchmark,
      diff,
      status: diff > 1 ? 'above' : diff < -1 ? 'below' : 'match',
    };
  });
}
