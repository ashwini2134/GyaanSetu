import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../authClient";
import { Loader2, Save, Settings, ShieldCheck } from "lucide-react";

type Settings = {
  siteName: string; maintenanceMode: boolean; allowRegistrations: boolean;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authFetch<Settings>("/admin/settings");
      setSettings(data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await authFetch("/admin/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
    } catch {} finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="text-slate-400" size={24} />
          Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">Platform configuration</p>
      </div>

      <div className="max-w-xl space-y-4">
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-400" />
            General
          </h2>

          <div>
            <label className="text-xs text-slate-400 uppercase block mb-1">Site Name</label>
            <input value={settings?.siteName || ""} onChange={e => setSettings(s => s ? { ...s, siteName: e.target.value } : s)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700/50 text-slate-200 text-sm" />
          </div>

          {settings && (
            <>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={settings.maintenanceMode}
                  onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-blue-500" />
                <div>
                  <div className="text-sm text-slate-200">Maintenance Mode</div>
                  <div className="text-[10px] text-slate-500">Block all non-admin access</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={settings.allowRegistrations}
                  onChange={e => setSettings({ ...settings, allowRegistrations: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-blue-500" />
                <div>
                  <div className="text-sm text-slate-200">Allow Registrations</div>
                  <div className="text-[10px] text-slate-500">New users can sign up</div>
                </div>
              </label>
            </>
          )}

          <button onClick={save} disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-lg bg-blue-600/20 text-blue-300 text-sm font-medium border border-blue-500/30 hover:bg-blue-600/30 disabled:opacity-50">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Settings</>}
          </button>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 space-y-2">
          <h2 className="text-sm font-semibold text-slate-200">System Info</h2>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-400"><span>Backend</span><span className="text-slate-300">localhost:3001</span></div>
            <div className="flex justify-between text-slate-400"><span>Frontend</span><span className="text-slate-300">localhost:5173</span></div>
            <div className="flex justify-between text-slate-400"><span>Database</span><span className="text-slate-300">PostgreSQL</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
