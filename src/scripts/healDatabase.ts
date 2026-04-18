
import { generateQuestionSet } from '../server/actions/generateQuestions';
import db from '../server/db';

const TARGET_ROLES = [
  { code: 'DEV', name: 'Lập trình viên (Dev)' },
  { code: 'TESTER', name: 'Kiểm thử phần mềm (Tester)' },
  { code: 'MANAGER', name: 'Quản lý / Leader' },
  { code: 'PM', name: 'Project Manager (PM)' },
  { code: 'HR', name: 'Nhân sự (HR)' },
  { code: 'SALES', name: 'Kinh doanh / Sales' },
  { code: 'BRSE', name: 'Kỹ sư cầu nối (BrSE)' },
  { code: 'COMTOR', name: 'Biên phiên dịch (Comtor)' },
  { code: 'ACC', name: 'Kế toán (Accounting)' },
  { code: 'MKT', name: 'Marketing' }
];

async function heal() {
  console.log('--- DATABASE HEALING PROCESS STARTED ---');

  for (const roleDef of TARGET_ROLES) {
    console.log(`\nChecking role: ${roleDef.code}...`);

    // 1. Check if QuestionSet exists and has enough questions
    const qSets = await db.questionSet.findMany({
      where: { 
        role: { code: roleDef.code },
        isActive: true
      },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    const hasRealData = qSets.some(qs => qs._count.questions >= 120 && qs.version !== "v1.0-mock");

    if (hasRealData) {
      console.log(`✅ Role ${roleDef.code} is already healthy with real AI data.`);
      continue;
    }

    // 2. If not valid, clear old sets (Optional based on user choice, but here we heal)
    console.log(`⚠️ Role ${roleDef.code} is missing or corrupted. Healing...`);
    
    // Deleting old sets for this role to avoid duplicates
    const role = await db.targetRole.findUnique({ where: { code: roleDef.code } });
    if (role) {
      await db.question.deleteMany({
        where: { set: { roleId: role.id } }
      });
      await db.questionSet.deleteMany({
        where: { roleId: role.id }
      });
    }

    // 3. Generate new set using upgraded GPT-4o
    try {
      await generateQuestionSet(roleDef.code, roleDef.name);
      console.log(`✨ Role ${roleDef.code} healed successfully!`);
    } catch (err: any) {
      console.error(`❌ Failed to heal role ${roleDef.code}:`, err.message);
    }
  }

  console.log('\n--- ALL ROLES PROCESSED ---');
}

heal()
  .catch(e => console.error(e))
  .finally(async () => {
    await db.$disconnect();
  });
