---
name: client-qa-refiner
description: |
  Triggered when: User yêu cầu "chuẩn hóa Q/A", "sửa câu hỏi cho khách", "đọc tài liệu và rút ra câu hỏi", hoặc "review Q/A".
  Action: Phân tích, đánh giá, và định dạng bản nháp Q/A thành bảng Q/A 4 phần (Hiện trạng, Vấn đề, Xác nhận, Đề xuất) bằng Tiếng Nhật thương mại.
---

# Goal

Tự động hóa quá trình tạo câu hỏi làm rõ (Q/A) với khách hàng Nhật Bản. Chuyển đổi ý tưởng thô hoặc tài liệu mâu thuẫn thành format Q/A 4 phần (Song ngữ Việt - Nhật) để user copy trực tiếp và gửi. Giảm thiểu hiểu lầm requirement.

# Instructions

1. **Phân tích Input:**
   - IF Input là ý tưởng chung -> Trích xuất ý định cốt lõi để viết thành "Vấn đề".
   - IF Input là trích đoạn tài liệu mâu thuẫn -> Tìm và trích xuất điểm khác biệt giữa các tài liệu.
   - IF Input là bản nháp Q/A của team member (nhờ review) -> Đánh giá lỗi văn phong (ví dụ: đổ lỗi khách hàng, thiếu ngữ cảnh, không rành mạch), chuẩn bị nội dung feedback nội bộ.
   - **Hướng dẫn ngoại lệ**: Nếu không đọc được context hoặc input quá ngắn, lập tức DỪNG quy trình. Yêu cầu user cung cấp thêm thông tin. Trong trường hợp đặc biệt không thể đưa ra giải pháp kỹ thuật cụ thể -> áp dụng hướng fallback: Điền đề xuất "Chờ dự án quyết định".

2. **Soạn nội dung Q/A bằng Tiếng Việt:**
   Dựa trên nguyên tắc: Lịch sự, khách quan. Cấu trúc yêu cầu tuyệt đối 4 phần:
   - **Hiện trạng / 現状 (Genjō)**: Liệt kê thông tin nền (Context).
   - **Vấn đề / 課題・疑問点 (Kadai/Gimonten)**: Định vị điểm mâu thuẫn hoặc điểm cần làm rõ.
   - **Xác nhận / 確認事項 (Kakunin jikō)**: Đặt câu hỏi tu từ trọng tâm.
   - **Đề xuất / 提案・解決策 (Teian/Kaiketsusaku)**: Liệt kê các giải pháp kỹ thuật cụ thể hoặc lựa chọn để khách hàng quyết định.

3. **Dịch sang Tiếng Nhật:**
   - Định dạng câu chữ dựa trên Tiếng Nhật thương mại. Sử dụng kính ngữ và thể です/ます.
   - Giữ nguyên hiển thị đối với thuật ngữ kỹ thuật IT hoặc chuyển đổi thành Katakana phổ thông.

4. **Định dạng Output:**
   - IF luồng Review Q/A: Tạo một mục `**[✨ Feedback nội bộ]**` ở dòng đầu tiên, nhận xét ngắn gọn điểm thiếu chuyên nghiệp của bản nháp và lý do sửa đổi.
   - Trình bày song ngữ: Tiếng Việt trước, Tiếng Nhật bên dưới. 
   - Chỉ in đậm nhãn tiêu đề (Ví dụ: **Hiện trạng / 現状 (Genjō)**:).

# Examples

## Example 1: Dữ liệu mâu thuẫn đơn giản

**Input:**
Tài liệu SRS ghi chức năng login bằng Email, nhưng Figma lại vẽ thêm login bằng Google. Hỏi lại khách xem dùng cái nào.

**Thought Process:**
- Nhận thấy sự mâu thuẫn giữa SRS và Figma.
- Cần đặt câu hỏi xác nhận và đưa ra 1 cách giải quyết (fallback) nếu khách không chọn.
- → Lập cấu trúc 4 phần.

**Output:**
**[Tiếng Việt]**
- **Hiện trạng / 現状 (Genjō)**: Theo phân tích, có sự khác biệt giữa tài liệu SRS và bản vẽ Figma.
- **Vấn đề / 課題・疑問点 (Kadai/Gimonten)**: Tài liệu SRS quy định chức năng đăng nhập sử dụng Email, trong khi màn hình Figma có hiển thị cả nút đăng nhập bằng Google.
- **Xác nhận / 確認事項 (Kakunin jikō)**: Xin xác nhận lại giúp chúng tôi xem hệ thống có yêu cầu thêm chức năng đăng nhập bằng Google hay không?
- **Đề xuất / 提案・解決策 (Teian/Kaiketsusaku)**: Chúng tôi đề xuất triển khai đăng nhập bằng cả Email và Google để nâng cao trải nghiệm người dùng. Xin cho chúng tôi biết chỉ thị từ dự án.

## Example 2: Thiếu Context hoàn toàn

**Input:**
Hỏi khách vụ login xem sao nha.

**Thought Process:**
- Câu hỏi quá ngắn, thiếu bối cảnh.
- → Cần kích hoạt quy trình xử lý lỗi (nếu lỗi, yêu cầu thêm context).

**Output:**
Bạn vui lòng cung cấp chi tiết thêm về hiện trạng hoặc tài liệu liên quan đến yêu cầu trên để tôi định dạng Q/A chính xác nhất.

# Error Handling

Trong các trường hợp đặc biệt, áp dụng các bước xử lý ngoại lệ sau:
- IF input quá ngắn hoặc nếu lỗi không xác định được bối cảnh rõ ràng -> rẽ nhánh → lập tức phản hồi và yêu cầu thông tin.
- Nếu không có giải pháp kỹ thuật nào khả thi (edge case mâu thuẫn phức tạp) -> fallback → Điền phần Đề xuất: "Vì có nhiều cách tiếp cận, chúng tôi xin phép chờ quyết định cuối cùng từ dự án."
- Luôn kiểm tra lại (double-check) xem đã đủ 4 phần chưa trước khi xuất kết quả.

# Constraints

- TUYỆT ĐỐI KHÔNG sử dụng từ ngữ mang tính chất đổ lỗi cho người viết tài liệu (ví dụ: "Figma sai", "mâu thuẫn nặng"). Luôn dùng văn phong khách quan.
- Nếu output không đúng định dạng, báo lỗi để user format lại thông tin.
