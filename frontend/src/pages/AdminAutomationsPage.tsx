import { useState } from "react";
import { authFetch } from "../authClient";
import { Award, Ban, Loader2, Play, ShieldCheck, Zap } from "lucide-react";

type AutomationResult = {
  issuedCount?: number; errorCount?: number; issues?: any[]; suspended?: number; students?: any[];
};

export default function AdminAutomationsPage() {
  const [result, setResult] = useState<AutomationResult | null>(null);
  const [running, setRunning] = useState<string | null>(null);

  const run = async (action: string, url: string) => {
    setRunning(action);
    setResult(null);
    try {
      const data = await authFetch<AutomationResult>(url, { method: "POST" });
      setResult(data);
    } catch {} finally { setRunning(null); }
  };

  const actions = [
    {
      id: "certificates",
      title: "Issue All Certificates",
      desc: "Check every student against every course and issue certificates to all eligible students",
      icon: Award,
      color: "text-yellow-400",
      bg: "bg-yellow-600/20",
      border: "border-yellow-500/30",
      url: "/admin/automations/issue-all-certificates",
    },
    {
      id: "suspend",
      title: "Suspend Inactive Students",
      desc: "Suspend students who haven't been active in 30+ days",
      icon: Ban,
      color: "text-red-400",
      bg: "bg-red-600/20",
      border: "border-red-500/30",
      url: "/admin/automations/suspend-inactive",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="text-blue-400" size={24} />
          Automations
        </h1>
        <p className="text-sm text-slate-400 mt-1">Run bulk operations and automated workflows</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map(a => (
          <div key={a.id} className={`rounded-xl border ${a.border} ${a.bg} p-5 space-y-3`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${a.bg} ${a.border}`}>
                <a.icon size={20} className={a.color} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-200">{a.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{a.desc}</p>
              </div>
            </div>
            <button onClick={() => run(a.id, a.url)} disabled={running !== null}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${a.bg} ${a.border} ${a.color} hover:opacity-80 disabled:opacity-50`}>
              {running === a.id ? (
                <><Loader2 size={14} className="animate-spin" /> Running...</>
              ) : (
                <><Play size={14} /> Run Automation</>
              )}
            </button>
          </div>
        ))}
      </div>

      {running && (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 size={20} className="animate-spin text-blue-400" />
          <span className="text-sm">Processing...</span>
        </div>
      )}

      {result && !running && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            Result
          </h3>
          {result.issuedCount !== undefined && (
            <div className="text-sm text-slate-300">
              Issued <span className="text-emerald-300 font-bold">{result.issuedCount}</span> certificates
              {result.errorCount !== undefined && result.errorCount > 0 && (
                <span className="text-red-400">, {result.errorCount} errors</span>
              )}
            </div>
          )}
          {result.suspended !== undefined && (
            <div className="text-sm text-slate-300">
              Suspended <span className="text-red-300 font-bold">{result.suspended}</span> inactive students
            </div>
          )}
          {result.students && result.students.length > 0 && (
            <div className="text-xs text-slate-500 space-y-1 max-h-40 overflow-y-auto">
              {result.students.map((s: any) => (
                <div key={s.id} className="flex justify-between">
                  <span>{s.name} ({s.email})</span>
                  <span className="text-slate-600">{s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleDateString() : "never"}</span>
                </div>
              ))}
            </div>
          )}
          {result.issues && result.issues.length > 0 && (
            <div className="text-xs text-slate-500 space-y-1 max-h-40 overflow-y-auto">
              {result.issues.slice(0, 20).map((i: any, idx: number) => (
                <div key={idx} className="flex justify-between">
                  <span>{i.name} &rarr; {i.courseSlug}</span>
                  <span className="text-emerald-400">{i.certNumber}</span>
                </div>
              ))}
              {result.issues.length > 20 && <div className="text-slate-600">...and {result.issues.length - 20} more</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
