"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { savePublicLeadAction } from "@/server/actions/publicAssessmentActions";

interface Props {
  recordId: string;
  onComplete: () => void;
}

export function LeadCaptureGate({ recordId, onComplete }: Props) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedEmail && !trimmedPhone) {
      setError("Vui lòng nhập ít nhất email hoặc số điện thoại.");
      return;
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Email không hợp lệ.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await savePublicLeadAction(recordId, trimmedEmail || null, trimmedPhone || null);
      onComplete();
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Cho phép bỏ qua nhưng vẫn track
    savePublicLeadAction(recordId, null, null).catch(() => {});
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Success animation */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/20">
            <span className="text-4xl">🎉</span>
          </div>
          <div className="text-indigo-200 text-sm font-medium tracking-widest uppercase mb-2">
            Hoàn thành!
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Kết quả đã sẵn sàng
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed">
            Để nhận được báo cáo đầy đủ, hãy để lại thông tin liên lạc của bạn.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                Email
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                className="h-11 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                Số điện thoại
              </label>
              <Input
                type="tel"
                placeholder="0912 345 678"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(null); }}
                className="h-11 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                <>Xem kết quả ngay →</>
              )}
            </Button>

            <button
              onClick={handleSkip}
              disabled={loading}
              className="w-full text-sm text-slate-400 hover:text-slate-600 py-2 transition-colors"
            >
              Bỏ qua, tôi chỉ muốn xem kết quả
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            🔒 Thông tin bảo mật — chúng tôi không spam
          </p>
        </div>

        {/* Benefits teaser */}
        <div className="mt-6 bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4">
          <p className="text-indigo-200 text-xs text-center mb-3 font-medium">
            💎 Nâng cấp Premium để nhận thêm:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Phân tích AI chuyên sâu",
              "Phát hiện điểm yếu ẩn",
              "Năng lực thực chiến™",
              "Báo cáo PDF xuất khẩu",
            ].map(b => (
              <div key={b} className="flex items-center gap-1.5 text-indigo-200 text-xs">
                <span className="text-amber-400">✓</span> {b}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
