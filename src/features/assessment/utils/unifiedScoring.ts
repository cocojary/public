// ============================================================
// UNIFIED SCORING ENGINE — Techzen SPI V4
// Một code path duy nhất cho tất cả vị trí.
// Xóa hoàn toàn isV3 branching từ V3.
// ============================================================

import type { AssessmentResult, DimensionScore } from '@/features/assessment/data/scoring';
import type { UnifiedScoringResult } from './unifiedEngine';
import { adaptToAssessmentResult } from './unifiedEngine';
import type { DbDimension } from '@/server/services/assessmentDataService';

// ── Kiểu dữ liệu đầu ra ──────────────────────────────────────

export type RoleType =
  | 'Người Mở cõi'
  | 'Người Cầm lái'
  | 'Chuyên gia Đào sâu'
  | 'Người Chăm chút'
  | 'Nhà Sáng tạo'
  | 'Người Kiến tạo'
  | 'Cố vấn Phân tích'
  | 'Chất Kết Dính';

export interface UnifiedScoreItem {
  id: string;
  label: string;
  score: number;
  level: 'low' | 'medium' | 'high';
  description: string;
}

export interface UnifiedGroup {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  items: UnifiedScoreItem[];
  groupScore: number;
}

export interface SuitabilityRole {
  role: RoleType;
  matchScore: number;
  matchLevel: 'strong' | 'moderate' | 'weak';
  positions: string[];
  badge: string;
  description: string;
}

export interface CombatPowerResult {
  total: number;
  cognitive: number;
  motivation: number;
  stability: number;
  penaltyApplied: boolean;
  label: string;
}

export interface TechzenCultureFit {
  core1Score: number; // Người tử tế
  core2Score: number; // Học tập suốt đời
  core3Score: number; // Thích ứng linh hoạt & Agile
  core4Score: number; // Giá trị thật
  core5Score: number; // Tôn trọng văn hóa đối tác Nhật
  overallScore: number; // Thang 0-100
}


export interface UnifiedReportData {
  sourceType: 'SPI_V2' | 'SPI_UNIFIED_V4' | 'SPI_DEV_V3_LEGACY';
  groups: UnifiedGroup[];
  suitability: SuitabilityRole[];
  topRole: SuitabilityRole;
  combatPower: CombatPowerResult;
  integrityLevel: 'ok' | 'warning' | 'risk';
  integrityNote: string;
  // [v4.1] Weighted reliability score và caveat text
  reliabilityScore?: number;          // 0-100 — chỉ có khi từ SPI_UNIFIED_V4
  interpretationCaveat?: string;      // Cảnh báo hiển thị tầng diễn giải
  interpretationConfidence?: 'high' | 'medium' | 'low'; // Mức confidence
  techzenCultureFit: TechzenCultureFit;
}

// ── Hàm trợ giúp ─────────────────────────────────────────────

function toLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 7.5) return 'high';
  if (score >= 5)   return 'medium';
  return 'low';
}

function clamp(val: number, min = 0, max = 10): number {
  return Math.max(min, Math.min(max, val));
}

function getDimScore(dims: DimensionScore[], id: string): number {
  const d = dims.find(x => x.dimensionId === id);
  // [v4.1] Ưu tiên dùng scaledContinuous nếu có (độ phân giải cao hơn)
  // Fallback về scaled integer nếu không có (dữ liệu cũ / V2)
  const s = d && (d as any).scaledContinuous != null
    ? (d as any).scaledContinuous
    : (d && d.scaled > 0 ? clamp(d.scaled) : 5);
  return clamp(s);
}

// ── Xây dựng 6 nhóm từ 20 dimensions ────────────────────────

