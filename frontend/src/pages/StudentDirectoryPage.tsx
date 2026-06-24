import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../authClient";
import {
  AlertTriangle, CheckCircle, ChevronDown, Clock, Loader2, Search, SlidersHorizontal, UserCheck, UserX, XCircle,
} from "lucide-react";

type Student = {
  id: string; name: string; email: string; xp: number; streak: number;
  status: string; joinedAt: string; lastActive: string;
  lecturesCompleted: number; quizzesPassed: number; problemsSolved: number;
  projectsCount: number; certificatesIssued: number;
};

export default function StudentDirectoryPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("totalXp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ sortBy, sortOrder });
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      const data = await authFetch<{ students: Student[]; total: number }>(`/admin/students?${params}`);
      setStudents(data.students);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy, sortOrder]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleSuspend = async (id: string) => {
    setActionLoading(id);
    try { await authFetch(`/admin/students/${id}/suspend`, { method: "POST" }); await fetchStudents(); }
    catch (err: any) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    try { await authFetch(`/admin/students/${id}/activate`, { method: "POST" }); await fetchStudents(); }
    catch (err: any) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) setSortOrder(o => o === "desc" ? "asc" : "desc");
    else { setSortBy(field); setSortOrder("desc"); }
  };

  const SortIcon = ({ field }: { field: string }) =>
    sortBy === field ? <ChevronDown size={14} className={`ml-1 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} /> : null;

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck className="text-blue-400" size={24} />
            Student Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">{total} student{total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search by name or email..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/30 border border-red-500/30 p-4 text-red-300 text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">Dismiss</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/60 border-b border-slate-700/50">
              {[
                { key: "name", label: "Student" },
                { key: "totalXp", label: "XP" },
                { key: "status", label: "Status" },
                { key: "lecturesCompleted", label: "Lectures" },
                { key: "quizzesPassed", label: "Quizzes" },
                { key: "problemsSolved", label: "Problems" },
                { key: "projectsCount", label: "Projects" },
                { key: "certificatesIssued", label: "Certs" },
                { key: "lastActive", label: "Last Active" },
              ].map(col => (
                <th key={col.key} onClick={() => col.key !== "status" && toggleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider ${col.key !== "status" ? "cursor-pointer hover:text-slate-200" : ""}`}>
                  <span className="flex items-center">{col.label}<SortIcon field={col.key} /></span>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {loading ? (
              <tr><td colSpan={10} className="px-4 py-12 text-center"><Loader2 size={24} className="animate-spin text-blue-400 mx-auto" /></td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-500">No students found</td></tr>
            ) : students.map(s => (
              <tr key={s.id} className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/students/${s.id}`)}>
                <td className="px-4 py-3">
                  <div className="text-slate-200 font-medium">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.email}</div>
                </td>
                <td className="px-4 py-3"><span className="text-blue-300 font-mono">{s.xp.toLocaleString()}</span></td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    s.status === "active" ? "bg-emerald-900/40 text-emerald-300 border border-emerald-500/30"
                    : "bg-red-900/40 text-red-300 border border-red-500/30"
                  }`}>
                    {s.status === "active" ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{s.lecturesCompleted}</td>
                <td className="px-4 py-3 text-slate-300">{s.quizzesPassed}</td>
                <td className="px-4 py-3 text-slate-300">{s.problemsSolved}</td>
                <td className="px-4 py-3 text-slate-300">{s.projectsCount}</td>
                <td className="px-4 py-3 text-slate-300">{s.certificatesIssued}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Clock size={12} />{new Date(s.lastActive).toLocaleDateString()}</span>
                </td>
                <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                  {s.status === "active" ? (
                    <button onClick={() => handleSuspend(s.id)} disabled={actionLoading === s.id}
                      className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-1.5 ml-auto">
                      {actionLoading === s.id ? <Loader2 size={12} className="animate-spin" /> : <UserX size={12} />}
                      Suspend
                    </button>
                  ) : (
                    <button onClick={() => handleActivate(s.id)} disabled={actionLoading === s.id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-1.5 ml-auto">
                      {actionLoading === s.id ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
