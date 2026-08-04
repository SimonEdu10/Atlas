import { config } from 'dotenv';
config({ path: '.env.local' });

import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const types = ['Video', 'Artículo', 'Herramienta', 'Curso'];
  for (const name of types) {
    await prisma.resourceType.upsert({ where: { name }, update: {}, create: { name } });
  }

  const categories = ['Desarrollo Web', 'Diseño', 'Productividad', 'Inteligencia Artificial'];
  for (const name of categories) {
    const existing = await prisma.category.findFirst({ where: { name } });
    if (!existing) {
      await prisma.category.create({ data: { name } });
    }
  }

  console.log('Seed completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });