const fs = require('fs');
const path = require('path');

function checkCourse(slug) {
  console.log('--- ' + slug + ' ---');
  const dir = path.join('frontend', 'public', 'data', slug);
  const lecturesFile = path.join(dir, 'lectures.json');
  if (!fs.existsSync(lecturesFile)) { console.log('Missing lectures.json'); return; }
  const lectures = JSON.parse(fs.readFileSync(lecturesFile));
  
  for (const l of lectures) {
    const lDir = path.join(dir, 'lecture_' + l.number);
    let hasNotes = fs.existsSync(path.join(lDir, 'notes.md'));
    let hasSections = fs.existsSync(path.join(lDir, 'sections.json'));
    let hasLesson = fs.existsSync(path.join(lDir, 'lesson.json'));
    let hasQuiz = fs.existsSync(path.join(lDir, 'quiz.json'));
    let hasProblems = fs.existsSync(path.join(lDir, 'problems.json'));
    
    let quizCount = 0;
    if (hasQuiz) {
      try {
        const q = JSON.parse(fs.readFileSync(path.join(lDir, 'quiz.json')));
        quizCount = q.length;
      } catch (e) {}
    }
    
    let probCount = 0;
    if (hasProblems) {
      try {
        const p = JSON.parse(fs.readFileSync(path.join(lDir, 'problems.json')));
        probCount = p.length;
      } catch(e) {}
    }

    const issues = [];
    if (!hasNotes && !hasSections && !hasLesson) issues.push('No Notes/Sections/Lesson');
    if (!hasQuiz || quizCount === 0) issues.push('No Quizzes');
    if (!hasProblems || probCount === 0) issues.push('No Problems');

    console.log(`Lecture ${l.number}: ${l.title} -> ${issues.length === 0 ? 'OK' : issues.join(', ')}`);
  }
}

checkCourse('python');
checkCourse('cs50ai');
