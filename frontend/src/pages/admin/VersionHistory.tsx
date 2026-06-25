// Fraylon Admin - Phase 2
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AdminBreadcrumb } from "../../components/admin/AdminBreadcrumb";
import { CourseEditorNav } from "../../components/admin/CourseEditorNav";
import { History, GitCommit, PlayCircle, Eye } from "lucide-react";
import { authFetch } from "../../authClient";

export default function VersionHistory() {
  const { courseId } = useParams();
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    if (!courseId) return;
    authFetch<any[]>(`/admin/courses/${courseId}/versions`)
      .then(setVersions)
      .catch(console.error);
  }, [courseId]);

  const handleCreateSnapshot = async () => {
    const changes = prompt("Enter a description for this snapshot:");
    if (!changes) return;
    try {
      const v = await authFetch<any>(`/admin/courses/${courseId}/versions`, {
        method: 'POST',
        body: JSON.stringify({ changes })
      });
      setVersions([v, ...versions]);
    } catch (err: any) {
      alert("Failed: " + err.message);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm("Are you sure you want to restore this version?")) return;
    try {
      await authFetch(`/admin/versions/${versionId}/restore`, { method: 'POST' });
      alert("Version restored successfully!");
      const updated = await authFetch<any[]>(`/admin/courses/${courseId}/versions`);
      setVersions(updated);
    } catch (err: any) {
      alert("Restore failed: " + err.message);
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
          <h1 className="text-2xl font-bold text-slate-100">Version History</h1>
          <button 
            onClick={handleCreateSnapshot}
            className="px-5 py-2.5 bg-[#0f172a] border border-white/10 text-slate-300 rounded-lg font-medium hover:bg-[#0a0f1e] transition-colors shadow-sm flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Create Snapshot
          </button>
        </div>
      </div>

      <CourseEditorNav courseId={courseId || "draft"} />

      <div className="flex-1 overflow-y-auto p-8 bg-[#0a0f1e]">
        <div className="max-w-4xl mx-auto pb-24">
          <div className="bg-[#0f172a] rounded-xl shadow-sm border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-[#0a0f1e]">
              <h3 className="font-semibold text-slate-100">Timeline</h3>
              <p className="text-sm text-slate-400">Every time you publish, a snapshot is saved automatically.</p>
            </div>
            
            <div className="p-6">
              <div className="relative border-l-2 border-white/10 ml-3 space-y-10 py-2">
                {versions.map((v, i) => (
                  <div key={v.id} className="relative pl-8">
                    <div className="absolute w-6 h-6 bg-blue-100 rounded-full -left-[13px] flex items-center justify-center border-4 border-white">
                      {i === 0 ? <PlayCircle className="w-3 h-3 text-blue-400" /> : <GitCommit className="w-3 h-3 text-slate-400" />}
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`font-bold ${i === 0 ? 'text-blue-400' : 'text-slate-100'}`}>{v.versionNumber}</span>
                          {i === 0 && <span className="bg-blue-100 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Current</span>}
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{new Date(v.createdAt).toLocaleString()}</p>
                        <p className="text-sm text-slate-300">{v.changes}</p>
                      </div>
                      
                      {i !== 0 && (
                        <div className="flex gap-2">
                          <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors border border-transparent hover:border-blue-200" title="Preview this version">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRestore(v.id)}
                            className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                          >
                            Restore
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {versions.length === 0 && (
                  <div className="pl-8 text-slate-400">
                    No versions found for this course.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
