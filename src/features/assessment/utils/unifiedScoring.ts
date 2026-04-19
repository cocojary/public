// ============================================================
// UNIFIED SCORING ENGINE — Techzen SPI SOTA Universal
// Kết hợp dữ liệu từ V2 (dimensions/personality) và V3 (dev scores)
// thành một cấu trúc báo cáo thống nhất 6 nhóm.
// ============================================================

import type { AssessmentResult, DimensionScore } from "@/features/assessment/data/scoring";
import type { DevScoringResult } from "./devScoring";
import { DIMENSIONS } from "@/features/assessment/data/dimensions";

// ── Kiểu dữ liệu đầu ra thống nhất ──────────────────────────

export type RoleType =
  | "Chuyên gia"
  | "Kỹ sư Sản phẩm"
  | "Người dẫn dắt"
  | "Nhân sự Đa năng"
  | "Chiến binh Sales"
  | "Nhân sự Ổn định";

export interface UnifiedScoreItem {
  id: string;
  label: string;
  score: number;       // Thang 1-10
  level: "low" | "medium" | "high";
  description: string;
}

export interface UnifiedGroup {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  items: UnifiedScoreItem[];
  groupScore: number; // Điểm trung bình nhóm (1-10)
}

export interface SuitabilityRole {
  role: RoleType;
  matchScore: number;   // 0-100%
  matchLevel: "strong" | "moderate" | "weak";
  positions: string[];
  badge: string;
}

export interface CombatPowerResult {
  total: number;        // 0-100
  cognitive: number;    // Tư duy (0-100)
  motivation: number;   // Động lực (0-100)
  stability: number;    // Ổn định (0-100)
  penaltyApplied: boolean;
  label: string;
}

export interface UnifiedReportData {
  sourceType: "SPI_V2" | "SPI_DEV_V3" | "UNIFIED";
  groups: UnifiedGroup[];
  suitability: SuitabilityRole[];
  topRole: SuitabilityRole;
  combatPower: CombatPowerResult;
  integrityLevel: "ok" | "warning" | "risk";
  integrityNote: string;
}

// ── Hàm trợ giúp ─────────────────────────────────────────────

function toLevel(score: number): "low" | "medium" | "high" {
  if (score >= 7.5) return "high";
  if (score >= 5) return "medium";
  return "low";
}

function clamp(val: number, min = 0, max = 10): number {
  return Math.max(min, Math.min(max, val));
}

function getDimScore(dims: DimensionScore[], id: string): number {
  const d = dims.find((x) => x.dimensionId === id);
  return d && d.scaled > 0 ? clamp(d.scaled) : 5;
}

function getDevScore(scores: DevScoringResult["scores"], traitId: string): number {
  const s = scores.find((x) => x.traitId === traitId);
  return s ? clamp(s.score) : 5;
}

// ── Chuyển đổi dữ liệu V2 sang 6 nhóm ───────────────────────

