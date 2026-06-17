import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../../frontend/public/data");
const courses = ["python", "cs50ai"];

for (const course of courses) {
  const courseDir = join(dataDir, course);
  if (!existsSync(courseDir)) continue;
  const lectures = readdirSync(courseDir).filter(f => f.startsWith("lecture_"));
  for (const lecture of lectures) {
    const filePath = join(courseDir, lecture, "lesson.json");
    if (!existsSync(filePath)) continue;
    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    const sections = data.sections || [];
    let changed = false;
    for (const section of sections) {
      const blocks = section.blocks || [];
      for (const block of blocks) {
        if (block.type === "practice" && "expectedOutput" in block) {
          delete block.expectedOutput;
          changed = true;
        }
      }
    }
    if (changed) {
      writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
      console.log(`Cleaned: ${course}/${lecture}/lesson.json`);
    }
  }
}
console.log("Done.");
