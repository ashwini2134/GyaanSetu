import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LectureProgress, SectionProgress } from '../types/lesson';
import { getToken } from '../authClient';

const PROGRESS_CHANGE_EVENT = 'lms:progress-change';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001';

let _storeVersion = 0;
let _cache: Record<string, LectureProgress> = {};

// Simple in-memory cache (fallback if backend unavailable)
function readCache(): Record<string, LectureProgress> {
  return { ..._cache };
}

function writeCache(data: Record<string, LectureProgress>) {
  _cache = { ...data };
  _storeVersion++;
  window.dispatchEvent(new CustomEvent(PROGRESS_CHANGE_EVENT));
}

// Backend API calls
async function apiCall<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers ?? {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  const res = await fetch(`${BACKEND_URL}/api${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({})) as T;
  if (!res.ok) {
    console.warn(`API call failed: ${path}`, data);
    // Fail gracefully - continue with cache
  }
  return data as T;
}

async function fetchLectureProgress(courseSlug: string, lectureNumber: number): Promise<LectureProgress | null> {
  if (!getToken()) return null;
  try {
    const data = await apiCall<{ progress?: LectureProgress }>(`/progress/lecture/${courseSlug}/${lectureNumber}`);
    return data.progress ?? null;
  } catch {
    return null;
  }
}

function progressKey(courseSlug: string, lectureNumber: number) {
  return `${courseSlug}:${lectureNumber}`;
}

function defaultProgress(courseSlug: string, lectureNumber: number): LectureProgress {
  return {
    courseSlug,
    lectureNumber,
    sections: {},
    quizScore: null,
    quizCompleted: false,
    problemsCompleted: [],
    handsOnTaskCompleted: false,
    lectureCompleted: false,
    lastSection: 'overview',
  };
}

const _snapCache: Map<string, { version: number; value: LectureProgress | null }> = new Map();

function readSnapshot(key: string | null): LectureProgress | null {
  if (!key) return null;
  const cached = _snapCache.get(key);
  if (cached && cached.version === _storeVersion) return cached.value;
  const all = readCache();
  const value = all[key] ?? null;
  _snapCache.set(key, { version: _storeVersion, value });
  return value;
}

// ── Check if lecture should be auto-completed ────────────────────────────
function checkLectureCompletion(
  courseSlug: string,
  lectureNumber: number,
  totalSections: number,
  totalProblems: number,
  hasQuiz: boolean,
  hasProject?: boolean,
) {
  const all = readCache();
  const key = progressKey(courseSlug, lectureNumber);
  const prev = all[key];
  if (!prev || prev.lectureCompleted) return;

  const sectionsVisited = Object.values(prev.sections).filter(s => s.visited).length;

  const allSectionsVisited = sectionsVisited >= totalSections;
  const quizDone = !hasQuiz || prev.quizCompleted;
  const problemsDone = prev.problemsCompleted.length >= totalProblems;
  const projectDone = !hasProject || !!prev.projectCompleted;
  const summaryReached = prev.lastSection === 'summary';

  if (allSectionsVisited && quizDone && problemsDone && projectDone && summaryReached) {
    all[key] = { ...prev, lectureCompleted: true, handsOnTaskCompleted: true };
    writeCache(all);
  }
}

export function useProgress(courseSlug: string | undefined, lectureNumber: number | undefined) {
  const key = courseSlug && lectureNumber !== undefined ? progressKey(courseSlug, lectureNumber) : null;
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onChange = () => setVersion(v => v + 1);
    window.addEventListener('storage', onChange);
    window.addEventListener(PROGRESS_CHANGE_EVENT, onChange);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener(PROGRESS_CHANGE_EVENT, onChange);
    };
  }, []);

  // Load from backend on mount or when key changes
  useEffect(() => {
    if (!key || !courseSlug || lectureNumber === undefined) return;
    
    fetchLectureProgress(courseSlug, lectureNumber).then(progress => {
      if (progress) {
        const all = readCache();
        all[key] = progress;
        writeCache(all);
      }
    });
  }, [key, courseSlug, lectureNumber]);

  const snapshot = useMemo(() => readSnapshot(key), [key, version]);

  const progress: LectureProgress = snapshot ?? (courseSlug && lectureNumber !== undefined
    ? defaultProgress(courseSlug, lectureNumber)
    : defaultProgress('', 0));

  const updateProgress = useCallback((updater: (prev: LectureProgress) => LectureProgress) => {
    if (!key) return;
    const all = readCache();
    const prev = all[key] ?? defaultProgress(courseSlug ?? '', lectureNumber ?? 0);
    const next = updater(prev);
    if (next === prev) return;
    all[key] = next;
    writeCache(all);
  }, [key, courseSlug, lectureNumber]);

  const markSectionVisited = useCallback((sectionId: string) => {
    updateProgress(prev => {
      const existing: SectionProgress = prev.sections[sectionId] ?? {
        visited: false, practiceAttempted: false, practiceCompleted: false,
      };
      return {
        ...prev,
        lastSection: sectionId,
        sections: { ...prev.sections, [sectionId]: { ...existing, visited: true } },
      };
    });
    
    // Call backend API
    if (courseSlug && lectureNumber !== undefined) {
      apiCall(`/progress/lecture/section`, {
        method: 'POST',
        body: JSON.stringify({ courseSlug, lectureNumber, sectionId, lastSection: sectionId }),
      }).catch(err => console.warn('Failed to mark section visited', err));
      
      if (sectionId !== 'quiz' && sectionId !== 'problems') {
        import('../progress').then(m => m.completeAction('section', `${courseSlug}:${lectureNumber}:${sectionId}`));
      }
    }
  }, [updateProgress, courseSlug, lectureNumber]);

  const markPracticeAttempted = useCallback((sectionId: string) => {
    updateProgress(prev => {
      const existing: SectionProgress = prev.sections[sectionId] ?? {
        visited: true, practiceAttempted: false, practiceCompleted: false,
      };
      return {
        ...prev,
        sections: { ...prev.sections, [sectionId]: { ...existing, practiceAttempted: true } },
      };
    });
  }, [updateProgress]);

  const markPracticeCompleted = useCallback((sectionId: string) => {
    updateProgress(prev => {
      const existing: SectionProgress = prev.sections[sectionId] ?? {
        visited: true, practiceAttempted: true, practiceCompleted: false,
      };
      return {
        ...prev,
        sections: { ...prev.sections, [sectionId]: { ...existing, practiceCompleted: true } },
      };
    });
  }, [updateProgress]);

  const markQuizCompleted = useCallback((score: number, total: number = 5) => {
    updateProgress(prev => ({ ...prev, quizScore: score, quizCompleted: true }));
    
    // Call backend API
    if (courseSlug && lectureNumber !== undefined) {
      apiCall(`/progress/lecture/quiz`, {
        method: 'POST',
        body: JSON.stringify({ courseSlug, lectureNumber, score, total }),
      }).catch(err => console.warn('Failed to mark quiz completed', err));
      
      if (score / total >= 0.6) {
        import('../progress').then(m => m.completeAction('quiz', `${courseSlug}:${lectureNumber}`));
      }
    }
  }, [updateProgress, courseSlug, lectureNumber]);

  const markProblemCompleted = useCallback((problemId: string) => {
    updateProgress(prev => {
      if (prev.problemsCompleted.includes(problemId)) return prev;
      return { ...prev, problemsCompleted: [...prev.problemsCompleted, problemId] };
    });
    
    // Call backend API
    if (courseSlug && lectureNumber !== undefined) {
      apiCall(`/progress/lecture/problem`, {
        method: 'POST',
        body: JSON.stringify({ courseSlug, lectureNumber, problemId }),
      }).catch(err => console.warn('Failed to mark problem completed', err));
      
      import('../progress').then(m => m.completeAction('problem', problemId));
    }
  }, [updateProgress, courseSlug, lectureNumber]);

  const markHandsOnTaskCompleted = useCallback(() => {
    updateProgress(prev => ({ ...prev, handsOnTaskCompleted: true }));
  }, [updateProgress]);

  const markLectureCompleted = useCallback(() => {
    updateProgress(prev => {
      if (prev.lectureCompleted) return prev;
      return { ...prev, lectureCompleted: true, handsOnTaskCompleted: true };
    });
    
    // Call backend API
    if (courseSlug && lectureNumber !== undefined) {
      apiCall(`/progress/lecture/complete`, {
        method: 'POST',
        body: JSON.stringify({ courseSlug, lectureNumber, totalSections: 0, totalProblems: 0, hasQuiz: false }),
      }).catch(err => console.warn('Failed to mark lecture completed', err));
      
      import('../progress').then(m => m.completeAction('lecture', `${courseSlug}:${lectureNumber}`));
    }
  }, [updateProgress, courseSlug, lectureNumber]);

  // Auto-check lecture completion


  const visitedSections = useMemo(
    () => Object.values(progress.sections).filter(s => s.visited).length,
    [progress.sections],
  );

  const completedPractices = useMemo(
    () => Object.values(progress.sections).filter(s => s.practiceCompleted).length,
    [progress.sections],
  );

  return {
    progress,
    visitedSections,
    completedPractices,
    markSectionVisited,
    markPracticeAttempted,
    markPracticeCompleted,
    markQuizCompleted,
    markProblemCompleted,
    markHandsOnTaskCompleted,
    markLectureCompleted,
  };
}

// ── Utility: get progress for a course's lectures ────────────────────────────
export function getCourseProgress(courseSlug: string): Record<number, LectureProgress> {
  const all = readCache();
  const result: Record<number, LectureProgress> = {};
  for (const [k, v] of Object.entries(all)) {
    if (k.startsWith(`${courseSlug}:`)) {
      result[v.lectureNumber] = v;
    }
  }
  return result;
}

// ── Course stats ─────────────────────────────────────────────────────────────
export interface CourseStats {
  lecturesStarted: number;
  lecturesCompleted: number;
  quizzesPassed: number;
  handsOnTasksCompleted: number;
  totalLectures: number;
}

export function getCourseStats(courseSlug: string, totalLectures: number): CourseStats {
  const progress = getCourseProgress(courseSlug);
  let lecturesStarted = 0;
  let lecturesCompleted = 0;
  let quizzesPassed = 0;
  let handsOnTasksCompleted = 0;

  for (let n = 0; n < totalLectures; n++) {
    const p = progress[n];
    if (p) {
      const hasAnyActivity = p.lectureCompleted || p.quizCompleted ||
        p.handsOnTaskCompleted || Object.keys(p.sections).length > 0;
      if (hasAnyActivity) lecturesStarted++;
      if (p.lectureCompleted) lecturesCompleted++;
      if (p.quizCompleted) quizzesPassed++;
      if (p.handsOnTaskCompleted) handsOnTasksCompleted++;
    }
  }

  return { lecturesStarted, lecturesCompleted, quizzesPassed, handsOnTasksCompleted, totalLectures };
}

// ── Sequential unlocking (REVIEW_MODE enabled - bypasses prerequisite completion) ────────────────────────────────
const REVIEW_MODE = true;

// ── Sequential unlocking ─────────────────────────────────────────────────────
export function isLectureUnlocked(
  lectureNumber: number,
  courseProgress: Record<number, LectureProgress>,
): boolean {
  if (REVIEW_MODE) return true;
  if (lectureNumber === 0) return true;
  const prev = courseProgress[lectureNumber - 1];
  if (!prev) return false;
  return prev.lectureCompleted;
}

// ── Subscribe to progress changes ─────────────────────────────────────
export function subscribeToProgressChanges(cb: () => void) {
  window.addEventListener('storage', cb);
  window.addEventListener(PROGRESS_CHANGE_EVENT, cb);
  return () => {
    window.removeEventListener('storage', cb);
    window.removeEventListener(PROGRESS_CHANGE_EVENT, cb);
  };
}

export function getAllProgress(): Record<string, LectureProgress> {
  return readCache();
}

// ── Auto-complete check (called externally after mutations) ───────────────
export function tryAutoCompleteLecture(
  courseSlug: string,
  lectureNumber: number,
  totalSections: number,
  totalProblems: number,
  hasQuiz: boolean,
  hasProject?: boolean,
) {
  checkLectureCompletion(courseSlug, lectureNumber, totalSections, totalProblems, hasQuiz, hasProject);
}
