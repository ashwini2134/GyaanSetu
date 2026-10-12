import { useEffect, useState } from 'react';
import { useAuth } from './auth';
import { authFetch } from './authClient';
import { api } from './api';

// ── Constants & Keys ─────────────────────────────────────────────────────────
const EVENT_NAME = 'gyansetu:progress:update';
const LEGACY_EVENT_NAME = 'fraylon:progress:update';
const ACHIEVEMENT_EVENT = 'gyansetu:achievement:unlocked';
const LEGACY_ACHIEVEMENT_EVENT = 'fraylon:achievement:unlocked';

export type StreakData = {
  currentStreak: number;
  lastLoginDate: string | null;
  longestStreak: number;
};

export type StatsData = {
  coursesStarted: number;
  coursesCompleted: number;
  lecturesCompleted: number;
  quizzesPassed: number;
  tasksSubmitted: number;
  projectsSolved: number; // capstone submissions
};

// ── Core Helpers ─────────────────────────────────────────────────────────────
function emit() {
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
  window.dispatchEvent(new CustomEvent(LEGACY_EVENT_NAME));
}

function notifyAchievementsUnlocked(unlocked: unknown[]) {
  if (!unlocked || unlocked.length === 0) return;
  window.dispatchEvent(new CustomEvent(ACHIEVEMENT_EVENT, { detail: unlocked }));
  window.dispatchEvent(new CustomEvent(LEGACY_ACHIEVEMENT_EVENT, { detail: unlocked }));
}

// ── Gamification Actions ─────────────────────────────────────────────────────

export async function handleDailyLogin() {
  try {
    await authFetch('/streaks', { method: 'POST' });
    emit();
  } catch (err) {
    console.error("Failed to handle daily login", err);
  }
}

export async function completeAction(
  actionType: 'section' | 'lecture' | 'quiz' | 'problem' | 'course_start' | 'course_complete' | 'project',
  actionId: string,
  difficulty?: string
) {
  try {
    const res = await authFetch<{ ok: boolean; unlockedAchievements?: unknown[] }>('/progress/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionType, actionId, ...(difficulty && { difficulty }) })
    });

    notifyAchievementsUnlocked(res.unlockedAchievements || []);
    emit();
  } catch (err) {
    console.error("Failed to complete gamification action", err);
  }
}

export async function updateOverallProgress() {
  try {
    const [res, courses] = await Promise.all([
      authFetch<{ stats?: StatsData }>('/progress'),
      api.courses()
    ]);
    const stats = res.stats || { lecturesCompleted: 0 };

    let total = 0;
    for (const c of courses) {
      const lectures = await api.courseLectures(c.slug);
      total += lectures.length;
    }

    if (total === 0) {
      console.warn("[overallProgress] total lectures is 0 — cannot calculate");
      return 0;
    }
    const pct = Math.min(100, Math.round((stats.lecturesCompleted / total) * 100));
    console.log(`[overallProgress] ${stats.lecturesCompleted}/${total} = ${pct}%`);

    await authFetch('/progress/overall', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overallProgress: pct })
    });

    emit();
    return pct;
  } catch (err) {
    console.error("[overallProgress] failed:", err);
    return 0;
  }
}

// ── React Hooks ──────────────────────────────────────────────────────────────

export function useGamification() {
  const { user } = useAuth();
  const [data, setData] = useState({
    xp: 0,
    weeklyXp: 0,
    streak: { currentStreak: 0, lastLoginDate: null as string | null, longestStreak: 0 },
    stats: { coursesStarted: 0, coursesCompleted: 0, lecturesCompleted: 0, quizzesPassed: 0, tasksSubmitted: 0, projectsSolved: 0 },
    overallProgress: 0
  });

  useEffect(() => {
    async function loadGamification() {
      if (!user) return;
      try {
        const [resXp, resStreak, resStats, resOverall] = await Promise.all([
          authFetch<{ totalXp?: number; weeklyXp?: number }>('/xp'),
          authFetch<StreakData>('/streaks'),
          authFetch<{ stats?: StatsData }>('/progress'),
          authFetch<{ overallProgress?: number }>('/progress/overall')
        ]);

        const xp = resXp.totalXp || 0;
        const weeklyXp = resXp.weeklyXp || 0;
        const streak = resStreak || { currentStreak: 0, lastLoginDate: null, longestStreak: 0 };
        const stats = resStats.stats || { coursesStarted: 0, coursesCompleted: 0, lecturesCompleted: 0, quizzesPassed: 0, tasksSubmitted: 0, projectsSolved: 0 };
        const overallProgress = resOverall.overallProgress || 0;

        setData({ xp, weeklyXp, streak, stats, overallProgress });

        // If overallProgress is 0 but user has completed lectures,
        // calculate and save the correct value
        if (overallProgress === 0 && (stats.lecturesCompleted > 0 || stats.quizzesPassed > 0)) {
          updateOverallProgress();
        }
      } catch (err) {
        console.error("Failed to load gamification data", err);
      }
    }

    loadGamification();

    const handler = () => {
      loadGamification();
    };
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener(LEGACY_EVENT_NAME, handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener(LEGACY_EVENT_NAME, handler);
    };
  }, [user]);

  return data;
}

// ── Initialization ───────────────────────────────────────────────────────────
// Run once on load to handle login streak
if (typeof window !== 'undefined') {
  setTimeout(() => handleDailyLogin(), 500); // delay slightly to let UI render first
}
