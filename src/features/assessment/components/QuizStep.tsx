"use client";

import { useState, useTransition } from "react";
import { QUESTIONS } from "../data/questions";
import { submitAssessmentAction } from "@/server/actions/assessmentActions";
import { Button } from "@/components/ui/button";

export function QuizStep({ userId, onComplete }: { userId: string; onComplete: (recordId: string) => void }) {
  const [lang, setLang] = useState<'vi' | 'en' | 'ja'>('vi');
  const questions = QUESTIONS; // In this mock we use the same questions
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  const getOptions = (l: string) => {
    if (l === 'en') return [
      { text: 'Strongly Agree', value: 5 },
      { text: 'Agree', value: 4 },
      { text: 'Neutral', value: 3 },
      { text: 'Disagree', value: 2 },
      { text: 'Strongly Disagree', value: 1 }
    ];
    if (l === 'ja') return [
      { text: '全くそう思う', value: 5 },
      { text: 'そう思う', value: 4 },
      { text: '普通', value: 3 },
      { text: 'あまりそう思わない', value: 2 },
      { text: '全くそう思わない', value: 1 }
    ];
    return [
      { text: 'Rất đúng', value: 5 },
      { text: 'Tương đối đúng', value: 4 },
      { text: 'Bình thường', value: 3 },
      { text: 'Không đúng lắm', value: 2 },
      { text: 'Hoàn toàn không đúng', value: 1 }
    ];
  };

  const handleAnswer = (value: number) => {
    const currentQuestion = questions[currentIndex];
    
    // Save answer
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finished
      startTransition(async () => {
        const res = await submitAssessmentAction(userId, newAnswers, lang);
        if (res.success && res.recordId) {
          onComplete(res.recordId);
        } else {
          alert(res.error || "Có lỗi khi kết thúc bài trắc nghiệm");
        }
      });
    }
  };

  const currentQ = questions[currentIndex];
  
  // Progress calc
  const progress = Math.round(((currentIndex) / questions.length) * 100);

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden mt-10">
      {/* Header section with Language Selector and Progress */}
      <div className="bg-slate-50 p-4 sm:p-6 border-b border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Câu {currentIndex + 1} / {questions.length}</h2>
          <div className="flex space-x-2">
            {(['vi', 'en', 'ja'] as const).map(l => (
              <button 
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${lang === l ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6 sm:p-10 flex flex-col items-center">
        <h3 className="text-2xl sm:text-3xl font-semibold text-slate-800 text-center mb-10 leading-relaxed min-h-[100px] flex items-center justify-center">
          {currentQ.text}
        </h3>

        {/* Answer Options */}
        <div className="flex flex-col space-y-4 w-full max-w-xl">
          {getOptions(lang).map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              disabled={isPending}
              className="py-4 px-6 text-lg text-left bg-blue-50 hover:bg-blue-100 text-blue-900 font-medium rounded-xl border border-blue-200 transition-all shadow-sm flex items-center"
            >
              <span className="flex-1">{option.text}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-sm text-slate-500">
        Hãy trả lời chân thực dựa trên cách bạn thường xuyên hành xử nhất
      </div>
    </div>
  );
}
