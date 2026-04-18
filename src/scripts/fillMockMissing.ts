
import db from '../server/db';
import { DIMENSIONS } from '@/features/assessment/data/dimensions';

const MISSING_ROLES = [
  { code: 'TESTER', name: 'Kiểm thử phần mềm (Tester)' },
  { code: 'SALES', name: 'Kinh doanh / Sales' }
];

async function fillMock() {
  console.log('--- FILLING MOCK DATA FOR MISSING ROLES ---');

  for (const roleDef of MISSING_ROLES) {
    let role = await db.targetRole.findUnique({ where: { code: roleDef.code } });
    if (!role) {
      role = await db.targetRole.create({
        data: { code: roleDef.code, name: roleDef.name, description: `Dữ liệu dự phòng cho ${roleDef.name}` }
      });
    }

    const qSet = await db.questionSet.create({
      data: { roleId: role.id, version: "v1.0-mock" }
    });

    const questions: any[] = [];

    // Fill 114 dimension questions (19 dims x 6)
    DIMENSIONS.forEach(dim => {
      for (let i = 1; i <= 6; i++) {
        questions.push({
          setId: qSet.id,
          dimensionId: dim.id,
          textVi: `[DỰ PHÒNG] Câu hỏi ${i} cho tiêu chí ${dim.nameVi} của vị trí ${roleDef.name}`,
          textEn: `[MOCK] Question ${i} for ${dim.nameEn} - Role ${roleDef.code}`,
          textJa: `[MOCK] ${dim.nameVi}の質問${i} - ${roleDef.name}`,
          reversed: i > 3,
          isLieScale: false
        });
      }
    });

    // Fill 6 Lie scale questions
    for (let i = 1; i <= 6; i++) {
      questions.push({
        setId: qSet.id,
        dimensionId: "lie_scale",
        textVi: `[DỰ PHÒNG] Câu hỏi kiểm soát ${i} cho vị trí ${roleDef.name}`,
        textEn: `[MOCK] Validation question ${i} for ${roleDef.code}`,
        textJa: `[MOCK] 妥当性質問${i} - ${roleDef.name}`,
        reversed: false,
        isLieScale: true
      });
    }

    await db.question.createMany({ data: questions });
    console.log(`✅ Filled 120 mock questions for ${roleDef.code}`);
  }
}

fillMock()
  .catch(e => console.error(e))
  .finally(async () => await db.$disconnect());
