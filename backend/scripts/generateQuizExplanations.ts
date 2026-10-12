import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDataPath = path.join(__dirname, '../../frontend/public/data');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

async function findQuizFiles(dir: string): Promise<string[]> {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(await findQuizFiles(filePath));
    } else if (file === 'quiz.json') {
      results.push(filePath);
    }
  }
  return results;
}

async function generateExplanation(questionText: string, correctOptionText: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return `The correct answer is ${correctOptionText}. Review this concept in the lesson material above.`;
  }

  const prompt = `
You are an expert computer science instructor.
Given the following multiple-choice question and its correct answer, generate a 2-3 sentence educational explanation.
Explain WHY the correct answer is correct and what concept it teaches.

Question: ${questionText}
Correct Answer: ${correctOptionText}

Output ONLY the explanation text. Do not include any prefix like "Here is the explanation" or "The correct answer is correct because". Just provide the direct explanation.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }]
    });

    return (message.content[0] as any).text.trim();
  } catch (error) {
    console.error(`API Error for question: ${questionText.substring(0, 30)}...`, error);
    return `The correct answer is ${correctOptionText}. Review this concept in the lesson material above.`;
  }
}

async function processAllQuizzes() {
  const quizFiles = await findQuizFiles(frontendDataPath);
  console.log(`Found ${quizFiles.length} quiz.json files.`);

  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const file of quizFiles) {
    console.log(`Processing: ${file}`);
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      let modified = false;

      // Handle both formats: array of questions OR object with questions array
      let questions = Array.isArray(data) ? data : (data.questions || []);

      for (const q of questions) {
        if (!q.explanation || q.explanation.trim() === '') {
          // Needs explanation
          let correctIndex = -1;
          if (typeof q.correct === 'number') {
            correctIndex = q.correct;
          } else if (typeof q.correct === 'string') {
            correctIndex = parseInt(q.correct, 10);
            if (isNaN(correctIndex)) {
              // Try to find the index by matching string if options has it
              correctIndex = q.options.indexOf(q.correct);
            }
          }

          if (correctIndex >= 0 && correctIndex < q.options.length) {
            const correctOptionText = q.options[correctIndex];
            
            console.log(`  Generating explanation for: "${q.question.substring(0, 40)}..."`);
            const explanation = await generateExplanation(q.question, correctOptionText);
            
            q.explanation = explanation;
            modified = true;
            totalProcessed++;
            
            // Delay to respect rate limits
            await new Promise(r => setTimeout(r, 1000));
          } else {
            console.log(`  Skipping: Invalid correct answer index for question "${q.question.substring(0, 30)}..."`);
          }
        } else {
          totalSkipped++;
        }
      }

      if (modified) {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        console.log(`  Saved updates to ${file}`);
      }
    } catch (e) {
      console.error(`Error processing file ${file}:`, e);
      totalErrors++;
    }
  }

  console.log('--- Summary ---');
  console.log(`Generated Explanations: ${totalProcessed}`);
  console.log(`Skipped (Already Existed): ${totalSkipped}`);
  console.log(`Errors: ${totalErrors}`);
}

processAllQuizzes().catch(console.error);
