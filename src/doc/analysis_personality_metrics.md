# Phân Tích Logic Chấm Điểm & Độ Tin Cậy - Hệ Thống Trắc Nghiệm Tính Cách 

Dưới góc độ phân tích hệ thống (System Analysis), hệ thống trắc nghiệm tính cách HR Assessment hiện hành (SPI_UNIFIED_V4) đang vận hành một kiến trúc chấm điểm khá phức tạp, kết hợp giữa quy tắc Tâm lý trắc nghiệm (Psychometrics) và thuật toán học máy phân tích ngôn ngữ (Rule-based AI). 

Tất cả các đánh giá đều được xử lý gọn ghẽ trong các module: `unifiedEngine.ts` và `aiAnalysis.ts`. Dưới đây là phân tích chi tiết cách hệ thống biến đổi từ bộ câu hỏi thô thành các báo cáo nhân sự phân tích sâu.

---

## 1. Hệ Thống Đang Đưa Ra Các Phân Tích Báo Cáo Gì?

Hệ thống đang cấu trúc báo cáo đầu ra thành 5 cụm chủ đề phân tích chính để đánh giá toàn diện một ứng viên/nhân sự:

1. **Phân tích Định lượng 20 Chiều Hướng (Dimensions):** Chấm điểm ứng viên trên 20 phương diện tính cách khác nhau chia thành 6 nhóm lớn: Tính cách (Personality), Giá trị cốt lõi (Values), Sức chịu đựng (Stress), Ý chí (Motivation), Tư duy (Thinking) và Khả năng điều hành (Leadership).
2. **Nhận diện Kiểu Người (Persona/Archetype):** Gắn nhãn ứng viên vào một hình mẫu nhân sự cụ thể (Ví dụ: Định hướng kết quả, Chuyên gia phân tích, Người kết nối, hoặc CEO Chiến lược).
3. **Tính toán Chỉ số Lực Chiến (Combat Power):** Đưa ra một điểm số tổng hợp đại diện cho sức mạnh làm việc tổng thể từ 1-100.
4. **Phân tích Độ Phù Hợp Nghề Nghiệp (Duty Suitability):** Khớp Profile của ứng viên với các ngành nghề đặc thù (Sales, Quản lý, Vận hành, R&D).
5. **Cảnh Báo Rủi Ro (Negative Tendencies):** Tự động truy quét các "red flags" (báo động đỏ) nếu ứng viên có các điểm số cực đoan phản ánh sự thiếu kỷ luật, né tránh rủi ro, hoặc làm việc cảm tính.

---

## 2. Công Thức Tính Các Basis (Căn Cứ) Dẫn Đến Phân Tích

Mọi phân tích AI đều dựa trên việc quy chuẩn điểm thô từ bộ câu hỏi về **Thang Điểm Scaled (1 đến 10)**.

### a. Quy trình xử lý điểm thô (Thứ nguyên Scaled Score)
1. **Đảo Chiều Câu Hỏi:** Mỗi câu hỏi có trọng số từ 1-5. Nếu câu hỏi mang tính chất chống đối (reversed = true), điểm sẽ bị lật ngược theo công thức `Score = 6 - Answer`.
2. **Tính Tỷ Lệ Đạt (Percentile):** Tổng điểm các câu hỏi trong 1 Dimension được so sánh với điểm Trần và Sàn (Range) để nảy ra tỷ lệ phần trăm (0 - 100%).
3. **Quy Đổi 1-10:** Hệ thống chia đều Percentile thành 10 Bucket. Cứ mỗi 10% sẽ bằng 1 điểm Scaled (`Math.min(10, Math.max(1, Math.floor(percentile / 10) + 1))`).

### b. Formula Quy Củ Các Chỉ Số Đánh Giá
- **Persona Detection (Nhận diện hình mẫu):** Dùng **Rule-based Thresholds**. Hệ thống sẽ rà quét các điểm Scaled. Ví dụ: Nếu `extraversion >= 7` VÀ `empathy >= 7` -> Hình mẫu "Người Giao Tiếp". Nếu `decision_making >= 8` VÀ `risk_management >= 8` -> Dáng dấp "Lãnh đạo thực chiến".
- **Combat Power (Lực Chiến):** Được xây dựng dựa trên _Mô hình Nhân chủng học_ với 4 trụ cột có trọng số riêng:
  - Sinh lực (Vitality) = Thể chất + Sức bền
  - Trí lực (Intelligence) = Logic + Ham học hỏi
  - Tâm lực (Resilience) = Ổn định cảm xúc + Chịu áp lực tinh thần
  - Kỷ luật (Discipline) = Tận tâm + Tự quản lý
  **Công Thức:** `Tổng điểm 4 trụ cột * Multiplier Đặc biệt` (Do độ tin cậy quyết định).

---

