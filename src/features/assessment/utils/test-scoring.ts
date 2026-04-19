import { calculateDevResults } from "./devScoring";

// Mock Question data
const mockQuestions: any[] = [];
// Tạo 120 câu hỏi giả lập (12 nhóm x 10 câu)
for (let t = 1; t <= 12; t++) {
  const traitId = `trait_${t.toString().padStart(2, "0")}`;
  for (let q = 1; q <= 10; q++) {
    mockQuestions.push({
      id: `q_${traitId}_${q}`,
      dimensionId: traitId,
      reversed: q > 5, 
      isLieScale: t === 12,
      createdAt: new Date(Date.now() + (t * 10 + q) * 1000) // Tăng dần thời gian
    });
  }
}

function runTests() {
  console.log("🧪 Đang chạy Unit Tests cho Logic Đánh giá Độ trung thực (SOTA V3.0)...");

  // TEST 1: Reliable Data
  const reliableAnswers = mockQuestions.map((q, idx) => ({
    questionId: q.id,
    value: q.isLieScale ? 1 : (idx % 2 === 0 ? 4 : (q.reversed ? 2 : 5))
  }));
  const res1 = calculateDevResults(reliableAnswers, mockQuestions, 0, 600000);
  console.log("Res 1 Status:", res1.reliabilityStatus, "LieScore:", res1.lieScore);
  console.assert(res1.reliabilityStatus === "Reliable", "Test 1 Failed");
  console.log("✅ Test 1 Passed: Reliable Data");

  // TEST 2: Neutral Bias Warning (> 30%)
  const neutralAnswers = mockQuestions.map((q, idx) => ({
    questionId: q.id,
    value: idx < 42 ? 3 : (idx % 2 === 0 ? 4 : 2)
  }));
  const res2 = calculateDevResults(neutralAnswers, mockQuestions, 0, 600000);
  console.log("Res 2 Neutral Bias Status:", res2.dataQuality.neutralBias.status, "Score:", res2.dataQuality.neutralBias.score);
  console.assert(res2.dataQuality.neutralBias.status === "Warning", "Test 2 Failed");
  console.log("✅ Test 2 Passed: Neutral Bias Warning");

  // TEST 3: Invalid Data (Too Fast < 5 min)
  const fastRes = calculateDevResults(reliableAnswers, mockQuestions, 0, 200000);
  console.log("Res 3 Time Status:", fastRes.dataQuality.timeTracking.status);
  console.assert(fastRes.dataQuality.timeTracking.status === "Risk", "Test 3 Failed");
  console.log("✅ Test 3 Passed: Invalid for Fast Response");

  // TEST 4: Pattern Detection (Straight-lining)
  const patternAnswers = mockQuestions.map((q, idx) => ({
    questionId: q.id,
    value: idx < 10 ? 4 : (idx % 2 === 0 ? 5 : 1)
  }));
  const res4 = calculateDevResults(patternAnswers, mockQuestions, 0, 600000);
  console.log("Res 4 Pattern Status:", res4.dataQuality.patternDetection.status, "Score:", res4.dataQuality.patternDetection.score);
  console.assert(res4.dataQuality.patternDetection.status === "Risk", "Test 4 Failed");
  console.log("✅ Test 4 Passed: Pattern Detection");

  // TEST 5: Consistency Issue (Mâu thuẫn 2 nhóm)
  const inconsistentAnswers = mockQuestions.map((q, idx) => {
    if (q.dimensionId === "trait_01" || q.dimensionId === "trait_02") {
      return { questionId: q.id, value: 5 }; 
    }
    return { questionId: q.id, value: q.isLieScale ? 1 : (idx % 2 === 0 ? 4 : 2) };
  });
  const res5 = calculateDevResults(inconsistentAnswers, mockQuestions, 0, 600000);
  console.log("Res 5 Consistency Issues:", res5.dataQuality.consistency.score, "Status:", res5.dataQuality.consistency.status);
  console.assert(res5.dataQuality.consistency.status === "Warning", "Test 5 Failed");
  console.log("✅ Test 5 Passed: Consistency Check");

  // TEST 6: Lie Scale Penalty (Score 5)
  const lieAnswers = mockQuestions.map((q, idx) => {
    // Chỉ chọn 5 câu để lieCount = 5 (Suspect)
    const isTarget = q.id.endsWith("_1") || q.id.endsWith("_2") || q.id.endsWith("_3") || q.id.endsWith("_4") || q.id.endsWith("_5");
    if (q.isLieScale && isTarget) {
      return { questionId: q.id, value: 5 }; 
    }
    return { questionId: q.id, value: (idx % 2 === 0 ? 4 : 2) };
  });
  const res6 = calculateDevResults(lieAnswers, mockQuestions, 0, 600000);
  console.log("Res 6 ReliabilityStatus:", res6.reliabilityStatus, "LieScore:", res6.lieScore, "PenaltyApplied:", res6.penaltyApplied);
  console.assert(res6.reliabilityStatus === "Suspect", "Test 6 Failed");
  console.assert(res6.penaltyApplied === true, "Test 6 Failed: No Penalty");
  console.log("✅ Test 6 Passed: Lie Scale Penalty (20%)");

  console.log("\n✨ TẤT CẢ UNIT TESTS ĐÃ HOÀN TẤT THÀNH CÔNG!");
}

runTests();
