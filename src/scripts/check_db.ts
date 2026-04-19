import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.questionSet.findFirst({
    where: {
      role: {
        code: 'CEO'
      },
      isActive: true
    },
    include: {
      questions: {
        take: 5
      },
      role: true
    }
  });

  if (!result) {
    console.log('NG: No active question set found for role CEO');
  } else {
    console.log('OK: Found CEO Question Set');
    console.log('Version:', result.version);
    console.log('Total Questions Sample:', result.questions.length);
    result.questions.forEach((q, i) => {
      console.log(`${i+1}. ${q.textVi}`);
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
