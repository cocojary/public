import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.dimension.findMany({ where: { id: { in: ['caution', 'agreeableness', 'stability_orientation'] } } }).then(ds => {
  ds.forEach(d => console.log(`${d.id}: isActive=${d.isActive}, group=${d.group}`));
}).finally(() => prisma.$disconnect());
