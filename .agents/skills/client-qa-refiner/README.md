# Client Q/A Refiner (client-qa-refiner)

**AI Skill giúp tự động hóa và chuẩn hóa câu hỏi Q/A (Hỏi/Đáp) với khách hàng (Song ngữ Việt - Nhật).**

## 🔥 Vấn đề giải quyết
- Bạn là BrSE / Comtor / PM thường xuyên phải làm rõ yêu cầu với khách hàng Nhật Bản.
- Cách viết Q/A thô sơ đôi khi gây hiểu lầm, hoặc bị khách hàng phàn nàn vì thiếu chuyên nghiệp, không rõ ràng.
- Gặp khó khăn trong việc chọn từ ngữ ngoại giao (Không đổ lỗi dự án, đảm bảo giữ vững tinh thần hợp tác).

## 🚀 Tính năng nổi bật
* Hiểu ngôn ngữ thô (câu hỏi lộn xộn trong đầu bạn) hoặc phân tích một tài liệu dài và rút ra Q/A.
* Tự động format theo form quy chuẩn 4 phần rõ ràng: Hiện trạng -> Vấn đề -> Câu hỏi -> Giải pháp.
* Xuất nội dung song ngữ Việt - Nhật với ngữ điệu Business (Keigo).

## 💻 Cách cài đặt

Chỉ cần copy thư mục `client-qa-refiner` này vào thư mục chứa Skills của cấu hình AI Agent mà bạn đang dùng:
- Đối với **Google Antigravity**: 
  - Global: Copy vào `~/.gemini/antigravity/skills/client-qa-refiner`
  - Workspace: Copy vào `.agent/skills/client-qa-refiner`
- Đối với **Cursor/Windsurf**: Đưa file `SKILL.md` làm nội dung Rule.

## 🗣️ Cách sử dụng

Kích hoạt AI và đưa ra yêu cầu như:
- *"Sửa giúp tôi câu hỏi QA này để gửi khách Nhật: [Vấn đề của bạn]"*
- *"Đọc đoạn văn bản sau, list ra những điểm mâu thuẫn để hỏi khách hàng dưới dạng template chuẩn"*

**Ví dụ:**
> "Tôi đọc spec phần đăng nhập thì thấy cho nhập tối đa 10 kí tự. Nhưng ở DB thì lại design có 8 kí tự. Khách muốn sao?"

AI sẽ ngay lập tức trả về cho bạn 4 mục hoàn chỉnh (Hiện trạng, Vấn đề, Xác nhận, Đề xuất) bằng Tiếng Nhật thượng hạng!
