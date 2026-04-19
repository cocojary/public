// ============================================================
// UNIFIED SCORING ENGINE — Techzen SPI V4
// Một code path duy nhất cho tất cả vị trí.
// Xóa hoàn toàn isV3 branching từ V3.
// ============================================================

import type { AssessmentResult, DimensionScore } from '@/features/assessment/data/scoring';
import type { UnifiedScoringResult } from './unifiedEngine';
import { adaptToAssessmentResult } from './unifiedEngine';
import { DIMENSIONS } from '@/features/assessment/data/dimensions';

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
}

export interface CombatPowerResult {
  total: number;
  cognitive: number;
  motivation: number;
  stability: number;
  penaltyApplied: boolean;
  label: string;
}

export interface UnifiedReportData {
  sourceType: 'SPI_V2' | 'SPI_UNIFIED_V4' | 'SPI_DEV_V3_LEGACY';
  groups: UnifiedGroup[];
  suitability: SuitabilityRole[];
  topRole: SuitabilityRole;
  combatPower: CombatPowerResult;
  integrityLevel: 'ok' | 'warning' | 'risk';
  integrityNote: string;
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
  return d && d.scaled > 0 ? clamp(d.scaled) : 5;
}

// ── Xây dựng 6 nhóm từ 20 dimensions ────────────────────────

