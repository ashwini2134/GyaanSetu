import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Crown } from 'lucide-react';
import { api, type Lecture } from "../api";
import { getCourseProgress, isLectureUnlocked, subscribeToProgressChanges } from "../hooks/useProgress";
import { useAuth } from "../auth";

type LectureStatus = "completed" | "in-progress" | "locked";

function ProgressCircle({ percent, size = 96 }: { percent: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-700/60" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-blue-500 drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
      </svg>
      <span className="absolute text-xl font-bold text-white">{percent}%</span>
    </div>
  );
}

export default function CoursePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lectures, setLectures] = useState<Lecture[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
<<<<<<< HEAD
  const [lectureProjectCounts, setLectureProjectCounts] = useState<Record<number, number>>({});
=======
>>>>>>> 8245f18 (Initial commit)
  const courseTitle = slug === "cs50p" ? "CS50 Python" : slug === "cs50ai" ? "CS50 AI" : slug?.toUpperCase() ?? "";
  const lectureCount = lectures?.length ?? 0;

  // Subscribe to progress changes for real-time UI updates
  useEffect(() => {
    const unsub = subscribeToProgressChanges(() => setRefreshKey(k => k + 1));
    return unsub;
  }, []);

  // ── All progress computed fresh every render via refreshKey ──
  const courseProgress = useMemo(() => getCourseProgress(slug ?? ""), [slug, refreshKey]);

  const getLectureStatus = (lecture: Lecture): LectureStatus => {
    const p = courseProgress[lecture.number];
    if (p?.lectureCompleted) return "completed";
    if (p && (p.quizCompleted || Object.keys(p.sections).length > 0)) return "in-progress";
    if (isLectureUnlocked(lecture.number, courseProgress)) return "in-progress";
    return "locked";
  };

  const completedCount = lectures?.filter((l) => getLectureStatus(l) === "completed").length ?? 0;
  const progressPercent = lectureCount > 0
    ? Math.round((completedCount / lectureCount) * 100)
    : 0;
  const quizzesPassed = lectures?.filter((l) => courseProgress[l.number]?.quizCompleted).length ?? 0;
<<<<<<< HEAD
  const projectsSubmitted = Object.values(courseProgress).reduce((acc, p) => acc + (p.problemsCompleted?.length || 0) + (p.projectCompleted ? 1 : 0), 0);
=======
>>>>>>> 8245f18 (Initial commit)

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

<<<<<<< HEAD
  useEffect(() => {
    if (!slug) return;
    api.lectureProjectsCounts(slug).then(setLectureProjectCounts).catch(() => {});
  }, [slug]);

=======
>>>>>>> 8245f18 (Initial commit)
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
          <div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center ring-2 ring-blue-500/40 flex-shrink-0">
            <svg className="w-4 h-4 text-blue-400 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
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
        return <span className="text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">In Progress</span>;
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
                <h3 className="text-lg font-bold text-white">🏆 Course Completed!</h3>
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mt-0.5">+200 XP Awarded</p>
                <p className="text-sm text-slate-400 mt-1">
                  Congratulations! You have completed all lectures, quizzes, and projects for this course.
                </p>
              </div>
            </div>
          )}

          {/* ── Hero Section ── */}
          <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6 text-center">
            <div className="flex flex-col gap-6 items-center">
              <div className="flex-1 flex flex-col items-center">
                <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4 justify-center">
                  <button onClick={() => navigate("/")} className="text-blue-400 hover:text-blue-300 transition-colors">Dashboard</button>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-400">Courses</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-white font-medium">{courseTitle}</span>
                </nav>

                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{courseTitle}</h1>
                <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-2xl">
                  Learn Python from basics to advanced with hands-on projects and quizzes.
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C6.228 6.228 2 10.692 2 16s4.228 9.772 10 9.772 10-4.692 10-9.772c0-5.308-4.228-9.747-10-9.747z" />
                    </svg>
                    {lectureCount} Lectures
                  </div>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
<<<<<<< HEAD
                    { label: "Projects Submitted", value: `${projectsSubmitted}` },
