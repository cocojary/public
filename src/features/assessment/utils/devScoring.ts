import type { Question } from "@prisma/client";

export interface ReliabilityMetric {
  score: number | string;
  status: "Ok" | "Warning" | "Risk";
  message: string;
}

export interface DevScoringResult {
  type: "SPI_DEV_V3";
  scores: {
    traitId: string;
    name: string;
    score: number; // Thang 10
    originalSum: number; // Tổng điểm thô (10-50)
  }[];
  lieScore: number;
  reliabilityStatus: "Reliable" | "Suspect" | "Invalid";
  penaltyApplied: boolean;
  penaltyMultiplier: number;
  dataQuality: {
    lieScale: ReliabilityMetric;
    consistency: ReliabilityMetric;
    neutralBias: ReliabilityMetric;
    timeTracking: ReliabilityMetric;
    patternDetection: ReliabilityMetric;
  };
  classification: {
    type: "Chuyên gia Kỹ thuật" | "Kỹ sư Sản phẩm" | "Người dẫn dắt" | "Nhân sự Đa năng";
    description: string;
  };
  recommendations: {
    traitId: string;
    traitName: string;
    level: "Low" | "Medium" | "High";
    content: string;
  }[];
}

const DIMENSION_NAMES: Record<string, string> = {
  trait_01: "Sự tận tâm & Chỉn chu",
  trait_02: "Cộng tác & Giao tiếp",
  trait_03: "Thích nghi & Linh hoạt",
  trait_04: "Giải quyết vấn đề",
  trait_05: "Chính trực & Dũng cảm",
  trait_06: "Tổ chức & Kế hoạch",
  trait_07: "Tự học & Đổi mới",
  trait_08: "Thấu cảm & Khách hàng",
  trait_09: "Kiên cường & Áp lực",
  trait_10: "Tư duy hệ thống",
  trait_11: "Tính chủ động",
  trait_12: "Thang đo trung thực (Lie Scale)",
};

