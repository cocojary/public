/**
 * rebuild-cache-132.ts — Tái tạo cache với 132 câu hỏi đầy đủ
 * ─────────────────────────────────────────────────────────────
 * - Thêm 12 câu hỏi mới: adaptability (6) + grit (6)
 * - Cập nhật 20 persona với đủ 132 câu trả lời
 * - Giữ nguyên các UUID cũ, thêm UUID mới cho câu mới
 *
 * Cách dùng: npx tsx scripts/rebuild-cache-132.ts
 */

import { writeFileSync, readFileSync } from 'fs';

// ── 12 UUID mới cho adaptability và grit ──────────────────────
const NEW_QUESTION_IDS = {
  adaptability: {
    a1: 'ada00001-0000-4000-a000-000000000001', // forward: linh hoạt thích nghi
    a2: 'ada00002-0000-4000-a000-000000000002', // forward: xử lý thay đổi tốt
    a3: 'ada00003-0000-4000-a000-000000000003', // forward: đa nhiệm linh hoạt
    a4: 'ada00004-0000-4000-a000-000000000004', // reversed: khó thích nghi với thay đổi
    a5: 'ada00005-0000-4000-a000-000000000005', // reversed: cần quy trình cố định
    a6: 'ada00006-0000-4000-a000-000000000006', // forward: tìm cơ hội trong thay đổi
  },
  grit: {
    g1: 'grt00001-0000-4000-a000-000000000001', // forward: kiên trì mục tiêu dài hạn
    g2: 'grt00002-0000-4000-a000-000000000002', // forward: không từ bỏ khi gặp trở ngại
    g3: 'grt00003-0000-4000-a000-000000000003', // forward: tiếp tục dù kết quả chậm
    g4: 'grt00004-0000-4000-a000-000000000004', // reversed: dễ nản lòng khi mọi thứ khó
    g5: 'grt00005-0000-4000-a000-000000000005', // reversed: từ bỏ khi không đạt tiến độ
    g6: 'grt00006-0000-4000-a000-000000000006', // forward: đam mê dài hạn với mục tiêu
  },
};

// Tất cả 12 UUID mới (6 adaptability + 6 grit)
const ALL_NEW_IDS = [
  ...Object.values(NEW_QUESTION_IDS.adaptability),
  ...Object.values(NEW_QUESTION_IDS.grit),
];

// ── Cấu trúc thông tin reversal để generate điểm đúng ────────
// reversed=true: điểm CAO = chiều đó THẤP
const NEW_Q_META: Record<string, { dim: string; reversed: boolean }> = {
  'ada00001-0000-4000-a000-000000000001': { dim: 'adaptability', reversed: false },
  'ada00002-0000-4000-a000-000000000002': { dim: 'adaptability', reversed: false },
  'ada00003-0000-4000-a000-000000000003': { dim: 'adaptability', reversed: false },
  'ada00004-0000-4000-a000-000000000004': { dim: 'adaptability', reversed: true },
  'ada00005-0000-4000-a000-000000000005': { dim: 'adaptability', reversed: true },
  'ada00006-0000-4000-a000-000000000006': { dim: 'adaptability', reversed: false },
  'grt00001-0000-4000-a000-000000000001': { dim: 'grit', reversed: false },
  'grt00002-0000-4000-a000-000000000002': { dim: 'grit', reversed: false },
  'grt00003-0000-4000-a000-000000000003': { dim: 'grit', reversed: false },
  'grt00004-0000-4000-a000-000000000004': { dim: 'grit', reversed: true },
  'grt00005-0000-4000-a000-000000000005': { dim: 'grit', reversed: true },
  'grt00006-0000-4000-a000-000000000006': { dim: 'grit', reversed: false },
};

// ── 20 Persona Profiles với trọng số cho mỗi dimension ────────
// Mỗi entry: dim_id → [min, max] điểm tự nhiên
// key: adapBase = điểm cơ bản adaptability (1-5); gritBase = grit (1-5)
interface PersonaProfile {
  id: number;
  name: string;
  adapBase: number; // thực chất dimension score (1-5)
  gritBase: number;
  adapVariance: number; // ±variance
  gritVariance: number;
}

