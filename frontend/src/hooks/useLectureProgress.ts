import { useCallback, useEffect, useState } from 'react';
import { authFetch } from '../authClient';
import { updateOverallProgress } from '../progress';

export interface SectionProgress {
  sectionIndex: number;
  isCompleted: boolean;
}

interface LectureData {
  sections: SectionProgress[];
  lectureCompleted: boolean;
  projectCompleted: boolean;
  quizAttempt: { score: number; total: number; passed: boolean } | null;
}

export function useLectureProgress(courseSlug: string | undefined, lectureId: string | undefined) {
  const [sections, setSections] = useState<Record<number, boolean>>({});
  const [lectureCompleted, setLectureCompleted] = useState(false);
  const [projectCompleted, setProjectCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizTotal, setQuizTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!courseSlug || !lectureId) return;
    setLoading(true);
    setSections({});
    setLectureCompleted(false);
    setProjectCompleted(false);
    setQuizScore(null);
    setQuizTotal(null);
    try {
      const data = await authFetch<LectureData>(`/progress/lecture/${courseSlug}/${lectureId}`);
      const map: Record<number, boolean> = {};
      data.sections.forEach(p => {
        map[p.sectionIndex] = p.isCompleted;
      });
      setSections(map);
      setLectureCompleted(data.lectureCompleted);
      setProjectCompleted(data.projectCompleted || false);
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
    console.log("markSectionComplete called for index:", index);
    if (!courseSlug || !lectureId) return;
    setSections(prev => ({ ...prev, [index]: true }));
    try {
      console.log(`Sending PATCH request to /api/progress/lecture/${courseSlug}/${lectureId} for sectionIndex ${index}`);
      await authFetch(`/progress/lecture/${courseSlug}/${lectureId}`, {
        method: 'PATCH',
        body: JSON.stringify({ sectionIndex: index, isCompleted: true })
      });
      console.log("PATCH request successful");
    } catch (e) {
      console.error("Failed to update section progress", e);
      setSections(prev => ({ ...prev, [index]: false }));
    }
  }, [courseSlug, lectureId]);

  const completeAction = useCallback(async (actionType: string, actionId: string, difficulty?: string) => {
    try {
      const res = await authFetch<{ ok: boolean; unlockedAchievements?: unknown[] }>('/progress/action', {
        method: 'POST',
        body: JSON.stringify({ actionType, actionId, ...(difficulty && { difficulty }) }),
      });
      if (res.unlockedAchievements && res.unlockedAchievements.length > 0) {
        window.dispatchEvent(new CustomEvent('fraylon:achievement:unlocked', { detail: res.unlockedAchievements }));
      }
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

  const markProblemCompleted = useCallback(async (problemId: string, difficulty?: string) => {
    if (!courseSlug || !lectureId) return;
    await completeAction('problem', problemId, difficulty);
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
      await authFetch('/progress/lecture', {
        method: 'POST',
        body: JSON.stringify({ courseSlug, lectureId, hasProject: false })
      });
      await completeAction('lecture', `${courseSlug}:${lectureId}`);
      await updateOverallProgress();
    } catch (e) {
      console.error('[progress] save lecture completion failed', e);
    }
  }, [courseSlug, lectureId, sections, completeAction]);

  return {
    sections,
    lectureCompleted,
    projectCompleted,
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
  const [fullyCompletedLectures, setFullyCompletedLectures] = useState<Set<number>>(new Set());
  // Lets callers (e.g. LecturePage's lock-enforcement redirect) wait for
  // real data before deciding a lecture is locked — otherwise the first
  // render (before this fetch resolves) would see an empty completed-set
  // and wrongly redirect away from a lecture the student already unlocked.
  const [loaded, setLoaded] = useState(false);

  const fetchCourseProgress = useCallback(async () => {
    if (!courseSlug) return;
    try {
      const data = await authFetch<{ sections: any[]; lectureCompletions: { lectureId: string }[]; fullyCompletedLectures?: number[] }>(`/progress/course/${courseSlug}`);
      const completedLectureIds = new Set(data.lectureCompletions.map((l: any) => l.lectureId));
      setFullyCompletedLectures(new Set(data.fullyCompletedLectures ?? []));

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
    } finally {
      setLoaded(true);
    }
  }, [courseSlug]);

  useEffect(() => {
    fetchCourseProgress();
  }, [fetchCourseProgress]);

  // A lecture is unlocked once the one before it is FULLY complete —
  // sections watched, practice done, quiz passed, and every real problem
  // solved (not just "watched the sections"). The caller is responsible
  // for treating the course's actual first lecture as always unlocked,
  // since this hook doesn't know the course's lecture list. Memoized so
  // callers can safely put it in a useEffect dependency array without
  // that effect re-firing on every render.
  const isLectureUnlocked = useCallback(
    (lectureNumber: number) => fullyCompletedLectures.has(lectureNumber - 1),
    [fullyCompletedLectures]
  );

  return {
    lectureCompletions,
    refreshCourseProgress: fetchCourseProgress,
    isLectureUnlocked,
    loaded,
  };
}
