// Script to generate expectedOutput for all practice exercises
import { readFileSync, writeFileSync } from 'fs';
import { runPython } from '../src/utils/pythonRunner';
import { scanForInput, injectInputs } from '../src/utils/prescanner';

interface PracticeBlock {
  type: string;
  title: string;
  starterCode: string;
  solution: string;
  hint?: string;
  expectedOutput?: string;
  requiredPatterns?: string[];
}

interface Section {
  blocks: PracticeBlock[];
}

interface LessonData {
  sections: Section[];
}

function mockInputs(solution: string): string {
  const scan = scanForInput(solution);
  if (!scan.hasInput) return solution;

  const mockValues = scan.fields.map((f) => {
    const prompt = f.prompt.toLowerCase();
    if (prompt.includes('age') || prompt.includes('marks') || prompt.includes('number') || prompt.includes('income') || prompt.includes('total')) return '42';
    if (prompt.includes('name') || prompt.includes('city') || prompt.includes('date') || prompt.includes('entry')) return 'test';
    if (prompt.includes('choose') || prompt.includes('select') || prompt.includes('option')) return '2';
    return '42';
  });
  return injectInputs(scan.replacedCode, mockValues);
}

function generate() {
  for (let lecture = 0; lecture < 14; lecture++) {
    const path = `public/data/python/lecture_${lecture}/lesson.json`;
    try {
      const raw = readFileSync(path, 'utf-8');
      const data: LessonData = JSON.parse(raw);
      let modified = false;

      for (const section of data.sections) {
        for (const block of section.blocks) {
          if (block.type !== 'practice') continue;

          try {
            const runCode = mockInputs(block.solution);
            const result = runPython(runCode);
            if (result.error) {
              console.log(`Lecture ${lecture} "${block.title}": ERROR — ${result.error.slice(0, 80)}`);
              continue;
            }
            const newOutput = result.output;
            if (block.expectedOutput !== newOutput) {
              block.expectedOutput = newOutput;
              console.log(`Lecture ${lecture} "${block.title}": "${newOutput.replace(/\n/g, '\\n')}"`);
              modified = true;
            }
          } catch (e) {
            console.log(`Lecture ${lecture} "${block.title}": CRASH — ${String(e).slice(0, 80)}`);
          }
        }
      }

      if (modified) {
        writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
        console.log(`  → Saved lecture_${lecture}/lesson.json`);
      }
    } catch (e) {
      console.log(`Lecture ${lecture}: Could not read — ${String(e).slice(0, 80)}`);
    }
  }
  console.log('\nDone!');
}

generate();
