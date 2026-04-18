"use server";

import db from "../db";

export async function seedRoles() {
  const roles = [
    { code: "DEV", name: "Lập trình viên (Dev)" },
    { code: "MANAGER", name: "Quản lý / Leader" },
    { code: "PM", name: "Project Manager (PM)" },
    { code: "HR", name: "Nhân sự (HR)" },
    { code: "BRSE", name: "Kỹ sư cầu nối (BrSE)" },
    { code: "COMTOR", name: "Biên phiên dịch (Comtor)" },
    { code: "ACC", name: "Kế toán (Accounting)" },
    { code: "MKT", name: "Marketing" },
  ];

  console.log("Đang khởi tạo danh sách chức danh...");

  for (const role of roles) {
    await db.targetRole.upsert({
      where: { code: role.code },
      update: { name: role.name },
      create: {
        code: role.code,
        name: role.name,
        description: `Bộ câu hỏi chuyên môn dành cho ${role.name}`,
      },
    });
  }

  console.log("Khởi tạo chức danh hoàn tất!");
  return { success: true };
}
