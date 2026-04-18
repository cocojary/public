# TECH SPECS: Hệ thống Quản lý và Đánh giá Nhân sự (HR Assessment)

## 1. Nghiệp vụ và luồng hệ thống (Phiên bản 2.0)
Hệ thống cho phép nhân sự (nhân viên nội bộ) và **ứng viên phỏng vấn** tham gia làm bài trắc nghiệm / đánh giá tính cách và năng lực. 
Dữ liệu đánh giá như thông tin cơ bản, câu trả lời, thời gian hoàn thành trước đây được lưu trữ tạm thời trên localStorage. Tại phiên bản mới này, toàn bộ hồ sơ sẽ được đồng bộ hóa và lưu trữ tập trung vào cơ sở dữ liệu có tên **`tracnghiemtinhcach`**. Đối với ứng viên, các thông tin định danh như Email, Mã nhân viên là không bắt buộc.

## 2. Thiết kế Cấu trúc Dữ liệu (Database Schema)
Dựa theo thông tin cấu trúc hiện tại (`types.ts`), dữ liệu sẽ được phân tách thành các bảng sau:

### 2.1 Bảng `User` (Thông tin nhân sự)
- `id`: UUID (Primary Key)
- `employeeId`: Mã nhân viên (Unique, Tuỳ chọn - Có thể để trống đối với ứng viên)
- `fullName`: Họ và tên
- `email`: Email (Tuỳ chọn)
- `department`: Phòng ban (Tuỳ chọn)
- `position`: Vị trí công tác/ứng tuyển (Tuỳ chọn)
- `createdAt`: Thời gian tạo

### 2.2 Bảng `AssessmentRecord` (Kết quả bài đánh giá)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key -> Bảng `User`)
- `version`: Phiên bản bài kiểm tra
- `assessmentDate`: Ngày làm bài
- `resultData`: JSON (Lưu chi tiết điểm số - AssessmentResult)
- `answers`: JSON (Lưu trữ chi tiết các lựa chọn cho mỗi câu hỏi)
- `hrNote`: Ghi chú từ admin/HR (Text) *[Lưu ý: Trường này được cập nhật độc lập tại Trang Quản lý của HR, không liên quan đến luồng làm bài và xem kết quả trắc nghiệm của ứng viên]*
- `exportedAt`: Thời gian xuất file (nếu có)
- `createdAt`: Thời gian hệ thống ghi nhận

## 3. Lựa chọn Công nghệ (Tech Stack)
- **Frontend Core:** React, Typescript, Vite, Tailwind CSS.
- **Backend & Database:** Đang chờ định hình thông tin kết nối từ file cấu hình môi trường (.env).
- **ORM / Query Builder:** Đề xuất sử dụng **Prisma** hoặc **Drizzle ORM** để định hình schemas và thực hiện migration dễ dàng cho Type Safety.

*Tài liệu này sẽ liên tục được tự động cập nhật trong quá trình triển khai cấu trúc hệ thống (Review & Auditor Phase).*
