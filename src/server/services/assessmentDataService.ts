/**
 * Assessment Data Service
 * Service layer duy nhất để đọc data đánh giá từ PostgreSQL.
 * Thay thế hoàn toàn import từ questions.ts và dimensions.ts hardcode.
 *
 * Cache in-memory TTL 60s để tránh N queries lặp lại trong 1 session.
 */
import db from '@/server/db';
import type { Dimension, DimensionRelation, Question } from '@prisma/client';

// Re-export Prisma types để các file khác dùng
export type DbDimension = Dimension;
export type DbDimensionRelation = DimensionRelation;
export type DbQuestion = Question;

// ── Cache ─────────────────────────────────────────────────────
const CACHE_TTL_MS = 60_000; // 60 giây

let _dimensionsCache: DbDimension[] | null = null;
let _dimRelationsCache: DbDimensionRelation[] | null = null;
let _questionsCache: DbQuestion[] | null = null;
let _cacheTimestamp = 0;

function isCacheValid(): boolean {
  return Date.now() - _cacheTimestamp < CACHE_TTL_MS;
}

export function invalidateDataCache() {
  _dimensionsCache = null;
  _dimRelationsCache = null;
  _questionsCache = null;
  _cacheTimestamp = 0;
}

// ── Dimensions ────────────────────────────────────────────────

/**
 * Lấy tất cả dimensions (active only by default).
 * @param includeLeadership - có bao gồm group='leadership' không (default: false)
 */
export async function getDimensions(includeLeadership = false): Promise<DbDimension[]> {
  if (_dimensionsCache && isCacheValid()) return _dimensionsCache;

  const dims = await db.dimension.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });

  _dimensionsCache = dims;
  _cacheTimestamp = Date.now();

  if (includeLeadership) return dims;
  return dims.filter(d => d.group !== 'leadership');
}

/**
 * Lấy các dimension dùng trong quiz chính (không gồm leadership, không gồm lie_scale)
 */
export async function getActiveDimensions(): Promise<DbDimension[]> {
  const dims = await getDimensions(false);
  return dims.filter(d => d.group !== 'leadership' && d.id !== 'lie_scale');
}

/**
 * Lấy dimension theo ID
 */
export async function getDimensionById(id: string): Promise<DbDimension | null> {
  const dims = await getDimensions(true);
  return dims.find(d => d.id === id) ?? null;
}

// ── Dimension Relations ───────────────────────────────────────

/**
 * Lấy danh sách cross-dimension relations (thay thế CROSS_DIM_PAIRS hardcode)
 */
export async function getDimensionRelations(): Promise<DbDimensionRelation[]> {
  if (_dimRelationsCache && isCacheValid()) return _dimRelationsCache;

  const rels = await db.dimensionRelation.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  _dimRelationsCache = rels;
  if (!_dimensionsCache) _cacheTimestamp = Date.now();

  return rels;
}

// ── Questions ─────────────────────────────────────────────────

/**
 * Lấy active QuestionSet hiện tại
 */
export async function getActiveQuestionSet() {
  return db.questionSet.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Lấy tất cả câu hỏi active của QuestionSet đang dùng.
 * Trả về format tương thích với unifiedEngine (có isLieScale, isLieSubtle)
 */
export async function getActiveQuestions(): Promise<DbQuestion[]> {
  if (_questionsCache && isCacheValid()) return _questionsCache;

  const activeSet = await getActiveQuestionSet();
  if (!activeSet) throw new Error('Không tìm thấy QuestionSet active!');

  const questions = await db.question.findMany({
    where: { setId: activeSet.id, isActive: true },
    orderBy: { displayOrder: 'asc' },
  });

  _questionsCache = questions;
  if (!_dimensionsCache) _cacheTimestamp = Date.now();

  return questions;
}

/**
 * Convert DbQuestion sang format mà unifiedEngine.calculateUnifiedScores() cần.
 * Bao gồm isLieScale và isLieSubtle flags.
 */
export function toEngineQuestion(q: DbQuestion): {
  id: string;
  dimensionId: string;
  reversed: boolean;
  isLieScale: boolean;
  isLieSubtle: boolean;
  lieWeight: number;
} {
  return {
    id: q.id,
    dimensionId: q.dimensionId,
    reversed: q.reversed,
    isLieScale: q.questionType === 'lie_absolute' || q.questionType === 'lie_subtle',
    isLieSubtle: q.questionType === 'lie_subtle',
    lieWeight: q.lieWeight,
  };
}

/**
 * Lấy câu hỏi theo setId (không cache) — dùng cho seed/admin
 */
export async function getQuestionsBySetId(setId: string): Promise<DbQuestion[]> {
  return db.question.findMany({
    where: { setId, isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
}
