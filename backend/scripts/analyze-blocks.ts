import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'data');

function analyze() {
  const courseDirs = fs.readdirSync(DATA_DIR).filter(item => {
    return fs.statSync(path.join(DATA_DIR, item)).isDirectory();
  });

  const blockTypes = new Map<string, Set<string>>();
  let totalBlocks = 0;

  for (const courseSlug of courseDirs) {
    const coursePath = path.join(DATA_DIR, courseSlug);
    const lecturesPath = path.join(coursePath, 'lectures.json');
    if (!fs.existsSync(lecturesPath)) continue;

    const lectures = JSON.parse(fs.readFileSync(lecturesPath, 'utf-8'));
    for (const lecture of lectures) {
      const lessonJsonPath = path.join(coursePath, `lecture_${lecture.number}`, 'lesson.json');
      if (!fs.existsSync(lessonJsonPath)) continue;

      const lessonData = JSON.parse(fs.readFileSync(lessonJsonPath, 'utf-8'));
      if (lessonData.sections) {
        for (const section of lessonData.sections) {
          if (section.blocks) {
            for (const block of section.blocks) {
              totalBlocks++;
              if (!blockTypes.has(block.type)) {
                blockTypes.set(block.type, new Set());
              }
              const keys = Object.keys(block);
              for (const key of keys) {
                if (key !== 'type') {
                   // if it's 'data' or similar, we might want to track subfields
                   // wait, the JSON might not be { type, data: {...} }. Let's see.
                   if (typeof block[key] === 'object' && !Array.isArray(block[key]) && block[key] !== null) {
                     for (const subKey of Object.keys(block[key])) {
                       blockTypes.get(block.type)!.add(`${key}.${subKey}`);
                     }
                   } else {
                     blockTypes.get(block.type)!.add(key);
                   }
                }
              }
            }
          }
        }
      }
    }
  }

  console.log(`Analyzed ${totalBlocks} blocks.`);
  for (const [type, fields] of blockTypes.entries()) {
    console.log(`Block Type: ${type}`);
    console.log(`Fields: ${Array.from(fields).join(', ')}`);
    console.log('---');
  }
}

analyze();
