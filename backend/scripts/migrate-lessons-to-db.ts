import { prisma } from '../src/prisma';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'data');

async function migrate() {
  console.log('Starting migration...');
  const courseDirs = fs.readdirSync(DATA_DIR).filter(item => {
    const stat = fs.statSync(path.join(DATA_DIR, item));
    return stat.isDirectory();
  });

  let migratedCourses = 0;
  let totalLessons = 0;
  let sampleContent = null;

  for (const courseSlug of courseDirs) {
    const coursePath = path.join(DATA_DIR, courseSlug);
    const lecturesPath = path.join(coursePath, 'lectures.json');

    if (!fs.existsSync(lecturesPath)) {
      continue;
    }

    console.log(`Processing course: ${courseSlug}`);
    
    // Check if course exists in DB, if not create it
    let course = await prisma.course.findUnique({ where: { id: courseSlug } });
    if (!course) {
      // Find course metadata if possible
      let title = courseSlug;
      const coursesJsonPath = path.join(DATA_DIR, 'courses.json');
      if (fs.existsSync(coursesJsonPath)) {
        const courses = JSON.parse(fs.readFileSync(coursesJsonPath, 'utf-8'));
        const found = courses.find((c: any) => c.slug === courseSlug);
        if (found) title = found.title;
      }

      course = await prisma.course.create({
        data: {
          id: courseSlug,
          title: title,
          description: title,
          category: "Programming",
          difficulty: "Beginner",
          estimatedDuration: 10,
          status: "PUBLISHED"
        }
      });
      console.log(`Created course: ${course.id}`);
    } else {
       // update to published just in case
       await prisma.course.update({
         where: { id: course.id },
         data: { status: 'PUBLISHED' }
       });
    }
    migratedCourses++;

    const lectures = JSON.parse(fs.readFileSync(lecturesPath, 'utf-8'));
    
    // Delete existing lessons, quizzes, projects to prevent duplicates
    await prisma.lesson.deleteMany({ where: { courseId: course.id } });
    await prisma.quiz.deleteMany({ where: { courseId: course.id } });
    await prisma.courseProject.deleteMany({ where: { courseId: course.id } });

    let order = 0;
    let quizPoints = 10;
    
    for (const lecture of lectures) {
      const lectureDir = path.join(coursePath, `lecture_${lecture.number}`);
      
      // 1. Migrate Lesson (lesson.json or notes.md)
      const lessonJsonPath = path.join(lectureDir, 'lesson.json');
      const notesMdPath = path.join(lectureDir, 'notes.md');
      
      let content = null;
      if (fs.existsSync(lessonJsonPath)) {
        const lessonData = JSON.parse(fs.readFileSync(lessonJsonPath, 'utf-8'));
        // The structure is { sections: [ { blocks: [...] } ] }
        // We can flatten this to a single array of blocks for easier visual editor support, 
        // OR we just store the blocks. The user requested:
        // [ { type: "heading", data: ... }, { type: "text", data: ... } ]
        
        let blocks: any[] = [];
        if (lessonData.sections) {
          for (const section of lessonData.sections) {
             if (section.title) {
                blocks.push({ type: 'heading', data: { text: section.title, level: 'h2' } });
             }
             if (section.blocks) {
                for (const block of section.blocks) {
                   blocks.push(block);
                }
             }
          }
        }
        
        content = JSON.stringify(blocks);
        if (!sampleContent) sampleContent = content;
      } else if (fs.existsSync(notesMdPath)) {
        const text = fs.readFileSync(notesMdPath, 'utf-8');
        content = JSON.stringify([{ type: 'text', data: { body: text } }]);
      }

      if (content) {
        await prisma.lesson.create({
          data: {
            courseId: course.id,
            title: lecture.title || `Lecture ${lecture.number}`,
            content: content,
            order: order++,
            type: "content"
          }
        });
        totalLessons++;
      }

      // 2. Migrate Quiz (quiz.json)
      const quizJsonPath = path.join(lectureDir, 'quiz.json');
      if (fs.existsSync(quizJsonPath)) {
        const quizData = JSON.parse(fs.readFileSync(quizJsonPath, 'utf-8'));
        
        // We create one Quiz per course, but the schema has Course 1:1 Quiz!
        // wait, schema: `model Quiz { courseId String @unique }`
        // If there is 1 Quiz per Course, we should just merge them or create one Quiz with all questions.
        // Let's create the Quiz if it doesn't exist
        let dbQuiz = await prisma.quiz.findUnique({ where: { courseId: course.id } });
        if (!dbQuiz) {
           dbQuiz = await prisma.quiz.create({
             data: {
               courseId: course.id,
               passScore: 70,
               timeLimit: 0,
               maxAttempts: 3
             }
           });
        }
        
        let qOrder = await prisma.quizQuestion.count({ where: { quizId: dbQuiz.id } });
        for (const q of quizData) {
          await prisma.quizQuestion.create({
             data: {
                quizId: dbQuiz.id,
                type: "multiple_choice",
                question: q.question,
                options: q.options || [],
                correctAnswer: q.correctAnswer !== undefined ? q.options[q.correctAnswer] || String(q.correctAnswer) : "",
                points: 10,
                order: qOrder++
             }
          });
        }
      }

      // 3. Migrate Problems (problems.json) -> CourseProject (wait Course 1:1 CourseProject!)
      const problemsJsonPath = path.join(lectureDir, 'problems.json');
      if (fs.existsSync(problemsJsonPath)) {
        const problemsData = JSON.parse(fs.readFileSync(problemsJsonPath, 'utf-8'));
        
        let dbProject = await prisma.courseProject.findUnique({ where: { courseId: course.id } });
        if (!dbProject) {
           dbProject = await prisma.courseProject.create({
              data: {
                 courseId: course.id,
                 title: `${course.title} Projects`,
                 requirements: JSON.stringify(problemsData), // storing all problems here for now
                 submissionType: "code"
              }
           });
        }
      }
    }
  }

  console.log('Migration completed.');
  console.log(`Migrated courses: ${migratedCourses}`);
  console.log(`Lessons inserted: ${totalLessons}`);
  console.log(`Sample content: ${sampleContent?.substring(0, 300)}...`);
}

migrate().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
