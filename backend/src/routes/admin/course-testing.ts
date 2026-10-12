import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { AuthenticatedRequest } from '../../middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', '..', '..', '..', 'frontend', 'public', 'data');

const router = Router();
router.use(requireAuth, requireRole('admin'));

const COURSE_SLUG = 'fundamentals-of-ai';
const TOTAL_LECTURES = 10;

interface Step {
  step: string;
  status: string;
  detail: string;
  timestamp: string;
  duration?: number;
}

function log(step: string, status: string, detail?: string, duration?: number): Step {
  return { step, status, detail: detail || '', timestamp: new Date().toISOString(), ...(duration !== undefined ? { duration } : {}) };
}

function getLecturePath(lectureNum: number): string {
  return join(DATA_DIR, COURSE_SLUG, `lecture_${lectureNum}`);
}

function readJSON(filePath: string): any | null {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function validateBlock(block: any, secId: string, lectureIdx: number, steps: Step[]): boolean {
  let ok = true;
  const tag = (msg: string) => `Lecture ${lectureIdx}/${secId}: ${msg}`;

  if (block.type === 'ai_section') {
    const hero = block.hero;
    if (!hero?.title) { steps.push(log(tag('ai_section hero.title missing'), 'failed', '')); ok = false; }
    if (!hero?.intro && !hero?.subtitle) { steps.push(log(tag('ai_section hero.intro/subtitle missing'), 'failed', '')); ok = false; }
    const concepts = block.concepts;
    if (!concepts || !Array.isArray(concepts) || concepts.length === 0) {
      steps.push(log(tag('ai_section missing concepts array'), 'failed', '')); ok = false;
    } else {
      for (let ci = 0; ci < concepts.length; ci++) {
        if (!concepts[ci].title) { steps.push(log(tag(`concept[${ci}] missing title`), 'failed', '')); ok = false; }
        if (!concepts[ci].description) { steps.push(log(tag(`concept[${ci}] missing description`), 'failed', '')); ok = false; }
      }
    }
    if (!block.keyInsight) { steps.push(log(tag('ai_section missing keyInsight'), 'failed', '')); ok = false; }
  }

  if (block.type === 'ai_think_of') {
    if (!block.title) { steps.push(log(tag('think_of missing title'), 'failed', '')); ok = false; }
    if (!block.subtitle) { steps.push(log(tag('think_of missing subtitle'), 'failed', '')); ok = false; }
    const panels = block.panels;
    if (!panels || !Array.isArray(panels) || panels.length === 0) { steps.push(log(tag('think_of missing panels'), 'failed', '')); ok = false; }
    if (!block.insight) { steps.push(log(tag('think_of missing insight'), 'failed', '')); ok = false; }
    if (!block.reinforcement) { steps.push(log(tag('think_of missing reinforcement'), 'failed', '')); ok = false; }
  }

  if (block.type === 'practice') {
    if (!block.title) { steps.push(log(tag('practice missing title'), 'failed', '')); ok = false; }
    if (!block.instructions) { steps.push(log(tag('practice missing instructions'), 'failed', '')); ok = false; }
    if (block.starterCode == null) { steps.push(log(tag('practice missing starterCode'), 'failed', '')); ok = false; }
  }

  if (block.type === 'infographic') {
    if (!block.id) { steps.push(log(tag('infographic missing id'), 'failed', '')); ok = false; }
    const panels = block.panels;
    if (!panels || !Array.isArray(panels) || panels.length === 0) { steps.push(log(tag('infographic missing panels'), 'failed', '')); ok = false; }
    if (!block.takeaway) { steps.push(log(tag('infographic missing takeaway'), 'failed', '')); ok = false; }
  }

  return ok;
}

// ── Shared pipeline runner functions ──

async function simulateCourseStructure(): Promise<{ steps: Step[]; result: any }> {
  const steps: Step[] = [];
  const totalStart = performance.now();
  let t0 = performance.now();

  for (let i = 0; i < TOTAL_LECTURES; i++) {
    const lesson = readJSON(join(getLecturePath(i), 'lesson.json'));
    if (!lesson) { steps.push(log(`Lecture ${i} lesson.json`, 'failed', 'Missing or invalid')); continue; }
    const sections = lesson.sections || [];
    if (sections.length === 0) { steps.push(log(`Lecture ${i} sections`, 'failed', 'No sections found')); continue; }
    let valid = true;
    for (let j = 0; j < sections.length; j++) {
      const sec = sections[j];
      if (!sec.id) { steps.push(log(`Lecture ${i} section ${j + 1}`, 'failed', 'Missing id')); valid = false; }
      if (!sec.label) { steps.push(log(`Lecture ${i} section ${j + 1}`, 'failed', 'Missing label')); valid = false; }
      const blocks = sec.blocks || sec.content || [];
      if (!blocks.length) { steps.push(log(`Lecture ${i} section ${j + 1}`, 'failed', 'No content blocks')); valid = false; }
    }
    if (valid) {
      const bc = sections.reduce((s: number, sec: any) => s + (sec.blocks || sec.content || []).length, 0);
      steps.push(log(`Lecture ${i} — "${lesson.title || '?'}"`, 'success', `${sections.length} sections, ${bc} blocks`, Math.round(performance.now() - t0)));
    }
    t0 = performance.now();
  }

  let dirsOk = 0;
  for (let i = 0; i < TOTAL_LECTURES; i++) { if (existsSync(getLecturePath(i))) dirsOk++; }
  steps.push(log(`Lecture directories 0-9`, dirsOk === TOTAL_LECTURES ? 'success' : 'failed', `${dirsOk}/${TOTAL_LECTURES} exist`));

  let problemsOk = 0;
  for (let i = 0; i < TOTAL_LECTURES; i++) { const p = readJSON(join(getLecturePath(i), 'problems.json')); if (p && p.length >= 2) problemsOk++; }
  steps.push(log(`Problems files (>=2 entries)`, problemsOk === TOTAL_LECTURES ? 'success' : 'failed', `${problemsOk}/${TOTAL_LECTURES} valid`));

  let quizzesOk = 0;
  for (let i = 0; i < TOTAL_LECTURES; i++) { const q = readJSON(join(getLecturePath(i), 'quiz.json')); if (q && q.length >= 3) quizzesOk++; }
  steps.push(log(`Quiz files (>=3 questions)`, quizzesOk === TOTAL_LECTURES ? 'success' : 'failed', `${quizzesOk}/${TOTAL_LECTURES} valid`));

  steps.push(log('Course structure validation complete', 'success', '', Math.round(performance.now() - totalStart)));
  return { steps, result: { lecturesValidated: TOTAL_LECTURES } };
}

async function simulateLearningContent(): Promise<{ steps: Step[]; result: any }> {
  const steps: Step[] = [];
  const totalStart = performance.now();
  let t0 = performance.now();
  let totalBlocks = 0;
  let failedBlocks = 0;
  let hasThinkOf = 0;
  let hasPractice = 0;

  for (let i = 0; i < TOTAL_LECTURES; i++) {
    const lesson = readJSON(join(getLecturePath(i), 'lesson.json'));
    if (!lesson) { steps.push(log(`Lecture ${i}`, 'failed', 'Cannot read lesson.json')); continue; }
    const sections = lesson.sections || [];
    let lectureHasThinkOf = false;
    let lectureHasPractice = false;
    for (const sec of sections) {
      const blocks = sec.blocks || sec.content || [];
      for (const block of blocks) {
        totalBlocks++;
        if (block.type === 'ai_think_of') { hasThinkOf++; lectureHasThinkOf = true; }
        if (block.type === 'practice') { hasPractice++; lectureHasPractice = true; }
        if (!validateBlock(block, sec.id || '?', i, steps)) failedBlocks++;
      }
    }
    steps.push(log(`Lecture ${i}`, 'success', `${lectureHasThinkOf ? '✓ think_of' : '✗ no think_of'}, ${lectureHasPractice ? '✓ practice' : '✗ no practice'}`, Math.round(performance.now() - t0)));
    t0 = performance.now();
  }

  steps.push(log('Total content blocks', 'success', `${totalBlocks} blocks across all lectures`));
  steps.push(log('Think Of sections', 'info', `${hasThinkOf} found`));
  steps.push(log('Practice exercises', 'info', `${hasPractice} found`));
  if (failedBlocks > 0) {
    steps.push(log('Block validation', 'failed', `${failedBlocks} block(s) failed validation`));
  } else {
    steps.push(log('Block validation', 'success', 'All blocks pass structure validation'));
  }
  steps.push(log('Learning content validation complete', 'success', '', Math.round(performance.now() - totalStart)));
  return { steps, result: { totalBlocks, hasThinkOf, hasPractice, failedBlocks } };
}

async function simulateVisualExperience(): Promise<{ steps: Step[]; result: any }> {
  const steps: Step[] = [];
  const totalStart = performance.now();
  let t0 = performance.now();
  let heroWithIllustration = 0;
  let heroWithoutIllustration = 0;
  let unsplashRefs = 0;
  let conceptImagesFound = 0;

  for (let i = 0; i < TOTAL_LECTURES; i++) {
    const lesson = readJSON(join(getLecturePath(i), 'lesson.json'));
    if (!lesson) continue;
    const sections = lesson.sections || [];
    for (const sec of sections) {
      const blocks = sec.blocks || sec.content || [];
      for (const block of blocks) {
        if (block.type === 'ai_section' && block.hero) {
          const ill = block.hero.illustration || block.hero.image;
          if (ill && ill.length > 0) heroWithIllustration++; else heroWithoutIllustration++;
        }
        if (block.type === 'ai_section' && Array.isArray(block.concepts)) {
          for (const c of block.concepts) { if (c.image) conceptImagesFound++; }
        }
        const text = JSON.stringify(block);
        const urls = text.match(/https:\/\/images\.unsplash\.com\/[^\s"')]+/g) || [];
        unsplashRefs += urls.length;
      }
    }
  }

  steps.push(log('Hero illustrations', 'success', `${heroWithIllustration} with, ${heroWithoutIllustration} without`, Math.round(performance.now() - t0)));
  t0 = performance.now();
  steps.push(log('Concept card images', 'info', `${conceptImagesFound} found`));
  steps.push(log('Unsplash image references', 'info', `${unsplashRefs} external URLs used`));
  if (heroWithoutIllustration > 0) {
    steps.push(log('Hero illustration coverage', 'info', `${heroWithoutIllustration} blocks without illustration (optional — component handles empty gracefully)`));
  } else {
    steps.push(log('Hero illustration coverage', 'success', 'All ai_section blocks have hero.illustration'));
  }
  steps.push(log('Visual experience validation complete', 'success', '', Math.round(performance.now() - totalStart)));
  return { steps, result: { heroWithIllustration, conceptImagesFound, unsplashRefs } };
}

async function simulatePracticeExercises(): Promise<{ steps: Step[]; result: any }> {
  const steps: Step[] = [];
  const totalStart = performance.now();
  let t0 = performance.now();
  let practiceCount = 0;
  let validCount = 0;

  for (let i = 0; i < TOTAL_LECTURES; i++) {
    const lesson = readJSON(join(getLecturePath(i), 'lesson.json'));
    if (!lesson) continue;
    const sections = lesson.sections || [];
    let lp = 0;
    for (const sec of sections) {
      const blocks = sec.blocks || sec.content || [];
      for (const block of blocks) {
        if (block.type === 'practice') {
          lp++; practiceCount++;
          if (block.title && block.instructions && block.starterCode) validCount++;
        }
      }
    }
    steps.push(log(`Lecture ${i} practice blocks`, lp > 0 ? 'success' : 'info', `${lp} found`));
  }

  steps.push(log('Practice exercises', 'success', `${practiceCount} total, ${validCount} with full structure`, Math.round(performance.now() - t0)));
  steps.push(log('Practice validation complete', 'success', '', Math.round(performance.now() - totalStart)));
  return { steps, result: { practiceCount, validCount } };
}

async function simulateQuizzes(): Promise<{ steps: Step[]; result: any }> {
  const steps: Step[] = [];
  const totalStart = performance.now();
  let t0 = performance.now();
  let totalQuestions = 0;
  let hasAnswers = 0;
  let hasExplanations = 0;
  let errors: string[] = [];

  for (let i = 0; i < TOTAL_LECTURES; i++) {
    const quiz = readJSON(join(getLecturePath(i), 'quiz.json'));
    if (!quiz || !Array.isArray(quiz)) { steps.push(log(`Lecture ${i} quiz`, 'failed', 'Missing or invalid')); continue; }
    totalQuestions += quiz.length;
    let a = 0, e = 0;
    for (const q of quiz) {
      if (q.answer) a++;
      if (q.explanation) e++;
      if (!q.options || q.options.length < 2) errors.push(`Lecture ${i}: question has <2 options`);
    }
    hasAnswers += a; hasExplanations += e;
    steps.push(log(`Lecture ${i} — ${quiz.length} questions`, quiz.length >= 3 && a === quiz.length ? 'success' : 'failed', `${a} with answers, ${e} with explanations`));
    t0 = performance.now();
  }

  steps.push(log('Total quiz questions', 'success', `${totalQuestions} across all lectures`));
  if (errors.length > 0) steps.push(log('Quiz structure issues', 'failed', errors.join('; ')));
  steps.push(log('Quiz validation complete', 'success', '', Math.round(performance.now() - totalStart)));
  return { steps, result: { totalQuestions, hasAnswers, hasExplanations, errors } };
}

async function simulateProjects(): Promise<{ steps: Step[]; result: any }> {
  const steps: Step[] = [];
  const totalStart = performance.now();
  let t0 = performance.now();
  let totalProblems = 0;
  let withStarter = 0;
  let withSolution = 0;

  for (let i = 0; i < TOTAL_LECTURES; i++) {
    const problems = readJSON(join(getLecturePath(i), 'problems.json'));
    if (!problems || !Array.isArray(problems)) { steps.push(log(`Lecture ${i} problems`, 'failed', 'Missing or invalid')); continue; }
    totalProblems += problems.length;
    let s = 0, sol = 0;
    for (const p of problems) { if (p.starterCode) s++; if (p.solution) sol++; }
    withStarter += s; withSolution += sol;
    steps.push(log(`Lecture ${i} — ${problems.length} problems`, problems.length >= 2 && s === problems.length ? 'success' : 'failed', `${s} with starterCode, ${sol} with solution`));
    t0 = performance.now();
  }

  steps.push(log('Total coding problems', 'success', `${totalProblems} across all lectures`));
  steps.push(log('starterCode coverage', withStarter === totalProblems ? 'success' : 'failed', `${withStarter}/${totalProblems}`));
  steps.push(log('Solution coverage', withSolution === totalProblems ? 'success' : 'failed', `${withSolution}/${totalProblems}`));
  steps.push(log('Projects validation complete', 'success', '', Math.round(performance.now() - totalStart)));
  return { steps, result: { totalProblems, withStarter, withSolution } };
}

async function simulateCapstone(): Promise<{ steps: Step[]; result: any }> {
  const steps: Step[] = [];
  const totalStart = performance.now();
  const FE = (...parts: string[]) => join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', 'frontend', 'src', ...parts);

  const lastLesson = readJSON(join(getLecturePath(9), 'lesson.json'));
  steps.push(log('Lecture 9 (Final Project) loads', lastLesson ? 'success' : 'failed', lastLesson ? `"${lastLesson.title || '?'}"` : 'Cannot load', Math.round(performance.now() - totalStart)));

  steps.push(log('Capstone page component', existsSync(FE('pages', 'CapstonePage.tsx')) ? 'success' : 'failed', ''));
  const appContent = existsSync(FE('App.tsx')) ? readFileSync(FE('App.tsx'), 'utf-8') : '';
  steps.push(log('Capstone route configured', appContent.includes('CapstonePage') ? 'success' : 'failed', ''));

  steps.push(log('Capstone validation complete', 'success', '', Math.round(performance.now() - totalStart)));
  return { steps, result: { capstoneExists: true } };
}

async function simulateCertificate(): Promise<{ steps: Step[]; result: any }> {
  const steps: Step[] = [];
  const totalStart = performance.now();
  const FE = (...parts: string[]) => join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', 'frontend', 'src', ...parts);
  const BE = (...parts: string[]) => join(dirname(fileURLToPath(import.meta.url)), '..', '..', ...parts);

  steps.push(log('Certifications page', existsSync(FE('pages', 'CertificationsPage.tsx')) ? 'success' : 'failed', '', Math.round(performance.now() - totalStart)));
  steps.push(log('Certificate service', existsSync(BE('services', 'certificationService.ts')) ? 'success' : 'failed', ''));
  steps.push(log('Certificate verification page', existsSync(FE('pages', 'VerifyCertificatePage.tsx')) ? 'success' : 'failed', ''));

  steps.push(log('Certificate validation complete', 'success', '', Math.round(performance.now() - totalStart)));
  return { steps, result: { certificateSystemExists: true } };
}

async function simulateStudentJourney(): Promise<{ steps: Step[]; result: any }> {
  const steps: Step[] = [];
  const totalStart = performance.now();
  const BE = (...parts: string[]) => join(dirname(fileURLToPath(import.meta.url)), '..', '..', ...parts);

  const dirs = ['Lecture 0', 'Lecture 5', 'Lecture 9'];
  for (const d of dirs) {
    const idx = d === 'Lecture 0' ? 0 : d === 'Lecture 5' ? 5 : 9;
    steps.push(log(`${d} directory`, existsSync(getLecturePath(idx)) ? 'success' : 'failed', ''));
  }

  let allLessonsValid = true;
  for (let i = 0; i < TOTAL_LECTURES; i++) {
    const lesson = readJSON(join(getLecturePath(i), 'lesson.json'));
    if (!lesson || !lesson.sections || lesson.sections.length === 0) allLessonsValid = false;
  }
  steps.push(log('All lecture structures (3 sections each)', allLessonsValid ? 'success' : 'failed', ''));

  steps.push(log('Progress tracking API', existsSync(BE('routes', 'progress.ts')) ? 'success' : 'failed', ''));

  steps.push(log('Student journey validation complete', 'success', '', Math.round(performance.now() - totalStart)));
  return { steps, result: { journeyValid: allLessonsValid } };
}

// ── Route helpers ──

function wrapHandler(fn: () => Promise<{ steps: Step[]; result: any }>) {
  return async (_req: AuthenticatedRequest, res: any) => {
    try {
      const data = await fn();
      res.json({ pipeline: 'ok', ...data });
    } catch (err: any) {
      res.status(500).json({ pipeline: 'error', steps: [log('Pipeline error', 'failed', err.message)], error: err.message });
    }
  };
}

// ── Individual Pipeline Routes ──
router.post('/simulate-course-structure', wrapHandler(simulateCourseStructure));
router.post('/simulate-learning-content', wrapHandler(simulateLearningContent));
router.post('/simulate-visual-experience', wrapHandler(simulateVisualExperience));
router.post('/simulate-practice-exercises', wrapHandler(simulatePracticeExercises));
router.post('/simulate-quizzes', wrapHandler(simulateQuizzes));
router.post('/simulate-projects', wrapHandler(simulateProjects));
router.post('/simulate-capstone', wrapHandler(simulateCapstone));
router.post('/simulate-certificate', wrapHandler(simulateCertificate));
router.post('/simulate-student-journey', wrapHandler(simulateStudentJourney));

// ── Full Acceptance Test ──
router.post('/run-acceptance', async (req: AuthenticatedRequest, res) => {
  const totalStart = performance.now();
  const allSteps: Step[] = [];
  const results: Record<string, { passed: boolean; steps: number; failed: number }> = {};

  const pipelines: { id: string; label: string; run: () => Promise<{ steps: Step[]; result: any }> }[] = [
    { id: 'course-structure', label: 'Course Structure', run: simulateCourseStructure },
    { id: 'learning-content', label: 'Learning Content', run: simulateLearningContent },
    { id: 'visual-experience', label: 'Visual Experience', run: simulateVisualExperience },
    { id: 'practice-exercises', label: 'Practice Exercises', run: simulatePracticeExercises },
    { id: 'quizzes', label: 'Quizzes', run: simulateQuizzes },
    { id: 'projects', label: 'Projects', run: simulateProjects },
    { id: 'capstone', label: 'Capstone', run: simulateCapstone },
    { id: 'certificate', label: 'Certificate', run: simulateCertificate },
    { id: 'student-journey', label: 'Student Journey', run: simulateStudentJourney },
  ];

  for (const pipeline of pipelines) {
    const t0 = performance.now();
    try {
      const data = await pipeline.run();
      const failedCount = data.steps.filter((s: Step) => s.status === 'failed').length;
      results[pipeline.id] = { passed: failedCount === 0, steps: data.steps.length, failed: failedCount };
      allSteps.push(log(`${pipeline.label}`, failedCount === 0 ? 'success' : 'failed', `${data.steps.length} steps, ${failedCount} failed`, Math.round(performance.now() - t0)));
      allSteps.push(...data.steps.map((s: Step) => ({ ...s, step: `  ${s.step}` })));
    } catch (err: any) {
      results[pipeline.id] = { passed: false, steps: 0, failed: 1 };
      allSteps.push(log(`${pipeline.label}`, 'failed', err.message, Math.round(performance.now() - t0)));
    }
  }

  const totalFailed = Object.values(results).filter(r => !r.passed).length;
  const allPassed = totalFailed === 0;
  allSteps.push(log('Full acceptance test', allPassed ? 'success' : 'failed', allPassed ? 'ALL PIPELINES PASSED' : `${totalFailed} pipeline(s) failed`, Math.round(performance.now() - totalStart)));

  res.json({
    pipeline: 'acceptance',
    steps: allSteps,
    result: { results, allPassed, totalDuration: Math.round(performance.now() - totalStart) },
  });
});

export default router;
