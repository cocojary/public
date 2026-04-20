# PHÂN TÍCH HỆ THỐNG — Techzen HR Assessment (SPI V4.2)

> **Vai trò:** Business Analyst  
> **Ngày tạo:** 2026-04-20  
> **Phiên bản hệ thống:** SPI V4.2 SOTA Universal  
> **Trạng thái:** Production-ready (90% accuracy trên validation suite)

---

## 1. TỔNG QUAN HỆ THỐNG

| Mục | Chi tiết |
|-----|----------|
| **Tên hệ thống** | Techzen HR Assessment / Hệ thống Đánh giá Nhân sự |
| **Phiên bản** | SPI V4.2 (SOTA Universal) |
| **Tech Stack** | Next.js 16 + TypeScript + Prisma ORM + PostgreSQL + OpenAI GPT-4o |
| **Mục đích chính** | Đánh giá tính cách, phân tích phù hợp vị trí, phát hiện gian lận hồ sơ |
| **Mô hình tâm lý** | Big Five Personality + Motivation + Thinking + Values + Stress + Competency |
| **Số chiều đánh giá** | 26 tổng (20 active, 6 leadership ẩn) |
| **Số câu hỏi** | 120 câu chính + 20 câu lie scale |
| **Ngôn ngữ hỗ trợ** | Tiếng Việt, Tiếng Anh, Tiếng Nhật |

---

## 2. CÁC ACTOR VÀ USE CASE

### 2.1 Danh sách Actor

| Actor | Vai trò | Quyền hạn |
|-------|---------|-----------|
| **Candidate / Nhân viên** | Người làm bài thi | Làm bài, xem kết quả, xuất PDF |
| **HR Manager / Recruiter** | Quản lý tuyển dụng | Xem dashboard, lọc ứng viên, thêm ghi chú |
| **System Admin** | Quản trị dữ liệu | Seed câu hỏi, quản lý dimensions, chạy validation |
| **AI Engine (GPT-4o)** | Sinh báo cáo tự động | Phân tích điểm số, tạo persona, gợi ý coaching |

### 2.2 Use Case chính

| Use Case | Actor | Mô tả |
|----------|-------|-------|
| UC-01: Làm bài thi | Candidate | Trải qua 5 bước: Intro → User Info → Quiz → Submit → Kết quả |
| UC-02: Xem kết quả | Candidate | Xem báo cáo chi tiết, radar chart, AI report |
| UC-03: Xuất PDF | Candidate | In báo cáo để nộp cho HR |
| UC-04: Xem dashboard | HR Manager | Thống kê tổng hợp, danh sách tất cả bài thi |
| UC-05: Lọc ứng viên | HR Manager | Lọc theo vị trí, reliability level |
| UC-06: Seed dữ liệu | System Admin | Thêm câu hỏi từ CSV hoặc 20 personas test |
| UC-07: Chạy validation | System Admin | Kiểm tra độ chính xác của engine với 20 persona test |
| UC-08: Sinh AI report | AI Engine | Tự động phân tích + cache vào DB |

---

## 3. LUỒNG XỬ LÝ CHÍNH

### 3.1 Luồng làm bài thi (User Journey)

```
[BƯỚC 1] INTRO STEP
  └─ Hiển thị giới thiệu hệ thống
  └─ Người dùng chọn ngôn ngữ (vi/en/ja)
  └─ Nhấn "Bắt đầu"

[BƯỚC 2] USER INFO STEP
  └─ Thu thập: Họ tên, Email, Mã NV, Phòng ban, Vị trí ứng tuyển
  └─ Validate với Zod schema (userInfoSchema.ts)
  └─ Tạo/tìm User record trong DB

[BƯỚC 3] QUIZ STEP
  └─ Load 120 câu hỏi từ DB (theo ngôn ngữ)
  └─ Hiển thị từng câu với thanh tiến trình
  └─ Người dùng chọn đáp án 1-5 (Rất đồng ý → Rất không đồng ý)
  └─ Auto-save tiến trình vào localStorage (recovery khi refresh)
  └─ Ghi lại thời gian trả lời từng câu

[BƯỚC 4] SUBMIT
  └─ Gọi submitAssessmentAction()
  └─ Kiểm tra rate limit (1 bài/giờ/IP)
  └─ Tải toàn bộ question set (main + lie scale)
  └─ Gọi calculateUnifiedScores() — scoring engine V4.2
  └─ Lưu AssessmentRecord vào DB
  └─ Trigger async AI report generation

[BƯỚC 5] KẾT QUẢ
  └─ Redirect đến /result/[id]
  └─ Hiển thị báo cáo (ScouterReport hoặc UnifiedReport)
  └─ Fetch AI report (nếu chưa cache)
  └─ Cung cấp nút xuất PDF
```

