# TECH SPECS: Hệ thống Quản lý và Đánh giá Nhân sự (HR Assessment)

## 1. Nghiệp vụ và luồng hệ thống (Phiên bản 4.0 - SOTA Universal)
Hệ thống cho phép nhân sự (nhân viên nội bộ) và **ứng viên phỏng vấn** tham gia làm bài trắc nghiệm / đánh giá tính cách và năng lực theo chuẩn. 
Dữ liệu được lưu trữ tập trung vào cơ sở dữ liệu **`tracnghiemtinhcach`** qua **Prisma ORM**.

## 2. Thiết kế Cấu trúc Dữ liệu (Database Schema)
Sử dụng PostgreSQL:
- **Bảng `User`**: Lưu thông tin ứng viên (`fullName`, `email`, `employeeId`, `department`, `targetRole`).
- **Bảng `TargetRole`**: Danh mục các vị trí tuyển dụng/đánh giá (Dev, PM, HR, v.v.).
- **Bảng `QuestionSet`**: Quản lý các bộ câu hỏi theo phiên bản và chức danh.
- **Bảng `Question`**: Ngân hàng câu hỏi chi tiết với các thuộc tính: `textVi/En/Ja`, `dimensionId`, `reversed`, `isLieScale`.
- **Bảng `AssessmentRecord`**: Kết quả đánh giá (`resultData`, `answers`, `version`, `hrNote`, `questionSetId`).

## 3. Kiến trúc hệ thống
Hệ thống được chuyển đổi toàn diện sang kỹ thuật **Next.js 14+ App Router** với cách tổ chức mô-đun **Feature-Based**:

- `src/app`: Giao diện ứng dụng và các Routes (Intro -> User Info -> Quiz -> Result).
- `src/features/assessment`: Core Feature. Quản lý toàn bộ Logic về tính điểm (Scoring, Big Five, Combat Power), Components trắc nghiệm và Report. Được validate bằng **Zod**.
- `src/server/actions`: Backend xử lý nghiệp vụ, giao tiếp cơ sở dữ liệu bằng **Server Actions**.
  - `assessmentActions.ts`: Lấy câu hỏi động theo Role và xử lý lưu kết quả.
  - `generateAiReportAction.ts`: Tích hợp OpenAI GPT-4o-mini đánh giá tổng quan ứng viên.
- `src/components/ui`: Gồm các components hỗ trợ thiết kế **Shadcn UI** & **Tailwind CSS**.

## 4. Cơ chế câu hỏi động (Phase 2)
- Hệ thống không còn sử dụng file `questions.ts` tĩnh. 
- Thay vào đó, sau khi người dùng chọn vị trí (`targetRole`), hệ thống gọi Server Action để lấy bộ câu hỏi mới nhất từ Database.
- Dung lượng ngân hàng câu hỏi hiện tại: ~1,000+ câu hỏi MOCK phân bổ theo 8 chức danh chính.
- Hỗ trợ đổi mới (refresh) câu hỏi qua AI thông qua Master Seeder mà không cần thay đổi source code.
- **Tiêu chuẩn thiết kế ngân hàng câu hỏi đặc thù (C-Level/CEO):** Câu hỏi dành cho cấp độ Lãnh đạo cao cấp tuân thủ bộ lọc chống "Social Desirability Bias". Tất cả các câu hỏi đo lường hành vi C-Level bắt buộc xây dựng theo dạng **Trade-off (Đánh đổi)**, **Complexity (Tình huống nghịch lý)** và **Skin in the Game (Chi trả cho rủi ro)** nhằm đo lường năng lực và tính cách chịu trách nhiệm thực tế.

## 5. Công nghệ & Thư viện
- Next.js 14+ / TypeScript.
- Prisma ORM / PostgreSQL.
- Zod / React Hook Form.
- Tailwind CSS / Shadcn UI / Recharts (vẽ biểu đồ Radar/Bar).
- **Google Font Inter** (Typography).
- Tích hợp OpenAI GPT-4o-mini cho phân tích báo cáo chuyên sâu.

