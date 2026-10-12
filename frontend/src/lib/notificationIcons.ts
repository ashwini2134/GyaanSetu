import {
  Medal, BookOpen, Code2, ClipboardCheck, FolderGit2, Briefcase, BadgeCheck,
  MessageSquare, CalendarClock, Flame, Bell, CheckCircle, Sparkles, GraduationCap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Maps each backend NotifType string to a Lucide icon for the bell dropdown —
// the icon now carries the visual signal that emoji used to.
export const notificationIcons: Record<string, LucideIcon> = {
  achievement: Medal,
  course_update: GraduationCap,
  deadline: CalendarClock,
  quiz_result: ClipboardCheck,
  perfect_score: Sparkles,
  streak: Flame,
  message: MessageSquare,
  project_review: MessageSquare,
  project_approved: CheckCircle,
  project_rejected: FolderGit2,
  daily_mission: CalendarClock,
  lecture_completed: BookOpen,
  section_completed: BookOpen,
  practice_completed: Code2,
  problem_solved: Code2,
  milestone_started: FolderGit2,
  milestone_submitted: FolderGit2,
  milestone_approved: CheckCircle,
  capstone_submitted: FolderGit2,
  capstone_approved: CheckCircle,
  portfolio_updated: Briefcase,
  certificate_ready: BadgeCheck,
  weekly_xp_milestone: Sparkles,
  course_released: GraduationCap,
};

export function getNotificationIcon(type: string): LucideIcon {
  return notificationIcons[type] ?? Bell;
}

// Small closed set — badge colors reused for the priority dot in the bell.
export const PRIORITY_COLOR: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#94a3b8",
  normal: "#94a3b8",
};
