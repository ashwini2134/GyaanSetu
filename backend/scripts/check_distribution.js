import fs from 'fs';
import path from 'path';

// Helper to check files recursively
function getJsonFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getJsonFiles(fullPath, files);
    } else if (file === 'quiz.json') {
      files.push(fullPath);
    }
  }
  return files;
}

const dataDir = path.resolve('frontend/public/data');
const quizFiles = getJsonFiles(dataDir);

console.log(`Found ${quizFiles.length} quiz files.`);

let totalQuestions = 0;
let optionAQuestions = 0;

for (const file of quizFiles) {
  const content = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`\nFile: ${path.relative(dataDir, file)}`);
  content.forEach((q, idx) => {
    totalQuestions++;
    const correctIdx = q.options.indexOf(q.answer);
    if (correctIdx === 0) {
      optionAQuestions++;
    }
    console.log(`  Q${idx+1}: Answer index = ${correctIdx} (${q.answer})`);
  });
}

console.log(`\nSUMMARY:`);
console.log(`Total questions: ${totalQuestions}`);
console.log(`Option A (index 0) answers: ${optionAQuestions} (${((optionAQuestions / totalQuestions) * 100).toFixed(2)}%)`);
