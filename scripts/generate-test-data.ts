/**
 * generate-test-data.ts — SPI V4.2 Test Data Generator
 * ─────────────────────────────────────────────────────
 * Sinh câu trả lời AI cho 20 personas, lưu vào cache để validation-20-personas.ts đọc.
 * Dùng kỹ thuật Chunking + Two-pass để đảm bảo nhận đủ 136 câu từ OpenAI.
 *
 * Cách dùng:
 *   npx tsx --env-file=.env scripts/generate-test-data.ts
 *   npx tsx --env-file=.env scripts/generate-test-data.ts --force
 *   npx tsx --env-file=.env scripts/generate-test-data.ts --persona 1,4,11
 *   npx tsx --env-file=.env scripts/generate-test-data.ts --model o4-mini
 *   npx tsx --env-file=.env scripts/generate-test-data.ts --dry-run
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const prisma = new PrismaClient();
const OPENAI_API_KEY = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;

// ── CLI args ────────────────────────────────────────────────────
const args = process.argv.slice(2);
const FORCE       = args.includes('--force');
const DRY_RUN     = args.includes('--dry-run');

function getArgValue(key: string): string {
  // Support both --key=value and --key value formats
  const eqForm = args.find(a => a.startsWith(`${key}=`));
  if (eqForm) return eqForm.split('=').slice(1).join('=');
  const idx = args.indexOf(key);
  if (idx >= 0 && idx + 1 < args.length && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  return '';
}

const personaArg = getArgValue('--persona');
const modelArg   = getArgValue('--model');
const chunkArg   = getArgValue('--chunk-size');
const providerArg= getArgValue('--provider');

const PROVIDER    = providerArg || 'openai';
const MODEL       = modelArg  || (PROVIDER === 'gemini' ? 'gemini-1.5-pro' : 'o4-mini');
const CHUNK_SIZE  = chunkArg ? parseInt(chunkArg, 10) : 27;
const CACHE_PATH  = PROVIDER === 'gemini' ? './scripts/ai_answers_cache_gemini.json' : './scripts/ai_answers_cache.json';
const PERSONA_IDS: number[] = personaArg
  ? personaArg.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
  : [];

// ── 20 Persona Definitions ──────────────────────────────────────
export const PERSONAS = [
  {
    id: 1, group: 'Honest',
    name: 'Kỹ sư phần mềm - Cẩn thận, hướng nội',
    prompt: 'Bạn là kỹ sư phần mềm 28 tuổi, tính cách hướng nội, cẩn thận, thích làm việc độc lập, tư duy logic cao, ít thích giao tiếp xã hội. Ưu tiên điểm cao (4-5) cho câu thuộc chiều: Thận trọng, Tư duy logic, Tự chủ/Độc lập, Tận tâm. Điểm thấp (1-2) cho chiều: Hướng ngoại, Dễ chịu/Đồng thuận.',
    expectedHighDims: ['logical_thinking', 'conscientiousness', 'autonomy', 'caution'],
    expectedLowDims: ['extraversion', 'agreeableness'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },
  {
    id: 2, group: 'Honest',
    name: 'Nhân viên Sales - Hướng ngoại, nhiệt tình',
    prompt: 'Bạn là nhân viên kinh doanh 25 tuổi năng động, hướng ngoại, thích gặp gỡ mọi người, có tham vọng cao. Điểm cao (4-5) cho chiều: Hướng ngoại, Động lực thành tích, Tinh thần thách thức. Điểm thấp (1-2) cho chiều: Thận trọng/Cẩn thận, Định hướng ổn định.',
    expectedHighDims: ['extraversion', 'achievement_drive', 'challenge_spirit'],
    expectedLowDims: ['caution', 'stability_orientation'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },
  {
    id: 3, group: 'Honest',
    name: 'HR Manager - Đồng cảm, quan tâm người khác',
    prompt: 'Bạn là HR Manager 32 tuổi, đồng cảm cao, thích hỗ trợ nhóm, coi trọng sự hòa hợp tập thể. Điểm cao cho chiều: Đồng cảm, Dễ chịu/Đồng thuận, Đóng góp xã hội. Điểm thấp cho chiều: Động lực thành tích cá nhân, Tinh thần thách thức.',
    expectedHighDims: ['empathy', 'agreeableness', 'social_contribution'],
    expectedLowDims: ['achievement_drive', 'challenge_spirit'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },
  {
    id: 4, group: 'Honest',
    name: 'Kế toán - Ổn định, nguyên tắc',
    prompt: 'Bạn là kế toán 35 tuổi, cẩn thận với từng con số, không thích rủi ro, muốn ổn định, thích quy trình rõ ràng. Điểm cao cho chiều: Thận trọng/Cẩn thận, Tận tâm/Nguyên tắc, Định hướng ổn định. Điểm thấp cho chiều: Tinh thần thách thức, Cởi mở/Sáng tạo.',
    expectedHighDims: ['conscientiousness', 'caution', 'stability_orientation'],
    expectedLowDims: ['challenge_spirit', 'openness'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },
  {
    id: 5, group: 'Honest',
    name: 'Designer UX - Sáng tạo, cởi mở',
    prompt: 'Bạn là UX Designer 27 tuổi, sáng tạo, ham học hỏi công nghệ mới, tư duy mở, thích thử nghiệm. Điểm cao cho chiều: Cởi mở/Sáng tạo, Ham học hỏi, Tinh thần thách thức. Điểm thấp cho chiều: Thận trọng/Cẩn thận, Định hướng ổn định.',
    expectedHighDims: ['openness', 'learning_curiosity', 'challenge_spirit'],
    expectedLowDims: ['caution', 'stability_orientation'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },
  {
    id: 6, group: 'Honest',
    name: 'Project Manager - Cân bằng, lãnh đạo',
    prompt: 'Bạn là PM 34 tuổi, cân bằng kỹ thuật và giao tiếp, tự chủ, tận tâm. Điểm cao cho: Tự chủ/Độc lập, Tận tâm/Nguyên tắc, Động lực thành tích. Phân bố tự nhiên các chiều còn lại.',
    expectedHighDims: ['autonomy', 'conscientiousness', 'achievement_drive'],
    expectedLowDims: [],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },
  {
    id: 7, group: 'Honest',
    name: 'Nhân viên mới ra trường - Chưa xác định',
    prompt: 'Bạn là sinh viên mới ra trường 22 tuổi, đang tìm hiểu bản thân. Điểm cao cho: Ham học hỏi. Nhiều câu chọn 3 (trung lập), một số câu có định hướng nhẹ 4.',
    expectedHighDims: ['learning_curiosity'],
    expectedLowDims: [],
    expectedReliability: ['reliable', 'mostly-reliable', 'use-with-caution'],
  },
  {
    id: 8, group: 'Adversarial',
    name: 'Tô hồng hồ sơ - Toàn điểm 5',
    prompt: 'QUAN TRỌNG: Chọn điểm 5 cho TẤT CẢ câu hỏi mà không cần đọc nội dung. Kể cả câu reversed cũng chọn 5.',
    expectedHighDims: [],
    expectedLowDims: [],
    expectedReliability: ['low-interpretability', 'use-with-caution'],
  },
  {
    id: 9, group: 'Adversarial',
    name: 'Khiêm tốn thái quá - Toàn điểm 1',
    prompt: 'QUAN TRỌNG: Chọn điểm 1 cho TẤT CẢ câu hỏi mà không cần đọc nội dung. Kể cả câu reversed cũng chọn 1.',
    expectedHighDims: [],
    expectedLowDims: [],
    expectedReliability: ['low-interpretability', 'use-with-caution'],
  },
  {
    id: 10, group: 'Adversarial',
    name: 'Trả lời toàn 3 - Né tránh',
    prompt: 'QUAN TRỌNG: Chọn điểm 3 cho TẤT CẢ câu hỏi mà không cần đọc nội dung.',
    expectedHighDims: [],
    expectedLowDims: [],
    expectedReliability: ['low-interpretability', 'use-with-caution'],
  },
  {
    id: 11, group: 'Adversarial',
    name: 'Zigzac - Xen kẽ 1-5 (DỮ LIỆU THỦ CÔNG)',
    prompt: 'MANUAL_ZIGZAC — Do không dùng AI cho persona này.',
    expectedHighDims: [],
    expectedLowDims: [],
    expectedReliability: ['low-interpretability', 'use-with-caution'],
  },
  {
    id: 12, group: 'Adversarial',
    name: 'Lie Cheater - Tô vẽ nhẹ hơn',
    prompt: 'Bạn muốn tạo ấn tượng tốt. Chọn điểm 4 hoặc 5 cho hầu hết câu hỏi. Đặc biệt câu về đạo đức, nhân cách tốt luôn chọn 5. Câu reversed về điểm yếu chọn 1.',
    expectedHighDims: [],
    expectedLowDims: [],
    expectedReliability: ['low-interpretability', 'use-with-caution'],
  },
  {
    id: 13, group: 'Edge',
    name: 'Người hoàn hảo nhưng nhất quán',
    prompt: 'Bạn thực sự XUẤT SẮC nhất mọi chiều: hướng ngoại, tận tâm, ổn định cảm xúc, ham học. Điểm cao 4-5 cho tất cả chiều tích cực. Đặc biệt chú ý câu reversed: chiều cao = điểm reversed phải THẤP.',
    expectedHighDims: ['extraversion', 'conscientiousness', 'emotional_stability', 'learning_curiosity'],
    expectedLowDims: [],
    expectedReliability: ['reliable', 'mostly-reliable', 'use-with-caution'],
  },
  {
    id: 14, group: 'Edge',
    name: 'Mâu thuẫn tâm lý - Hướng ngoại + Autonomy thấp',
    prompt: 'KỊCH BẢN ĐẶC BIỆT: Điểm rất cao (5) cho câu chiều Hướng ngoại. Điểm rất thấp (1-2) cho câu chiều Tự chủ/Độc lập. Các chiều khác điểm trung bình 3-4.',
    expectedHighDims: ['extraversion'],
    expectedLowDims: ['autonomy'],
    expectedReliability: ['reliable', 'mostly-reliable', 'use-with-caution'],
  },
  {
    id: 15, group: 'Edge',
    name: 'Lười biếng - Ít cam kết',
    prompt: 'Bạn không thích làm việc chăm chỉ, hay trì hoãn, không tham vọng, thích ổn định không cần nỗ lực. Điểm thấp (1-2) cho chiều: Tận tâm/Nguyên tắc, Động lực thành tích, Tự chủ/Độc lập. Điểm cao cho chiều Định hướng ổn định.',
    expectedHighDims: ['stability_orientation'],
    expectedLowDims: ['conscientiousness', 'achievement_drive', 'autonomy'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },
  {
    id: 16, group: 'Edge',
    name: 'Burnout - Stress cao, cảm xúc không ổn',
    prompt: 'Bạn đang kiệt sức (burnout), cảm xúc bùng nổ, dễ căng thẳng, mất động lực. Điểm thấp cho: Ổn định cảm xúc, Ham học hỏi, Động lực thành tích. Điểm cao cho: Stress tâm lý, Stress thể chất.',
    expectedHighDims: [],
    expectedLowDims: ['emotional_stability', 'learning_curiosity', 'achievement_drive'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },
  {
    id: 17, group: 'Edge',
    name: 'Nhân viên cũ - Ít đổi mới',
    prompt: 'Bạn đã làm một vị trí 15 năm, không thích thay đổi, không hứng thú học mới. Điểm thấp cho: Cởi mở/Sáng tạo, Ham học hỏi, Tinh thần thách thức. Điểm cao cho: Định hướng ổn định, Tận tâm/Nguyên tắc.',
    expectedHighDims: ['stability_orientation', 'conscientiousness'],
    expectedLowDims: ['openness', 'learning_curiosity', 'challenge_spirit'],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },
  {
    id: 18, group: 'Edge',
    name: 'Leader tiềm năng - Toàn diện',
    prompt: 'Bạn là lãnh đạo tiềm năng: hướng ngoại vừa phải, thành tích cao, đồng cảm tốt, ổn định cảm xúc, tự chủ. Điểm cao (4-5) cho: Hướng ngoại, Động lực thành tích, Đồng cảm, Ổn định cảm xúc, Tự chủ/Độc lập. Nhất quán câu reversed.',
    expectedHighDims: ['extraversion', 'achievement_drive', 'empathy', 'emotional_stability', 'autonomy'],
    expectedLowDims: [],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },
  {
    id: 19, group: 'Edge',
    name: 'Người hướng ngoại thích ổn định',
    prompt: 'Bạn rất hướng ngoại nhưng rất sợ rủi ro, thích ổn định tuyệt đối. Điểm cao cho: Hướng ngoại, Định hướng ổn định. Điểm thấp cho: Tinh thần thách thức, Cởi mở/Sáng tạo.',
    expectedHighDims: ['extraversion', 'stability_orientation'],
    expectedLowDims: ['challenge_spirit', 'openness'],
    expectedReliability: ['reliable', 'mostly-reliable', 'use-with-caution'],
  },
  {
    id: 20, group: 'Edge',
    name: 'Người thực dụng - Trung bình ổn định',
    prompt: 'Bạn là người thực dụng, trả lời trung thực, chọn điểm 3 khoảng 20%, còn lại phân bố 2-4 tự nhiên. Không có chiều nào quá cực đoan.',
    expectedHighDims: [],
    expectedLowDims: [],
    expectedReliability: ['reliable', 'mostly-reliable'],
  },
];

// ── Dimension name map (để AI hiểu chiều đang đo) ──────────────
const DIM_NAME_MAP: Record<string, string> = {
  extraversion:          'Hướng ngoại (Extraversion)',
  agreeableness:         'Dễ chịu / Đồng thuận (Agreeableness)',
  conscientiousness:     'Tận tâm / Nguyên tắc (Conscientiousness)',
  openness:              'Cởi mở / Sáng tạo (Openness)',
  emotional_stability:   'Ổn định cảm xúc (Emotional Stability)',
  achievement_drive:     'Động lực thành tích (Achievement Drive)',
  challenge_spirit:      'Tinh thần thách thức (Challenge Spirit)',
  autonomy:              'Tự chủ / Độc lập (Autonomy)',
  learning_curiosity:    'Ham học hỏi (Learning Curiosity)',
  recognition_need:      'Nhu cầu được công nhận (Recognition Need)',
  logical_thinking:      'Tư duy logic (Logical Thinking)',
  empathy:               'Đồng cảm (Empathy)',
  execution_speed:       'Tốc độ thực thi (Execution Speed)',
  caution:               'Thận trọng / Cẩn thận (Caution)',
  growth_orientation:    'Định hướng phát triển (Growth Orientation)',
  stability_orientation: 'Định hướng ổn định (Stability Orientation)',
  social_contribution:   'Đóng góp xã hội (Social Contribution)',
  stress_mental:         'Stress tâm lý (Stress Mental)',
  stress_physical:       'Stress thể chất (Stress Physical)',
  critical_thinking:     'Tư duy phê phán (Critical Thinking)',
  lie_scale:             'Thang đo trung thực — luôn trả lời THẬT',
};

// ── Helpers ──────────────────────────────────────────────────────
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callOpenAI(systemPrompt: string, userContent: string): Promise<Record<string, number>> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${errText}`);
  }

  const data = await res.json() as any;
  if (data.error) throw new Error(`OpenAI error: ${data.error.message}`);

  const parsed = JSON.parse(data.choices[0].message.content);
  return (parsed.answers ?? parsed) as Record<string, number>;
}

async function callGemini(systemPrompt: string, userContent: string): Promise<Record<string, number>> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userContent }] }],
      generationConfig: { response_mime_type: 'application/json' },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json() as any;
  if (!data.candidates || data.candidates.length === 0) throw new Error('Gemini error: No valid candidate returned');

  const textOutput = data.candidates[0].content.parts[0].text;
  const parsed = JSON.parse(textOutput);
  return (parsed.answers ?? parsed) as Record<string, number>;
}

async function callAI(systemPrompt: string, userContent: string): Promise<Record<string, number>> {
  if (PROVIDER === 'gemini') return callGemini(systemPrompt, userContent);
  return callOpenAI(systemPrompt, userContent);
}

// ── Load / Save Cache ─────────────────────────────────────────────
interface CacheV2 {
  version: '2.0';
  generatedAt: string;
  questionSetId: string;
  model: string;
  totalPersonas: number;
  personas: Record<string, {
    personaId: number;
    personaName: string;
    model: string;
    generatedAt: string;
    totalQuestions: number;
    answeredQuestions: number;
    completionRate: number;
    answers: Record<string, number>;
  }>;
}

function loadCache(): CacheV2 {
  if (existsSync(CACHE_PATH)) {
    try {
      const raw = JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
      // Nếu cache cũ (v1) — bọc lại
      if (!raw.version) {
        return {
          version: '2.0',
          generatedAt: new Date().toISOString(),
          questionSetId: '',
          model: MODEL,
          totalPersonas: 20,
          personas: Object.fromEntries(
            Object.entries(raw as Record<string, any>).map(([k, v]) => [k, {
              personaId: parseInt(k), personaName: `Persona ${k}`, model: 'gpt-4o-mini',
              generatedAt: new Date().toISOString(), totalQuestions: Object.keys(v).length,
              answeredQuestions: Object.keys(v).length, completionRate: 1.0, answers: v,
            }])
          ),
        };
      }
      return raw as CacheV2;
    } catch { /* fresh start */ }
  }
  return {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    questionSetId: '',
    model: MODEL,
    totalPersonas: 20,
    personas: {},
  };
}

