// ============================================================
// OPENAI NARRATIVE SERVICE — Techzen HR Assessment v2
// Gọi OpenAI GPT để tạo nhận xét chuyên sâu theo điểm số
// ============================================================

import type { AssessmentResult } from '../data/scoring';
import type { PersonaType, CombatPower, DutyScore } from '../data/aiAnalysis';

const API_KEY = process.env.VITE_OPENAI_KEY || process.env.OPENAI_API_KEY;

export interface AIReport {
  executiveSummary: string;          // Tóm tắt tổng thể ~150 từ
  strengthsNarrative: string;        // Phân tích điểm mạnh ~100 từ
  developmentNarrative: string;      // Điểm cần phát triển ~100 từ
  fitAnalysis: string;               // Phân tích độ phù hợp vị trí ~100 từ
  hrRecommendation: string;          // Khuyến nghị HR ~80 từ
  language: 'vi' | 'en' | 'ja';
  generatedAt: string;
  fromCache: boolean;
}

/** Tóm tắt dữ liệu gửi lên AI — nhỏ gọn để tránh token cao */
function buildPromptData(
  result: AssessmentResult,
  persona: PersonaType,
  combatPower: CombatPower,
  duties: DutyScore[],
  lang: 'vi' | 'en' | 'ja',
): string {
  const top5 = [...result.dimensions]
    .filter(d => !['lie_scale'].includes(d.dimensionId))
    .sort((a, b) => b.scaled - a.scaled)
    .slice(0, 5)
    .map(d => `${d.dimensionId}=${d.scaled}/10`)
    .join(', ');

  const bottom3 = [...result.dimensions]
    .filter(d => !['lie_scale'].includes(d.dimensionId))
    .sort((a, b) => a.scaled - b.scaled)
    .slice(0, 3)
    .map(d => `${d.dimensionId}=${d.scaled}/10`)
    .join(', ');

  const suitableDuties = duties.filter(d => d.suitable).map(d => d.duty).join(', ');
  const reliability = result.reliability.level;

  const langInstructions: Record<'vi' | 'en' | 'ja', string> = {
    vi: 'Viết toàn bộ phản hồi bằng tiếng Việt.',
    en: 'Write the entire response in English.',
    ja: '全ての回答を日本語で書いてください。',
  };

  return `You are an expert HR psychologist analyzing a personality assessment result (similar to Japan's Scouter SS system based on Big Five personality model).

${langInstructions[lang]}

Assessment data:
- Persona Type: ${persona.emoji} ${persona.title}
- Combat Power: ${combatPower.total}/100, Rank: ${combatPower.rank} (${combatPower.label})
- Top 5 strengths: ${top5}
- Areas to develop: ${bottom3}
- Suitable roles: ${suitableDuties || 'Not determined'}
- Response reliability: ${reliability}

Generate a professional HR assessment report in JSON with these exact keys:
{
  "executiveSummary": "~120 word overall summary covering personality type and potential",
  "strengthsNarrative": "~80 word analysis of key strengths and how they manifest at work",
  "developmentNarrative": "~80 word analysis of development areas with specific suggestions",
  "fitAnalysis": "~80 word analysis of role fit and work environment recommendations",
  "hrRecommendation": "~60 word concrete HR recommendations for onboarding/management"
}

Return ONLY the JSON object, no markdown, no extra text.`;
}

/** Gọi OpenAI API để lấy báo cáo thực */
export async function generateAIReport(
  result: AssessmentResult,
  persona: PersonaType,
  combatPower: CombatPower,
  duties: DutyScore[],
  lang: 'vi' | 'en' | 'ja' = 'vi',
): Promise<AIReport | null> {
  if (!API_KEY) {
    console.warn('[AIReport] No VITE_OPENAI_KEY found. Skipping AI report.');
    return null;
  }

  // Check cache
  const cacheKey = `ai_report_${lang}_${JSON.stringify({ top: result.dimensions.slice(0, 5).map(d => d.scaled) })}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached) as AIReport;
    return { ...parsed, fromCache: true };
  }

  try {
    const prompt = buildPromptData(result, persona, combatPower, duties, lang);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('[AIReport] OpenAI API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices[0]?.message?.content ?? '';
    const parsed = JSON.parse(content) as Omit<AIReport, 'language' | 'generatedAt' | 'fromCache'>;

    const report: AIReport = {
      ...parsed,
      language: lang,
      generatedAt: new Date().toISOString(),
      fromCache: false,
    };

    // Cache in session
    sessionStorage.setItem(cacheKey, JSON.stringify(report));
    return report;

  } catch (err) {
    console.error('[AIReport] Error:', err);
    return null;
  }
}
