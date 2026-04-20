import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.assessmentRecord.updateMany({
    data: { aiReport: 'null' as any } // Setting to JSON null
  });
  console.log(`Wiped ${result.count} AI reports`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
