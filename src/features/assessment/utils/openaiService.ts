// ============================================================
// OPENAI NARRATIVE SERVICE — Techzen HR Assessment v4 (Universal)
// Prompt: "Cố vấn nghề nghiệp chiến lược" — Phân tích sâu vai trò ngách
// Chỉ chạy server-side (gọi từ Server Action)
// ============================================================

import type { AssessmentResult } from '../data/scoring';
import type { PersonaType, CombatPower, DutyScore } from '../data/aiAnalysis';
import { DIMENSIONS } from '../data/dimensions';

// ─── OUTPUT STRUCTURE ──────────────────────────────────────────
export interface AIJobFitBlock {
  score: number;   // % tương thích (0–100)
  comment: string; // Nhận xét ngắn gọn
}

export interface AIStrength {
  title: string;    // Tên năng lực
  behavior: string; // Hành vi thực tế trong công việc
}

export interface AIBlindSpot {
  title: string; // Điểm mù
  risk: string;  // Rủi ro tiềm ẩn
}

export interface AICoachingAdvice {
  action: string;    // Hành động cụ thể
  rationale: string; // Lý do / kỳ vọng kết quả
}

export interface AIReport {
  // 1. Thẩm định độ tin cậy
  reliabilityVerdict: string;  // Nhận định về độ trung thực
  reliabilityAlert: boolean;   // true = cảnh báo tô hồng

  // 2. Chân dung cốt cách
  personaTitle: string;       // VD: "Người thực thi thầm lặng"
  personaEmoji: string;       // Emoji đại diện
  personaDescription: string; // Mô tả bản ngã
  personaCombination: string; // Phân tích tổ hợp điểm (mâu thuẫn/cộng hưởng)

  // 3. Thế mạnh & Điểm mù
  strengths: AIStrength[];    // 3 năng lực vượt trội
  blindSpots: AIBlindSpot[];  // Các rủi ro tiềm ẩn

  // 4. Job-Fit Mapping
  jobFit: {
    technical:  AIJobFitBlock; // Dev, R&D
    business:   AIJobFitBlock; // Sales, CS
    operations: AIJobFitBlock; // Kế toán, Hành chính
    management: AIJobFitBlock; // Lead, Manager
  };

  // 5. Lời khuyên phát triển
  coachingAdvice: AICoachingAdvice[];

  // Meta
  language: 'vi' | 'en' | 'ja';
  generatedAt: string;
  fromCache: boolean;
}

