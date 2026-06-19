import { seedData } from "./backend/src/seeds/assessmentQuestions.js";
const dbms = seedData.filter(q => q.subsection === 'DBMS');
dbms.forEach((q, i) => {
  console.log(`Q${i+1}: question="${q.question}" type=${q.type}`);
  console.log(`  options=`, q.options);
  console.log(`  correctAnswer="${q.correctAnswer}"`);
  console.log(`  index=`, q.options.indexOf(q.correctAnswer));
});
