import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.dimension.findMany({ include: { questions: { where: { isActive: true } } } }).then(ds => {
  ds.forEach(d => console.log(`${d.id}: ${d.questions.length}`));
}).finally(() => prisma.$disconnect());
