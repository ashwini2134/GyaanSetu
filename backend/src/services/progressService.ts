import { getDb } from "../db.js";

type SectionProgressRecord = {
  visited: boolean;
  practiceAttempted: boolean;
  practiceCompleted: boolean;
};

export interface LectureProgressRecord {
  courseSlug: string;
  lectureNumber: number;
  sections: Record<string, SectionProgressRecord>;
  quizScore: number | null;
  quizCompleted: boolean;
  problemsCompleted: string[];
  handsOnTaskCompleted: boolean;
  lectureCompleted: boolean;
  lastSection: string;
  updatedAt: string;
}

export interface ProgressSummary {
  lecturesCompleted: number;
  quizzesPassed: number;
  problemsSolved: number;
  projectsCompleted: number;
  xp: number;
  streak: number;
  lectureProgress: LectureProgressRecord[];
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function formatLectureProgress(row: any): LectureProgressRecord {
  return {
    courseSlug: row.course_slug,
    lectureNumber: row.lecture_number,
    sections: parseJson<Record<string, SectionProgressRecord>>(row.sections_json, {}),
    quizScore: row.quiz_score === null ? null : Number(row.quiz_score),
    quizCompleted: Boolean(row.quiz_completed),
    problemsCompleted: parseJson<string[]>(row.problems_completed_json, []),
    handsOnTaskCompleted: Boolean(row.hands_on_task_completed),
    lectureCompleted: Boolean(row.lecture_completed),
    lastSection: row.last_section ?? "",
    updatedAt: row.updated_at,
  };
}

export function getUserLectureProgress(userId: number, courseSlug?: string): LectureProgressRecord[] {
  const db = getDb();
  const query = courseSlug
    ? `SELECT * FROM lecture_progress WHERE user_id = ? AND course_slug = ? ORDER BY lecture_number ASC`
    : `SELECT * FROM lecture_progress WHERE user_id = ? ORDER BY course_slug ASC, lecture_number ASC`;
  const rows = courseSlug ? db.prepare(query).all(userId, courseSlug) : db.prepare(query).all(userId);
  return (rows as any[]).map(formatLectureProgress);
}

export function getLectureProgressEntry(userId: number, courseSlug: string, lectureNumber: number): LectureProgressRecord | null {
  const db = getDb();
  const row = db.prepare(
    `SELECT * FROM lecture_progress WHERE user_id = ? AND course_slug = ? AND lecture_number = ?`
  ).get(userId, courseSlug, lectureNumber);
  return row ? formatLectureProgress(row) : null;
}

export function upsertLectureProgress(
  userId: number,
  courseSlug: string,
  lectureNumber: number,
  partial: Partial<Omit<LectureProgressRecord, "courseSlug" | "lectureNumber" | "updatedAt">>
): LectureProgressRecord {
  const existing = getLectureProgressEntry(userId, courseSlug, lectureNumber);

  const sections = {
    ...(existing?.sections ?? {}),
    ...(partial.sections ?? {}),
  };

  const problemsCompleted = Array.from(
    new Set([...(existing?.problemsCompleted ?? []), ...(partial.problemsCompleted ?? [])])
  );

  const quizCompleted = partial.quizCompleted ?? existing?.quizCompleted ?? false;
  const quizScore = partial.quizScore ?? existing?.quizScore ?? null;
  const handsOnTaskCompleted = partial.handsOnTaskCompleted ?? existing?.handsOnTaskCompleted ?? false;
  const lectureCompleted = partial.lectureCompleted ?? existing?.lectureCompleted ?? false;
  const lastSection = partial.lastSection ?? existing?.lastSection ?? "";

  const db = getDb();
  db.prepare(
    `INSERT INTO lecture_progress (
      user_id,
      course_slug,
      lecture_number,
      sections_json,
      quiz_score,
      quiz_completed,
      problems_completed_json,
      hands_on_task_completed,
      lecture_completed,
      last_section,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, course_slug, lecture_number) DO UPDATE SET
      sections_json = excluded.sections_json,
      quiz_score = excluded.quiz_score,
      quiz_completed = excluded.quiz_completed,
      problems_completed_json = excluded.problems_completed_json,
      hands_on_task_completed = excluded.hands_on_task_completed,
      lecture_completed = excluded.lecture_completed,
      last_section = excluded.last_section,
      updated_at = datetime('now')`
  ).run(
    userId,
    courseSlug,
    lectureNumber,
    JSON.stringify(sections),
    quizScore,
    quizCompleted ? 1 : 0,
    JSON.stringify(problemsCompleted),
    handsOnTaskCompleted ? 1 : 0,
    lectureCompleted ? 1 : 0,
    lastSection
  );

  return getLectureProgressEntry(userId, courseSlug, lectureNumber)!;
}

export function addProjectSubmission(userId: number, courseSlug: string, projectId: string) {
  const db = getDb();
  db.prepare(
    `INSERT OR IGNORE INTO project_submissions (user_id, course_slug, project_id) VALUES (?, ?, ?)`
  ).run(userId, courseSlug, projectId);
  recordActivity(userId, "project_completed", { courseSlug, projectId });
}

export function getProjectSubmissions(userId: number) {
  const db = getDb();
  const rows = db
    .prepare(`SELECT course_slug, project_id, completed_at FROM project_submissions WHERE user_id = ? ORDER BY completed_at DESC`)
    .all(userId) as { course_slug: string; project_id: string; completed_at: string }[];
  return rows.map((row) => ({
    courseSlug: row.course_slug,
    projectId: row.project_id,
    completedAt: row.completed_at,
  }));
}

export function recordActivity(userId: number, activityType: string, meta: Record<string, unknown> = {}) {
  const db = getDb();
  db.prepare(
    `INSERT INTO user_activities (user_id, activity_type, meta_json, activity_date) VALUES (?, ?, ?, date('now'))`
  ).run(userId, activityType, JSON.stringify(meta));
}

export function getUserSummary(userId: number, courseSlug?: string): ProgressSummary {
  const db = getDb();
  const totals = db
    .prepare(
      `SELECT
         SUM(CASE WHEN activity_type = 'lecture_complete' THEN 1 ELSE 0 END) AS lecturesCompleted,
         SUM(CASE WHEN activity_type = 'quiz_passed' THEN 1 ELSE 0 END) AS quizzesPassed,
         SUM(CASE WHEN activity_type = 'problem_solved' THEN 1 ELSE 0 END) AS problemsSolved
       FROM user_activities
       WHERE user_id = ?`
    )
    .get(userId) as { lecturesCompleted: number | null; quizzesPassed: number | null; problemsSolved: number | null };

  const projects = db
    .prepare(`SELECT COUNT(*) AS count FROM project_submissions WHERE user_id = ?`)
    .get(userId) as { count: number };

  const lectureProgress = getUserLectureProgress(userId, courseSlug);
  const lecturesCompleted = totals.lecturesCompleted ?? 0;
  const quizzesPassed = totals.quizzesPassed ?? 0;
  const problemsSolved = totals.problemsSolved ?? 0;
  const projectsCompleted = projects.count ?? 0;
  const xp = lecturesCompleted * 50 + quizzesPassed * 30 + problemsSolved * 20 + projectsCompleted * 100;
  const streak = computeCurrentStreak(userId);

  return {
    lecturesCompleted,
    quizzesPassed,
    problemsSolved,
    projectsCompleted,
    xp,
    streak,
    lectureProgress,
  };
}

function computeCurrentStreak(userId: number): number {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT DISTINCT activity_date FROM user_activities WHERE user_id = ? ORDER BY activity_date DESC`
    )
    .all(userId) as { activity_date: string }[];

  const dates = rows.map((row) => row.activity_date);
  const today = new Date().toISOString().split("T")[0];
  let streak = 0;
  let cursor = new Date(today);

  while (true) {
    const day = cursor.toISOString().split("T")[0];
    if (!dates.includes(day)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getLeaderboard() {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT
         u.id,
         u.name,
         u.email,
         SUM(CASE WHEN ua.activity_type = 'lecture_complete' THEN 1 ELSE 0 END) AS lecturesCompleted,
         SUM(CASE WHEN ua.activity_type = 'quiz_passed' THEN 1 ELSE 0 END) AS quizzesPassed,
         SUM(CASE WHEN ua.activity_type = 'problem_solved' THEN 1 ELSE 0 END) AS problemsSolved,
         SUM(CASE WHEN ua.activity_type = 'project_completed' THEN 1 ELSE 0 END) AS projectsCompleted,
         COUNT(DISTINCT ua.activity_date) AS streak,
         SUM(
           CASE ua.activity_type
             WHEN 'lecture_complete' THEN 50
             WHEN 'quiz_passed' THEN 30
             WHEN 'problem_solved' THEN 20
             WHEN 'project_completed' THEN 100
             WHEN 'course_complete' THEN 200
             ELSE 0
           END
         ) AS score
       FROM users u
       LEFT JOIN user_activities ua ON ua.user_id = u.id
       GROUP BY u.id
       ORDER BY score DESC, projectsCompleted DESC, lecturesCompleted DESC
       LIMIT 20`
    )
    .all() as Array<{
      id: number;
      name: string;
      email: string;
      lecturesCompleted: number | null;
      quizzesPassed: number | null;
      problemsSolved: number | null;
      projectsCompleted: number | null;
      streak: number | null;
      score: number | null;
    }>;

  return rows.map((row, index) => ({
    rank: index + 1,
    name: row.name,
    email: row.email,
    lecturesCompleted: row.lecturesCompleted ?? 0,
    quizzesPassed: row.quizzesPassed ?? 0,
    problemsSolved: row.problemsSolved ?? 0,
    projectsCompleted: row.projectsCompleted ?? 0,
    streak: row.streak ?? 0,
    score: row.score ?? 0,
  }));
}
