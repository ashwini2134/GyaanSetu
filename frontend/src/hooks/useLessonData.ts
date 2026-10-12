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
    // Vite's dev server (and most static hosts with SPA fallback) return
    // 200 + index.html for a path that doesn't exist as a real file, rather
    // than a 404 — so res.ok alone doesn't mean the JSON is real. Reject
    // non-JSON responses explicitly instead of letting JSON.parse throw
    // asynchronously after this try block has already returned (a rejection
    // there would bypass this catch and propagate as an unhandled error).
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json') && !contentType.includes('text/json')) {
      return null;
    }
    return (await res.json()) as T;
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
    let cancelled = false;

    setLoading(true);
    setError(null);
    setLessonData(null);

    (async () => {
      try {
        let lesson: LessonData | null = null;
        // 1. Try rich lesson.json first
        lesson = await fetchJson<LessonData>(
          `data/${courseSlug}/lecture_${num}/lesson.json`
        );

        if (cancelled) return;

        // 2. Try DB if static JSON fails
        if (!lesson) {
          try {
            const { authFetch } = await import('../api');
            const dbRes = await authFetch<any>(`/courses/${courseSlug}/lessons/${num}`);
            if (dbRes && dbRes.content) {
              const parsedBlocks = JSON.parse(dbRes.content);
              lesson = {
                title: dbRes.title,
                description: "",
                sections: [ { title: dbRes.title, blocks: parsedBlocks } ],
              } as LessonData;
            }
          } catch (dbErr) {
            // fallback
          }
        }

        if (cancelled) return;

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
                    type: p.type as any,
                    hints: p.hints,
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

          if (cancelled) return;
          setLessonData(lesson);
        } else {
          if (cancelled) return;
          setError('no-lesson-json');
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load lesson');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [courseSlug, lectureNumber]);

  return { lessonData, loading, error };
}
