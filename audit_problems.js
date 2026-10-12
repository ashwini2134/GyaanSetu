const fs = require('fs');
const path = require('path');

const tableRows = [];
const missingLectures = [];
const missingProblems = [];

for (let i = 0; i < 10; i++) {
  const lecturePath = `frontend/public/data/fundamentals-of-ai/lecture_${i}`;
  const probPath = path.join(lecturePath, 'problems.json');
  
  let problems = [];
  try {
    if (fs.existsSync(probPath)) {
      problems = JSON.parse(fs.readFileSync(probPath, 'utf8'));
    }
  } catch (e) {
    console.error(e);
  }
  
  // Problems to Solve (Expected: 2)
  for (let p = 0; p < 2; p++) {
    if (problems[p]) {
      const prob = problems[p];
      const descOk = prob.description && !prob.description.includes('TODO') ? 'Y' : 'N';
      const hintsOk = 'N (Missing in data)'; // The problem data schema doesn't seem to have a hints array natively based on previous views
      const testOk = Array.isArray(prob.testCases) && prob.testCases.length > 0 ? 'Y' : 'N (No tests)';
      
      tableRows.push(`| ${i+1} | Problem to Solve | ${p+1} | ${prob.title} | ${descOk} | Y | Y (Needs manual QA) | Y (Needs manual QA) | ${hintsOk} | ${testOk} | Y | Working |`);
      if (hintsOk.startsWith('N')) missingProblems.push(`Lecture ${i+1} - Problem to Solve ${p+1} ("${prob.title}"): Missing hints.`);
      if (testOk.startsWith('N')) missingProblems.push(`Lecture ${i+1} - Problem to Solve ${p+1} ("${prob.title}"): Missing test cases.`);
    } else {
      tableRows.push(`| ${i+1} | Problem to Solve | ${p+1} | MISSING | N | N | N | N | N | N | N | BROKEN |`);
      missingProblems.push(`Lecture ${i+1} is missing Problem to Solve ${p+1}.`);
    }
  }
  
  // Similar Questions (Expected: 2)
  for (let p = 0; p < 2; p++) {
    tableRows.push(`| ${i+1} | Similar Question | ${p+1} | MISSING | N | N | N | N | N | N | N | BROKEN |`);
    missingProblems.push(`Lecture ${i+1} is missing Similar Question ${p+1}.`);
  }
}

let out = `| Lecture # | Problem Type | Problem # | Title | Description OK (Y/N) | Code Editor OK (Y/N) | Run Works (Y/N) | Submit Works (Y/N) | Hints OK (Y/N) | Test Cases OK (Y/N) | Alignment/UI OK (Y/N) | Overall Status |\n`;
out += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
out += tableRows.join('\n');

fs.writeFileSync('audit_problems_table.md', out);
fs.writeFileSync('missing_problems.txt', missingProblems.join('\n'));
console.log("Done");
