import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, type Lecture } from "../api";
import { useCourseProgress } from "../hooks/useLectureProgress";
import { useAuth } from "../auth";
import { authFetch } from "../authClient";
import type { StatsData } from "../progress";
import { useRecentAchievements } from "../hooks/useAchievements";
import { getAchievementIcon } from "../lib/achievementIcons";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

type LectureStatus = "completed" | "in-progress" | "available" | "locked";

function ProgressCircle({ percent, size = 96 }: { percent: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-progress-track" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-brand-primary drop-shadow-sm" />
      </svg>
      <span className="absolute text-xl font-bold text-text-primary">{percent}%</span>
    </div>
  );
}

export default function CoursePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lectures, setLectures] = useState<Lecture[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  // Progress stats
  const courseTitle = slug === "fundamentals-of-ai" ? "Fundamentals of AI" : slug?.toUpperCase() ?? "";
  const lectureCount = lectures?.length ?? 0;

  const { lectureCompletions, isLectureUnlocked, refreshCourseProgress } = useCourseProgress(slug);
  const [stats, setStats] = useState<StatsData | null>(null);
  const { recent: recentAchievements } = useRecentAchievements(4);

  const isAdmin = user?.role === 'admin';
  const firstLectureNumber = lectures && lectures.length > 0
    ? Math.min(...lectures.map((l) => l.number))
    : null;

  // Subscribe to progress changes and refresh when progress updates
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await authFetch<{ stats?: StatsData }>('/progress');
        setStats(res.stats ?? null);
      } catch (e) {
        console.error('Failed to load progress stats', e);
      }
    }
    refreshCourseProgress();
    loadStats();
    const handler = () => {
      refreshCourseProgress();
      loadStats();
    };
    window.addEventListener('gyansetu:progress:update', handler);
    window.addEventListener('fraylon:progress:update', handler);
    return () => {
      window.removeEventListener('gyansetu:progress:update', handler);
      window.removeEventListener('fraylon:progress:update', handler);
    };
  }, [refreshCourseProgress]);

  const getLectureStatus = (lecture: Lecture): LectureStatus => {
    const p = lectureCompletions[String(lecture.number)];
    if (p?.lectureCompleted) return "completed";
    if (!isAdmin && lecture.number !== firstLectureNumber && !isLectureUnlocked(lecture.number)) {
      return "locked";
    }
    if (p && p.completedSections > 0) return "in-progress";
    return "available";
  };

  const completedCount = lectures?.filter((l) => getLectureStatus(l) === "completed").length ?? 0;
  const progressPercent = lectureCount > 0
    ? Math.round((completedCount / lectureCount) * 100)
    : 0;
  const quizzesPassed = stats?.quizzesPassed ?? 0;
  const projectsSubmitted = stats?.projectsSolved ?? 0;

  useEffect(() => {
    if (progressPercent === 100 && lectureCount > 0 && user?.name && slug) {
      import("../progress").then((m) => {
        m.completeAction("course_complete", slug);
      });
    }
  }, [progressPercent, lectureCount, user, slug]);

  useEffect(() => {
    if (!slug) return;
    api.courseLectures(slug).then(setLectures).catch((e: Error) => setErr(e.message));
  }, [slug]);


  if (!slug) return null;

  const getStatusIcon = (status: LectureStatus) => {
    switch (status) {
      case "completed":
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case "in-progress":
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center ring-2 ring-amber-500/40 flex-shrink-0">
            <svg className="w-4 h-4 text-amber-400 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        );
      case "available":
        return (
          <div className="w-8 h-8 rounded-full bg-slate-700/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case "locked":
        return (
          <div className="w-8 h-8 rounded-full bg-slate-700/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>
        );
    }
  };

  const getStatusBadge = (status: LectureStatus) => {
    switch (status) {
      case "completed":
        return <span className="text-[11px] font-medium text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20">Completed</span>;
      case "in-progress":
        return <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">In Progress</span>;
      case "available":
        return <span className="text-[11px] font-medium text-slate-400 bg-slate-600/20 px-2.5 py-0.5 rounded-full border border-slate-600/30">Start</span>;
      case "locked":
        return <span className="text-[11px] font-medium text-slate-500 bg-slate-600/20 px-2.5 py-0.5 rounded-full border border-slate-600/30">Locked</span>;
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="flex gap-6 p-6 max-w-[1400px] mx-auto">
        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* ── Congratulations Banner ── */}
          {progressPercent === 100 && (
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 to-slate-900/40 backdrop-blur-sm p-6 flex items-start gap-4 shadow-[0_0_24px_rgba(16,185,129,0.1)] animate-fadeIn">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0 border border-emerald-500/20">
                <svg className="w-6 h-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#fff]">Course Completed</h3>
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mt-0.5">+200 XP Awarded</p>
                <p className="text-sm text-slate-400 mt-1">
                  Congratulations! You have completed all lectures, quizzes, and projects for this course.
                </p>
              </div>
            </div>
          )}

          {/* ── Hero Section ── */}
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] shadow-sm p-6 text-center">
            <div className="flex flex-col gap-6 items-center">
              <div className="flex-1 flex flex-col items-center">
                <nav className="flex items-center gap-2 text-xs text-text-secondary mb-4 justify-center">
                  <button onClick={() => navigate("/")} className="text-brand-primary hover:text-brand-primary-dark transition-colors">Dashboard</button>
                  <span className="text-text-muted">/</span>
                  <span className="text-text-secondary">Courses</span>
                  <span className="text-text-muted">/</span>
                  <span className="text-text-primary font-medium">{courseTitle}</span>
                </nav>

                <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">{courseTitle}</h1>
                <p className="text-sm text-text-secondary leading-relaxed mb-5 max-w-2xl">
                  Learn Python from basics to advanced with hands-on projects and quizzes.
                </p>

                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C6.228 6.228 2 10.692 2 16s4.228 9.772 10 9.772 10-4.692 10-9.772c0-5.308-4.228-9.747-10-9.747z" />
                    </svg>
                    {lectureCount} Lectures
                  </div>
                  <span className="w-1 h-1 rounded-full bg-text-muted" />
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Beginner Level
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col items-center lg:items-end gap-4">
                <ProgressCircle percent={progressPercent} />
                <div className="space-y-2 w-full">
                  {[
                    { label: "Lectures Completed", value: `${completedCount} / ${lectureCount}` },
                    { label: "Quizzes Passed", value: `${quizzesPassed} / ${lectureCount}` },
                    { label: "Projects Submitted", value: `${projectsSubmitted}` },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2.5 text-xs">
                      <svg className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-text-secondary">{stat.label}</span>
                      <span className="ml-auto font-medium text-text-primary">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Lectures Section ── */}
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2">
              Lectures
              <span className="text-xs font-normal text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-primary)] px-2.5 py-0.5 rounded-full">{lectureCount}</span>
            </h2>

            {err && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{err}</div>
            )}

            {lectures === null ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse border border-[var(--border-primary)]" />
                ))}
              </div>
            ) : lectures.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[var(--text-secondary)]">No lectures available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lectures.map((lecture) => {
                  const status = getLectureStatus(lecture);
                  const isLocked = status === "locked";

                  return (
                    <button
                      key={lecture.number}
                      onClick={() => !isLocked && navigate(`/course/${slug}/lecture/${lecture.number}`)}
                      disabled={isLocked}
                      className={`w-full text-left group rounded-2xl border transition-all duration-200 ${
                        isLocked
                          ? "border-[var(--border-primary)] bg-[var(--bg-main)] opacity-60 cursor-not-allowed"
                          : "border-[var(--border-primary)] bg-[var(--bg-surface)] hover:border-[var(--brand-primary)]/30 hover:bg-[var(--brand-primary)]/5 hover:shadow-sm cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div className="flex flex-col items-center gap-1">
                          {getStatusIcon(status)}
                          {lecture.number < lectures.length - 1 && (
                            <div className={`w-0.5 h-6 ${status === "completed" ? "bg-[var(--success)]/30" : "bg-[var(--border-primary)]"}`} />
                          )}
                        </div>

                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                          isLocked ? "bg-[var(--bg-main)] border border-[var(--border-primary)]" : status === "available" ? "bg-[var(--success)]/15" : "bg-[var(--brand-primary)]/15 group-hover:bg-[var(--brand-primary)]/25"
                        }`}>
                          <svg className={`w-5 h-5 ${isLocked ? "text-[var(--text-muted)]" : status === "available" ? "text-[var(--success)]" : "text-[var(--brand-primary)]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-semibold truncate ${isLocked ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]"} transition-colors`}>
                              {lecture.title}
                            </p>
                            <span className="text-[11px] text-[var(--text-secondary)] flex-shrink-0">Week {lecture.number}</span>
                          </div>
                          <p className={`text-xs mt-0.5 ${isLocked ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}`}>
                            Lecture {lecture.number}
                            {isLocked && lecture.number > 0 && (
                              <span className="ml-2 text-[var(--text-muted)]">— Complete Lecture {lecture.number} to unlock</span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {getStatusBadge(status)}
                          {!isLocked && (
                            <svg className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-0.5 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Sidebar – Achievements ── */}
        <aside className="w-[280px] flex-shrink-0 hidden lg:block">
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] shadow-sm p-5 sticky top-0">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Recent Achievements
            </h3>
            {recentAchievements.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] text-center py-6">
                Complete your first learning activity to unlock achievements.
              </p>
            ) : (
              <div className="space-y-4">
                {recentAchievements.map((a) => {
                  const Icon = getAchievementIcon(a.icon);
                  return (
                    <div key={a.id} className="flex gap-3 p-3 rounded-xl border bg-[var(--bg-main)] border-[var(--border-primary)]">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm text-white">
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{a.name}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{a.description}</p>
                        {a.unlockedAt && (
                          <p className="text-[10px] text-green-600 font-medium mt-1">Unlocked {timeAgo(a.unlockedAt)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button
              onClick={() => navigate('/leaderboard')}
              className="mt-4 w-full text-center text-xs font-medium text-[var(--brand-primary)] hover:text-[var(--accent-violet)] py-2.5 rounded-xl bg-[var(--brand-primary)]/5 hover:bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/15 hover:border-[var(--brand-primary)]/30 transition-all duration-200"
            >
              View Leaderboard →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
