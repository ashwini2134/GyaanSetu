import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({ select: { slug: true, title: true }});
  console.log("COURSES:", courses);
}

main().catch(console.error).finally(() => prisma.$disconnect());
