import { useCallback, useEffect, useMemo, useState } from "react";
import { authFetch } from "../authClient";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Search,
  UserX,
  XCircle,
  Archive,
  Flag,
} from "lucide-react";

type QueueUser = {
  id: string;
  name: string;
  email: string;
};

type QueueItem = {
  id: string;
  itemType: string;
  itemId: string;
  userId: string | null;
  user: QueueUser | null;
  priority: string;
  title: string;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

type QueueCounts = {
  total: number;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string; icon: typeof Flag }> = {
  critical: { bg: "bg-red-900/40 border-red-500/40", text: "text-red-300", icon: AlertTriangle },
  high: { bg: "bg-orange-900/40 border-orange-500/40", text: "text-orange-300", icon: Flag },
  medium: { bg: "bg-blue-900/40 border-blue-500/40", text: "text-blue-300", icon: Clock },
  low: { bg: "bg-slate-800/40 border-slate-600/40", text: "text-slate-300", icon: Archive },
};

const TYPE_LABELS: Record<string, string> = {
  project: "Project Review",
  inactive_student: "Inactive Student",
  certification: "Certification",
  portfolio: "Portfolio Review",
  assessment: "Assessment Review",
  capstone: "Capstone Review",
  placement_eligible: "Placement Eligible",
  overdue: "Overdue Submission",
};

const TYPE_ICONS: Record<string, typeof FileText> = {
  project: FileText,
  inactive_student: UserX,
};

const ITEM_TYPES = ["all", "project", "inactive_student"];

export default function ReviewQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [counts, setCounts] = useState<QueueCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ id: string; notes: string } | null>(null);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authFetch<{ items: QueueItem[]; counts: QueueCounts }>("/admin/review-queue");
      setItems(data.items);
      setCounts(data.counts);
    } catch (err: any) {
      setError(err.message || "Failed to load review queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const filtered = useMemo(() => {
    let result = items;
    if (activeTab !== "all") {
      result = result.filter((i) => i.itemType === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.user?.name.toLowerCase().includes(q) ||
          i.user?.email.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, activeTab, searchQuery]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  };

  const handleBulkResolve = async () => {
    setActionLoading("bulk");
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          authFetch(`/admin/review-queue/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "resolved" }),
          })
        )
      );
      setSelected(new Set());
      await fetchQueue();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (id: string) => {
    setActionLoading(id);
    try {
      await authFetch(`/admin/review-queue/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "resolved" }),
      });
      await fetchQueue();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectDialog) return;
    setActionLoading(rejectDialog.id);
    try {
      await authFetch(`/admin/review-queue/${rejectDialog.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "rejected", notes: rejectDialog.notes }),
      });
      setRejectDialog(null);
      await fetchQueue();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveProject = async (item: QueueItem) => {
    if (!item.userId) return;
    setActionLoading(item.id);
    try {
      await authFetch(`/projects/admin/approve/${item.itemId}`, {
        method: "POST",
        body: JSON.stringify({ userId: item.userId }),
      });
      await fetchQueue();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="text-amber-400" size={24} />
            Review Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {counts ? `${counts.total} pending items requiring action` : "Loading..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={handleBulkResolve}
              disabled={actionLoading === "bulk"}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all disabled:opacity-50"
            >
              {actionLoading === "bulk" ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Resolve {selected.size} Selected
            </button>
          )}
          <button
            onClick={fetchQueue}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all border border-slate-700/50"
          >
            <Loader2 size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Priority Summary */}
      {counts && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["critical", "high", "medium", "low"].map((p) => {
            const style = PRIORITY_STYLES[p];
            const Icon = style.icon;
            const count = counts.byPriority[p] || 0;
            return (
              <div
                key={p}
                className={`rounded-xl border p-4 ${style.bg} flex items-center gap-3`}
              >
                <Icon size={20} className={style.text} />
                <div>
                  <div className={`text-lg font-bold ${style.text}`}>{count}</div>
                  <div className="text-xs text-slate-400 capitalize">{p} Priority</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-2 overflow-x-auto">
        {ITEM_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => { setActiveTab(type); setSelected(new Set()); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === type
                ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            {type === "all" ? "All" : TYPE_LABELS[type] || type}
            {counts && type !== "all" && (
              <span className="ml-2 text-xs opacity-70">({counts.byType[type] || 0})</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search by title, student name, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-900/30 border border-red-500/30 p-4 text-red-300 text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">Dismiss</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-400" />
        </div>
      )}

      {/* Select All checkbox */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <input
            type="checkbox"
            checked={selected.size === filtered.length && filtered.length > 0}
            onChange={toggleSelectAll}
            className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/30"
          />
          <span className="text-xs text-slate-400">
            {selected.size === 0
              ? `Select all ${filtered.length} items`
              : `${selected.size} of ${filtered.length} selected`}
          </span>
        </div>
      )}

      {/* Queue Items */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <CheckCircle size={48} className="mb-4 text-slate-600" />
          <p className="text-lg font-medium">All caught up!</p>
          <p className="text-sm">No {activeTab !== "all" ? TYPE_LABELS[activeTab]?.toLowerCase() : "pending"} items.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((item) => {
          const isProject = item.itemType === "project";
          const isInactive = item.itemType === "inactive_student";
          const priorityStyle = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.medium;
          const PriorityIcon = priorityStyle.icon;
          const TypeIcon = TYPE_ICONS[item.itemType] || FileText;

          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-all duration-200 ${
                item.priority === "critical"
                  ? "border-red-500/20 bg-red-950/20"
                  : item.priority === "high"
                  ? "border-orange-500/20 bg-orange-950/10"
                  : "border-slate-700/50 bg-slate-900/60"
              } hover:border-slate-600/50 hover:bg-slate-900/80`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="mt-1 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/30"
                  />

                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${priorityStyle.bg} flex-shrink-0`}>
                    <TypeIcon size={18} className={priorityStyle.text} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-200">{item.title}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${priorityStyle.bg} ${priorityStyle.text} capitalize`}>
                        <PriorityIcon size={10} />
                        {item.priority}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700/50">
                        {TYPE_LABELS[item.itemType] || item.itemType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      {item.user && (
                        <span>
                          {item.user.name} ({item.user.email})
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {item.metadata?.githubUrl && (
                        <a
                          href={item.metadata.githubUrl as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink size={12} />
                          GitHub
                        </a>
                      )}
                      {item.metadata?.liveDemoUrl && (
                        <a
                          href={item.metadata.liveDemoUrl as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink size={12} />
                          Demo
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isProject && (
                      <>
                        <button
                          onClick={() => handleApproveProject(item)}
                          disabled={actionLoading === item.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all disabled:opacity-50"
                        >
                          {actionLoading === item.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectDialog({ id: item.id, notes: "" })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium transition-all"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleResolve(item.id)}
                      disabled={actionLoading === item.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-all disabled:opacity-50"
                      title={isInactive ? "Mark as active" : "Mark as resolved"}
                    >
                      {actionLoading === item.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      {isInactive ? "Mark Active" : "Resolve"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reject Dialog */}
      {rejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-[#161B22] border border-slate-700/50 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Request Revision</h3>
            <p className="text-sm text-slate-400">Provide feedback on what needs to change:</p>
            <textarea
              value={rejectDialog.notes}
              onChange={(e) => setRejectDialog({ ...rejectDialog, notes: e.target.value })}
              placeholder="Describe what needs to be improved..."
              rows={4}
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm p-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRejectDialog(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading === rejectDialog.id}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === rejectDialog.id ? <Loader2 size={14} className="animate-spin" /> : null}
                {rejectDialog.notes.trim() ? "Send Feedback & Reject" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
