// ─────────────────────────────────────────────────────────────────────────────
//  Data Layer — course content from /public/data/ JSON files.
//  Auth is handled by the backend API via authClient.ts.
//  Progress & submissions are persisted in localStorage.
// ─────────────────────────────────────────────────────────────────────────────
import { getMentorHint, getFailureAnalysis, getProgressiveHints, reviewStudentCode, type FailureAnalysisResult, type ProgressiveHints, type CodeReviewResult } from './mentor';
export type { FailureAnalysisResult, ProgressiveHints, CodeReviewCheck, CodeReviewResult } from './mentor';
// ── Types (public API unchanged so pages need zero edits) ─────────────────────
export type Course = {
  id: number;
  slug: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: "Programming" | "Computer Science" | "Artificial Intelligence";
  language: "Python";
};
export type ProblemSummary = { id: number; slug: string; title: string; week_label: string; sort_order: number };
export type ProblemDetail = ProblemSummary & {
  course_slug: string;
  description: string;
  check50_slug: string;
  difficulty?: string;
  common_mistakes?: string[];
};
export type Lecture = { number: number; title: string; content: string };
export type ChatMsg = { role: string; content: string; created_at: string };

export { getToken, setToken, clearToken } from "./authClient";

// ── localStorage helpers ──────────────────────────────────────────────────────
const CHAT_KEY  = "fa_chat";

