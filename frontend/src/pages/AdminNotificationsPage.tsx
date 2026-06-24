import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../authClient";
import {
  Bell,
  BellOff,
  CheckCircle,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  Users,
  X,
} from "lucide-react";

type NotifStats = { totalSent: number; readCount: number; unreadCount: number; readRate: number };
type NotifItem = {
  id: string; userId: string; type: string; title: string; body: string;
  link: string; readAt: string | null; createdAt: string;
  user: { id: string; name: string; email: string } | null;
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [stats, setStats] = useState<NotifStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authFetch<{ notifications: NotifItem[]; stats: NotifStats }>("/admin/notifications");
      setNotifications(data.notifications);
      setStats(data.stats);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      await authFetch("/admin/notifications/send", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), body: body.trim(), type: "course_update" }),
      });
      setTitle("");
      setBody("");
      setShowComposer(false);
      await fetch();
    } catch {} finally { setSending(false); }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="text-blue-400" size={24} />
            Notifications
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage platform notifications and announcements</p>
        </div>
        <button onClick={() => setShowComposer(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all">
          <Send size={16} /> Send Announcement
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Mail, label: "Total Sent", value: stats.totalSent, color: "text-blue-400" },
            { icon: CheckCircle, label: "Read", value: stats.readCount, color: "text-emerald-400" },
            { icon: BellOff, label: "Unread", value: stats.unreadCount, color: "text-amber-400" },
            { icon: Users, label: "Read Rate", value: `${stats.readRate}%`, color: "text-purple-400" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 flex items-center gap-3">
                <Icon size={20} className={s.color} />
                <div>
                  <div className={`text-lg font-bold ${s.color}`}>{s.value.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notification log */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Notification Log</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-blue-400" /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No notifications sent yet</div>
        ) : (
          <div className="divide-y divide-slate-700/30 max-h-[600px] overflow-y-auto">
            {notifications.map(n => (
              <div key={n.id} className="px-4 py-3 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${n.readAt ? 'bg-slate-800 text-slate-500' : 'bg-blue-900/30 text-blue-300'}`}>
                    <MessageSquare size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-200">{n.title}</span>
                      {!n.readAt && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.body}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                      <span>{n.user?.name || "System"}</span>
                      <span>{n.type}</span>
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                      <span className={n.readAt ? "text-emerald-400" : "text-amber-400"}>
                        {n.readAt ? "Read" : "Unread"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Composer modal */}
      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-[#161B22] border border-slate-700/50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Send size={18} className="text-blue-400" /> Send Announcement</h3>
              <button onClick={() => setShowComposer(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"><X size={18} /></button>
            </div>
            <p className="text-xs text-slate-400">This will be sent to all students as an in-app notification.</p>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Announcement title..."
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <textarea value={body} onChange={e => setBody(e.target.value)}
              placeholder="Announcement message..."
              rows={5}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowComposer(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium">Cancel</button>
              <button onClick={handleSend} disabled={sending || !title.trim() || !body.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all disabled:opacity-50">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Send to All Students
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
