# Báo Cáo Kết Quả AI Validation Hệ Thống (Adversarial Testing)

**Thời gian chạy:** 10:10:32 20/4/2026
**Mô hình giả lập:** gpt-4o-mini

## 1. Tóm tắt kết quả
- **Tổng số kịch bản test:** 5
- **Hệ thống bắt được gian lận (PASS):** 3/5

## 2. Chi tiết theo kịch bản

### Scenario 1: Lie Scale Cheater
- **Kết quả Text:** ❌ FAIL (Bỏ lọt sai phạm)
- **Điểm tin cậy (Reliability):** 89 / 100
- **Mức độ (Level):** `reliable`
- **Cờ cảnh báo từ Engine:** Phản hồi trong ngưỡng trung thực.

---

### Scenario 2: Straight-Lining (Toàn 3)
- **Kết quả Text:** ✅ PASS (Hợp lý)
- **Điểm tin cậy (Reliability):** 70 / 100
- **Mức độ (Level):** `mostly-reliable`
- **Cờ cảnh báo từ Engine:** Quá nhiều câu trả lời trung lập — kết quả mất ý nghĩa phân loại.

---

### Scenario 3: Natural Speed Run
- **Kết quả Text:** ✅ PASS (Hợp lý)
- **Điểm tin cậy (Reliability):** 77 / 100
- **Mức độ (Level):** `mostly-reliable`
- **Cờ cảnh báo từ Engine:** Speed flag: Risk | Consistency: Ok

---

### Scenario 4: Inconsistency Attack
- **Kết quả Text:** ❌ FAIL (Bỏ lọt sai phạm)
- **Điểm tin cậy (Reliability):** 77 / 100
- **Mức độ (Level):** `mostly-reliable`
- **Cờ cảnh báo từ Engine:** Trả lời nhất quán, đáng tin cậy.

---

### Scenario 5: Acquiescence Bias (Toàn 5)
- **Kết quả Text:** ✅ PASS (Hợp lý)
- **Điểm tin cậy (Reliability):** 42 / 100
- **Mức độ (Level):** `use-with-caution`
- **Cờ cảnh báo từ Engine:** Acquiescence: Risk | Extreme: Risk

---