function buildGroupsFromV2(result: AssessmentResult): UnifiedGroup[] {
  const dims = result.dimensions;

  // Hàm tạo item từ dimension ID của V2
  const makeItem = (id: string): UnifiedScoreItem => {
    const dim = DIMENSIONS.find((d) => d.id === id);
    const score = getDimScore(dims, id);
    return {
      id,
      label: dim?.nameVi ?? id,
      score,
      level: toLevel(score),
      description: score >= 7 ? (dim?.descHigh ?? "") : (dim?.descLow ?? ""),
    };
  };

  const groups: UnifiedGroup[] = [
    {
      id: "integrity",
      title: "Chỉ số Tin cậy",
      subtitle: "Bộ lọc độ trung thực & nhất quán",
      icon: "🛡️",
      color: "#6366F1",
      items: [
        {
          id: "lie_scale",
          label: "Độ trung thực",
          // V2: lieScore 0-100 → đổi chiều: điểm cao = tốt
          score: clamp(10 - (result.reliability.lieScore / 10)),
          level: toLevel(10 - result.reliability.lieScore / 10),
          description:
            result.reliability.lieScore > 65
              ? "Xu hướng tô vẽ bản thân. Cần xác minh qua phỏng vấn."
              : "Phản hồi trung thực.",
        },
        {
          id: "consistency",
          label: "Tính nhất quán",
          score: clamp(result.reliability.consistencyScore / 10),
          level: toLevel(result.reliability.consistencyScore / 10),
          description:
            result.reliability.consistencyScore >= 70
              ? "Trả lời nhất quán và đáng tin cậy."
              : "Một số câu hỏi mâu thuẫn nhau. Cần xác nhận thêm.",
        },
        {
          id: "speed",
          label: "Sự tập trung",
          score: result.reliability.speedFlag ? 2 : 8,
          level: result.reliability.speedFlag ? "low" : "high",
          description: result.reliability.speedFlag
            ? "Làm bài quá nhanh — không đủ thời gian đọc hiểu câu hỏi."
            : "Thời gian làm bài hợp lý, suy nghĩ cẩn thận.",
        },
      ],
      groupScore: 0,
    },
    {
      id: "personality",
      title: "Tính cách Cốt lõi",
      subtitle: "Big Five — Bản chất con người",
      icon: "🧬",
      color: "#3B82F6",
      items: [
        makeItem("extraversion"),
        makeItem("agreeableness"),
        makeItem("conscientiousness"),
        makeItem("openness"),
        makeItem("emotional_stability"),
      ],
      groupScore: 0,
    },
    {
      id: "cognitive",
      title: "Tư duy & Phong cách",
      subtitle: "Công cụ tư duy — Cách tiếp cận vấn đề",
      icon: "🧠",
      color: "#F59E0B",
      items: [
        makeItem("logical_thinking"),
        makeItem("empathy"),
        makeItem("execution_speed"),
        makeItem("caution"),
      ],
      groupScore: 0,
    },
    {
      id: "motivation",
      title: "Động lực & Giá trị",
      subtitle: "Động cơ bên trong — Điều thúc đẩy họ",
      icon: "🔥",
      color: "#EF4444",
      items: [
        makeItem("achievement_drive"),
        makeItem("challenge_spirit"),
        makeItem("autonomy"),
        makeItem("learning_curiosity"),
        makeItem("recognition_need"),
      ],
      groupScore: 0,
    },
    {
      id: "resilience",
      title: "Chịu đựng Áp lực",
      subtitle: "Độ bền — Khả năng vận hành dưới áp lực",
      icon: "💪",
      color: "#7C3AED",
      items: [makeItem("stress_mental"), makeItem("stress_physical")],
      groupScore: 0,
    },
    {
      id: "culture",
      title: "Gắn kết & Văn hóa",
      subtitle: "Techzen Spirit — Khả năng đi đường dài",
      icon: "🌸",
      color: "#10B981",
      items: [
        // Xây dựng từ các chỉ số liên quan nhất
        {
          id: "loyalty",
          label: "Độ trung thành",
          score: Math.round(
            (getDimScore(dims, "stability_orientation") + getDimScore(dims, "conscientiousness")) / 2
          ),
          level: toLevel(
            (getDimScore(dims, "stability_orientation") + getDimScore(dims, "conscientiousness")) / 2
          ),
          description: "Dự báo khả năng gắn bó dài hạn với tổ chức.",
        },
        {
          id: "proactivity",
          label: "Tính chủ động",
          score: getDimScore(dims, "autonomy"),
          level: toLevel(getDimScore(dims, "autonomy")),
          description: getDimScore(dims, "autonomy") >= 7
            ? "Chủ động, không cần nhắc nhở thường xuyên."
            : "Cần môi trường có hướng dẫn rõ ràng.",
        },
        {
          id: "learning_fit",
          label: "Tinh thần học hỏi",
          score: getDimScore(dims, "learning_curiosity"),
          level: toLevel(getDimScore(dims, "learning_curiosity")),
          description: getDimScore(dims, "learning_curiosity") >= 7
            ? "Luôn cập nhật công nghệ mới — phù hợp văn hóa Techzen."
            : "Cần khuyến khích việc tự học thêm ngoài giờ.",
        },
        {
          id: "integrity_fit",
          label: "Chính trực",
          score: clamp(10 - (result.reliability.lieScore / 10)),
          level: toLevel(10 - result.reliability.lieScore / 10),
          description: "Mức độ minh bạch và trung thực trong giao tiếp.",
        },
        {
          id: "omotenashi",
          label: "Tư duy Omotenashi",
          score: Math.round(
            (getDimScore(dims, "empathy") + getDimScore(dims, "agreeableness") + getDimScore(dims, "social_contribution")) / 3
          ),
          level: toLevel(
            (getDimScore(dims, "empathy") + getDimScore(dims, "agreeableness") + getDimScore(dims, "social_contribution")) / 3
          ),
          description: "Sự tận tâm với khách hàng và đồng nghiệp theo tinh thần Nhật Bản.",
        },
      ],
      groupScore: 0,
    },
  ];

  // Tính groupScore trung bình cho từng nhóm
  for (const g of groups) {
    g.groupScore =
      g.items.length > 0
        ? Math.round((g.items.reduce((s, i) => s + i.score, 0) / g.items.length) * 10) / 10
        : 5;
  }

  return groups;
}