function buildGroups(dims: DimensionScore[], lieScore: number, consistencyScore: number, speedFlag: boolean, dimensions?: any[]): UnifiedGroup[] {
  const makeItem = (id: string): UnifiedScoreItem => {
    const dim = dimensions?.find(d => d.id === id);
    const score = getDimScore(dims, id);
    return {
      id,
      label: dim?.nameVi ?? id,
      score,
      level: toLevel(score),
      description: score >= 7 ? (dim?.descHigh ?? '') : (dim?.descLow ?? ''),
    };
  };

  const lieNorm = clamp(10 - lieScore / 10);

  const groups: UnifiedGroup[] = [
    {
      id: 'integrity',
      title: 'Chỉ số Tin cậy',
      subtitle: 'Bộ lọc độ trung thực & nhất quán',
      icon: '🛡️',
      color: '#6366F1',
      items: [
        {
          id: 'lie_scale',
          label: 'Độ trung thực',
          score: lieNorm,
          level: toLevel(lieNorm),
          description: lieScore > 65
            ? 'Xu hướng tô vẽ bản thân. Cần xác minh qua phỏng vấn.'
            : 'Phản hồi trung thực.',
        },
        {
          id: 'consistency',
          label: 'Tính nhất quán',
          score: clamp(consistencyScore / 10),
          level: toLevel(consistencyScore / 10),
          description: consistencyScore >= 70
            ? 'Trả lời nhất quán và đáng tin cậy.'
            : 'Một số câu hỏi mâu thuẫn. Cần xác nhận thêm.',
        },
        {
          id: 'speed',
          label: 'Sự tập trung',
          score: speedFlag ? 2 : 8,
          level: speedFlag ? 'low' : 'high',
          description: speedFlag
            ? 'Làm bài quá nhanh — không đủ thời gian đọc hiểu.'
            : 'Thời gian làm bài hợp lý.',
        },
      ],
      groupScore: 0,
    },
    {
      id: 'personality',
      title: 'Tính cách Cốt lõi',
      subtitle: 'Big Five — Bản chất con người',
      icon: '🧬',
      color: '#3B82F6',
      items: [
        makeItem('extraversion'),
        makeItem('agreeableness'),
        makeItem('conscientiousness'),
        makeItem('openness'),
        makeItem('emotional_stability'),
      ],
      groupScore: 0,
    },
    {
      id: 'cognitive',
      title: 'Tư duy & Phong cách',
      subtitle: 'Công cụ tư duy — Cách tiếp cận vấn đề',
      icon: '🧠',
      color: '#F59E0B',
      items: [
        makeItem('logical_thinking'),
        makeItem('empathy'),
        makeItem('execution_speed'),
        makeItem('caution'),
      ],
      groupScore: 0,
    },
    {
      id: 'motivation',
      title: 'Động lực & Giá trị',
      subtitle: 'Động cơ bên trong — Điều thúc đẩy họ',
      icon: '🔥',
      color: '#EF4444',
      items: [
        makeItem('achievement_drive'),
        makeItem('challenge_spirit'),
        makeItem('autonomy'),
        makeItem('learning_curiosity'),
        makeItem('recognition_need'),
      ],
      groupScore: 0,
    },
    {
      id: 'resilience',
      title: 'Chịu đựng Áp lực',
      subtitle: 'Độ bền — Khả năng vận hành dưới áp lực',
      icon: '💪',
      color: '#7C3AED',
      items: [makeItem('stress_mental'), makeItem('stress_physical')],
      groupScore: 0,
    },
    {
      id: 'culture',
      title: 'Gắn kết & Văn hóa',
      subtitle: 'Techzen Spirit — Khả năng đi đường dài',
      icon: '🌸',
      color: '#10B981',
      items: [
        {
          id: 'loyalty',
          label: 'Độ trung thành',
          score: Math.round((getDimScore(dims, 'stability_orientation') + getDimScore(dims, 'conscientiousness')) / 2),
          level: toLevel((getDimScore(dims, 'stability_orientation') + getDimScore(dims, 'conscientiousness')) / 2),
          description: 'Dự báo khả năng gắn bó dài hạn với tổ chức.',
        },
        {
          id: 'proactivity',
          label: 'Tính chủ động',
          score: getDimScore(dims, 'autonomy'),
          level: toLevel(getDimScore(dims, 'autonomy')),
          description: getDimScore(dims, 'autonomy') >= 7
            ? 'Chủ động, không cần nhắc nhở thường xuyên.'
            : 'Cần môi trường có hướng dẫn rõ ràng.',
        },
        {
          id: 'learning_fit',
          label: 'Tinh thần học hỏi',
          score: getDimScore(dims, 'learning_curiosity'),
          level: toLevel(getDimScore(dims, 'learning_curiosity')),
          description: getDimScore(dims, 'learning_curiosity') >= 7
            ? 'Luôn cập nhật kiến thức mới — phù hợp văn hóa Techzen.'
            : 'Cần khuyến khích việc tự học thêm.',
        },
        {
          id: 'integrity_fit',
          label: 'Chính trực',
          score: lieNorm,
          level: toLevel(lieNorm),
          description: 'Mức độ minh bạch và trung thực trong giao tiếp.',
        },
        {
          id: 'omotenashi',
          label: 'Tư duy Omotenashi',
          score: Math.round(
            (getDimScore(dims, 'empathy') + getDimScore(dims, 'agreeableness') + getDimScore(dims, 'social_contribution')) / 3
          ),
          level: toLevel(
            (getDimScore(dims, 'empathy') + getDimScore(dims, 'agreeableness') + getDimScore(dims, 'social_contribution')) / 3
          ),
          description: 'Sự tận tâm với khách hàng và đồng nghiệp theo tinh thần Nhật Bản.',
        },
      ],
      groupScore: 0,
    },
  ];

  for (const g of groups) {
    g.groupScore = g.items.length > 0
      ? Math.round((g.items.reduce((s, i) => s + i.score, 0) / g.items.length) * 10) / 10
      : 5;
  }

  return groups;
}

