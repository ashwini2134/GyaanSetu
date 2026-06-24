import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../authClient";
import {
  Activity, Award, BookOpen, BarChart3, GraduationCap, Loader2, TrendingUp, Users,
  Brain, Clock, FileCheck, Target, AlertTriangle, Sparkles, Download,
  ChevronRight, Lightbulb, HelpCircle, ListChecks, XCircle, CheckCircle,
} from "lucide-react";

// ── Types ──

type Tab = "overview" | "learning" | "assessments" | "projects" | "certifications" | "students";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "learning", label: "Learning", icon: BookOpen },
  { id: "assessments", label: "Assessments", icon: Brain },
  { id: "projects", label: "Projects", icon: FileCheck },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "students", label: "Students", icon: Users },
];

// ── Helpers ──

function pct(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function exportCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  a.click(); URL.revokeObjectURL(url);
}

// ── Main Component ──

export default function AdminReportsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [learning, setLearning] = useState<any>(null);
  const [assessments, setAssessments] = useState<any>(null);
  const [projects, setProjects] = useState<any>(null);
  const [certs, setCerts] = useState<any>(null);
  const [students, setStudents] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTab = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      switch (tab) {
        case "overview": {
          const [oData, gData] = await Promise.all([
            authFetch<any>("/admin/reports/overview"),
            authFetch<{ byMonth: Record<string, number> }>("/admin/reports/student-growth"),
          ]);
          setOverview({ ...oData, growth: gData.byMonth });
          break;
        }
        case "learning": {
          const [lectures, practice] = await Promise.all([
            authFetch<any>("/admin/analytics/learning/lectures"),
            authFetch<any>("/admin/analytics/learning/practice"),
          ]);
          setLearning({ lectures: lectures.courses, practice });
          break;
        }
        case "assessments": {
          const data = await authFetch<any>("/admin/analytics/assessments");
          setAssessments(data);
          break;
        }
        case "projects": {
          const data = await authFetch<any>("/admin/analytics/projects");
          setProjects(data);
          break;
        }
        case "certifications": {
          const data = await authFetch<any>("/admin/analytics/certifications");
          setCerts(data);
          break;
        }
        case "students": {
          const data = await authFetch<any>("/admin/analytics/students");
          setStudents(data);
          break;
        }
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchTab(); }, [fetchTab]);

  // ── Render ──

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="text-emerald-400" size={24} />
          Reports & Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-1">Real metrics from real data — no approximations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-700/50 pb-2 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.id ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
        {tab !== "overview" && (
          <button onClick={() => exportCsv(`analytics-${tab}.csv`, ["metric", "value"], [["export", "manual"]])}
            className="ml-auto flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 border border-slate-700/50 hover:border-slate-600">
            <Download size={12} /> CSV
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-900/20 border border-red-700/30 text-sm text-red-300">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-emerald-400" /></div>
      ) : (
        <>
          {tab === "overview" && <OverviewTab data={overview} />}
          {tab === "learning" && <LearningTab data={learning} />}
          {tab === "assessments" && <AssessmentsTab data={assessments} />}
          {tab === "projects" && <ProjectsTab data={projects} />}
          {tab === "certifications" && <CertificationsTab data={certs} />}
          {tab === "students" && <StudentsTab data={students} />}
        </>
      )}
    </div>
  );
}

// ── Overview Tab ──

