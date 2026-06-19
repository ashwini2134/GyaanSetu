import { useEffect, useState } from 'react';
import { useAuth } from './auth';
import { authFetch } from './authClient';

// ── Constants & Keys ─────────────────────────────────────────────────────────
const EVENT_NAME = 'fraylon:progress:update';

// ── Types ────────────────────────────────────────────────────────────────────
export type AchievementDef = {
  id: string;
  title: string;
  icon: string;
  description: string;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_lecture', title: 'First Steps', icon: '🎯', description: 'Complete your first lecture' },
  { id: 'first_quiz', title: 'Quiz Master', icon: '🧠', description: 'Pass your first quiz' },
  { id: 'first_problem', title: 'Project Solver', icon: '🔥', description: 'Submit your first problem' },
  { id: 'five_lectures', title: 'Halfway There', icon: '⚡', description: 'Complete 5 lectures' },
  { id: 'ten_lectures', title: '10 Lectures Done', icon: '🏆', description: 'Complete 10 lectures' },
  { id: 'first_project', title: 'First Project Submitted', icon: '💎', description: 'Submit your first hands-on task' },
  { id: 'course_completed', title: 'Course Completed', icon: '🎓', description: 'Complete an entire course' },
];

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
}

// ── Toast Queue System ───────────────────────────────────────────────────────
let toastQueue: Array<{ text: string; type: 'xp' | 'achievement' | 'streak'; duration: number }> = [];
let isToastRunning = false;

function showToastNext() {
  if (isToastRunning || toastQueue.length === 0) return;
  isToastRunning = true;
  const toast = toastQueue.shift()!;
  
  let container = document.getElementById('fraylon-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'fraylon-toast-container';
    container.className = 'fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none';
    document.body.appendChild(container);
  }

  const el = document.createElement('div');
  el.className = `transform transition-all duration-300 translate-y-4 opacity-0 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-md text-white font-medium text-sm`;
  
  if (toast.type === 'xp') {
    el.classList.add('bg-cyan-950/90', 'border-cyan-500/50', 'shadow-cyan-500/20');
  } else if (toast.type === 'achievement') {
    el.classList.add('bg-amber-950/90', 'border-amber-500/50', 'shadow-amber-500/20');
  } else {
    el.classList.add('bg-orange-950/90', 'border-orange-500/50', 'shadow-orange-500/20');
  }

  el.innerHTML = `<span>${toast.text}</span>`;
  container.appendChild(el);

  // animate in
  requestAnimationFrame(() => {
    el.classList.remove('translate-y-4', 'opacity-0');
  });

  setTimeout(() => {
    // animate out
    el.classList.add('opacity-0', 'translate-x-4');
    setTimeout(() => {
      el.remove();
      isToastRunning = false;
      showToastNext();
    }, 300);
  }, toast.duration);
}

function queueToast(text: string, type: 'xp' | 'achievement' | 'streak', duration = 3000) {
  toastQueue.push({ text, type, duration });
  showToastNext();
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

async function unlockAchievement(id: string) {
  try {
    await authFetch('/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ achievementId: id })
    });
    
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (ach) {
      queueToast(`Achievement Unlocked — ${ach.title}!`, 'achievement', 3000);
    }
    emit(); // refetch from backend
  } catch (err) {
    console.error("Failed to unlock achievement", err);
  }
}

export async function checkAchievements() {
  try {
    const [resStats, resAch] = await Promise.all([
      authFetch<{ stats?: StatsData }>('/progress'),
      authFetch<{ achievements?: string[] }>('/achievements')
    ]);

    const stats = resStats.stats || {
      coursesStarted: 0,
      coursesCompleted: 0,
      lecturesCompleted: 0,
      quizzesPassed: 0,
      tasksSubmitted: 0,
      projectsSolved: 0,
    };

    const unlocked: string[] = resAch.achievements || [];

    if (stats.lecturesCompleted >= 1 && !unlocked.includes('first_lecture')) await unlockAchievement('first_lecture');
    if (stats.quizzesPassed >= 1 && !unlocked.includes('first_quiz')) await unlockAchievement('first_quiz');
    if (stats.tasksSubmitted >= 1 && !unlocked.includes('first_problem')) await unlockAchievement('first_problem');
    if (stats.tasksSubmitted >= 1 && !unlocked.includes('first_project')) await unlockAchievement('first_project'); // first hands on task
    if (stats.lecturesCompleted >= 5 && !unlocked.includes('five_lectures')) await unlockAchievement('five_lectures');
    if (stats.lecturesCompleted >= 10 && !unlocked.includes('ten_lectures')) await unlockAchievement('ten_lectures');
    if (stats.coursesCompleted >= 1 && !unlocked.includes('course_completed')) await unlockAchievement('course_completed');
  } catch (err) {
    console.error("Failed to check achievements", err);
  }
}

export async function completeAction(
  actionType: 'section' | 'lecture' | 'quiz' | 'problem' | 'course_start' | 'course_complete' | 'project',
  actionId: string
) {
  try {
    await authFetch('/progress/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionType, actionId })
    });

    checkAchievements();
    emit();
  } catch (err) {
    console.error("Failed to complete gamification action", err);
  }
}

export async function updateOverallProgress(totalLecturesAvailable: number) {
  try {
    const res = await authFetch<{ stats?: StatsData }>('/progress');
    const stats = res.stats || { lecturesCompleted: 0 };
    
    if (totalLecturesAvailable === 0) return 0;
    const pct = Math.min(100, Math.round((stats.lecturesCompleted / totalLecturesAvailable) * 100));
    
    await authFetch('/progress/overall', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overallProgress: pct })
    });
    
    emit();
    return pct;
  } catch (err) {
    console.error("Failed to update overall progress", err);
    return 0;
  }
}

// ── React Hooks ──────────────────────────────────────────────────────────────

export function useGamification() {
  const { user } = useAuth();
  const [data, setData] = useState({
    xp: 0,
    achievements: [] as string[],
    streak: { currentStreak: 0, lastLoginDate: null as string | null, longestStreak: 0 },
    stats: { coursesStarted: 0, coursesCompleted: 0, lecturesCompleted: 0, quizzesPassed: 0, tasksSubmitted: 0, projectsSolved: 0 },
    overallProgress: 0
  });

  useEffect(() => {
    async function loadGamification() {
      if (!user) return;
      try {
        const [resXp, resAch, resStreak, resStats, resOverall] = await Promise.all([
          authFetch<{ totalXp?: number }>('/xp'),
          authFetch<{ achievements?: string[] }>('/achievements'),
          authFetch<StreakData>('/streaks'),
          authFetch<{ stats?: StatsData }>('/progress'),
          authFetch<{ overallProgress?: number }>('/progress/overall')
        ]);
        
        const xp = resXp.totalXp || 0;
        const achievements = resAch.achievements || [];
        const streak = resStreak || { currentStreak: 0, lastLoginDate: null, longestStreak: 0 };
        const stats = resStats.stats || { coursesStarted: 0, coursesCompleted: 0, lecturesCompleted: 0, quizzesPassed: 0, tasksSubmitted: 0, projectsSolved: 0 };
        const overallProgress = resOverall.overallProgress || 0;

        setData({ xp, achievements, streak, stats, overallProgress });
      } catch (err) {
        console.error("Failed to load gamification data", err);
      }
    }

    loadGamification();

    const handler = () => {
      loadGamification();
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, [user]);

  return data;
}

// ── Initialization ───────────────────────────────────────────────────────────
// Run once on load to handle login streak
if (typeof window !== 'undefined') {
  setTimeout(() => handleDailyLogin(), 500); // delay slightly to let UI render first
}