// ─── BUILD PROMPT ──────────────────────────────────────────────
function buildPrompt(
  result: AssessmentResult,
  persona: PersonaType,
  combatPower: CombatPower,
  duties: DutyScore[],
  lang: 'vi' | 'en' | 'ja',
): string {
  // Lấy tên Việt của dimension
  const dimName = (id: string) => DIMENSIONS.find(d => d.id === id)?.nameVi ?? id;

  // Lie scale score (đã normalize về 0-10)
  const lieScoreRaw = result.reliability.lieScore;
  // V2 lưu 0-100, V3 lưu 0-10 → chuẩn hóa về 0-10
  const lieScore10 = lieScoreRaw > 10 ? Math.round(lieScoreRaw / 10) : lieScoreRaw;

  // Tất cả dimensions (bỏ lie_scale)
  const allDims = (result.dimensions || []).filter(
    d => !['lie_scale', 'lie_score'].includes(d.dimensionId)
  );

  // Top 5 mạnh nhất
  const top5 = [...allDims]
    .sort((a, b) => b.scaled - a.scaled)
    .slice(0, 5)
    .map(d => `${dimName(d.dimensionId)} = ${d.scaled.toFixed(1)}/10`);

  // Bottom 3 yếu nhất
  const bottom3 = [...allDims]
    .sort((a, b) => a.scaled - b.scaled)
    .slice(0, 3)
    .map(d => `${dimName(d.dimensionId)} = ${d.scaled.toFixed(1)}/10`);

  // Phát hiện mâu thuẫn (contraindications)
  const findScore = (id: string) => allDims.find(d => d.dimensionId === id)?.scaled ?? 0;
  const contradictions: string[] = [];

  if (findScore('achievement_drive') >= 7.5 && findScore('agreeableness') < 4)
    contradictions.push('Chủ động cao + Cộng tác thấp → Nhiệt tình nhưng thiếu làm việc nhóm');
  if (findScore('conscientiousness') >= 7.5 && (findScore('stress_mental') < 4 || findScore('stress_physical') < 4))
    contradictions.push('Tận tâm cao + Chịu áp lực thấp → Nguy cơ kiệt sức khi dự án căng');
  if (findScore('extraversion') >= 7.5 && findScore('logical_thinking') < 4)
    contradictions.push('Năng động cao + Tư duy logic thấp → Giao tiếp tốt nhưng dễ phân tán');
  if (findScore('openness') >= 7.5 && findScore('stability_orientation') < 4)
    contradictions.push('Sáng tạo cao + Ổn định thấp → Ý tưởng nhiều nhưng khó cam kết dài hạn');
  if (findScore('caution') >= 8 && findScore('challenge_spirit') < 3.5)
    contradictions.push('Cẩn trọng quá cao + Tinh thần thách thức thấp → Ngại rủi ro, khó đổi mới');

  const contradictionNote = contradictions.length > 0
    ? `\nMÂU THUẪN ĐÁNG LƯU Ý:\n${contradictions.map(c => `  - ${c}`).join('\n')}`
    : '';

  // Job fit từ calcDutySuitability
  const topDuties = duties
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(d => `${d.duty}: ${d.score}%`)
    .join(', ');

  const langNote = lang === 'vi'
    ? 'Viết HOÀN TOÀN bằng tiếng Việt. Giọng văn chuyên nghiệp, thẳng thắn, mang tính cố vấn cấp cao.'
    : lang === 'ja'
    ? '全て日本語で。プロフェッショナルで直接的なコンサルタントの口調。'
    : 'Write entirely in English. Professional, direct, senior consultant tone.';

  return `Bạn là "Cố vấn Nghề nghiệp Chiến lược" cao cấp của Techzen, chuyên trách đọc vị nhân sự theo hệ thống SOTA Universal V4.
${langNote}

NHIỆM VỤ CỐT LÕI:
1. Thẩm định tính khách quan của dữ liệu bài làm (dựa trên Lie Scale và Consistency).
2. Vẽ chân dung bản ngã chuyên sâu (Persona), đặc biệt là các mâu thuẫn nội tại trong tính cách.
3. Phân loại mức độ tương thích (Job-Fit) cho 4 nhóm ngành chính: Technical, Business, Operations, Management.
4. QUAN TRỌNG: Với mỗi nhóm ngành, không chỉ đưa ra đánh giá chung, bạn phải đề xuất các "VAI TRÒ NGÁCH" (Niche specialization) cụ thể mà người này sẽ tỏa sáng nhất (Ví dụ: Thay vì chỉ nói 'Lập trình viên', hãy gợi ý 'Kỹ sư giải thuật tối ưu' hoặc 'Product Engineer tập trung trải nghiệm').

DỮ LIỆU ĐẦU VÀO:
- Chỉ số nói dối (Lie Scale): ${lieScore10}/10 ${lieScore10 > 7 ? '⚠️ CAO — nghi ngờ tô hồng' : '✓ Trong ngưỡng an toàn'}
- Độ nhất quán: ${result.reliability.consistencyScore}%
- Top 5 điểm mạnh: ${top5.join('; ')}
- Top 3 điểm yếu: ${bottom3.join('; ')}
- Combat Power: ${combatPower.total}/100 — ${combatPower.label}
- Persona hệ thống: ${persona.emoji} ${persona.title}
- Gợi ý vai trò (quy tắc hệ thống): ${topDuties}
${contradictionNote}

ĐÂY LÀ CẤU TRÚC OUTPUT BẮT BUỘC (JSON thuần, không markdown):

{
  "reliabilityVerdict": "Nhận định về độ trung thực dựa trên lieScore và consistency (2-3 câu).",
  "reliabilityAlert": ${lieScore10 > 7 ? 'true' : 'false'},
  "personaTitle": "Tên bản ngã 3-5 từ (Sáng tạo, sắc bén)",
  "personaEmoji": "1 emoji phù hợp",
  "personaDescription": "Mô tả cốt cách tổng thể, bản chất con người trong công việc (60-80 từ).",
  "personaCombination": "Phân tích sự cộng hưởng hoặc mâu thuẫn giữa các nhóm điểm. ${contradictions.length > 0 ? 'Tập trung vào các mâu thuẫn: ' + contradictions.join(', ') : 'Tập trung vào các điểm nổi trội.'}",
  "strengths": [
    {"title": "Tên năng lực nổi trội 1", "behavior": "Hành vi thực tế giúp tạo ra kết quả xuất sắc (25-35 từ)."},
    {"title": "Tên năng lực nổi trội 2", "behavior": "Hành vi thực tế giúp tạo ra kết quả xuất sắc (25-35 từ)."},
    {"title": "Tên năng lực nổi trội 3", "behavior": "Hành vi thực tế giúp tạo ra kết quả xuất sắc (25-35 từ)."}
  ],
  "blindSpots": [
    {"title": "Điểm mù chí mạng 1", "risk": "Rủi ro cụ thể trong môi trường làm việc thực tế (25-35 từ)."},
    {"title": "Điểm mù chí mạng 2", "risk": "Rủi ro cụ thể trong môi trường làm việc thực tế (25-35 từ)."}
  ],
  "jobFit": {
    "technical":  {"score": số_0_đến_100, "comment": "Gợi ý vai trò ngách như Backend/QA/Data/Architect... kèm lý do (30-40 từ)."},
    "business":   {"score": số_0_đến_100, "comment": "Gợi ý vai trò ngách như Sales Hunter/Account/Growth/Marketing... kèm lý do (30-40 từ)."},
    "operations": {"score": số_0_đến_100, "comment": "Gợi ý vai trò ngách như Tài chính/Pháp chế/Vận hành/HR... kèm lý do (30-40 từ)."},
    "management": {"score": số_0_đến_100, "comment": "Gợi ý vai trò ngách như Quản lý thực thi/Truyền cảm hứng/Chiến lược... kèm lý do (30-40 từ)."}
  },
  "coachingAdvice": [
    {"action": "Hành động cụ thể 2 (có thể thực hiện ngay)", "rationale": "Lý do và kết quả kỳ vọng (20-25 từ)"}
  ]
}

Chú ý: Hãy đặc biệt phân tích sự mâu thuẫn trong dữ liệu.`;
}

