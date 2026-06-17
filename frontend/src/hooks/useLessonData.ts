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
        // Try rich lesson.json first
        const lesson = await fetchJson<LessonData>(
          `data/${courseSlug}/lecture_${num}/lesson.json`
        );

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
              for (const p of rawProblems) {
                if (p.starterCode === undefined) continue;
                const difficulty = (['easy', 'medium', 'hard'].includes(p.difficulty ?? '') ? p.difficulty : 'easy') as 'easy' | 'medium' | 'hard';
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
              lesson.problems = problems;
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
