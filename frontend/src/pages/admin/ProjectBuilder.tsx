// Fraylon Admin - Phase 2
import { useParams } from "react-router-dom";
import { AdminBreadcrumb } from "../../components/admin/AdminBreadcrumb";
import { CourseEditorNav } from "../../components/admin/CourseEditorNav";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { authFetch } from "../../authClient";

export default function ProjectBuilder() {
  const { courseId } = useParams();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submissionType, setSubmissionType] = useState("GITHUB");
  const [isCapstone, setIsCapstone] = useState(false);
  const [rubric, setRubric] = useState<any[]>([
    { criteria: "Code Quality", points: 20 },
    { criteria: "Functionality", points: 50 },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    authFetch<any[]>(`/admin/courses/${courseId}/projects`)
      .then(data => {
        if (data && data.length > 0) {
          const p = data[0];
          setProjectId(p.id);
          setTitle(p.title);
          setContent(p.description || "");
          setSubmissionType(p.submissionType || "GITHUB");
          setIsCapstone(p.isCapstone || false);
          if (p.rubric && Array.isArray(p.rubric) && p.rubric.length > 0) {
            setRubric(p.rubric);
          }
        }
      })
      .catch(console.error);
  }, [courseId]);

  const saveProject = async () => {
    setIsSaving(true);
    try {
      if (projectId) {
        await authFetch(`/admin/projects/${projectId}`, {
          method: 'PATCH',
          body: JSON.stringify({ title, description: content, submissionType, isCapstone, rubric })
        });
      } else {
        const newProj = await authFetch<any>(`/admin/courses/${courseId}/projects`, {
          method: 'POST',
          body: JSON.stringify({ title, description: content, submissionType, isCapstone, rubric })
        });
        setProjectId(newProj.id);
      }
      alert('Project saved successfully!');
    } catch (err: any) {
      alert('Failed to save project: ' + err.message);
    } finally {
      setIsSaving(false);
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
          <h1 className="text-2xl font-bold text-slate-900">Project Builder</h1>
          <button 
            onClick={saveProject}
            disabled={isSaving}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Project"}
          </button>
        </div>
      </div>

      <CourseEditorNav courseId={courseId || "draft"} />

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-8 pb-24">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Project Details</h2>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E-commerce Storefront" 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Submission Type</label>
                <select 
                  value={submissionType}
                  onChange={(e) => setSubmissionType(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GITHUB">GitHub Repository</option>
                  <option value="ZIP">File Upload (.zip)</option>
                  <option value="IDE">In-browser IDE</option>
                </select>
              </div>
            </div>
            
            <label className="flex items-center gap-3 pt-2 cursor-pointer mb-6">
              <input 
                type="checkbox" 
                checked={isCapstone}
                onChange={(e) => setIsCapstone(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
              />
              <div>
                <span className="text-sm font-medium text-slate-900 block">Is Capstone Project?</span>
                <span className="text-xs text-slate-500">Capstone projects are required for course completion and certificate generation.</span>
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Project Requirements</label>
              <RichTextEditor content={content} onChange={setContent} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">AI Grading Rubric</h2>
            <p className="text-sm text-slate-500 mb-6">Define the criteria the AI will use to evaluate student submissions.</p>

            <div className="space-y-4 mb-6">
              {rubric.map((r, i) => (
                <div key={i} className="flex gap-4">
                  <input type="text" value={r.criteria} onChange={(e) => {
                    const newR = [...rubric]; newR[i].criteria = e.target.value; setRubric(newR);
                  }} placeholder="Criteria description" className="flex-1 border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="number" value={r.points} onChange={(e) => {
                    const newR = [...rubric]; newR[i].points = parseInt(e.target.value) || 0; setRubric(newR);
                  }} placeholder="Points" className="w-24 border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={() => setRubric(rubric.filter((_, idx) => idx !== i))} className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            
            <button onClick={() => setRubric([...rubric, { criteria: "", points: 0 }])} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
              <Plus className="w-4 h-4" />
              Add Rubric Criterion
            </button>
            
            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center font-medium text-slate-900">
              <span>Total Points:</span>
              <span>{rubric.reduce((acc, curr) => acc + curr.points, 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
