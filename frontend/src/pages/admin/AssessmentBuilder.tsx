import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Save, Trash2, Settings, Edit3 } from "lucide-react";
import { authFetch } from "../../authClient";

export default function AssessmentBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);
  const [assessmentsList, setAssessmentsList] = useState<any[]>([]);
  
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subsection: "",
    description: "",
    isPublished: false
  });

  // Question form state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qFormData, setQFormData] = useState({
    category: "",
    subsection: "",
    type: "mcq",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    difficulty: "medium",
    starterCode: "",
    language: "python"
  });

  useEffect(() => {
    if (!id) {
      loadList();
    } else if (id === "new") {
      setLoading(false);
      setIsEditingSettings(true);
    } else {
      loadAssessment(id);
    }
  }, [id]);

  const loadList = async () => {
    try {
      const data = await authFetch<any>("/admin/content-assessments");
      setAssessmentsList(data.assessments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAssessment = async (assessmentId: string) => {
    try {
      const data = await authFetch<any>(`/admin/content-assessments/${assessmentId}`);
      setAssessment(data.assessment);
      setFormData({
        title: data.assessment.title,
        category: data.assessment.category,
        subsection: data.assessment.subsection,
        description: data.assessment.description || "",
        isPublished: data.assessment.isPublished
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveAssessment = async () => {
    try {
      if (id === "new") {
        const data = await authFetch<any>("/admin/content-assessments", {
          method: "POST",
          body: JSON.stringify(formData)
        });
        navigate(`/admin/content-assessments/${data.assessment.id}`);
      } else {
        const data = await authFetch<any>(`/admin/content-assessments/${id}`, {
          method: "PUT",
          body: JSON.stringify(formData)
        });
        setAssessment(data.assessment);
        setIsEditingSettings(false);
      }
    } catch (err: any) {
      alert("Error saving assessment: " + err.message);
    }
  };

  const deleteAssessment = async (assessmentId: string) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;
    try {
      await authFetch(`/admin/content-assessments/${assessmentId}`, { method: "DELETE" });
      if (id) {
        navigate("/admin/content-assessments");
      } else {
        loadList();
      }
    } catch (err: any) {
      alert("Error deleting assessment: " + err.message);
    }
  };

  const openQuestionForm = (q: any = null) => {
    if (q) {
      setEditingQuestionId(q.id);
      setQFormData({
        category: q.category,
        subsection: q.subsection,
        type: q.type,
        question: q.question,
        options: q.options || ["", "", "", ""],
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        starterCode: q.starterCode || "",
        language: q.language || "python"
      });
    } else {
      setEditingQuestionId(null);
      setQFormData({
        category: assessment?.category || "",
        subsection: assessment?.subsection || "",
        type: "mcq",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        difficulty: "medium",
        starterCode: "",
        language: "python"
      });
    }
    setShowQuestionModal(true);
  };

  const saveQuestion = async () => {
    try {
      if (editingQuestionId) {
        await authFetch(`/admin/content-assessments/${id}/questions/${editingQuestionId}`, {
          method: "PUT",
          body: JSON.stringify(qFormData)
        });
      } else {
        await authFetch(`/admin/content-assessments/${id}/questions`, {
          method: "POST",
          body: JSON.stringify(qFormData)
        });
      }
      setShowQuestionModal(false);
      loadAssessment(id!);
    } catch (err: any) {
      alert("Error saving question: " + err.message);
    }
  };

  const deleteQuestion = async (qId: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await authFetch(`/admin/content-assessments/${id}/questions/${qId}`, { method: "DELETE" });
      loadAssessment(id!);
    } catch (err: any) {
      alert("Error deleting question: " + err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-[var(--text-secondary)]">Loading...</div>;
  }

  if (!id) {
    // List View
    return (
      <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin/content-studio")} className="p-2 hover:bg-[var(--bg-surface)] rounded-lg text-[var(--text-secondary)] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">Assessments</h1>
              <p className="text-[var(--text-secondary)] mt-1">Manage global assessments and quizzes</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/admin/content-assessments/new')}
            className="bg-[var(--color-brand-navy)] hover:bg-[var(--color-primary)] text-[var(--bg-body)] font-medium py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Assessment
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl shadow-lg">
          <table className="w-full text-left text-sm text-[var(--text-main)]">
            <thead className="bg-[var(--bg-surface)]/80 text-[var(--text-secondary)] font-medium border-b border-[var(--border-light)]">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Questions</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {assessmentsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">No assessments found.</td>
                </tr>
              ) : (
                assessmentsList.map(a => (
                  <tr key={a.id} className="hover:bg-[var(--border-light)] transition-colors group">
                    <td className="px-6 py-4 font-medium">{a.title}</td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">{a.category} / {a.subsection}</td>
                    <td className="px-6 py-4">{a._count?.questions || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${a.isPublished ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                        {a.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/admin/content-assessments/${a.id}`)} className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
                          Edit
                        </button>
                        <button onClick={() => deleteAssessment(a.id)} className="text-red-400 hover:text-red-300">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Builder View
  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/admin/content-assessments")} className="p-2 hover:bg-[var(--bg-surface)] rounded-lg text-[var(--text-secondary)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">
            {id === "new" ? "New Assessment" : assessment?.title}
          </h1>
          {assessment && <p className="text-[var(--text-secondary)] mt-1">{assessment.category} / {assessment.subsection}</p>}
        </div>
        
        {id !== "new" && (
          <div className="ml-auto flex items-center gap-3">
             <button 
                onClick={() => setIsEditingSettings(true)}
                className="bg-[var(--bg-surface)] border border-[var(--border-light)] hover:bg-[var(--bg-dark-surface)] text-[var(--text-main)] py-2 px-4 rounded-lg flex items-center gap-2"
             >
                <Settings className="w-4 h-4" /> Settings
             </button>
             <button 
                onClick={() => openQuestionForm()}
                className="bg-[var(--color-brand-navy)] hover:bg-[var(--color-primary)] text-[var(--bg-body)] py-2 px-4 rounded-lg flex items-center gap-2"
             >
                <Plus className="w-4 h-4" /> Add Question
             </button>
          </div>
        )}
      </div>

      {(id === "new" || isEditingSettings) && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-6 mb-8 max-w-2xl">
          <h2 className="text-xl font-bold text-[var(--text-main)] mb-6">Assessment Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[var(--bg-body)] border border-[var(--border-light)] text-[var(--text-main)] rounded-lg px-4 py-2" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Category</label>
                <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[var(--bg-body)] border border-[var(--border-light)] text-[var(--text-main)] rounded-lg px-4 py-2" />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Subsection</label>
                <input type="text" value={formData.subsection} onChange={e => setFormData({...formData, subsection: e.target.value})} className="w-full bg-[var(--bg-body)] border border-[var(--border-light)] text-[var(--text-main)] rounded-lg px-4 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[var(--bg-body)] border border-[var(--border-light)] text-[var(--text-main)] rounded-lg px-4 py-2 h-24" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pub" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} className="w-4 h-4" />
              <label htmlFor="pub" className="text-[var(--text-main)]">Published</label>
            </div>
            <div className="pt-4 flex gap-3">
              <button onClick={saveAssessment} className="bg-[var(--color-brand-navy)] text-[var(--bg-body)] px-6 py-2 rounded-lg font-medium hover:bg-[var(--color-primary)]">
                Save Details
              </button>
              {id !== "new" && (
                <button onClick={() => setIsEditingSettings(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-main)] px-4">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {id !== "new" && !isEditingSettings && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-main)] mb-4">Questions ({assessment?.questions?.length || 0})</h2>
          
          {assessment?.questions?.length === 0 ? (
            <div className="text-center py-12 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl border-dashed">
              <p className="text-[var(--text-secondary)] mb-4">No questions added yet.</p>
              <button onClick={() => openQuestionForm()} className="text-[var(--color-primary)] hover:underline font-medium">Add your first question</button>
            </div>
          ) : (
            assessment?.questions?.map((q: any, i: number) => (
              <div key={q.id} className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-5 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-dark-surface)] flex items-center justify-center text-[var(--text-secondary)] font-medium shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs uppercase font-bold text-[var(--color-primary)] tracking-wider">{q.type}</span>
                      <h3 className="text-lg text-[var(--text-main)] mt-1">{q.question}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openQuestionForm(q)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--color-primary)] rounded"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => deleteQuestion(q.id)} className="p-2 text-[var(--text-secondary)] hover:text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  
                  {q.type === 'mcq' && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {q.options?.map((opt: string, idx: number) => (
                        <div key={idx} className={`p-3 rounded-lg border text-sm ${opt === q.correctAnswer ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-100' : 'border-[var(--border-light)] text-[var(--text-secondary)]'}`}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === 'coding' && (
                    <div className="mt-4">
                      <p className="text-sm text-[var(--text-secondary)]">Language: <span className="text-[var(--text-main)]">{q.language}</span></p>
                      {q.starterCode && (
                        <pre className="mt-2 p-3 bg-[#0d1117] rounded-lg text-sm text-slate-300 overflow-x-auto border border-slate-800">
                          {q.starterCode}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-[var(--text-main)] mb-6">{editingQuestionId ? 'Edit Question' : 'Add Question'}</h2>
            
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Type</label>
                  <select value={qFormData.type} onChange={e => setQFormData({...qFormData, type: e.target.value})} className="w-full bg-[var(--bg-body)] border border-[var(--border-light)] text-[var(--text-main)] rounded-lg px-4 py-2">
                    <option value="mcq">Multiple Choice</option>
                    <option value="coding">Coding Challenge</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Difficulty</label>
                  <select value={qFormData.difficulty} onChange={e => setQFormData({...qFormData, difficulty: e.target.value})} className="w-full bg-[var(--bg-body)] border border-[var(--border-light)] text-[var(--text-main)] rounded-lg px-4 py-2">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Question Prompt</label>
                <textarea value={qFormData.question} onChange={e => setQFormData({...qFormData, question: e.target.value})} className="w-full bg-[var(--bg-body)] border border-[var(--border-light)] text-[var(--text-main)] rounded-lg px-4 py-2 h-24" placeholder="What is the output of..." />
              </div>

              {qFormData.type === 'mcq' && (
                <>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-2">Options (Fill all 4)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[0,1,2,3].map(i => (
                        <input key={i} type="text" placeholder={`Option ${i+1}`} value={qFormData.options[i]} onChange={e => {
                          const newOpts = [...qFormData.options];
                          newOpts[i] = e.target.value;
                          setQFormData({...qFormData, options: newOpts});
                        }} className="w-full bg-[var(--bg-body)] border border-[var(--border-light)] text-[var(--text-main)] rounded-lg px-4 py-2" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Exact Correct Answer</label>
                    <input type="text" value={qFormData.correctAnswer} onChange={e => setQFormData({...qFormData, correctAnswer: e.target.value})} className="w-full bg-[var(--bg-body)] border border-[var(--border-light)] text-[var(--text-main)] rounded-lg px-4 py-2" placeholder="Must exactly match one of the options above" />
                  </div>
                </>
              )}

              {qFormData.type === 'coding' && (
                <>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Language</label>
                    <select value={qFormData.language} onChange={e => setQFormData({...qFormData, language: e.target.value})} className="w-full bg-[var(--bg-body)] border border-[var(--border-light)] text-[var(--text-main)] rounded-lg px-4 py-2">
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Starter Code</label>
                    <textarea value={qFormData.starterCode} onChange={e => setQFormData({...qFormData, starterCode: e.target.value})} className="w-full bg-[#0d1117] border border-slate-800 text-slate-300 font-mono text-sm rounded-lg px-4 py-3 h-32" placeholder="def hello():" />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Expected Output or Regex matcher</label>
                    <input type="text" value={qFormData.correctAnswer} onChange={e => setQFormData({...qFormData, correctAnswer: e.target.value})} className="w-full bg-[var(--bg-body)] border border-[var(--border-light)] text-[var(--text-main)] rounded-lg px-4 py-2 font-mono text-sm" placeholder="e.g. Hello World" />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-light)]">
                <button onClick={() => setShowQuestionModal(false)} className="px-5 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors">Cancel</button>
                <button onClick={saveQuestion} className="bg-[var(--color-brand-navy)] hover:bg-[var(--color-primary)] text-[var(--bg-body)] px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