// ── Chat storage ─────────────────────────────────────────────────────────────
function getChatHistory(problemId: number | string): ChatMsg[] {
  try {
    const all: Record<string, ChatMsg[]> = JSON.parse(localStorage.getItem(CHAT_KEY) ?? "{}");
    return all[String(problemId)] ?? [];
  } catch { return []; }
}
function saveChatHistory(problemId: number | string, msgs: ChatMsg[]) {
  try {
    const all: Record<string, ChatMsg[]> = JSON.parse(localStorage.getItem(CHAT_KEY) ?? "{}");
    all[String(problemId)] = msgs;
    localStorage.setItem(CHAT_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

// ── Course index (loaded once) ────────────────────────────────────────────────
type RawCourse = {
  slug: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: "Programming" | "Computer Science" | "Artificial Intelligence";
  language: "Python";
};
type RawProblem = {
  id: string; title: string; description: string;
  check50_slug: string; difficulty?: string; common_mistakes?: string[];
};

let _courseIndex: RawCourse[] | null = null;
let _problemCounter = 1;
// Maps slug → array of ProblemSummary (populated lazily)
const _problemCache: Map<string, ProblemSummary[]>   = new Map();
const _problemDetailCache: Map<number, ProblemDetail> = new Map();
// Maps "slug/lectureNum" → Lecture
const _lectureCache: Map<string, Lecture[]> = new Map();

const BASE = import.meta.env.BASE_URL ?? "/";

async function fetchJson<T>(path: string): Promise<T> {
  // Normalise path so we never get double-slashes
  const url = BASE.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${path}`);
  return res.json() as Promise<T>;
}

async function loadCourseIndex(): Promise<RawCourse[]> {
  if (_courseIndex) return _courseIndex;
  _courseIndex = await fetchJson<RawCourse[]>("data/courses.json");
  return _courseIndex;
}

async function loadProblems(courseSlug: string): Promise<ProblemSummary[]> {
  if (_problemCache.has(courseSlug)) return _problemCache.get(courseSlug)!;

  const index = await loadCourseIndex();
  const course = index.find((c) => c.slug === courseSlug);
  if (!course) return [];

  // Fetch the per-course lecture manifest
  let lectureManifest: { number: number; label: string }[] = [];
  try {
    lectureManifest = await fetchJson<{ number: number; label: string }[]>(
      `data/${courseSlug}/lectures.json`
    );
  } catch { /* no manifest — fall back */ }

  const summaries: ProblemSummary[] = [];

  for (const lm of lectureManifest) {
    let rawProblems: RawProblem[] = [];
    try {
      rawProblems = await fetchJson<RawProblem[]>(
        `data/${courseSlug}/lecture_${lm.number}/problems.json`
      );
    } catch { /* lecture has no problems */ }

    let sortOrder = 0;
    for (const rp of rawProblems) {
      const globalId = _problemCounter++;
      const summary: ProblemSummary = {
        id: globalId,
        slug: rp.id,
        title: rp.title,
        week_label: lm.label,
        sort_order: sortOrder++,
      };
      summaries.push(summary);

      const detail: ProblemDetail = {
        ...summary,
        course_slug: courseSlug,
        description: rp.description,
        check50_slug: rp.check50_slug,
        difficulty: rp.difficulty,
        common_mistakes: rp.common_mistakes,
      };
      _problemDetailCache.set(globalId, detail);
    }
  }

  _problemCache.set(courseSlug, summaries);
  return summaries;
}

async function loadLectures(courseSlug: string): Promise<Lecture[]> {
  if (_lectureCache.has(courseSlug)) return _lectureCache.get(courseSlug)!;

  let lectureManifest: { number: number; label: string; title: string }[] = [];
  try {
    lectureManifest = await fetchJson<{ number: number; label: string; title: string }[]>(
      `data/${courseSlug}/lectures.json`
    );
  } catch { return []; }

  const lectures: Lecture[] = [];
  for (const lm of lectureManifest) {
    let content = "";
    try {
      const url = BASE.replace(/\/$/, "") + `/data/${courseSlug}/lecture_${lm.number}/notes.md`;
      const res = await fetch(url);
      if (res.ok) content = await res.text();
    } catch { /* no notes */ }
    lectures.push({ number: lm.number, title: lm.title, content });
  }

  _lectureCache.set(courseSlug, lectures);
  return lectures;
}

// ── Public API (same shape as the old api object) ─────────────────────────────
export const api = {
  // ── Courses ───────────────────────────────────────────────────────────────
  courses: async (): Promise<Course[]> => {
    const index = await loadCourseIndex();
    return index.map((c, i) => ({
      id: i + 1,
      slug: c.slug,
      title: c.title,
      description: c.description,
      level: c.level,
      category: c.category,
      language: c.language,
    }));
  },

  courseProblems: (slug: string) => loadProblems(slug),

  courseLectures: (slug: string) => loadLectures(slug),

  // ── Problem detail ────────────────────────────────────────────────────────
  problem: async (id: number): Promise<ProblemDetail> => {
    // Ensure the course problems are loaded (populates _problemDetailCache)
    const index = await loadCourseIndex();
    for (const c of index) {
      if (!_problemCache.has(c.slug)) await loadProblems(c.slug);
    }
    const detail = _problemDetailCache.get(id);
    if (!detail) throw new Error("Problem not found");
    return detail;
  },

  // ── Mentor chat (Problem-aware Socratic hints, powered by mentor.ts) ──────────
  chat: async (problemId: number | string, message: string, _studentCode: string | null): Promise<{ reply: string }> => {
    await new Promise((r) => setTimeout(r, 600));
    
    // Get problem details to extract course and lecture
    const problemDetail = _problemDetailCache.get(Number(problemId));
    const courseSlug = problemDetail?.course_slug ?? 'cs50p';
    
    // Extract lecture number from problem (stored in common_mistakes or derived from slug)
    // For now, use a simple heuristic: problems are numbered sequentially
    let lectureNum = 0;
    if (problemDetail) {
      // Count how many problems come before this one in the same course
      const courseProblems = _problemDetailCache.size > 0 
        ? Array.from(_problemDetailCache.values()).filter(p => p.course_slug === courseSlug)
        : [];
      const problemIndex = courseProblems.findIndex(p => p.id === Number(problemId));
      lectureNum = Math.floor(problemIndex / 5); // Rough estimate: 5 problems per lecture
    }

    const existing = getChatHistory(problemId);

    // Get mentor hint
    const hintResponse = getMentorHint({
      courseSlug,
      lectureNum,
      problemSlug: problemDetail?.slug ?? String(problemId),
      studentCode: _studentCode ?? "",
      message,
      historyCount: existing.length,
    });

    // Format response
    let reply = hintResponse.hint;
    
    // Add special handling for positive feedback
    if (hintResponse.type === 'positive' && hintResponse.isCorrect) {
      // Keep the positive message as-is
    }

    const userMsg: ChatMsg  = { role: "user",   content: message, created_at: new Date().toISOString() };
    const asstMsg: ChatMsg  = { role: "assistant", content: reply, created_at: new Date().toISOString() };
    saveChatHistory(problemId, [...existing, userMsg, asstMsg]);

    return { reply };
  },

  chatHistory: async (problemId: number | string): Promise<ChatMsg[]> => {
    return getChatHistory(problemId);
  },

  getFailureAnalysis: (code: string, problemSlug: string): FailureAnalysisResult => {
    return getFailureAnalysis(code, problemSlug);
  },

  getProgressiveHints: (problemSlug: string): ProgressiveHints => {
    return getProgressiveHints(problemSlug);
  },

  reviewStudentCode: (code: string, problemSlug: string): CodeReviewResult => {
    return reviewStudentCode(code, problemSlug);
  },
};

// ── DEPRECATED: Progress & Streaks Helpers (use backend APIs instead) ────────────
// These localStorage-based helpers are deprecated. The backend now manages progress.
// See useProgress() hook for backend-backed progress tracking.

export function getCompletedProjects(): Record<string, boolean> {
  console.warn('getCompletedProjects is deprecated. Use backend APIs via useProgress.');
  try {
    return JSON.parse(localStorage.getItem("fa_completed_projects") ?? "{}");
  } catch {
    return {};
  }
}

export function saveCompletedProject(courseSlug: string, projectId: string, completed: boolean = true) {
  console.warn('saveCompletedProject is deprecated. Use backend API /progress/lecture/problem instead.');
  try {
    const key = `${courseSlug}/${projectId}`;
    const all = getCompletedProjects();
    if (completed) {
      all[key] = true;
    } else {
      delete all[key];
    }
    localStorage.setItem("fa_completed_projects", JSON.stringify(all));
  } catch { /* ignore */ }
}

export function getCompletedQuizzes(): Record<string, number> {
  console.warn('getCompletedQuizzes is deprecated. Use backend APIs via useProgress.');
  try {
    return JSON.parse(localStorage.getItem("fa_completed_quizzes") ?? "{}");
  } catch {
    return {};
  }
}

export function saveCompletedQuiz(courseSlug: string, lectureNum: number, score: number) {
  console.warn('saveCompletedQuiz is deprecated. Use backend API /progress/lecture/quiz instead.');
  try {
    const key = `${courseSlug}_${lectureNum}`;
    const all = getCompletedQuizzes();
    all[key] = score;
    localStorage.setItem("fa_completed_quizzes", JSON.stringify(all));
  } catch { /* ignore */ }
}



export function getStreak(): { count: number; lastDate: string | null } {
  try {
    const count = Number(localStorage.getItem("fa_streak_count") ?? "0");
    const lastDate = localStorage.getItem("fa_last_submission_date");
    return { count, lastDate };
  } catch {
    return { count: 0, lastDate: null };
  }
}

export function updateStreak() {
  const todayStr = new Date().toISOString().split("T")[0];
  const { count, lastDate } = getStreak();
  if (lastDate === todayStr) {
    return;
  }
  
  let newCount = 1;
  if (lastDate) {
    const last = new Date(lastDate);
    const today = new Date(todayStr);
    const diffTime = today.getTime() - last.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      newCount = count + 1;
    }
  }
  localStorage.setItem("fa_streak_count", String(newCount));
  localStorage.setItem("fa_last_submission_date", todayStr);
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export function getBadges(completedCount: number, streak: number): Badge[] {
  return [
    {
      id: "first_step",
      title: "First Steps",
      description: "Completed your first coding problem",
      icon: "🌱",
      unlocked: completedCount >= 1,
    },
    {
      id: "pythonista",
      title: "Pythonista",
      description: "Completed 5 or more coding problems",
      icon: "🐍",
      unlocked: completedCount >= 5,
    },
    {
      id: "streak_star",
      title: "Streak Star",
      description: "Maintained a streak of 3 or more days",
      icon: "🔥",
      unlocked: streak >= 3,
    },
    {
      id: "master",
      title: "Master Hacker",
      description: "Completed 10 or more coding problems",
      icon: "🏆",
      unlocked: completedCount >= 10,
    }
  ];
}

// ── XP & Gamification Helpers ──────────────────────────────────────────────────
export function getTotalXp(): number {
  try {
    return Number(localStorage.getItem("fa_total_xp") ?? "0");
  } catch {
    return 0;
  }
}

export function addXp(amount: number) {
  const current = getTotalXp();
  localStorage.setItem("fa_total_xp", String(current + amount));
}

export interface ProjectMetadata {
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: string;
  tags: string[];
  xp: number;
}

export function getProjectMetadata(projectId: string, customDifficulty?: string): ProjectMetadata {
  const defaultMeta: Record<string, Omit<ProjectMetadata, "difficulty" | "xp">> = {
    // Lecture 0
    "indoor_voice": { tags: ["Strings", "User Input", "Methods"], estimatedTime: "10 min" },
    "playback_speed": { tags: ["Strings", "Replace", "Formatting"], estimatedTime: "10 min" },
    "making_faces": { tags: ["Functions", "Strings", "Emojis"], estimatedTime: "15 min" },
    "einstein": { tags: ["Math", "Variables", "Constants"], estimatedTime: "20 min" },
    "tip_calculator": { tags: ["Functions", "Floats", "Types"], estimatedTime: "25 min" },
    // Lecture 1
    "deep_thought": { tags: ["Conditionals", "Logic", "Strings"], estimatedTime: "15 min" },
    "home_federal": { tags: ["Conditionals", "Strings", "Methods"], estimatedTime: "20 min" },
    "file_extensions": { tags: ["Conditionals", "Strings", "MIME Types"], estimatedTime: "25 min" },
    "math_interpreter": { tags: ["Conditionals", "Math", "Parsing"], estimatedTime: "30 min" },
    "meal_time": { tags: ["Conditionals", "Functions", "Floats"], estimatedTime: "35 min" },
    // Lecture 2
    "camel_case": { tags: ["Loops", "Strings", "Case Conversion"], estimatedTime: "25 min" },
    "coke_machine": { tags: ["Loops", "State", "Math"], estimatedTime: "30 min" },
    "just_setting_up": { tags: ["Loops", "Strings", "Vowels"], estimatedTime: "20 min" },
    "nutrition_facts": { tags: ["Dictionaries", "Loops", "Lookups"], estimatedTime: "25 min" },
    "vanity_plates": { tags: ["Loops", "Functions", "Validation"], estimatedTime: "40 min" },
    // Lecture 3
    "fuel": { tags: ["Exceptions", "Try-Except", "Fractions"], estimatedTime: "30 min" },
    "taqueria": { tags: ["Exceptions", "Dictionaries", "EOF Handling"], estimatedTime: "25 min" },
    "grocery": { tags: ["Exceptions", "Lists", "Sorting"], estimatedTime: "35 min" },
    "outdated": { tags: ["Exceptions", "Strings", "Date Parsing"], estimatedTime: "40 min" },
    // Lecture 4
    "emojize": { tags: ["Libraries", "Third-party", "Emojis"], estimatedTime: "15 min" },
    "figlet": { tags: ["Libraries", "CLI Arguments", "ASCII Art"], estimatedTime: "30 min" },
    "adieu": { tags: ["Libraries", "Lists", "Formatting"], estimatedTime: "20 min" },
    "game": { tags: ["Libraries", "Random", "Loops"], estimatedTime: "25 min" },
    "professor": { tags: ["Libraries", "Math", "State Machine"], estimatedTime: "45 min" },
    "bitcoin": { tags: ["Libraries", "API", "JSON", "HTTP Requests"], estimatedTime: "40 min" },
    // Lecture 6
    "lines": { tags: ["File I/O", "File Reading", "Parsing"], estimatedTime: "30 min" },
    "pizza": { tags: ["File I/O", "CSV", "Formatting Tables"], estimatedTime: "30 min" },
    "scourgify": { tags: ["File I/O", "CSV", "DictReader/DictWriter"], estimatedTime: "40 min" },
    "shirt": { tags: ["File I/O", "Pillow", "Image Processing"], estimatedTime: "45 min" },
    // Lecture 7
    "numb3rs": { tags: ["Regex", "Validation", "IP Addresses"], estimatedTime: "35 min" },
    "watch": { tags: ["Regex", "HTML Parsing", "URLs"], estimatedTime: "30 min" },
    "working": { tags: ["Regex", "Time Parsing", "Validation"], estimatedTime: "45 min" },
    "um": { tags: ["Regex", "Word Boundaries", "Substrings"], estimatedTime: "25 min" },
    "response": { tags: ["Regex", "Libraries", "Email Validation"], estimatedTime: "20 min" },
    // Lecture 8
    "seasons": { tags: ["OOP", "Datetime", "Unit Tests"], estimatedTime: "40 min" },
    "jar": { tags: ["OOP", "Classes", "Methods", "Properties"], estimatedTime: "40 min" },
    "shirtificate": { tags: ["OOP", "FPDF", "PDF Generation"], estimatedTime: "45 min" }
  };

  const rawDiff = customDifficulty || "easy";
  let difficulty: "Easy" | "Medium" | "Hard" = "Easy";
  if (rawDiff.toLowerCase() === "medium" || rawDiff.toLowerCase() === "moderate") {
    difficulty = "Medium";
  } else if (rawDiff.toLowerCase() === "hard" || rawDiff.toLowerCase() === "difficult") {
    difficulty = "Hard";
  }

  const xpValues = { Easy: 50, Medium: 100, Hard: 150 };
  const xp = xpValues[difficulty];

  const matched = defaultMeta[projectId];
  if (matched) {
    return {
      difficulty,
      xp,
      estimatedTime: matched.estimatedTime,
      tags: matched.tags,
    };
  }

  // Fallback metadata
  return {
    difficulty,
    xp,
    estimatedTime: difficulty === "Easy" ? "15 min" : difficulty === "Medium" ? "30 min" : "45 min",
    tags: ["Python", "Programming"],
  };
}

// ── XP Level System ─────────────────────────────────────────────────────────────
export function getXpLevel(totalXp: number): { level: number; currentXp: number; xpToNext: number; progress: number } {
  const levels = [
    { level: 1, xpRequired: 0 },
    { level: 2, xpRequired: 100 },
    { level: 3, xpRequired: 250 },
    { level: 4, xpRequired: 500 },
    { level: 5, xpRequired: 1000 },
    { level: 6, xpRequired: 2000 },
    { level: 7, xpRequired: 3500 },
    { level: 8, xpRequired: 5000 },
    { level: 9, xpRequired: 7500 },
    { level: 10, xpRequired: 10000 },
  ];

  let currentLevel = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 100;

  for (let i = 0; i < levels.length; i++) {
    if (totalXp >= levels[i].xpRequired) {
      currentLevel = levels[i].level;
      xpForCurrentLevel = levels[i].xpRequired;
      xpForNextLevel = levels[i + 1]?.xpRequired || levels[i].xpRequired;
    }
  }

  const currentXp = totalXp - xpForCurrentLevel;
  const xpToNext = xpForNextLevel - xpForCurrentLevel;
  const progress = xpToNext > 0 ? Math.round((currentXp / xpToNext) * 100) : 100;

  return { level: currentLevel, currentXp, xpToNext, progress };
}

// ── Submission History for Heatmap ─────────────────────────────────────────────
export interface SubmissionRecord {
  date: string;
  count: number;
}

export function getSubmissionHistory(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem("fa_submission_history") ?? "{}");
  } catch {
    return {};
  }
}

export function recordSubmission() {
  const todayStr = new Date().toISOString().split("T")[0];
  const history = getSubmissionHistory();
  history[todayStr] = (history[todayStr] || 0) + 1;
  localStorage.setItem("fa_submission_history", JSON.stringify(history));
}

// ── Daily Missions ─────────────────────────────────────────────────────────────
export interface DailyMission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
}

export function getDailyMissions(): DailyMission[] {
  const todayStr = new Date().toISOString().split("T")[0];
  const missionsKey = `fa_daily_missions_${todayStr}`;
  
  try {
    const stored = localStorage.getItem(missionsKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Fall through to create new missions
  }

  // Create new daily missions
  const completedProjects = getCompletedProjects();
  const streak = getStreak();
  const totalXp = getTotalXp();

  const missions: DailyMission[] = [
    {
      id: "solve_one",
      title: "Solve 1 coding problem",
      description: "Complete at least one problem today",
      target: 1,
      current: Object.values(completedProjects).filter(Boolean).length,
      xpReward: 25,
      completed: false,
    },
    {
      id: "earn_xp",
      title: "Earn 25 XP",
      description: "Gain 25 XP from solving problems",
      target: 25,
      current: totalXp,
      xpReward: 50,
      completed: false,
    },
    {
      id: "maintain_streak",
      title: "Maintain streak",
      description: "Keep your daily streak alive",
      target: 1,
      current: streak.count >= 1 ? 1 : 0,
      xpReward: 30,
      completed: streak.count >= 1,
    },
  ];

  localStorage.setItem(missionsKey, JSON.stringify(missions));
  return missions;
}

export function updateDailyMissions() {
  const missions = getDailyMissions();
  const streak = getStreak();
  const totalXp = getTotalXp();
  const todayStr = new Date().toISOString().split("T")[0];

  let updated = false;

  missions.forEach((mission) => {
    if (mission.completed) return;

    if (mission.id === "solve_one") {
      const todaySubmissions = getSubmissionHistory()[todayStr] || 0;
      if (todaySubmissions >= mission.target) {
        mission.current = todaySubmissions;
        mission.completed = true;
        updated = true;
      }
    } else if (mission.id === "earn_xp") {
      if (totalXp >= mission.target) {
        mission.current = totalXp;
        mission.completed = true;
        updated = true;
      }
    } else if (mission.id === "maintain_streak") {
      if (streak.count >= mission.target) {
        mission.current = streak.count;
        mission.completed = true;
        updated = true;
      }
    }
  });

  if (updated) {
    const missionsKey = `fa_daily_missions_${todayStr}`;
    localStorage.setItem(missionsKey, JSON.stringify(missions));
  }
}

// ── Enhanced Badges with Progress ───────────────────────────────────────────────
export interface BadgeWithProgress extends Badge {
  progress: number;
  xpReward: number;
  target: number;
  current: number;
}

export function getBadgesWithProgress(completedCount: number, streak: number): BadgeWithProgress[] {
  const badges = [
    {
      id: "first_step",
      title: "First Steps",
      description: "Completed your first coding problem",
      icon: "🌱",
      unlocked: completedCount >= 1,
      progress: Math.min(100, (completedCount / 1) * 100),
      xpReward: 50,
      target: 1,
      current: completedCount,
    },
    {
      id: "pythonista",
      title: "Pythonista",
      description: "Completed 5 or more coding problems",
      icon: "🐍",
      unlocked: completedCount >= 5,
      progress: Math.min(100, (completedCount / 5) * 100),
      xpReward: 100,
      target: 5,
      current: completedCount,
    },
    {
      id: "streak_star",
      title: "Streak Star",
      description: "Maintained a streak of 3 or more days",
      icon: "🔥",
      unlocked: streak >= 3,
      progress: Math.min(100, (streak / 3) * 100),
      xpReward: 75,
      target: 3,
      current: streak,
    },
    {
      id: "master",
      title: "Master Hacker",
      description: "Completed 10 or more coding problems",
      icon: "🏆",
      unlocked: completedCount >= 10,
      progress: Math.min(100, (completedCount / 10) * 100),
      xpReward: 200,
      target: 10,
      current: completedCount,
    },
    {
      id: "speed_runner",
      title: "Speed Runner",
      description: "Complete 20 problems",
      icon: "⚡",
      unlocked: completedCount >= 20,
      progress: Math.min(100, (completedCount / 20) * 100),
      xpReward: 300,
      target: 20,
      current: completedCount,
    },
  ];

  return badges;
}

// ── DEPRECATED: Mock Leaderboard (use backend API instead) ────────────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  streak: number;
}

export function getLeaderboard(): LeaderboardEntry[] {
  console.warn('getLeaderboard is deprecated. Use backend API /progress/leaderboard instead.');
  // Return empty array - LeaderboardPage now uses backend API
  return [];
}
