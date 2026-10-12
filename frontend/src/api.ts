// ─────────────────────────────────────────────────────────────────────────────
//  Data Layer — course content from /public/data/ JSON files.
//  Auth is handled by the backend API via authClient.ts.
//  Progress is persisted in PostgreSQL via the backend API.
// ─────────────────────────────────────────────────────────────────────────────
import { getMentorHint, getFailureAnalysis, getProgressiveHints, reviewStudentCode, type FailureAnalysisResult, type ProgressiveHints, type CodeReviewResult } from './mentor';
export type { FailureAnalysisResult, ProgressiveHints, CodeReviewCheck, CodeReviewResult } from './mentor';
import { authFetch } from './authClient';
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

export { getToken, setToken, clearToken, authFetch } from "./authClient";

const CHAT_KEY  = "fa_chat";

// ── Chat storage ─────────────────────────────────────────────────────────────
async function getChatHistory(problemId: number | string): Promise<ChatMsg[]> {
  try {
    const res = await authFetch<ChatMsg[]>(`/chat/${problemId}`);
    return res;
  } catch { /* ignore */ }
  return [];
}

async function saveChatMessage(problemId: number | string, msg: ChatMsg) {
  try {
    await authFetch('/chat', {
      method: 'POST',
      body: JSON.stringify({
        problemId: String(problemId),
        role: msg.role,
        content: msg.content
      })
    });
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
      // A missing file can still come back 200 (SPA fallback serving
      // index.html) — only trust it if it's actually not HTML.
      if (res.ok && !(res.headers.get('content-type') ?? '').includes('text/html')) {
        content = await res.text();
      }
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
    const staticCourses = index.map((c, i) => ({
      id: i + 1,
      slug: c.slug,
      title: c.title,
      description: c.description,
      level: c.level as any,
      category: c.category as any,
      language: c.language as any,
    }));

    try {
      const dbCourses = await authFetch<any[]>("/courses");
      const mappedDbCourses = dbCourses.map((c: any, i: number) => ({
        id: staticCourses.length + i + 1,
        slug: c.slug || c.id,
        title: c.title,
        description: c.description || "",
        level: (c.difficulty || "Beginner") as any,
        category: (c.category || "Programming") as any,
        language: "English" as any,
      }));
      // Prioritize staticCourses for metadata (description, language, category) since DB might have defaults
      const merged = [...staticCourses, ...mappedDbCourses];
      const unique = merged.filter((c, i, arr) => 
        arr.findIndex(x => x.slug === c.slug) === i
      );
      return unique;
    } catch {
      return staticCourses;
    }
  },

  courseProblems: (slug: string) => loadProblems(slug),

  courseLectures: (slug: string) => loadLectures(slug),

  // ── Project counts per lecture ───────────────────────────────────────────
  lectureProjectsCounts: async (slug: string): Promise<Record<number, number>> => {
    const manifest = await fetchJson<{ number: number }[]>(`data/${slug}/lectures.json`);
    const counts: Record<number, number> = {};
    for (const lm of manifest) {
      try {
        const raw = await fetchJson<any[]>(`data/${slug}/lecture_${lm.number}/problems.json`);
        if (raw) counts[lm.number] = raw.filter((p: any) => !p.starterCode).length;
      } catch {
        counts[lm.number] = 0;
      }
    }
    return counts;
  },

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
    const courseSlug = problemDetail?.course_slug ?? 'python20';
    
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

    const existing = await getChatHistory(problemId);

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
    await saveChatMessage(problemId, userMsg);
    await saveChatMessage(problemId, asstMsg);
    
    // Clean up old localStorage keys only after backend calls are confirmed working
    try { localStorage.removeItem(CHAT_KEY); } catch {}

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

export async function getDailyMissions(): Promise<DailyMission[]> {
  try {
    const data = await authFetch<{ missions?: DailyMission[] }>('/daily-missions');
    return data.missions || [];
  } catch (err) {
    console.error("Failed to fetch daily missions", err);
  }
  return [];
}

export async function updateDailyMissions(missions: DailyMission[]) {
  try {
    await authFetch('/daily-missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missions })
    });
  } catch (err) {
    console.error("Failed to update daily missions", err);
  }
}

