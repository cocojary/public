// ============================================================
// STORAGE — localStorage persistence cho HR Dashboard
// ============================================================

import type { AssessmentRecord } from '@/types';

const STORAGE_KEY = 'techzen_hr_assessments';

export function saveRecord(record: AssessmentRecord): void {
  const records = getAllRecords();
  // Ghi đè nếu cùng employeeId + ngày (tránh duplicate)
  const idx = records.findIndex(
    r => r.user.employeeId === record.user.employeeId &&
         r.user.assessmentDate === record.user.assessmentDate
  );
  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.unshift(record); // mới nhất lên đầu
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // QuotaExceeded — giữ tối đa 200 records
    records.splice(200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
}

export function getAllRecords(): AssessmentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AssessmentRecord[]) : [];
  } catch {
    return [];
  }
}

export function deleteRecord(id: string): void {
  const records = getAllRecords().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getRecordById(id: string): AssessmentRecord | undefined {
  return getAllRecords().find(r => r.id === id);
}

export function exportAllJSON(): void {
  const records = getAllRecords();
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `techzen_hr_all_records_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Tính thống kê nhóm theo phòng ban */
export function calcGroupStats(
  records: AssessmentRecord[],
  department?: string
): Record<string, { avg: number; count: number }> {
  const filtered = department
    ? records.filter(r => r.user.department === department)
    : records;

  if (filtered.length === 0) return {};

  const sums: Record<string, number[]> = {};
  for (const rec of filtered) {
    for (const dim of rec.result.dimensions) {
      if (!sums[dim.dimensionId]) sums[dim.dimensionId] = [];
      sums[dim.dimensionId].push(dim.scaled);
    }
  }

  const result: Record<string, { avg: number; count: number }> = {};
  for (const [id, vals] of Object.entries(sums)) {
    result[id] = {
      avg: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
      count: vals.length,
    };
  }
  return result;
}
