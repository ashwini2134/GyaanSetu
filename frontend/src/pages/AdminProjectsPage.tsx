import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../authClient";
import {
  CheckCircle, Clock, FolderKanban, Loader2, Plus, Search, Trash2, XCircle,
} from "lucide-react";

type ProjectSubmission = {
  id: string; userId: string; projectId: string; code: string; status: string;
  startedAt: string | null; completedAt: string | null; githubUrl: string | null;
  liveDemoUrl: string | null; description: string | null;
  user: { id: string; name: string; email: string } | null;
};

type Template = {
  id: string; title: string; category: string; difficulty: string;
  shortDescription: string; technologies: string[];
};

export default function AdminProjectsPage() {
  const [tab, setTab] = useState<"all" | "templates">("all");
  const [projects, setProjects] = useState<ProjectSubmission[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
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
      const [pData, sData, tData] = await Promise.all([
        authFetch<{ projects: ProjectSubmission[] }>(`/admin/projects?${params}`),
        authFetch<any>("/admin/projects/stats"),
        authFetch<{ templates: Template[] }>("/admin/projects/templates"),
      ]);
      setProjects(pData.projects);
      setStats(sData);
      setTemplates(tData.templates);
    } catch {} finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FolderKanban className="text-blue-400" size={24} />
          Projects
        </h1>
        <p className="text-sm text-slate-400 mt-1">{stats?.total || 0} total submissions, {stats?.templatesCount || 0} templates</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {["NOT_STARTED", "IN_PROGRESS", "PENDING_REVIEW", "COMPLETED", "REJECTED"].map(s => (
            <div key={s} className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-3 text-center">
              <div className="text-lg font-bold text-slate-200">{stats.byStatus[s] || 0}</div>
              <div className="text-[10px] text-slate-400 uppercase">{s.replace(/_/g, " ")}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-2">
        {(["all", "templates"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? "bg-blue-600/20 text-blue-300 border border-blue-500/30" : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}>{t} {t === "all" ? `(${projects.length})` : `(${templates.length})`}</button>
        ))}
      </div>

      {tab === "all" && (
        <>
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
              {["NOT_STARTED", "IN_PROGRESS", "PENDING_REVIEW", "COMPLETED", "REJECTED"].map(s => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-700/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Project</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Started</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Submitted</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center"><Loader2 size={24} className="animate-spin text-blue-400 mx-auto" /></td></tr>
                ) : projects.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No submissions</td></tr>
                ) : projects.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="text-slate-200 text-xs font-medium">{p.user?.name || "—"}</div>
                      <div className="text-[10px] text-slate-500">{p.user?.email || ""}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{p.projectId}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        p.status === "COMPLETED" ? "bg-emerald-900/40 text-emerald-300"
                        : p.status === "PENDING_REVIEW" ? "bg-amber-900/40 text-amber-300"
                        : p.status === "REJECTED" ? "bg-red-900/40 text-red-300"
                        : p.status === "IN_PROGRESS" ? "bg-blue-900/40 text-blue-300"
                        : "bg-slate-800 text-slate-400"
                      }`}>{p.status.replace(/_/g, " ")}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500">{p.startedAt ? new Date(p.startedAt).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500">{p.completedAt ? new Date(p.completedAt).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2 text-[10px]">
                        {p.githubUrl && <a href={p.githubUrl} target="_blank" className="text-blue-400 hover:text-blue-300">GitHub</a>}
                        {p.liveDemoUrl && <a href={p.liveDemoUrl} target="_blank" className="text-blue-400 hover:text-blue-300">Demo</a>}
                        {!p.githubUrl && !p.liveDemoUrl && <span className="text-slate-600">—</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">No templates yet</div>
          ) : templates.map(t => (
            <div key={t.id} className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-slate-200">{t.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  t.difficulty === "easy" ? "bg-emerald-900/40 text-emerald-300"
                  : t.difficulty === "hard" ? "bg-red-900/40 text-red-300"
                  : "bg-amber-900/40 text-amber-300"
                }`}>{t.difficulty}</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{t.shortDescription}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="px-1.5 py-0.5 rounded bg-slate-800">{t.category}</span>
                {t.technologies.slice(0, 3).map(tech => (
                  <span key={tech} className="px-1.5 py-0.5 rounded bg-slate-800">{tech}</span>
                ))}
                {t.technologies.length > 3 && <span>+{t.technologies.length - 3}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
