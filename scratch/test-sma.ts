/**
 * TEST SCRIPT: PHÂN TÍCH HỒ SƠ HÀNH CHÍNH (ADMINISTRATOR / OPTIMIZER)
 * Mục tiêu: Kiểm chứng thuật toán SMA (Selective Matching Algorithm)
 * cho SOTA V4.0 Universal.
 */

// Giả lập hàm tinh toán SMA (Copy từ unifiedScoring.ts)
function calculateSMA(
  essentials: { value: number; threshold: number }[],
  supportive: { value: number; weight: number; threshold: number }[],
  negative: { value: number; threshold: number; penalty: number }[]
): number {
  // 1. Kiểm tra Kill Zone (Chỉ số "Chí mạng")
  for (const e of essentials) {
    if (e.value < 3.5) return Math.round(e.value * 2); // Chỉ số quá thấp -> Loại ngay
  }

  // 2. Tính Điểm Gốc (Base Score) từ Essentials
  // CƠ CHẾ MỚI: Nếu không đạt Threshold, điểm bị nhân hệ số phạt trực tiếp (Gate mechanism)
  let essentialMultiplier = 1.0;
  for (const e of essentials) {
    if (e.value < e.threshold) {
      // Phạt theo tỷ lệ bình phương để giảm điểm nhanh khi cách xa ngưỡng
      essentialMultiplier *= Math.pow(e.value / e.threshold, 1.5);
    }
  }

  // Nếu đạt mọi threshold, base là 80 điểm. 20 điểm còn lại dành cho Supportive.
  let baseScore = 80 * essentialMultiplier;

  // 3. Tính Điểm thưởng (Bonus) từ Supportive Traits
  let supportiveBonus = 0;
  for (const s of supportive) {
    if (s.value > s.threshold) {
      const bonusRatio = (s.value - s.threshold) / (10 - s.threshold || 1);
      supportiveBonus += bonusRatio * (s.weight / 100) * 20; // Max bonus là 20 điểm
    }
  }

  const rawScore = baseScore + supportiveBonus;

  // 4. Áp dụng Penalty từ Negative Traits (Khấu trừ phi tuyến)
  let negativeMultiplier = 1.0;
  for (const n of negative) {
    if (n.value > n.threshold) {
      const over = Math.min((n.value - n.threshold) / (10 - n.threshold || 1), 1);
      negativeMultiplier *= (1.0 - n.penalty * over); 
    }
  }

  return Math.round(Math.max(0, Math.min(100, rawScore * negativeMultiplier)));
}

// ========================================================
// HỒ SƠ MẪU: CHUYÊN VIÊN HÀNH CHÍNH (THE OPTIMIZER)
// ========================================================
console.log("--- PHÂN TÍCH HỒ SƠ: CHUYÊN VIÊN HÀNH CHÍNH ---");
const profile = {
  ext: 4.5,  // Hướng nội vừa phải
  agr: 7.5,  // Dễ mến, hỗ trợ tốt
  con: 8.5,  // Rất tận tâm, tỉ mỉ (KEY)
  opn: 4.0,  // Thích ổn định hơn đổi mới
  emo: 7.0,  // Ổn định cảm xúc tốt
  log: 6.5,  // Tư duy logic khá
  emp: 7.0,  // Thấu cảm tốt
  spd: 5.5,  // Tốc độ thực thi vừa phải
  cau: 8.5,  // Rất cẩn trọng (KEY)
  ach: 6.0,  // Mong muốn đạt kết quả vừa tầm
  chl: 3.0,  // Ngại rủi ro/thách thức (KEY)
  aut: 5.0,  // Tự chủ vừa phải
  lrn: 5.5,  // Học hỏi mức trung bình
  smt: 6.5,  // Chịu áp lực trung bình
  gro: 8.5,  // Định hướng ổn định/trung thành (KEY)
};

const { ext, agr, con, opn, emo, log, emp, spd, cau, ach, chl, aut, lrn, smt, gro } = profile;

