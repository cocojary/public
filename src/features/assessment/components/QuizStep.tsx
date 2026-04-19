"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { getQuestionsByRole, submitAssessmentAction } from "@/server/actions/assessmentActions";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = (userId: string, role: string) => `quiz_progress_${userId}_${role}`;

interface SavedProgress {
  answers: Record<string, number>;
  currentIndex: number;
  setId: string;
  lang: 'vi' | 'en' | 'ja';
  startTime: number;
}

export function QuizStep({
  userId,
  targetRole,
  onComplete,
}: {
  userId: string;
  targetRole: string;
  onComplete: (recordId: string) => void;
}) {
  const [lang, setLang] = useState<'vi' | 'en' | 'ja'>('vi');
  const [questions, setQuestions] = useState<any[]>([]);
  const [setId, setSetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const storageKey = STORAGE_KEY(userId, targetRole);

  useEffect(() => {
    async function loadQuestions() {
      const res = await getQuestionsByRole(targetRole);
      if (!res.success || !res.questions) {
        alert(res.error ?? "Không thể tải bộ câu hỏi.");
        setIsLoading(false);
        return;
      }

      setQuestions(res.questions);
      setSetId(res.setId!);

      // Khôi phục tiến trình nếu có
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const progress: SavedProgress = JSON.parse(saved);
          if (progress.setId === res.setId && progress.currentIndex < res.questions.length) {
            setAnswers(progress.answers);
            setCurrentIndex(progress.currentIndex);
            setLang(progress.lang);
            startTimeRef.current = progress.startTime;
          }
        }
      } catch {
        // localStorage không khả dụng, bỏ qua
      }

      setIsLoading(false);
    }
    loadQuestions();
  }, [targetRole]);

  const saveProgress = (newAnswers: Record<string, number>, index: number, currentLang: 'vi' | 'en' | 'ja', sid: string) => {
    try {
      const progress: SavedProgress = {
        answers: newAnswers,
        currentIndex: index,
        setId: sid,
        lang: currentLang,
        startTime: startTimeRef.current,
      };
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      // ignore
    }
  };

  const clearProgress = () => {
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
  };

  const getOptions = (l: string) => {
    if (l === 'en') return [
      { text: 'Strongly Agree', value: 5 },
      { text: 'Agree', value: 4 },
      { text: 'Neutral', value: 3 },
      { text: 'Disagree', value: 2 },
      { text: 'Strongly Disagree', value: 1 },
    ];
    if (l === 'ja') return [
      { text: '全くそう思う', value: 5 },
      { text: 'そう思う', value: 4 },
      { text: '普通', value: 3 },
      { text: 'あまりそう思わない', value: 2 },
      { text: '全くそう思わない', value: 1 },
    ];
    return [
      { text: 'Rất đúng', value: 5 },
      { text: 'Tương đối đúng', value: 4 },
      { text: 'Bình thường', value: 3 },
      { text: 'Không đúng lắm', value: 2 },
      { text: 'Hoàn toàn không đúng', value: 1 },
    ];
  };

  const handleAnswer = (value: number) => {
    const currentQuestion = questions[currentIndex];
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (setId) saveProgress(newAnswers, nextIndex, lang, setId);
    } else {
      // Câu cuối — nộp bài
      startTransition(async () => {
        if (!setId) return;
        setSubmitError(null);
        const res = await submitAssessmentAction(userId, newAnswers, setId, lang, startTimeRef.current);
        if (res.success && res.recordId) {
          clearProgress();
          onComplete(res.recordId);
        } else {
          setSubmitError(res.error ?? "Có lỗi khi kết thúc bài trắc nghiệm");
        }
      });
    }
  };

  const getQuestionText = (q: any, l: 'vi' | 'en' | 'ja') => {
    if (l === 'en') return q.textEn || q.textVi;
    if (l === 'ja') return q.textJa || q.textVi;
    return q.textVi;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl shadow-xl mt-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-600 font-medium">Đang chuẩn bị bộ câu hỏi cho vị trí {targetRole}...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-10 bg-white rounded-2xl shadow-xl mt-10 text-center">
        <p className="text-red-500 font-bold mb-4">Lỗi: Không tìm thấy bộ câu hỏi.</p>
        <p className="text-slate-600">Vui lòng liên hệ Admin để chạy Seeding cho vị trí {targetRole}.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = Math.round((currentIndex / questions.length) * 100);
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden mt-10">
      <div className="bg-slate-50 p-4 sm:p-6 border-b border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">
            Câu {currentIndex + 1} / {questions.length}
          </h2>
          <div className="flex space-x-2">
            {(['vi', 'en', 'ja'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                  lang === l ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {answeredCount > 0 && currentIndex > 0 && (
          <p className="text-xs text-slate-400 mt-1.5">
            Tiến trình đã được lưu tự động ({answeredCount} câu đã trả lời)
          </p>
        )}
      </div>

      <div className="p-6 sm:p-10 flex flex-col items-center">
        <h3 className="text-2xl sm:text-3xl font-semibold text-slate-800 text-center mb-10 leading-relaxed min-h-[120px] flex items-center justify-center">
          {getQuestionText(currentQ, lang)}
        </h3>

        <div className="flex flex-col space-y-4 w-full max-w-xl">
          {getOptions(lang).map(option => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              disabled={isPending}
              className="py-4 px-6 text-lg text-left bg-blue-50 hover:bg-blue-100 text-blue-900 font-medium rounded-xl border border-blue-200 transition-all shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex-1">{option.text}</span>
            </button>
          ))}
        </div>

        {isPending && (
          <p className="mt-6 text-slate-500 text-sm animate-pulse">Đang nộp bài và tính kết quả...</p>
        )}

        {submitError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center max-w-xl w-full">
            {submitError}
            <button
              className="block mx-auto mt-2 text-blue-600 underline text-xs"
              onClick={() => handleAnswer(Object.values(answers).at(-1) ?? 3)}
            >
              Thử lại
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-sm text-slate-500">
        Vị trí: <strong>{targetRole}</strong> | Hãy trả lời chân thực dựa trên cách bạn thường xuyên hành xử nhất
      </div>
    </div>
  );
}
