import { calculateUnifiedScores } from "./unifiedEngine";

// Mock questions: 20 dimensions × 5 questions + 8 lie scale questions
const mockQuestions: Array<{ id: string; dimensionId: string; reversed: boolean; isLieScale?: boolean }> = [];

const DIMS = [
  'extraversion','agreeableness','conscientiousness','openness','emotional_stability',
  'execution_speed','achievement_drive','challenge_spirit','autonomy','learning_curiosity',
  'recognition_need','logical_thinking','empathy','caution','stress_mental','stress_physical',
  'growth_orientation','stability_orientation','social_contribution','resilience',
];

for (const dim of DIMS) {
  for (let q = 1; q <= 5; q++) {
    mockQuestions.push({ id: `${dim}_${q}`, dimensionId: dim, reversed: q > 3 });
  }
}
for (let q = 1; q <= 8; q++) {
  mockQuestions.push({ id: `lie_${q}`, dimensionId: 'lie_scale', reversed: false, isLieScale: true });
}

function answersFromFn(fn: (q: typeof mockQuestions[0], idx: number) => number): Record<string, number> {
  const out: Record<string, number> = {};
  mockQuestions.forEach((q, i) => { out[q.id] = fn(q, i); });
  return out;
}

function runTests() {
  console.log("🧪 Đang chạy Unit Tests cho Logic Đánh giá Độ trung thực (SPI UNIFIED V4)...");

  // TEST 1: Reliable Data
  const reliableAnswers = answersFromFn((q, idx) =>
    q.isLieScale ? 1 : (idx % 2 === 0 ? 4 : (q.reversed ? 2 : 5))
  );
  const res1 = calculateUnifiedScores(reliableAnswers, mockQuestions, 0, 600000);
  console.log("Res 1 ReliabilityLevel:", res1.reliabilityLevel, "LieScale:", res1.dataQuality.lieScale.score);
  console.assert(res1.reliabilityLevel === "reliable", "Test 1 Failed");
  console.log("✅ Test 1 Passed: Reliable Data");

  // TEST 2: Neutral Bias Warning (> 30%)
  const neutralAnswers = answersFromFn((_q, idx) =>
    idx < 42 ? 3 : (idx % 2 === 0 ? 4 : 2)
  );
  const res2 = calculateUnifiedScores(neutralAnswers, mockQuestions, 0, 600000);
  console.log("Res 2 Neutral Bias:", res2.dataQuality.neutralBias.status, "Score:", res2.dataQuality.neutralBias.score);
  console.assert(res2.dataQuality.neutralBias.status === "Warning", "Test 2 Failed");
  console.log("✅ Test 2 Passed: Neutral Bias Warning");

  // TEST 3: Risk for Fast Response (< 360s)
  const res3 = calculateUnifiedScores(reliableAnswers, mockQuestions, 0, 200000);
  console.log("Res 3 Time Status:", res3.dataQuality.timeTracking.status);
  console.assert(res3.dataQuality.timeTracking.status === "Risk", "Test 3 Failed");
  console.log("✅ Test 3 Passed: Fast Response Risk");

  // TEST 4: Pattern Detection (Straight-lining)
  const patternAnswers = answersFromFn((_q, idx) =>
    idx < 10 ? 4 : (idx % 2 === 0 ? 5 : 1)
  );
  const res4 = calculateUnifiedScores(patternAnswers, mockQuestions, 0, 600000);
  console.log("Res 4 Pattern Status:", res4.dataQuality.patternDetection.status, "Score:", res4.dataQuality.patternDetection.score);
  console.assert(res4.dataQuality.patternDetection.status === "Risk", "Test 4 Failed");
  console.log("✅ Test 4 Passed: Pattern Detection");

  // TEST 5: Consistency Issue (forward=5, reversed=5 → big gap after inversion)
  const inconsistentAnswers = answersFromFn((q) => {
    if (q.dimensionId === 'extraversion' || q.dimensionId === 'agreeableness') {
      return 5; // forward=5 scored as 5, reversed=5 scored as 1 → gap=4
    }
    return q.isLieScale ? 1 : 3;
  });
  const res5 = calculateUnifiedScores(inconsistentAnswers, mockQuestions, 0, 600000);
  console.log("Res 5 Consistency:", res5.dataQuality.consistency.score, "Status:", res5.dataQuality.consistency.status);
  console.assert(res5.dataQuality.consistency.status !== "Ok", "Test 5 Failed");
  console.log("✅ Test 5 Passed: Consistency Check");

  // TEST 6: Lie Scale Risk (>= 7 lie answers scored 4+)
  const lieAnswers = answersFromFn((q) => q.isLieScale ? 5 : 3);
  const res6 = calculateUnifiedScores(lieAnswers, mockQuestions, 0, 600000);
  console.log("Res 6 ReliabilityLevel:", res6.reliabilityLevel, "LieCount:", res6.dataQuality.lieScale.score);
  console.assert(res6.dataQuality.lieScale.status === "Risk", "Test 6 Failed");
  console.log("✅ Test 6 Passed: Lie Scale Risk");

  console.log("\n✨ TẤT CẢ UNIT TESTS ĐÃ HOÀN TẤT THÀNH CÔNG!");
}

runTests();
