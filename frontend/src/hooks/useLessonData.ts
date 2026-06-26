import { useEffect, useState } from 'react';
import type { LessonData, QuizQuestion, CodingProblem, TestCase } from '../types/lesson';

const BASE = import.meta.env.BASE_URL ?? '/';

function url(path: string): string {
  return BASE.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(url(path));
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

type RawProblem = {
  id: string;
  title: string;
  description: string;
  difficulty?: string;
  check50_slug?: string;
  starterCode?: string;
  solution?: string;
  testCases?: TestCase[];
};

export interface UseLessonDataResult {
  lessonData: LessonData | null;
  loading: boolean;
  error: string | null;
}

export function useLessonData(
  courseSlug: string | undefined,
  lectureNumber: number | string | undefined
): UseLessonDataResult {
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseSlug || lectureNumber === undefined) {
      setLoading(false);
      return;
    }

    const num = Number(lectureNumber);

    setLoading(true);
    setError(null);
    setLessonData(null);

    (async () => {
      try {
        let lesson: LessonData | null = null;
        
        // 1. Try DB first
        try {
          // In api.ts, authFetch is exported. We'll import it if needed.
          // Since useLessonData doesn't import authFetch, we will use it directly.
          // Wait, we need to import authFetch at the top. Let's assume it's imported or we'll fetch it manually.
          const { authFetch } = await import('../api');
          const dbRes = await authFetch<any>(`/courses/${courseSlug}/lessons/${num}`);
          if (dbRes && dbRes.content) {
            const parsedBlocks = JSON.parse(dbRes.content);
            // Transform legacy or new blocks into LessonData structure
            // LessonData expects { sections: [ { title: "", blocks: [] } ] }
            // For now, wrap all blocks in one section
            lesson = {
              title: dbRes.title,
              description: "",
              sections: [ { title: dbRes.title, blocks: parsedBlocks } ],
            } as LessonData;
          }
        } catch (dbErr) {
          // fallback
        }

        // 2. Try rich lesson.json if DB fails
        if (!lesson) {
          lesson = await fetchJson<LessonData>(
            `data/${courseSlug}/lecture_${num}/lesson.json`
          );
        }

        if (lesson) {
          // Merge quiz if not embedded
          if (!lesson.quiz || lesson.quiz.length === 0) {
            const quiz = await fetchJson<QuizQuestion[]>(
              `data/${courseSlug}/lecture_${num}/quiz.json`
            );
            if (quiz) lesson.quiz = quiz;
          }

          // Merge problems if not embedded
          if (!lesson.problems || lesson.problems.length === 0) {
            const rawProblems = await fetchJson<RawProblem[]>(
              `data/${courseSlug}/lecture_${num}/problems.json`
            );
            if (rawProblems) {
              const problems: CodingProblem[] = [];
              const projects: ProjectSummary[] = [];
              for (const p of rawProblems) {
                const difficulty = (['easy', 'medium', 'hard'].includes(p.difficulty ?? '') ? p.difficulty : 'easy') as 'easy' | 'medium' | 'hard';
                if (p.starterCode === undefined) {
                  projects.push({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    difficulty,
                  });
                } else {
                  problems.push({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    difficulty,
                    starterCode: p.starterCode,
                    solution: p.solution ?? '',
                    testCases: p.testCases ?? [],
                  });
                }
              }
              lesson.problems = problems;
              if (projects.length > 0) {
                lesson.projects = projects;
              }
            }
          }

          setLessonData(lesson);
        } else {
          // Signal caller to fall back to notes.md
          setError('no-lesson-json');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load lesson');
      } finally {
        setLoading(false);
      }
    })();
  }, [courseSlug, lectureNumber]);

  return { lessonData, loading, error };
}
