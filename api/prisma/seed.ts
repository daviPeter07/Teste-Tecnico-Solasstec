import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to seed the database.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const priorityTypes = [
  {
    description: 'Visitante sem critério de prioridade.',
    priorityLevel: 0,
  },
  {
    description: 'Visitante com idade igual ou superior a 60 anos.',
    priorityLevel: 1,
  },
  {
    description: 'Visitante que informou possuir deficiência.',
    priorityLevel: 2,
  },
  {
    description: 'Visitante que atende aos dois critérios de prioridade.',
    priorityLevel: 3,
  },
] as const;

async function seed() {
  await prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`SELECT pg_advisory_xact_lock(191923, 1)`;

    for (const priorityType of priorityTypes) {
      const existingPriorityType = await transaction.priorityType.findFirst({
        where: { description: priorityType.description },
        select: { id: true },
      });

      if (existingPriorityType) {
        await transaction.priorityType.update({
          where: { id: existingPriorityType.id },
          data: priorityType,
        });
      } else {
        await transaction.priorityType.create({ data: priorityType });
      }
    }
  });
}

seed()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
