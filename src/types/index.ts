// ============================================================
// TYPES — Techzen HR Assessment v2
// ============================================================

import type { AssessmentResult } from '@/features/assessment/data/scoring';

export interface UserInfo {
  fullName: string;
  employeeId: string;
  department: string;
  position: string;
  email: string;
  assessmentDate: string;
}

export type AppPage = 'intro' | 'user-info' | 'quiz' | 'loading' | 'result' | 'dashboard';

export interface AppState {
  page: AppPage;
  userInfo: UserInfo | null;
  answers: Record<number, number>;
  questionTimestamps: Record<number, number>;
  startTime: number | null;
  questionOrder: number[];
  currentQuestionIndex: number;
}

// ─── HR Dashboard Record (lưu localStorage) ───────────────────
export interface AssessmentRecord {
  id: string;                  // UUID
  user: UserInfo;
  result: AssessmentResult;
  exportedAt: string;
  version: string;
  hrNote?: string;
}
