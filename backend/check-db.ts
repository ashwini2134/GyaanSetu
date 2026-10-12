import { prisma } from './src/prisma';

async function main() {
  const count = await prisma.projectTemplate.count();
  console.log('Total Project Templates:', count);
  const projects = await prisma.projectTemplate.findMany({ take: 3 });
  console.log('Sample Data:');
  console.log(JSON.stringify(projects, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
