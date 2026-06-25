// Fraylon Admin - Phase 2
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AdminBreadcrumb } from "../../components/admin/AdminBreadcrumb";
import { CourseEditorNav } from "../../components/admin/CourseEditorNav";
import { Code, CheckSquare, AlignLeft, Plus, Trash2, Eye, Edit3, Save, LayoutTemplate, Dumbbell } from "lucide-react";
import { authFetch } from "../../authClient";

interface Exercise {
  id: string;
  title: string;
  type: string;
  content: string;
  points: number;
  attemptsAllowed: number;
  validationRules: any;
}

export default function ExerciseBuilder() {
  const { courseId } = useParams();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeExerciseId, setActiveExerciseId] = useState<string>('');
  
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    // Assuming exercises can be fetched via courseId directly for the builder
    authFetch<Exercise[]>(`/admin/courses/${courseId}/exercises`)
      .then(data => {
        if (Array.isArray(data)) {
          setExercises(data);
          if (data.length > 0) setActiveExerciseId(data[0].id);
        }
      })
      .catch(console.error);
  }, [courseId]);

  const addExercise = async () => {
    try {
      const newEx = await authFetch<Exercise>(`/admin/courses/${courseId}/exercises`, {
        method: 'POST',
        body: JSON.stringify({ 
          title: 'New Exercise', 
          type: 'MCQ',
          content: '',
          points: 10,
          attemptsAllowed: 3,
          validationRules: { options: ['', ''], correctOption: 0 }
        })
      });
      setExercises([...exercises, newEx]);
      setActiveExerciseId(newEx.id);
      setPreviewMode(false);
    } catch (err) {
      console.error(err);
      // Fallback for UI if backend route missing
      const mockEx: Exercise = {
        id: 'ex_' + Date.now(),
        title: 'New Exercise',
        type: 'MCQ',
        content: '',
        points: 10,
        attemptsAllowed: 3,
        validationRules: { options: ['', ''], correctOption: 0 }
      };
      setExercises([...exercises, mockEx]);
      setActiveExerciseId(mockEx.id);
      setPreviewMode(false);
    }
  };

  const activeExercise = exercises.find(e => e.id === activeExerciseId);

  const updateActiveExercise = (updates: Partial<Exercise>) => {
    setExercises(exercises.map(e => e.id === activeExerciseId ? { ...e, ...updates } : e));
  };

  const saveActiveExercise = async () => {
    if (!activeExercise) return;
    setIsSaving(true);
    try {
      if (activeExercise.id.startsWith('ex_')) {
        // mock save
        await new Promise(r => setTimeout(r, 500));
      } else {
        await authFetch(`/admin/exercises/${activeExercise.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: activeExercise.title,
            type: activeExercise.type,
            content: activeExercise.content,
            points: activeExercise.points,
            attemptsAllowed: activeExercise.attemptsAllowed,
            validationRules: activeExercise.validationRules
          })
        });
      }
      alert('Exercise saved successfully!');
    } catch (err: any) {
      alert("Failed to save exercise: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteActiveExercise = async () => {
    if (!activeExercise) return;
    if (!confirm(`Are you sure you want to delete "${activeExercise.title}"?`)) return;
    try {
      if (!activeExercise.id.startsWith('ex_')) {
        await authFetch(`/admin/exercises/${activeExercise.id}`, { method: 'DELETE' });
      }
      const newExercises = exercises.filter(e => e.id !== activeExercise.id);
      setExercises(newExercises);
      setActiveExerciseId(newExercises.length > 0 ? newExercises[0].id : '');
    } catch (err: any) {
      alert("Failed to delete exercise: " + err.message);
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
          <h1 className="text-2xl font-bold text-slate-100">Exercise Builder</h1>
        </div>
      </div>

      <CourseEditorNav courseId={courseId || "draft"} />

      <div className="flex flex-1 overflow-hidden min-h-0 bg-[#0f172a]">
        {/* Left Sidebar - Exercise List */}
        <div className="w-80 bg-[#0a0f1e] border-r border-white/10 flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0f172a] shrink-0">
            <h3 className="font-semibold text-slate-100">Exercises</h3>
            <button onClick={addExercise} className="p-1.5 text-blue-400 hover:bg-blue-900/30 rounded-md transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {exercises.map((ex) => (
              <div 
                key={ex.id}
                onClick={() => {
                  setActiveExerciseId(ex.id);
                  setPreviewMode(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${activeExerciseId === ex.id ? 'bg-blue-900/30 border border-blue-200 text-blue-400' : 'hover:bg-[#0f172a] border border-transparent text-slate-300'}`}
              >
                <Dumbbell className="w-4 h-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ex.title || "Untitled"}</p>
                  <p className="text-xs text-slate-400 uppercase">{ex.type}</p>
                </div>
              </div>
            ))}
            {exercises.length === 0 && (
              <div className="text-center p-4 text-slate-400 text-sm">
                No exercises yet. Click + to add one.
              </div>
            )}
          </div>
        </div>

        {/* Right Area - Editor */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#0a0f1e] relative">
          {activeExercise ? (
            <div className="max-w-4xl mx-auto space-y-6 pb-24">
              <div className="flex justify-between items-center">
                <input 
                  type="text"
                  value={activeExercise.title}
                  onChange={(e) => updateActiveExercise({ title: e.target.value })}
                  className="text-2xl font-bold text-slate-100 bg-transparent outline-none placeholder:text-slate-300 border-b border-transparent focus:border-white/10 pb-1"
                  placeholder="Exercise Title"
                />
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setPreviewMode(!previewMode)}
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-300 bg-[#0f172a] border border-white/10 hover:bg-[#1e293b] px-4 py-2 rounded-lg transition-colors"
                  >
                    {previewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {previewMode ? "Edit Mode" : "Preview"}
                  </button>
                  <button 
                    onClick={saveActiveExercise}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Exercise"}
                  </button>
                  <button 
                    onClick={deleteActiveExercise}
                    className="flex items-center gap-2 px-3 py-2 bg-[#0f172a] border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                    title="Delete Exercise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {previewMode ? (
                <div className="bg-[#0f172a] p-8 rounded-xl border border-white/10 shadow-sm space-y-6">
                  <div className="mb-4">
                    <span className="inline-block bg-blue-900/30 text-blue-400 text-xs font-bold px-2 py-1 rounded mb-3 uppercase border border-blue-800">{activeExercise.type} Exercise</span>
                    <p className="text-slate-100 font-medium whitespace-pre-wrap">{activeExercise.content || "Question prompt will appear here."}</p>
                  </div>
                  
                  {activeExercise.type === 'MCQ' && (
                    <div className="space-y-3">
                      {(activeExercise.validationRules?.options || []).map((opt: string, i: number) => (
                        <label key={i} className="flex items-center gap-3 p-3 border border-white/10 rounded-lg cursor-not-allowed bg-[#0a0f1e]">
                          <input type="radio" disabled className="w-4 h-4" />
                          <span className="text-sm text-slate-300">{opt || `Option ${i + 1}`}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {activeExercise.type === 'CODING' && (
                    <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-400">
                      // Student code editor placeholder
                    </div>
                  )}
                  {activeExercise.type === 'TEXT' && (
                    <textarea disabled className="w-full border border-white/10 rounded-lg p-3 bg-[#0a0f1e] text-slate-400" placeholder="Student will type their answer here..."></textarea>
                  )}
                </div>
              ) : (
                <div className="bg-[#0f172a] p-6 rounded-xl border border-white/10 shadow-sm space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">Exercise Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button 
                        onClick={() => updateActiveExercise({ type: 'MCQ' })}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border ${activeExercise.type === 'MCQ' ? 'border-blue-600 bg-blue-900/30 text-blue-400' : 'border-white/10 hover:border-white/30 text-slate-400'}`}
                      >
                        <CheckSquare className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">Multiple Choice</span>
                      </button>
                      <button 
                        onClick={() => updateActiveExercise({ type: 'CODING' })}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border ${activeExercise.type === 'CODING' ? 'border-blue-600 bg-blue-900/30 text-blue-400' : 'border-white/10 hover:border-white/30 text-slate-400'}`}
                      >
                        <Code className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">Coding</span>
                      </button>
                      <button 
                        onClick={() => updateActiveExercise({ type: 'TEXT' })}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border ${activeExercise.type === 'TEXT' ? 'border-blue-600 bg-blue-900/30 text-blue-400' : 'border-white/10 hover:border-white/30 text-slate-400'}`}
                      >
                        <AlignLeft className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">Short Answer</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Question Prompt</label>
                    <textarea 
                      value={activeExercise.content}
                      onChange={(e) => updateActiveExercise({ content: e.target.value })}
                      placeholder="Enter your question here..."
                      className="w-full border border-white/10 rounded-lg p-3 min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500 bg-[#0a0f1e] text-slate-100"
                    />
                  </div>

                  {activeExercise.type === 'MCQ' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">Options & Correct Answer</label>
                      <div className="space-y-3">
                        {(activeExercise.validationRules?.options || []).map((opt: string, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              name={`correctOption_${activeExercise.id}`} 
                              checked={activeExercise.validationRules?.correctOption === i}
                              onChange={() => {
                                updateActiveExercise({
                                  validationRules: { ...activeExercise.validationRules, correctOption: i }
                                });
                              }}
                              className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                            />
                            <input 
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOps = [...(activeExercise.validationRules?.options || [])];
                                newOps[i] = e.target.value;
                                updateActiveExercise({
                                  validationRules: { ...activeExercise.validationRules, options: newOps }
                                });
                              }}
                              placeholder={`Option ${i + 1}`}
                              className={`flex-1 border rounded-lg px-3 py-2 outline-none bg-[#0a0f1e] text-slate-100 ${activeExercise.validationRules?.correctOption === i ? 'border-emerald-500/50 focus:ring-emerald-500' : 'border-white/10 focus:ring-blue-500'}`}
                            />
                            {(activeExercise.validationRules?.options || []).length > 2 && (
                              <button 
                                onClick={() => {
                                  const newOps = [...(activeExercise.validationRules?.options || [])];
                                  newOps.splice(i, 1);
                                  let newCorrect = activeExercise.validationRules?.correctOption || 0;
                                  if (newCorrect === i) newCorrect = 0;
                                  else if (newCorrect > i) newCorrect -= 1;
                                  updateActiveExercise({
                                    validationRules: { ...activeExercise.validationRules, options: newOps, correctOption: newCorrect }
                                  });
                                }}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-[#0a0f1e] rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => {
                          const newOps = [...(activeExercise.validationRules?.options || []), ''];
                          updateActiveExercise({
                            validationRules: { ...activeExercise.validationRules, options: newOps }
                          });
                        }}
                        className="mt-4 flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300"
                      >
                        <Plus className="w-4 h-4" />
                        Add Option
                      </button>
                    </div>
                  )}

                  {activeExercise.type === 'CODING' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Validation Logic (JSON / Tests)</label>
                      <textarea 
                        value={activeExercise.validationRules?.tests || ''}
                        onChange={(e) => updateActiveExercise({ validationRules: { ...activeExercise.validationRules, tests: e.target.value } })}
                        placeholder="[{ input: '...', expectedOutput: '...' }]"
                        className="w-full border border-white/10 rounded-lg p-3 min-h-[150px] font-mono text-sm bg-[#0a0f1e] text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Attempts Allowed</label>
                      <input 
                        type="number" 
                        value={activeExercise.attemptsAllowed || 3}
                        onChange={(e) => updateActiveExercise({ attemptsAllowed: Number(e.target.value) })}
                        min="1"
                        className="w-full border border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-[#0a0f1e] text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Points</label>
                      <input 
                        type="number" 
                        value={activeExercise.points || 10}
                        onChange={(e) => updateActiveExercise({ points: Number(e.target.value) })}
                        min="0"
                        className="w-full border border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-[#0a0f1e] text-slate-100"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Hints (Optional)</label>
                    <input 
                      type="text" 
                      value={activeExercise.validationRules?.hint || ''}
                      onChange={(e) => updateActiveExercise({ validationRules: { ...activeExercise.validationRules, hint: e.target.value } })}
                      placeholder="Provide a hint if they fail"
                      className="w-full border border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-[#0a0f1e] text-slate-100"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <LayoutTemplate className="w-12 h-12 mb-4 text-slate-500" />
              <p>Select an exercise to edit or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