// ── Selective Matching Algorithm (SMA) — SOTA V4.0 ────────────────

function calculateSMA(
  essentials: { value: number; threshold: number }[],
  supportive: { value: number; weight: number; threshold: number }[],
  negative: { value: number; threshold: number; penalty: number }[] = []
): number {
  // 1. Kiểm tra Kill Zone (Chỉ số "Chí mạng")
  for (const e of essentials) {
    if (e.value < 3.5) return Math.round(e.value * 2); 
  }

  // 2. Tính Điểm Gốc (Base Score) từ Essentials - 80% trọng số tối đa
  // Sử dụng Gate mechanism: Nếu không đạt Threshold, điểm bị nhân hệ số phạt lũy thừa
  let essentialMultiplier = 1.0;
  for (const e of essentials) {
    if (e.value < e.threshold) {
      essentialMultiplier *= Math.pow(e.value / e.threshold, 1.5);
    }
  }

  // Nếu đạt mọi threshold, base là 80 điểm.
  const baseScore = 80 * essentialMultiplier;

  // 3. Tính Điểm thưởng (Bonus) từ Supportive Traits - 20% trọng số tối đa
  let supportiveBonus = 0;
  for (const s of supportive) {
    if (s.value > s.threshold) {
      const bonusRatio = (s.value - s.threshold) / (10 - s.threshold || 1);
      supportiveBonus += bonusRatio * (s.weight / 100) * 20; 
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

function calcSuitability(groups: UnifiedGroup[]): SuitabilityRole[] {
  const getItem = (groupId: string, itemId: string): number =>
    groups.find(g => g.id === groupId)?.items.find(i => i.id === itemId)?.score ?? 5;

  // Shortcuts
  const ext  = getItem('personality', 'extraversion');
  const agr  = getItem('personality', 'agreeableness');
  const con  = getItem('personality', 'conscientiousness');
  const opn  = getItem('personality', 'openness');
  const emo  = getItem('personality', 'emotional_stability');
  const log  = getItem('cognitive',   'logical_thinking');
  const emp  = getItem('cognitive',   'empathy');
  const spd  = getItem('cognitive',   'execution_speed');
  const cau  = getItem('cognitive',   'caution');
  const ach  = getItem('motivation',  'achievement_drive');
  const chl  = getItem('motivation',  'challenge_spirit');
  const aut  = getItem('motivation',  'autonomy');
  const lrn  = getItem('motivation',  'learning_curiosity');
  const rec  = getItem('motivation',  'recognition_need');
  const smt  = getItem('resilience',  'stress_mental');
  const sph  = getItem('resilience',  'stress_physical');
  const gro  = getItem('culture',     'loyalty');       // stability_orientation composite
  const pro  = getItem('culture',     'proactivity');   // autonomy

  const rolesData: { role: RoleType; score: number; positions: string[]; badge: string; description: string }[] = [
    // 1. Người Mở cõi (Hunter / Trailblazer)
    {
      role: 'Người Mở cõi',
      score: calculateSMA(
        [
          { value: ext, threshold: 6.5 },
          { value: chl, threshold: 6.5 },
        ],
        [
          { value: spd, weight: 50, threshold: 6.0 },
          { value: emo, weight: 50, threshold: 6.0 },
        ],
        [
          { value: cau, threshold: 7.5, penalty: 0.4 },
        ]
      ),
      positions: ['Sales', 'Business Development', 'Tăng trưởng (Growth)'],
      badge: '🎯',
      description: 'Những người tiên phong khai phá thị trường và cơ hội mới. Họ có tinh thần chiến đấu mạnh mẽ, không ngại bị từ chối và luôn hướng tới kết quả.',
    },
    // 2. Người Cầm lái (Leader / Driver)
    {
      role: 'Người Cầm lái',
      score: calculateSMA(
        [
          { value: aut, threshold: 7.0 },
          { value: emo, threshold: 6.5 },
        ],
        [
          { value: log, weight: 40, threshold: 6.5 },
          { value: emp, weight: 40, threshold: 6.0 },
          { value: ach, weight: 20, threshold: 7.0 },
        ],
        [
          { value: agr, threshold: 8.5, penalty: 0.3 },
        ]
      ),
      positions: ['Team Lead', 'Manager', 'CEO'],
      badge: '👑',
      description: 'Nhà điều hành quyết đoán với tầm nhìn bao quát. Họ giỏi quản trị mục tiêu, đưa ra quyết định dựa trên dữ liệu và dẫn dắt đội ngũ thực thi.',
    },
    // 3. Chuyên gia Đào sâu (Deep Specialist)
    {
      role: 'Chuyên gia Đào sâu',
      score: calculateSMA(
        [
          { value: log, threshold: 7.5 },
          { value: cau, threshold: 7.0 },
        ],
        [
          { value: con, weight: 60, threshold: 7.0 },
          { value: lrn, weight: 40, threshold: 7.0 },
        ],
        [
          { value: spd, threshold: 8.5, penalty: 0.2 },
        ]
      ),
      positions: ['Backend Dev', 'System Architect', 'Kế toán trưởng', 'QA/QC'],
      badge: '🔬',
      description: 'Các chuyên gia tư duy logic sắc bén, tập trung vào sự chính xác và chiều sâu kiến thức. Họ là xương sống kỹ thuật cho những hệ thống phức tạp.',
    },
    // 4. Người Chăm chút (Optimizer / Operator)
    {
      role: 'Người Chăm chút',
      score: calculateSMA(
        [
          { value: con, threshold: 7.0 },
          { value: gro, threshold: 6.5 },
        ],
        [
          { value: cau, weight: 50, threshold: 7.0 },
          { value: agr, weight: 30, threshold: 6.0 },
          { value: emo, weight: 20, threshold: 6.0 },
        ],
        [
          { value: chl, threshold: 7.5, penalty: 0.3 },
        ]
      ),
      positions: ['Hành chính', 'Kế toán viên', 'C&B', 'Nhập liệu'],
      badge: '⚙️',
      description: 'Người bảo đảm sự ổn định và trơn tru cho bộ máy vận hành. Họ tỉ mỉ, trung thành và kiên trì với những quy trình lặp đi lặp lại đòi hỏi độ chuẩn xác cao.',
    },
    // 5. Nhà Sáng tạo (The Innovator)
    {
      role: 'Nhà Sáng tạo',
      score: calculateSMA(
        [
          { value: opn, threshold: 7.5 },
        ],
        [
          { value: lrn, weight: 40, threshold: 7.0 },
          { value: ext, weight: 30, threshold: 6.0 },
          { value: emp, weight: 30, threshold: 6.0 },
        ],
        [
          { value: cau, threshold: 8.5, penalty: 0.4 },
        ]
      ),
      positions: ['Creative/Designer', 'Marketing', 'Content Creator', 'UI/UX'],
      badge: '🎨',
      description: 'Tâm hồn bay bổng với khả năng nhìn nhận vấn đề khác biệt. Họ mang lại sự đổi mới, tập trung vào thẩm mỹ và trải nghiệm cảm xúc của khách hàng.',
    },
    // 6. Người Kiến tạo (Product Builder)
    {
      role: 'Người Kiến tạo',
      score: calculateSMA(
        [
          { value: ach, threshold: 7.0 },
          { value: spd, threshold: 7.0 },
        ],
        [
          { value: log, weight: 40, threshold: 6.5 },
          { value: opn, weight: 40, threshold: 6.5 },
          { value: con, weight: 20, threshold: 6.0 },
        ],
        []
      ),
      positions: ['Product Manager', 'Frontend Dev', 'Growth Hacker'],
      badge: '⚡',
      description: 'Người biến ý tưởng thành sản phẩm thực tế một cách nhanh chóng. Họ cân bằng tốt giữa tư duy đổi mới và khả năng thực thi quyết liệt để tạo kết quả hữu hình.',
    },
    // 7. Cố vấn Phân tích (The Analyst)
    {
      role: 'Cố vấn Phân tích',
      score: calculateSMA(
        [
          { value: log, threshold: 7.5 },
          { value: aut, threshold: 6.0 },
        ],
        [
          { value: cau, weight: 50, threshold: 7.0 },
          { value: con, weight: 30, threshold: 6.5 },
          { value: lrn, weight: 20, threshold: 7.0 },
        ],
        [
          { value: ext, threshold: 8.5, penalty: 0.2 },
        ]
      ),
      positions: ['Data Analyst', 'Business Analyst', 'Nghiên cứu (R&D)'],
      badge: '📊',
      description: 'Những bộ óc phân tích dựa trên bằng chứng dữ liệu. Họ giúp tổ chức nhìn thấu các xu hướng, rủi ro và cơ hội thông qua các mô hình tư duy khách quan.',
    },
    // 8. Chất Kết Dính (The Connector)
    {
      role: 'Chất Kết Dính',
      score: calculateSMA(
        [
          { value: emp, threshold: 7.5 },
          { value: agr, threshold: 7.0 },
        ],
        [
          { value: ext, weight: 40, threshold: 6.5 },
          { value: emo, weight: 40, threshold: 6.0 },
          { value: con, weight: 20, threshold: 6.0 },
        ],
        [
          { value: aut, threshold: 8.5, penalty: 0.3 },
        ]
      ),
      positions: ['Customer Success', 'HR Tuyển dụng', 'Trợ lý', 'Account Executive'],
      badge: '🤝',
      description: 'Người giữ vai trò kết nối con người và xây dựng văn hóa chung. Họ thấu cảm, khéo léo và luôn nỗ lực vì sự hài lòng của khách hàng cũng như nội bộ.',
    },
  ];

  return rolesData
    .map(r => ({
      role: r.role,
      matchScore: r.score,
      matchLevel: (r.score >= 75 ? 'strong' : r.score >= 55 ? 'moderate' : 'weak') as 'strong' | 'moderate' | 'weak',
      positions: r.positions,
      badge: r.badge,
      description: r.description,
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

// ── Tính Culture Fit ──────────────────────────────────────────

export function calcCultureFit(dims: DimensionScore[]): TechzenCultureFit {
  // Trụ cột 1: Người tử tế (Tận tâm, Hòa đồng, Đóng góp xã hội)
  const core1Dims = [
    getDimScore(dims, 'conscientiousness'),
    getDimScore(dims, 'agreeableness'),
    getDimScore(dims, 'social_contribution')
  ];
  const core1Score = core1Dims.reduce((a, b) => a + b, 0) / 3;

  // Trụ cột 2: Học tập suốt đời (Ham học hỏi, Định hướng phát triển, Cởi mở)
  const core2Dims = [
    getDimScore(dims, 'learning_curiosity'),
    getDimScore(dims, 'growth_orientation'),
    getDimScore(dims, 'openness')
  ];
  const core2Score = core2Dims.reduce((a, b) => a + b, 0) / 3;

  // Trụ cột 3: Agile & Linh hoạt (Tốc độ thực thi, Tự chủ, Giao tiếp rõ ràng)
  const core3Dims = [
    getDimScore(dims, 'execution_speed'),
    getDimScore(dims, 'autonomy'),
    getDimScore(dims, 'communication_clarity')
  ];
  const core3Score = core3Dims.reduce((a, b) => a + b, 0) / 3;

  // Trụ cột 4: Giá trị thật (Tư duy logic, Tư duy phản biện, Khát vọng thành tích, Năng lực hiểu dữ liệu)
  const core4Dims = [
    getDimScore(dims, 'logical_thinking'),
    getDimScore(dims, 'critical_thinking'),
    getDimScore(dims, 'achievement_drive'),
    getDimScore(dims, 'data_literacy')
  ];
  const core4Score = core4Dims.reduce((a, b) => a + b, 0) / 4;

  // Trụ cột 5: Văn hóa Nhật Bản (Đồng cảm/EQ, Thận trọng, Định hướng ổn định/Chịu đựng stress)
  const core5Dims = [
    getDimScore(dims, 'empathy'),
    getDimScore(dims, 'caution'),
    getDimScore(dims, 'stability_orientation'),
    getDimScore(dims, 'stress_mental')
  ];
  const core5Score = core5Dims.reduce((a, b) => a + b, 0) / 4;

  const avg = (core1Score + core2Score + core3Score + core4Score + core5Score) / 5;

  return {
    core1Score: Math.round(core1Score * 10),
    core2Score: Math.round(core2Score * 10),
    core3Score: Math.round(core3Score * 10),
    core4Score: Math.round(core4Score * 10),
    core5Score: Math.round(core5Score * 10),
    overallScore: Math.round(avg * 10)
  };
}

// ── Combat Power ─────────────────────────────────────────────

function calcCombatPower(groups: UnifiedGroup[], penaltyApplied: boolean): CombatPowerResult {
  const g = (id: string) => groups.find(x => x.id === id)?.groupScore ?? 5;

  const cognitive  = Math.round(g('cognitive')  * 10);
  const motivation = Math.round(g('motivation') * 10);
  // Stability = bình quân resilience + personality (không double-count)
  const stability  = Math.round(((g('resilience') + g('personality')) / 2) * 10);

  let total = Math.round(cognitive * 0.4 + motivation * 0.3 + stability * 0.3);
  if (penaltyApplied) total = Math.round(total * 0.85);

  const label =
    total >= 85 ? 'Chiến binh hạng S — Sẵn sàng cho mọi thử thách lớn' :
    total >= 70 ? 'Chiến binh hạng A — Năng lực vượt trội, cần định hướng đúng' :
    total >= 55 ? 'Chiến binh hạng B — Tiềm năng tốt, cần phát triển thêm' :
    total >= 40 ? 'Chiến binh hạng C — Phù hợp vị trí ổn định, hạn chế áp lực' :
    'Cần đánh giá bổ sung — Kết quả chưa đủ cơ sở kết luận';

  return { total, cognitive, motivation, stability, penaltyApplied, label };
}

// ── Hàm Public ───────────────────────────────────────────────

/** Tổng hợp UnifiedScoringResult (V4) → UnifiedReportData */
export function buildUnifiedFromV4(result: UnifiedScoringResult, dimensions?: any[]): UnifiedReportData {
  const adapted = adaptToAssessmentResult(result);
  const dims = adapted.dimensions as DimensionScore[];

  const groups = buildGroups(
    dims,
    adapted.reliability.lieScore,
    adapted.reliability.consistencyScore,
    adapted.reliability.speedFlag,
    dimensions,
  );

  const suitability = calcSuitability(groups);
  const penaltyApplied = result.penaltyMultiplier < 1.0;
  const combatPower = calcCombatPower(groups, penaltyApplied);
  const techzenCultureFit = calcCultureFit(dims);

  const integrityLevel =
    result.reliabilityLevel === 'low-interpretability' ? 'risk' :
    result.reliabilityLevel === 'use-with-caution'     ? 'warning' : 'ok';
  // 'reliable' | 'mostly-reliable' → 'ok'

  return {
    sourceType: 'SPI_UNIFIED_V4',
    groups,
    suitability,
    topRole: suitability[0],
    combatPower,
    integrityLevel,
    integrityNote: adapted.reliability.details,
    // [v4.1] Expose reliability data mới cho UI
    reliabilityScore: (adapted.reliability as any).reliabilityScore,
    interpretationCaveat: (adapted.reliability as any).interpretationCaveat,
    interpretationConfidence: (adapted.reliability as any).interpretationConfidence,
    techzenCultureFit,
  };
}

/** Tổng hợp AssessmentResult (V2 legacy) → UnifiedReportData */
export function buildUnifiedFromV2(result: AssessmentResult, dimensions?: any[]): UnifiedReportData {
  const dims = result.dimensions;
  const rel  = result.reliability;

  const groups = buildGroups(
    dims,
    rel.lieScore,
    rel.consistencyScore,
    rel.speedFlag,
    dimensions,
  );

  const suitability = calcSuitability(groups);
  const penaltyApplied = rel.level !== 'high';
  const combatPower = calcCombatPower(groups, penaltyApplied);
  const techzenCultureFit = calcCultureFit(dims);

  const integrityLevel =
    rel.level === 'invalid' || rel.level === 'low' ? 'risk' :
    rel.level === 'medium' ? 'warning' : 'ok';

  return {
    sourceType: 'SPI_V2',
    groups,
    suitability,
    topRole: suitability[0],
    combatPower,
    integrityLevel,
    integrityNote: rel.details,
    techzenCultureFit,
  };
}