// ── Badges & Project Metadata ──────────────────────────────────────────────────
export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export function getBadges(completedCount: number, streak: number): Badge[] {
  return [
    { id: "first_step", title: "First Steps", description: "Completed your first coding problem", icon: "🌱", unlocked: completedCount >= 1 },
    { id: "pythonista", title: "Pythonista", description: "Completed 5 or more coding problems", icon: "🐍", unlocked: completedCount >= 5 },
    { id: "streak_star", title: "Streak Star", description: "Maintained a streak of 3 or more days", icon: "🔥", unlocked: streak >= 3 },
    { id: "master", title: "Master Hacker", description: "Completed 10 or more coding problems", icon: "🏆", unlocked: completedCount >= 10 },
  ];
}

export interface ProjectMetadata {
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: string;
  tags: string[];
  xp: number;
  concepts?: string[];
  learningGoal?: string;
}

export function getProjectMetadata(projectId: string, customDifficulty?: string): ProjectMetadata {
  const defaultMeta: Record<string, Omit<ProjectMetadata, "difficulty" | "xp">> = {
    "indoor_voice": { tags: ["Strings", "User Input", "Methods"], estimatedTime: "10 min" },
    "playback_speed": { tags: ["Strings", "Replace", "Formatting"], estimatedTime: "10 min" },
    "making_faces": { tags: ["Functions", "Strings", "Emojis"], estimatedTime: "15 min" },
    "einstein": { tags: ["Math", "Variables", "Constants"], estimatedTime: "20 min" },
    "tip_calculator": { tags: ["Functions", "Floats", "Types"], estimatedTime: "25 min" },
    "deep_thought": { tags: ["Conditionals", "Logic", "Strings"], estimatedTime: "15 min" },
    "home_federal": { tags: ["Conditionals", "Strings", "Methods"], estimatedTime: "20 min" },
    "file_extensions": { tags: ["Conditionals", "Strings", "MIME Types"], estimatedTime: "25 min" },
    "math_interpreter": { tags: ["Conditionals", "Math", "Parsing"], estimatedTime: "30 min" },
    "meal_time": { tags: ["Conditionals", "Functions", "Floats"], estimatedTime: "35 min" },
    "camel_case": { tags: ["Loops", "Strings", "Case Conversion"], estimatedTime: "25 min" },
    "coke_machine": { tags: ["Loops", "State", "Math"], estimatedTime: "30 min" },
    "just_setting_up": { tags: ["Loops", "Strings", "Vowels"], estimatedTime: "20 min" },
    "nutrition_facts": { tags: ["Dictionaries", "Loops", "Lookups"], estimatedTime: "25 min" },
    "vanity_plates": { tags: ["Loops", "Functions", "Validation"], estimatedTime: "40 min" },
    "fuel": { tags: ["Exceptions", "Try-Except", "Fractions"], estimatedTime: "30 min" },
    "taqueria": { tags: ["Exceptions", "Dictionaries", "EOF Handling"], estimatedTime: "25 min" },
    "grocery": { tags: ["Exceptions", "Lists", "Sorting"], estimatedTime: "35 min" },
    "outdated": { tags: ["Exceptions", "Strings", "Date Parsing"], estimatedTime: "40 min" },
    "emojize": { tags: ["Libraries", "Third-party", "Emojis"], estimatedTime: "15 min" },
    "figlet": { tags: ["Libraries", "CLI Arguments", "ASCII Art"], estimatedTime: "30 min" },
    "adieu": { tags: ["Libraries", "Lists", "Formatting"], estimatedTime: "20 min" },
    "game": { tags: ["Libraries", "Random", "Loops"], estimatedTime: "25 min" },
    "professor": { tags: ["Libraries", "Math", "State Machine"], estimatedTime: "45 min" },
    "bitcoin": { tags: ["Libraries", "API", "JSON", "HTTP Requests"], estimatedTime: "40 min" },
    "lines": { tags: ["File I/O", "File Reading", "Parsing"], estimatedTime: "30 min" },
    "pizza": { tags: ["File I/O", "CSV", "Formatting Tables"], estimatedTime: "30 min" },
    "scourgify": { tags: ["File I/O", "CSV", "DictReader/DictWriter"], estimatedTime: "40 min" },
    "shirt": { tags: ["File I/O", "Pillow", "Image Processing"], estimatedTime: "45 min" },
    "numb3rs": { tags: ["Regex", "Validation", "IP Addresses"], estimatedTime: "35 min" },
    "watch": { tags: ["Regex", "HTML Parsing", "URLs"], estimatedTime: "30 min" },
    "working": { tags: ["Regex", "Time Parsing", "Validation"], estimatedTime: "45 min" },
    "um": { tags: ["Regex", "Word Boundaries", "Substrings"], estimatedTime: "25 min" },
    "response": { tags: ["Regex", "Libraries", "Email Validation"], estimatedTime: "20 min" },
    "seasons": { tags: ["OOP", "Datetime", "Unit Tests"], estimatedTime: "40 min" },
    "jar": { tags: ["OOP", "Classes", "Methods", "Properties"], estimatedTime: "40 min" },
    "shirtificate": { tags: ["OOP", "FPDF", "PDF Generation"], estimatedTime: "45 min" },
    "story_generator": { tags: ["I/O", "f-Strings", "Variables"], estimatedTime: "20 min", concepts: ["input()", "variables", "print()", "f-strings"], learningGoal: "Use user input and variables to generate a simple story." },
    "rock_paper_scissors": { tags: ["Conditionals", "Random", "Loops"], estimatedTime: "30 min", concepts: ["if/elif/else", "comparison operators", "random.choice()"], learningGoal: "Build a rock-paper-scissors game using conditional logic." },
    "multiplication_explorer": { tags: ["Loops", "Nested Loops", "Formatting"], estimatedTime: "25 min", concepts: ["for loops", "range()", "nested loops", "formatted output"], learningGoal: "Generate a multiplication table using nested loops." },
    "guessing_game_project": { tags: ["While Loops", "Random", "Input Validation"], estimatedTime: "35 min", concepts: ["while loops", "break", "random.randint()", "input validation"], learningGoal: "Create a number guessing game with loop control." },
    "shopping_list": { tags: ["Lists", "Dictionaries", "Menu-Driven"], estimatedTime: "30 min", concepts: ["lists", "list methods", "menu-driven programs", "loops"], learningGoal: "Build an interactive shopping list manager." },
    "contact_book": { tags: ["Dictionaries", "CRUD", "Search"], estimatedTime: "35 min", concepts: ["dictionaries", "key-value pairs", "dict methods", "search"], learningGoal: "Create a contact book that stores and retrieves information." },
    "unit_converter": { tags: ["Functions", "Modular Design", "Math"], estimatedTime: "30 min", concepts: ["function definitions", "parameters", "return values", "modular design"], learningGoal: "Build a unit converter using reusable functions." },
    "text_analyzer": { tags: ["Strings", "Methods", "Frequency Analysis"], estimatedTime: "35 min", concepts: ["string methods", "character iteration", "frequency analysis", "slicing"], learningGoal: "Analyze text to count characters, words, and letter frequency." },
    "personal_diary": { tags: ["File I/O", "Persistence", "CRUD"], estimatedTime: "45 min", concepts: ["file reading/writing", "append mode", "persistence", "CRUD operations"], learningGoal: "Build a personal diary app that saves entries to files." },
    "grade_tracker": { tags: ["Functions", "Dictionaries", "File I/O", "Capstone"], estimatedTime: "60 min", concepts: ["functions", "dictionaries", "file I/O", "data processing", "capstone"], learningGoal: "Create a complete grade tracking system that reads, processes, and saves student grades." },
  };
  const rawDiff = customDifficulty || "easy";
  let difficulty: "Easy" | "Medium" | "Hard" = "Easy";
  if (rawDiff.toLowerCase() === "medium" || rawDiff.toLowerCase() === "moderate") difficulty = "Medium";
  else if (rawDiff.toLowerCase() === "hard" || rawDiff.toLowerCase() === "difficult") difficulty = "Hard";
  const xpValues = { Easy: 50, Medium: 100, Hard: 150 };
  const xp = xpValues[difficulty];
  const matched = defaultMeta[projectId];
  if (matched) return { difficulty, xp, estimatedTime: matched.estimatedTime, tags: matched.tags, concepts: matched.concepts ?? [], learningGoal: matched.learningGoal ?? '' };
  return { difficulty, xp, estimatedTime: difficulty === "Easy" ? "15 min" : difficulty === "Medium" ? "30 min" : "45 min", tags: ["Python", "Programming"], concepts: [], learningGoal: '' };
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