function OverviewTab({ data }: { data: any }) {
  if (!data) return null;
  const cards = [
    { label: "Students", value: data.totalStudents, icon: Users, color: "text-blue-400" },
    { label: "Active", value: data.activeStudents, icon: Activity, color: "text-emerald-400" },
    { label: "Courses", value: data.totalCourses, icon: BookOpen, color: "text-indigo-400" },
    { label: "Practice", value: data.totalPractices, icon: TrendingUp, color: "text-purple-400" },
    { label: "Assess.", value: data.totalAssessments, icon: GraduationCap, color: "text-rose-400" },
    { label: "Projects", value: data.totalProjects, icon: FileCheck, color: "text-amber-400" },
    { label: "Certs", value: data.totalCertificates, icon: Award, color: "text-yellow-400" },
  ];

  const growth = data.growth || {};
  const entries = Object.entries(growth);
  const cumulative = entries.reduce<{ month: string; count: number }[]>((acc, [m, c]) => {
    const prev = acc.length ? acc[acc.length - 1].count : 0;
    acc.push({ month: m, count: prev + c });
    return acc;
  }, []);
  const maxCumulative = cumulative.length > 0 ? cumulative[cumulative.length - 1].count : 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {cards.map(s => (
          <div key={s.label} className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-3 text-center">
            <s.icon size={18} className={`${s.color} mx-auto mb-1`} />
            <div className="text-lg font-bold text-slate-200">{s.value}</div>
            <div className="text-[10px] text-slate-400 uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {entries.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" /> Student Growth
          </h2>
          <div className="space-y-2">
            {cumulative.map(({ month, count }) => {
              const monthlyCount = growth[month] || 0;
              const pct = (count / maxCumulative) * 100;
              return (
                <div key={month} className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 w-16 shrink-0">{month}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className="bg-emerald-500/60 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex gap-3 text-[10px] text-slate-500 w-24 justify-end shrink-0">
                    <span>+{monthlyCount}</span>
                    <span className="text-slate-300 font-mono">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-2">
          <h3 className="text-sm font-semibold text-slate-200">Engagement</h3>
          <MetricRow label="Active Rate" value={`${pct(data.activeStudents, data.totalStudents)}%`} color="text-emerald-300" />
          <MetricRow label="Practices / Student" value={(data.totalPractices / Math.max(data.totalStudents, 1)).toFixed(1)} />
          <MetricRow label="Assessments / Student" value={(data.totalAssessments / Math.max(data.totalStudents, 1)).toFixed(1)} />
          <MetricRow label="Cert Rate" value={`${pct(data.totalCertificates, data.totalStudents)}%`} color="text-yellow-300" />
          <MetricRow label="Project Completion Rate" value={`${data.totalProjects > 0 ? Math.round((data.totalCertificates / data.totalProjects) * 100) : 0}%`} />
        </div>
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-2">
          <h3 className="text-sm font-semibold text-slate-200">Content Volume</h3>
          <MetricRow label="Courses" value={String(data.totalCourses)} />
          <MetricRow label="Practice Submissions" value={String(data.totalPractices)} />
          <MetricRow label="Assessment Attempts" value={String(data.totalAssessments)} />
          <MetricRow label="Projects Started" value={String(data.totalProjects)} />
          <MetricRow label="Certificates Issued" value={String(data.totalCertificates)} color="text-yellow-300" />
        </div>
      </div>
    </div>
  );
}

// ── Learning Tab ──

function LearningTab({ data }: { data: any }) {
  if (!data) return null;
  const { lectures = [], practice } = data;
  const practiceSummary = practice?.summary;

  return (
    <div className="space-y-6">
      {/* Practice summary cards */}
      {practiceSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatCard label="Exercises" value={practiceSummary.totalExercises} />
          <StatCard label="Total Attempts" value={practiceSummary.totalAttempts} />
          <StatCard label="Completions" value={practiceSummary.totalCompletions} />
          <StatCard label="Pass Rate" value={`${practiceSummary.overallPassRate}%`} color="text-emerald-400" />
          <StatCard label="Hint Usage" value={`${practiceSummary.overallHintUsageRate}%`} color="text-amber-400" />
        </div>
      )}

      {/* Lecture completion rates by course */}
      {lectures.map((course: any) => {
        const lectureList = course.lectures || [];
        return (
          <div key={course.slug} className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 capitalize">
              <BookOpen size={14} className="text-blue-400" /> {course.slug}
              <span className="text-xs font-normal text-slate-500">· {course.totalStudents} students · {course.totalLectures} lectures</span>
            </h3>
            <div className="space-y-2">
              {lectureList.map((lecture: any) => (
                <div key={lecture.lectureId} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-20 shrink-0">Lec {lecture.lectureId}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${lecture.completionRate >= 80 ? "bg-emerald-500/60" : lecture.completionRate >= 50 ? "bg-amber-500/60" : "bg-red-500/60"}`}
                      style={{ width: `${lecture.completionRate}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-12 text-right">{lecture.completionRate}%</span>
                  <span className="text-[10px] text-slate-500 w-10 text-right">{lecture.skipCount} skipped</span>
                  {lecture.revisitCount > 0 && (
                    <span className="text-[10px] text-blue-400 w-14 text-right">{lecture.revisitCount}x revisited</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Practice exercise stats */}
      {practice?.exercises && practice.exercises.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ListChecks size={14} className="text-purple-400" /> Practice Exercises
            </h3>
            <button onClick={() => {
              const headers = ["Title", "Course", "Difficulty", "Attempts", "Pass Rate", "Hint Rate", "Avg Time (s)", "Failure Rate"];
              const rows = practice.exercises.map((ex: any) => [
                ex.title, ex.courseId, ex.difficulty, String(ex.totalAttempts),
                `${ex.passRate}%`, `${ex.hintUsageRate}%`, String(ex.averageTimeSeconds || ""), `${ex.failureRate}%`,
              ]);
              exportCsv("practice-exercises.csv", headers, rows);
            }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] text-slate-400 hover:text-slate-200 border border-slate-700/50">
              <Download size={10} /> CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-700/30">
                  <th className="py-2 pr-3">Exercise</th>
                  <th className="py-2 pr-3">Course</th>
                  <th className="py-2 pr-3">Difficulty</th>
                  <th className="py-2 pr-3 text-right">Attempts</th>
                  <th className="py-2 pr-3 text-right">Pass %</th>
                  <th className="py-2 pr-3 text-right">Hint %</th>
                  <th className="py-2 pr-3 text-right">Avg Time</th>
                  <th className="py-2 pr-3 text-right">Fail %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/20">
                {practice.exercises.slice(0, 50).map((ex: any) => (
                  <tr key={ex.id} className="hover:bg-slate-800/40">
                    <td className="py-2 pr-3 text-slate-200 max-w-[200px] truncate">{ex.title}</td>
                    <td className="py-2 pr-3 text-slate-400">{ex.courseId}</td>
                    <td className="py-2 pr-3">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium ${
                        ex.difficulty === "beginner" ? "text-emerald-400 bg-emerald-900/30" :
                        ex.difficulty === "intermediate" ? "text-amber-400 bg-amber-900/30" : "text-red-400 bg-red-900/30"
                      }`}>{ex.difficulty}</span>
                    </td>
                    <td className="py-2 pr-3 text-right text-slate-300">{ex.totalAttempts}</td>
                    <td className={`py-2 pr-3 text-right ${ex.passRate >= 70 ? "text-emerald-400" : ex.passRate >= 40 ? "text-amber-400" : "text-red-400"}`}>{ex.passRate}%</td>
                    <td className="py-2 pr-3 text-right text-slate-400">{ex.hintUsageRate}%</td>
                    <td className="py-2 pr-3 text-right text-slate-400">{ex.averageTimeSeconds ? `${Math.round(ex.averageTimeSeconds / 60)}m` : "—"}</td>
                    <td className={`py-2 pr-3 text-right ${ex.failureRate >= 50 ? "text-red-400" : "text-slate-400"}`}>{ex.failureRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Assessments Tab ──

function AssessmentsTab({ data }: { data: any }) {
  if (!data) return null;
  const { summary, byCategory, hardestSubsections, easiestSubsections } = data;

  // Find the hardest (most failed) assessments
  const hardAssessments = hardestSubsections || [];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total Assessments" value={summary.totalAssessments} />
        <StatCard label="Categories" value={summary.totalCategories} />
        <StatCard label="Pass Rate" value={`${summary.overallPassRate}%`} color="text-emerald-400" />
        <StatCard label="Avg Score" value={`${summary.overallAvgScore}%`} color="text-blue-400" />
        <StatCard label="Retake Rate" value={`${summary.retakeRate}%`} color="text-amber-400" />
      </div>

      {/* By category breakdown */}
      {byCategory && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Brain size={14} className="text-blue-400" /> By Category
          </h3>
          <div className="space-y-3">
            {Object.entries(byCategory).map(([cat, stats]: [string, any]) => (
              <div key={cat} className="flex items-center gap-4">
                <span className="text-xs text-slate-300 w-24 capitalize shrink-0">{cat.replace(/_/g, " ")}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div className="bg-blue-500/60 h-full rounded-full" style={{ width: `${stats.avgScore}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-16 text-right">{stats.avgScore}%</span>
                <span className="text-xs text-slate-500 w-12 text-right">{stats.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hardest assessments */}
      {hardAssessments.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" /> Hardest Subsections
          </h3>
          <div className="space-y-2">
            {hardAssessments.map((a: any) => (
              <div key={a.key} className="flex items-center gap-3">
                <span className="text-xs text-slate-300 flex-1">{a.key.replace(/:/g, " → ")}</span>
                <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-red-500/60 h-full rounded-full" style={{ width: `${a.avgScore}%` }} />
                </div>
                <span className="text-xs text-red-400 w-10 text-right">{a.avgScore}%</span>
                <span className="text-xs text-slate-500 w-8 text-right">{a.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Easiest assessments */}
      {easiestSubsections && easiestSubsections.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-400" /> Easiest Subsections
          </h3>
          <div className="space-y-2">
            {easiestSubsections.map((a: any) => (
              <div key={a.key} className="flex items-center gap-3">
                <span className="text-xs text-slate-300 flex-1">{a.key.replace(/:/g, " → ")}</span>
                <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500/60 h-full rounded-full" style={{ width: `${a.avgScore}%` }} />
                </div>
                <span className="text-xs text-emerald-400 w-10 text-right">{a.avgScore}%</span>
                <span className="text-xs text-slate-500 w-8 text-right">{a.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Projects Tab ──

function ProjectsTab({ data }: { data: any }) {
  if (!data) return null;
  const { summary, mostCommonProjects } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Projects" value={summary.total} />
        <StatCard label="Completed" value={`${summary.completionRate}%`} color="text-emerald-400" />
        <StatCard label="Approval Rate" value={`${summary.approvalRate}%`} color="text-blue-400" />
        <StatCard label="Abandoned" value={summary.abandonedCount} color="text-red-400" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summary.byStatus && Object.entries(summary.byStatus).map(([status, count]: [string, any]) => (
          <div key={status} className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 text-center">
            <div className="text-lg font-bold text-slate-200">{count}</div>
            <div className="text-[10px] text-slate-400 uppercase">{status}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileCheck size={14} className="text-amber-400" /> Project Status Distribution
        </h3>
        {summary.byStatus && (
          <StatusBar items={Object.entries(summary.byStatus).map(([k, v]: any) => ({ label: k, value: v, total: summary.total }))} />
        )}
        {summary.averageCompletionDays && (
          <p className="text-xs text-slate-400 mt-2">Avg completion time: <span className="text-slate-200 font-semibold">{summary.averageCompletionDays} days</span></p>
        )}
      </div>

      {mostCommonProjects && mostCommonProjects.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Target size={14} className="text-purple-400" /> Most Attempted Projects
          </h3>
          <div className="space-y-2">
            {mostCommonProjects.slice(0, 10).map((p: any) => (
              <div key={p.projectId} className="flex items-center gap-3">
                <span className="text-xs text-slate-300 flex-1 truncate">{p.projectId}</span>
                <div className="flex-1 max-w-[200px] bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-purple-500/60 h-full rounded-full" style={{ width: `${p.approvalRate}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-16 text-right">{p.total} submissions</span>
                <span className="text-xs text-emerald-400 w-12 text-right">{p.approvalRate}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Certifications Tab ──

function CertificationsTab({ data }: { data: any }) {
  if (!data) return null;
  const { summary, monthlyTrend } = data;

  const maxMonthly = monthlyTrend && monthlyTrend.length > 0
    ? Math.max(...monthlyTrend.map((m: any) => m.count))
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total Issued" value={summary.total} />
        <StatCard label="Eligible Now" value={summary.eligibleCount} color="text-emerald-400" />
        <StatCard label="Revoked" value={summary.revokedCount} color="text-red-400" />
        <StatCard label="Conversion" value={`${summary.eligibilityConversionRate}%`} color="text-blue-400" />
        <StatCard label="Cert Rate" value={`${summary.issuedToEligibleRate}%`} color="text-yellow-400" />
      </div>

      {/* By course */}
      {summary.byCourse && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award size={14} className="text-yellow-400" /> By Course
          </h3>
          <StatusBar items={Object.entries(summary.byCourse).map(([k, v]: any) => ({ label: k, value: v, total: summary.total }))} colorMap={{ cs50ai: "#A855F7", python: "#3B82F6" }} />
        </div>
      )}

      {/* Monthly trend */}
      {monthlyTrend && monthlyTrend.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-400" /> Monthly Issuance
            </h3>
            <button onClick={() => {
              const headers = ["Month", "Count"];
              const rows = monthlyTrend.map((m: any) => [m.month, String(m.count)]);
              exportCsv("cert-issuance.csv", headers, rows);
            }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] text-slate-400 hover:text-slate-200 border border-slate-700/50">
              <Download size={10} /> CSV
            </button>
          </div>
          <div className="space-y-2">
            {monthlyTrend.slice(-12).map((m: any) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 w-16 shrink-0">{m.month}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-4 overflow-hidden">
                  <div className="bg-yellow-500/60 h-full rounded-full transition-all" style={{ width: `${maxMonthly > 0 ? (m.count / maxMonthly) * 100 : 0}%` }} />
                </div>
                <span className="text-xs text-slate-300 w-8 text-right font-mono">{m.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Students Tab ──

function StudentsTab({ data }: { data: any }) {
  if (!data) return null;
  const { summary, topPerformers, mostActive, inactive, atRisk, behindSchedule, nearEligible } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Students" value={summary.total} />
        <StatCard label="Active (30d)" value={summary.activeLast30} color="text-emerald-400" />
        <StatCard label="Inactive (30d+)" value={summary.inactive} color="text-amber-400" />
        <StatCard label="At Risk" value={summary.atRisk} color="text-red-400" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Behind Schedule" value={summary.behindSchedule} color="text-amber-400" />
        <StatCard label="Near Eligible" value={summary.nearEligible} color="text-emerald-400" />
        <StatCard label="Avg XP" value={summary.avgXp} color="text-blue-400" />
      </div>

      {/* Top performers */}
      {topPerformers && topPerformers.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award size={14} className="text-yellow-400" /> Top Performers
            </h3>
            <button onClick={() => {
              const headers = ["Name", "Email", "XP", "Streak", "Progress", "Certs", "Active"];
              const rows = topPerformers.map((s: any) => [s.name, s.email, String(s.xp), String(s.streak), `${s.overallProgress}%`, String(s.certificatesIssued), s.recentlyActive ? "Yes" : "No"]);
              exportCsv("top-performers.csv", headers, rows);
            }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] text-slate-400 hover:text-slate-200 border border-slate-700/50">
              <Download size={10} /> CSV
            </button>
          </div>
          <StudentTable students={topPerformers.slice(0, 20)} />
        </div>
      )}

      {/* At risk */}
      {atRisk && atRisk.length > 0 && (
        <div className="rounded-xl border border-red-700/20 bg-red-900/10 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" /> Students At Risk ({atRisk.length})
          </h3>
          <p className="text-xs text-slate-400">Inactive for 30+ days with low progress</p>
          <StudentTable students={atRisk.slice(0, 10)} />
        </div>
      )}

      {/* Behind schedule */}
      {behindSchedule && behindSchedule.length > 0 && (
        <div className="rounded-xl border border-amber-700/20 bg-amber-900/10 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock size={14} className="text-amber-400" /> Behind Schedule ({behindSchedule.length})
          </h3>
          <p className="text-xs text-slate-400">Progress is below expected pace relative to join date</p>
          <StudentTable students={behindSchedule.slice(0, 10)} />
        </div>
      )}

      {/* Near eligible */}
      {nearEligible && nearEligible.length > 0 && (
        <div className="rounded-xl border border-emerald-700/20 bg-emerald-900/10 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-400" /> Near Certification ({nearEligible.length})
          </h3>
          <p className="text-xs text-slate-400">Within 2 lectures of course completion — ready to nudge toward certification</p>
          <div className="space-y-2">
            {nearEligible.slice(0, 15).map((s: any, i: number) => (
              <div key={`${s.id}-${i}`} className="flex items-center gap-3 text-xs">
                <span className="text-slate-300 font-medium w-36 truncate">{s.name}</span>
                <span className="text-slate-500 w-28 truncate">{s.email}</span>
                <span className="text-emerald-400 font-mono">{s.nearProgress}</span>
                <span className="text-slate-500">{s.nearCourse}</span>
                <span className="text-slate-400 ml-auto">{s.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared Components ──

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 text-center">
      <div className={`text-lg font-bold ${color || "text-slate-200"}`}>{value}</div>
      <div className="text-[10px] text-slate-400 uppercase mt-0.5">{label}</div>
    </div>
  );
}

function MetricRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-slate-400">{label}</span>
      <span className={`font-semibold ${color || "text-slate-300"}`}>{value}</span>
    </div>
  );
}

function StatusBar({ items, colorMap }: { items: { label: string; value: number; total: number }[]; colorMap?: Record<string, string> }) {
  return (
    <div className="space-y-2">
      {items.map(i => {
        const barPct = i.total > 0 ? (i.value / i.total) * 100 : 0;
        return (
          <div key={i.label} className="flex items-center gap-3">
            <span className="text-xs text-slate-300 w-20 capitalize shrink-0">{i.label}</span>
            <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: colorMap?.[i.label] || "#6366f1" }} />
            </div>
            <span className="text-xs text-slate-400 w-16 text-right">{i.value} ({Math.round(barPct)}%)</span>
          </div>
        );
      })}
    </div>
  );
}

function StudentTable({ students }: { students: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-700/30">
            <th className="py-2 pr-3">Name</th>
            <th className="py-2 pr-3">Email</th>
            <th className="py-2 pr-3 text-right">XP</th>
            <th className="py-2 pr-3 text-right">Progress</th>
            <th className="py-2 pr-3 text-right">Streak</th>
            <th className="py-2 pr-3 text-right">Certs</th>
            <th className="py-2 pr-3 text-right">Last Active</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/20">
          {students.map((s: any) => (
            <tr key={s.id} className="hover:bg-slate-800/40">
              <td className="py-2 pr-3 text-slate-200 font-medium">{s.name}</td>
              <td className="py-2 pr-3 text-slate-500">{s.email}</td>
              <td className="py-2 pr-3 text-right text-slate-300">{s.xp}</td>
              <td className="py-2 pr-3 text-right text-slate-400">{s.overallProgress}%</td>
              <td className="py-2 pr-3 text-right text-amber-400">{s.streak}</td>
              <td className="py-2 pr-3 text-right text-yellow-400">{s.certificatesIssued}</td>
              <td className="py-2 pr-3 text-right text-slate-500">{new Date(s.lastActive).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
