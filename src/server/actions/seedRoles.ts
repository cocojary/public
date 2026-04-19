"use server";

import db from "../db";

export async function seedRoles() {
  const roles = [
    {
      code: "EXPLORER",
      name: "Nhà Khai phá (The Explorer)",
      description: "Những người tiên phong đi tìm ý tưởng mới và cơ hội chưa khai phá. Họ năng động, hướng ngoại và cực kỳ linh hoạt.",
      positions: "Sales Hunter, Business Development, Chuyên gia mở rộng thị trường"
    },
    {
      code: "DRIVER",
      name: "Nhà Vận động (The Driver)",
      description: "Lực lượng thúc đẩy mục tiêu với tinh thần quyết liệt. Họ tập trung vào kết quả, tốc độ và sự chuyển dịch liên tục.",
      positions: "Trưởng phòng Kinh doanh, Thủ lĩnh dự án, Operation Manager"
    },
    {
      code: "TECHNOCRAT",
      name: "Nhà Kỹ trị (Technocrat)",
      description: "Bậc thầy về logic và hệ thống. Họ xây dựng nền móng kỹ thuật vững chắc với sự am hiểu chuyên sâu và tỉ mỉ.",
      positions: "Backend Developer, Solution Architect, Kế toán trưởng, QA Manager"
    },
    {
      code: "OPTIMIZER",
      name: "Người Chăm chút (Optimizer)",
      description: "Người giữ cho bộ máy vận hành trơn tru và ổn định. Họ yêu thích quy trình chuẩn mực và sự chính xác tuyệt đối.",
      positions: "Hành chính tổng hợp, C&B, Kiểm soát nội bộ, Vận hành kho"
    },
    {
      code: "INNOVATOR",
      name: "Nhà Sáng tạo (The Innovator)",
      description: "Tâm hồn đổi mới với góc nhìn khác biệt. Họ mang lại sự độc bản và cảm hứng thông qua thẩm mỹ và sự phá cách.",
      positions: "Creative Designer, Marketing Creative, Content Creator, UI/UX Designer"
    },
    {
      code: "BUILDER",
      name: "Người Kiến tạo (Product Builder)",
      description: "Cầu nối giữa ý tưởng và thực tế. Họ biến những khái niệm trừu tượng thành sản phẩm hữu hình có giá trị cao.",
      positions: "Product Manager, Frontend Developer, Growth Hacker"
    },
    {
      code: "ANALYST",
      name: "Cố vấn Phân tích (The Analyst)",
      description: "Bộ óc dữ liệu giúp tổ chức nhìn thấu bức tranh toàn cảnh. Họ đưa ra nhận định dựa trên bằng chứng và sự khách quan.",
      positions: "Business Analyst, Data Scientist, Chuyên gia R&D, Market Researcher"
    },
    {
      code: "CONNECTOR",
      name: "Chất Kết Dính (The Connector)",
      description: "Sợi dây liên kết con người và tổ chức. Họ xây dựng niềm tin, sự thấu hiểu và duy trì văn hóa đội ngũ bền vững.",
      positions: "Customer Success, HR Manager, Trợ lý cấp cao, Account Management"
    }
  ];

  console.log("Đang khởi tạo danh sách vai trò SOTA V4...");

  for (const role of roles) {
    await db.targetRole.upsert({
      where: { code: role.code },
      update: {
        name: role.name,
        description: `${role.description} (Vị trí tiêu biểu: ${role.positions})`,
      },
      create: {
        code: role.code,
        name: role.name,
        description: `${role.description} (Vị trí tiêu biểu: ${role.positions})`,
      },
    });
  }

  console.log("Khởi tạo chức danh hoàn tất!");
  return { success: true };
}
