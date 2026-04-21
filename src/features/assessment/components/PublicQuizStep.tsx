"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { getLiteQuestionSet, submitPublicAssessmentAction } from "@/server/actions/publicAssessmentActions";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = (userId: string) => `public_quiz_${userId}`;

interface SavedProgress {
  answers: Record<string, any>;
  answerTimes: Record<string, number>;
  currentIndex: number;
  setId: string;
  startTime: number;
}

export function PublicQuizStep({
  userId,
  leadEmail,
  leadPhone,
  onComplete,
}: {
  userId: string;
  leadEmail: string | null;
  leadPhone: string | null;
  onComplete: (recordId: string) => void;
}) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [setId, setSetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [answerTimes, setAnswerTimes] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastActionTimeRef = useRef<number>(Date.now());
  const storageKey = STORAGE_KEY(userId);

  useEffect(() => {
    async function load() {
      const res = await getLiteQuestionSet();
      if (!res.success || !res.questions) {
        alert(res.error ?? "Không tải được câu hỏi.");
        setIsLoading(false);
        return;
      }
      setQuestions(res.questions);
      setSetId(res.setId!);
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const p: SavedProgress = JSON.parse(saved);
          if (p.setId === res.setId && p.currentIndex < res.questions.length) {
            setAnswers(p.answers);
            setAnswerTimes(p.answerTimes || {});
            setCurrentIndex(p.currentIndex);
            startTimeRef.current = p.startTime;
            lastActionTimeRef.current = Date.now();
          }
        }
      } catch { /* ignore */ }
      setIsLoading(false);
    }
    load();
  }, []);

  const saveProgress = (a: Record<string, any>, at: Record<string, number>, idx: number, sid: string) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ answers: a, answerTimes: at, currentIndex: idx, setId: sid, startTime: startTimeRef.current }));
    } catch { /* ignore */ }
  };

  const clearProgress = () => {
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
  };

  const OPTIONS_VI = [
    { text: "Rất đúng", value: 5 },
    { text: "Tương đối đúng", value: 4 },
    { text: "Bình thường", value: 3 },
    { text: "Không đúng lắm", value: 2 },
    { text: "Hoàn toàn không đúng", value: 1 },
  ];

  const handleAnswer = (value: any) => {
    const currentQ = questions[currentIndex];
    const now = Date.now();
    const timeSpent = now - lastActionTimeRef.current;
    lastActionTimeRef.current = now;

    const newAnswers = { ...answers, [currentQ.id]: value };
    const newAnswerTimes = { ...answerTimes, [currentQ.id]: timeSpent };
    setAnswers(newAnswers);
    setAnswerTimes(newAnswerTimes);

    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (setId) saveProgress(newAnswers, newAnswerTimes, nextIndex, setId);
    } else {
      startTransition(async () => {
        if (!setId) return;
        setSubmitError(null);
        const res = await submitPublicAssessmentAction(
          userId,
          newAnswers,
          newAnswerTimes,
          setId,
          leadEmail,
          leadPhone,
          startTimeRef.current,
        );
        if (res.success && res.recordId) {
          clearProgress();
          onComplete(res.recordId);
        } else {
          setSubmitError(res.error ?? "Có lỗi khi nộp bài");
        }
      });
    }
  };

  const progress = questions.length > 0 ? Math.round((currentIndex / questions.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4" />
        <p className="text-slate-500">Đang chuẩn bị bộ câu hỏi...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-10 bg-white rounded-2xl shadow-xl text-center">
        <p className="text-red-500 font-bold mb-2">Lỗi: Không tìm thấy câu hỏi.</p>
        <p className="text-slate-500 text-sm">Vui lòng liên hệ admin.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Progress bar */}
      <div className="bg-indigo-900 p-4 sm:p-5">
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-white font-bold text-lg">Câu {currentIndex + 1}</span>
            <span className="text-indigo-300 text-sm ml-1">/ {questions.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-indigo-300 text-xs">Miễn phí · Lite Version</span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
        <div className="w-full bg-indigo-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-400 to-blue-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-indigo-400 text-xs">{progress}% hoàn thành</span>
          <span className="text-indigo-400 text-xs">~{Math.ceil((questions.length - currentIndex) * 0.25)} phút còn lại</span>
        </div>
      </div>

      {/* Question */}
      <div className="p-6 sm:p-10 flex flex-col items-center">
        <h3 className="text-xl sm:text-2xl font-semibold text-slate-800 text-center mb-8 leading-relaxed min-h-[80px] flex items-center justify-center max-w-xl">
          {currentQ.textVi}
        </h3>

        <div className="flex flex-col space-y-3 w-full max-w-lg">
          {OPTIONS_VI.map((opt, idx) => (
            <button
              key={opt.value}
              onClick={() => handleAnswer(opt.value)}
              disabled={isPending}
              className="group py-4 px-6 text-left rounded-xl border-2 border-indigo-100 bg-indigo-50 hover:border-indigo-400 hover:bg-indigo-100 text-indigo-900 font-medium transition-all shadow-sm disabled:opacity-50 flex items-center gap-3"
            >
              <span className="w-7 h-7 rounded-full border-2 border-indigo-300 group-hover:border-indigo-500 group-hover:bg-indigo-500 flex items-center justify-center text-xs font-bold text-indigo-400 group-hover:text-white flex-shrink-0 transition-all">
                {idx + 1}
              </span>
              {opt.text}
            </button>
          ))}
        </div>

        {isPending && (
          <p className="mt-6 text-indigo-500 text-sm animate-pulse flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Đang tính toán kết quả...
          </p>
        )}

        {submitError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm max-w-lg w-full text-center">
            {submitError}
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
        Hãy trả lời chân thực theo cách bạn thường xuyên hành xử nhất trong công việc
      </div>
    </div>
  );
}
