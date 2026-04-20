import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding IT Role Templates...');

  // Xóa cũ nếu có để chạy lại dễ
  await prisma.roleTemplate.deleteMany();

  const roleTemplates = [
    {
      key: 'backend_dev',
      name: 'Backend Developer',
      description: 'Lập trình viên Backend hệ thống, ưu tiên tính cẩn thận, ổn định và logic.',
      coreValues: {
        'CONSCIENTIOUSNESS': 8.5,
        'COGNITIVE_FLEXIBILITY': 6.0,
        'STRESS_TOLERANCE': 7.5,
        'AGREEABLENESS': 6.0,
        'ACHIEVEMENT_DRIVE': 7.0,
      }
    },
    {
      key: 'frontend_dev',
      name: 'Frontend Developer',
      description: 'Lập trình viên Frontend, ưu tiên sự linh hoạt mở cửa, thẩm mỹ và hướng đến trải nghiệm.',
      coreValues: {
        'OPENNESS': 8.0,
        'CONSCIENTIOUSNESS': 7.0,
        'COGNITIVE_FLEXIBILITY': 8.0,
        'EMOTIONAL_INTELLIGENCE': 7.5,
      }
    },
    {
      key: 'qa_tester',
      name: 'QA / Tester',
      description: 'Chuyên viên kiểm thử, đòi hỏi sự thận trọng cực cao, chi tiết và ít nhượng bộ trước cái sai.',
      coreValues: {
        'CONSCIENTIOUSNESS': 9.0,
        'AGREEABLENESS': 5.0, // Đôi khi cần bảo vệ quan điểm bug
        'STRESS_TOLERANCE': 8.0,
        'OPENNESS': 5.5,
      }
    },
    {
      key: 'scrum_master',
      name: 'Scrum Master / PM',
      description: 'Người quản lý dự án linh hoạt, đòi hỏi hướng ngoại, thông minh cảm xúc và hòa đồng.',
      coreValues: {
        'EXTRAVERSION': 8.5,
        'EMOTIONAL_INTELLIGENCE': 9.0,
        'LEADERSHIP_POTENTIAL': 8.5,
        'AGREEABLENESS': 8.0,
        'STRESS_TOLERANCE': 8.0,
      }
    }
  ];

  for (const t of roleTemplates) {
    await prisma.roleTemplate.create({
      data: t
    });
  }
  console.log(`Created ${roleTemplates.length} role templates.`);

  // Seeding SJT questions 
  console.log('Seeding fake SJT / Forced Choice questions into current active QuestionSet...');
  
  const qSet = await prisma.questionSet.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  if (!qSet) {
    console.error('No active QuestionSet found!');
    return;
  }

  // Dimension mapping
  const dims = await prisma.dimension.findMany();
  const dimC = dims.find(d => d.id === 'conscientiousness' || d.id.includes('conscientiousness') || d.id === 'dim2_conscientiousness');
  const dimEQ = dims.find(d => d.id === 'emotional_intelligence' || d.id.includes('emotional') || d.id === 'dim7_emotional_intelligence');

  if (!dimC || !dimEQ) {
    console.log('Dimensions missing. Trying to guess...');
    console.log(dims.map(d => d.id));
    return;
  }

  // Create SJT questions
  const newQs = [
    {
      setId: qSet.id,
      dimensionId: dimC.id,
      textVi: 'Sắp tới deadline release (chiều nay), bạn phát hiện một bug tiềm ẩn nhưng nó rất khó xảy ra trong thực tế. Bạn sẽ làm gì?',
      format: 'sjt',
      options: [
        { id: '1', text: 'Tôi sẽ bỏ qua nó vì khả năng xảy ra rất thấp và release kịp giờ là ưu tiên.', points: 1 },
        { id: '2', text: 'Báo lại với team nhưng đề xuất release theo lịch, sẽ fix trong bản patch tới.', points: 3 },
        { id: '3', text: 'Dừng phiên bản release lại ngay lập tức để fix cho xong, dù phải trễ hẹn.', points: 5 }
      ],
      displayOrder: 133, // After 132 questions
    },
    {
      setId: qSet.id,
      dimensionId: dimEQ.id,
      textVi: 'Trong một cuộc họp căng thẳng, một thành viên team code nói lớn tiếng phản đối thiết kế của bạn. Bạn sẽ phản ứng thế nào?',
      format: 'sjt',
      options: [
        { id: '1', text: 'Bảo vệ thiết kế của mình quyết liệt ngay lúc đó để không bị lấn át.', points: 2 },
        { id: '2', text: 'Im lặng và đồng ý để giữ hòa khí, sau đó chỉnh sửa lại theo ý họ.', points: 1 },
        { id: '3', text: 'Lắng nghe hết ý của họ, giữ bình tĩnh và rủ họ ra trao đổi riêng dựa trên data.', points: 5 }
      ],
      displayOrder: 134,
    }
  ];

  for (const q of newQs) {
    // Check if duplicate
    const exists = await prisma.question.findFirst({ where: { textVi: q.textVi }});
    if (!exists) {
      await prisma.question.create({
        data: q
      });
    }
  }
  console.log(`Added SJT questions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