function buildGroups(dims: DimensionScore[], lieScore: number, consistencyScore: number, speedFlag: boolean): UnifiedGroup[] {
  const makeItem = (id: string): UnifiedScoreItem => {
    const dim = DIMENSIONS.find(d => d.id === id);
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

// ── Profile Matching — 10 RoleTypes ──────────────────────────
//
// Nguyên lý: mỗi vai trò có hồ sơ lý tưởng với:
//   required  — trait CẦN: dưới ngưỡng bị trừ điểm
//   penalty   — trait NGƯỢC: vượt ngưỡng bị trừ điểm
//
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

  type Criterion = { value: number; weight: number; threshold: number };
  type PenaltyCriterion = { value: number; threshold: number; deduct: number };

  function profileScore(required: Criterion[], penalty: PenaltyCriterion[] = []): number {
    let score = 100;

    for (const r of required) {
      if (r.value < r.threshold) {
        const gap = (r.threshold - r.value) / r.threshold;
        score -= r.weight * gap;
      } else {
        const over = Math.min((r.value - r.threshold) / (10 - r.threshold), 1);
        score += r.weight * 0.05 * over;
      }
    }

    for (const p of penalty) {
      if (p.value > p.threshold) {
        const over = Math.min((p.value - p.threshold) / (10 - p.threshold), 1);
        score -= p.deduct * over;
      }
    }

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  const rolesData: { role: RoleType; score: number; positions: string[]; badge: string }[] = [

    // 1. Người Mở cõi (Hunter / Trailblazer)
    {
      role: 'Người Mở cõi',
      score: profileScore(
        [
          { value: ext, weight: 30, threshold: 6.5 },
          { value: chl, weight: 30, threshold: 6.5 },
          { value: spd, weight: 20, threshold: 6.0 },
          { value: emo, weight: 20, threshold: 6.0 },
        ],
        [
          { value: cau,      threshold: 8, deduct: 25 }, // Thận trọng quá -> chậm
          { value: 10 - ext, threshold: 5, deduct: 30 }, // Hướng nội -> khó giao tiếp
        ]
      ),
      positions: ['Sales', 'Business Development', 'Tăng trưởng (Growth)'],
      badge: '🎯',
    },

    // 2. Người Cầm lái (Leader / Driver)
    {
      role: 'Người Cầm lái',
      score: profileScore(
        [
          { value: aut, weight: 30, threshold: 7.0 },
          { value: emp, weight: 25, threshold: 6.5 },
          { value: log, weight: 25, threshold: 6.5 },
          { value: emo, weight: 20, threshold: 6.0 },
        ],
        [
          { value: 10 - aut, threshold: 5, deduct: 30 }, // Thiếu tự chủ -> không ra quyết định được
          { value: agr,      threshold: 9, deduct: 15 }, // Quá dễ dãi -> không kỷ luật được
        ]
      ),
      positions: ['Team Lead', 'Manager', 'CEO'],
      badge: '👑',
    },

    // 3. Chuyên gia Đào sâu (Deep Specialist)
    {
      role: 'Chuyên gia Đào sâu',
      score: profileScore(
        [
          { value: log, weight: 40, threshold: 7.0 },
          { value: cau, weight: 30, threshold: 6.5 },
          { value: con, weight: 20, threshold: 6.5 },
          { value: lrn, weight: 10, threshold: 6.0 },
        ],
        [
          { value: spd, threshold: 8, deduct: 25 }, // Quá vội -> sai sót
          { value: chl, threshold: 8.5, deduct: 15 }, // Quá liều lĩnh
        ]
      ),
      positions: ['Backend Dev', 'System Architect', 'Kế toán trưởng', 'QA/QC'],
      badge: '🔬',
    },

    // 4. Người Chăm chút (Optimizer / Operator)
    {
      role: 'Người Chăm chút',
      score: profileScore(
        [
          { value: con, weight: 40, threshold: 7.0 },
          { value: cau, weight: 30, threshold: 6.5 },
          { value: emo, weight: 20, threshold: 6.0 },
          { value: agr, weight: 10, threshold: 5.5 },
        ],
        [
          { value: chl, threshold: 7.5, deduct: 25 }, // Thích rủi ro -> chán việc lặp lại
          { value: 10 - con, threshold: 5, deduct: 30 }, // Thiếu tỉ mỉ -> không vận hành được
        ]
      ),
      positions: ['Hành chính', 'Kế toán viên', 'C&B', 'Nhập liệu'],
      badge: '⚙️',
    },

    // 5. Nhà Sáng tạo (The Innovator)
    {
      role: 'Nhà Sáng tạo',
      score: profileScore(
        [
          { value: opn, weight: 40, threshold: 7.0 },
          { value: lrn, weight: 25, threshold: 6.5 },
          { value: ext, weight: 20, threshold: 6.0 },
          { value: emp, weight: 15, threshold: 5.5 },
        ],
        [
          { value: cau,      threshold: 8.0, deduct: 25 }, // Quá cẩn thận -> không sáng tạo
          { value: 10 - opn, threshold: 5, deduct: 35 }, // Thiếu cởi mở -> không đổi mới
        ]
      ),
      positions: ['Creative/Designer', 'Marketing', 'Content Creator', 'UI/UX'],
      badge: '🎨',
    },

    // 6. Người Kiến tạo (Product Builder)
    {
      role: 'Người Kiến tạo',
      score: profileScore(
        [
          { value: ach, weight: 30, threshold: 6.5 },
          { value: opn, weight: 25, threshold: 6.5 },
          { value: spd, weight: 25, threshold: 6.0 },
          { value: log, weight: 20, threshold: 6.0 },
        ],
        [
          { value: cau, threshold: 8.5, deduct: 20 }, // Quá cẩn thận -> chậm release
        ]
      ),
      positions: ['Product Manager', 'Frontend Dev', 'Growth Hacker'],
      badge: '⚡',
    },

    // 7. Cố vấn Phân tích (The Analyst)
    {
      role: 'Cố vấn Phân tích',
      score: profileScore(
        [
          { value: log, weight: 40, threshold: 7.0 },
          { value: cau, weight: 30, threshold: 6.5 },
          { value: aut, weight: 20, threshold: 6.0 },
          { value: con, weight: 10, threshold: 6.0 },
        ],
        [
          { value: ext,      threshold: 8.5, deduct: 15 }, // Hướng ngoại -> mất tập trung xử lý dữ liệu
          { value: 10 - log, threshold: 5, deduct: 35 }, // Thiếu logic -> không phân tích được
        ]
      ),
      positions: ['Data Analyst', 'Business Analyst', 'Nghiên cứu (R&D)'],
      badge: '📊',
    },

    // 8. Chất Kết Dính (The Connector)
    {
      role: 'Chất Kết Dính',
      score: profileScore(
        [
          { value: emp, weight: 40, threshold: 7.0 },
          { value: agr, weight: 30, threshold: 6.5 },
          { value: ext, weight: 15, threshold: 6.0 },
          { value: emo, weight: 15, threshold: 6.0 },
        ],
        [
          { value: 10 - emp, threshold: 4, deduct: 30 }, // Thiếu thấu cảm -> khó làm support
          { value: aut,      threshold: 8.5, deduct: 20 }, // Tự chủ quá, cái tôi cao -> khó hỗ trợ
        ]
      ),
      positions: ['Customer Success', 'HR Tuyển dụng', 'Trợ lý', 'Account Executive'],
      badge: '🤝',
    },
  ];

  return rolesData
    .map(r => ({
      role: r.role,
      matchScore: r.score,
      matchLevel: (r.score >= 75 ? 'strong' : r.score >= 55 ? 'moderate' : 'weak') as 'strong' | 'moderate' | 'weak',
      positions: r.positions,
      badge: r.badge,
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
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
export function buildUnifiedFromV4(result: UnifiedScoringResult): UnifiedReportData {
  const adapted = adaptToAssessmentResult(result);
  const dims = adapted.dimensions as DimensionScore[];

  const groups = buildGroups(
    dims,
    adapted.reliability.lieScore,
    adapted.reliability.consistencyScore,
    adapted.reliability.speedFlag,
  );

  const suitability = calcSuitability(groups);
  const penaltyApplied = result.penaltyMultiplier < 1.0;
  const combatPower = calcCombatPower(groups, penaltyApplied);

  const integrityLevel =
    result.reliabilityLevel === 'invalid' ? 'risk' :
    result.reliabilityLevel === 'suspect' ? 'warning' : 'ok';

  return {
    sourceType: 'SPI_UNIFIED_V4',
    groups,
    suitability,
    topRole: suitability[0],
    combatPower,
    integrityLevel,
    integrityNote: adapted.reliability.details,
  };
}

/** Tổng hợp AssessmentResult (V2 legacy) → UnifiedReportData */
export function buildUnifiedFromV2(result: AssessmentResult): UnifiedReportData {
  const dims = result.dimensions;
  const rel  = result.reliability;

  const groups = buildGroups(
    dims,
    rel.lieScore,
    rel.consistencyScore,
    rel.speedFlag,
  );

  const suitability = calcSuitability(groups);
  const penaltyApplied = rel.level !== 'high';
  const combatPower = calcCombatPower(groups, penaltyApplied);

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
  };
}
