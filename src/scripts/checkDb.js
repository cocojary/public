
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- TargetRole and QuestionSet Status ---');
  const roles = await prisma.targetRole.findMany({
    include: {
      _count: {
        select: { questionSets: true }
      },
      questionSets: {
        take: 1,
        include: {
          _count: {
            select: { questions: true }
          }
        }
      }
    }
  });

  roles.forEach(role => {
    const latestSet = role.questionSets[0];
    console.log(`Role: ${role.name} (${role.code})`);
    console.log(`- Total Sets: ${role._count.questionSets}`);
    if (latestSet) {
      console.log(`- Latest Set ID: ${latestSet.id}`);
      console.log(`- Latest Set Q Count: ${latestSet._count.questions}`);
      console.log(`- Latest Set Active: ${latestSet.isActive ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log(`- Latest Set: NONE`);
    }
    console.log('-------------------');
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
