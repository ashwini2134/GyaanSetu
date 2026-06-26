import { prisma } from './src/prisma.js';

async function main() {
  const course = await prisma.course.upsert({
    where: { id: 'java-beginners' },
    update: {
      title: 'Java for Beginners',
      description: 'Learn Java Programming in 250 steps. Covers OOP, Collections, Functional Programming, Multithreading and more.',
      status: 'PUBLISHED',
      category: 'Programming',
      difficulty: 'Beginner',
      estimatedDuration: 10,
    },
    create: {
      id: 'java-beginners',
      title: 'Java for Beginners',
      description: 'Learn Java Programming in 250 steps. Covers OOP, Collections, Functional Programming, Multithreading and more.',
      status: 'PUBLISHED',
      category: 'Programming',
      difficulty: 'Beginner',
      estimatedDuration: 10,
    }
  });

  console.log('Inserted/Updated course:', course);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
