const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'frontend', 'public', 'data', 'python');

let output = '';

for (let i = 0; i < 14; i++) {
  const lectureDir = path.join(dataDir, `lecture_${i}`);
  output += `\n\n=================================\nLECTURE ${i + 1}\n=================================\n`;
  
  try {
    const lessonData = JSON.parse(fs.readFileSync(path.join(lectureDir, 'lesson.json'), 'utf-8'));
    output += `TITLE: ${lessonData.title}\n`;
    
    lessonData.sections.forEach((sec, idx) => {
      output += `\n--- Section ${idx + 1}: ${sec.label || sec.title} ---\n`;
      sec.blocks.forEach(block => {
        if (block.type === 'explanation') {
          output += `[Explanation: ${block.title}]\n${block.body}\n${block.bullets ? block.bullets.join('\n- ') : ''}\n`;
        } else if (block.type === 'think_of') {
          output += `[Think Of]\n${block.analogy?.title}: ${block.analogy?.description}\n`;
        } else if (block.type === 'analogy') {
          output += `[Analogy: ${block.title}]\n${block.text}\n`;
        } else if (block.type === 'quiz') {
          output += `[Quiz Block]\nQ: ${block.question}\nA: ${JSON.stringify(block.options)}\nExp: ${block.explanation}\n`;
        } else if (block.type === 'list') {
          output += `[List]\n${JSON.stringify(block.items)}\n`;
        } else if (block.type === 'practice') {
          output += `[Practice]\n${block.instructions}\nStarter: ${block.starterCode}\n`;
        } else if (block.type === 'code_example') {
          output += `[Code Example: ${block.title}]\n${block.code}\n`;
        } else {
          output += `[${block.type}]\n`;
        }
      });
    });
    
  } catch (e) {
    output += `Error reading lesson.json: ${e.message}\n`;
  }
  
  try {
    const quizData = JSON.parse(fs.readFileSync(path.join(lectureDir, 'quiz.json'), 'utf-8'));
    output += `\n--- Main Quiz ---\n`;
    quizData.questions.forEach(q => {
      output += `Q: ${q.question}\nOptions: ${JSON.stringify(q.options)}\nCorrect: ${q.correctAnswer}\nExp: ${q.explanation}\n`;
    });
  } catch (e) {
    output += `No main quiz.json\n`;
  }

  try {
    const probData = JSON.parse(fs.readFileSync(path.join(lectureDir, 'problems.json'), 'utf-8'));
    output += `\n--- Problem ---\n`;
    probData.forEach(p => {
      output += `Title: ${p.title}\nDesc: ${p.description}\nStarter: ${p.starterCode}\n`;
    });
  } catch (e) {
    output += `No problems.json\n`;
  }
}

fs.writeFileSync('audit_content.txt', output);
console.log('Done generating audit_content.txt');
