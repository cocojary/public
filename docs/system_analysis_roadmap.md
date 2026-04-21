# Phân Tích & Lộ Trình Triển Khai Hệ Thống Đánh Giá Năng Lực (Techzen HR Assessment)

> **Tài liệu phân tích nghiệp vụ (Business Analysis)**
> Tài liệu này phân tích chi tiết các chức năng cần thiết dựa trên định hướng mở rộng của sản phẩm, bao gồm việc sử dụng nội bộ và thương mại hóa (SaaS).

---

## 1. Mục Tiêu & Chân Dung Người Dùng (Target Audience)

Hệ thống được thiết kế phục vụ cho 4 nhóm đối tượng người dùng chính, với các giới hạn và đặc quyền khác nhau:
1. **HR / Quản trị viên (Internal):** Quản lý kết quả đánh giá, xem các cảnh báo (Độ tin cậy/Tô hồng), thêm ghi chú và phân tích bức tranh nhân sự toàn công ty.
2. **Nhân sự công ty (Internal):** Tự đánh giá năng lực, nhận báo cáo chi tiết về điểm yếu / rủi ro tiềm ẩn để tự lên kế hoạch khắc phục.
3. **Người dùng miễn phí - Public (Freemium):** Trải nghiệm bài test rút gọn (ví dụ: giới hạn 30 câu hỏi), nhận báo cáo cơ bản, không có các phân tích chuyên sâu bằng AI (giảm chi phí API).
4. **Người dùng trả phí - Public (Premium):** Đăng ký và thanh toán qua mã QR (Bank transfer autobot), nhận full quyền test và phân tích sâu giống như Nhân sự công ty.

---

## 2. Đề Xuất Phân Rã Chức Năng Cốt Lõi (Feature Breakdown)

### 2.1. Module Đánh Giá (Assessment Engine)
* **Quản lý Bộ câu hỏi đa phiên bản:** 
  * Cần có khả năng cấu hình *Full Version* (đầy đủ câu hỏi) và *Lite Version* (rút gọn câu hỏi dùng cho bản miễn phí).
* **Anti-Cheat & Reliability Flagging (Đã có):**
  * Phân tích thời gian trả lời (chống đánh lụi).
  * Bộ câu hỏi bẫy nói dối (Lie Scale) và Tô hồng.

### 2.2. Module Báo Cáo & Phân Tích (Reporting)
* **Báo cáo Nhân sự / Mức Premium:**
  * Hiển thị điểm trung bình và điểm **Năng Lực Thực Chiến**.
  * Chỉ ra các lỗ hổng năng lực (Achilles Heel) để người dùng khắc phục.
  * *Tích hợp AI Narrative:* Sử dụng OpenAI phân tích và viết báo cáo chuyên sâu.
* **Báo cáo Miễn phí (Free):**
  * Chỉ xuất biểu đồ Radar cơ bản (không chấm Năng lực thực chiến).
  * Vô hiệu hóa module OpenAI để tiết kiệm chi phí token.
* **Báo cáo dành cho HR (Đã có):**
  * Khối cảnh báo độ tin cậy bị ẩn đối với end-user nhưng hiện trên màn hình HR.
  * Tích hợp tính năng thêm/chỉnh sửa /xóa Ghi chú nội bộ.

### 2.3. Module Thương Mại Hóa & Thanh Toán Tự Động (Monetization & Payment)
* **Quản trị Gói cước (Packages):** Phân loại Free vs Premium.
* **Cổng thanh toán tự động (QR Code Auto-confirm):**
  * Tích hợp API ngân hàng ảo (như SePay, Casso, hoặc Momo Webhook).
  * **Luồng hoạt động:** 
    1. Người dùng chọn mua bài đánh giá.
    2. Hệ thống sinh mã đơn hàng (ví dụ: `TZ_ASSESS_9821`) và tạo mã VietQR theo định dạng: `Nội dung CK = TZ_ASSESS_9821`.
    3. Màn hình chờ kiểm tra giao dịch (Polling hoặc Websocket).
    4. Khi BOT ngân hàng nhận tiền -> Hệ thống nhận diện giao dịch gắn webhook -> Tự động chuyển hướng (Redirect) người dùng vào bài thi kèm theo Token bí mật.
