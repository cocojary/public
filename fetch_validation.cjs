const fs = require('fs');

async function run() {
  console.log("[1/2] Đang gọi API validation (có thể mất 15-30 giây để GPT-4o-mini xử lý)...");
  try {
    const res = await fetch('http://localhost:3000/api/validation/run', {
       // Thêm khoảng timeout cao nếu cần (tuy nhiên fetch native của Node18+ không dùng timeout ở đây)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const data = await res.json();
    
    let md = `# Báo Cáo Kết Quả AI Validation Hệ Thống (Adversarial Testing)\n\n`;
    md += `**Thời gian chạy:** ${new Date().toLocaleString('vi-VN')}\n`;
    md += `**Mô hình giả lập:** ${data.modelUsed}\n\n`;
    md += `## 1. Tóm tắt kết quả\n`;
    md += `- **Tổng số kịch bản test:** ${data.totalScenarios}\n`;
    md += `- **Hệ thống bắt được gian lận (PASS):** ${data.passedCount}/${data.totalScenarios}\n\n`;
    md += `## 2. Chi tiết theo kịch bản\n\n`;
    
    data.results.forEach((r, i) => {
      md += `### Scenario ${i+1}: ${r.scenario}\n`;
      if (r.error) {
        md += `- ❌ **Lỗi Test:** ${r.error}\n`;
      } else {
        md += `- **Kết quả Text:** ${r.passed ? '✅ PASS (Hợp lý)' : '❌ FAIL (Bỏ lọt sai phạm)'}\n`;
        md += `- **Điểm tin cậy (Reliability):** ${r.reliabilityScore} / 100\n`;
        md += `- **Mức độ (Level):** \`${r.reliabilityLevel}\`\n`;
        md += `- **Cờ cảnh báo từ Engine:** ${r.details || 'Không có'}\n`;
      }
      md += `\n---\n\n`;
    });
    
    fs.writeFileSync('C:\\work\\techfinc\\trachnghiem\\validation_report.md', md);
    console.log("[2/2] Hoàn tất! Đã lưu kết quả tại validation_report.md");
  } catch(e) {
    console.error("Lỗi khi kết nối hoặc xử lý API: " + e.message);
  }
}
run();
