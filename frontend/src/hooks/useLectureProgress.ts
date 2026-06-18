import { useCallback, useEffect, useState } from 'react';
import { authFetch, getToken } from '../authClient';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001';

export interface SectionProgress {
  sectionIndex: number;
  isCompleted: boolean;
}

interface LectureData {
  sections: SectionProgress[];
  lectureCompleted: boolean;
  quizAttempt: { score: number; total: number; passed: boolean } | null;
}

async function apiCall<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers ?? {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const res = await fetch(`${BACKEND_URL}/api${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({})) as T;
  if (!res.ok) throw new Error("API Call Failed");
  return data as T;
}

export function useLectureProgress(courseSlug: string | undefined, lectureId: string | undefined) {
  const [sections, setSections] = useState<Record<number, boolean>>({});
  const [lectureCompleted, setLectureCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizTotal, setQuizTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!courseSlug || !lectureId) return;
    setLoading(true);
    try {
      const data = await apiCall<LectureData>(`/progress/lecture/${courseSlug}/${lectureId}`);
      const map: Record<number, boolean> = {};
      data.sections.forEach(p => {
        map[p.sectionIndex] = p.isCompleted;
      });
      setSections(map);
      setLectureCompleted(data.lectureCompleted);
      if (data.quizAttempt) {
        setQuizScore(data.quizAttempt.score);
        setQuizTotal(data.quizAttempt.total);
      }
    } catch (e) {
      console.error("Failed to fetch lecture progress", e);
    } finally {
      setLoading(false);
    }
  }, [courseSlug, lectureId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const markSectionComplete = useCallback(async (index: number) => {
    if (!courseSlug || !lectureId) return;
    setSections(prev => ({ ...prev, [index]: true }));
    try {
      await apiCall(`/progress/lecture/${courseSlug}/${lectureId}`, {
        method: 'PATCH',
        body: JSON.stringify({ sectionIndex: index, isCompleted: true })
      });
    } catch (e) {
      console.error("Failed to update section progress", e);
      setSections(prev => ({ ...prev, [index]: false }));
    }
  }, [courseSlug, lectureId]);

  const completeAction = useCallback(async (actionType: string, actionId: string) => {
    try {
      await authFetch('/progress/action', {
        method: 'POST',
        body: JSON.stringify({ actionType, actionId }),
      });
    } catch (e) {
      console.error(`[progress] action ${actionType} failed`, e);
    }
  }, []);

  const markQuizCompleted = useCallback(async (score: number, total: number) => {
    if (!courseSlug || !lectureId) return;
    setQuizScore(score);
    setQuizTotal(total);
    try {
      const data = await authFetch<{ passed: boolean }>('/progress/quiz', {
        method: 'POST',
        body: JSON.stringify({
          courseSlug,
          lectureId,
          quizId: `${courseSlug}-${lectureId}`,
          score,
          total,
        }),
      });
      if (data.passed) {
        await completeAction('quiz', `${courseSlug}:${lectureId}`);
      }
    } catch (e) {
      console.error('[progress] save quiz failed', e);
    }
  }, [courseSlug, lectureId, completeAction]);

  const markProblemCompleted = useCallback(async (problemId: string) => {
    if (!courseSlug || !lectureId) return;
    await completeAction('problem', problemId);
  }, [courseSlug, lectureId, completeAction]);

  const markLectureCompleted = useCallback(async (sectionCount: number) => {
    if (!courseSlug || !lectureId) return;
    const allDone = (() => {
      for (let i = 1; i <= sectionCount; i++) {
        if (!sections[i]) return false;
      }
      return true;
    })();
    if (!allDone) return;
    setLectureCompleted(true);
    try {
      await apiCall('/progress/lecture', {
        method: 'POST',
        body: JSON.stringify({ courseSlug, lectureId, hasProject: false })
      });
      await completeAction('lecture', `${courseSlug}:${lectureId}`);
    } catch (e) {
      console.error('[progress] save lecture completion failed', e);
    }
  }, [courseSlug, lectureId, sections, completeAction]);

  return {
    sections,
    lectureCompleted,
    quizScore,
    quizTotal,
    loading,
    markSectionComplete,
    markQuizCompleted,
    markProblemCompleted,
    markLectureCompleted,
    isSectionCompleted: (index: number) => !!sections[index],
    isLectureCompleted: (sectionCount: number) => {
      if (sectionCount <= 0) return false;
      for (let i = 1; i <= sectionCount; i++) {
        if (!sections[i]) return false;
      }
      return true;
    },
  };
}

export function useCourseProgress(courseSlug: string | undefined) {
  const [lectureCompletions, setLectureCompletions] = useState<Record<string, { lectureCompleted: boolean; completedSections: number }>>({});

  const fetchCourseProgress = useCallback(async () => {
    if (!courseSlug) return;
    try {
      const data = await apiCall<{ sections: any[]; lectureCompletions: { lectureId: string }[] }>(`/progress/course/${courseSlug}`);
      const completedLectureIds = new Set(data.lectureCompletions.map((l: any) => l.lectureId));

      const sectionMap: Record<string, number> = {};
      data.sections.forEach((p: any) => {
        if (p.isCompleted) {
          sectionMap[p.lectureId] = (sectionMap[p.lectureId] || 0) + 1;
        }
      });

      const result: Record<string, { lectureCompleted: boolean; completedSections: number }> = {};
      Object.keys(sectionMap).forEach(lectureId => {
        result[lectureId] = {
          completedSections: sectionMap[lectureId],
          lectureCompleted: completedLectureIds.has(lectureId),
        };
      });

      completedLectureIds.forEach(id => {
        if (!result[id]) {
          result[id] = { lectureCompleted: true, completedSections: 0 };
        }
      });

      setLectureCompletions(result);
    } catch (e) {
      console.error("Failed to fetch course progress", e);
    }
  }, [courseSlug]);

  useEffect(() => {
    fetchCourseProgress();
  }, [fetchCourseProgress]);

  return {
    lectureCompletions,
    refreshCourseProgress: fetchCourseProgress,
    isLectureUnlocked: (lectureNumber: number) => {
      if (lectureNumber <= 1) return true;
      const prev = lectureCompletions[String(lectureNumber - 1)];
      return prev?.lectureCompleted ?? false;
    }
  };
}
