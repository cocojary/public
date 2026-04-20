import { NextResponse } from 'next/server';
import { calculateUnifiedScores } from '@/features/assessment/utils/unifiedEngine';
import {
  getActiveQuestions,
  getActiveDimensions,
  getDimensionRelations,
  toEngineQuestion,
} from '@/server/services/assessmentDataService';

const OPENAI_API_KEY = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;

// Cho phép route chạy lâu (đối với Vercel)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

async function fetchAdversarialAnswers(
  scenarioPrompt: string,
  qList: Array<{ id: string; text: string }>,
): Promise<Record<string, number>> {
  if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');

  const systemPrompt = `
Bạn là AI giả lập người dùng đánh giá nhân sự. Bạn phải TUÂN THỦ TUYỆT ĐỐI kịch bản sau để trả lời bộ câu hỏi (1 = Hoàn toàn không đồng ý, 3 = Trung lập, 5 = Hoàn toàn đồng ý).
KỊCH BẢN: ${scenarioPrompt}

Bắt buộc trả về đúng cấu trúc JSON:
{
  "answers": {
    "[question_uuid]": [điểm_số],
    ...
  }
}
Lưu ý: Key là UUID của câu hỏi. Không giải thích gì thêm, chỉ in ra JSON hợp lệ.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(qList) },
        ],
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    return parsed.answers as Record<string, number>;
  } catch (error) {
    console.error('Lỗi khi fetch OpenAI:', error);
    throw error;
  }
}

export async function GET() {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not set in environment.' }, { status: 500 });
  }

  // Đọc data từ DB thay vì hardcode
  const [dbQuestions, activeDims, dimRelations] = await Promise.all([
    getActiveQuestions(),
    getActiveDimensions(),
    getDimensionRelations(),
  ]);

  const engineQuestions = dbQuestions.map(toEngineQuestion);
  const activeDimIds = activeDims.map(d => d.id);

  // Chỉ truyền text câu hỏi main cho AI (không truyền lie questions)
  const qListForAI = dbQuestions
    .filter(q => q.questionType === 'main')
    .map(q => ({ id: q.id, text: q.textVi }));

  const results = [];
  let passedCount = 0;

  console.log('[Validation] Bắt đầu chạy 5 Adversarial Scenarios bằng gpt-4o-mini...');

  // 1. Lie Scale Cheater
  try {
    const answersLie = await fetchAdversarialAnswers(
      "Bạn đang tìm việc và muốn tỏ ra mình là vị thánh hoàn hảo 100%. Bạn không bao giờ có khuyết điểm, bạn yêu thương tất cả mọi người vô điều kiện. Hãy ưu tiên chọn điểm cao (4, 5) cho tất cả các câu.",
      qListForAI,
    );
    const resLie = calculateUnifiedScores(answersLie, engineQuestions, 0, 1000 * 60 * 15, activeDimIds, dimRelations);
    const isDetected = resLie.dataQuality.lieScale.status !== 'Ok' || resLie.reliabilityScore < 60;
    if (isDetected) passedCount++;
    results.push({
      scenario: 'Lie Scale Cheater',
      passed: isDetected,
      reliabilityScore: resLie.reliabilityScore,
      reliabilityLevel: resLie.reliabilityLevel,
      details: resLie.dataQuality.lieScale.message,
    });
  } catch (e: any) { results.push({ scenario: 'Lie Scale Cheater', error: e.message }); }
  console.log('[Validation] Xong Scenario 1');

  // 2. Straight-Lining / Neutral Bias
  try {
    const answersStraight = await fetchAdversarialAnswers(
      "Bạn không quan tâm nội dung, hãy chọn điểm 3 cho TẤT CẢ các câu hỏi.",
      qListForAI,
    );
    const resStraight = calculateUnifiedScores(answersStraight, engineQuestions, 0, 1000 * 60 * 5, activeDimIds, dimRelations);
    const isDetected = resStraight.dataQuality.neutralBias.status === 'Risk' || resStraight.dataQuality.patternDetection.status !== 'Ok';
    if (isDetected) passedCount++;
    results.push({
      scenario: 'Straight-Lining (Toàn 3)',
      passed: isDetected,
      reliabilityScore: resStraight.reliabilityScore,
      reliabilityLevel: resStraight.reliabilityLevel,
      details: resStraight.dataQuality.neutralBias.message,
    });
  } catch (e: any) { results.push({ scenario: 'Straight-Lining', error: e.message }); }
  console.log('[Validation] Xong Scenario 2');

  // 3. Natural Speed Run
  try {
    const answersSpeed = await fetchAdversarialAnswers(
      "Bạn là một chuyên gia bận rộn, ra quyết định cực nhanh nhưng trả lời chân thực và nhất quán theo profile một lãnh đạo quyết đoán, tự chủ.",
      qListForAI,
    );
    const resSpeed = calculateUnifiedScores(answersSpeed, engineQuestions, 0, 1000 * 130, activeDimIds, dimRelations);
    const isOK = resSpeed.reliabilityScore >= 50 && resSpeed.reliabilityLevel !== 'low-interpretability';
    if (isOK) passedCount++;
    results.push({
      scenario: 'Natural Speed Run',
      passed: isOK,
      reliabilityScore: resSpeed.reliabilityScore,
      reliabilityLevel: resSpeed.reliabilityLevel,
      target: 'Không trừng phạt sai người trả lời nhanh nhưng nhất quán.',
      details: `Speed flag: ${resSpeed.dataQuality.timeTracking.status} | Consistency: ${resSpeed.dataQuality.consistency.status}`,
    });
  } catch (e: any) { results.push({ scenario: 'Natural Speed Run', error: e.message }); }
  console.log('[Validation] Xong Scenario 3');

  // 4. Inconsistency Attack
  try {
    const answersIncon = await fetchAdversarialAnswers(
      "Bạn đang cố tình phá hoại bài đánh giá. Thay vì trả lời tự nhiên, bạn trả lời mâu thuẫn hoàn toàn: nếu mới đồng ý câu trước, câu sau cùng chủ đề bạn sẽ phản đối kịch liệt.",
      qListForAI,
    );
    const resIncon = calculateUnifiedScores(answersIncon, engineQuestions, 0, 1000 * 60 * 10, activeDimIds, dimRelations);
    const isDetected = resIncon.dataQuality.consistency.status !== 'Ok' || resIncon.reliabilityScore < 60;
    if (isDetected) passedCount++;
    results.push({
      scenario: 'Inconsistency Attack',
      passed: isDetected,
      reliabilityScore: resIncon.reliabilityScore,
      reliabilityLevel: resIncon.reliabilityLevel,
      details: resIncon.dataQuality.consistency.message,
    });
  } catch (e: any) { results.push({ scenario: 'Inconsistency Attack', error: e.message }); }
  console.log('[Validation] Xong Scenario 4');

  // 5. Acquiescence Bias (Yes-Sayer)
  try {
    const answersAcq = await fetchAdversarialAnswers(
      "Bạn không đọc kỹ câu hỏi, bạn mắc hội chứng Yes-Sayer nên CHẮC CHẮN chọn điểm 5 trên toàn bộ các câu (dù là câu thuận hay nghịch).",
      qListForAI,
    );
    const resAcq = calculateUnifiedScores(answersAcq, engineQuestions, 0, 1000 * 60 * 10, activeDimIds, dimRelations);
    const isDetected = resAcq.dataQuality.acquiescenceBias.status !== 'Ok' || resAcq.dataQuality.extremeResponder.status !== 'Ok';
    if (isDetected) passedCount++;
    results.push({
      scenario: 'Acquiescence Bias (Toàn 5)',
      passed: isDetected,
      reliabilityScore: resAcq.reliabilityScore,
      reliabilityLevel: resAcq.reliabilityLevel,
      details: `Acquiescence: ${resAcq.dataQuality.acquiescenceBias.status} | Extreme: ${resAcq.dataQuality.extremeResponder.status}`,
    });
  } catch (e: any) { results.push({ scenario: 'Acquiescence Bias (Toàn 5)', error: e.message }); }
  console.log('[Validation] Xong Scenario 5');

  return NextResponse.json({
    success: true,
    totalScenarios: 5,
    passedCount,
    module: 'Adversarial Testing (Module 3)',
    modelUsed: 'gpt-4o-mini',
    dataSource: 'PostgreSQL DB (SPI V4.2)',
    results,
  });
}