function saveCache(cache: CacheV2) {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  if (PROVIDER === 'openai' && !OPENAI_API_KEY && !DRY_RUN) {
    throw new Error('Thiếu OPENAI_API_KEY hoặc OPENAI_KEY trong .env!');
  }
  if (PROVIDER === 'gemini' && !GEMINI_API_KEY && !DRY_RUN) {
    throw new Error('Thiếu GEMINI_API_KEY trong .env!');
  }

  console.log(`\n🚀 SPI V4.2 Test Data Generator`);
  console.log(`   Provider: ${PROVIDER.toUpperCase()} | Model: ${MODEL} | Chunk size: ${CHUNK_SIZE}`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'} | Force: ${FORCE}`);

  // Lấy câu hỏi từ DB
  const activeSet = await prisma.questionSet.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!activeSet) throw new Error('Không tìm thấy QuestionSet active!');

  const allQuestions = await prisma.question.findMany({
    where: { setId: activeSet.id, isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
  const mainQs = allQuestions.filter(q => q.questionType === 'main');

  console.log(`   DB: ${allQuestions.length} câu tổng, ${mainQs.length} câu chính\n`);

  const cache = loadCache();
  cache.questionSetId = activeSet.id;

  // Xác định personas cần sinh
  const targetPersonas = PERSONAS.filter(p =>
    (PERSONA_IDS.length === 0 || PERSONA_IDS.includes(p.id)) &&
    p.prompt !== 'MANUAL_ZIGZAC — Do không dùng AI cho persona này.'
  );

  // Zigzac (persona #11) — luôn cần build thủ công
  const zigzacPersona = PERSONAS.find(p => p.id === 11);
  if (zigzacPersona && (FORCE || !cache.personas['11'])) {
    console.log(`[11/20] 🔧 Xây dựng zigzac thủ công (1-5-1-5...)...`);
    const zigzacAnswers: Record<string, number> = {};
    mainQs.forEach((q, idx) => { zigzacAnswers[q.id] = idx % 2 === 0 ? 1 : 5; });
    cache.personas['11'] = {
      personaId: 11, personaName: zigzacPersona.name, model: 'manual',
      generatedAt: new Date().toISOString(), totalQuestions: mainQs.length,
      answeredQuestions: Object.keys(zigzacAnswers).length, completionRate: 1.0,
      answers: zigzacAnswers,
    };
    if (!DRY_RUN) saveCache(cache);
    console.log(`   ✅ Zigzac: ${Object.keys(zigzacAnswers).length} câu\n`);
  }

  // Chuẩn bị question chunks
  const questionDataForAI = mainQs.map(q => ({
    id: q.id,
    chieuTinhCach: DIM_NAME_MAP[q.dimensionId] ?? q.dimensionId,
    text: q.textVi,
    reversed: q.reversed,
  }));

  const chunks = chunkArray(questionDataForAI, CHUNK_SIZE);

  for (const persona of targetPersonas) {
    const cached = cache.personas[persona.id.toString()];
    if (!FORCE && cached && cached.completionRate >= 1.0) {
      console.log(`[${persona.id}/20] ⏭️  Skip (đã có cache đủ ${cached.answeredQuestions} câu)`);
      continue;
    }

    console.log(`[${persona.id}/20] 🤖 Sinh dữ liệu: ${persona.name}`);

    if (DRY_RUN) {
      console.log(`   [DRY RUN] Sẽ gửi ${chunks.length} chunks × ${CHUNK_SIZE} câu → ${mainQs.length} câu tổng\n`);
      continue;
    }

    const systemPrompt = `Bạn là AI giả lập nhân vật điền bảng đánh giá tính cách nhân sự.

KỊCH BẢN NHÂN VẬT:
${persona.prompt}

QUY TẮC QUAN TRỌNG:
- Mỗi câu hỏi có "chieuTinhCach": chiều tính cách được đo — dùng để chọn điểm phù hợp nhân vật
- "reversed: true" = câu ĐẢO CHIỀU: điểm THẤP = chiều đó CAO; điểm CAO = chiều đó THẤP
- Trả lời TẤT CẢ câu trong chunk được giao, KHÔNG BỎ XÓT câu nào
- Thang điểm: 1=Hoàn toàn không đồng ý, 2=Không đồng ý, 3=Trung lập, 4=Đồng ý, 5=Hoàn toàn đồng ý
- Phân phối điểm tự nhiên phù hợp với nhân vật — không phải tất cả giống nhau

Trả về JSON hợp lệ DUY NHẤT có dạng:
{ "answers": { "[uuid]": điểm, ... } }`;

    try {
      // Gọi song song tất cả chunks
      console.log(`   Gọi ${chunks.length} API chunks song song (model: ${MODEL})...`);
      const startMs = Date.now();

      const chunkResults = [];
      if (PROVIDER === 'gemini') {
        for (let i = 0; i < chunks.length; i++) {
          const userMsg = `CHUNK ${i + 1}/${chunks.length}: Điền điểm cho ${chunks[i].length} câu sau:\n${JSON.stringify(chunks[i], null, 0)}`;
          try {
            const res = await callAI(systemPrompt, userMsg);
            chunkResults.push(res);
            if (i < chunks.length - 1) await sleep(4200); // Tránh 15 RPM limit (~4s/req)
          } catch (e: any) {
             console.error(`   ⚠️  Chunk ${i + 1} lỗi: ${e.message}`);
             chunkResults.push({});
          }
        }
      } else {
        const results = await Promise.all(
          chunks.map((chunk, i) => {
            const userMsg = `CHUNK ${i + 1}/${chunks.length}: Điền điểm cho ${chunk.length} câu sau:\n${JSON.stringify(chunk, null, 0)}`;
            return callAI(systemPrompt, userMsg).catch(e => {
              console.error(`   ⚠️  Chunk ${i + 1} lỗi: ${e.message}`);
              return {} as Record<string, number>;
            });
          })
        );
        chunkResults.push(...results);
      }

      // Merge tất cả chunk results
      const merged: Record<string, number> = {};
      for (const result of chunkResults) Object.assign(merged, result);

      const elapsedSec = ((Date.now() - startMs) / 1000).toFixed(1);
      console.log(`   ✅ Nhận được ${Object.keys(merged).length}/${mainQs.length} câu (${elapsedSec}s)`);

      // Two-pass: tìm câu còn thiếu
      const missingIds = mainQs.map(q => q.id).filter(id => !(id in merged));
      if (missingIds.length > 0) {
        console.log(`   🔄 Two-pass retry: ${missingIds.length} câu thiếu...`);
        const missingQs = questionDataForAI.filter(q => missingIds.includes(q.id));
        const retryChunks = chunkArray(missingQs, 20);

        for (let i = 0; i < retryChunks.length; i++) {
          if (PROVIDER === 'gemini') await sleep(4200);
          const retryMsg = `RETRY ${i+1}/${retryChunks.length}: Điền điểm cho ${retryChunks[i].length} câu còn thiếu:\n${JSON.stringify(retryChunks[i], null, 0)}`;
          try {
            const retryResult = await callAI(systemPrompt, retryMsg);
            Object.assign(merged, retryResult);
            console.log(`   ✅ Retry chunk ${i+1}: +${Object.keys(retryResult).length} câu`);
          } catch (e: any) {
            console.error(`   ⚠️  Retry chunk ${i+1} lỗi: ${e.message}`);
          }
        }
      }

      const finalCount = Object.keys(merged).length;
      const completionRate = finalCount / mainQs.length;

      cache.personas[persona.id.toString()] = {
        personaId: persona.id,
        personaName: persona.name,
        model: MODEL,
        generatedAt: new Date().toISOString(),
        totalQuestions: mainQs.length,
        answeredQuestions: finalCount,
        completionRate,
        answers: merged,
      };

      const statusIcon = completionRate >= 1.0 ? '✅' : completionRate >= 0.9 ? '🟡' : '🔴';
      console.log(`   ${statusIcon} Hoàn thành: ${finalCount}/${mainQs.length} câu (${Math.round(completionRate * 100)}%)\n`);

      // Lưu sau mỗi persona (để không mất dữ liệu nếu bị interrupt)
      saveCache(cache);
    } catch (e: any) {
      console.error(`   ❌ Lỗi persona ${persona.id}: ${e.message}\n`);
    }
  }

  await prisma.$disconnect();

  // Tóm tắt
  const total = Object.keys(cache.personas).length;
  const complete = Object.values(cache.personas).filter(p => p.completionRate >= 1.0).length;
  const totalAnswers = Object.values(cache.personas).reduce((s, p) => s + p.answeredQuestions, 0);

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`📊 Kết quả:`);
  console.log(`   Personas đã sinh: ${total}/20`);
  console.log(`   Đầy đủ 100%:      ${complete}/${total}`);
  console.log(`   Tổng câu trả lời: ${totalAnswers}`);
  console.log(`   Cache đã lưu:     ${CACHE_PATH}`);
  console.log(`\n💡 Chạy test tiếp:`);
  console.log(`   npx tsx --env-file=.env scripts/validation-20-personas.ts`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