=======
>>>>>>> 8245f18 (Initial commit)
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2.5 text-xs">
                      <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-slate-400">{stat.label}</span>
                      <span className="ml-auto font-medium text-slate-200">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Lectures Section ── */}
          <div>
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              Lectures
              <span className="text-xs font-normal text-slate-400 bg-slate-800/60 px-2.5 py-0.5 rounded-full">{lectureCount}</span>
            </h2>

            {err && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-700/50 rounded-xl text-red-300 text-sm">{err}</div>
            )}

            {lectures === null ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-slate-800/40 animate-pulse border border-slate-700/20" />
                ))}
              </div>
            ) : lectures.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No lectures available</p>
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
                          ? "border-slate-700/20 bg-slate-800/20 opacity-60 cursor-not-allowed"
                          : "border-slate-700/30 bg-slate-800/40 hover:border-blue-500/30 hover:bg-slate-800/60 hover:shadow-[0_0_16px_rgba(59,130,246,0.08)] cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div className="flex flex-col items-center gap-1">
                          {getStatusIcon(status)}
                          {lecture.number < lectures.length - 1 && (
                            <div className={`w-0.5 h-6 ${status === "completed" ? "bg-green-500/30" : "bg-slate-700/30"}`} />
                          )}
                        </div>

                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                          isLocked ? "bg-slate-700/30" : "bg-blue-600/15 group-hover:bg-blue-600/25"
                        }`}>
                          <svg className={`w-5 h-5 ${isLocked ? "text-slate-500" : "text-blue-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-semibold truncate ${isLocked ? "text-slate-500" : "text-slate-200 group-hover:text-white"} transition-colors`}>
                              {lecture.title}
                            </p>
                            <span className="text-[11px] text-slate-500 flex-shrink-0">Week {lecture.number}</span>
                          </div>
                          <p className={`text-xs mt-0.5 ${isLocked ? "text-slate-600" : "text-slate-400"}`}>
                            Lecture {lecture.number + 1}
<<<<<<< HEAD
                            {(lectureProjectCounts[lecture.number] ?? 0) > 0 && (
                              <span className="ml-2 text-slate-500">· Project</span>
                            )}
=======
>>>>>>> 8245f18 (Initial commit)
                            {isLocked && lecture.number > 0 && (
                              <span className="ml-2 text-slate-500">— Complete Lecture {lecture.number} to unlock</span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {getStatusBadge(status)}
                          {!isLocked && (
                            <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
          <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-5 sticky top-0">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Recent Achievement
            </h3>
            <div className="space-y-4">
              {[
                { icon: <Star size={20} className="text-white" />, title: "First Steps", desc: "Complete your first lecture", done: completedCount >= 1, gradient: "from-yellow-400 to-orange-500" },
                { icon: <Crown size={20} className="text-white" />, title: "Quiz Master", desc: quizzesPassed >= 1 ? `Passed ${quizzesPassed} quiz${quizzesPassed > 1 ? 'zes' : ''}` : "Pass your first quiz", done: quizzesPassed >= 1, gradient: "from-purple-400 to-pink-500" },
<<<<<<< HEAD
                { icon: "◆", title: "Project Solver", desc: projectsSubmitted >= 1 ? `Solved ${projectsSubmitted} project${projectsSubmitted > 1 ? 's' : ''}` : "Solve your first project", done: projectsSubmitted >= 1, gradient: "from-red-400 to-orange-500" },
=======
>>>>>>> 8245f18 (Initial commit)
                { icon: "●", title: "Halfway There", desc: completedCount >= Math.ceil(lectureCount / 2) ? `${completedCount}/${lectureCount} complete` : `Complete ${Math.ceil(lectureCount / 2)} lectures`, done: completedCount >= Math.ceil(lectureCount / 2), gradient: "from-blue-400 to-cyan-500" },
              ].map((a) => (
                <div key={a.title} className={`flex gap-3 p-3 rounded-xl border transition-all duration-200 ${a.done ? 'bg-slate-800/30 border-slate-700/20' : 'bg-slate-800/10 border-slate-700/10 opacity-50'}`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-lg flex-shrink-0 shadow-lg`}>{a.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-200 truncate">{a.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{a.desc}</p>
                    {a.done && <p className="text-[10px] text-green-400 mt-1">✓ Unlocked</p>}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/leaderboard')}
              className="mt-4 w-full text-center text-xs font-medium text-blue-400 hover:text-blue-300 py-2.5 rounded-xl bg-blue-500/8 hover:bg-blue-500/15 border border-blue-500/15 hover:border-blue-500/30 transition-all duration-200"
            >
              View Leaderboard →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
