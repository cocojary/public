"use server";

import prisma from "@/server/db";

export interface DimensionDistribution {
  dimensionId: string;
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  count: number;
  cronbachAlpha: number | null; // null nếu không đủ dữ liệu
}

export interface ValidationReport {
  totalRecords: number;
  reliabilityDistribution: Record<string, number>;
  lieScoreDistribution: { range: string; count: number }[];
  dimensionStats: DimensionDistribution[];
  avgDurationSeconds: number;
  speedAnomalyRate: number;
  generatedAt: string;
}

/**
 * Tính Cronbach's Alpha cho một nhóm items (scores đã standardized)
 * alpha = (k/(k-1)) * (1 - sum(variance_i) / variance_total)
 */
function calcCronbachAlpha(itemScores: number[][]): number | null {
  const k = itemScores.length;  // số items
  if (k < 2) return null;

  const n = itemScores[0].length; // số người
  if (n < 3) return null;

  // Tổng điểm mỗi người (summed scores)
  const personTotals = Array.from({ length: n }, (_, i) =>
    itemScores.reduce((sum, item) => sum + item[i], 0)
  );

  const varTotal = variance(personTotals);
  if (varTotal === 0) return null;

  const sumItemVar = itemScores.reduce((sum, item) => sum + variance(item), 0);

  const alpha = (k / (k - 1)) * (1 - sumItemVar / varTotal);
  return Math.round(Math.max(-1, Math.min(1, alpha)) * 100) / 100;
}

function mean(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

function variance(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
}

function stdDev(arr: number[]): number {
  return Math.sqrt(variance(arr));
}

export async function getValidationReport(): Promise<ValidationReport> {
  // Lấy tối đa 500 records gần nhất để phân tích
  const records = await prisma.assessmentRecord.findMany({
    take: 500,
    orderBy: { assessmentDate: 'desc' },
    select: { resultData: true },
  });

  if (records.length === 0) {
    return {
      totalRecords: 0,
      reliabilityDistribution: {},
      lieScoreDistribution: [],
      dimensionStats: [],
      avgDurationSeconds: 0,
      speedAnomalyRate: 0,
      generatedAt: new Date().toISOString(),
    };
  }

  const results = records
    .map(r => r.resultData as any)
    .filter(r => r?.dimensions && r?.reliability);

  // 1. Phân phối độ tin cậy
  const reliabilityDistribution: Record<string, number> = {};
  for (const r of results) {
    const level = r.reliability?.level ?? 'unknown';
    reliabilityDistribution[level] = (reliabilityDistribution[level] ?? 0) + 1;
  }

  // 2. Phân phối Lie Score
  const lieRanges = ['0-20', '21-40', '41-60', '61-80', '81-100'];
  const lieDistribution = lieRanges.map(range => {
    const [lo, hi] = range.split('-').map(Number);
    return {
      range,
      count: results.filter(r => {
        const s = r.reliability?.lieScore ?? 0;
        return s >= lo && s <= hi;
      }).length,
    };
  });

  // 3. Thống kê từng dimension + Cronbach's Alpha ước tính
  // Cronbach's alpha ở đây tính từ scaled scores (proxy, không phải item-level)
  // Item-level cần raw answers — đây là group-level approximation
  const allDimIds = [...new Set(
    results.flatMap(r => (r.dimensions as any[]).map((d: any) => d.dimensionId))
  )];

  const dimensionStats: DimensionDistribution[] = allDimIds.map(dimId => {
    const scores = results
      .flatMap(r => r.dimensions as any[])
      .filter((d: any) => d.dimensionId === dimId && d.scaled > 0)
      .map((d: any) => d.scaled as number);

    if (scores.length < 3) {
      return { dimensionId: dimId, mean: 0, stdDev: 0, min: 0, max: 0, count: scores.length, cronbachAlpha: null };
    }

    return {
      dimensionId: dimId,
      mean: Math.round(mean(scores) * 10) / 10,
      stdDev: Math.round(stdDev(scores) * 100) / 100,
      min: Math.min(...scores),
      max: Math.max(...scores),
      count: scores.length,
      cronbachAlpha: null, // Cần item-level data, xem note bên dưới
    };
  });

  // Cronbach's Alpha cần item-level responses — tính từ DB answers
  // Lấy tối đa 100 records có đủ data để tính alpha
  const recordsWithAnswers = await prisma.assessmentRecord.findMany({
    take: 100,
    orderBy: { assessmentDate: 'desc' },
    select: { answers: true, questionSetId: true },
  });

  // Group theo questionSetId để align câu hỏi
  const setGroups: Record<string, { answers: Record<string, number>[] }> = {};
  for (const rec of recordsWithAnswers) {
    const answers = rec.answers as Record<string, number>;
    const sid = rec.questionSetId ?? 'unknown';
    if (!setGroups[sid]) setGroups[sid] = { answers: [] };
    setGroups[sid].answers.push(answers);
  }

  // Với mỗi question set, lấy danh sách câu hỏi để map dimension
  for (const sid of Object.keys(setGroups)) {
    if (sid === 'unknown') continue;
    const qSet = await prisma.questionSet.findUnique({
      where: { id: sid },
      select: { questions: { select: { id: true, dimensionId: true, reversed: true } } },
    }).catch(() => null);
    if (!qSet) continue;

    const group = setGroups[sid];
    if (group.answers.length < 5) continue; // Cần ít nhất 5 người để tính alpha

    // Group questions by dimension
    const dimQuestions: Record<string, { id: string; reversed: boolean }[]> = {};
    for (const q of qSet.questions) {
      if (!dimQuestions[q.dimensionId]) dimQuestions[q.dimensionId] = [];
      dimQuestions[q.dimensionId].push({ id: q.id, reversed: q.reversed });
    }

    for (const [dimId, qs] of Object.entries(dimQuestions)) {
      if (qs.length < 2) continue; // Cronbach's alpha yêu cầu ít nhất 2 items

      // Xây dựng matrix: itemScores[i][j] = điểm người j trên item i (sau reversal)
      const itemScores: number[][] = qs.map(q =>
        group.answers
          .map(ans => {
            const raw = ans[q.id];
            if (raw === undefined || raw === null) return null;
            return q.reversed ? 6 - raw : raw;
          })
          .filter((v): v is number => v !== null)
      );

      // Loại items không đủ data
      const validItems = itemScores.filter(item => item.length >= 5);
      if (validItems.length < 2) continue;

      // Align length (lấy min)
      const minLen = Math.min(...validItems.map(item => item.length));
      const aligned = validItems.map(item => item.slice(0, minLen));

      const alpha = calcCronbachAlpha(aligned);

      // Update vào dimensionStats
      const stat = dimensionStats.find(d => d.dimensionId === dimId);
      if (stat && alpha !== null) {
        stat.cronbachAlpha = alpha;
      }
    }
  }

  // 4. Tốc độ
  const durations = results
    .map(r => r.durationSeconds as number)
    .filter(v => v > 0 && v < 7200); // bỏ outliers
  const avgDurationSeconds = durations.length > 0 ? Math.round(mean(durations)) : 0;

  const speedAnomalyRate = results.length > 0
    ? Math.round(
        results.filter(r => r.reliability?.speedFlag === true).length / results.length * 100
      )
    : 0;

  return {
    totalRecords: records.length,
    reliabilityDistribution,
    lieScoreDistribution: lieDistribution,
    dimensionStats: dimensionStats.sort((a, b) => a.dimensionId.localeCompare(b.dimensionId)),
    avgDurationSeconds,
    speedAnomalyRate,
    generatedAt: new Date().toISOString(),
  };
}