// DANH SÁCH 8 VAI TRÒ
const results = [
  {
    name: 'Người Mở cõi (Sales/BD)',
    score: calculateSMA(
      [{ value: ext, threshold: 6.5 }, { value: chl, threshold: 6.5 }],
      [{ value: spd, weight: 50, threshold: 6.0 }, { value: emo, weight: 50, threshold: 6.0 }],
      [{ value: cau, threshold: 7.5, penalty: 0.4 }]
    )
  },
  {
    name: 'Người Cầm lái (Leader)',
    score: calculateSMA(
      [{ value: aut, threshold: 7.0 }, { value: emo, threshold: 6.5 }],
      [{ value: log, weight: 40, threshold: 6.5 }, { value: emp, weight: 40, threshold: 6.0 }, { value: ach, weight: 20, threshold: 7.0 }],
      [{ value: agr, threshold: 8.5, penalty: 0.3 }]
    )
  },
  {
    name: 'Chuyên gia Đào sâu (Specialist)',
    score: calculateSMA(
      [{ value: log, threshold: 7.5 }, { value: cau, threshold: 7.0 }],
      [{ value: con, weight: 60, threshold: 7.0 }, { value: lrn, weight: 40, threshold: 7.0 }],
      [{ value: spd, threshold: 8.5, penalty: 0.2 }]
    )
  },
  {
    name: 'Người Chăm chút (Admin/Ops)',
    score: calculateSMA(
      [{ value: con, threshold: 7.0 }, { value: gro, threshold: 6.5 }],
      [{ value: cau, weight: 50, threshold: 7.0 }, { value: agr, weight: 30, threshold: 6.0 }, { value: emo, weight: 20, threshold: 6.0 }],
      [{ value: chl, threshold: 7.5, penalty: 0.3 }]
    )
  },
  {
    name: 'Nhà Sáng tạo (Creative)',
    score: calculateSMA(
      [{ value: opn, threshold: 7.5 }],
      [{ value: lrn, weight: 40, threshold: 7.0 }, { value: ext, weight: 30, threshold: 6.0 }, { value: emp, weight: 30, threshold: 6.0 }],
      [{ value: cau, threshold: 8.5, penalty: 0.4 }]
    )
  },
  {
    name: 'Người Kiến tạo (Builder)',
    score: calculateSMA(
      [{ value: ach, threshold: 7.0 }, { value: spd, threshold: 7.0 }],
      [{ value: log, weight: 40, threshold: 6.5 }, { value: opn, weight: 40, threshold: 6.5 }, { value: con, weight: 20, threshold: 6.0 }],
      []
    )
  },
  {
    name: 'Cố vấn Phân tích (Analyst)',
    score: calculateSMA(
      [{ value: log, threshold: 7.5 }, { value: aut, threshold: 6.0 }],
      [{ value: cau, weight: 50, threshold: 7.0 }, { value: con, weight: 30, threshold: 6.5 }, { value: lrn, weight: 20, threshold: 7.0 }],
      [{ value: ext, threshold: 8.5, penalty: 0.2 }]
    )
  },
  {
    name: 'Chất Kết Dính (Connector)',
    score: calculateSMA(
      [{ value: emp, threshold: 7.5 }, { value: agr, threshold: 7.0 }],
      [{ value: ext, weight: 40, threshold: 6.5 }, { value: emo, weight: 40, threshold: 6.0 }, { value: con, weight: 20, threshold: 6.0 }],
      [{ value: aut, threshold: 8.5, penalty: 0.3 }]
    )
  }
];

// Hiển thị kết quả
console.table(results.sort((a, b) => b.score - a.score));

// Phân tích
const best = results.sort((a, b) => b.score - a.score)[0];
console.log(`\n=> Kết luận: Vai trò phù hợp nhất là [${best.name}] với ${best.score} điểm.`);
if (best.name === 'Người Chăm chút (Admin/Ops)') {
  console.log("PASS: Thuật toán đã nhận diện chính xác hồ sơ Hành chính.");
} else {
  console.log("FAIL: Thuật toán đang ưu tiên sai vai trò.");
}
