// ============================================================
// OPENAI NARRATIVE SERVICE — Techzen HR Assessment v2
// Gọi OpenAI GPT để tạo nhận xét chuyên sâu theo điểm số
// Chỉ chạy server-side (gọi từ Server Action)
// ============================================================

import type { AssessmentResult } from '../data/scoring';
import type { PersonaType, CombatPower, DutyScore } from '../data/aiAnalysis';

export interface AIReport {
  executiveSummary: string;
  strengthsNarrative: string;
  developmentNarrative: string;
  fitAnalysis: string;
  hrRecommendation: string;
  language: 'vi' | 'en' | 'ja';
  generatedAt: string;
  fromCache: boolean;
}

function buildPromptData(
  result: AssessmentResult,
  persona: PersonaType,
  combatPower: CombatPower,
  duties: DutyScore[],
  lang: 'vi' | 'en' | 'ja',
): string {
  const isDev = (result as any).type === 'SPI_DEV_V3';
  const isLeadership = !isDev && result.dimensions.some(
    d => d.dimensionId.includes('strategic_vision') || d.dimensionId.includes('decision_making'),
  );

  const top5 = [...result.dimensions]
    .filter(d => !['lie_scale', 'lie_score'].includes(d.dimensionId))
    .sort((a, b) => b.scaled - a.scaled)
    .slice(0, 5)
    .map(d => `${d.dimensionId}=${d.scaled}/10`)
    .join(', ');

  const bottom3 = [...result.dimensions]
    .filter(d => !['lie_scale', 'lie_score'].includes(d.dimensionId))
    .sort((a, b) => a.scaled - b.scaled)
    .slice(0, 3)
    .map(d => `${d.dimensionId}=${d.scaled}/10`)
    .join(', ');

  const reliability = result.reliability.level;

  const langInstructions: Record<'vi' | 'en' | 'ja', string> = {
    vi: 'Viết toàn bộ phản hồi bằng tiếng Việt. Giọng văn chuyên nghiệp, sắc sảo, mang tính cố vấn cao cấp.',
    en: 'Write the entire response in English. Professional, sharp, and senior consultant tone.',
    ja: '全ての回答を日本語で書いてください。プロフェッショナルで洞察力のあるコンサルタントのような口調で。',
  };

  let expertRole = 'Expert HR Psychologist & Talent Strategist';
  if (isDev) {
    expertRole = 'Expert Technical Architect & Engineering Manager (CTO Perspective)';
  } else if (isLeadership) {
    expertRole = 'Senior Executive Consultant & Management Psychologist';
  }

  const devContext = isDev ? `
- Technical Classification: ${(result as any).technicalClassification?.title}
- Lie Scale Score: ${(result as any).reliability?.lieScore}/10
- Key Insights from Rules: ${JSON.stringify((result as any).insights)}
` : `
- Personality Archetype: ${persona.emoji} ${persona.title}
- Optimal Career Matches (with match scores): ${duties.filter(d => d.score >= 60).map(d => `${d.duty} (${d.score}%)`).join(', ') || 'Not determined'}
`;

  return `You are an ${expertRole} analyzing a personality assessment result.
${langInstructions[lang]}

Assessment context:
${devContext}
- Overall Competency Score: ${combatPower.total}/100 (Rank: ${combatPower.rank} - ${combatPower.label})
- Top 5 Core Strengths: ${top5}
- Top 3 Bottlenecks/Areas to develop: ${bottom3}
- Data Consistency & Reliability: ${reliability}

Please generate a high-impact, actionable assessment report in JSON with these keys:
{
  "executiveSummary": "${isDev ? 'A CTO-level high-level evaluation of this developer (~120 words). Focus on their technical mindset, problem-solving DNA, and collaboration style.' : 'Strong ~120 word summary. If CEO/Leadership indicators are high, focus on strategic potential and management style.'}",
  "strengthsNarrative": "~80 words. Explain HOW these strengths create value in the workplace/organization.",
  "developmentNarrative": "~80 words. Be direct. Identify self-sabotaging behaviors and provide elite-level corrective advice.",
  "fitAnalysis": "~80 words. ${isDev ? 'Analyze how they fit into a modern engineering team (Agile, Startup, or Enterprise).' : 'Deep dive into the career matches. Explain why they fit the suggested roles and what environments they will thrive in.'}",
  "hrRecommendation": "~60 words. Concrete advice for the organization on how to maximize this person's ROI and minimize turnover risk."
}

Return ONLY the JSON object. No markdown, no conversational filler.`;
}

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
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (response.status === 429 || response.status >= 500) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
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
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      console.error('[AIReport] Fetch error:', err);
      return null;
    }
  }
  return null;
}

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

  const prompt = buildPromptData(result, persona, combatPower, duties, lang);
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
