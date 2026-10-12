import { prisma } from './src/prisma.js';

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true }
  });
  console.log(users);
  
  // If there's only one user, or a specific user, make them admin
  for (const user of users) {
    if (user.role !== 'admin') {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin' }
      });
      console.log(`Updated ${user.email} to admin.`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
