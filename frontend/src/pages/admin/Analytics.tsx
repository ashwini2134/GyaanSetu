// Fraylon Admin - Phase 1
export default function Analytics() {
  const metrics = [
    { label: "Completion Rate", value: "—" },
    { label: "Active Students", value: "—" },
    { label: "Pass Rate", value: "—" },
    { label: "Certificates Issued", value: "—" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Analytics</h1>
        <p className="text-slate-400 mt-1">Live platform insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 shadow-lg">
            <h3 className="text-sm font-medium text-slate-400">{m.label}</h3>
            <p className="text-3xl font-bold text-slate-100 mt-2">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
