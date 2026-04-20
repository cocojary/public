# BÁO CÁO KIỂM THỬ GIAO DIỆN — Trang Kết Quả Đánh Giá

> **Vai trò:** Tester  
> **Phạm vi:** `ScouterReport.tsx`, `UnifiedReport.tsx`, `ResultView.tsx`  
> **Ngày:** 2026-04-20  
> **Phương pháp:** Đọc code tĩnh (static analysis) + logic review

---

## TỔNG QUAN: KẾT QUẢ KIỂM THỬ

| Tiêu chí | Mức độ | Điểm |
|----------|--------|------|
| Layout / Vỡ layer | ⚠️ Có vấn đề trên mobile | 6/10 |
| Ngôn ngữ thuần Việt | ❌ Nhiều cụm tiếng Anh | 5/10 |
| Giá trị tham khảo cho HR | ⚠️ Đủ cơ bản, thiếu ngữ cảnh | 7/10 |
| Giá trị tham khảo cho Nhân sự | ⚠️ Thiếu diễn giải | 6/10 |

---

## PHẦN 1: VỠ LAYER / LAYOUT ISSUES

### 1.1 Lỗi nghiêm trọng — Duplicate numbering

**File:** [ScouterReport.tsx:371](../src/features/assessment/components/ScouterReport.tsx#L371) và [ScouterReport.tsx:424](../src/features/assessment/components/ScouterReport.tsx#L424)

```
Section "6" — Giá Trị Quan
Section "6" — Xu Hướng Rủi Ro  ← TRÙNG SỐ
```

**Tác động:** HR đọc báo cáo thấy 2 mục cùng số 6. Gây nhầm lẫn nghiêm trọng khi tham chiếu trong văn bản nội bộ.

---

### 1.2 Layout vỡ trên mobile — Persona grid 3 cột

**File:** [UnifiedReport.tsx:513](../src/features/assessment/components/UnifiedReport.tsx#L513)

```css
gridTemplateColumns: '1fr 1fr 1fr'   /* không có breakpoint responsive */
```

**Tác động:** Trên màn hình < 600px (điện thoại), 3 card persona sẽ bị nén, text tràn ra ngoài, không đọc được.

---

### 1.3 Layout vỡ trên mobile — Job Fit 2 cột

**File:** [UnifiedReport.tsx:771](../src/features/assessment/components/UnifiedReport.tsx#L771)

```css
gridTemplateColumns: '1fr 1fr'   /* không có @media breakpoint */
```

**Tác động:** Nội dung AI comment trong từng ô job fit sẽ bị co lại quá nhỏ trên mobile.

---

### 1.4 Nhãn Radar Chart bị cắt khỏi viewBox

**File:** [UnifiedReport.tsx:117](../src/features/assessment/components/UnifiedReport.tsx#L117)

```javascript
<text x={ptX(i, r + 20)} y={ptY(i, r + 20)} ...>   // +20 ngoài radius
```

Với `size=270`, `r = 270 * 0.38 = 102.6`, các điểm label ở góc ngoài cùng có thể vượt ra ngoài `viewBox="0 0 270 270"`. Nhãn ở góc trên cùng và góc phải bị cắt không hiển thị.

---

### 1.5 SVG ZigZagMatrix — tọa độ sai khi số dimension thay đổi

**File:** [ScouterReport.tsx:63](../src/features/assessment/components/ScouterReport.tsx#L63)

```javascript
const y = (i / (dimensions.length - 1)) * 100;  // chia cho length - 1
```

Nếu chỉ có **1 dimension** → `dimensions.length - 1 = 0` → **chia cho 0 → NaN**. SVG không hiển thị gì.

---

### 1.6 Coaching Advice — grid 2 cột nhưng nội dung dài

**File:** [UnifiedReport.tsx:804](../src/features/assessment/components/UnifiedReport.tsx#L804)

```css
gridTemplateColumns: '1fr 1fr'
```

Mỗi advice card có 2 dòng text (`action` + `rationale`), khi AI sinh ra nội dung dài (3-4 dòng) các card sẽ không align đều nhau, tạo ra khoảng trắng lệch nhau trong grid.

---

### 1.7 Overflow text — Họ tên dài

**File:** [ScouterReport.tsx:267](../src/features/assessment/components/ScouterReport.tsx#L267)

```javascript
className="... whitespace-nowrap overflow-hidden text-ellipsis"
```

`whitespace-nowrap` sẽ cắt tên nếu quá dài, nhưng chỉ hoạt động đúng khi container có `max-width`. Với parent `col-span-1` trên `grid-cols-3`, tên có thể bị cắt giữa chữ trên màn hình nhỏ.

---

## PHẦN 2: SỬ DỤNG NGÔN NGỮ THUẦN VIỆT

### 2.1 Danh sách cụm từ tiếng Anh xuất hiện trong giao diện

| Vị trí | File | Text tiếng Anh | Mức độ |
|--------|------|----------------|--------|
| Header báo cáo phụ | [ScouterReport.tsx:248](../src/features/assessment/components/ScouterReport.tsx#L248) | `"Powered by Techzen AI Assessment System"` | 🔴 Hiện rõ |
| Header CEO | [ScouterReport.tsx:254](../src/features/assessment/components/ScouterReport.tsx#L254) | `"C-Level Strategic Perspective Assessment"` | 🔴 Hiện rõ |
| Header HR | [ScouterReport.tsx:255](../src/features/assessment/components/ScouterReport.tsx#L255) | `"HR Management Perspective Assessment"` | 🔴 Hiện rõ |
| Badge phù hợp vị trí | [ScouterReport.tsx:495](../src/features/assessment/components/ScouterReport.tsx#L495) | `"Highly Recommended"` | 🔴 Hiện rõ |
| Label điểm phù hợp | [ScouterReport.tsx:508](../src/features/assessment/components/ScouterReport.tsx#L508) | `"Match Score"` | 🔴 Hiện rõ |
| Label chiến lực | [ScouterReport.tsx:565](../src/features/assessment/components/ScouterReport.tsx#L565) | `"Total Strategic Power"` | 🔴 Hiện rõ |
| Label CEO section | [ScouterReport.tsx:387](../src/features/assessment/components/ScouterReport.tsx#L387) | `"Exclusive C-Level Analytics"` | 🟡 Sub-label |
| Nhãn vùng rủi ro | [ScouterReport.tsx:431](../src/features/assessment/components/ScouterReport.tsx#L431) | `"Safe (0-30)"`, `"Watch (40-60)"`, `"Hazard (70+)"` | 🔴 3 nhãn liên tiếp |
| Footer ghi chú nhận xét AI | [ScouterReport.tsx:612](../src/features/assessment/components/ScouterReport.tsx#L612) | `"(人物像および人材活用に関するコメント)"` — **tiếng Nhật** | 🔴 Không phù hợp |
| Footer job fit key | [ScouterReport.tsx:641](../src/features/assessment/components/ScouterReport.tsx#L641) | `key` = `"technical"`, `"business"`, `"operations"`, `"management"` | 🔴 Bug: hiện raw key |
| AI Analysis header | [UnifiedReport.tsx:676](../src/features/assessment/components/UnifiedReport.tsx#L676) | `"Đọc Vị Nhân Sự — AI Analysis"` | 🟡 Nửa Việt |
| Coaching section | [UnifiedReport.tsx:802](../src/features/assessment/components/UnifiedReport.tsx#L802) | `"LỜI KHUYÊN PHÁT TRIỂN (COACHING ADVICE)"` | 🟡 Nửa Việt |
| Job fit labels | [UnifiedReport.tsx:773-776](../src/features/assessment/components/UnifiedReport.tsx#L773) | `"Dev/R&D"`, `"Sales/CS"`, `"Lead/Manager"` | 🟡 Phụ chú |
| Thông tin kỹ thuật | [UnifiedReport.tsx:497](../src/features/assessment/components/UnifiedReport.tsx#L497) | `"RMSE"` | 🟡 HR không hiểu |
| Source type | [UnifiedReport.tsx:296](../src/features/assessment/components/UnifiedReport.tsx#L296) | `"SPI Universal"`, `"SPI Dev V3"` | 🟡 Tên hệ thống |

### 2.2 Lỗi nghiêm trọng nhất về ngôn ngữ

**Bug #1 — Job Fit key hiển thị tiếng Anh thô:**

File [ScouterReport.tsx:638-649](../src/features/assessment/components/ScouterReport.tsx#L638):
```javascript
Object.entries(aiReport.jobFit).map(([key, data]) => (
  <span className="...uppercase">{key}</span>  // renders "technical", "business"...
))
```
→ Người dùng thấy: **"TECHNICAL 85%"** thay vì "Kỹ Thuật 85%"

**Bug #2 — Tiếng Nhật trong báo cáo Việt:**

File [ScouterReport.tsx:612](../src/features/assessment/components/ScouterReport.tsx#L612):
```
(人物像および人材活用に関するコメント)
```
→ Xuất hiện ở footer báo cáo, HR và nhân sự không đọc được, gây mất tin tưởng.

---

## PHẦN 3: GIÁ TRỊ THAM KHẢO CHO HR

### 3.1 Những gì HR có được ✅

| Thông tin | Vị trí | Đủ để dùng? |
|-----------|--------|-------------|
| Độ tin cậy dữ liệu (Lie Scale, Consistency, Speed) | ScouterReport Section 1 | ✅ |
| Điểm 20 chiều tính cách (thang 1-10) | UnifiedReport DimRow | ✅ |
| Mức phân loại: Xuất sắc / Tốt / Trung bình... | UnifiedReport getScoreLabel | ✅ |
| Persona archetype (top 3 + match %) | UnifiedReport Persona | ✅ |
| Phù hợp 4 loại vị trí (%) | ScouterReport Duty + UnifiedReport | ✅ |
| Thế mạnh + Điểm mù (AI) | Cả 2 report | ✅ |
| Lộ trình coaching | Cả 2 report | ✅ |
| Cảnh báo gian lận (reliabilityAlert) | UnifiedReport AI Card | ✅ |
| Chỉ số Chiến Lực (Combat Power) | ScouterReport Section 8/9 | ✅ |

### 3.2 Những gì HR còn thiếu ❌

| Thiếu | Tác động |
|-------|---------|
| **Không có ngưỡng so sánh** — điểm 6.5 là cao hay thấp so với ứng viên khác cùng vị trí? | HR không biết chọn ai khi có 3 ứng viên điểm gần nhau |
| **Không có gợi ý câu hỏi phỏng vấn** — dựa trên điểm yếu để đặt câu hỏi verify | HR phải tự suy diễn từ điểm số sang câu hỏi |
| **Reliability score trong ScouterReport V2 thiếu số tuyệt đối** — chỉ hiện "Cao / Trung bình", không có con số | Không biết mức 71 khác 89 như thế nào |
| **Xu hướng rủi ro** (Section 6 bị trùng số) — HR có thể bỏ qua vì nghĩ đã đọc | Bỏ sót thông tin nguy cơ nhân sự |
| **Không có lịch sử nếu nhân sự làm lại** — không thể so sánh kết quả cũ vs mới | Không đánh giá được sự phát triển theo thời gian |

---

## PHẦN 4: GIÁ TRỊ THAM KHẢO CHO NHÂN SỰ

### 4.1 Những gì Nhân sự nhận được ✅

| Thông tin | Đủ rõ ràng? |
|-----------|-------------|
| Top 3 điểm mạnh (tên + điểm số) | ✅ |
| Top 3 cần phát triển (tên + điểm số) | ✅ |
| Persona archetype + môi trường phù hợp | ✅ |
| Lộ trình coaching cụ thể (action + rationale) | ✅ |
| Cảnh báo "điểm mù" — rủi ro hành vi | ✅ |

### 4.2 Những gì Nhân sự còn thiếu ❌

**Thiếu 1 — Không giải thích ý nghĩa điểm số:**

`DimRow` trong UnifiedReport chỉ hiện điểm và truncate description:

File [UnifiedReport.tsx:155](../src/features/assessment/components/UnifiedReport.tsx#L155):
```javascript
{item.description.split('.')[0]}.   // chỉ lấy câu đầu tiên
```
Câu đầu tiên thường là định nghĩa kỹ thuật, không phải ý nghĩa hành vi. Nhân sự đọc `"Hướng Ngoại: 7.2 — Tốt"` nhưng không biết điều đó có nghĩa gì với công việc hàng ngày của mình.

---

**Thiếu 2 — `descLow`/`descHigh` trong ZigZagMatrix quá ngắn và kiểu italic nhỏ:**

File [ScouterReport.tsx:95](../src/features/assessment/components/ScouterReport.tsx#L95):
```
col-span-3 text-[11px] text-slate-500 italic  ← font quá nhỏ, màu nhạt
```
Thông tin quan trọng nhất (mô tả hành vi) lại hiển thị theo kiểu phụ chú. Nhân sự thường bỏ qua.

---

**Thiếu 3 — Không có "Ý nghĩa với tôi" cá nhân hóa:**

Report hiện tại mô tả tính cách tổng quát ("Người này có xu hướng X"). Nhân sự muốn đọc: "Điều này ảnh hưởng đến bạn như thế nào trong công việc cụ thể của bạn."

---

**Thiếu 4 — Xếp hạng chiến lực (S/A/B/C) không được giải thích:**

File [ScouterReport.tsx:523](../src/features/assessment/components/ScouterReport.tsx#L523):
```javascript
duty.score > 80 ? 'S' : duty.score > 70 ? 'A' : duty.score > 60 ? 'B' : 'C'
```
Không có chú thích gì về S/A/B/C nghĩa là gì. Nhân sự thấy chữ "C" không biết có lo lắng hay không.

---

**Thiếu 5 — Không có mục "Bước tiếp theo cho bạn":**

Coaching advice hiện tại chỉ có trong phần AI dark card, định dạng dense, viết cho HR. Cần một phần riêng biết với ngôn ngữ trực tiếp với nhân sự ("Bạn có thể bắt đầu bằng cách...").

---

## PHẦN 5: BUG TỔNG HỢP

| ID | Mức độ | File | Mô tả | Cách sửa |
|----|--------|------|-------|---------|
| UI-001 | 🔴 | ScouterReport.tsx:424 | Duplicate section "6" — hai section cùng số | Đổi "Xu Hướng Rủi Ro" thành số 7, cập nhật lại toàn bộ số sau |
| UI-002 | 🔴 | ScouterReport.tsx:641 | Job fit key hiển thị tiếng Anh thô (`technical`, `business`...) | Thêm map: `const JOB_FIT_LABELS = {technical: 'Kỹ Thuật', ...}` |
| UI-003 | 🔴 | ScouterReport.tsx:612 | Tiếng Nhật trong báo cáo Việt | Xóa hoặc thay bằng `(Phân tích AI cho HR)` |
| UI-004 | 🟡 | UnifiedReport.tsx:513 | Persona grid 3 cột không responsive | Thêm `@media (max-width: 600px) { gridTemplateColumns: '1fr' }` |
| UI-005 | 🟡 | UnifiedReport.tsx:117 | Radar label bị cắt khỏi SVG viewBox | Tăng `size` hoặc dùng `r + 14` và tăng viewBox padding |
| UI-006 | 🟡 | ScouterReport.tsx:70 | ZigZag SVG chia cho 0 nếu chỉ có 1 dimension | Guard: `if (dimensions.length <= 1) return null` |
| UI-007 | 🟡 | UnifiedReport.tsx:497 | Từ "RMSE" — HR không hiểu | Thay bằng "sai lệch so với mẫu chuẩn" |
| UI-008 | 🟡 | ScouterReport.tsx:495 | `"Highly Recommended"` badge — tiếng Anh | Thay bằng `"Khuyến Nghị Cao"` |
| UI-009 | 🟡 | ScouterReport.tsx:508 | `"Match Score"` label | Thay bằng `"Độ Phù Hợp"` |
| UI-010 | 🟡 | ScouterReport.tsx:565 | `"Total Strategic Power"` | Thay bằng `"Tổng Điểm Chiến Lực"` |
| UI-011 | 🟡 | ScouterReport.tsx:431 | `"Safe"`, `"Watch"`, `"Hazard"` | Thay bằng `"An Toàn"`, `"Cần Chú Ý"`, `"Nguy Hiểm"` |
| UI-012 | 🟢 | UnifiedReport.tsx:155 | Description bị truncate sau dấu chấm đầu tiên | Hiển thị đủ 1-2 câu, hoặc tooltip khi hover |
| UI-013 | 🟢 | UnifiedReport.tsx:676 | `"AI Analysis"` trong header | Thay bằng `"Phân Tích AI"` |
| UI-014 | 🟢 | UnifiedReport.tsx:802 | `"(COACHING ADVICE)"` phụ chú | Thay bằng `"(Định Hướng Phát Triển)"` |
| UI-015 | 🟢 | ScouterReport.tsx:523 | Nhãn S/A/B/C không có giải thích | Thêm legend nhỏ: `"S: Xuất sắc (>80%) · A: Tốt · B: Khá · C: Cần phát triển"` |

---

## PHẦN 6: ƯU ĐIỂM NỔI BẬT

1. **Thiết kế visual đẹp** — Gradient header, radar chart, gauge chart đều được thực hiện tinh tế bằng SVG thuần.
2. **Thông tin phong phú** — Báo cáo cung cấp đủ 5 tầng: Độ tin cậy → Tính cách → Phù hợp vị trí → AI Analysis → Lộ trình.
3. **Loading state tốt** — Spinner + trạng thái AI đang chạy rõ ràng, có nút "Thử lại" khi lỗi.
4. **Print optimization** — CSS print media query rõ ràng, hỗ trợ xuất PDF A4.
5. **Reliability caveat** — Tự động hiện cảnh báo khi dữ liệu kém tin cậy.
6. **Dual-type note** — Thông báo thông minh khi 2 persona gần nhau (sai lệch < 8%).

---

## KHUYẾN NGHỊ ƯU TIÊN

### Sửa ngay (trước khi đưa cho HR dùng):
1. **UI-001**: Đánh lại số section — 2 mục số 6 là lỗi hiển thị.
2. **UI-002**: Job fit key render tiếng Anh thô — lỗi nội dung.
3. **UI-003**: Xóa tiếng Nhật — không phù hợp ngữ cảnh.

### Sửa trong sprint tiếp theo:
4. **UI-004 + UI-005**: Responsive cho persona grid và radar label.
5. **UI-008 đến UI-014**: Việt hóa toàn bộ cụm từ tiếng Anh còn lại.

### Cải thiện nội dung (phiên bản tiếp):
6. Thêm **ngưỡng chuẩn so sánh** cho HR (điểm trung bình theo vị trí).
7. Thêm **gợi ý câu hỏi phỏng vấn** cho từng điểm yếu nổi bật.
8. Thêm section **"Bước tiếp theo cho bạn"** viết thẳng cho nhân sự.
9. Hiển thị đủ `descLow`/`descHigh` với font dễ đọc hơn thay vì italic nhỏ.
