// Fraylon Admin - Phase 2
import { useParams } from "react-router-dom";
import { AdminBreadcrumb } from "../../components/admin/AdminBreadcrumb";
import { CourseEditorNav } from "../../components/admin/CourseEditorNav";
import { History, GitCommit, PlayCircle, Eye } from "lucide-react";

export default function VersionHistory() {
  const { courseId } = useParams();

  const versions = [
    { id: 1, version: "v1.2.0", date: "Today at 10:42 AM", author: "Admin", changes: "Added capstone project and fixed typo in React lesson" },
    { id: 2, version: "v1.1.0", date: "Yesterday at 3:15 PM", author: "Admin", changes: "Updated video links for Node.js module" },
    { id: 3, version: "v1.0.0", date: "Jun 16, 2025", author: "Admin", changes: "Initial course publication" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <div className="p-8 pb-0 shrink-0">
        <AdminBreadcrumb items={[
          { label: "Content Studio", path: "/admin/content-studio" },
          { label: "Course Editor" }
        ]} />
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Version History</h1>
          <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
            <History className="w-4 h-4" />
            Create Snapshot
          </button>
        </div>
      </div>

      <CourseEditorNav courseId={courseId || "draft"} />

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-4xl mx-auto pb-24">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-900">Timeline</h3>
              <p className="text-sm text-slate-500">Every time you publish, a snapshot is saved automatically.</p>
            </div>
            
            <div className="p-6">
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-10 py-2">
                {versions.map((v, i) => (
                  <div key={v.id} className="relative pl-8">
                    <div className="absolute w-6 h-6 bg-blue-100 rounded-full -left-[13px] flex items-center justify-center border-4 border-white">
                      {i === 0 ? <PlayCircle className="w-3 h-3 text-blue-600" /> : <GitCommit className="w-3 h-3 text-slate-500" />}
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`font-bold ${i === 0 ? 'text-blue-600' : 'text-slate-900'}`}>{v.version}</span>
                          {i === 0 && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Current</span>}
                        </div>
                        <p className="text-sm text-slate-500 mb-3">{v.date} by {v.author}</p>
                        <p className="text-sm text-slate-700">{v.changes}</p>
                      </div>
                      
                      {i !== 0 && (
                        <div className="flex gap-2">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200" title="Preview this version">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                            Restore
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
