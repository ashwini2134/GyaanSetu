// Fraylon Admin - Phase 1
import { CheckCircle2 } from "lucide-react";

export default function OperationsMonitor() {
  const systems = [
    { name: "AI Review Service", status: "Healthy", ping: "42ms" },
    { name: "Certificates Issuance", status: "Healthy", ping: "18ms" },
    { name: "Email Delivery", status: "Healthy", ping: "65ms" },
    { name: "Background Jobs", status: "Healthy", ping: "12ms" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Operations Monitor</h1>
        <p className="text-slate-400 mt-1">Platform health and background jobs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {systems.map((sys) => (
          <div key={sys.name} className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 shadow-lg flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-100">{sys.name}</h3>
              <p className="text-sm text-slate-400 mt-1">Latency: {sys.ping}</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>{sys.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
