import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function debugDirRole() {
  console.log("--- Bắt đầu kiểm tra Role: DIR ---");
  
  try {
    const role = await prisma.targetRole.findUnique({
      where: { code: 'DIR' },
      include: {
        questionSets: {
          include: {
            _count: {
              select: { questions: true }
            }
          }
        }
      }
    });

    if (!role) {
      console.log("X : Không tìm thấy TargetRole với code 'DIR' trong DB!");
      const allRoles = await prisma.targetRole.findMany({ select: { code: true, name: true } });
      console.log("Tất cả các role hiện có:", allRoles);
    } else {
      console.log("V : Tìm thấy TargetRole:", { id: role.id, name: role.name, code: role.code });
      console.log("Số lượng QuestionSet:", role.questionSets.length);
      
      role.questionSets.forEach((set, index) => {
        console.log(`Set [${index}]: id=${set.id}, questionsCount=${set._count.questions}, isActive=${set.isActive}`);
      });

      if (role.questionSets.length === 0) {
        console.log("X : Role DIR tồn tại nhưng KHÔNG CÓ QuestionSet nào được liên kết!");
      }
    }

    const orphanageQuestions = await prisma.question.count({
      where: { 
        roleCode: 'DIR',
        questionSetId: null
      }
    });
    console.log("Số lượng câu hỏi 'DIR' mồ côi (không có QuestionSet):", orphanageQuestions);

  } catch (err) {
    console.error("Lỗi khi chạy script:", err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

debugDirRole();