// ── Chuyển đổi dữ liệu V3 sang 6 nhóm ───────────────────────

function buildGroupsFromV3(result: DevScoringResult): UnifiedGroup[] {
  const scores = result.scores;

  const makeDevItem = (traitId: string, label: string, desc?: string): UnifiedScoreItem => {
    const score = getDevScore(scores, traitId);
    return {
      id: traitId,
      label,
      score,
      level: toLevel(score),
      description: desc ?? (score >= 7 ? `Điểm mạnh về ${label}.` : score < 5 ? `Cần phát triển ${label}.` : `Ổn định về ${label}.`),
    };
  };

  // Lie score V3: lieScore là count (0-10 câu)
  const lieScoreNormalized = clamp(10 - (result.lieScore / 10) * 10);

  const groups: UnifiedGroup[] = [
    {
      id: "integrity",
      title: "Chỉ số Tin cậy",
      subtitle: "Bộ lọc độ trung thực & nhất quán",
      icon: "🛡️",
      color: "#6366F1",
      items: [
        {
          id: "lie_scale",
          label: "Độ trung thực",
          score: lieScoreNormalized,
          level: toLevel(lieScoreNormalized),
          description: result.dataQuality.lieScale.message,
        },
        {
          id: "consistency",
          label: "Tính nhất quán",
          score: result.dataQuality.consistency.status === "Ok" ? 8 : result.dataQuality.consistency.status === "Warning" ? 5 : 3,
          level: result.dataQuality.consistency.status === "Ok" ? "high" : result.dataQuality.consistency.status === "Warning" ? "medium" : "low",
          description: result.dataQuality.consistency.message,
        },
        {
          id: "neutral_bias",
          label: "Sự cam kết",
          score: result.dataQuality.neutralBias.status === "Ok" ? 8 : result.dataQuality.neutralBias.status === "Warning" ? 5 : 3,
          level: result.dataQuality.neutralBias.status === "Ok" ? "high" : result.dataQuality.neutralBias.status === "Warning" ? "medium" : "low",
          description: result.dataQuality.neutralBias.message,
        },
        {
          id: "speed",
          label: "Sự tập trung",
          score: result.dataQuality.timeTracking.status === "Ok" ? 8 : result.dataQuality.timeTracking.status === "Warning" ? 5 : 3,
          level: result.dataQuality.timeTracking.status === "Ok" ? "high" : result.dataQuality.timeTracking.status === "Warning" ? "medium" : "low",
          description: result.dataQuality.timeTracking.message,
        },
        {
          id: "pattern",
          label: "Khuôn mẫu phản hồi",
          score: result.dataQuality.patternDetection.status === "Ok" ? 8 : result.dataQuality.patternDetection.status === "Warning" ? 5 : 3,
          level: result.dataQuality.patternDetection.status === "Ok" ? "high" : result.dataQuality.patternDetection.status === "Warning" ? "medium" : "low",
          description: result.dataQuality.patternDetection.message,
        },
      ],
      groupScore: 0,
    },
    {
      id: "personality",
      title: "Tính cách Cốt lõi",
      subtitle: "Hành vi & Tác phong làm việc",
      icon: "🧬",
      color: "#3B82F6",
      items: [
        makeDevItem("trait_02", "Cộng tác & Giao tiếp"),
        makeDevItem("trait_05", "Chính trực & Dũng cảm"),
        makeDevItem("trait_01", "Sự tận tâm & Chỉn chu"),
        makeDevItem("trait_09", "Kiên cường & Áp lực"),
      ],
      groupScore: 0,
    },
    {
      id: "cognitive",
      title: "Tư duy & Phong cách",
      subtitle: "Năng lực tư duy kỹ thuật",
      icon: "🧠",
      color: "#F59E0B",
      items: [
        makeDevItem("trait_04", "Giải quyết vấn đề"),
        makeDevItem("trait_10", "Tư duy hệ thống"),
        makeDevItem("trait_06", "Tổ chức & Kế hoạch"),
        makeDevItem("trait_03", "Thích nghi & Linh hoạt"),
      ],
      groupScore: 0,
    },
    {
      id: "motivation",
      title: "Động lực & Giá trị",
      subtitle: "Động cơ bên trong — Điều thúc đẩy họ",
      icon: "🔥",
      color: "#EF4444",
      items: [
        makeDevItem("trait_11", "Tính chủ động"),
        makeDevItem("trait_07", "Tự học & Đổi mới"),
        makeDevItem("trait_08", "Thấu cảm & Khách hàng"),
      ],
      groupScore: 0,
    },
    {
      id: "resilience",
      title: "Chịu đựng Áp lực",
      subtitle: "Độ bền — Khả năng vận hành dưới áp lực",
      icon: "💪",
      color: "#7C3AED",
      items: [makeDevItem("trait_09", "Kiên cường & Áp lực")],
      groupScore: 0,
    },
    {
      id: "culture",
      title: "Gắn kết & Văn hóa",
      subtitle: "Techzen Spirit — Khả năng đi đường dài",
      icon: "🌸",
      color: "#10B981",
      items: [
        {
          id: "loyalty",
          label: "Độ trung thành",
          score: Math.round((getDevScore(scores, "trait_01") + getDevScore(scores, "trait_05")) / 2),
          level: toLevel(Math.round((getDevScore(scores, "trait_01") + getDevScore(scores, "trait_05")) / 2)),
          description: "Dự báo khả năng gắn bó dài hạn dựa trên tận tâm và chính trực.",
        },
        {
          id: "proactivity",
          label: "Tính chủ động",
          score: getDevScore(scores, "trait_11"),
          level: toLevel(getDevScore(scores, "trait_11")),
          description: "Mức độ tự tìm việc và giải quyết vấn đề không cần nhắc nhở.",
        },
        {
          id: "learning_fit",
          label: "Tinh thần học hỏi",
          score: getDevScore(scores, "trait_07"),
          level: toLevel(getDevScore(scores, "trait_07")),
          description: "Khả năng tự học và cập nhật công nghệ mới liên tục.",
        },
        {
          id: "integrity_fit",
          label: "Chính trực",
          score: getDevScore(scores, "trait_05"),
          level: toLevel(getDevScore(scores, "trait_05")),
          description: "Tính minh bạch và dũng cảm trước sự thật.",
        },
        {
          id: "omotenashi",
          label: "Tư duy Omotenashi",
          score: getDevScore(scores, "trait_08"),
          level: toLevel(getDevScore(scores, "trait_08")),
          description: "Sự tận tâm với khách hàng và đồng nghiệp theo tinh thần Nhật Bản.",
        },
      ],
      groupScore: 0,
    },
  ];

  for (const g of groups) {
    g.groupScore =
      g.items.length > 0
        ? Math.round((g.items.reduce((s, i) => s + i.score, 0) / g.items.length) * 10) / 10
        : 5;
  }

  return groups;
}

