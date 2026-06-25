import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from "../authClient";
import {
  AlertTriangle, ArrowLeft, Award, BookOpen, CheckCircle, Clock, Code, FileText,
  Loader2, Target, Trophy, User, XCircle,
} from "lucide-react";

type Tab = "overview" | "progress" | "projects" | "assessments" | "activity";

export default function StudentProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [activity, setActivity] = useState<any[]>([]);

  // Award Modal state
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardType, setAwardType] = useState<"xp" | "achievement">("xp");
  const [awardXpAmount, setAwardXpAmount] = useState(100);
  const [awardAchievementId, setAwardAchievementId] = useState("first_lecture");
  const [awardReason, setAwardReason] = useState("");
  const [awarding, setAwarding] = useState(false);
  const [awardError, setAwardError] = useState<string | null>(null);

  const ACHIEVEMENTS_LIST = [
    { id: "first_lecture", label: "First Steps (Complete first lecture)" },
    { id: "first_quiz", label: "Quiz Master (Pass first quiz)" },
    { id: "first_problem", label: "Problem Solver (Submit first problem)" },
    { id: "streak_3", label: "On Fire (3-day streak)" },
    { id: "five_lectures", label: "Halfway There (5 lectures completed)" },
    { id: "first_project", label: "First Project Submitted (Submit first capstone)" },
    { id: "ten_lectures", label: "10 Lectures Completed (10 lectures)" },
    { id: "ten_quizzes", label: "Quiz Whiz (10 quizzes passed)" },
    { id: "ten_problems", label: "Code Crusher (10 problems solved)" },
    { id: "two_projects", label: "Builder (2 projects completed)" },
    { id: "course_completed", label: "Course Completed (Finish a course)" },
    { id: "all_courses", label: "Full Stack (Finish both courses)" }
  ];

  const handleAwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardReason.trim()) {
      setAwardError("A reason is required");
      return;
    }
    setAwarding(true);
    setAwardError(null);
    try {
      await authFetch(`/admin/students/${userId}/award`, {
        method: "POST",
        body: JSON.stringify({
          type: awardType,
          amount: awardType === "xp" ? Number(awardXpAmount) : undefined,
          achievementId: awardType === "achievement" ? awardAchievementId : undefined,
          reason: awardReason,
        })
      });
      setShowAwardModal(false);
      setAwardReason("");
      
      const profile = await authFetch<any>(`/admin/students/${userId}`);
      setData(profile);
    } catch (err: any) {
      setAwardError(err.message || "Failed to award stats");
    } finally {
      setAwarding(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      authFetch<any>(`/admin/students/${userId}`),
      authFetch<{ activities: any[] }>(`/admin/students/${userId}/activity?days=30`).catch(() => ({ activities: [] })),
    ]).then(([profile, act]) => {
      setData(profile);
      setActivity(act.activities);
    }).catch(err => setError(err.message))
    .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-blue-400" />
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-[#0B0F17] p-6">
      <div className="rounded-xl bg-red-900/30 border border-red-500/30 p-4 text-red-300 text-sm flex items-center gap-2">
        <AlertTriangle size={16} /> {error || "Student not found"}
      </div>
    </div>
  );

  const { user, progress, quizAttempts, submissions, projects, certificates } = data;
  const completedLectures = progress.filter((p: any) => p.status === "COMPLETED").length;

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: "overview", label: "Overview", icon: User },
    { key: "progress", label: "Progress", icon: BookOpen },
    { key: "projects", label: "Projects", icon: Code },
    { key: "assessments", label: "Assessments", icon: Target },
    { key: "activity", label: "Activity", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/students")}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all border border-slate-700/50">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <User size={20} className="text-blue-400" />
            {user.name}
          </h1>
          <p className="text-sm text-slate-400">{user.email}</p>
        </div>

        <button
          onClick={() => setShowAwardModal(true)}
          className="ml-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Award size={14} /> Award Stats
        </button>

        <span className={`ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
          user.status === "active" ? "bg-emerald-900/40 text-emerald-300 border-emerald-500/30"
          : "bg-red-900/40 text-red-300 border-red-500/30"
        }`}>
          {user.status === "active" ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {user.status}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-2 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.key ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              }`}>
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Student Info</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ["Name", user.name], ["Email", user.email],
                  ["Role", user.role], ["Status", user.status],
                  ["Joined", new Date(user.createdAt).toLocaleDateString()],
                  ["Last Active", new Date(user.lastActiveAt).toLocaleDateString()],
                  ["Bio", user.bio || "—"],
                ].map(([l, v]) => (
                  <div key={l as string}>
                    <span className="text-slate-500">{l as string}</span>
                    <div className="text-slate-200 mt-0.5">{v as string}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Stats</h3>
              {[
                { icon: Trophy, label: "Total XP", value: user.totalXp.toLocaleString(), color: "text-yellow-400" },
                { icon: BookOpen, label: "Lectures Completed", value: completedLectures, color: "text-blue-400" },
                { icon: Target, label: "Quizzes Passed", value: quizAttempts.filter((q: any) => q.passed).length, color: "text-emerald-400" },
                { icon: Code, label: "Problems Solved", value: submissions.filter((s: any) => s.status === "PASSED").length, color: "text-purple-400" },
                { icon: Award, label: "Certificates", value: certificates.length, color: "text-amber-400" },
                { icon: Trophy, label: "Streak", value: `${user.currentStreak} days`, color: "text-orange-400" },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-400 text-xs"><Icon size={14} className={s.color} />{s.label}</span>
                    <span className={`font-mono text-sm font-semibold ${s.color}`}>{s.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "progress" && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-800/60 border-b border-slate-700/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Course</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Lecture</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Completed</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-700/30">
              {progress.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No progress data</td></tr>
              ) : progress.slice(0, 100).map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 text-slate-300">{p.courseSlug}</td>
                  <td className="px-4 py-2.5 text-slate-300">{p.lectureId}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.status === "COMPLETED" ? "bg-emerald-900/40 text-emerald-300" : "bg-slate-800 text-slate-400"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{p.completedAt ? new Date(p.completedAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "projects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">No projects</div>
          ) : projects.map((p: any) => (
            <div key={p.id} className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-200">{p.projectId}</h4>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  p.status === "COMPLETED" ? "bg-emerald-900/40 text-emerald-300"
                  : p.status === "PENDING_REVIEW" ? "bg-amber-900/40 text-amber-300"
                  : p.status === "REJECTED" ? "bg-red-900/40 text-red-300"
                  : "bg-slate-800 text-slate-400"
                }`}>{p.status}</span>
              </div>
              {p.description && <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>}
              <div className="flex gap-3 text-xs text-slate-500">
                {p.githubUrl && <a href={p.githubUrl} target="_blank" className="text-blue-400 hover:text-blue-300">GitHub</a>}
                {p.liveDemoUrl && <a href={p.liveDemoUrl} target="_blank" className="text-blue-400 hover:text-blue-300">Demo</a>}
                {p.completedAt && <span><Clock size={12} className="inline mr-1" />{new Date(p.completedAt).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "assessments" && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-800/60 border-b border-slate-700/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Subsection</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Score</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Attempts</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-700/30">
              {quizAttempts.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No assessment data</td></tr>
              ) : quizAttempts.map((q: any) => (
                <tr key={q.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 text-slate-300">Quiz</td>
                  <td className="px-4 py-2.5 text-slate-300 font-mono text-xs">{q.quizId}</td>
                  <td className="px-4 py-2.5"><span className="font-mono text-sm">{q.score}/{q.total}</span></td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      q.passed ? "bg-emerald-900/40 text-emerald-300" : "bg-red-900/40 text-red-300"
                    }`}>{q.passed ? "PASSED" : "FAILED"}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">{quizAttempts.filter((a: any) => a.quizId === q.quizId).length}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(q.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "activity" && (
        <div className="space-y-2">
          {activity.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No activity in the last 30 days</div>
          ) : activity.slice(0, 100).map((a: any, i: number) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-700/50 bg-slate-900/60 p-3">
              <span className={`p-1.5 rounded-lg flex-shrink-0 ${
                a.type === "xp" ? "bg-yellow-900/30 text-yellow-300"
                : a.type === "quiz" ? "bg-emerald-900/30 text-emerald-300"
                : a.type === "project" ? "bg-blue-900/30 text-blue-300"
                : a.type === "progress" ? "bg-purple-900/30 text-purple-300"
                : a.type === "submission" ? "bg-orange-900/30 text-orange-300"
                : "bg-slate-800 text-slate-400"
              }`}>
                {a.type === "xp" ? <Trophy size={14} /> : a.type === "quiz" ? <Target size={14} />
                : a.type === "project" ? <Code size={14} /> : a.type === "progress" ? <BookOpen size={14} />
                : a.type === "submission" ? <FileText size={14} /> : <Clock size={14} />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200">{a.action}</p>
                <p className="text-xs text-slate-500 mt-0.5">{new Date(a.date).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Award Modal */}
      {showAwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleAwardSubmit} className="w-full max-w-md rounded-2xl bg-[#161B22] border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="text-blue-400" size={20} /> Award Student Stats
              </h3>
              <button
                type="button"
                onClick={() => setShowAwardModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                &times;
              </button>
            </div>

            {awardError && (
              <div className="rounded-lg bg-red-900/20 border border-red-500/25 p-3 text-red-300 text-xs">
                {awardError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Award Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAwardType("xp")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    awardType === "xp"
                      ? "bg-blue-600/25 text-blue-300 border-blue-500/40"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Experience Points (XP)
                </button>
                <button
                  type="button"
                  onClick={() => setAwardType("achievement")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    awardType === "achievement"
                      ? "bg-blue-600/25 text-blue-300 border-blue-500/40"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Achievement
                </button>
              </div>
            </div>

            {awardType === "xp" ? (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">XP Amount</label>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={awardXpAmount}
                  onChange={(e) => setAwardXpAmount(Number(e.target.value))}
                  className="w-full h-10 bg-slate-900 border border-slate-800 rounded-lg px-3 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Achievement</label>
                <select
                  value={awardAchievementId}
                  onChange={(e) => setAwardAchievementId(e.target.value)}
                  className="w-full h-10 bg-slate-900 border border-slate-800 rounded-lg px-3 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {ACHIEVEMENTS_LIST.map((ach) => (
                    <option key={ach.id} value={ach.id}>
                      {ach.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reason / Description</label>
              <textarea
                value={awardReason}
                onChange={(e) => setAwardReason(e.target.value)}
                placeholder="e.g. Completed extra sandbox problems, outstanding Discord help..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAwardModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={awarding}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
              >
                {awarding ? "Awarding..." : "Award Stats"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