export function calculateDevResults(
  answers: { questionId: string; value: number }[],
  questions: Question[],
  startTime: number,
  endTime: number
): DevScoringResult {
  const totalQuestions = questions.length;
  const durationInSeconds = (endTime - startTime) / 1000;

  // 1. Phân loại câu trả lời theo nhóm (trait)
  const traitGroups: Record<string, { pos: number[]; negInv: number[] }> = {};
  let neutralCount = 0;
  let lieCount = 0;

  for (let i = 1; i <= 12; i++) {
    traitGroups[`trait_${i.toString().padStart(2, "0")}`] = { pos: [], negInv: [] };
  }

  const sortedAnswers = [...answers].sort((a, b) => {
    const qA = questions.find((q) => q.id === a.questionId);
    const qB = questions.find((q) => q.id === b.questionId);
    return (qA?.createdAt.getTime() || 0) - (qB?.createdAt.getTime() || 0);
  });

  sortedAnswers.forEach((ans) => {
    const q = questions.find((item) => item.id === ans.questionId);
    if (!q) return;

    if (ans.value === 3) neutralCount++;

    let finalValue = ans.value;
    if (q.reversed) {
      finalValue = 6 - ans.value;
      traitGroups[q.dimensionId].negInv.push(finalValue);
    } else {
      traitGroups[q.dimensionId].pos.push(finalValue);
    }

    if (q.isLieScale && ans.value >= 4) {
      lieCount++;
    }
  });

  // 2. Tính toán các chỉ số chất lượng dữ liệu
  
  // 2.1 Consistency Check (Tính nhất quán)
  let consistencyIssueCount = 0;
  Object.keys(traitGroups).forEach(tid => {
    if (tid === "trait_12") return;
    const group = traitGroups[tid];
    if (group.pos.length > 0 && group.negInv.length > 0) {
      const avgPos = group.pos.reduce((a, b) => a + b, 0) / group.pos.length;
      const avgNeg = group.negInv.reduce((a, b) => a + b, 0) / group.negInv.length;
      if (Math.abs(avgPos - avgNeg) > 1.2) consistencyIssueCount++;
    }
  });

  // 2.2 Pattern Detection (Khuôn mẫu)
  let maxConsecutiveSame = 0;
  let currentConsecutiveSame = 1;
  let maxZigZac = 0;
  let currentZigZac = 1;

  for (let i = 1; i < sortedAnswers.length; i++) {
    if (sortedAnswers[i].value === sortedAnswers[i-1].value) {
      currentConsecutiveSame++;
    } else {
      maxConsecutiveSame = Math.max(maxConsecutiveSame, currentConsecutiveSame);
      currentConsecutiveSame = 1;
    }

    if (i >= 2) {
      if (sortedAnswers[i].value === sortedAnswers[i-2].value && sortedAnswers[i].value !== sortedAnswers[i-1].value) {
        currentZigZac++;
      } else {
        maxZigZac = Math.max(maxZigZac, currentZigZac);
        currentZigZac = 1;
      }
    }
  }
  maxConsecutiveSame = Math.max(maxConsecutiveSame, currentConsecutiveSame);
  maxZigZac = Math.max(maxZigZac, currentZigZac);

  // 3. Tổng hợp Data Quality Metrics
  const dataQuality = {
    lieScale: {
      score: lieCount,
      status: lieCount >= 7 ? "Risk" : lieCount >= 4 ? "Warning" : "Ok",
      message: lieCount >= 7 ? "Dấu hiệu 'tô hồng' hồ sơ quá mức." : lieCount >= 4 ? "Có dấu hiệu thiên kiến phản hồi tích cực." : "Trung thực."
    } as ReliabilityMetric,
    consistency: {
      score: `${consistencyIssueCount} nhóm`,
      status: consistencyIssueCount >= 4 ? "Risk" : consistencyIssueCount >= 2 ? "Warning" : "Ok",
      message: consistencyIssueCount >= 4 ? "Mâu thuẫn logic lớn giữa các câu hỏi đối nghịch." : consistencyIssueCount >= 2 ? "Có dấu hiệu trả lời thiếu nhất quán." : "Nhất quán tốt."
    } as ReliabilityMetric,
    neutralBias: {
      score: `${Math.round((neutralCount / totalQuestions) * 100)}%`,
      status: (neutralCount / totalQuestions) > 0.5 ? "Risk" : (neutralCount / totalQuestions) > 0.3 ? "Warning" : "Ok",
      message: (neutralCount / totalQuestions) > 0.5 ? "Quá nhiều câu trả lời trung lập, kết quả vô giá trị." : (neutralCount / totalQuestions) > 0.3 ? "Có xu hướng né tránh bộc lộ quan điểm." : "Sẵn sàng biểu đạt."
    } as ReliabilityMetric,
    timeTracking: {
      score: `${Math.round(durationInSeconds)} giây`,
      status: durationInSeconds < 300 ? "Risk" : durationInSeconds < 480 ? "Warning" : "Ok",
      message: durationInSeconds < 300 ? "Làm bài quá nhanh, không đủ thời gian đọc hiểu." : durationInSeconds < 480 ? "Tốc độ làm bài nhanh hơn trung bình." : "Thời gian hợp lý."
    } as ReliabilityMetric,
    patternDetection: {
      score: `Max ${Math.max(maxConsecutiveSame, maxZigZac)} câu`,
      status: Math.max(maxConsecutiveSame, maxZigZac) >= 8 ? "Risk" : Math.max(maxConsecutiveSame, maxZigZac) >= 6 ? "Warning" : "Ok",
      message: Math.max(maxConsecutiveSame, maxZigZac) >= 8 ? "Phát hiện khuôn mẫu trả lời giả lập (Straight-lining/Zig-zac)." : Math.max(maxConsecutiveSame, maxZigZac) >= 6 ? "Có dấu hiệu trả lời theo khuôn mẫu." : "Tự nhiên."
    } as ReliabilityMetric
  };

  // 4. Xử lý độ tin cậy tổng quát & Penalty
  let reliabilityStatus: DevScoringResult["reliabilityStatus"] = "Reliable";
  let penaltyApplied = false;
  let penaltyMultiplier = 1.0;

  const riskCount = Object.values(dataQuality).filter(m => m.status === "Risk").length;
  const warningCount = Object.values(dataQuality).filter(m => m.status === "Warning").length;

  if (riskCount >= 1 || warningCount >= 3) {
    reliabilityStatus = "Invalid";
  } else if (warningCount >= 1) {
    reliabilityStatus = "Suspect";
    penaltyApplied = true;
    penaltyMultiplier = 0.8; // Phạt 20%
  }

  // 5. Tính điểm 11 nhóm năng lực
  const scores: DevScoringResult["scores"] = Object.keys(DIMENSION_NAMES)
    .filter(tid => tid !== "trait_12")
    .map(tid => {
      const group = traitGroups[tid];
      const allValues = [...group.pos, ...group.negInv];
      const originalSum = allValues.reduce((a, b) => a + b, 0);
      let rawScore = (originalSum / 50) * 10;
      if (penaltyApplied) rawScore *= penaltyMultiplier;

      return {
        traitId: tid,
        name: DIMENSION_NAMES[tid],
        score: Math.round(rawScore * 10) / 10,
        originalSum
      };
    });

  // 6. Phân loại & Khuyến nghị (Giữ nguyên logic cũ nhưng cập nhật text)
  let classificationType: DevScoringResult["classification"]["type"] = "Nhân sự Đa năng";
  const getAvg = (ids: string[]) => 
    scores.filter(s => ids.includes(s.traitId)).reduce((sum, s) => sum + s.score, 0) / ids.length;

  const techScore = getAvg(["trait_01", "trait_04", "trait_06", "trait_10"]);
  const productScore = getAvg(["trait_08", "trait_03", "trait_07"]);
  const leadScore = getAvg(["trait_11", "trait_02", "trait_05"]);

  if (techScore > 7.5 && techScore > productScore && techScore > leadScore) classificationType = "Chuyên gia Kỹ thuật";
  else if (productScore > 7.5 && productScore > techScore && productScore > leadScore) classificationType = "Kỹ sư Sản phẩm";
  else if (leadScore > 7.5 && leadScore > techScore && leadScore > productScore) classificationType = "Người dẫn dắt";

  const classificationMap: Record<DevScoringResult["classification"]["type"], string> = {
    "Chuyên gia Kỹ thuật": "Chuyên gia: Mạnh về sự chỉn chu, tổ chức và tư duy hệ thống.",
    "Kỹ sư Sản phẩm": "Kỹ sư sản phẩm: Mạnh về thấu cảm khách hàng, thích nghi và đổi mới.",
    "Người dẫn dắt": "Người dẫn dắt: Mạnh về tính chủ động, cộng tác và chính trực.",
    "Nhân sự Đa năng": "Nhân sự đa năng: Cân bằng giữa các nhóm kỹ năng.",
  };

  const recommendations: DevScoringResult["recommendations"] = scores.map(s => {
    let level: "Low" | "Medium" | "High" = "Medium";
    if (s.score < 5) level = "Low";
    else if (s.score > 7.5) level = "High";

    return {
      traitId: s.traitId,
      traitName: s.name,
      level,
      content: level === "Low" ? `Cần cải thiện ${s.name.toLowerCase()}.` : level === "High" ? `Thế mạnh về ${s.name.toLowerCase()}.` : `Đáp ứng ổn định về ${s.name.toLowerCase()}.`
    };
  });

  return {
    type: "SPI_DEV_V3",
    scores,
    lieScore: lieCount,
    reliabilityStatus,
    penaltyApplied,
    penaltyMultiplier,
    dataQuality,
    classification: {
      type: classificationType,
      description: classificationMap[classificationType],
    },
    recommendations,
  };
}
