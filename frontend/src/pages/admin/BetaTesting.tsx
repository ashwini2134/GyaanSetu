// Fraylon Admin - Phase 2
import { useParams } from "react-router-dom";
import { AdminBreadcrumb } from "../../components/admin/AdminBreadcrumb";
import { CourseEditorNav } from "../../components/admin/CourseEditorNav";
import { Users, Mail, MessageSquare, ExternalLink } from "lucide-react";

export default function BetaTesting() {
  const { courseId } = useParams();

  const testers = [
    { id: 1, name: "Alice Smith", email: "alice@example.com", progress: 45, feedback: 2 },
    { id: 2, name: "Bob Jones", email: "bob@example.com", progress: 100, feedback: 5 },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <div className="p-8 pb-0 shrink-0">
        <AdminBreadcrumb items={[
          { label: "Content Studio", path: "/admin/content-studio" },
          { label: "Course Editor" }
        ]} />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Beta Testing</h1>
            <p className="text-slate-500 mt-1">Invite users to test your course before public launch.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">Beta Mode:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <CourseEditorNav courseId={courseId || "draft"} />

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-8 pb-24">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900">Active Testers</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900 ml-14">24</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-2 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Invite Testers</h3>
                <p className="text-sm text-slate-500">Send an email invitation to enrolled students or external users.</p>
              </div>
              <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Invite Users
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-900">Tester Feedback & Progress</h3>
            </div>
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Feedback Items</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${t.progress}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-700">{t.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MessageSquare className="w-4 h-4" />
                        <span>{t.feedback} items</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 justify-end ml-auto">
                        View Log <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </div>
  );
}
