import { generateQuestionSet } from "../server/actions/generateQuestions"; 
import prisma from "../server/db";

const ROLES = [
  { code: "DEV", name: "Lập trình viên (Dev)" },
  { code: "MANAGER", name: "Quản lý / Leader" },
  { code: "PM", name: "Project Manager (PM)" },
  { code: "HR", name: "Nhân sự (HR)" },
  { code: "BRSE", name: "Kỹ sư cầu nối (BrSE)" },
  { code: "COMTOR", name: "Biên phiên dịch (Comtor)" },
  { code: "ACC", name: "Kế toán (Accounting)" },
  { code: "MKT", name: "Marketing" },
];

async function main() {
  console.log("=== Bắt đầu tiến trình Master Seeding (Phase 2) ===");
  
  for (const role of ROLES) {
    try {
      console.log(`\n>>> Đang xử lý Role: ${role.name} (${role.code})...`);
      
      // Seed Role first
      await prisma.targetRole.upsert({
        where: { code: role.code },
        update: { name: role.name },
        create: {
          code: role.code,
          name: role.name,
          description: `Bộ câu hỏi chuyên sâu cho ${role.name}`
        }
      });
      
      // Trigger AI Generation (Option 1A)
      const result = await generateQuestionSet(role.code, role.name);
      
      if (result.success) {
        console.log(`[OK] Đã dệt xong câu hỏi cho ${role.code}. SetId: ${result.setId}`);
      }
    } catch (error) {
      console.error(`[ERROR] Thất bại khi xử lý ${role.code}:`, error);
    }
  }
  
  console.log("\n=== TẤT CẢ ĐÃ HOÀN TẤT ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