* **Theo dõi doanh thu:** Báo cáo trên Admin dành riêng cho dòng tiền từ Public.

### 2.4. Module Thu Thập Phản Hồi (Feedback Loop)
* **Đánh giá Báo cáo:** Sau khi người dùng đọc báo cáo, hệ thống pop-up một form nhỏ: *"Bài đánh giá này phản ánh đúng bao nhiêu % năng lực của bạn?"* (Thang 1-5 sao + text comment).
* **HR Feedback Dashboard:** Gom các đánh giá của nhân sự/công chúng. Nếu tỷ lệ phản hồi chính xác dưới 70%, HR/Admin sẽ dựa vào đó để điều chỉnh trọng số (weights) của các câu hỏi.
* **Phân tích độ lệch chuẩn:** AI so sánh sự khác nhau giữa phản hồi của ứng viên với báo cáo để tự học hỏi nâng cấp model (Prompt update).

---

## 3. Lộ Trình Triển Khai Dần Dần (Implementation Phasing)

Để tối ưu hóa nguồn lực kỹ thuật, quá trình xây dựng có thể chia thành **4 Giai Đoạn (Phases)**:

### 🚀 Giai đoạn 1: Hoàn thiện Internal System (Đang ở chặng cuối)
* **Mục tiêu:** Ổn định công cụ đánh giá dành cho nội bộ nhân sự Techzen.
* **Task chính:**
  * Báo cáo đánh giá với UI Bento Grid hiện đại (Hoàn tất).
  * Tách biệt các khối tính năng của HR vs User: Ẩn cảnh báo độ tin cậy, bật tính năng comment (Hoàn tất).
  * Ổn định core xử lý tính toán và API OpenAI.
  * Quản trị viên có khả năng xem toàn bộ dashboard.

### 🌍 Giai đoạn 2: Freemium & Public Portal (Dự kiến: 1-2 tuần)
* **Mục tiêu:** Đưa hệ thống lên môi trường công cộng cho phép mọi người tự đánh giá miễn phí lấy phễu (Lead Generation).
* **Task chính:**
  * Xây dựng Landing Page giới thiệu bài thi.
  * Tách bộ câu hỏi thành version `LITE_PUBLIC_V1`.
  * Middleware xử lý giới hạn quyền lợi: Public route không trigger hàm gọi OpenAI.
  * Chỉnh sửa Header báo cáo để thân thiện hơn với người ngoài công ty (Brand Awareness).
  * Yêu cầu nhập Email/SDT (để lấy Lead) trước khi xem kết quả.

### 💰 Giai đoạn 3: Phân hệ Thanh Toán Tự Động (Dự kiến: 2 tuần)
* **Mục tiêu:** Triển khai tính năng thu phí (Monetization) trực tiếp.
* **Task chính:**
  * Define schema `Orders` và `Transactions` (Lưu thông tin giao dịch, trạng thái, mã phiên làm bài).
  * Đăng ký và tích hợp webhook với dịch vụ bên thứ 3 (Casso / SePay / VietQR).
  * Xây dựng giao diện Checkout Payment (Hiện mã QR tự động điền thông tin).
  * API lắng nghe Webhook ngân hàng và Server-sent event cho Frontend để tự động Redirect ngay khi chuyển khoản xong.
  * Hệ thống phát quyền cấp Token (One-time link) để user vào làm bản Premium.

### 🧠 Giai đoạn 4: Feedback Loop & Optimize Data (Dự kiến: 1 tuần)
* **Mục tiêu:** Hoàn thiện và nâng cấp độ đo sâu sắc của hệ thống bằng Feedback từ người dùng.
* **Task chính:**
  * Tích hợp Component Feedback vào góc dưới cùng màn hình Kết quả.
  * Bảng thống kê mức độ hiệu quả trong Admin Dashboard.
  * Chức năng Export dữ liệu các kết quả test Public nhằm huấn luyện nâng cấp bằng AI.