// ─── RETRY LOGIC ───────────────────────────────────────────────
async function callOpenAIWithRetry(
  apiKey: string,
  prompt: string,
  retries = 2,
): Promise<string | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2200, // Đủ cho 6 JSON sections tiếng Việt
          temperature: 0.65,
          response_format: { type: 'json_object' }, // Đảm bảo JSON thuần
        }),
      });

      if (response.status === 429 || response.status >= 500) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
          continue;
        }
        console.error(`[AIReport] OpenAI error ${response.status} after ${retries} retries`);
        return null;
      }

      if (!response.ok) {
        console.error('[AIReport] OpenAI API error:', response.status);
        return null;
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
      };
      return data.choices[0]?.message?.content ?? null;
    } catch (err) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
        continue;
      }
      console.error('[AIReport] Fetch error:', err);
      return null;
    }
  }
  return null;
}

// ─── MAIN EXPORT ───────────────────────────────────────────────
export async function generateAIReport(
  result: AssessmentResult,
  persona: PersonaType,
  combatPower: CombatPower,
  duties: DutyScore[],
  lang: 'vi' | 'en' | 'ja' = 'vi',
): Promise<AIReport | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('[AIReport] No OPENAI_API_KEY found. Skipping AI report.');
    return null;
  }

  const prompt = buildPrompt(result, persona, combatPower, duties, lang);
  const content = await callOpenAIWithRetry(apiKey, prompt);

  if (!content) return null;

  try {
    const parsed = JSON.parse(content) as Omit<AIReport, 'language' | 'generatedAt' | 'fromCache'>;
    return {
      ...parsed,
      language: lang,
      generatedAt: new Date().toISOString(),
      fromCache: false,
    };
  } catch (err) {
    console.error('[AIReport] Failed to parse OpenAI response:', err);
    return null;
  }
}
