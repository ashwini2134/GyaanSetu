import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../../../frontend/public/data");

export interface CourseLectureInfo {
  number: number;
  title: string;
}

const cache = new Map<string, CourseLectureInfo[]>();

// Reads the same lectures.json the frontend serves as a static asset —
// the backend has no DB-backed course catalog for these two courses, so
// this is the one authoritative source for "what lectures does this course
// have and in what display-numbered order" (used by the certification
// readiness breakdown, which needs real lecture numbers/titles per course).
export function getCourseLectures(courseSlug: string): CourseLectureInfo[] {
  const cached = cache.get(courseSlug);
  if (cached) return cached;

  const filePath = path.join(dataDir, courseSlug, "lectures.json");
  if (!fs.existsSync(filePath)) return [];

  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const lectures: CourseLectureInfo[] = raw.map((l: any) => ({ number: l.number, title: l.title }));
  cache.set(courseSlug, lectures);
  return lectures;
}

// fundamentals-of-ai's lecture folders/URLs are 1-indexed (lecture_1..
// lecture_10) but its internal quiz/lesson ids are 0-indexed
// (fundamentals-of-ai-lecture-0..9) — every other course is 0-indexed both
// ways. This converts a display lecture number to that internal index.
export function toInternalLectureIndex(courseSlug: string, displayNumber: number): number {
  return courseSlug === "fundamentals-of-ai" ? displayNumber - 1 : displayNumber;
}

const tryItBlockCountCache = new Map<string, number>();

// How many "Try It Yourself" (code_example) blocks a lecture actually has —
// the AI course's lesson renderer suppresses this block type entirely
// (LessonSection.tsx), so this is always 0 there, which correctly makes the
// try-it engagement requirement a no-op for that course rather than an
// unreachable one.
export function getTryItBlockCount(courseSlug: string, displayNumber: number): number {
  const key = `${courseSlug}:${displayNumber}`;
  const cached = tryItBlockCountCache.get(key);
  if (cached !== undefined) return cached;

  if (courseSlug === "fundamentals-of-ai") {
    tryItBlockCountCache.set(key, 0);
    return 0;
  }

  const filePath = path.join(dataDir, courseSlug, `lecture_${displayNumber}`, "lesson.json");
  if (!fs.existsSync(filePath)) {
    tryItBlockCountCache.set(key, 0);
    return 0;
  }

  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  let count = 0;
  for (const section of raw.sections ?? []) {
    for (const block of section.blocks ?? []) {
      if (block.type === "code_example") count++;
    }
  }
  tryItBlockCountCache.set(key, count);
  return count;
}

const problemIdsCache = new Map<string, string[]>();

// The real (non "_sim1"/"_sim2" auto-generated) problem ids a lecture
// requires. python20 embeds problems directly in lesson.json; fundamentals-
// of-ai keeps them in a sibling problems.json — same shape either way once
// read, just a different file to read from.
export function getRequiredProblemIds(courseSlug: string, displayNumber: number): string[] {
  const key = `${courseSlug}:${displayNumber}`;
  const cached = problemIdsCache.get(key);
  if (cached) return cached;

  let raw: any[] = [];
  if (courseSlug === "fundamentals-of-ai") {
    const filePath = path.join(dataDir, courseSlug, `lecture_${displayNumber}`, "problems.json");
    if (fs.existsSync(filePath)) raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } else {
    const filePath = path.join(dataDir, courseSlug, `lecture_${displayNumber}`, "lesson.json");
    if (fs.existsSync(filePath)) {
      const lesson = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      raw = lesson.problems ?? [];
    }
  }

  const ids = raw
    .filter((p: any) => typeof p?.id === "string" && !p.id.endsWith("_sim1") && !p.id.endsWith("_sim2"))
    .map((p: any) => p.id as string);
  problemIdsCache.set(key, ids);
  return ids;
}

const quizQuestionCountCache = new Map<string, number>();

// Whether a lecture has a quiz page at all — LecturePage.tsx only adds a
// quiz page to its pagination when lessonData.quiz has questions, so a
// lecture with none should never require a "passed quiz" to be considered
// complete (it would be permanently unsatisfiable).
export function getQuizQuestionCount(courseSlug: string, displayNumber: number): number {
  const key = `${courseSlug}:${displayNumber}`;
  const cached = quizQuestionCountCache.get(key);
  if (cached !== undefined) return cached;

  let count = 0;
  if (courseSlug === "fundamentals-of-ai") {
    const filePath = path.join(dataDir, courseSlug, `lecture_${displayNumber}`, "quiz.json");
    if (fs.existsSync(filePath)) {
      const quiz = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      count = Array.isArray(quiz) ? quiz.length : 0;
    }
  } else {
    const filePath = path.join(dataDir, courseSlug, `lecture_${displayNumber}`, "lesson.json");
    if (fs.existsSync(filePath)) {
      const lesson = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      count = Array.isArray(lesson.quiz) ? lesson.quiz.length : 0;
    }
  }
  quizQuestionCountCache.set(key, count);
  return count;
}
