# Thiết Kế Mục Báo Cáo "Độ Phù Hợp Văn Hóa Techzen" (Techzen Cultural Fit)

Mục tiêu của thiết kế này là dịch các giá trị văn hóa và triết lý lõi của Techzen thành các chỉ số có thể đo lường và đánh giá trực quan dựa trên bộ dữ liệu SPI hiện có của ứng viên.

## 1. Khung Đánh Giá (Mapping 5 Trụ Cột với Dimensions)

### Trụ Cột 1: "Người tử tế" và Đạo đức nghề nghiệp (Làm việc từ "Tâm")
*   **Dimensions liên quan:**
    *   **Tận Tâm (`conscientiousness`):** Đại diện cho sự đáng tin cậy, làm việc đến nơi đến chốn.
    *   **Hòa Đồng (`agreeableness`):** Quan tâm người khác, làm việc từ tâm.
    *   **Đóng Góp Xã Hội (`social_contribution`):** Hướng tới tạo ra giá trị ý nghĩa hơn là lợi ích cá nhân ích kỷ.
*   **Tiêu chí:** Điểm trung bình nhóm này cần ở mức khá trở lên để được coi là "Người tử tế" đúng chuẩn Techzen.

### Trụ Cột 2: Tư duy "Học tập suốt đời" và Sẵn sàng chia sẻ (Mentoring)
*   **Dimensions liên quan:**
    *   **Ham Học Hỏi (`learning_curiosity`):** Tinh thần cầu tiến, liên tục cập nhật công nghệ.
    *   **Định Hướng Phát Triển (`growth_orientation`):** Khát khao phát triển bản thân và tổ chức.
    *   **Cởi Mở (`openness`):** Không ngại "sai rồi sửa", sẵn sàng tiếp nhận góc nhìn mới.

### Trụ Cột 3: Khả năng thích ứng linh hoạt và Tư duy Agile
*   **Dimensions liên quan:**
    *   **Tốc Độ Thực Thi (`execution_speed`):** Ra quyết định nhanh, phù hợp với nhịp độ Agile.
    *   **Tự Chủ (`autonomy`):** Khả năng tự quản lý, cross-functional tự định hướng.
    *   **Giao Tiếp Rõ Ràng (`communication_clarity`):** Tối quan trọng trong Scrum/Agile để phối hợp liên Làng.

### Trụ Cột 4: Định hướng tạo ra "Giá trị thật"
*   **Dimensions liên quan:**
    *   **Tư Duy Logic (`logical_thinking`):** Phân tích bài toán thực tế khách quan.
    *   **Năng Lực Hiểu Dữ Liệu (`data_literacy`) / Tư Duy Phản Biện (`critical_thinking`):** Không làm màu cho đẹp CV, mọi thứ phải dựa trên data và giải quyết vấn đề thực.
    *   **Khát Vọng Thành Tích (`achievement_drive`):** Hướng đến kết quả rõ ràng, mang lại giá trị trực tiếp.

### Trụ Cột 5: Sự thấu hiểu và tôn trọng văn hóa đối tác (Nhật Bản)
*   **Dimensions liên quan:**
    *   **Đồng Cảm / EQ (`empathy`):** Khả năng thấu hiểu khách hàng ngoại quốc.
    *   **Thận Trọng / Cẩn Thận (`caution`):** Đặc tính cốt lõi khi làm việc với đối tác Nhật (cần sự chỉnh chu, ít sai sót).
    *   **Chịu Đựng Stress Tâm Lý (`stress_mental`):** Khả năng chịu áp lực làm việc khắt khe từ thị trường Nhật Bản.

---

## 2. Đề Xuất Thiết Kế UI/UX

Tạo một section mới: **"Độ Phù Hợp Văn Hóa Techzen (Techzen Culture Fit)"** đặt ngay bên dưới "Đọc Vị Nhân Sự - AI Analysis".

