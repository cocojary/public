# TECH SPECS: Hệ thống Quản lý và Đánh giá Nhân sự (HR Assessment)

## 1. Nghiệp vụ và luồng hệ thống (Phiên bản 2.0 - Next.js)
Hệ thống cho phép nhân sự (nhân viên nội bộ) và **ứng viên phỏng vấn** tham gia làm bài trắc nghiệm / đánh giá tính cách và năng lực theo chuẩn. 
Dữ liệu được lưu trữ tập trung vào cơ sở dữ liệu **`tracnghiemtinhcach`** qua **Prisma ORM**.

## 2. Thiết kế Cấu trúc Dữ liệu (Database Schema)
Sử dụng PostgreSQL:
- **Bảng `User`**: Lưu thông tin ứng viên (`fullName`, `email`, `employeeId`, `department`, `position`).
- **Bảng `AssessmentRecord`**: Kết quả đánh giá (`resultData`, `answers`, `version`, `hrNote`).

## 3. Kiến trúc hệ thống
Hệ thống được chuyển đổi toàn diện sang kỹ thuật **Next.js 14+ App Router** với cách tổ chức mô-đun **Feature-Based**:

- `src/app`: Giao diện ứng dụng và các Routes (Intro -> User Info -> Quiz -> Result).
- `src/features/assessment`: Core Feature. Quản lý toàn bộ Logic về tính điểm (Scoring, Big Five, Combat Power), Components trắc nghiệm và Report. Được validate bằng **Zod**.
- `src/server/actions`: Backend xử lý nghiệp vụ, giao tiếp cơ sở dữ liệu bằng **Server Actions**, sử dụng API OpenAI ẩn danh để tạo nhận xét `Đánh giá tổng quan`.
- `src/components/ui`: Gồm các components hỗ trợ thiết kế **Shadcn UI** & **Tailwind CSS**.

## 4. Công nghệ & Thư viện
- Next.js 14+ / TypeScript.
- Prisma ORM / PostgreSQL.
- Zod / React Hook Form.
- Tailwind CSS / Shadcn UI / Recharts (vẽ biểu đồ Radar/Bar).
- Tích hợp OpenAI GPT-4o-mini đánh giá tổng quan ứng viên.
