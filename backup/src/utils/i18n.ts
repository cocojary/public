// ============================================================
// i18n — Đa ngôn ngữ VI / EN / JA
// Techzen HR Assessment v2
// ============================================================

export type Lang = 'vi' | 'en' | 'ja';

export const SUPPORTED_LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

type TranslationMap = Record<string, Record<Lang, string>>;

const T: TranslationMap = {
  // ── App ───────────────────────────────────────────────────
  app_title: { vi: 'Đánh Giá Tính Cách Nhân Sự', en: 'HR Personality Assessment', ja: '適性検査システム' },
  app_subtitle: { vi: 'Techzen HR Assessment v2.0 · Dựa trên Big Five + Scouter SS', en: 'Techzen HR Assessment v2.0 · Based on Big Five + Scouter SS', ja: 'Techzen HR Assessment v2.0 · Big Five + Scouter SS準拠' },
  dashboard: { vi: 'HR Dashboard', en: 'HR Dashboard', ja: 'HRダッシュボード' },
  start_assessment: { vi: 'Bắt đầu đánh giá →', en: 'Start Assessment →', ja: '診断を開始する →' },

  // ── Info ────────────────────────────────────────────────
  num_questions: { vi: '120 câu trắc nghiệm', en: '120 Questions', ja: '120問' },
  duration: { vi: 'Khoảng 20–25 phút', en: 'About 20–25 minutes', ja: '約20〜25分' },
  dimensions: { vi: '18 chiều + 7 phân tích AI', en: '18 dimensions + 7 AI analyses', ja: '18次元 + AI分析7項目' },
  confidential: { vi: 'Nhân viên & HR xem được', en: 'Visible to Employee & HR', ja: '本人・HR担当者のみ閲覧可' },

  // ── Quiz ────────────────────────────────────────────────
  question_num: { vi: 'Câu hỏi', en: 'Question', ja: '質問' },
  of: { vi: '/', en: '/', ja: '/' },
  answered: { vi: '✓ Đã chọn', en: '✓ Selected', ja: '✓ 選択済み' },
  next: { vi: 'Tiếp theo →', en: 'Next →', ja: '次へ →' },
  prev: { vi: '← Quay lại', en: '← Back', ja: '← 戻る' },
  finish: { vi: '✓ Hoàn thành', en: '✓ Finish', ja: '✓ 完了' },

  // ── Likert ──────────────────────────────────────────────
  likert_1: { vi: 'Hoàn toàn không đúng', en: 'Strongly Disagree', ja: '全くそう思わない' },
  likert_2: { vi: 'Không đúng', en: 'Disagree', ja: 'そう思わない' },
  likert_3: { vi: 'Đôi khi đúng', en: 'Sometimes', ja: 'どちらでもない' },
  likert_4: { vi: 'Thường đúng', en: 'Agree', ja: 'そう思う' },
  likert_5: { vi: 'Hoàn toàn đúng', en: 'Strongly Agree', ja: '非常にそう思う' },

  // ── Result ──────────────────────────────────────────────
  report_title: { vi: 'BÁO CÁO ĐÁNH GIÁ TÍNH CÁCH NHÂN SỰ', en: 'PERSONALITY ASSESSMENT REPORT', ja: '適性検査結果レポート' },
  export_pdf: { vi: '⬇️ Xuất PDF', en: '⬇️ Export PDF', ja: '⬇️ PDF出力' },
  export_json: { vi: '📁 Xuất JSON', en: '📁 Export JSON', ja: '📁 JSONエクスポート' },
  retake: { vi: '🔄 Làm lại', en: '🔄 Retake', ja: '🔄 やり直す' },
  saved_auto: { vi: 'Đã lưu tự động ✅', en: 'Auto-saved ✅', ja: '自動保存済み ✅' },

  // ── Sections ─────────────────────────────────────────────
  sec_persona: { vi: '🤖 Phân Tích Kiểu Tính Cách AI (Persona)', en: '🤖 AI Persona Analysis', ja: '🤖 AIキャラクタータイプ分析' },
  sec_reliability: { vi: '🔍 Độ Tin Cậy của Kết Quả', en: '🔍 Result Reliability', ja: '🔍 信頼性評価' },
  sec_negative: { vi: '🚫 Phân Tích Xu Hướng Tiêu Cực', en: '🚫 Negative Tendency Analysis', ja: '🚫 不適性傾向分析' },
  sec_combat: { vi: '⚡ Chỉ Số Chiến Đấu Tổng Hợp', en: '⚡ Overall Combat Power', ja: '⚡ 総合戦闘力' },
  sec_bigfive: { vi: '🕸️ Tính Cách Cơ Bản (Big Five)', en: '🕸️ Core Personality (Big Five)', ja: '🕸️ 基本性格（Big Five）' },
  sec_duty: { vi: '🎯 Mức Độ Phù Hợp Nghề Nghiệp', en: '🎯 Role Suitability', ja: '🎯 職務適性' },
  sec_dimensions: { vi: '📊 Kết Quả Chi Tiết 18 Chiều', en: '📊 18-Dimension Detailed Results', ja: '📊 18次元詳細結果' },
  sec_strengths: { vi: '⭐ Điểm Mạnh & Điểm Cần Phát Triển', en: '⭐ Strengths & Development Areas', ja: '⭐ 強み・課題' },
  sec_roles: { vi: '💼 Gợi Ý Vị Trí Phù Hợp', en: '💼 Suggested Roles', ja: '💼 適性職種' },
  sec_benchmark: { vi: '📈 So Sánh Benchmark Ngành', en: '📈 Industry Benchmark Comparison', ja: '📈 業界ベンチマーク比較' },
  sec_ai_report: { vi: '✨ Phân Tích AI (GPT-4o)', en: '✨ AI Analysis (GPT-4o)', ja: '✨ AI分析（GPT-4o）' },
  sec_hr_notes: { vi: '📝 Ghi Chú Của HR', en: '📝 HR Notes', ja: '📝 人事メモ' },

  // ── Reliability ──────────────────────────────────────────
  rel_high: { vi: '✅ Độ tin cậy: CAO', en: '✅ Reliability: HIGH', ja: '✅ 信頼性：高' },
  rel_medium: { vi: '🟡 Độ tin cậy: TRUNG BÌNH', en: '🟡 Reliability: MEDIUM', ja: '🟡 信頼性：中' },
  rel_low: { vi: '⚠️ Độ tin cậy: THẤP', en: '⚠️ Reliability: LOW', ja: '⚠️ 信頼性：低' },
  rel_invalid: { vi: '❌ KẾT QUẢ KHÔNG HỢP LỆ', en: '❌ INVALID RESULTS', ja: '❌ 無効な回答' },

  // ── Benchmark labels ─────────────────────────────────────
  benchmark_above: { vi: 'Cao hơn nhóm', en: 'Above average', ja: '平均以上' },
  benchmark_match: { vi: 'Tương đương', en: 'Average', ja: '平均的' },
  benchmark_below: { vi: 'Thấp hơn nhóm', en: 'Below average', ja: '平均以下' },

  // ── AI Report ────────────────────────────────────────────
  ai_generating: { vi: '🤖 Đang tạo phân tích AI...', en: '🤖 Generating AI analysis...', ja: '🤖 AI分析を生成中...' },
  ai_exec_summary: { vi: 'Tóm Tắt Tổng Thể', en: 'Executive Summary', ja: '総合所見' },
  ai_strengths: { vi: 'Phân Tích Điểm Mạnh', en: 'Strengths Analysis', ja: '強みの分析' },
  ai_development: { vi: 'Điểm Cần Phát Triển', en: 'Development Areas', ja: '課題・成長領域' },
  ai_fit: { vi: 'Phân Tích Vị Trí Phù Hợp', en: 'Role Fit Analysis', ja: '職務適合性分析' },
  ai_hr_rec: { vi: 'Khuyến Nghị Cho HR', en: 'HR Recommendations', ja: '人事への提言' },
  ai_not_available: { vi: 'Chức năng này cần cấu hình VITE_OPENAI_KEY.', en: 'This feature requires VITE_OPENAI_KEY configuration.', ja: 'この機能はVITE_OPENAI_KEYの設定が必要です。' },

  // ── User form ────────────────────────────────────────────
  full_name: { vi: 'Họ và tên', en: 'Full Name', ja: '氏名' },
  employee_id: { vi: 'Mã nhân viên', en: 'Employee ID', ja: '社員番号' },
  department: { vi: 'Phòng ban', en: 'Department', ja: '部署' },
  position: { vi: 'Chức danh', en: 'Position', ja: '役職' },
  email: { vi: 'Email công ty', en: 'Work Email', ja: '社内メール' },

  // ── Footer ──────────────────────────────────────────────
  footer_1: { vi: 'Techzen HR Assessment System v2.0 · Powered by AI', en: 'Techzen HR Assessment System v2.0 · Powered by AI', ja: 'Techzen HR Assessment v2.0 · AI搭載' },
  footer_2: { vi: 'Dựa trên Big Five (Costa & McCrae) và Scouter SS Nhật Bản', en: 'Based on Big Five (Costa & McCrae) and Scouter SS Japan', ja: 'Big Five理論（Costa & McCrae）およびScouter SS（日本）に基づく' },
  footer_3: { vi: 'Chỉ mang tính tham khảo, không phải chẩn đoán y tế.', en: 'For reference only, not a medical diagnosis.', ja: '参考情報であり、医学的診断ではありません。' },
};

// ─── Translation function ─────────────────────────────────
let currentLang: Lang = 'vi';

export function setLang(lang: Lang) {
  currentLang = lang;
  localStorage.setItem('techzen_lang', lang);
}

export function getLang(): Lang {
  const stored = localStorage.getItem('techzen_lang') as Lang | null;
  if (stored && ['vi', 'en', 'ja'].includes(stored)) {
    currentLang = stored;
  }
  return currentLang;
}

export function t(key: string, lang?: Lang): string {
  const l = lang ?? currentLang;
  return T[key]?.[l] ?? T[key]?.['vi'] ?? key;
}

// ─── React hook ───────────────────────────────────────────
import { useState, useCallback } from 'react';

export function useLang() {
  const [lang, setLangState] = useState<Lang>(getLang());

  const changeLang = useCallback((l: Lang) => {
    setLang(l);
    setLangState(l);
  }, []);

  const tr = useCallback((key: string) => t(key, lang), [lang]);

  return { lang, changeLang, t: tr };
}