### 3.2 Luồng sinh AI Report

```
generateAiReportAction() được gọi:
1. Kiểm tra cache trong DB (cùng recordId + language) → nếu có, trả về ngay
2. Normalize result data (V4 → V2 format nếu cần)
3. Chạy các hàm phân tích:
   - detectPersona() → archetype tính cách
   - calcCombatPower() → chỉ số sức mạnh 0-100
   - calcDutySuitability() → phù hợp 4 loại công việc
4. Build prompt với rules cho AI behavior
5. Gọi OpenAI GPT-4o (response_format: JSON)
6. Retry 2 lần với exponential backoff (1200ms * attempt)
7. Parse JSON, cache vào DB, trả về client
```

---

## 4. KIẾN TRÚC HỆ THỐNG

### 4.1 Sơ đồ kiến trúc tổng thể

```
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND — Next.js App Router (React 19)                     │
│  • app/page.tsx           — Trang chính (assessment flow)    │
│  • app/result/[id]/       — Trang xem kết quả (dynamic)      │
│  • app/admin/             — Dashboard admin                   │
└──────────────────────────────────────────────────────────────┘
                              ↕ Server Actions
┌──────────────────────────────────────────────────────────────┐
│ SERVER ACTIONS (Next.js Server Components)                   │
│  • assessmentActions.ts     — Quiz logic, scoring            │
│  • generateAiReportAction.ts — AI report pipeline            │
│  • adminActions.ts          — Dashboard queries              │
│  • getRecordAction.ts       — Fetch kết quả                  │
└──────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────┐
│ CORE SERVICES                                                │
│  • unifiedEngine.ts         — Thuật toán tính điểm V4.2 ★   │
│  • openaiService.ts         — GPT-4o integration             │
│  • assessmentDataService.ts — Database abstraction layer     │
│  • aiAnalysis.ts            — Persona detection, combat power│
└──────────────────────────────────────────────────────────────┘
                              ↕ Prisma ORM
┌──────────────────────────────────────────────────────────────┐
│ DATABASE — PostgreSQL                                        │
│  • User, Dimension, DimensionRelation                        │
│  • Question, QuestionSet                                     │
│  • AssessmentRecord, RateLimit                               │
└──────────────────────────────────────────────────────────────┘
                              ↕ REST API
┌──────────────────────────────────────────────────────────────┐
│ EXTERNAL APIs                                                │
│  • OpenAI GPT-4o — Sinh báo cáo AI (Bearer token auth)      │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Cấu trúc thư mục source

| Thư mục/File | Chức năng |
|-------------|----------|
| `src/app/` | Next.js App Router pages |
| `src/features/assessment/components/` | UI components (Intro, UserInfo, Quiz, Result) |
| `src/features/assessment/data/` | Hardcoded dimensions, AI analysis functions |
| `src/features/assessment/utils/unifiedEngine.ts` | ★ Core scoring engine V4.2 |
| `src/features/assessment/utils/openaiService.ts` | GPT-4o integration |
| `src/server/actions/` | Server-side logic (actions, validations) |
| `src/server/services/assessmentDataService.ts` | DB abstraction + caching |
| `src/server/utils/rateLimit.ts` | IP-based rate limiting |
| `prisma/schema.prisma` | Database schema |
| `scripts/` | Seed data, validation scripts |

---

## 5. DATA MODEL

### 5.1 Các Entity chính

**User** — Người dùng / Ứng viên

| Field | Type | Mô tả |
|-------|------|-------|
| id | UUID | Primary key |
| employeeId | string? | Mã nhân viên (unique, optional) |
| fullName | string | Họ tên (required) |
| email | string? | Email |
| department | string? | Phòng ban |
| position | string? | Vị trí hiện tại |
| createdAt | DateTime | Ngày tạo |

**Dimension** — Chiều đặc điểm tính cách

| Field | Type | Mô tả |
|-------|------|-------|
| id | string | Ví dụ: 'extraversion', 'conscientiousness' |
| nameVi | string | Tên tiếng Việt |
| nameEn | string | Tên tiếng Anh |
| group | enum | personality / motivation / thinking / values / stress / competency / leadership |
| descLow | string | Mô tả khi điểm thấp |
| descHigh | string | Mô tả khi điểm cao |
| color | string | Màu hex cho UI |
| isActive | boolean | Đang sử dụng hay không |

**Question** — Câu hỏi đánh giá

| Field | Type | Mô tả |
|-------|------|-------|
| id | UUID | Primary key |
| setId | UUID | FK → QuestionSet |
| dimensionId | string | FK → Dimension |
| textVi | string | Nội dung tiếng Việt (required) |
| textEn | string? | Nội dung tiếng Anh |
| textJa | string? | Nội dung tiếng Nhật |
| questionType | enum | main / lie_absolute / lie_subtle / ceo_only |
| reversed | boolean | Câu đảo chiều (score = 6 - answer) |
| lieWeight | float | Trọng số lie: absolute=1.0, subtle=0.5 |
| displayOrder | int | Thứ tự hiển thị |

**AssessmentRecord** — Kết quả bài thi

| Field | Type | Mô tả |
|-------|------|-------|
| id | UUID | Primary key |
| version | string | Phiên bản engine (vd: "4.2-SPI-UNIFIED") |
| answers | JSON | questionId → 1-5 score |
| answerTimes | JSON? | questionId → milliseconds |
| resultData | JSON | UnifiedScoringResult từ engine |
| aiReport | JSON? | Cached AIReport từ GPT-4o |
| submissionIp | string? | IP để rate limiting |
| viewCount | int | Số lần xem |
| userId | UUID | FK → User |
| questionSetId | UUID? | FK → QuestionSet |

### 5.2 Quan hệ giữa các Entity

```
User (1) ──────── (N) AssessmentRecord
QuestionSet (1) ── (N) Question
QuestionSet (1) ── (N) AssessmentRecord
Dimension (1) ──── (N) Question
Dimension (N) ──── (N) Dimension [via DimensionRelation — contradiction rules]
```

---

## 6. CÁC CHIỀU TÍNH CÁCH (20 DIMENSIONS)

| Nhóm | Chiều | Mô tả |
|------|-------|-------|
| **Personality (Big Five)** | Extraversion | Hướng ngoại vs Hướng nội |
| | Agreeableness | Dễ chịu, hợp tác |
| | Conscientiousness | Tận tâm, có trách nhiệm |
| | Openness | Cởi mở với ý tưởng mới |
| | Emotional Stability | Ổn định cảm xúc (nghịch với Neuroticism) |
| **Motivation** | Achievement Drive | Khao khát thành tích |
| | Challenge Spirit | Tinh thần thách thức |
| | Autonomy | Nhu cầu tự chủ |
| | Learning Curiosity | Ham học hỏi |
| | Recognition Need | Nhu cầu được công nhận |
| **Thinking** | Logical Thinking | Tư duy logic |
| | Empathy | Đồng cảm |
| | Execution Speed | Tốc độ thực thi |
| | Caution | Thận trọng |
| **Values** | Growth Orientation | Định hướng phát triển |
| | Stability Orientation | Định hướng ổn định |
| | Social Contribution | Đóng góp xã hội |
| **Stress** | Mental Stress Tolerance | Chịu áp lực tâm lý |
| | Physical Stress Tolerance | Chịu áp lực thể lực |
| **Competency** | Critical Thinking | Tư duy phản biện |
| *(Hidden - Leadership)* | 11 chiều C-level | Chỉ dùng cho đánh giá leadership nội bộ |

---

## 7. ENGINE TÍNH ĐIỂM (V4.2)

### 7.1 Quy trình tính điểm

| Bước | Xử lý | Chi tiết |
|------|-------|----------|
| 1 | **Tính điểm thô** | Sum(answers) cho từng dimension, apply reverse-scoring |
| 2 | **Scale về 1-10** | percentile = (raw - min)/(max - min)*100, scaled = percentile/10 |
| 3 | **Data Quality: Lie Scale** | Đếm answers ≥ 4 trên lie questions; Warning ≥ 2.5, Risk ≥ 5.0 |
| 4 | **Data Quality: Consistency** | avg(forward) vs avg(reversed) > 1.5 = inconsistent; cross-dimension rules từ DB |
| 5 | **Data Quality: Neutral Bias** | Tỷ lệ answers = 3; Warning > 25%, Risk > 40% |
| 6 | **Data Quality: Time Tracking** | Tổng thời gian < 3s/câu = Risk |
| 7 | **Data Quality: Pattern Detection** | ≥10 câu trả lời giống nhau liên tiếp = Risk |
| 8 | **Data Quality: Acquiescence Bias** | Mean raw answers > 4.2 hoặc < 1.8 = Risk |
| 9 | **Data Quality: Extreme Responder** | Tỷ lệ 1+5 > 90% = Risk, > 75% = Warning |
| 10 | **Data Quality: Quick Answers** | > 50% answers < 2 giây = Risk |
| 11 | **Reliability Score** | Weighted formula từ 8 metrics → điểm 0-100 |
| 12 | **Reliability Level** | 4 cấp độ: reliable / mostly-reliable / use-with-caution / low-interpretability |

### 7.2 Phân loại độ tin cậy

| Level | Score | Ý nghĩa | Hướng dẫn cho HR |
|-------|-------|---------|-----------------|
| **reliable** | 85-100 | Dữ liệu đáng tin | Sử dụng trực tiếp |
| **mostly-reliable** | 70-84 | Có 1-2 vấn đề nhỏ | Xem xét kèm 1 câu hỏi bổ sung |
| **use-with-caution** | 50-69 | Có vấn đề đáng kể | Verify bằng phỏng vấn trực tiếp |
| **low-interpretability** | < 50 | Dữ liệu quá nhiễu | Bỏ qua hoặc thi lại |

### 7.3 Công thức Reliability Score

```
reliabilityScore = 100
  - (weight_lie × lieStatus)
  - (weight_consistency × consistencyStatus)
  - (weight_neutral × neutralStatus)
  - (weight_pattern × patternStatus)
  - (weight_acquiescence × acquiescenceStatus)
  - (weight_extreme × extremeStatus)
  - (weight_quick × quickStatus)
  - (weight_time × timeStatus)