// ── Tính toán Suitability Matrix ─────────────────────────────

function calcSuitability(groups: UnifiedGroup[]): SuitabilityRole[] {
  const getGroupScore = (id: string) =>
    groups.find((g) => g.id === id)?.groupScore ?? 5;
  const getItemScore = (groupId: string, itemId: string) =>
    groups.find((g) => g.id === groupId)?.items.find((i) => i.id === itemId)?.score ?? 5;

  const cog = getGroupScore("cognitive");
  const mot = getGroupScore("motivation");
  const per = getGroupScore("personality");
  const res = getGroupScore("resilience");
  const cult = getGroupScore("culture");

  const roles: { role: RoleType; raw: number; positions: string[]; badge: string }[] = [
    {
      role: "Chuyên gia",
      raw: (cog * 0.4 + getItemScore("personality", "conscientiousness") * 0.3 + per * 0.3) * 10,
      positions: ["Lập trình viên (Core/System)", "Tester / QC", "R&D", "Kiểm soát nội bộ", "Kế toán"],
      badge: "🔬",
    },
    {
      role: "Kỹ sư Sản phẩm",
      raw: (cog * 0.3 + mot * 0.3 + getItemScore("cognitive", "execution_speed") * 0.2 + getItemScore("personality", "openness") * 0.2) * 10,
      positions: ["Lập trình viên (Product/Frontend)", "Marketing", "UX Designer", "Creative"],
      badge: "⚡",
    },
    {
      role: "Người dẫn dắt",
      raw: (getItemScore("motivation", "autonomy") * 0.35 + getItemScore("cognitive", "empathy") * 0.3 + mot * 0.35) * 10,
      positions: ["Team Lead", "Quản lý dự án", "Product Manager", "CEO/Manager"],
      badge: "👑",
    },
    {
      role: "Chiến binh Sales",
      raw: (mot * 0.4 + getItemScore("personality", "extraversion") * 0.3 + res * 0.3) * 10,
      positions: ["Kinh doanh (Sales)", "Business Development", "Đại diện thương mại"],
      badge: "🎯",
    },
    {
      role: "Nhân sự Đa năng",
      raw: (per * 0.35 + cult * 0.35 + getItemScore("personality", "agreeableness") * 0.3) * 10,
      positions: ["HR (Nhân sự)", "Admin", "Vận hành", "Customer Success"],
      badge: "🤝",
    },
    {
      role: "Nhân sự Ổn định",
      raw: (getItemScore("personality", "conscientiousness") * 0.4 + getItemScore("personality", "stability_orientation") * 0.35 + per * 0.25) * 10,
      positions: ["Nhập liệu", "Hỗ trợ vận hành", "Lưu trữ hồ sơ", "Công việc quy trình hóa"],
      badge: "⚓",
    },
  ];

  // Normalize về 0-100 và phân mức
  const maxRaw = Math.max(...roles.map((r) => r.raw), 1);
  return roles
    .map((r) => {
      const matchScore = Math.round(Math.min(100, (r.raw / maxRaw) * 100));
      return {
        role: r.role,
        matchScore,
        matchLevel: matchScore >= 75 ? "strong" : matchScore >= 50 ? "moderate" : "weak",
        positions: r.positions,
        badge: r.badge,
      } as SuitabilityRole;
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

// ── Tính toán Combat Power ────────────────────────────────────

function calcCombatPower(groups: UnifiedGroup[], penaltyApplied: boolean): CombatPowerResult {
  const getGroupScore = (id: string) =>
    groups.find((g) => g.id === id)?.groupScore ?? 5;

  const cognitive = Math.round(getGroupScore("cognitive") * 10);
  const motivation = Math.round(getGroupScore("motivation") * 10);
  const stability = Math.round(
    (getGroupScore("resilience") * 0.5 + getGroupScore("personality") * 0.5) * 10
  );

  let total = Math.round(cognitive * 0.4 + motivation * 0.3 + stability * 0.3);

  // Hệ số phạt 15% nếu Integrity thấp
  if (penaltyApplied) total = Math.round(total * 0.85);

  const label =
    total >= 85 ? "Chiến binh hạng S — Sẵn sàng cho mọi thử thách lớn" :
    total >= 70 ? "Chiến binh hạng A — Năng lực vượt trội, cần định hướng đúng" :
    total >= 55 ? "Chiến binh hạng B — Tiềm năng tốt, cần phát triển thêm" :
    total >= 40 ? "Chiến binh hạng C — Phù hợp vị trí ổn định, hạn chế áp lực" :
    "Cần đánh giá bổ sung — Kết quả chưa đủ cơ sở kết luận";

  return { total, cognitive, motivation, stability, penaltyApplied, label };
}

// ── Hàm Public Chính ─────────────────────────────────────────

/** Tổng hợp dữ liệu AssessmentResult (V2) thành UnifiedReportData */
export function buildUnifiedFromV2(result: AssessmentResult): UnifiedReportData {
  const groups = buildGroupsFromV2(result);
  const suitability = calcSuitability(groups);
  const combatPower = calcCombatPower(groups, result.reliability.level !== "high");

  const reliability = result.reliability;
  const integrityLevel =
    reliability.level === "invalid" ? "risk" :
    reliability.level === "low" ? "risk" :
    reliability.level === "medium" ? "warning" : "ok";

  return {
    sourceType: "SPI_V2",
    groups,
    suitability,
    topRole: suitability[0],
    combatPower,
    integrityLevel,
    integrityNote: reliability.details,
  };
}

/** Tổng hợp dữ liệu DevScoringResult (V3) thành UnifiedReportData */
export function buildUnifiedFromV3(result: DevScoringResult): UnifiedReportData {
  const groups = buildGroupsFromV3(result);
  const suitability = calcSuitability(groups);
  const penaltyApplied = result.reliabilityStatus !== "Reliable";
  const combatPower = calcCombatPower(groups, penaltyApplied);

  const integrityLevel =
    result.reliabilityStatus === "Invalid" ? "risk" :
    result.reliabilityStatus === "Suspect" ? "warning" : "ok";

  const integrityNote =
    integrityLevel === "risk"
      ? `⚠️ Dữ liệu không đáng tin cậy (Lie Score: ${result.lieScore}/10). Cần phỏng vấn trực tiếp để xác minh.`
      : integrityLevel === "warning"
      ? `🟡 Kết quả tương đối đáng tin cậy nhưng đã áp dụng hệ số phạt ${Math.round((1 - result.penaltyMultiplier) * 100)}%.`
      : "✅ Kết quả đáng tin cậy. Ứng viên trả lời nghiêm túc và nhất quán.";

  return {
    sourceType: "SPI_DEV_V3",
    groups,
    suitability,
    topRole: suitability[0],
    combatPower,
    integrityLevel,
    integrityNote,
  };
}