### 2.1. Culture Fit Score (Tổng quan)
*   **Chỉ số:** Một thanh phần trăm (Ví dụ: 85% Techzen Fit) hoặc một huy hiệu.
*   **Màu sắc:** Theo brand guideline của Techzen (có thể là màu xanh đậm tin cậy kết hợp viền gold/cam).

### 2.2. Radar Chart - Lục Giác Văn Hóa hoặc Bảng Biểu Đồ Thanh (Progress Bars)
Trình bày 5 trụ cột thành 5 thanh ngang (Progress bar).
*   Ví dụ:
    *   **Làm việc từ "Tâm"**: `█████████░` 9/10
    *   **Học tập suốt đời**: `███████░░░` 7/10
    *   **Tư duy Agile**: `████████░░` 8/10
    *   **Tạo Giá Trị Thật**: `██████░░░░` 6/10
    *   **Giao tiếp Nhật Bản**: `████████░░` 8/10

### 2.3. Lời Khuyên Khóa Từ AI (AI Evaluation)
Thay vì chỉ hiện số, sẽ tích hợp AI gộp nhận xét về mức độ phù hợp văn hóa:
Nguyên tắc đánh giá:
- Nếu một tiêu chí cao: xem đó là xu hướng nổi bật của nhân sự.
- Nếu một tiêu chí trung bình: xem là mức ổn định, có thể tiếp tục phát triển thêm.
- Nếu một tiêu chí thấp: diễn đạt theo hướng “cần cải thiện” hoặc “cần được hỗ trợ phát triển”, tránh dùng từ tiêu cực nặng nề.
- Không kết luận tuyệt đối chỉ từ một chỉ số đơn lẻ; cần nhìn theo tổng thể.
- Ưu tiên cách diễn đạt phù hợp môi trường doanh nghiệp.

*   **Ví dụ:** "Ứng viên có sự tận tâm cao và tính cẩn thận rất tốt, cực kỳ phù hợp tham gia các dự án với đối tác Nhật Bản. Tuy nhiên, tư duy Agile và khả năng tự định hướng cần được mentoring thêm..."

---

## 3. Kiến Trúc Kỹ Thuật (Data Flow)

1.  **Cập nhật `UnifiedScoringResult`:**
    Thêm interface `TechzenCultureFit` gồm 5 điểm (`core1` đến `core5`) và `overallScore`.
2.  **Cập nhật `unifiedScoring.ts`:**
    Viết hàm `evaluateCultureFit(dimensions: DimensionScore[])` để tính toán động 5 trụ cột dựa trên phép tính trung bình các dimension tương ứng.
3.  **Tạo Component UI mới `TechzenCultureFit.tsx`:**
    Triển khai layout với Card, Progress Bar và Icon tương ứng với mỗi tiêu chí.
4.  **Prompt AI Assessment:** (Tuỳ chọn nếu muốn AI phân tích sâu hơn)
    Có thể chèn thêm prompt hướng dẫn AI phân tích 5 trụ cột này để đưa ra 1 đoạn nhận xét 3-4 câu trong báo cáo AI hiện tại.

## 4. User Review Required (Cần BA Xác Nhận)

> [!IMPORTANT]
> - **Trọng số Điểm (Weighting):** Hiện tại tôi đang giả định sẽ lấy điểm trung bình (average) của các Dimensions thuộc mỗi trụ cột. Việc này có ổn không, hay có Dimension nào quan trọng hơn cần nhân hệ số 2?
> - **Phạm Vi Thực Hiện Phase này:** Chúng ta sẽ chỉ hiện thực tính toán số liệu và vẽ UI tĩnh báo cáo, hay có cần nhúng cái này vào Prompt của AI để AI sinh ra lời nhận xét riêng cho phần Văn Hoá Techzen không?

## 5. Verification Plan
- Chạy giả lập Data với một ứng viên cực kỳ hợp văn hóa (điểm Tận tâm, Cẩn thận cao) và một người hướng ngoại quá ngẫu hứng để so sánh biểu đồ Culture Fit.
- Review lại toàn bộ giao diện trên Mobile/Desktop.