## 6. Giao diện (UI/UX Redesign - Phiên bản 2.1)
- **Design System**: Sử dụng tông màu chủ đạo **Indigo/Slate**.
  - Indigo (#4F46E5): Đại diện cho sự tin cậy, chuyên nghiệp trong HR.
  - Slate (#F8FAFC): Tạo không gian báo cáo thoáng đãng, dễ đọc.
- **Typography**: Font **Inter** được tích hợp qua `next/font/google`, tối ưu hóa font-size (tối thiểu 12px cho text nhỏ và 14px cho body) để tránh lỗi cắt chữ.
- **Responsive Layout**: Áp dụng Container-based design (`max-w-5xl`) và Grid system linh hoạt, đảm bảo báo cáo hiển thị chuẩn xác trên cả Mobile và Desktop.
- **Data Visualization**: Refactor toàn bộ các biểu đồ SVG (ZigZagMatrix, HorizontalMatrix) sang hệ tọa độ tương đối (`viewBox`) để đảm bảo tính nhất quán khi in ấn (Print Mode) và thay đổi kích thước màn hình.

## 7. Module Báo cáo SOTA Universal V4.0 (Toàn diện & Đa năng)
- **Cơ chế đánh giá**: Áp dụng bộ câu hỏi **Universal** cho mọi vị trí trong tổ chức. Không còn phân chia bộ câu hỏi cứng nhắc theo Role tại tầng database, thay vào đó sử dụng một bộ quy chuẩn 120 câu.
- **Dữ liệu**: Phiên bản `4.0-SOTA-Universal`. 120 câu hỏi bao quát 12 chiều năng lực cốt lõi. Ngôn ngữ trung tính (Neutral), sử dụng đại từ "Tôi" để tối ưu hóa sự tự phản chiếu.
- **AI Niche Analysis (Cố vấn nghề nghiệp AI)**:
  - Phân loại dựa trên 4 nhóm Job-Fit chính: **Technical, Business, Operations, Management**.
  - AI không chỉ đánh giá mức độ phù hợp chung mà phải đề xuất các **vai trò ngách (Niche roles)** cụ thể. 
  - Ví dụ: Nếu phù hợp Technical, AI sẽ gợi ý sâu là Backend Optimization, Cloud Architect, hay Frontend UX Engineer dựa trên sự kết hợp các điểm số tính cách.
  - **Quy tắc ngôn ngữ AI (AI Prompting Rules):**
    - Ngôi thứ hai: Luôn sử dụng "Bạn" để tăng tính tương tác và phản chiếu cá nhân.
    - Trung tính (Neutral): Loại bỏ các tính từ sáo rỗng, phóng đại (ngọc ngà, dịch chuyển thế giới, vạn quy tắc...).
    - Cấu trúc 1-1: Mỗi nhận xét phải tuân thủ công thức **1 Hành vi + 1 Kết quả**.
    - Sửa lỗi chính tả: Kiểm soát chặt chẽ chính tả tiếng Việt trong nội dung tạo ra.
- **Cấu trúc dữ liệu AIReport (V4.1)**:
  - Tách biệt `strengthsBlindSpots` thành object riêng chứa `strengths` và `blindSpots` để tối ưu SEO và cấu trúc dữ liệu Frontend.
  - Mỗi Điểm mạnh/Điểm mù chứa `title` và `behavior`/`risk` thay vì `description` chung chung để đảm bảo tính hành động.
- **Logic Validation (Engine Scoring V4.3 - Đa ngành nghề & Chống gian lận sâu)**:
  - **Mở rộng Ngân hàng câu hỏi (140 câu)**:
    - Bổ sung 4 câu hỏi Situational Judgment Test (SJT) và 4 câu hỏi Cực đoan (Extreme Forced-Choice) để phát hiện nói dối và đo lường EQ, xử lý tình huống linh hoạt.
    - Thời gian tính toán được tối ưu động: SJT (12s) và Cực đoan (18s) để không đánh nhầm lỗi "Quick Answers".
  - **Thang đo nói dối (Lie Scale)**: Phân mức độ Warning và Risk. Tích hợp trực tiếp với dạng câu hỏi Cực đoan (`lie_absolute`) để nhận diện xu hướng đánh bóng bản thân tuyệt đối.
  - **Xu hướng Trung lập & Dễ dãi (Neutral/Acquiescence Bias)**: Kiểm soát hành vi né tránh hoặc xu hướng ba phải. Ngưỡng cảnh báo Risk được thắt chặt.
  - **Độ nhất quán (Consistency)**: Kiểm tra các câu hỏi xuôi - ngược (reversed questions) để đánh giá sự tập trung và chân thực của người làm bài.
  - **Hard Cap Penalty**: Độ tin cậy (Reliability Score) bị giới hạn tối đa 50% nếu vi phạm lỗi logic lớn hoặc gian lận hệ thống.
  - **Automated Validation Data (50 Personas)**: Nâng cấp kịch bản kiểm thử tĩnh và động với 50 Persona (Role đa ngành: Xây dựng, Y tế, Giáo dục, Legal, Tài chính...) xác thực tỷ lệ Pass/Fail cực gắt. Đảm bảo mô hình đánh giá không dính thiên kiến IT để vươn tới hệ quy chiếu chuẩn 100% ngành nghề. Kết quả validation được export tự động sang dạng JSON và Report UI.
