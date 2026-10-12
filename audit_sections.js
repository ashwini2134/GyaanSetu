const fs = require('fs');
const path = require('path');

const AI_DIR = path.join(__dirname, 'frontend', 'public', 'data', 'cs50ai');
const expectedLectures = 10;

let quizRows = [];
let problemsRows = [];
let similarRows = [];
let broken = [];
let unclear = [];

for (let i = 0; i < expectedLectures; i++) {
  const lecturePath = path.join(AI_DIR, `lecture_${i}`);
  
  if (!fs.existsSync(lecturePath)) {
    quizRows.push(`| ${i} | MISSING | N | N (Missing) | N (Missing) | High |`);
    problemsRows.push(`| ${i} | MISSING | N (Missing) | N (Missing) | High |`);
    similarRows.push(`| ${i} | N | N (Missing) | N/A | High |`);
    broken.push(`Lecture ${i} is completely missing.`);
    continue;
  }
  
  // QUIZ AUDIT
  const quizPath = path.join(lecturePath, 'quiz.json');
  if (fs.existsSync(quizPath)) {
    try {
      const quizData = JSON.parse(fs.readFileSync(quizPath, 'utf-8'));
      const questionsCount = Array.isArray(quizData) ? quizData.length : 0;
      let schemaOk = true;
      let issues = [];
      if (!Array.isArray(quizData)) {
        schemaOk = false;
        issues.push("Quiz is not an array");
      } else {
        if (questionsCount < 3) issues.push("Too few questions");
        quizData.forEach(q => {
          if (!q.question || !q.options || !q.answer || !q.explanation) schemaOk = false;
        });
      }
      const isOk = issues.length > 0 ? `N (${issues.join(', ')})` : "Y";
      if (!schemaOk) broken.push(`Lecture ${i} quiz.json schema is invalid.`);
      quizRows.push(`| ${i} | ${questionsCount} | ${schemaOk?'Y':'N'} | ${isOk} | Y (Needs manual QA) | ${issues.length>0?'Med':'Low'} |`);
    } catch (e) {
      quizRows.push(`| ${i} | ERROR | N | N (Parse error) | N | High |`);
      broken.push(`Lecture ${i} quiz.json has a JSON parse error.`);
    }
  } else {
    quizRows.push(`| ${i} | MISSING | N | N (Missing) | N | High |`);
    broken.push(`Lecture ${i} is missing quiz.json.`);
  }
  
  // PROBLEMS TO SOLVE AUDIT
  const probPath = path.join(lecturePath, 'problems.json');
  if (fs.existsSync(probPath)) {
    try {
      const probData = JSON.parse(fs.readFileSync(probPath, 'utf-8'));
      const count = Array.isArray(probData) ? probData.length : 0;
      let schemaOk = true;
      let issues = [];
      if (!Array.isArray(probData)) {
        schemaOk = false;
        issues.push("Problems is not an array");
      } else {
        if (count === 0) issues.push("Empty problem list");
        probData.forEach(p => {
          if (!p.id || !p.title || !p.description) schemaOk = false;
          if (p.description && p.description.includes("TODO")) issues.push(`Placeholder in ${p.id}`);
        });
      }
      const isOk = issues.length > 0 ? `N (${issues.join(', ')})` : "Y";
      if (!schemaOk) broken.push(`Lecture ${i} problems.json schema is invalid.`);
      problemsRows.push(`| ${i} | ${count} | ${isOk} | Y (Needs manual QA) | ${issues.length>0?'Med':'Low'} |`);
    } catch (e) {
      problemsRows.push(`| ${i} | ERROR | N (Parse error) | N | High |`);
      broken.push(`Lecture ${i} problems.json has a JSON parse error.`);
    }
  } else {
    problemsRows.push(`| ${i} | MISSING | N (Missing) | N | High |`);
    broken.push(`Lecture ${i} is missing problems.json.`);
  }
  
  // SIMILAR QUESTIONS AUDIT
  let hasSimilar = false;
  // Let's check all json files for anything resembling similar questions
  const allJson = fs.readdirSync(lecturePath).filter(f => f.endsWith('.json'));
  for (let f of allJson) {
    if (f.toLowerCase().includes('similar')) {
      hasSimilar = true;
      break;
    }
  }
  
  if (hasSimilar) {
    similarRows.push(`| ${i} | Y | Y (Needs manual QA) | None found | Low |`);
  } else {
    similarRows.push(`| ${i} | N | N (Missing entirely) | N/A | High |`);
    broken.push(`Lecture ${i} is missing Similar Questions section entirely.`);
  }
}

console.log("=== TABLE 1: QUIZ ===");
console.log(quizRows.join("\n"));
console.log("\n=== TABLE 2: PROBLEMS ===");
console.log(problemsRows.join("\n"));
console.log("\n=== TABLE 3: SIMILAR ===");
console.log(similarRows.join("\n"));
console.log("\n=== BROKEN ===");
console.log(broken.join("\n"));
