import fs from 'fs';
import path from 'path';

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

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function validateAnswerDistribution(questions) {
  if (!questions || questions.length === 0) {
    return { isSuspicious: false };
  }

  let optionACount = 0;
  let consecutiveOptionA = 0;
  let maxConsecutiveOptionA = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const correctIdx = q.options.indexOf(q.answer);
    if (correctIdx === 0) {
      optionACount++;
      consecutiveOptionA++;
      if (consecutiveOptionA > maxConsecutiveOptionA) {
        maxConsecutiveOptionA = consecutiveOptionA;
      }
    } else {
      consecutiveOptionA = 0;
    }
  }

  const optionAPercentage = (optionACount / questions.length) * 100;
  const highPercentage = questions.length >= 4 && optionAPercentage > 50;
  const tooManyConsecutive = maxConsecutiveOptionA >= 3;

  return {
    isSuspicious: highPercentage || tooManyConsecutive
  };
}

const dataDir = path.resolve('frontend/public/data');
const quizFiles = getJsonFiles(dataDir);

console.log(`Shuffling options for ${quizFiles.length} quiz files with bias-prevention...`);

for (const file of quizFiles) {
  const content = JSON.parse(fs.readFileSync(file, 'utf8'));
  let attempts = 0;
  let success = false;

  while (attempts < 500) {
    content.forEach(q => {
      if (q.options && q.options.length > 0) {
        shuffle(q.options);
      }
    });
    const check = validateAnswerDistribution(content);
    if (!check.isSuspicious) {
      success = true;
      break;
    }
    attempts++;
  }

  if (!success) {
    console.warn(`Warning: Could not find bias-free option distribution for ${file} after 500 attempts.`);
  }
  
  fs.writeFileSync(file, JSON.stringify(content, null, 2), 'utf8');
}

console.log('Quiz options shuffled and validated successfully!');