const PERSONA_PROFILES: PersonaProfile[] = [
  // ── Group 1: Honest Personas (1-7) ──
  { id: 1,  name: 'Kỹ sư phần mềm - Cẩn thận, hướng nội',     adapBase: 3, gritBase: 4, adapVariance: 1, gritVariance: 1 },
  { id: 2,  name: 'Nhân viên Sales - Hướng ngoại, nhiệt tình', adapBase: 4, gritBase: 4, adapVariance: 1, gritVariance: 1 },
  { id: 3,  name: 'HR Manager - Đồng cảm, quan tâm người khác', adapBase: 4, gritBase: 3, adapVariance: 1, gritVariance: 1 },
  { id: 4,  name: 'Kế toán - Ổn định, nguyên tắc',              adapBase: 2, gritBase: 4, adapVariance: 1, gritVariance: 1 },
  { id: 5,  name: 'Designer UX - Sáng tạo, cởi mở',            adapBase: 5, gritBase: 4, adapVariance: 0, gritVariance: 1 },
  { id: 6,  name: 'Project Manager - Cân bằng, lãnh đạo',      adapBase: 4, gritBase: 5, adapVariance: 1, gritVariance: 0 },
  { id: 7,  name: 'Nhân viên mới ra trường - Chưa xác định',   adapBase: 3, gritBase: 3, adapVariance: 1, gritVariance: 1 },
  // ── Group 2: Adversarial (8-12) ──
  { id: 8,  name: 'Tô hồng hồ sơ - Toàn điểm 5',              adapBase: 5, gritBase: 5, adapVariance: 0, gritVariance: 0 },
  { id: 9,  name: 'Khiêm tốn thái quá - Toàn điểm 1',         adapBase: 1, gritBase: 1, adapVariance: 0, gritVariance: 0 },
  { id: 10, name: 'Trả lời toàn 3 - Né tránh',                 adapBase: 3, gritBase: 3, adapVariance: 0, gritVariance: 0 },
  { id: 11, name: 'Zigzac - Xen kẽ 1-5',                       adapBase: 3, gritBase: 3, adapVariance: 2, gritVariance: 2 }, // zigzac pattern
  { id: 12, name: 'Lie Cheater - Tô vẽ nhẹ hơn',              adapBase: 4, gritBase: 4, adapVariance: 0, gritVariance: 0 },
  // ── Group 3: Edge Cases (13-20) ──
  { id: 13, name: 'Người hoàn hảo nhưng nhất quán',            adapBase: 5, gritBase: 5, adapVariance: 0, gritVariance: 0 },
  { id: 14, name: 'Mâu thuẫn tâm lý - Hướng ngoại + Autonomy thấp', adapBase: 3, gritBase: 3, adapVariance: 1, gritVariance: 1 },
  { id: 15, name: 'Lười biếng - Ít cam kết',                   adapBase: 2, gritBase: 1, adapVariance: 1, gritVariance: 0 },
  { id: 16, name: 'Burnout - Stress cao, cảm xúc không ổn',    adapBase: 2, gritBase: 2, adapVariance: 1, gritVariance: 1 },
  { id: 17, name: 'Nhân viên cũ - Ít đổi mới',                 adapBase: 1, gritBase: 4, adapVariance: 0, gritVariance: 1 },
  { id: 18, name: 'Leader tiềm năng - Toàn diện',              adapBase: 5, gritBase: 5, adapVariance: 0, gritVariance: 0 },
  { id: 19, name: 'Người hướng ngoại thích ổn định',           adapBase: 2, gritBase: 3, adapVariance: 1, gritVariance: 1 },
  { id: 20, name: 'Người thực dụng - Trung bình ổn định',      adapBase: 3, gritBase: 3, adapVariance: 1, gritVariance: 1 },
];

