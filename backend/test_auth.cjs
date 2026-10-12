const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'beingshanya@gmail.com' }});
  console.log('Target User:', user);
  const allUsers = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  console.log('All users:', allUsers);
}

main().catch(console.error).finally(() => prisma.$disconnect());
