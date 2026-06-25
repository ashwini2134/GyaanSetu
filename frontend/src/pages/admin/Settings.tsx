// Fraylon Admin - Phase 1
export default function Settings() {
  const sections = [
    { title: "Branding", desc: "Customize platform colors, logos, and typography" },
    { title: "AI Configuration", desc: "Manage API keys and model parameters" },
    { title: "Email Templates", desc: "Edit welcome, reset, and notification emails" },
    { title: "Roles & Permissions", desc: "Manage admin and instructor access levels" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Platform configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((sec) => (
          <div key={sec.title} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-blue-300 transition-colors cursor-pointer group">
            <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{sec.title}</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{sec.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
