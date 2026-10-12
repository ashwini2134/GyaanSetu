const fs = require('fs');
const path = require('path');

const AI_DIR = path.join(__dirname, 'frontend', 'public', 'data', 'cs50ai');
const expectedLectures = 10;
const expectedExercisesPerLecture = 3;

let reportRows = [];
let brokenExercises = [];
let unclearInstructions = [];

if (!fs.existsSync(AI_DIR)) {
  console.log(`Directory not found: ${AI_DIR}`);
  process.exit(1);
}

function checkMarkdown(content, type) {
  let issues = [];
  if (!content || content.trim().length === 0) issues.push(`Empty ${type}`);
  if ((content.match(/```/g) || []).length % 2 !== 0) issues.push(`Unclosed code block in ${type}`);
  if (content.includes('](') && !content.match(/\]\([a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+\)/)) issues.push(`Possible broken link in ${type}`);
  if (content.includes('TODO') || content.includes('TBD')) issues.push(`Placeholder text in ${type}`);
  return issues;
}

for (let i = 0; i < expectedLectures; i++) {
  const lectureDirName = `lecture_${i}`;
  const lecturePath = path.join(AI_DIR, lectureDirName);
  
  if (!fs.existsSync(lecturePath)) {
    for (let j = 0; j < expectedExercisesPerLecture; j++) {
      reportRows.push(`| ${i} | ${j+1} | MISSING LECTURE | N/N/N/N/N | N (Missing) | N (Missing) | High |`);
      brokenExercises.push(`Lecture ${i} is completely missing.`);
    }
    continue;
  }
  
  const dirs = fs.readdirSync(lecturePath).filter(f => fs.statSync(path.join(lecturePath, f)).isDirectory());
  
  // Fill missing exercises
  for (let j = 0; j < expectedExercisesPerLecture; j++) {
    if (j >= dirs.length) {
      reportRows.push(`| ${i} | ${j+1} | MISSING EXERCISE | N/N/N/N/N | N (Missing) | N (Missing) | High |`);
      brokenExercises.push(`Lecture ${i} is missing exercise ${j+1} (only has ${dirs.length}).`);
      continue;
    }
    
    const exName = dirs[j];
    const exPath = path.join(lecturePath, exName);
    
    const hasBg = fs.existsSync(path.join(exPath, 'background.md'));
    const hasHints = fs.existsSync(path.join(exPath, 'hints.md'));
    const hasSpec = fs.existsSync(path.join(exPath, 'specification.md'));
    const hasStarter = fs.existsSync(path.join(exPath, 'src')) || fs.existsSync(path.join(exPath, `${exName}.py`)) || fs.existsSync(path.join(exPath, 'runner.py')) || fs.readdirSync(exPath).some(f => f.endsWith('.py'));
    const hasTest = fs.existsSync(path.join(exPath, 'test.py')) || fs.existsSync(path.join(exPath, 'check50.py')) || fs.existsSync(path.join(exPath, '__init__.py')) || fs.readdirSync(exPath).some(f => f.includes('test') || f.includes('check'));
    
    let instrIssues = [];
    if (hasBg) instrIssues.push(...checkMarkdown(fs.readFileSync(path.join(exPath, 'background.md'), 'utf-8'), 'background.md'));
    else instrIssues.push("Missing background.md");
    
    if (hasHints) instrIssues.push(...checkMarkdown(fs.readFileSync(path.join(exPath, 'hints.md'), 'utf-8'), 'hints.md'));
    else instrIssues.push("Missing hints.md");
    
    if (hasSpec) instrIssues.push(...checkMarkdown(fs.readFileSync(path.join(exPath, 'specification.md'), 'utf-8'), 'specification.md'));
    else instrIssues.push("Missing specification.md");
    
    let isInstrClear = instrIssues.length === 0 ? "Y" : `N (${instrIssues[0]})`;
    if (instrIssues.length > 0) unclearInstructions.push(`${exName} (L${i}): ${instrIssues.join(', ')}`);
    
    let funcIssues = [];
    if (!hasStarter) funcIssues.push("No starter code");
    if (!hasTest) funcIssues.push("No validation/test file");
    
    // We cannot fully execute them easily here, but lack of validation means it doesn't function.
    let isFunc = funcIssues.length === 0 ? "Y (Needs manual check)" : `N (${funcIssues[0]})`;
    if (funcIssues.length > 0) brokenExercises.push(`${exName} (L${i}): ${funcIssues.join(', ')}`);
    
    let sev = funcIssues.length > 0 ? "High" : (instrIssues.length > 0 ? "Med" : "Low");
    
    reportRows.push(`| ${i} | ${j+1} | ${exName} | ${hasBg?'Y':'N'}/${hasHints?'Y':'N'}/${hasSpec?'Y':'N'}/${hasStarter?'Y':'N'}/${hasTest?'Y':'N'} | ${isInstrClear} | ${isFunc} | ${sev} |`);
  }
}

console.log("=== REPORT ROWS ===");
console.log("| Lecture # | Exercise # | Title | Files (Bg/Hnt/Spc/Start/Test) | Instructions Clear | Functional | Severity |");
console.log("|---|---|---|---|---|---|---|");
console.log(reportRows.join("\n"));
console.log("\n=== BROKEN ===");
console.log(brokenExercises.join("\n"));
console.log("\n=== UNCLEAR ===");
console.log(unclearInstructions.join("\n"));