## 3. Hệ Thống Nhận Diện Dữ Liệu "Thiếu Tin Cậy" (Gian Lận) Như Thế Nào?

Đây là phần "thông minh" nhất của Engine (quy định tại `unifiedEngine.ts`), bao gồm **8 bộ lọc phân tích dị thường (Anomaly Filters)**. Hệ thống không tin tưởng hoàn toàn mọi bài test, mà đánh giá sự trung thực dựa trên các bộ đếm sau:

### Tám (8) Căn Cứ Đánh Giá Chất Lượng Dữ Liệu

1. **Lie Scale (Thang Điểm Gỉa Tạo - Tô Hồng):**
   Trong bộ câu hỏi có các mệnh đề "bẫy" cực đoan (Ví dụ: "Tôi chưa từng bao giờ nói dối"). Nếu ứng viên trả lời 4 hoặc 5, hệ thống sẽ cộng điểm LieScore lại.
   - *Risk:* ≥ 7 câu. *Warning:* ≥ 4 câu.
2. **Consistency (Độ Nhất Quán Thuận/Nghịch):**
   Kiểm tra logic chéo bằng cách so sánh trung bình điểm các câu hỏi thuận và câu nghịch đảo của cùng 1 nhóm tính cách. Nếu khoảng cách > 1.5, kết luận ứng viên trả lời "Tiền hậu bất nhất".
   - *Risk:* Mâu thuẫn ≥ 5 nhóm.
3. **Neutral Bias (Thiên Kiến Trung Lập - Lười Suy Nghĩ):**
   Đếm tỷ lệ ứng viên chọn đáp án 3 (Ba phải/Không chắc chắn). 
   - *Risk:* > 50% tổng số câu. (Bài test mất đi tính phân loại).
4. **Acquiescence Bias (Thiên Kiến Đồng Thuận / Phủ Nhận Chết):**
   Quan sát trước khi đảo chiều. Nếu điểm trung bình mọi câu > 4.2 (Lúc nào cũng "Có"), hoặc < 1.8 (Lúc nào cũng "Không"). Cho thấy ứng viên đang click đại một cột.
5. **Extreme Responder (Thích Chọn Số Cực Đoan):**
   Tính tỷ lệ người dùng chỉ chọn điểm "1" hoặc "5", gạt đi các phương án tiệm cận trung lập.
   - *Risk:* > 90% số câu.
6. **Pattern Detection (Nhận Diện Khuôn Mẫu Đánh Máy):**
   Quét chuỗi câu trả lời để tìm quy luật máy móc:
   - *Straight-lining:* Bấm 1 dãy đáp án giống nhau (VD: 4-4-4-4-4).
   - *Zig-zac:* Bấm lượn sóng (VD: 1-5-1-5).
   - *Risk:* Đánh liên tiếp cùng khuôn mẫu kéo dài ≥ 10 câu.
7. **Time Tracking (Rủi Ro Nhìn Lướt/Tốc Độ Bài Làm):**
   Lấy tổng thời gian chia cho số câu chính thức. 
   - *Risk:* Trung bình đưới 3 giây/câu (Chỉ đủ để quét ánh mắt, không kip phân tích não bộ).
8. **Quick Answers (Cắm Chuột, Click Bừa):**
   Nếu có đo lường ms theo từng mệnh đề: Bắt lại toàn bộ số câu được click < 2 giây/câu.
   - *Risk:* Hơn 40% số câu trả lời có tốc độ < 2 giây.

### Thuật Toán Phán Quyết Cuối Cùng (Penalty System)

Sau khi tính 8 chỉ số trên, hệ thống đếm số cờ `Risk` và `Warning` tổng cộng, đưa ra "bản án":
- **⚠ Invalid (Tước bỏ giá trị):** Đạt khi `Số Risk >= 1` HUẶC `Số Warning >= 4`. Dữ liệu thiếu trung thực/đánh bừa. 
  *Hệ quả:* **Trừng phạt Lực chiến (Penalty Multiplier) giảm thẳng 25% (nhân với 0.75)**.
- **🟡 Suspect (Đáng ngờ):** Đạt khi `Số Warning >= 2`. Kế quả còn chông chênh. 
  *Hệ quả:* **Trừng phạt trừ 15% tổng điểm (multiplier 0.85)**.
- **✅ Reliable (Đáng tin cậy):** Đạt khi Có tối đa 1 Warning. 
  *Hệ quả:* Mọi thông số Lực Chiến được tự do bộc lộ 100%.

### Tóm Lược
Hệ thống hiện tại được thiết kế như một chốt chặn tâm lý vô hình. AI phân loại không quá chú trọng việc ứng viên "chấm điểm" bao nhiêu, mà thiên về việc khảo sát "vết hằn hành vi" ứng viên gõ bàn phím (time track, pattern thẳng/nghẽo, lật kèo thuận/nghịch) để quyết định tính trung thực.
