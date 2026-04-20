/**
 * validation-20-personas.ts — SPI V4.2 Validation Runner
 * ─────────────────────────────────────────────────────────
 * ĐỌC cache từ ai_answers_cache.json, chạy scoring engine, xuất báo cáo.
 * KHÔNG gọi OpenAI — dùng generate-test-data.ts để sinh dữ liệu trước.
 *
 * Cách dùng:
 *   npx tsx --env-file=.env scripts/validation-20-personas.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { calculateUnifiedScores } from '../src/features/assessment/utils/unifiedEngine';
import { PERSONAS } from './generate-test-data';

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const providerArg = args.find(a => a.startsWith('--provider='));
const PROVIDER = providerArg ? providerArg.split('=')[1] : (args.includes('--provider') ? args[args.indexOf('--provider') + 1] : 'openai');

const OUTPUT_PATH = PROVIDER === 'gemini' ? './validation_report_gemini.md' : './validation_report.md';
const CACHE_PATH = PROVIDER === 'gemini' ? './scripts/ai_answers_cache_gemini.json' : './scripts/ai_answers_cache.json';

// ── Đọc cache ─────────────────────────────────────────────────────
function loadCache(): Record<string, Record<string, number>> {
  if (!existsSync(CACHE_PATH)) {
    throw new Error(`Không tìm thấy cache tại ${CACHE_PATH}!\nChạy trước: npx tsx --env-file=.env scripts/generate-test-data.ts`);
  }
  const raw = JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
  // Hỗ trợ cả cache v1 (flat) và v2 (có metadata)
  if (raw.version === '2.0') {
    const result: Record<string, Record<string, number>> = {};
    for (const [k, v] of Object.entries(raw.personas as any)) {
      result[k] = (v as any).answers;
    }
    return result;
  }
  return raw as Record<string, Record<string, number>>;
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log('🔍 Đọc cache dữ liệu test...');
  const allAnswers = loadCache();
  const cachedIds = Object.keys(allAnswers);
  console.log(`✅ Cache có ${cachedIds.length} personas: [${cachedIds.join(', ')}]`);

  console.log('🚀 Đang tải cấu hình engine từ DB...');
  const activeSet = await prisma.questionSet.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!activeSet) throw new Error('Không tìm thấy QuestionSet active!');

  const dbQuestions = await prisma.question.findMany({
    where: { setId: activeSet.id, isActive: true },
    orderBy: { displayOrder: 'asc' },
  });

  const dbRelations = await prisma.dimensionRelation.findMany({
    where: { isActive: true },
  });

  const engineQuestions = dbQuestions.map(q => ({
    id: q.id,
    dimensionId: q.dimensionId,
    reversed: q.reversed,
    isLieScale: q.questionType === 'lie_absolute' || q.questionType === 'lie_subtle',
    isLieSubtle: q.questionType === 'lie_subtle',
    lieWeight: q.lieWeight ?? 1.0,
  }));

  const activeDims = await prisma.dimension.findMany({
    where: { isActive: true, group: { not: 'leadership' } },
    orderBy: { displayOrder: 'asc' },
  });
  const activeDimIds = activeDims.map(d => d.id).filter(id => id !== 'lie_scale');

  console.log(`✅ Engine: ${dbQuestions.length} câu hỏi, ${activeDimIds.length} dimensions\n`);

  // ── Chạy từng persona ─────────────────────────────────────────
  const results: Array<{
    persona: typeof PERSONAS[0];
    scoringResult: ReturnType<typeof calculateUnifiedScores>;
    validationFlags: string[];
    overallPass: boolean;
    answerCount: number;
    dimHighCheck: { dim: string; actual: number; pass: boolean }[];
    dimLowCheck: { dim: string; actual: number; pass: boolean }[];
    reliabilityCheck: boolean;
  }> = [];

  for (const persona of PERSONAS) {
    const answers = allAnswers[persona.id.toString()];
    if (!answers) {
      console.log(`[${persona.id}/20] ⏭️  Skip (không có trong cache)`);
      continue;
    }

    console.log(`[${persona.id}/20] Đánh giá: ${persona.name} (${Object.keys(answers).length} câu)...`);

    // Giả lập 15 phút làm bài
    const sr = calculateUnifiedScores(answers, engineQuestions, 0, 900_000, activeDimIds, dbRelations as any);

    const flags: string[] = [];
    const dimHighCheck = persona.expectedHighDims.map(dimId => {
      const d = sr.dimensions.find(x => x.dimensionId === dimId);
      const actual = d?.scaledContinuous ?? 0;
      const pass = actual >= 6.0;
      if (!pass) flags.push(`THẤP_HƠN_KỲ_VỌNG: ${dimId}=${actual.toFixed(1)}`);
      return { dim: dimId, actual, pass };
    });

    const dimLowCheck = persona.expectedLowDims.map(dimId => {
      const d = sr.dimensions.find(x => x.dimensionId === dimId);
      const actual = d?.scaledContinuous ?? 10;
      const pass = actual <= 5.0;
      if (!pass) flags.push(`CAO_HƠN_KỲ_VỌNG: ${dimId}=${actual.toFixed(1)}`);
      return { dim: dimId, actual, pass };
    });

    const reliabilityCheck = persona.expectedReliability.includes(sr.reliabilityLevel);
    if (!reliabilityCheck) {
      flags.push(`SAI_ĐỘ_TIN_CẬY: thực_tế=${sr.reliabilityLevel}, kỳ_vọng=${persona.expectedReliability.join('|')}`);
    }

    const overallPass = reliabilityCheck && dimHighCheck.every(x => x.pass) && dimLowCheck.every(x => x.pass);

    results.push({ persona, scoringResult: sr, validationFlags: flags, overallPass, answerCount: Object.keys(answers).length, dimHighCheck, dimLowCheck, reliabilityCheck });

    const icon = overallPass ? '✅ PASS' : '❌ FAIL';
    console.log(`  → ${icon} | Reliability: ${sr.reliabilityLevel} (${sr.reliabilityScore}) | Lỗi: ${flags.length}`);
  }

  await prisma.$disconnect();

  // ── Tạo báo cáo ───────────────────────────────────────────────
  const passCount = results.filter(r => r.overallPass).length;
  const failCount = results.length - passCount;
  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const reliLabelVi: Record<string, string> = {
    reliable:             '🟢 Đáng tin cậy',
    'mostly-reliable':    '🟡 Tương đối đáng tin',
    'use-with-caution':   '🟠 Cần thận trọng',
    'low-interpretability': '🔴 Không đáng tin / Từ chối giải nghĩa',
  };

  const tStatus = (st: string) =>
    st === 'Ok' ? '🟢 Tốt' : st === 'Warning' ? '🟡 Cảnh báo' : '🔴 Nguy hiểm';

  const groupSummary = ['Honest', 'Adversarial', 'Edge'].map(g => {
    const gr = results.filter(r => r.persona.group === g);
    const gp = gr.filter(r => r.overallPass).length;
    return `| ${g} | ${gr.length} | ${gp} | ${gr.length - gp} | ${gr.length > 0 ? Math.round((gp / gr.length) * 100) : 0}% |`;
  }).join('\n');

  const detailRows = results.map(r => {
    const sr = r.scoringResult;
    const dq = sr.dataQuality;
    const passEmoji = r.overallPass ? '✅ PASS' : '❌ FAIL';
    const reliLabel = reliLabelVi[sr.reliabilityLevel] ?? sr.reliabilityLevel;

    const topDims = [...sr.dimensions].sort((a, b) => b.scaledContinuous - a.scaledContinuous).slice(0, 5)
      .map(d => `${d.dimensionId}(${d.scaledContinuous.toFixed(1)})`).join(', ');

    const highStr = r.dimHighCheck.length > 0
      ? r.dimHighCheck.map(x => `${x.pass ? '✅' : '❌'} ${x.dim}: ${x.actual.toFixed(1)}`).join(' | ')
      : '—';
    const lowStr = r.dimLowCheck.length > 0
      ? r.dimLowCheck.map(x => `${x.pass ? '✅' : '❌'} ${x.dim}: ${x.actual.toFixed(1)}`).join(' | ')
      : '—';
    const flagsStr = r.validationFlags.length > 0
      ? r.validationFlags.map(f => `\`${f}\``).join(', ')
      : 'Không có';

    return `
### ${r.persona.id}. ${passEmoji} — ${r.persona.name} \`[${r.persona.group}]\`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **${sr.reliabilityScore}/100** |
| Đánh giá độ tin cậy | ${reliLabel} |
| Số câu trả lời | ${r.answerCount} |
| Nói dối / Tô hồng | ${tStatus(dq.lieScale.status)} (${dq.lieScale.score}) |
| Độ nhất quán | ${tStatus(dq.consistency.status)} (${dq.consistency.score} lỗi) |
| Thiên kiến trung lập | ${tStatus(dq.neutralBias.status)} (${dq.neutralBias.score}) |
| Khuôn mẫu (Straight-line/Zigzac) | ${tStatus(dq.patternDetection.status)} (${dq.patternDetection.score}) |
| Xu hướng đồng thuận | ${tStatus(dq.acquiescenceBias.status)} (TB=${dq.acquiescenceBias.score}) |
| Chọn cực đoan | ${tStatus(dq.extremeResponder.status)} (${dq.extremeResponder.score}) |

**5 Chiều cao nhất:** ${topDims}

**Kiểm tra điểm cao mong đợi:** ${highStr}

**Kiểm tra điểm thấp mong đợi:** ${lowStr}

**Kiểm tra độ tin cậy:** ${r.reliabilityCheck ? '✅ Đúng' : '❌ Sai'} (Kỳ vọng: \`${r.persona.expectedReliability.join(' | ')}\` → Thực tế: \`${sr.reliabilityLevel}\`)

**Lỗi phát hiện:** ${flagsStr}

---`;
  }).join('\n');

  const report = `# 📊 Báo Cáo Validation Hệ Thống SPI V4.2 — 20 AI Personas (${PROVIDER.toUpperCase()})

> **Thời gian chạy:** ${now}
> **Provider/Model:** ${PROVIDER.toUpperCase()}
> **Engine:** src/features/assessment/utils/unifiedEngine.ts
> **Tổng số personas được test:** ${results.length}

---

## 🎯 Tóm tắt tổng quan

| Chỉ số | Giá trị |
|---|---|
| ✅ PASS | **${passCount}/${results.length}** |
| ❌ FAIL | **${failCount}/${results.length}** |
| Tỷ lệ chính xác | **${Math.round((passCount / results.length) * 100)}%** |

### Kết quả theo nhóm

| Nhóm | Tổng | PASS | FAIL | Tỷ lệ |
|---|---|---|---|---|
${groupSummary}

### Giải thích nhóm
- **Honest** (7 personas): Profile trung thực — hệ thống KHÔNG được flag oan
- **Adversarial** (5 personas): Gian lận, tô hồng, né tránh — hệ thống PHẢI phát hiện
- **Edge** (8 personas): Trường hợp đặc biệt, tâm lý phức tạp

---

## 📋 Chi tiết từng persona

${detailRows}

---

## 🔍 Phân tích tổng hợp

### Điểm mạnh
${results.filter(r => r.overallPass).map(r => `- ✅ **${r.persona.name}**: Phát hiện đúng (\`${r.scoringResult.reliabilityLevel}\`)`).join('\n') || '— Chưa có —'}

### Điểm cần cải thiện
${results.filter(r => !r.overallPass).map(r => `- ❌ **${r.persona.name}**: ${r.validationFlags.join('; ')}`).join('\n') || '— Không có —'}

---

*Báo cáo tự động bởi validation-20-personas.ts — SPI V4.2 Techzen*
`;

  writeFileSync(OUTPUT_PATH, report, 'utf-8');
  console.log(`\n✅ Báo cáo đã lưu vào ${OUTPUT_PATH}`);
  console.log(`📊 Kết quả: ${passCount}/${results.length} PASS (${Math.round((passCount / results.length) * 100)}%)`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