```

---

## 8. AI REPORT STRUCTURE (GPT-4o Output)

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| reliabilityVerdict | string | 2-3 câu đánh giá tính trung thực |
| reliabilityAlert | boolean | lieScore > 7/10? |
| personaTitle | string | Ví dụ: "Phân Tích Chiến Lược Tỉnh Táo" |
| personaEmoji | string | 1 emoji đại diện |
| personaDescription | string | 60-80 từ mô tả tổng thể |
| personaCombination | string | Phân tích synergy hoặc mâu thuẫn |
| strengthsBlindSpots | object | 3 điểm mạnh + 2-3 điểm mù |
| jobFit.technical | {score, comment} | Phù hợp kỹ thuật (0-100) |
| jobFit.business | {score, comment} | Phù hợp kinh doanh (0-100) |
| jobFit.operations | {score, comment} | Phù hợp vận hành (0-100) |
| jobFit.management | {score, comment} | Phù hợp quản lý (0-100) |
| coachingAdvice | array | Gợi ý phát triển: area + action + rationale |
| language | vi/en/ja | Ngôn ngữ báo cáo |
| fromCache | boolean | Lấy từ cache hay sinh mới |

---

## 9. BUSINESS RULES

### 9.1 Rules kiểm soát submission

| Rule | Cơ chế | Tác động |
|------|--------|---------|
| **1 bài/giờ/IP** | IP-based rate limiting (RateLimit table) | Chặn spam, lạm dụng API |
| **Lie Scale ≥ 5.0** | Engine tính toán → Risk status | Đánh dấu để HR xem xét |
| **Neutral Bias > 40%** | Engine tính toán → Risk | Phát hiện né tránh |
| **< 3s/câu** | Tính từ answerTimes JSON | Đánh dấu có thể đoán mò |
| **10+ câu liên tiếp giống** | Pattern detection | Phát hiện gian lận cơ học |
| **Đủ 120 câu** | Validate trước khi submit | Từ chối nếu thiếu |

### 9.2 Rules cross-dimension (từ DB)

- Extraversion cao + Neuroticism cao = Mâu thuẫn tâm lý → tăng consistency issues
- Các cặp mâu thuẫn được cấu hình trong bảng `DimensionRelation`
- `evidenceWeight = 1.5x` (tăng nặng) khi phát hiện contradiction

---

## 10. TÍCH HỢP API

### 10.1 OpenAI GPT-4o

| Mục | Chi tiết |
|-----|----------|
| **Model** | gpt-4o (latest) |
| **Auth** | Bearer token (`OPENAI_API_KEY`) |
| **Temperature** | 0.6 |
| **Max Tokens** | ~2500 |
| **Response Format** | JSON object (forced structured output) |
| **Retry Logic** | 2 lần, exponential backoff 1200ms × attempt |
| **Error Handling** | 429 / 5xx → retry; 4xx khác → throw |
| **Caching** | Cached per (recordId, language) trong DB |

### 10.2 Database (PostgreSQL / Prisma)

| Mục | Chi tiết |
|-----|----------|
| **ORM** | Prisma 5.22 |
| **Connection** | `DATABASE_URL` env var |
| **Tables** | 11 tables |
| **Cache** | 60s TTL in-memory (dimensions, questions, relations) |
| **Transactions** | Không dùng (simple CRUD) |

---

## 11. PERFORMANCE

| Metric | Giá trị |
|--------|---------|
| Quiz load (fetch questions) | ~200ms |
| Scoring engine | ~50ms |
| AI report generation | 3-8 giây |
| DB queries | < 20ms |
| Cache TTL | 60 giây |

---

## 12. TESTING & VALIDATION

### 12.1 Bộ test 20 personas

| Nhóm | Số persona | Mục đích |
|------|-----------|---------|
| **Honest** | 7 | Hồ sơ trung thực — hệ thống KHÔNG được flag |
| **Adversarial** | 5 | Gian lận / phóng đại — hệ thống PHẢI phát hiện |
| **Edge Cases** | 8 | Tâm lý phức tạp, burnout, mâu thuẫn |

### 12.2 Kết quả validation hiện tại

| Metric | Giá trị |
|--------|---------|
| **Tổng kết quả** | 18/20 PASS (90%) |
| **False Positive Rate** | 0% (7/7 honest đúng) |
| **Edge Cases** | 100% đúng |
| **2 Failing Cases** | Persona #11 (Zigzac), Persona #12 (Subtle Lie) |

### 12.3 Root cause của 2 cases thất bại

| Case | Vấn đề | Root Cause |
|------|--------|-----------|
| Persona #11 (Zigzac) | Pattern detected nhưng reliability = 84 (cần ≤ 50) | Pattern weight quá nhỏ trong formula |
| Persona #12 (Subtle Lie) | 86% extreme responder nhưng marked reliable | Thiếu rule kết hợp `extremeResponder + lieScale` |

---

## 13. BUG TRACKER (P1/P2)

| ID | Priority | Mô tả | Tác động | Cách sửa |
|----|----------|-------|---------|---------|
| BUG-001 | 🔴 P1 | Acquiescence overflow → NaN | Hiển thị `3,195,453.52` thay vì ~3.x | Guard với `Number.isFinite()` |
| BUG-002 | 🔴 P1 | Zigzac không bị phạt điểm | Reliability = 84 khi cần = 50 | Hard cap nếu pattern=Risk: `min(score, 50)` |
| BUG-003 | 🟡 P2 | Extreme responder tinh vi không bị phát hiện | 1/5 adversarial cases thoát | Thêm rule kết hợp: if `extremeResponder ≥ 75% AND lieScale ≥ 1.5` → flag |
| BUG-004 | 🟡 P2 | UI chỉ có tiếng Anh (hard-coded) | Non-Vietnamese users bị nhầm | i18n toàn bộ UI labels |

---

## 14. BẢO MẬT & TUÂN THỦ

### 14.1 Các biện pháp bảo mật hiện tại

| Biện pháp | Cơ chế | Phạm vi |
|-----------|--------|--------|
| Rate Limiting | IP-based, 1 bài/giờ, lưu DB | Chống spam, API abuse |
| Input Validation | Zod schemas tất cả inputs | SQL injection, XSS prevention |
| Parameterized Queries | Prisma ORM | SQL injection |
| Server-only Actions | Next.js server actions | Không expose logic client |
| CORS | Implicit same-origin | Không public API |

### 14.2 Điểm cần cải thiện bảo mật

| Mục | Trạng thái | Ghi chú |
|-----|-----------|---------|
| Authentication | ❌ Không có | Hệ thống mở, cần thêm auth cho admin |
| GDPR / Xóa dữ liệu | ❌ Không có | Không có right-to-be-forgotten |
| Data retention policy | ❌ Không có | Kết quả lưu vô thời hạn |
| API key rotation | ⚠️ Manual | OpenAI key cần rotation định kỳ |

---

## 15. ROADMAP

### 15.1 Cần làm ngay (P1 — Trước khi ra production)

| # | Task | Ước lượng |
|---|------|----------|
| 1 | Fix BUG-001: Guard acquiescence overflow | 1h |
| 2 | Fix BUG-002: Connect pattern → reliability penalty | 2h |
| 3 | Fix BUG-003: Combined extreme+lie rule | 2h |

### 15.2 Short-term (Q2-Q3 2026)

| # | Task | Mô tả |
|---|------|-------|
| 1 | i18n UI toàn bộ | Hỗ trợ đầy đủ vi/en/ja cho toàn bộ giao diện |
| 2 | Benchmark comparison | So sánh kết quả vs "Developer average" |
| 3 | Admin export to Excel | Xuất danh sách ứng viên ra Excel |
| 4 | Authentication admin | Bảo vệ trang /admin |

### 15.3 Long-term (Q4 2026 – Q2 2027)

| # | Task | Mô tả |
|---|------|-------|
| 1 | Mobile app | React Native cho kiosk văn phòng |
| 2 | Multi-reviewer | HR notes, nhiều người review cùng 1 ứng viên |
| 3 | HRIS integration | Kết nối SAP/HRMS |
| 4 | GDPR compliance | Right-to-be-forgotten, data retention |

---

## 16. TÓM TẮT CÁC CHỈ SỐ KỸ THUẬT

| Chỉ số | Giá trị |
|--------|---------|
| Số file source | ~60 files |
| Lines of code (src/) | ~2,000 LOC |
| Core engine (unifiedEngine.ts) | ~450 LOC |
| Chiều tính cách | 26 (20 active) |
| Câu hỏi / bài thi | 120 main + 20 lie scale |
| Ngôn ngữ | Vietnamese, English, Japanese |
| Database tables | 11 |
| External API dependencies | 1 (OpenAI GPT-4o) |
| Độ chính xác validation | 90% (18/20 personas) |
| False positive rate | 0% |
| Test coverage | ~10% (validation scripts) |
| Deployment target | Vercel / self-hosted |

---

## 17. ĐÁNH GIÁ TỔNG THỂ (BA ASSESSMENT)

### Điểm mạnh

- Kiến trúc rõ ràng, modular, dễ mở rộng
- Engine tính điểm V4.2 với 8 cơ chế phát hiện gian lận
- AI report generation với caching thông minh
- 0% false positive — không "oan" người trung thực
- Multi-language support từ đầu (vi/en/ja)
- Validation suite 20 personas bài bản

### Điểm cần cải thiện

- 2 P1 bugs cần sửa trước khi go-live
- Chưa có authentication cho admin
- UI hard-coded tiếng Anh
- Không có GDPR compliance
- Test coverage thấp (~10%)

### Khuyến nghị BA

> Hệ thống **sẵn sàng production** sau khi sửa 3 P1 bugs. Ưu tiên tiếp theo là authentication admin và i18n UI để phục vụ đa ngôn ngữ.
