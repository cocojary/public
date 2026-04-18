import prisma from "../server/db";
import { DIMENSIONS } from "../features/assessment/data/dimensions";

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

/** 
 * Mock Question Templates per Dimension 
 * In a real scenario, we'd have 6 distinct templates per dimension.
 * Here we use 6 slightly varied strings to fulfill the 120-question requirement (20 dims * 6 questions).
 */
const getMockQuestions = (dimId: string, roleName: string) => {
  const dim = DIMENSIONS.find(d => d.id === dimId);
  const name = dim?.nameVi || dimId;
  
  return [
    { textVi: `Tôi thường xuyên áp dụng các kỹ năng về ${name} trong công việc ${roleName} của mình.`, textEn: `I frequently apply ${name} skills in my ${roleName} work.`, reversed: false },
    { textVi: `Mọi người nhận xét tôi là một ${roleName} có chỉ số ${name} rất cao.`, textEn: `People describe me as a ${roleName} with high ${name}.`, reversed: false },
    { textVi: `Tôi cảm thấy khó khăn khi phải thể hiện sự ${name} lúc làm việc.`, textEn: `I find it difficult to show ${name} while working.`, reversed: true },
    { textVi: `Trong các tình huống căng thẳng tại vị trí ${roleName}, tôi vẫn giữ được sự ${name}.`, textEn: `In stressful situations as a ${roleName}, I maintain my ${name}.`, reversed: false },
    { textVi: `Tôi thường xuyên bỏ qua các yếu tố liên quan đến ${name} để tập trung vào việc khác.`, textEn: `I often ignore factors related to ${name} to focus on other things.`, reversed: true },
    { textVi: `Tôi luôn nỗ lực để cải thiện khía cạnh ${name} của bản thân mỗi ngày.`, textEn: `I always strive to improve my ${name} every day.`, reversed: false },
  ];
};

const getMockLieScale = (roleName: string) => [
  { textVi: `Tôi chưa bao giờ mắc bất kỳ sai lầm nào khi làm việc ở vị trí ${roleName}.`, textEn: `I have never made any mistakes while working as a ${roleName}.`, reversed: false },
  { textVi: `Tôi chưa từng nói dối đồng nghiệp hay cấp trên dù chỉ một lần.`, textEn: `I have never lied to my colleagues or superiors even once.`, reversed: false },
  { textVi: `Tôi luôn luôn hoàn thành 100% KPI mà không bao giờ gặp trễ hạn.`, textEn: `I always complete 100% of my KPIs without ever being late.`, reversed: false },
  { textVi: `Tôi chưa bao giờ cảm thấy khó chịu với bất kỳ ai trong công ty.`, textEn: `I have never felt annoyed with anyone in the company.`, reversed: false },
  { textVi: `Tôi là một ${roleName} hoàn hảo về mọi mặt.`, textEn: `I am a perfect ${roleName} in every way.`, reversed: false },
  { textVi: `Tôi chưa bao giờ sử dụng thời gian làm việc để làm việc cá nhân.`, textEn: `I have never used working hours for personal business.`, reversed: false },
];

async function main() {
  console.log("=== Bắt đầu tiến trình MOCK Seeding (Phase 2 - Fallback) ===");
  
  for (const role of ROLES) {
    console.log(`\n>>> Đang Mock Role: ${role.name}...`);
    
    const targetRole = await prisma.targetRole.upsert({
      where: { code: role.code },
      update: { name: role.name },
      create: { code: role.code, name: role.name, description: `Bộ câu hỏi MOCK cho ${role.name}` }
    });
    
    const qSet = await prisma.questionSet.create({
      data: {
        roleId: targetRole.id,
        version: "2.0-mock",
        isActive: true,
      }
    });
    
    for (const dim of DIMENSIONS) {
      const mocks = getMockQuestions(dim.id, role.name);
      await prisma.question.createMany({
        data: mocks.map(m => ({
          setId: qSet.id,
          dimensionId: dim.id,
          textVi: m.textVi,
          textEn: m.textEn,
          textJa: m.textEn, // Using EN as placeholder for JA
          reversed: m.reversed,
          isLieScale: false,
        }))
      });
    }
    
    // Lie Scale
    const lies = getMockLieScale(role.name);
    await prisma.question.createMany({
      data: lies.map(m => ({
        setId: qSet.id,
        dimensionId: "lie_scale",
        textVi: m.textVi,
        textEn: m.textEn,
        textJa: m.textEn, // Using EN as placeholder for JA
        reversed: m.reversed,
        isLieScale: true,
      }))
    });
    
    console.log(`[OK] Đã tạo xong 126 câu hỏi (120 + 6 Lie) cho ${role.code}`);
  }
  
  console.log("\n=== MOCK SEEDING HOÀN TẤT ===");
}

main().catch(console.error).finally(() => prisma.$disconnect());
