import { prisma } from './src/prisma.js';

async function main() {
  const total = await prisma.assessmentQuestion.count();
  const withoutAssessmentId = await prisma.assessmentQuestion.count({
    where: {
      assessmentId: null
    }
  });

  console.log(`\n\n=== VERIFICATION RESULTS ===`);
  console.log(`Total AssessmentQuestions: ${total}`);
  console.log(`AssessmentQuestions with assessmentId = null: ${withoutAssessmentId}`);
  console.log(`============================\n\n`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
