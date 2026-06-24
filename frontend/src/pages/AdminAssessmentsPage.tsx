import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../authClient";
import { BarChart3, CheckCircle2, Loader2, Search, XCircle } from "lucide-react";

type Assessment = {
  id: string; userId: string; category: string; subsection: string;
  score: number; totalQuestions: number; timeTaken: number; status: string;
  attempts: number; lastAttemptAt: string;
  user: { id: string; name: string; email: string } | null;
};

export default function AdminAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const [aData, sData] = await Promise.all([
        authFetch<{ assessments: Assessment[] }>(`/admin/assessments?${params}`),
        authFetch<any>("/admin/assessments/stats"),
      ]);
      setAssessments(aData.assessments);
      setStats(sData);
    } catch {} finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="text-rose-400" size={24} />
          Assessments
        </h1>
        <p className="text-sm text-slate-400 mt-1">{stats?.total || 0} total attempts, {stats?.completionRate || 0}% completion rate</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 text-center">
            <div className="text-lg font-bold text-slate-200">{stats.total}</div>
            <div className="text-[10px] text-slate-400 uppercase">Total Attempts</div>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 text-center">
            <div className="text-lg font-bold text-emerald-300">{stats.completed}</div>
            <div className="text-[10px] text-slate-400 uppercase">Completed</div>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 text-center">
            <div className="text-lg font-bold text-blue-300">{stats.total - stats.completed}</div>
            <div className="text-[10px] text-slate-400 uppercase">In Progress</div>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 text-center">
            <div className="text-lg font-bold text-amber-300">{stats.completionRate}%</div>
            <div className="text-[10px] text-slate-400 uppercase">Completion Rate</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search by student..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm">
          <option value="">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="IN_PROGRESS">In Progress</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/60 border-b border-slate-700/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Subsection</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Score</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Time</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Attempts</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Last Attempt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center"><Loader2 size={24} className="animate-spin text-rose-400 mx-auto" /></td></tr>
            ) : assessments.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">No assessments</td></tr>
            ) : assessments.map(a => (
              <tr key={a.id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <div className="text-slate-200 text-xs font-medium">{a.user?.name || "—"}</div>
                  <div className="text-[10px] text-slate-500">{a.user?.email || ""}</div>
                </td>
                <td className="px-4 py-3 text-slate-300 text-xs">{a.category}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{a.subsection}</td>
                <td className="px-4 py-3 text-center text-xs">
                  <span className={`font-semibold ${a.score >= 70 ? "text-emerald-300" : a.score >= 40 ? "text-amber-300" : "text-red-300"}`}>
                    {a.score}/{a.totalQuestions}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-xs text-slate-500">{Math.floor(a.timeTaken / 60)}m {a.timeTaken % 60}s</td>
                <td className="px-4 py-3 text-center text-xs text-slate-500">{a.attempts}</td>
                <td className="px-4 py-3 text-center">
                  {a.status === "COMPLETED" ? <CheckCircle2 size={16} className="text-emerald-400 mx-auto" /> : <XCircle size={16} className="text-slate-500 mx-auto" />}
                </td>
                <td className="px-4 py-3 text-center text-xs text-slate-500">{new Date(a.lastAttemptAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
