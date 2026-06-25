import { useEffect, useState } from "react";
import { authFetch } from "../authClient";
import {
  AlertTriangle, Brain, CheckCircle, Clock, Database, ExternalLink, Loader2,
  RefreshCw, Server, ShieldCheck, XCircle, Activity,
} from "lucide-react";

interface ServiceStatus {
  backend: boolean;
  database: boolean;
  certsApi: boolean;
  aiProvider: boolean;
  smtp: boolean;
}

interface FailureEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  affectedUserId?: string;
  retryCount: number;
  status: "failed" | "retrying" | "resolved";
}

export default function AdminOperationsMonitorPage() {
  const [services, setServices] = useState<ServiceStatus | null>(null);
  const [failures, setFailures] = useState<FailureEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [healthRes, failuresRes] = await Promise.all([
          authFetch<ServiceStatus>("/admin/health").catch(() => null),
          authFetch<{ failures: FailureEvent[] }>("/admin/failures").catch(() => ({ failures: [] })),
        ]);
        setServices(healthRes);
        setFailures(failuresRes.failures ?? []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-400" />
      </div>
    );
  }

  const allHealthy = services
    ? Object.values(services).every(Boolean)
    : true;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100">
      <div className="relative overflow-hidden border-b border-slate-800">
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl border ${allHealthy ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-rose-500/20 bg-rose-500/10'}`}>
              <Activity size={28} className={allHealthy ? "text-emerald-400" : "text-rose-400"} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Operations Monitor</h1>
              <p className="text-slate-400 text-sm mt-1">
                {allHealthy
                  ? "All systems operational. No issues detected."
                  : "Some services require attention."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Service Status */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
            <Server size={16} className="text-blue-400" />
            Service Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {services && [
              { key: "backend" as const, label: "Backend API", icon: Server },
              { key: "database" as const, label: "Database", icon: Database },
              { key: "certsApi" as const, label: "Certs API", icon: ExternalLink },
              { key: "aiProvider" as const, label: "AI Provider", icon: Brain },
              { key: "smtp" as const, label: "Email (SMTP)", icon: Clock },
            ].map((s) => {
              const Icon = s.icon;
              const healthy = services[s.key];
              return (
                <div key={s.key} className={`flex items-center gap-2 p-3 rounded-lg border ${healthy ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                  <Icon size={16} className={healthy ? "text-emerald-400" : "text-red-400"} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-300 truncate">{s.label}</p>
                    <p className={`text-[10px] ${healthy ? 'text-emerald-400' : 'text-red-400'}`}>
                      {healthy ? "Operational" : "Down"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Failures */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-400" />
            Recent Failures
          </h2>
          {failures.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <CheckCircle size={32} className="text-emerald-500/50 mb-2" />
              <p className="text-sm">No recent failures</p>
              <p className="text-xs text-slate-600 mt-1">All automated processes running smoothly</p>
            </div>
          ) : (
            <div className="space-y-2">
              {failures.map((f) => (
                <div key={f.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-700/30 bg-slate-800/30">
                  {f.status === "resolved" ? (
                    <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  ) : f.status === "retrying" ? (
                    <RefreshCw size={16} className="text-blue-400 mt-0.5 flex-shrink-0 animate-spin" />
                  ) : (
                    <XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-slate-200">{f.type}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                        f.status === "resolved"
                          ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                          : f.status === "retrying"
                          ? "text-blue-400 border-blue-500/20 bg-blue-500/10"
                          : "text-red-400 border-red-500/20 bg-red-500/10"
                      }`}>
                        {f.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{f.message}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                      <span>{new Date(f.timestamp).toLocaleString()}</span>
                      <span>Retries: {f.retryCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Note */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-400">
              <p className="text-slate-300 font-medium mb-1">Automated Operations</p>
              <p>Certificate issuance, AI evaluations, project reviews, notifications, inactivity suspension, and all other automated workflows run in the background. This page only shows exceptions that need manual review.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
