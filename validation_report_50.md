# 📊 Báo Cáo Validation Hệ Thống SPI V4.2 — 50 AI Personas (OPENAI)

> **Thời gian chạy:** 22:12:27 20/4/2026
> **Provider/Model:** OPENAI
> **Engine:** src/features/assessment/utils/unifiedEngine.ts
> **Tổng số personas được test:** 50

---

## 🎯 Tóm tắt tổng quan

| Chỉ số | Giá trị |
|---|---|
| ✅ PASS | **38/50** |
| ❌ FAIL | **12/50** |
| Tỷ lệ chính xác | **76%** |

### Kết quả theo nhóm

| Nhóm | Tổng | PASS | FAIL | Tỷ lệ |
|---|---|---|---|---|
| Honest | 16 | 11 | 5 | 69% |
| Adversarial | 10 | 7 | 3 | 70% |
| Edge | 24 | 20 | 4 | 83% |

### Giải thích nhóm
- **Honest** (26 personas): Profile trung thực đa dạng — hệ thống KHÔNG được flag oan
- **Adversarial** (8 personas): Gian lận, tô hồng, trả lời ngẫu nhiên — hệ thống PHẢI phát hiện
- **Edge** (16 personas): Trường hợp đặc biệt, tâm lý phức tạp, bối cảnh đặc hữu

---

## 📋 Chi tiết từng persona


### 1. ✅ PASS — Kỹ sư phần mềm - Cẩn thận, hướng nội `[Honest]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **92/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟡 Cảnh báo (2 intra + 1 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (8%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 6 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.42) |
| Chọn cực đoan | 🟢 Tốt (40%) |

**5 Chiều cao nhất:** logical_thinking(10.0), autonomy(9.6), learning_curiosity(9.6), caution(9.3), critical_thinking(9.3)

**Kiểm tra điểm cao mong đợi:** ✅ logical_thinking: 10.0 | ✅ conscientiousness: 8.5 | ✅ autonomy: 9.6 | ✅ caution: 9.3

**Kiểm tra điểm thấp mong đợi:** ✅ extraversion: 1.4 | ✅ agreeableness: 3.3

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 2. ✅ PASS — Nhân viên Sales - Hướng ngoại, nhiệt tình `[Honest]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **100/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (1 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (2%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 5 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.27) |
| Chọn cực đoan | 🟢 Tốt (42%) |

**5 Chiều cao nhất:** achievement_drive(9.6), recognition_need(9.3), execution_speed(9.3), stress_mental(9.3), stress_physical(9.3)

**Kiểm tra điểm cao mong đợi:** ✅ extraversion: 8.9 | ✅ achievement_drive: 9.6 | ✅ challenge_spirit: 8.9

**Kiểm tra điểm thấp mong đợi:** ✅ caution: 2.5 | ✅ stability_orientation: 1.8

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 3. ✅ PASS — HR Manager - Đồng cảm, quan tâm người khác `[Honest]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **100/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (16%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 6 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.16) |
| Chọn cực đoan | 🟢 Tốt (22%) |

**5 Chiều cao nhất:** agreeableness(10.0), empathy(10.0), learning_curiosity(9.3), social_contribution(8.9), caution(8.5)

**Kiểm tra điểm cao mong đợi:** ✅ empathy: 10.0 | ✅ agreeableness: 10.0 | ✅ social_contribution: 8.9

**Kiểm tra điểm thấp mong đợi:** ✅ achievement_drive: 3.3 | ✅ challenge_spirit: 3.3

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 4. ❌ FAIL — Kế toán - Ổn định, nguyên tắc `[Honest]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **50/100** |
| Đánh giá độ tin cậy | 🟠 Cần thận trọng |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🔴 Nguy hiểm (3 intra + 1 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (9%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 4 câu liên tiếp) |
| Xu hướng đồng thuận | 🔴 Nguy hiểm (TB=5.00) |
| Chọn cực đoan | 🟢 Tốt (40%) |

**5 Chiều cao nhất:** conscientiousness(10.0), logical_thinking(10.0), caution(10.0), stability_orientation(10.0), critical_thinking(10.0)

**Kiểm tra điểm cao mong đợi:** ✅ conscientiousness: 10.0 | ✅ caution: 10.0 | ✅ stability_orientation: 10.0

**Kiểm tra điểm thấp mong đợi:** ✅ challenge_spirit: 4.4 | ✅ openness: 3.6

**Kiểm tra độ tin cậy:** ❌ Sai (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `use-with-caution`)

**Lỗi phát hiện:** `SAI_ĐỘ_TIN_CẬY: thực_tế=use-with-caution, kỳ_vọng=reliable|mostly-reliable`

---

### 5. ✅ PASS — Designer UX - Sáng tạo, cởi mở `[Honest]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **100/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (5%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 6 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.30) |
| Chọn cực đoan | 🟢 Tốt (41%) |

**5 Chiều cao nhất:** challenge_spirit(10.0), learning_curiosity(10.0), openness(9.6), autonomy(9.6), achievement_drive(9.3)

**Kiểm tra điểm cao mong đợi:** ✅ openness: 9.6 | ✅ learning_curiosity: 10.0 | ✅ challenge_spirit: 10.0

**Kiểm tra điểm thấp mong đợi:** ✅ caution: 3.3 | ✅ stability_orientation: 2.1

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 6. ✅ PASS — Project Manager - Cân bằng, lãnh đạo `[Honest]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **92/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟡 Cảnh báo (4 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (8%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 5 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.58) |
| Chọn cực đoan | 🟢 Tốt (30%) |

**5 Chiều cao nhất:** conscientiousness(10.0), autonomy(9.6), emotional_stability(9.3), achievement_drive(9.3), challenge_spirit(8.9)

**Kiểm tra điểm cao mong đợi:** ✅ autonomy: 9.6 | ✅ conscientiousness: 10.0 | ✅ achievement_drive: 9.3

**Kiểm tra điểm thấp mong đợi:** —

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 7. ✅ PASS — Nhân viên mới ra trường - Chưa xác định `[Honest]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **93/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟡 Cảnh báo (27%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 5 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.26) |
| Chọn cực đoan | 🟢 Tốt (5%) |

**5 Chiều cao nhất:** openness(8.9), learning_curiosity(8.9), autonomy(7.8), conscientiousness(7.4), achievement_drive(7.4)

