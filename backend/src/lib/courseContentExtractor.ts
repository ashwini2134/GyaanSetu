import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Course Content Extractor
 * Extracts text content from LMS course JSON files for indexing into Qdrant
 */

export interface CourseMetadata {
  slug: string;
  title: string;
  description: string;
  level: string;
  category: string;
  language: string;
}

export interface LectureMetadata {
  number: number;
  label: string;
  title: string;
}

export interface LessonBlock {
  type: string;
  content?: string;
  title?: string;
  instructions?: string;
  [key: string]: any;
}

export interface LessonSection {
  id: string;
  label: string;
  blocks: LessonBlock[];
}

export interface Lesson {
  id: string;
  courseSlug: string;
  number: number;
  title: string;
  overview: string;
  sections: LessonSection[];
}

export interface ExtractedContent {
  courseId: string;
  courseTitle: string;
  lectureId: string;
  lectureTitle: string;
  sectionId?: string;
  sectionLabel?: string;
  content: string;
  contentType: 'course' | 'lecture' | 'section' | 'block';
}

/**
 * Get the path to the frontend data directory
 */
function getDataPath(): string {
  const candidates = [
    // Running from backend/src/lib or backend/dist/lib
    join(__dirname, '../../../frontend/public/data'),
    // Running from backend/ (process.cwd() = backend)
    join(process.cwd(), '../frontend/public/data'),
    // Running from repository root
    join(process.cwd(), 'frontend/public/data'),
    // Original fallback
    join(__dirname, '../../frontend/public/data'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate) && existsSync(join(candidate, 'courses.json'))) {
      return candidate;
    }
  }

  // Default to relative from __dirname
  return join(__dirname, '../../../frontend/public/data');
}

/**
 * Load courses.json
 */
export function loadCourses(): CourseMetadata[] {
  const coursesPath = join(getDataPath(), 'courses.json');
  if (!existsSync(coursesPath)) {
    return [];
  }
  const content = readFileSync(coursesPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Load lectures.json for a specific course
 */
export function loadLectures(courseSlug: string): LectureMetadata[] {
  const lecturesPath = join(getDataPath(), courseSlug, 'lectures.json');
  if (!existsSync(lecturesPath)) {
    return [];
  }
  const content = readFileSync(lecturesPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Load lesson.json for a specific lecture
 */
export function loadLesson(courseSlug: string, lectureNumber: number): Lesson | null {
  const lessonPath = join(getDataPath(), courseSlug, `lecture_${lectureNumber}`, 'lesson.json');
  if (!existsSync(lessonPath)) {
    return null;
  }
  const content = readFileSync(lessonPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Extract text content from a lesson block
 */
function extractBlockText(block: LessonBlock): string {
  const parts: string[] = [];

  // Main content field
  if (block.content && typeof block.content === 'string') {
    parts.push(block.content);
  }

  // Title
  if (block.title) {
    parts.push(block.title);
  }

  // Instructions (for practice exercises)
  if (block.instructions) {
    parts.push(block.instructions);
  }

  // Think-of analogy
  if (block.type === 'think_of' && block.analogy) {
    const analogy = block.analogy;
    if (analogy.description) parts.push(analogy.description);
    if (analogy.bullets) parts.push(analogy.bullets.join('\n'));
    if (analogy.highlightCard) parts.push(analogy.highlightCard);
  }

  // Code blocks - include code and explanations
  if (block.code) {
    if (block.code.code) parts.push(`Code:\n${block.code.code}`);
    if (block.code.highlights) parts.push(block.code.highlights.join('\n'));
    if (block.code.highlightCard) parts.push(block.code.highlightCard);
  }

  return parts.join('\n\n').trim();
}

/**
 * Extract all text content from a lesson
 */
export function extractLessonContent(
  course: CourseMetadata,
  lecture: LectureMetadata,
  lesson: Lesson
): ExtractedContent[] {
  const contents: ExtractedContent[] = [];

  // Course-level content
  contents.push({
    courseId: course.slug,
    courseTitle: course.title,
    lectureId: lesson.id,
    lectureTitle: lecture.title,
    content: `${course.title}: ${course.description}`,
    contentType: 'course',
  });

  // Lecture-level content (overview)
  contents.push({
    courseId: course.slug,
    courseTitle: course.title,
    lectureId: lesson.id,
    lectureTitle: lecture.title,
    content: `${lecture.title}: ${lesson.overview}`,
    contentType: 'lecture',
  });

  // Section-level content
  for (const section of lesson.sections) {
    const sectionText: string[] = [];

    for (const block of section.blocks) {
      const blockText = extractBlockText(block);
      if (blockText) {
        sectionText.push(blockText);
      }
    }

    if (sectionText.length > 0) {
      contents.push({
        courseId: course.slug,
        courseTitle: course.title,
        lectureId: lesson.id,
        lectureTitle: lecture.title,
        sectionId: section.id,
        sectionLabel: section.label,
        content: `${section.label}\n\n${sectionText.join('\n\n')}`,
        contentType: 'section',
      });
    }
  }

  return contents;
}

/**
 * Extract all content from a course
 */
export function extractCourseContent(courseSlug: string): ExtractedContent[] {
  const courses = loadCourses();
  const course = courses.find((c) => c.slug === courseSlug);
  if (!course) {
    return [];
  }

  const lectures = loadLectures(courseSlug);
  const allContent: ExtractedContent[] = [];

  for (const lecture of lectures) {
    const lesson = loadLesson(courseSlug, lecture.number);
    if (lesson) {
      const lessonContent = extractLessonContent(course, lecture, lesson);
      allContent.push(...lessonContent);
    }
  }

  return allContent;
}

/**
 * Extract content from all available courses
 */
export function extractAllCoursesContent(): ExtractedContent[] {
  const courses = loadCourses();
  const allContent: ExtractedContent[] = [];

  for (const course of courses) {
    const courseContent = extractCourseContent(course.slug);
    allContent.push(...courseContent);
  }

  return allContent;
}
