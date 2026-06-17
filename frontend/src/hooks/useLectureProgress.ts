import { useCallback, useEffect, useState } from 'react';
import { getToken } from '../authClient';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001';

export interface SectionProgress {
  sectionIndex: number;
  isCompleted: boolean;
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
  const [loading, setLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!courseSlug || !lectureId) return;
    setLoading(true);
    try {
      const data = await apiCall<SectionProgress[]>(`/progress/lecture/${courseSlug}/${lectureId}`);
      const map: Record<number, boolean> = {};
      data.forEach(p => {
        map[p.sectionIndex] = p.isCompleted;
      });
      setSections(map);
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
    // Optimistic UI update
    setSections(prev => ({ ...prev, [index]: true }));
    try {
      await apiCall(`/progress/lecture/${courseSlug}/${lectureId}`, {
        method: 'PATCH',
        body: JSON.stringify({ sectionIndex: index, isCompleted: true })
      });
    } catch (e) {
      console.error("Failed to update section progress", e);
      // Revert if failed (optional, but good practice)
      setSections(prev => ({ ...prev, [index]: false }));
    }
  }, [courseSlug, lectureId]);

  return {
    sections,
    loading,
    markSectionComplete,
    isSectionCompleted: (index: number) => !!sections[index],
    isLectureCompleted: (sectionCount: number) => {
      // A lecture is complete when all its sections are marked done
      // sectionCount is the actual number of sections in this lecture
      if (sectionCount <= 0) return false;
      for (let i = 1; i <= sectionCount; i++) {
        if (!sections[i]) return false;
      }
      return true;
    },
  };
}

export function useCourseProgress(courseSlug: string | undefined) {
  const [lectureCompletions, setLectureCompletions] = useState<Record<string, { totalSections: number; isCompleted: boolean; inProgress: boolean }>>({});
  
  const fetchCourseProgress = useCallback(async () => {
    if (!courseSlug) return;
    try {
      const data = await apiCall<any[]>(`/progress/lecture/${courseSlug}`);
      // Group by lectureId, track completed sections
      const map: Record<string, number> = {};
      data.forEach(p => {
        if (p.isCompleted) {
          map[p.lectureId] = (map[p.lectureId] || 0) + 1;
        }
      });
      const result: Record<string, { totalSections: number; isCompleted: boolean; inProgress: boolean }> = {};
      Object.keys(map).forEach(lectureId => {
        const sectionsDone = map[lectureId];
        result[lectureId] = {
          totalSections: sectionsDone,
          isCompleted: sectionsDone > 0,
          inProgress: sectionsDone > 0
        };
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
      // Lecture 0 (or 1) is always unlocked
      if (lectureNumber <= 1) return true;
      // To unlock N, N-1 must be completed
      const prev = lectureCompletions[String(lectureNumber - 1)];
      return prev?.isCompleted ?? false;
    }
  };
}
