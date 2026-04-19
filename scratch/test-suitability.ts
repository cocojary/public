/**
 * COMPREHENSIVE TEST SCRIPT: SOTA V4.0 SMA VALIDATION
 * Mục tiêu: Kiểm chứng độ phân hóa điểm số cho các Persona khác biệt.
 */

function calculateSMA(
  essentials: { value: number; threshold: number }[],
  supportive: { value: number; weight: number; threshold: number }[],
  negative: { value: number; threshold: number; penalty: number }[]
): number {
  for (const e of essentials) {
    if (e.value < 3.5) return Math.round(e.value * 2);
  }

  let essentialMultiplier = 1.0;
  for (const e of essentials) {
    if (e.value < e.threshold) {
      essentialMultiplier *= Math.pow(e.value / e.threshold, 1.5);
    }
  }

  let baseScore = 80 * essentialMultiplier;

  let supportiveBonus = 0;
  for (const s of supportive) {
    if (s.value > s.threshold) {
      const bonusRatio = (s.value - s.threshold) / (10 - s.threshold || 1);
      supportiveBonus += bonusRatio * (s.weight / 100) * 20;
    }
  }

  const rawScore = baseScore + supportiveBonus;

  let negativeMultiplier = 1.0;
  for (const n of negative) {
    if (n.value > n.threshold) {
      const over = Math.min((n.value - n.threshold) / (10 - n.threshold || 1), 1);
      negativeMultiplier *= (1.0 - n.penalty * over); 
    }
  }

  return Math.round(Math.max(0, Math.min(100, rawScore * negativeMultiplier)));
}

const ROLES_LOGIC = [
  {
    name: 'Nhà Khai phá',
    calc: (p: any) => calculateSMA(
      [{ value: p.ext, threshold: 6.5 }, { value: p.chl, threshold: 6.5 }],
      [{ value: p.spd, weight: 50, threshold: 6.0 }, { value: p.emo, weight: 50, threshold: 6.0 }],
      [{ value: p.cau, threshold: 7.5, penalty: 0.4 }]
    )
  },
  {
    name: 'Nhà Vận động',
    calc: (p: any) => calculateSMA(
      [{ value: p.aut, threshold: 7.0 }, { value: p.emo, threshold: 6.5 }],
      [{ value: p.log, weight: 40, threshold: 6.5 }, { value: p.emp, weight: 40, threshold: 6.0 }, { value: p.ach, weight: 20, threshold: 7.0 }],
      [{ value: p.agr, threshold: 8.5, penalty: 0.3 }]
    )
  },
  {
    name: 'Nhà Kỹ trị',
    calc: (p: any) => calculateSMA(
      [{ value: p.log, threshold: 7.5 }, { value: p.cau, threshold: 7.0 }],
      [{ value: p.con, weight: 60, threshold: 7.0 }, { value: p.lrn, weight: 40, threshold: 7.0 }],
      [{ value: p.spd, threshold: 8.5, penalty: 0.2 }]
    )
  },
  {
    name: 'Người Chăm chút',
    calc: (p: any) => calculateSMA(
      [{ value: p.con, threshold: 7.0 }, { value: p.gro, threshold: 6.5 }],
      [{ value: p.cau, weight: 50, threshold: 7.0 }, { value: p.agr, weight: 30, threshold: 6.0 }, { value: p.emo, weight: 20, threshold: 6.0 }],
      [{ value: p.chl, threshold: 7.5, penalty: 0.3 }]
    )
  },
  {
    name: 'Nhà Sáng tạo',
    calc: (p: any) => calculateSMA(
      [{ value: p.opn, threshold: 7.5 }],
      [{ value: p.lrn, weight: 40, threshold: 7.0 }, { value: p.ext, weight: 30, threshold: 6.0 }, { value: p.emp, weight: 30, threshold: 6.0 }],
      [{ value: p.cau, threshold: 8.5, penalty: 0.4 }]
    )
  },
  {
    name: 'Người Kiến tạo',
    calc: (p: any) => calculateSMA(
      [{ value: p.ach, threshold: 7.0 }, { value: p.spd, threshold: 7.0 }],
      [{ value: p.log, weight: 40, threshold: 6.5 }, { value: p.opn, weight: 40, threshold: 6.5 }, { value: p.con, weight: 20, threshold: 6.0 }],
      []
    )
  },
  {
    name: 'Cố vấn Phân tích',
    calc: (p: any) => calculateSMA(
      [{ value: p.log, threshold: 7.5 }, { value: p.aut, threshold: 6.0 }],
      [{ value: p.cau, weight: 50, threshold: 7.0 }, { value: p.con, weight: 30, threshold: 6.5 }, { value: p.lrn, weight: 20, threshold: 7.0 }],
      [{ value: p.ext, threshold: 8.5, penalty: 0.2 }]
    )
  },
  {
    name: 'Chất Kết Dính',
    calc: (p: any) => calculateSMA(
      [{ value: p.emp, threshold: 7.5 }, { value: p.agr, threshold: 7.0 }],
      [{ value: p.ext, weight: 40, threshold: 6.5 }, { value: p.emo, weight: 40, threshold: 6.0 }, { value: p.con, weight: 20, threshold: 6.0 }],
      [{ value: p.aut, threshold: 8.5, penalty: 0.3 }]
    )
  }
];

function runTest(profileName: string, p: any) {
  console.log(`\n=== TEST PROFILE: ${profileName} ===`);
  const scores = ROLES_LOGIC.map(r => ({ name: r.name, score: r.calc(p) }));
  console.table(scores.sort((a, b) => b.score - a.score));
}

// 1. Senior Developer (High Logic, High Focus, High Caution)
runTest("Senior Developer", {
  log: 9.0, cau: 8.5, con: 8.0, lrn: 8.0, spd: 4.0, ext: 3.5, aut: 6.0, opn: 4.5, agr: 5.0, emp: 4.5, ach: 7.0, chl: 4.0, emo: 7.0, gro: 7.0
});

// 2. Head of Sales (High Extrovert, High Challenge, High Speed)
runTest("Head of Sales", {
  ext: 9.0, chl: 8.5, spd: 8.5, emo: 8.0, ach: 9.0, aut: 7.5, log: 6.0, opn: 7.0, cau: 4.0, con: 6.0, agr: 6.5, emp: 7.5, lrn: 7.0, gro: 5.0
});

// 3. UX Designer (High Openness, High Learning, High Empathy)
runTest("UX Designer", {
  opn: 9.0, lrn: 8.5, emp: 8.5, ext: 7.0, log: 7.0, cau: 5.0, spd: 6.5, con: 7.0, agr: 7.5, ach: 7.5, chl: 6.0, aut: 6.0, emo: 7.0, gro: 6.0
});
