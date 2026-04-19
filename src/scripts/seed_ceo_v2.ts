import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const GROUP_MAP: Record<string, string> = {
  '1': 'strategic_vision',
  '2': 'decision_making',
  '3': 'ownership',
  '4': 'people_leadership',
  '5': 'organization_building',
  '6': 'performance_management',
  '7': 'financial_management',
  '8': 'customer_partner_management',
  '9': 'executive_communication',
  '10': 'change_management',
  '11': 'risk_management',
  '12': 'self_discipline',
  '13': 'continuous_learning',
  '14': 'pressure_balance',
};

async function main() {
  console.log('--- STARTING CEO/DIR SEEDING (v2) ---');
  
  // 1. Ensure CEO and DIR roles exist
  const rolesToUpdate = [
    { code: 'CEO', name: 'Giám Đốc Điều Hành (CEO)', desc: 'Bộ nội dung đánh giá C-Level' },
    { code: 'DIR', name: 'Giám đốc (Director)', desc: 'Bộ nội dung đánh giá lãnh đạo cao cấp (v2)' }
  ];

  const roleIds: string[] = [];
  for (const r of rolesToUpdate) {
    const role = await prisma.targetRole.upsert({
      where: { code: r.code },
      update: { name: r.name, description: r.desc },
      create: { code: r.code, name: r.name, description: r.desc }
    });
    roleIds.push(role.id);
    console.log(`Updated/Created Role: ${r.code}`);
  }

  // 2. Lấy nội dung file txt
  const filePath = path.join(process.cwd(), 'src', 'CEO_v2.txt');
  let text;
  try {
     text = fs.readFileSync(filePath, 'utf-8');
  } catch(e) {
     console.error('Không tìm thấy file CEO_v2.txt hoặc lỗi:', e);
     return;
  }
  
  // 3. Phân tách câu hỏi
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  let currentGroup = '';
  let questionsData: any[] = [];
  
  for (const line of lines) {
    const matchGroup = line.match(/^(\d+)\)\s+(.*)/);
    if (matchGroup) {
      currentGroup = matchGroup[1]; 
      continue;
    }
    
    if (line.startsWith('CEO-')) {
      const isReversed = line.includes('[-]');
      const contentMatch = line.match(/CEO-\d+\s+\[[+-]\]\s+(.*)/);
      if (contentMatch) {
         const questionText = contentMatch[1].trim();
         const dimensionId = GROUP_MAP[currentGroup];
         if (!dimensionId) {
            console.error('Lỗi không map được group:', currentGroup);
            continue;
         }
         
         questionsData.push({
           textVi: questionText,
           textEn: questionText,
           textJa: questionText,
           dimensionId,
           reversed: isReversed,
           isLieScale: false
         });
      }
    }
  }

  console.log(`Parsed ${questionsData.length} questions from CEO_v2.txt`);

  // 4. Khởi tạo lại question set cho từng role
  for (const roleId of roleIds) {
    // Xóa dữ liệu cũ
    const oldSets = await prisma.questionSet.findMany({ where: { roleId } });
    const oldSetIds = oldSets.map(s => s.id);
    
    await prisma.assessmentRecord.deleteMany({ where: { questionSetId: { in: oldSetIds } } });
    await prisma.question.deleteMany({ where: { set: { roleId } } });
    await prisma.questionSet.deleteMany({ where: { roleId } });

    // Tạo mới
    await prisma.questionSet.create({
      data: {
        roleId,
        version: '2.0',
        isActive: true,
        questions: {
          create: questionsData
        }
      }
    });
    console.log(`Successfully updated QuestionSet for roleId: ${roleId} to version 2.0 (140 questions)`);
  }
  
  console.log('--- SEEDING COMPLETED ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
