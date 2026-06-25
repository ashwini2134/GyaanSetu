// Fraylon Admin - Phase 2
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AdminBreadcrumb } from "../../components/admin/AdminBreadcrumb";
import { CourseEditorNav } from "../../components/admin/CourseEditorNav";
import { Plus, GripVertical, Settings2, Trash2 } from "lucide-react";
import { authFetch } from "../../authClient";

export default function QuizBuilder() {
  const { courseId } = useParams();
  const [questions, setQuestions] = useState<any[]>([]);
  const [passScore, setPassScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [shuffle, setShuffle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    authFetch<any>(`/admin/courses/${courseId}/quiz`)
      .then(data => {
        if (data) {
          setPassScore(data.passScore);
          setTimeLimit(data.timeLimit || 0);
          setMaxAttempts(data.maxAttempts);
          setShuffle(data.shuffle);
          if (data.questions) setQuestions(data.questions);
        }
      })
      .catch(console.error);
  }, [courseId]);

  const saveQuiz = async () => {
    setIsSaving(true);
    try {
      await authFetch(`/admin/courses/${courseId}/quiz`, {
        method: 'POST',
        body: JSON.stringify({ passScore: Number(passScore), timeLimit: Number(timeLimit), maxAttempts: Number(maxAttempts), shuffle })
      });
      alert('Quiz settings saved!');
    } catch (err: any) {
      alert('Failed to save quiz: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = async () => {
    try {
      const q = await authFetch(`/admin/courses/${courseId}/quiz/questions`, {
        method: 'POST',
        body: JSON.stringify({ type: "mcq", question: "New Question", options: ["Option 1", "Option 2"], correctAnswer: "Option 1" })
      });
      setQuestions([...questions, q]);
    } catch (err: any) {
      alert('Failed to add question. Please save quiz settings first.');
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await authFetch(`/admin/quiz/questions/${id}`, { method: 'DELETE' });
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err: any) {
      alert('Failed to delete question: ' + err.message);
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
          <h1 className="text-2xl font-bold text-slate-900">Quiz Builder</h1>
          <button 
            onClick={saveQuiz}
            disabled={isSaving}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Quiz"}
          </button>
        </div>
      </div>

      <CourseEditorNav courseId={courseId || "draft"} />

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50 flex gap-8 items-start">
        {/* Main Quiz Area */}
        <div className="flex-1 max-w-4xl space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Questions ({questions.length})</h3>
              <button 
                onClick={addQuestion}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {questions.map((q, index) => (
                <div key={q.id} className="p-6 flex gap-4 group hover:bg-slate-50 transition-colors">
                  <div className="cursor-grab text-slate-300 hover:text-slate-500 pt-1">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">Q{index + 1}</span>
                        <input 
                          type="text" 
                          value={q.question} 
                          className="font-medium text-slate-900 outline-none bg-transparent min-w-[300px] border-b border-transparent focus:border-blue-500" 
                          readOnly 
                        />
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-white border border-transparent hover:border-slate-200"><Settings2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteQuestion(q.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-white border border-transparent hover:border-slate-200"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="space-y-2 pl-12">
                      {q.options && q.options.map((opt: string, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <input type="radio" checked={q.correctAnswer === opt} readOnly className="text-emerald-500 focus:ring-emerald-500 w-4 h-4" />
                          <span className={`text-sm ${q.correctAnswer === opt ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  No questions added yet. Click "Add Question" to start.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="w-80 bg-white rounded-xl shadow-sm border border-slate-200 p-6 shrink-0 sticky top-8">
          <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-slate-400" />
            Quiz Settings
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Passing Score (%)</label>
              <input 
                type="number" 
                value={passScore}
                onChange={(e) => setPassScore(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Time Limit (minutes)</label>
              <input 
                type="number" 
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                placeholder="0 = unlimited" 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Max Attempts</label>
              <input 
                type="number" 
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <label className="flex items-center gap-3 pt-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={shuffle}
                onChange={(e) => setShuffle(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
              />
              <span className="text-sm font-medium text-slate-700">Shuffle Questions</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
