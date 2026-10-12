import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../authClient";
import { Award, CheckCircle, Loader2, Search, XCircle, BarChart3, TrendingUp } from "lucide-react";

type Certificate = {
  id: string; userId: string; courseSlug: string; certNumber: string;
  issuedAt: string; issuedBy: string; avgScore: number | null;
  status: string; revokedAt: string | null; revokeReason: string | null;
  user: { id: string; name: string; email: string } | null;
};

type EligibleItem = {
  userId: string; name: string; email: string;
  courseSlug: string; avgQuizScore: number | null;
};

type Stats = {
  total: number; byCourse: Record<string, number>;
  byStatus: Record<string, number>;
  recentIssued: number; revoked: number;
};

type Trends = {
  byMonth: Record<string, number>;
  byCourseMonth: Record<string, Record<string, number>>;
};

export default function AdminCertificationsPage() {
  const [tab, setTab] = useState<"issued" | "issue" | "analytics">("issued");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [eligible, setEligible] = useState<EligibleItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [trends, setTrends] = useState<Trends | null>(null);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchIssued = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      const [cData, sData] = await Promise.all([
        authFetch<{ certificates: Certificate[] }>(`/admin/certifications?${params}`),
        authFetch<Stats>("/admin/certifications/stats"),
      ]);
      setCertificates(cData.certificates);
      setStats(sData);
    } catch {} finally { setLoading(false); }
  }, [search, statusFilter]);

  const fetchEligible = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authFetch<{ eligible: EligibleItem[] }>("/certifications/admin/eligible");
      setEligible(data.eligible);
    } catch {} finally { setLoading(false); }
  }, []);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    try {
      const [tData, sData] = await Promise.all([
        authFetch<Trends>("/admin/certifications/trends"),
        authFetch<Stats>("/admin/certifications/stats"),
      ]);
      setTrends(tData);
      setStats(sData);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === "issued") fetchIssued();
    else if (tab === "issue") fetchEligible();
    else fetchTrends();
  }, [tab, fetchIssued, fetchEligible, fetchTrends]);

  const handleIssue = async (userId: string, courseSlug: string) => {
    const key = `${userId}_${courseSlug}`;
    setIssuing(p => ({ ...p, [key]: true }));
    try {
      await authFetch("/certifications/admin/issue", {
        method: "POST",
        body: JSON.stringify({ userId, courseSlug }),
      });
      setEligible(p => p.filter(e => e.userId !== userId || e.courseSlug !== courseSlug));
    } catch {} finally { setIssuing(p => ({ ...p, [key]: false })); }
  };

  const handleRevoke = async (certId: string, certNumber: string) => {
    const reason = prompt(`Reason for revoking ${certNumber}:`);
    if (!reason) return;
    try {
      await authFetch("/admin/certifications/revoke", {
        method: "POST",
        body: JSON.stringify({ certId, reason }),
      });
      fetchIssued();
    } catch {}
  };

  const COURSE_COLORS: Record<string, string> = {
    'fundamentals-of-ai': "#00BFB3",
    python: "#009E95",
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Award className="text-yellow-400" size={24} />
          Certifications
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {stats?.total || 0} total · {stats?.recentIssued || 0} in last 30d · {stats?.revoked || 0} revoked · {eligible.length} eligible
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-2">
        {(["issued", "issue", "analytics"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? "bg-yellow-600/20 text-yellow-300 border border-yellow-500/30" : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}>
            {t === "analytics" ? <BarChart3 size={14} /> : t === "issue" ? <CheckCircle size={14} /> : null}
            {t === "issued" ? `Issued (${certificates.length})` : t === "issue" ? `Eligible (${eligible.length})` : "Analytics"}
          </button>
        ))}
      </div>

      {tab === "issued" && (
        <>
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search by student..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs">
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-700/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Cert #</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Avg Score</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Issued</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center"><Loader2 size={24} className="animate-spin text-yellow-400 mx-auto" /></td></tr>
                ) : certificates.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">No certificates found</td></tr>
                ) : certificates.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="text-slate-200 text-xs font-medium">{c.user?.name || "—"}</div>
                      <div className="text-[10px] text-slate-500">{c.user?.email || ""}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{c.courseSlug}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs font-mono">{c.certNumber}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                        c.status === "active" ? "text-emerald-400 bg-emerald-900/30 border-emerald-700/40" : "text-red-400 bg-red-900/30 border-red-700/40"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{c.avgScore != null ? <span className="text-emerald-300 text-xs font-semibold">{c.avgScore}%</span> : <span className="text-slate-600 text-xs">—</span>}</td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500">{new Date(c.issuedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      {c.status === "active" && (
                        <button onClick={() => handleRevoke(c.id, c.certNumber)}
                          className="inline-flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-red-300"
                          title="Revoke">
                          <XCircle size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "issue" && (
        loading ? (
          <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-yellow-400" /></div>
        ) : eligible.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No eligible students</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eligible.map((e, i) => {
              const key = `${e.userId}_${e.courseSlug}`;
              return (
                <div key={`${e.userId}-${e.courseSlug}-${i}`} className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-200">{e.name}</div>
                      <div className="text-[10px] text-slate-500">{e.email}</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">{e.courseSlug}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    {e.avgQuizScore != null && (
                      <span className="text-xs text-emerald-300">Avg Quiz: {e.avgQuizScore}%</span>
                    )}
                  </div>
                  <button onClick={() => handleIssue(e.userId, e.courseSlug)} disabled={issuing[key]}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-600/20 text-yellow-300 text-sm font-medium border border-yellow-500/30 hover:bg-yellow-600/30 disabled:opacity-50">
                    {issuing[key] ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    {issuing[key] ? "Issuing..." : "Issue Certificate"}
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === "analytics" && (
        loading ? (
          <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-yellow-400" /></div>
        ) : (
          <div className="space-y-6">
            {/* Summary cards */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-[10px] text-slate-400 uppercase mt-1">Total Issued</div>
                </div>
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
                  <div className="text-2xl font-bold text-emerald-400">{stats.recentIssued}</div>
                  <div className="text-[10px] text-slate-400 uppercase mt-1">Last 30 Days</div>
                </div>
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
                  <div className="text-2xl font-bold text-red-400">{stats.revoked}</div>
                  <div className="text-[10px] text-slate-400 uppercase mt-1">Revoked</div>
                </div>
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
                  <div className="text-2xl font-bold text-blue-400">{eligible.length}</div>
                  <div className="text-[10px] text-slate-400 uppercase mt-1">Eligible Now</div>
                </div>
              </div>
            )}

            {/* By course */}
            {stats?.byCourse && (
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <BarChart3 size={14} className="text-yellow-400" /> By Course
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.byCourse).map(([slug, count]) => {
                    const total = stats.total || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={slug}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 font-medium capitalize">{slug}</span>
                          <span className="text-slate-400">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: COURSE_COLORS[slug] || "#A855F7" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Issuance trends */}
            {trends?.byMonth && Object.keys(trends.byMonth).length > 0 && (
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <TrendingUp size={14} className="text-emerald-400" /> Monthly Issuance
                </h3>
                <div className="space-y-2">
                  {Object.entries(trends.byMonth).slice(-12).map(([month, count]) => {
                    const max = Math.max(...Object.values(trends.byMonth));
                    const barPct = max > 0 ? Math.round((count / max) * 100) : 0;
                    return (
                      <div key={month} className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 w-16 flex-shrink-0">{month}</span>
                        <div className="flex-1 h-5 bg-slate-800 rounded overflow-hidden relative">
                          <div className="h-full rounded bg-yellow-500/60 transition-all" style={{ width: `${barPct}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
