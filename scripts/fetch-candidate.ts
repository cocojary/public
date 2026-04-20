import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.findFirst({
    where: {
      fullName: { contains: 'My La' }
    },
    include: {
      assessments: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });
  console.log(JSON.stringify(u, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
