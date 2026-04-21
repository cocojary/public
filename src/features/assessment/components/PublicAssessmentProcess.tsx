"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitUserInfo } from "@/server/actions/userActions";
import { PublicQuizStep } from "./PublicQuizStep";
import { LeadCaptureGate } from "./LeadCaptureGate";
import { useRouter } from "next/navigation";

type Step = "intro" | "userinfo" | "quiz" | "lead" | "done";

export function PublicAssessmentProcess() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [userId, setUserId] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [leadEmail, setLeadEmail] = useState<string | null>(null);
  const [leadPhone, setLeadPhone] = useState<string | null>(null);

  // ── User Info form state ──
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleUserInfoSubmit = async () => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      setFormError("Vui lòng nhập họ và tên (ít nhất 2 ký tự).");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await submitUserInfo({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
      });
      if (res.success && res.userId) {
        setUserId(res.userId);
        setLeadEmail(email.trim() || null);
        setStep("quiz");
      } else {
        setFormError(res.error || "Ghi nhận thất bại. Thử lại nhé!");
      }
    } catch {
      setFormError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuizComplete = (newRecordId: string) => {
    setRecordId(newRecordId);
    setStep("lead");
  };

  const handleLeadComplete = () => {
    setStep("done");
    if (recordId) {
      router.push(`/public/result/${recordId}`);
    }
  };

  // ── INTRO ──
  if (step === "intro") {
    return (
      <div className="w-full animate-in fade-in duration-500">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white rounded-2xl shadow-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full" />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 text-indigo-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Đánh giá miễn phí — Lite Version
            </div>

            <h1 className="text-4xl font-extrabold mb-4">
              Khám phá năng lực<br />
              <span className="text-indigo-300">của bản thân bạn</span>
            </h1>

            <p className="text-indigo-200 text-lg leading-relaxed mb-8 max-w-lg mx-auto">
              Bài trắc nghiệm <strong className="text-white">35 câu</strong> dựa trên mô hình Big Five, cho kết quả ngay lập tức. Hoàn toàn miễn phí.
            </p>

            <div className="flex justify-center gap-6 mb-8 flex-wrap text-sm">
              {["35 câu hỏi", "~10 phút", "Kết quả ngay", "Miễn phí"].map(s => (
                <div key={s} className="flex items-center gap-1.5 text-indigo-200">
                  <span className="text-green-400">✓</span> {s}
                </div>
              ))}
            </div>

            <Button
              onClick={() => setStep("userinfo")}
              size="lg"
              className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-lg px-10 py-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Bắt đầu ngay →
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { icon: "🧠", label: "Big Five Model", desc: "Chuẩn vàng tâm lý học" },
            { icon: "📊", label: "Báo cáo trực quan", desc: "Biểu đồ Radar năng lực" },
            { icon: "🚀", label: "Nâng cấp Premium", desc: "Phân tích AI chuyên sâu" },
          ].map(f => (
            <div key={f.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-semibold text-slate-800 text-sm">{f.label}</div>
              <div className="text-slate-400 text-xs mt-1">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── USER INFO ──
  if (step === "userinfo") {
    return (
      <div className="w-full animate-in fade-in duration-300">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-2xl mb-3">
            <span className="text-2xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Thông tin của bạn</h2>
          <p className="text-slate-400 text-sm">Chỉ mất 30 giây · Bảo mật hoàn toàn</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 space-y-5">
          <div className="bg-indigo-600 h-1 w-1/3 rounded-full" />

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Họ và Tên <span className="text-red-500">*</span>
            </label>
            <Input
              autoFocus
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={e => { setFullName(e.target.value); setFormError(null); }}
              className="h-11 border-slate-200 focus:border-indigo-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Email <span className="text-slate-400 font-normal text-xs">(tuỳ chọn — nhận kết quả qua email)</span>
            </label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setFormError(null); }}
              className="h-11 border-slate-200 focus:border-indigo-400"
            />
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {formError}
            </div>
          )}

          <Button
            onClick={handleUserInfoSubmit}
            disabled={submitting}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
          >
            {submitting ? "Đang xử lý..." : "Tiếp tục làm bài →"}
          </Button>

          <p className="text-center text-xs text-slate-400">
            🔒 Thông tin của bạn được bảo mật và không chia sẻ
          </p>
        </div>
      </div>
    );
  }

  // ── QUIZ ──
  if (step === "quiz" && userId) {
    return (
      <PublicQuizStep
        userId={userId}
        leadEmail={leadEmail}
        leadPhone={leadPhone}
        onComplete={handleQuizComplete}
      />
    );
  }

  // ── LEAD GATE ──
  if (step === "lead" && recordId) {
    return (
      <LeadCaptureGate
        recordId={recordId}
        onComplete={handleLeadComplete}
      />
    );
  }

  // ── DONE ──
  return (
    <div className="text-center p-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
      <p className="text-slate-500 mt-4">Đang chuyển hướng...</p>
    </div>
  );
}
