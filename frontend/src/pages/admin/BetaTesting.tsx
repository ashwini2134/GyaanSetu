// Fraylon Admin - Phase 2
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AdminBreadcrumb } from "../../components/admin/AdminBreadcrumb";
import { CourseEditorNav } from "../../components/admin/CourseEditorNav";
import { Users, Mail, MessageSquare, ExternalLink } from "lucide-react";
import { authFetch } from "../../authClient";

export default function BetaTesting() {
  const { courseId } = useParams();
  const [betaActive, setBetaActive] = useState(false);
  const [testers, setTesters] = useState<any[]>([]);

  useEffect(() => {
    if (!courseId) return;
    authFetch<any>(`/admin/courses/${courseId}/beta`)
      .then(data => {
        if (data) {
          setBetaActive(data.betaActive);
          if (data.testers) setTesters(data.testers);
        }
      })
      .catch(console.error);
  }, [courseId]);

  const toggleBeta = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const active = e.target.checked;
    setBetaActive(active); // Optimistic UI
    try {
      await authFetch(`/admin/courses/${courseId}/beta/toggle`, {
        method: 'POST',
        body: JSON.stringify({ active })
      });
    } catch (err: any) {
      setBetaActive(!active); // Revert
      alert("Failed to toggle beta: " + err.message);
    }
  };

  const inviteTester = async () => {
    const email = prompt("Enter tester email:");
    if (!email) return;
    try {
      await authFetch(`/admin/courses/${courseId}/beta/invite`, {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      alert("Invitation sent!");
      const data = await authFetch<any>(`/admin/courses/${courseId}/beta`);
      if (data && data.testers) setTesters(data.testers);
    } catch (err: any) {
      alert("Failed to invite: " + err.message);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <div className="p-8 pb-0 shrink-0">
        <AdminBreadcrumb items={[
          { label: "Content Studio", path: "/admin/content-studio" },
          { label: "Course Editor" }
        ]} />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Beta Testing</h1>
            <p className="text-slate-400 mt-1">Invite users to test your course before public launch.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-300">Beta Mode:</span>
            <label className="ai-toggle">
              <input 
                type="checkbox" 
                checked={betaActive}
                onChange={toggleBeta}
              />
              <span className="ai-toggle-track">
                <span className="ai-toggle-thumb"></span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <CourseEditorNav courseId={courseId || "draft"} />

      <div className="flex-1 overflow-y-auto p-8 bg-[#0a0f1e]">
        <div className="max-w-5xl mx-auto space-y-8 pb-24">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0f172a] p-6 rounded-xl border border-white/10 shadow-sm">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-blue-100 text-blue-400 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-100">Active Testers</h3>
              </div>
              <p className="text-3xl font-bold text-slate-100 ml-14">{testers.length}</p>
            </div>
            
            <div className="bg-[#0f172a] p-6 rounded-xl border border-white/10 shadow-sm md:col-span-2 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-100 mb-1">Invite Testers</h3>
                <p className="text-sm text-slate-400">Send an email invitation to enrolled students or external users.</p>
              </div>
              <button 
                onClick={inviteTester}
                className="px-5 py-2.5 bg-[#0f172a] border border-white/10 text-slate-300 rounded-lg font-medium hover:bg-[#0a0f1e] transition-colors shadow-sm flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Invite Users
              </button>
            </div>
          </div>

          <div className="bg-[#0f172a] rounded-xl shadow-sm border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-[#0a0f1e]">
              <h3 className="font-semibold text-slate-100">Tester Feedback & Progress</h3>
            </div>
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#0a0f1e] text-slate-400 font-medium text-xs uppercase border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Feedback Items</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {testers.map(t => (
                  <tr key={t.id} className="hover:bg-[#0a0f1e]/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-100">{t.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{t.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                          <div className="h-full bg-blue-900/300 rounded-full" style={{ width: `${t.progress || 0}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-300">{t.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MessageSquare className="w-4 h-4" />
                        <span>{t.feedback || 0} items</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-medium text-blue-400 hover:text-blue-800 transition-colors flex items-center gap-1 justify-end ml-auto">
                        View Log <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
                {testers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      No beta testers invited yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </div>
  );
}
