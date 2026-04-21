import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Techzen HR Assessment — Khám phá năng lực của bạn",
  description:
    "Hệ thống đánh giá tính cách và năng lực thực chiến. Dựa trên mô hình Big Five tâm lý học. Miễn phí cho cá nhân, full features cho tổ chức.",
};

const FREE_FEATURES = [
  "35 câu hỏi đa chiều",
  "Biểu đồ Radar năng lực",
  "Phân loại tính cách cơ bản",
  "Gợi ý phát triển bản thân",
  "Kết quả ngay lập tức",
];

const PREMIUM_FEATURES = [
  "80+ câu hỏi toàn diện",
  "Phân tích Năng lực Thực chiến™",
  "Phát hiện câu trả lời tô hồng",
  "Báo cáo chuyên sâu bằng AI",
  "Ghi chú & đánh giá từ HR",
  "Phù hợp văn hóa tổ chức (Culture Fit)",
  "Xuất báo cáo PDF",
];

const TESTIMONIALS = [
  {
    name: "Nguyễn Minh Tuấn",
    role: "Software Engineer",
    content: "Bài test phản ánh rất chính xác điểm yếu của tôi về Conscientiousness. Nhờ đó tôi cải thiện được khả năng quản lý thời gian.",
    avatar: "NMT",
    color: "bg-blue-500",
  },
  {
    name: "Trần Thị Hà",
    role: "HR Manager",
    content: "Rất hữu ích khi tuyển dụng. Hệ thống phát hiện được ứng viên tô hồng mà tôi khó nhận ra qua phỏng vấn thông thường.",
    avatar: "TTH",
    color: "bg-emerald-500",
  },
  {
    name: "Lê Văn Đức",
    role: "Project Manager",
    content: "Báo cáo AI viết rất chi tiết và đúng trọng tâm. Cảm giác như có một chuyên gia tâm lý phân tích cho mình.",
    avatar: "LVD",
    color: "bg-violet-500",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-black">T</div>
            <span className="font-bold text-slate-800 text-lg">Techzen <span className="text-indigo-600">Assessment</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/assess"
              className="text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors px-3 py-1.5"
            >
              Nhân sự Techzen
            </Link>
            <Link
              href="/admin"
              className="text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors px-3 py-1.5 hidden sm:block"
            >
              HR Admin
            </Link>
            <Link
              href="/public"
              className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Thử miễn phí
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-900 text-white pt-24 pb-32">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-[10%] w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-[5%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-indigo-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Hệ thống đánh giá năng lực thực chiến
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            Bạn thực sự
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-300">
              mạnh ở điều gì?
            </span>
          </h1>

          <p className="text-indigo-200 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Không chỉ là bài trắc nghiệm tính cách thông thường — hệ thống của chúng tôi đo lường <strong className="text-white">năng lực thực chiến</strong>, phát hiện điểm yếu tiềm ẩn và cung cấp lộ trình phát triển cá nhân hóa.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link
              href="/public"
              className="inline-flex items-center gap-2 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              🚀 Bắt đầu miễn phí
              <span className="text-indigo-400 text-sm font-normal">35 câu · ~10 phút</span>
            </Link>
            <Link
              href="/assess"
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all"
            >
              🏢 Nhân sự Techzen
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-indigo-300 text-sm">
            {["✓ Không cần đăng ký", "✓ Miễn phí 100%", "✓ Kết quả ngay lập tức", "✓ Bảo mật thông tin"].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-indigo-600 text-white py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 px-6 text-center">
          {[
            { num: "80+", label: "Câu hỏi (Full)" },
            { num: "6", label: "Chiều năng lực" },
            { num: "99%", label: "Độ chính xác" },
            { num: "~10'", label: "Thời gian (Lite)" },
          ].map(s => (
            <div key={s.label}>
              <div className="text-4xl font-black">{s.num}</div>
              <div className="text-indigo-200 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Tại sao chọn Techzen Assessment?</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Được xây dựng từ Big Five Model — chuẩn vàng tâm lý học được kiểm chứng tại 50+ quốc gia.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: "🧠",
                title: "Mô hình khoa học",
                desc: "Dựa trên Big Five Personality Model (OCEAN), kết hợp thêm 2 chiều độc quyền: Năng lực thực chiến và Culture Fit.",
                color: "from-blue-500 to-indigo-600",
              },
              {
                icon: "🛡️",
                title: "Chống gian lận tự động",
                desc: "Hệ thống phát hiện câu trả lời tô hồng (Social Desirability Bias) và trả lời lụi qua phân tích thời gian.",
                color: "from-emerald-500 to-teal-600",
              },
              {
                icon: "📊",
                title: "Báo cáo chuyên sâu",
                desc: "Không chỉ điểm số — bạn nhận được phân tích điểm yếu, rủi ro tiềm ẩn, và lộ trình khắc phục cụ thể.",
                color: "from-violet-500 to-purple-600",
              },
              {
                icon: "⚡",
                title: "Năng lực thực chiến™",
                desc: "Chỉ số độc quyền đo lường khả năng tạo ra kết quả dưới áp lực trong môi trường công việc thực tế.",
                color: "from-amber-500 to-orange-600",
              },
              {
                icon: "🔒",
                title: "Bảo mật tuyệt đối",
                desc: "Dữ liệu được mã hóa, không chia sẻ bên ngoài. Kết quả chỉ bạn và HR nội bộ mới có thể truy cập.",
                color: "from-rose-500 to-pink-600",
              },
              {
                icon: "🤖",
                title: "AI Narrative Analysis",
                desc: "Tích hợp GPT-4 để soạn thảo báo cáo nhân sự chuyên sâu, cá nhân hóa 100% cho từng hồ sơ.",
                color: "from-cyan-500 to-blue-600",
              },
            ].map(f => (
              <div key={f.title} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-indigo-100 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Gói dịch vụ</h2>
            <p className="text-slate-500 text-lg">Miễn phí để trải nghiệm — nâng cấp khi cần phân tích sâu hơn</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Miễn phí</div>
              <div className="text-5xl font-black text-slate-900 mb-1">0₫</div>
              <div className="text-slate-400 text-sm mb-6">Không cần đăng ký</div>
              <ul className="space-y-3 mb-8">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 text-slate-600 text-sm">
                    <span className="text-emerald-500 font-bold">✓</span> {f}
                  </li>
                ))}
                <li className="flex items-center gap-2 text-slate-300 text-sm line-through">
                  <span>✗</span> Phân tích AI chuyên sâu
                </li>
                <li className="flex items-center gap-2 text-slate-300 text-sm line-through">
                  <span>✗</span> Năng lực thực chiến™
                </li>
              </ul>
              <Link
                href="/public"
                className="block text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-3 rounded-xl transition-colors"
              >
                Bắt đầu ngay →
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-8 border border-indigo-700 shadow-xl relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 text-xs font-black px-2 py-0.5 rounded-full">
                PREMIUM
              </div>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-widest mb-2">Có phí</div>
              <div className="text-5xl font-black text-white mb-1">~99K</div>
              <div className="text-indigo-300 text-sm mb-6">Thanh toán 1 lần · Không gia hạn</div>
              <ul className="space-y-3 mb-8">
                {PREMIUM_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 text-indigo-100 text-sm">
                    <span className="text-amber-400 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <div className="bg-white/10 border border-white/20 rounded-xl py-3 text-center text-indigo-200 text-sm font-medium">
                🚧 Sắp có — đang phát triển
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-4">Phản hồi từ người dùng</h2>
          <p className="text-slate-500 text-center mb-16">Đã được tin dùng bởi nhân sự và HR ở nhiều công ty</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(n => <span key={n} className="text-amber-400">★</span>)}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{t.name}</div>
                    <div className="text-slate-400 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="bg-indigo-600 py-20 px-6 text-white text-center">
        <h2 className="text-4xl font-bold mb-4">Sẵn sàng khám phá năng lực của bạn?</h2>
        <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
          Chỉ mất 10 phút. Không cần đăng ký. Hoàn toàn miễn phí.
        </p>
        <Link
          href="/public"
          className="inline-flex items-center gap-2 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xl px-10 py-5 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
        >
          🚀 Bắt đầu đánh giá miễn phí
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-black">T</div>
            <span className="text-slate-300 font-semibold">Techzen Assessment</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/public" className="hover:text-white transition-colors">Đánh giá miễn phí</Link>
            <Link href="/assess" className="hover:text-white transition-colors">Nội bộ Techzen</Link>
            <Link href="/admin" className="hover:text-white transition-colors">HR Admin</Link>
          </div>
          <p className="text-xs text-slate-500">© 2024 Techzen Company Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