**Kiểm tra điểm cao mong đợi:** ✅ learning_curiosity: 8.9

**Kiểm tra điểm thấp mong đợi:** —

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable | use-with-caution` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 8. ✅ PASS — Tô hồng hồ sơ - Toàn điểm 5 `[Adversarial]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **44/100** |
| Đánh giá độ tin cậy | 🟠 Cần thận trọng |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🔴 Nguy hiểm (20 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (0%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🔴 Nguy hiểm (Max 120 câu liên tiếp) |
| Xu hướng đồng thuận | 🔴 Nguy hiểm (TB=5.00) |
| Chọn cực đoan | 🔴 Nguy hiểm (100%) |

**5 Chiều cao nhất:** extraversion(7.0), conscientiousness(7.0), openness(7.0), emotional_stability(7.0), achievement_drive(7.0)

**Kiểm tra điểm cao mong đợi:** —

**Kiểm tra điểm thấp mong đợi:** —

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `low-interpretability | use-with-caution` → Thực tế: `use-with-caution`)

**Lỗi phát hiện:** Không có

---

### 9. ✅ PASS — Khiêm tốn thái quá - Toàn điểm 1 `[Adversarial]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **50/100** |
| Đánh giá độ tin cậy | 🟠 Cần thận trọng |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🔴 Nguy hiểm (20 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (0%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🔴 Nguy hiểm (Max 120 câu liên tiếp) |
| Xu hướng đồng thuận | 🔴 Nguy hiểm (TB=1.00) |
| Chọn cực đoan | 🔴 Nguy hiểm (100%) |

**5 Chiều cao nhất:** agreeableness(5.5), stress_mental(5.5), extraversion(4.0), conscientiousness(4.0), openness(4.0)

**Kiểm tra điểm cao mong đợi:** —

**Kiểm tra điểm thấp mong đợi:** —

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `low-interpretability | use-with-caution` → Thực tế: `use-with-caution`)

**Lỗi phát hiện:** Không có

---

### 10. ✅ PASS — Trả lời toàn 3 - Né tránh `[Adversarial]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **50/100** |
| Đánh giá độ tin cậy | 🟠 Cần thận trọng |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🔴 Nguy hiểm (91%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🔴 Nguy hiểm (Max 120 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.00) |
| Chọn cực đoan | 🟢 Tốt (0%) |

**5 Chiều cao nhất:** extraversion(5.5), agreeableness(5.5), conscientiousness(5.5), openness(5.5), emotional_stability(5.5)

**Kiểm tra điểm cao mong đợi:** —

**Kiểm tra điểm thấp mong đợi:** —

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `low-interpretability | use-with-caution` → Thực tế: `use-with-caution`)

**Lỗi phát hiện:** Không có

---

### 11. ✅ PASS — Zigzac - Xen kẽ 1-5 (DỮ LIỆU THỦ CÔNG) `[Adversarial]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **50/100** |
| Đánh giá độ tin cậy | 🟠 Cần thận trọng |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (0%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🔴 Nguy hiểm (Max 119 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.00) |
| Chọn cực đoan | 🔴 Nguy hiểm (100%) |

**5 Chiều cao nhất:** extraversion(5.5), conscientiousness(5.5), openness(5.5), emotional_stability(5.5), achievement_drive(5.5)

**Kiểm tra điểm cao mong đợi:** —

**Kiểm tra điểm thấp mong đợi:** —

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `low-interpretability | use-with-caution` → Thực tế: `use-with-caution`)

**Lỗi phát hiện:** Không có

---

### 12. ✅ PASS — Lie Cheater - Tô vẽ nhẹ hơn `[Adversarial]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **59/100** |
| Đánh giá độ tin cậy | 🟠 Cần thận trọng |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (0 intra + 1 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (0%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 4 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.46) |
| Chọn cực đoan | 🟡 Cảnh báo (86%) |

**5 Chiều cao nhất:** challenge_spirit(10.0), autonomy(10.0), learning_curiosity(10.0), recognition_need(10.0), empathy(10.0)

**Kiểm tra điểm cao mong đợi:** —

**Kiểm tra điểm thấp mong đợi:** —

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `low-interpretability | use-with-caution` → Thực tế: `use-with-caution`)

**Lỗi phát hiện:** Không có

---

### 13. ✅ PASS — Người hoàn hảo nhưng nhất quán `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **100/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (0 intra + 1 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (0%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 5 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.55) |
| Chọn cực đoan | 🟢 Tốt (68%) |

**5 Chiều cao nhất:** recognition_need(10.0), logical_thinking(10.0), extraversion(9.6), empathy(9.6), execution_speed(9.6)

**Kiểm tra điểm cao mong đợi:** ✅ extraversion: 9.6 | ✅ conscientiousness: 9.3 | ✅ emotional_stability: 9.3 | ✅ learning_curiosity: 8.9

**Kiểm tra điểm thấp mong đợi:** —

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable | use-with-caution` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 14. ✅ PASS — Mâu thuẫn tâm lý - Hướng ngoại + Autonomy thấp `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **86/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟡 Cảnh báo (1 intra + 1 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (23%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟡 Cảnh báo (Max 9 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.33) |
| Chọn cực đoan | 🟢 Tốt (21%) |

**5 Chiều cao nhất:** extraversion(10.0), recognition_need(10.0), execution_speed(10.0), emotional_stability(7.4), empathy(7.4)

**Kiểm tra điểm cao mong đợi:** ✅ extraversion: 10.0

**Kiểm tra điểm thấp mong đợi:** ✅ autonomy: 2.1

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable | use-with-caution` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 15. ✅ PASS — Lười biếng - Ít cam kết `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **94/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (1%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟡 Cảnh báo (Max 7 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=2.80) |
| Chọn cực đoan | 🟢 Tốt (21%) |

**5 Chiều cao nhất:** stability_orientation(9.3), emotional_stability(8.9), agreeableness(6.6), extraversion(3.3), conscientiousness(3.3)

**Kiểm tra điểm cao mong đợi:** ✅ stability_orientation: 9.3

**Kiểm tra điểm thấp mong đợi:** ✅ conscientiousness: 3.3 | ✅ achievement_drive: 2.5 | ✅ autonomy: 2.5

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 16. ✅ PASS — Burnout - Stress cao, cảm xúc không ổn `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **100/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (12%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 5 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=2.96) |
| Chọn cực đoan | 🟢 Tốt (18%) |

**5 Chiều cao nhất:** stress_physical(8.9), stability_orientation(7.8), agreeableness(6.6), logical_thinking(5.1), caution(4.4)

**Kiểm tra điểm cao mong đợi:** —

**Kiểm tra điểm thấp mong đợi:** ✅ emotional_stability: 1.8 | ✅ learning_curiosity: 2.5 | ✅ achievement_drive: 2.9

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 17. ✅ PASS — Nhân viên cũ - Ít đổi mới `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **94/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (2 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (7%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟡 Cảnh báo (Max 7 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.28) |
| Chọn cực đoan | 🟢 Tốt (48%) |

**5 Chiều cao nhất:** conscientiousness(10.0), logical_thinking(10.0), caution(10.0), stability_orientation(10.0), emotional_stability(9.3)

**Kiểm tra điểm cao mong đợi:** ✅ stability_orientation: 10.0 | ✅ conscientiousness: 10.0

**Kiểm tra điểm thấp mong đợi:** ✅ openness: 2.5 | ✅ learning_curiosity: 2.5 | ✅ challenge_spirit: 2.5

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 18. ✅ PASS — Leader tiềm năng - Toàn diện `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **100/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (1%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 4 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.57) |
| Chọn cực đoan | 🟢 Tốt (41%) |

**5 Chiều cao nhất:** empathy(9.3), growth_orientation(9.3), social_contribution(9.3), critical_thinking(9.3), emotional_stability(8.9)

**Kiểm tra điểm cao mong đợi:** ✅ extraversion: 7.8 | ✅ achievement_drive: 8.9 | ✅ empathy: 9.3 | ✅ emotional_stability: 8.9 | ✅ autonomy: 8.9

**Kiểm tra điểm thấp mong đợi:** —

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 19. ✅ PASS — Người hướng ngoại thích ổn định `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **92/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟡 Cảnh báo (1 intra + 2 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (3%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 5 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.23) |
| Chọn cực đoan | 🟢 Tốt (42%) |

**5 Chiều cao nhất:** achievement_drive(10.0), logical_thinking(10.0), stability_orientation(9.6), extraversion(9.3), recognition_need(9.3)

**Kiểm tra điểm cao mong đợi:** ✅ extraversion: 9.3 | ✅ stability_orientation: 9.6

**Kiểm tra điểm thấp mong đợi:** ✅ challenge_spirit: 1.8 | ✅ openness: 2.5

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable | use-with-caution` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 20. ✅ PASS — Người thực dụng - Trung bình ổn định `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **100/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (19%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 6 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.13) |
| Chọn cực đoan | 🟢 Tốt (2%) |

**5 Chiều cao nhất:** logical_thinking(7.8), growth_orientation(7.8), critical_thinking(7.8), conscientiousness(7.4), challenge_spirit(7.4)

**Kiểm tra điểm cao mong đợi:** —

**Kiểm tra điểm thấp mong đợi:** —

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 21. ❌ FAIL — Bác sĩ / Y tế — Áp lực cao, trách nhiệm lớn `[Honest]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **92/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟡 Cảnh báo (2 intra + 1 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (9%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 5 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.43) |
| Chọn cực đoan | 🟢 Tốt (43%) |

**5 Chiều cao nhất:** conscientiousness(10.0), achievement_drive(10.0), caution(10.0), empathy(9.6), social_contribution(9.6)

**Kiểm tra điểm cao mong đợi:** ✅ conscientiousness: 10.0 | ✅ empathy: 9.6 | ✅ caution: 10.0 | ✅ social_contribution: 9.6

**Kiểm tra điểm thấp mong đợi:** ❌ challenge_spirit: 5.1 | ✅ recognition_need: 2.5

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** `CAO_HƠN_KỲ_VỌNG: challenge_spirit=5.1`

---

### 22. ✅ PASS — Giáo viên THPT — Kiên nhẫn, tận tụy `[Honest]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **100/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 133 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (1 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (10%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 6 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.28) |
| Chọn cực đoan | 🟢 Tốt (43%) |

**5 Chiều cao nhất:** conscientiousness(10.0), emotional_stability(10.0), caution(10.0), stability_orientation(10.0), social_contribution(10.0)

**Kiểm tra điểm cao mong đợi:** ✅ conscientiousness: 10.0 | ✅ social_contribution: 10.0 | ✅ stability_orientation: 10.0 | ✅ agreeableness: 8.9

**Kiểm tra điểm thấp mong đợi:** ✅ execution_speed: 3.3 | ✅ achievement_drive: 1.8 | ✅ challenge_spirit: 2.9

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 23. ❌ FAIL — Luật sư tranh tụng — Phân tích sắc bén, tự tin `[Honest]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **55/100** |
| Đánh giá độ tin cậy | 🟠 Cần thận trọng |
| Số câu trả lời | 133 |
| Nói dối / Tô hồng | 🟡 Cảnh báo (5) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (3%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 6 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.43) |
| Chọn cực đoan | 🟡 Cảnh báo (85%) |

**5 Chiều cao nhất:** extraversion(10.0), emotional_stability(10.0), achievement_drive(10.0), challenge_spirit(10.0), autonomy(10.0)

**Kiểm tra điểm cao mong đợi:** ✅ logical_thinking: 10.0 | ✅ critical_thinking: 9.6 | ✅ challenge_spirit: 10.0 | ✅ recognition_need: 10.0 | ✅ autonomy: 10.0

**Kiểm tra điểm thấp mong đợi:** ✅ empathy: 1.0 | ✅ social_contribution: 2.1

**Kiểm tra độ tin cậy:** ❌ Sai (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `use-with-caution`)

**Lỗi phát hiện:** `SAI_ĐỘ_TIN_CẬY: thực_tế=use-with-caution, kỳ_vọng=reliable|mostly-reliable`

---

### 24. ❌ FAIL — Nhà khoa học/Nghiên cứu — Tư duy sâu, hướng nội `[Honest]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **100/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (2) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (8%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 5 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.17) |
| Chọn cực đoan | 🟢 Tốt (67%) |

**5 Chiều cao nhất:** openness(10.0), autonomy(10.0), logical_thinking(10.0), caution(10.0), critical_thinking(10.0)

**Kiểm tra điểm cao mong đợi:** ✅ logical_thinking: 10.0 | ✅ learning_curiosity: 9.6 | ✅ autonomy: 10.0 | ❌ data_literacy: 0.0

**Kiểm tra điểm thấp mong đợi:** ✅ extraversion: 1.0 | ✅ execution_speed: 1.0 | ✅ recognition_need: 1.0

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** `THẤP_HƠN_KỲ_VỌNG: data_literacy=0.0`

---

### 25. ❌ FAIL — Marketing Manager — Sáng tạo, nhanh nhạy `[Honest]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **87/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟡 Cảnh báo (4) |
| Độ nhất quán | 🟢 Tốt (1 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (8%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 4 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.38) |
| Chọn cực đoan | 🟢 Tốt (43%) |

**5 Chiều cao nhất:** extraversion(10.0), achievement_drive(10.0), challenge_spirit(10.0), autonomy(10.0), learning_curiosity(10.0)

**Kiểm tra điểm cao mong đợi:** ✅ openness: 9.6 | ✅ extraversion: 10.0 | ✅ execution_speed: 9.3 | ❌ communication_clarity: 0.0 | ✅ challenge_spirit: 10.0

**Kiểm tra điểm thấp mong đợi:** ✅ caution: 3.3 | ✅ stability_orientation: 2.5

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** `THẤP_HƠN_KỲ_VỌNG: communication_clarity=0.0`

---

### 26. ✅ PASS — CFO / Tài chính cấp cao — Kiểm soát, thận trọng `[Honest]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **87/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 133 |
| Nói dối / Tô hồng | 🟡 Cảnh báo (4) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (14%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 6 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.32) |
| Chọn cực đoan | 🟢 Tốt (43%) |

**5 Chiều cao nhất:** conscientiousness(10.0), emotional_stability(10.0), logical_thinking(10.0), critical_thinking(10.0), autonomy(9.6)

**Kiểm tra điểm cao mong đợi:** ✅ caution: 9.3 | ✅ logical_thinking: 10.0 | ✅ autonomy: 9.6 | ✅ stability_orientation: 9.3

**Kiểm tra điểm thấp mong đợi:** ✅ openness: 4.0 | ✅ challenge_spirit: 4.0

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 27. ✅ PASS — Nhân viên dịch vụ khách hàng — Nhẫn nại, hỗ trợ `[Honest]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **100/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (2) |
| Độ nhất quán | 🟢 Tốt (0 intra + 1 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (17%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 4 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.18) |
| Chọn cực đoan | 🟢 Tốt (19%) |

**5 Chiều cao nhất:** agreeableness(10.0), emotional_stability(8.9), empathy(8.9), extraversion(8.5), learning_curiosity(8.5)

**Kiểm tra điểm cao mong đợi:** ✅ agreeableness: 10.0 | ✅ empathy: 8.9 | ✅ extraversion: 8.5

**Kiểm tra điểm thấp mong đợi:** ✅ autonomy: 2.5 | ✅ challenge_spirit: 3.3 | ✅ logical_thinking: 3.3

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 28. ✅ PASS — Founder Startup — Tham vọng, liều lĩnh, thích nghi `[Honest]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **67/100** |
| Đánh giá độ tin cậy | 🟡 Tương đối đáng tin |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🔴 Nguy hiểm (6) |
| Độ nhất quán | 🟢 Tốt (2 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (8%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 4 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.40) |
| Chọn cực đoan | 🟢 Tốt (73%) |

**5 Chiều cao nhất:** achievement_drive(10.0), challenge_spirit(10.0), autonomy(10.0), learning_curiosity(10.0), execution_speed(10.0)

**Kiểm tra điểm cao mong đợi:** ✅ achievement_drive: 10.0 | ✅ challenge_spirit: 10.0 | ✅ autonomy: 10.0 | ✅ growth_orientation: 10.0

**Kiểm tra điểm thấp mong đợi:** ✅ stability_orientation: 1.0 | ✅ caution: 2.5

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `mostly-reliable`)

**Lỗi phát hiện:** Không có

---

### 29. ✅ PASS — Công nhân nhà máy — Ổn định, thủ tục, ít tham vọng `[Honest]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **61/100** |
| Đánh giá độ tin cậy | 🟡 Tương đối đáng tin |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🔴 Nguy hiểm (6) |
| Độ nhất quán | 🟢 Tốt (1 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (9%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟡 Cảnh báo (Max 7 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.00) |
| Chọn cực đoan | 🟢 Tốt (38%) |

**5 Chiều cao nhất:** conscientiousness(10.0), logical_thinking(10.0), caution(10.0), stability_orientation(10.0), emotional_stability(8.5)

**Kiểm tra điểm cao mong đợi:** ✅ conscientiousness: 10.0 | ✅ stability_orientation: 10.0

**Kiểm tra điểm thấp mong đợi:** ✅ achievement_drive: 3.3 | ✅ challenge_spirit: 3.3 | ✅ openness: 1.4 | ✅ learning_curiosity: 2.9

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `mostly-reliable`)

**Lỗi phát hiện:** Không có

---

### 30. ❌ FAIL — Social Desirability — Biết mình muốn gì để trả lời `[Adversarial]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **67/100** |
| Đánh giá độ tin cậy | 🟡 Tương đối đáng tin |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🔴 Nguy hiểm (11) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (4%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 4 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.70) |
| Chọn cực đoan | 🟢 Tốt (43%) |

**5 Chiều cao nhất:** conscientiousness(9.3), recognition_need(9.3), caution(9.3), emotional_stability(8.9), achievement_drive(8.9)

**Kiểm tra điểm cao mong đợi:** —

**Kiểm tra điểm thấp mong đợi:** —

**Kiểm tra độ tin cậy:** ❌ Sai (Kỳ vọng: `use-with-caution | low-interpretability` → Thực tế: `mostly-reliable`)

**Lỗi phát hiện:** `SAI_ĐỘ_TIN_CẬY: thực_tế=mostly-reliable, kỳ_vọng=use-with-caution|low-interpretability`

---

### 31. ❌ FAIL — Random Response — Mệt mỏi không đọc câu `[Adversarial]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **80/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟡 Cảnh báo (5) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟡 Cảnh báo (32%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 3 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=2.97) |
| Chọn cực đoan | 🟢 Tốt (11%) |

**5 Chiều cao nhất:** agreeableness(7.0), conscientiousness(6.6), openness(6.6), logical_thinking(6.6), critical_thinking(6.6)

**Kiểm tra điểm cao mong đợi:** —

**Kiểm tra điểm thấp mong đợi:** —

**Kiểm tra độ tin cậy:** ❌ Sai (Kỳ vọng: `use-with-caution | low-interpretability` → Thực tế: `reliable`)

**Lỗi phát hiện:** `SAI_ĐỘ_TIN_CẬY: thực_tế=reliable, kỳ_vọng=use-with-caution|low-interpretability`

---

### 32. ❌ FAIL — Faking Good — Chỉ tô hồng chiều "quan trọng" `[Adversarial]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **77/100** |
| Đánh giá độ tin cậy | 🟡 Tương đối đáng tin |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟡 Cảnh báo (5) |
| Độ nhất quán | 🟢 Tốt (1 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (22%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 5 câu liên tiếp) |
| Xu hướng đồng thuận | 🔴 Nguy hiểm (TB=5.00) |
| Chọn cực đoan | 🟢 Tốt (35%) |

**5 Chiều cao nhất:** agreeableness(10.0), conscientiousness(10.0), emotional_stability(10.0), empathy(10.0), caution(10.0)

**Kiểm tra điểm cao mong đợi:** —

**Kiểm tra điểm thấp mong đợi:** —

**Kiểm tra độ tin cậy:** ❌ Sai (Kỳ vọng: `use-with-caution | low-interpretability` → Thực tế: `mostly-reliable`)

**Lỗi phát hiện:** `SAI_ĐỘ_TIN_CẬY: thực_tế=mostly-reliable, kỳ_vọng=use-with-caution|low-interpretability`

---

### 33. ✅ PASS — Acquiescence Extreme — Đồng ý tất cả không suy nghĩ `[Adversarial]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **31/100** |
| Đánh giá độ tin cậy | 🔴 Không đáng tin / Từ chối giải nghĩa |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🔴 Nguy hiểm (11) |
| Độ nhất quán | 🔴 Nguy hiểm (20 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (7%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟡 Cảnh báo (Max 8 câu liên tiếp) |
| Xu hướng đồng thuận | 🔴 Nguy hiểm (TB=4.53) |
| Chọn cực đoan | 🟢 Tốt (60%) |

**5 Chiều cao nhất:** emotional_stability(8.1), challenge_spirit(8.1), social_contribution(8.1), extraversion(7.8), conscientiousness(7.8)

**Kiểm tra điểm cao mong đợi:** —

**Kiểm tra điểm thấp mong đợi:** —

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `use-with-caution | low-interpretability` → Thực tế: `low-interpretability`)

**Lỗi phát hiện:** Không có

---

### 34. ✅ PASS — Nay-saying — Phủ nhận mọi thứ một cách hệ thống `[Adversarial]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **50/100** |
| Đánh giá độ tin cậy | 🟠 Cần thận trọng |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🔴 Nguy hiểm (20 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (11%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 6 câu liên tiếp) |
| Xu hướng đồng thuận | 🔴 Nguy hiểm (TB=1.73) |
| Chọn cực đoan | 🟢 Tốt (39%) |

**5 Chiều cao nhất:** stress_mental(6.6), logical_thinking(6.3), challenge_spirit(5.9), autonomy(5.9), learning_curiosity(5.9)

**Kiểm tra điểm cao mong đợi:** —

**Kiểm tra điểm thấp mong đợi:** —

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `use-with-caution | low-interpretability` → Thực tế: `use-with-caution`)

**Lỗi phát hiện:** Không có

---

### 35. ❌ FAIL — Perfectionist thật sự — Stress cao vì yêu cầu cá nhân `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **53/100** |
| Đánh giá độ tin cậy | 🟠 Cần thận trọng |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🔴 Nguy hiểm (7) |
| Độ nhất quán | 🟡 Cảnh báo (4 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (5%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟡 Cảnh báo (Max 7 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.37) |
| Chọn cực đoan | 🟢 Tốt (65%) |

**5 Chiều cao nhất:** conscientiousness(10.0), autonomy(10.0), learning_curiosity(10.0), logical_thinking(10.0), caution(10.0)

**Kiểm tra điểm cao mong đợi:** ✅ conscientiousness: 10.0 | ✅ caution: 10.0 | ✅ logical_thinking: 10.0

**Kiểm tra điểm thấp mong đợi:** ✅ stability_orientation: 1.8

**Kiểm tra độ tin cậy:** ❌ Sai (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `use-with-caution`)

**Lỗi phát hiện:** `SAI_ĐỘ_TIN_CẬY: thực_tế=use-with-caution, kỳ_vọng=reliable|mostly-reliable`

---

### 36. ✅ PASS — Nhân viên phục hồi sau trauma — Fragile nhưng đang cải thiện `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **100/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 133 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (23%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 6 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.02) |
| Chọn cực đoan | 🟢 Tốt (8%) |

**5 Chiều cao nhất:** empathy(9.3), agreeableness(7.8), stability_orientation(7.8), social_contribution(7.8), autonomy(7.4)

**Kiểm tra điểm cao mong đợi:** ✅ empathy: 9.3

**Kiểm tra điểm thấp mong đợi:** ✅ learning_curiosity: 2.9 | ✅ achievement_drive: 2.5

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable | use-with-caution` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 37. ✅ PASS — Người hướng nội nhưng kỹ năng giao tiếp cao `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **100/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (2) |
| Độ nhất quán | 🟢 Tốt (0 intra + 1 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (6%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 5 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.45) |
| Chọn cực đoan | 🟢 Tốt (57%) |

**5 Chiều cao nhất:** agreeableness(10.0), conscientiousness(10.0), autonomy(10.0), learning_curiosity(10.0), logical_thinking(10.0)

**Kiểm tra điểm cao mong đợi:** ✅ empathy: 10.0 | ✅ conscientiousness: 10.0

**Kiểm tra điểm thấp mong đợi:** ✅ extraversion: 1.4

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 38. ❌ FAIL — Người có Impostor Syndrome — Thực lực cao, tự đánh giá thấp `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **100/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (9%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 4 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.37) |
| Chọn cực đoan | 🟢 Tốt (33%) |

**5 Chiều cao nhất:** conscientiousness(10.0), openness(10.0), logical_thinking(10.0), execution_speed(9.3), caution(8.9)

**Kiểm tra điểm cao mong đợi:** ✅ logical_thinking: 10.0 | ✅ learning_curiosity: 8.5 | ✅ conscientiousness: 10.0

**Kiểm tra điểm thấp mong đợi:** ✅ achievement_drive: 4.4 | ❌ recognition_need: 7.8 | ❌ autonomy: 8.5

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** `CAO_HƠN_KỲ_VỌNG: recognition_need=7.8`, `CAO_HƠN_KỲ_VỌNG: autonomy=8.5`

---

### 39. ❌ FAIL — Người chuyển ngành (Career Changer) — Lo lắng, thích nghi thấp `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **87/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟡 Cảnh báo (5) |
| Độ nhất quán | 🟢 Tốt (2 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (5%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 6 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.37) |
| Chọn cực đoan | 🟢 Tốt (34%) |

**5 Chiều cao nhất:** conscientiousness(9.3), learning_curiosity(9.3), recognition_need(9.3), caution(9.3), growth_orientation(8.9)

**Kiểm tra điểm cao mong đợi:** ✅ learning_curiosity: 9.3 | ✅ conscientiousness: 9.3

**Kiểm tra điểm thấp mong đợi:** ❌ openness: 8.1 | ✅ autonomy: 2.5

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** `CAO_HƠN_KỲ_VỌNG: openness=8.1`

---

### 40. ✅ PASS — Senior C-level sắp về hưu — Mất lửa nhưng dày kinh nghiệm `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **81/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 133 |
| Nói dối / Tô hồng | 🟡 Cảnh báo (4) |
| Độ nhất quán | 🟢 Tốt (1 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (14%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟡 Cảnh báo (Max 7 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.17) |
| Chọn cực đoan | 🟢 Tốt (48%) |

**5 Chiều cao nhất:** conscientiousness(10.0), caution(10.0), emotional_stability(9.6), logical_thinking(9.6), stability_orientation(9.6)

**Kiểm tra điểm cao mong đợi:** ✅ caution: 10.0 | ✅ conscientiousness: 10.0 | ✅ logical_thinking: 9.6

**Kiểm tra điểm thấp mong đợi:** ✅ achievement_drive: 2.5 | ✅ learning_curiosity: 2.1 | ✅ challenge_spirit: 2.5 | ✅ growth_orientation: 1.8

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 41. ✅ PASS — Nhân viên có ADHD — Năng lượng cao, kém tập trung `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **100/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (8%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 6 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.40) |
| Chọn cực đoan | 🟢 Tốt (40%) |

**5 Chiều cao nhất:** execution_speed(9.6), extraversion(9.3), openness(9.3), challenge_spirit(9.3), autonomy(9.3)

**Kiểm tra điểm cao mong đợi:** ✅ openness: 9.3 | ✅ extraversion: 9.3 | ✅ challenge_spirit: 9.3 | ✅ learning_curiosity: 9.3

**Kiểm tra điểm thấp mong đợi:** ✅ conscientiousness: 2.5 | ✅ caution: 2.5

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 42. ✅ PASS — Người Pleasers — Đồng ý mọi thứ để được thích `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **67/100** |
| Đánh giá độ tin cậy | 🟡 Tương đối đáng tin |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🔴 Nguy hiểm (12) |
| Độ nhất quán | 🟢 Tốt (2 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (11%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 6 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.33) |
| Chọn cực đoan | 🟢 Tốt (39%) |

**5 Chiều cao nhất:** agreeableness(10.0), recognition_need(10.0), empathy(10.0), social_contribution(9.6), caution(8.9)

**Kiểm tra điểm cao mong đợi:** ✅ agreeableness: 10.0 | ✅ empathy: 10.0 | ✅ recognition_need: 10.0

**Kiểm tra điểm thấp mong đợi:** ✅ autonomy: 2.5 | ✅ challenge_spirit: 3.6

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `mostly-reliable`)

**Lỗi phát hiện:** Không có

---

### 43. ✅ PASS — Người đang chờ offer — Không đặt nhiều kỳ vọng vào vị trí này `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **76/100** |
| Đánh giá độ tin cậy | 🟡 Tương đối đáng tin |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (1) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🔴 Nguy hiểm (67%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟡 Cảnh báo (Max 8 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.04) |
| Chọn cực đoan | 🟢 Tốt (0%) |

**5 Chiều cao nhất:** achievement_drive(7.0), autonomy(6.6), learning_curiosity(6.6), execution_speed(6.6), recognition_need(6.3)

**Kiểm tra điểm cao mong đợi:** —

**Kiểm tra điểm thấp mong đợi:** —

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `use-with-caution | mostly-reliable` → Thực tế: `mostly-reliable`)

**Lỗi phát hiện:** Không có

---

### 44. ✅ PASS — Người vừa ly hôn — Thiếu ổn định cảm xúc tạm thời `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **67/100** |
| Đánh giá độ tin cậy | 🟡 Tương đối đáng tin |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🔴 Nguy hiểm (6) |
| Độ nhất quán | 🟢 Tốt (0 intra + 1 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (12%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 5 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.38) |
| Chọn cực đoan | 🟢 Tốt (37%) |

**5 Chiều cao nhất:** conscientiousness(10.0), openness(9.6), achievement_drive(9.6), challenge_spirit(9.6), learning_curiosity(9.6)

**Kiểm tra điểm cao mong đợi:** ✅ conscientiousness: 10.0 | ✅ learning_curiosity: 9.6

**Kiểm tra điểm thấp mong đợi:** ✅ emotional_stability: 2.9

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `mostly-reliable`)

**Lỗi phát hiện:** Không có

---

### 45. ✅ PASS — Leader độc đoán — Quyết đoán nhưng thiếu đồng cảm `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **87/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 134 |
| Nói dối / Tô hồng | 🟡 Cảnh báo (5) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (3%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 5 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.30) |
| Chọn cực đoan | 🟢 Tốt (53%) |

**5 Chiều cao nhất:** achievement_drive(10.0), challenge_spirit(10.0), autonomy(10.0), logical_thinking(10.0), execution_speed(10.0)

**Kiểm tra điểm cao mong đợi:** ✅ autonomy: 10.0 | ✅ execution_speed: 10.0 | ✅ achievement_drive: 10.0 | ✅ logical_thinking: 10.0

**Kiểm tra điểm thấp mong đợi:** ✅ empathy: 2.5 | ✅ agreeableness: 1.8 | ✅ social_contribution: 2.9

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 46. ✅ PASS — Người có Grit cao bất thường — Bền bỉ phi thường dù không tài năng xuất sắc `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **50/100** |
| Đánh giá độ tin cậy | 🟠 Cần thận trọng |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟡 Cảnh báo (6) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (23%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🔴 Nguy hiểm (Max 10 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.32) |
| Chọn cực đoan | 🟢 Tốt (34%) |

**5 Chiều cao nhất:** conscientiousness(10.0), openness(10.0), achievement_drive(9.3), challenge_spirit(9.3), learning_curiosity(9.3)

**Kiểm tra điểm cao mong đợi:** ✅ challenge_spirit: 9.3 | ✅ learning_curiosity: 9.3 | ✅ conscientiousness: 10.0

**Kiểm tra điểm thấp mong đợi:** ✅ autonomy: 2.5

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable | use-with-caution` → Thực tế: `use-with-caution`)

**Lỗi phát hiện:** Không có

---

### 47. ✅ PASS — Nhân viên trung thành nhưng bị burnout — Ở lại vì sợ thay đổi `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **87/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 133 |
| Nói dối / Tô hồng | 🟡 Cảnh báo (3) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (12%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 6 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.02) |
| Chọn cực đoan | 🟢 Tốt (28%) |

**5 Chiều cao nhất:** stability_orientation(10.0), caution(8.5), conscientiousness(7.8), logical_thinking(6.6), agreeableness(6.3)

**Kiểm tra điểm cao mong đợi:** ✅ stability_orientation: 10.0 | ✅ conscientiousness: 7.8

**Kiểm tra điểm thấp mong đợi:** ✅ achievement_drive: 2.1 | ✅ challenge_spirit: 2.1 | ✅ learning_curiosity: 3.3 | ✅ emotional_stability: 2.9

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 48. ✅ PASS — GenZ ứng viên — Digital native, nhanh nhưng thiếu kiên nhẫn `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **87/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟡 Cảnh báo (4) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (14%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 6 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.38) |
| Chọn cực đoan | 🟢 Tốt (34%) |

**5 Chiều cao nhất:** execution_speed(10.0), growth_orientation(9.6), openness(9.3), learning_curiosity(9.3), critical_thinking(9.3)

**Kiểm tra điểm cao mong đợi:** ✅ openness: 9.3 | ✅ learning_curiosity: 9.3 | ✅ extraversion: 8.5 | ✅ execution_speed: 10.0

**Kiểm tra điểm thấp mong đợi:** ✅ caution: 2.5

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 49. ✅ PASS — Người thay đổi thường xuyên — Linh hoạt cực cao nhưng không cam kết dài hạn `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **92/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (0) |
| Độ nhất quán | 🟡 Cảnh báo (4 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (15%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 4 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.47) |
| Chọn cực đoan | 🟢 Tốt (38%) |

**5 Chiều cao nhất:** execution_speed(10.0), openness(9.6), challenge_spirit(9.3), autonomy(9.3), learning_curiosity(9.3)

**Kiểm tra điểm cao mong đợi:** ✅ openness: 9.6 | ✅ challenge_spirit: 9.3

**Kiểm tra điểm thấp mong đợi:** ✅ stability_orientation: 2.5

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** Không có

---

### 50. ❌ FAIL — Người có trí tuệ cảm xúc cao — EQ vượt trội nhưng IQ trung bình `[Edge]`

| Chỉ số | Giá trị |
|---|---|
| Điểm độ tin cậy | **100/100** |
| Đánh giá độ tin cậy | 🟢 Đáng tin cậy |
| Số câu trả lời | 132 |
| Nói dối / Tô hồng | 🟢 Tốt (3) |
| Độ nhất quán | 🟢 Tốt (0 intra + 0 cross-dim lỗi) |
| Thiên kiến trung lập | 🟢 Tốt (24%) |
| Khuôn mẫu (Straight-line/Zigzac) | 🟢 Tốt (Max 6 câu liên tiếp) |
| Xu hướng đồng thuận | 🟢 Tốt (TB=3.28) |
| Chọn cực đoan | 🟢 Tốt (25%) |

**5 Chiều cao nhất:** empathy(10.0), social_contribution(10.0), stress_mental(10.0), extraversion(9.3), agreeableness(8.9)

**Kiểm tra điểm cao mong đợi:** ✅ empathy: 10.0 | ✅ emotional_stability: 8.9 | ✅ social_contribution: 10.0 | ✅ agreeableness: 8.9

**Kiểm tra điểm thấp mong đợi:** ❌ logical_thinking: 6.3

**Kiểm tra độ tin cậy:** ✅ Đúng (Kỳ vọng: `reliable | mostly-reliable` → Thực tế: `reliable`)

**Lỗi phát hiện:** `CAO_HƠN_KỲ_VỌNG: logical_thinking=6.3`

---

---

## 🔍 Phân tích tổng hợp

### Điểm mạnh
- ✅ **Kỹ sư phần mềm - Cẩn thận, hướng nội**: Phát hiện đúng (`reliable`)
- ✅ **Nhân viên Sales - Hướng ngoại, nhiệt tình**: Phát hiện đúng (`reliable`)
- ✅ **HR Manager - Đồng cảm, quan tâm người khác**: Phát hiện đúng (`reliable`)
- ✅ **Designer UX - Sáng tạo, cởi mở**: Phát hiện đúng (`reliable`)
- ✅ **Project Manager - Cân bằng, lãnh đạo**: Phát hiện đúng (`reliable`)
- ✅ **Nhân viên mới ra trường - Chưa xác định**: Phát hiện đúng (`reliable`)
- ✅ **Tô hồng hồ sơ - Toàn điểm 5**: Phát hiện đúng (`use-with-caution`)
- ✅ **Khiêm tốn thái quá - Toàn điểm 1**: Phát hiện đúng (`use-with-caution`)
- ✅ **Trả lời toàn 3 - Né tránh**: Phát hiện đúng (`use-with-caution`)
- ✅ **Zigzac - Xen kẽ 1-5 (DỮ LIỆU THỦ CÔNG)**: Phát hiện đúng (`use-with-caution`)
- ✅ **Lie Cheater - Tô vẽ nhẹ hơn**: Phát hiện đúng (`use-with-caution`)
- ✅ **Người hoàn hảo nhưng nhất quán**: Phát hiện đúng (`reliable`)
- ✅ **Mâu thuẫn tâm lý - Hướng ngoại + Autonomy thấp**: Phát hiện đúng (`reliable`)
- ✅ **Lười biếng - Ít cam kết**: Phát hiện đúng (`reliable`)
- ✅ **Burnout - Stress cao, cảm xúc không ổn**: Phát hiện đúng (`reliable`)
- ✅ **Nhân viên cũ - Ít đổi mới**: Phát hiện đúng (`reliable`)
- ✅ **Leader tiềm năng - Toàn diện**: Phát hiện đúng (`reliable`)
- ✅ **Người hướng ngoại thích ổn định**: Phát hiện đúng (`reliable`)
- ✅ **Người thực dụng - Trung bình ổn định**: Phát hiện đúng (`reliable`)
- ✅ **Giáo viên THPT — Kiên nhẫn, tận tụy**: Phát hiện đúng (`reliable`)
- ✅ **CFO / Tài chính cấp cao — Kiểm soát, thận trọng**: Phát hiện đúng (`reliable`)
- ✅ **Nhân viên dịch vụ khách hàng — Nhẫn nại, hỗ trợ**: Phát hiện đúng (`reliable`)
- ✅ **Founder Startup — Tham vọng, liều lĩnh, thích nghi**: Phát hiện đúng (`mostly-reliable`)
- ✅ **Công nhân nhà máy — Ổn định, thủ tục, ít tham vọng**: Phát hiện đúng (`mostly-reliable`)
- ✅ **Acquiescence Extreme — Đồng ý tất cả không suy nghĩ**: Phát hiện đúng (`low-interpretability`)
- ✅ **Nay-saying — Phủ nhận mọi thứ một cách hệ thống**: Phát hiện đúng (`use-with-caution`)
- ✅ **Nhân viên phục hồi sau trauma — Fragile nhưng đang cải thiện**: Phát hiện đúng (`reliable`)
- ✅ **Người hướng nội nhưng kỹ năng giao tiếp cao**: Phát hiện đúng (`reliable`)
- ✅ **Senior C-level sắp về hưu — Mất lửa nhưng dày kinh nghiệm**: Phát hiện đúng (`reliable`)
- ✅ **Nhân viên có ADHD — Năng lượng cao, kém tập trung**: Phát hiện đúng (`reliable`)
- ✅ **Người Pleasers — Đồng ý mọi thứ để được thích**: Phát hiện đúng (`mostly-reliable`)
- ✅ **Người đang chờ offer — Không đặt nhiều kỳ vọng vào vị trí này**: Phát hiện đúng (`mostly-reliable`)
- ✅ **Người vừa ly hôn — Thiếu ổn định cảm xúc tạm thời**: Phát hiện đúng (`mostly-reliable`)
- ✅ **Leader độc đoán — Quyết đoán nhưng thiếu đồng cảm**: Phát hiện đúng (`reliable`)
- ✅ **Người có Grit cao bất thường — Bền bỉ phi thường dù không tài năng xuất sắc**: Phát hiện đúng (`use-with-caution`)
- ✅ **Nhân viên trung thành nhưng bị burnout — Ở lại vì sợ thay đổi**: Phát hiện đúng (`reliable`)
- ✅ **GenZ ứng viên — Digital native, nhanh nhưng thiếu kiên nhẫn**: Phát hiện đúng (`reliable`)
- ✅ **Người thay đổi thường xuyên — Linh hoạt cực cao nhưng không cam kết dài hạn**: Phát hiện đúng (`reliable`)

### Điểm cần cải thiện
- ❌ **Kế toán - Ổn định, nguyên tắc**: SAI_ĐỘ_TIN_CẬY: thực_tế=use-with-caution, kỳ_vọng=reliable|mostly-reliable
- ❌ **Bác sĩ / Y tế — Áp lực cao, trách nhiệm lớn**: CAO_HƠN_KỲ_VỌNG: challenge_spirit=5.1
- ❌ **Luật sư tranh tụng — Phân tích sắc bén, tự tin**: SAI_ĐỘ_TIN_CẬY: thực_tế=use-with-caution, kỳ_vọng=reliable|mostly-reliable
- ❌ **Nhà khoa học/Nghiên cứu — Tư duy sâu, hướng nội**: THẤP_HƠN_KỲ_VỌNG: data_literacy=0.0
- ❌ **Marketing Manager — Sáng tạo, nhanh nhạy**: THẤP_HƠN_KỲ_VỌNG: communication_clarity=0.0
- ❌ **Social Desirability — Biết mình muốn gì để trả lời**: SAI_ĐỘ_TIN_CẬY: thực_tế=mostly-reliable, kỳ_vọng=use-with-caution|low-interpretability
- ❌ **Random Response — Mệt mỏi không đọc câu**: SAI_ĐỘ_TIN_CẬY: thực_tế=reliable, kỳ_vọng=use-with-caution|low-interpretability
- ❌ **Faking Good — Chỉ tô hồng chiều "quan trọng"**: SAI_ĐỘ_TIN_CẬY: thực_tế=mostly-reliable, kỳ_vọng=use-with-caution|low-interpretability
- ❌ **Perfectionist thật sự — Stress cao vì yêu cầu cá nhân**: SAI_ĐỘ_TIN_CẬY: thực_tế=use-with-caution, kỳ_vọng=reliable|mostly-reliable
- ❌ **Người có Impostor Syndrome — Thực lực cao, tự đánh giá thấp**: CAO_HƠN_KỲ_VỌNG: recognition_need=7.8; CAO_HƠN_KỲ_VỌNG: autonomy=8.5
- ❌ **Người chuyển ngành (Career Changer) — Lo lắng, thích nghi thấp**: CAO_HƠN_KỲ_VỌNG: openness=8.1
- ❌ **Người có trí tuệ cảm xúc cao — EQ vượt trội nhưng IQ trung bình**: CAO_HƠN_KỲ_VỌNG: logical_thinking=6.3

---

*Báo cáo tự động bởi validation-50-personas.ts — SPI V4.2 Techzen*