// ── Helper: generate điểm hợp lý cho 1 câu dựa trên persona ──
function genScore(
  personaId: number,
  qId: string,
  baseScore: number,
  variance: number,
  reversed: boolean,
  isZigzac: boolean,
  zigzacIdx: number,
): number {
  if (isZigzac) {
    // Zigzac: xen kẽ 1 và 5
    return zigzacIdx % 2 === 0 ? 1 : 5;
  }

  // Tính raw score dựa trên base + noise nhỏ
  const noise = (Math.sin(personaId * 7 + qId.charCodeAt(0) * 3) * variance) | 0;
  let raw = baseScore + noise;
  raw = Math.max(1, Math.min(5, raw));

  if (reversed) {
    // Câu reversed: nếu persona có adapBase cao → điểm câu reversed thấp
    const flipped = 6 - raw;
    return Math.max(1, Math.min(5, flipped));
  }
  return raw;
}

// ── Main ──────────────────────────────────────────────────────
function main() {
  const CACHE_PATH = './scripts/ai_answers_cache.json';
  const rawCache = JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));

  console.log('📋 Đọc cache hiện tại...');
  console.log(`   Personas: ${Object.keys(rawCache.personas).length}`);
  
  const firstPersona = rawCache.personas['1'];
  const existingQCount = Object.keys(firstPersona.answers).length;
  console.log(`   Câu hỏi hiện tại/persona: ${existingQCount}`);
  console.log(`   Sẽ thêm: ${ALL_NEW_IDS.length} câu mới (adaptability x6 + grit x6)`);
  console.log(`   Tổng mục tiêu: ${existingQCount + ALL_NEW_IDS.length} câu/persona\n`);

  let zigzacIdx = 0;

  for (const profile of PERSONA_PROFILES) {
    const key = profile.id.toString();
    if (!rawCache.personas[key]) {
      console.warn(`   ⚠️  Persona ${key} không tồn tại trong cache, bỏ qua`);
      continue;
    }

    const persona = rawCache.personas[key];
    const isZigzac = profile.id === 11;
    if (isZigzac) zigzacIdx = 0;

    // Thêm câu hỏi adaptability
    const adapIds = Object.values(NEW_QUESTION_IDS.adaptability);
    adapIds.forEach((qId, idx) => {
      const meta = NEW_Q_META[qId];
      const score = genScore(
        profile.id, qId,
        profile.adapBase, profile.adapVariance,
        meta.reversed, isZigzac, isZigzac ? ++zigzacIdx : idx
      );
      persona.answers[qId] = score;
    });

    // Thêm câu hỏi grit
    const gritIds = Object.values(NEW_QUESTION_IDS.grit);
    gritIds.forEach((qId, idx) => {
      const meta = NEW_Q_META[qId];
      const score = genScore(
        profile.id, qId,
        profile.gritBase, profile.gritVariance,
        meta.reversed, isZigzac, isZigzac ? ++zigzacIdx : idx + 6
      );
      persona.answers[qId] = score;
    });

    // Cập nhật metadata
    const newTotal = Object.keys(persona.answers).length;
    persona.totalQuestions = newTotal;
    persona.answeredQuestions = newTotal;
    persona.completionRate = 1.0;
    persona.generatedAt = new Date().toISOString();

    console.log(`   ✅ Persona ${profile.id}: ${profile.name} → ${newTotal} câu`);
  }

  // Cập nhật cache metadata
  rawCache.generatedAt = new Date().toISOString();
  rawCache.model = 'o4+manual-132';
  
  writeFileSync(CACHE_PATH, JSON.stringify(rawCache, null, 2), 'utf-8');
  
  const finalCount = Object.keys(rawCache.personas['1'].answers).length;
  console.log(`\n✨ Hoàn tất! Mỗi persona giờ có ${finalCount} câu trả lời`);
  console.log(`   File: ${CACHE_PATH}`);
  console.log('\n📝 NOTE: Cần thêm 12 câu này vào seed-dev.ts để DB đồng bộ!');
  console.log('   UUID adaptability:', JSON.stringify(NEW_QUESTION_IDS.adaptability, null, 4));
  console.log('   UUID grit:', JSON.stringify(NEW_QUESTION_IDS.grit, null, 4));
}

main();
