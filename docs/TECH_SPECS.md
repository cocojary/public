# TECH SPECS: Hệ thống Quản lý và Đánh giá Nhân sự (HR Assessment)

## 1. Nghiệp vụ và luồng hệ thống (Phiên bản 2.0 - Next.js)
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

## 7. Module Báo cáo Năng lực DEV SOTA V3.0 (Chuyên biệt cho Kỹ thuật)
- **Cơ chế đánh giá**: Áp dụng cho ứng viên có `roleCode: 'DEV'`. Sử dụng phiên bản dữ liệu `3.0-SPI-DEV`.
- **Dữ liệu**: Bộ câu hỏi 120 câu SOTA (12 nhóm năng lực), tích hợp Lie Scale (đo độ trung thực).
- **Logic tính điểm**: 
  - Đảo điểm (Reversed Items).
  - Lie Scale Score: Nếu điểm Lie Scale > 7, hệ thống kích hoạt cảnh báo "Độ tin cậy thấp" và áp dụng Penalty -15% cho toàn bộ điểm năng lực.
- **Phân loại AI (CTO Perspective)**: 
  - Rule-based engine xử lý chi tiết kỹ thuật và thế mạnh/yếu điểm.
  - OpenAI GPT-4o-mini đảm nhận phần "Nhận xét tổng quan" (Executive Summary) dưới góc nhìn giám đốc kỹ thuật.
- **Phân loại ứng viên**: Phân loại tự động thành 4 nhóm chính: Technical Expert, Product Engineer, Tech Leader, Generalist.
