import prisma from '../server/db';

async function run() {
  const count = await prisma.question.count();
  const roles = await prisma.targetRole.findMany({
    include: { questionSets: { include: { _count: { select: { questions: true } } } } }
  });
  
  console.log('Total Questions:', count);
  console.log('Roles status:');
  roles.forEach((r: any) => {
    const qCount = r.questionSets.reduce((sum: number, qs: any) => sum + (qs._count?.questions || 0), 0);
    console.log(` - ${r.code}: ${qCount} questions (across ${r.questionSets.length} sets)`);
  });
  
  await prisma.$disconnect();
}
run();
