import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LectureProgress, SectionProgress } from '../types/lesson';

const STORAGE_KEY = 'lms:progress';
const PROGRESS_CHANGE_EVENT = 'lms:progress-change';

let _storeVersion = 0;

function readAll(): Record<string, LectureProgress> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch { return {}; }
}

function writeAll(data: Record<string, LectureProgress>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  _storeVersion++;
  window.dispatchEvent(new CustomEvent(PROGRESS_CHANGE_EVENT));
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
  const all = readAll();
  const value = all[key] ?? null;
  _snapCache.set(key, { version: _storeVersion, value });
  return value;
}

function invalidateSnapshotCache() {
  _snapCache.clear();
}

// ── Check if lecture should be auto-completed ────────────────────────────
function checkLectureCompletion(
  courseSlug: string,
  lectureNumber: number,
  totalSections: number,
  totalProblems: number,
  hasQuiz: boolean,
) {
  const all = readAll();
  const key = progressKey(courseSlug, lectureNumber);
  const prev = all[key];
  if (!prev || prev.lectureCompleted) return;

  const sectionsVisited = Object.values(prev.sections).filter(s => s.visited).length;

  const allSectionsVisited = sectionsVisited >= totalSections;
  const quizDone = !hasQuiz || prev.quizCompleted;
  const problemsDone = prev.problemsCompleted.length >= totalProblems;
  const summaryReached = prev.lastSection === 'summary';

  if (allSectionsVisited && quizDone && problemsDone && summaryReached) {
    all[key] = { ...prev, lectureCompleted: true, handsOnTaskCompleted: true };
    writeAll(all);
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

  const snapshot = useMemo(() => readSnapshot(key), [key, version]);

  const progress: LectureProgress = snapshot ?? (courseSlug && lectureNumber !== undefined
    ? defaultProgress(courseSlug, lectureNumber)
    : defaultProgress('', 0));

  const updateProgress = useCallback((updater: (prev: LectureProgress) => LectureProgress) => {
    if (!key) return;
    const all = readAll();
    const prev = all[key] ?? defaultProgress(courseSlug ?? '', lectureNumber ?? 0);
    const next = updater(prev);
    if (next === prev) return;
    all[key] = next;
    writeAll(all);
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
    if (sectionId !== 'quiz' && sectionId !== 'problems') {
      import('../progress').then(m => m.completeAction('section', `${courseSlug}:${lectureNumber}:${sectionId}`));
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
    if (score / total >= 0.6) {
      import('../progress').then(m => m.completeAction('quiz', `${courseSlug}:${lectureNumber}`));
    }
  }, [updateProgress, courseSlug, lectureNumber]);

  const markProblemCompleted = useCallback((problemId: string) => {
    updateProgress(prev => {
      if (prev.problemsCompleted.includes(problemId)) return prev;
      return { ...prev, problemsCompleted: [...prev.problemsCompleted, problemId] };
    });
    if (lectureNumber === 9) {
      import('../progress').then(m => m.completeAction('project', problemId));
    } else {
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
    import('../progress').then(m => m.completeAction('lecture', `${courseSlug}:${lectureNumber}`));
  }, [updateProgress, courseSlug, lectureNumber]);

  // Auto-check lecture completion
  const totalSections = 0; // will be passed externally
  const totalProblems = 0;
  const hasQuiz = false;

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
  const all = readAll();
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

// ── Review mode flag (bypasses sequential lecture locking) ────────────────
// Set to `false` to re-enforce sequential lecture unlocking.
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
  return readAll();
}

// ── Auto-complete check (called externally after mutations) ───────────────
export function tryAutoCompleteLecture(
  courseSlug: string,
  lectureNumber: number,
  totalSections: number,
  totalProblems: number,
  hasQuiz: boolean,
) {
  checkLectureCompletion(courseSlug, lectureNumber, totalSections, totalProblems, hasQuiz);
}
