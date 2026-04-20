/**
 * build-zigzac-cache.ts
 * Tạo thủ công câu trả lời zigzac (1-5-1-5...) vào cache để test pattern detection.
 * Chạy: npx tsx scripts/build-zigzac-cache.ts
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const prisma = new PrismaClient();
const CACHE_PATH = './scripts/ai_answers_cache.json';

async function main() {
  const activeSet = await prisma.questionSet.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!activeSet) throw new Error('Không tìm thấy QuestionSet active!');

  const mainQs = await prisma.question.findMany({
    where: { setId: activeSet.id, isActive: true, questionType: 'main' },
    orderBy: { displayOrder: 'asc' },
  });

  // Xây dựng zigzac: câu chẵn = 1, câu lẻ = 5
  const zigzacAnswers: Record<string, number> = {};
  mainQs.forEach((q, idx) => {
    zigzacAnswers[q.id] = idx % 2 === 0 ? 1 : 5;
  });

  let cache: Record<string, any> = {};
  if (existsSync(CACHE_PATH)) {
    cache = JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
  }

  // Persona #11 = zigzac (xóa cache cũ để dùng bản thủ công)
  cache['11'] = zigzacAnswers;
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  console.log(`✅ Đã ghi ${Object.keys(zigzacAnswers).length} câu zigzac vào cache persona #11`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
