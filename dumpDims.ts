import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.dimension.findMany().then(ds => console.log(ds.map(d => d.id).join(', '))).finally(() => prisma.$disconnect());
