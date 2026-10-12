export type AchievementCategory =
  | "learning"
  | "practice"
  | "problems"
  | "quizzes"
  | "projects"
  | "consistency"
  | "xp"
  | "courses"
  | "portfolio"
  | "community";

export type BadgeColor =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "purple"
  | "blue"
  | "green"
  | "red";

// Closed set of metrics the evaluation engine computes per user. Keep this in
// sync with EvaluationContext in evaluationEngine.ts — every metric_gte
// condition in the catalog must reference one of these keys.
export type MetricKey =
  | "lecturesCompleted"
  | "practiceCompletedCount"
  | "problemsSolved"
  | "quizzesPassed"
  | "projectsSolved"
  | "milestonesCompleted"
  | "approvedProjectSubmissions"
  | "currentStreak"
  | "longestStreak"
  | "totalXp"
  | "coursesCompleted"
  | "portfolioProjectCount"
  | "portfolioScreenshotCount";

export interface EvaluationContext {
  userId: string;
  metrics: Record<MetricKey, number>;
  issuedCertificateSlugs: string[];
  hasPerfectQuizScore: boolean;
  hasApprovedCapstone: boolean;
  hasFirstRepo: boolean;
  distinctActiveDays: number;
  hasWeekendActivity: boolean;
  hasNightActivity: boolean;
  hasEarlyBirdActivity: boolean;
  hasPerfectWeek: boolean;
}

export type SimpleCondition = {
  kind: "metric_gte";
  metric: MetricKey;
  threshold: number;
};

export type CustomCondition = {
  kind: "custom";
  evaluate: (ctx: EvaluationContext) => boolean;
};

export type AchievementCondition = SimpleCondition | CustomCondition;

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  /** Lookup key resolved to a lucide-react icon component on the frontend. */
  icon: string;
  category: AchievementCategory;
  condition: AchievementCondition;
  xpReward?: number;
  badgeColor: BadgeColor;
  visibility: "visible" | "hidden";
}
