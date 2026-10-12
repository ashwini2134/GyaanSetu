const fs = require('fs');

let out = '';
let report = {};

for (let i = 0; i < 9; i++) {
  report[i] = { has5: false, duplicates: false, answerMismatch: false, questions: [] };
  try {
    const q = JSON.parse(fs.readFileSync('frontend/public/data/fundamentals-of-ai/lecture_' + i + '/quiz.json', 'utf8'));
    if (q.length === 5) report[i].has5 = true;
    
    q.forEach((item, idx) => {
      // Check duplicates
      const uniqueOptions = new Set(item.options);
      if (uniqueOptions.size !== item.options.length) {
        report[i].duplicates = true;
      }
      
      // Check if answer exactly matches an option
      if (!item.options.includes(item.answer)) {
        report[i].answerMismatch = true;
      }
      
      out += `L${i+1} Q${idx+1}: ${item.question}\nOptions: ${item.options.join(' | ')}\nAnswer: ${item.answer}\n\n`;
    });
  } catch(e) {
    console.log("Error reading L" + (i+1));
  }
}

fs.writeFileSync('quiz_deep_audit.txt', out);
console.log(JSON.stringify(report, null, 2));
