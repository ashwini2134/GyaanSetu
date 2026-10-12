// Fraylon Admin - Phase 2
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AdminBreadcrumb } from "../../components/admin/AdminBreadcrumb";
import { CourseEditorNav } from "../../components/admin/CourseEditorNav";
import { Plus, GripVertical, Settings2, Trash2, ChevronDown } from "lucide-react";
import { authFetch } from "../../authClient";

export default function QuizBuilder() {
  const { courseId } = useParams();
  const [questions, setQuestions] = useState<any[]>([]);
  const [passScore, setPassScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [shuffle, setShuffle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);

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

  const addQuestion = async (qType: string) => {
    try {
      await authFetch(`/admin/courses/${courseId}/quiz`, {
        method: 'POST',
        body: JSON.stringify({ passScore: Number(passScore), timeLimit: Number(timeLimit), maxAttempts: Number(maxAttempts), shuffle })
      });
      let body: any = { type: qType, question: "New Question" };
      if (qType === "mcq") {
        body.options = ["Option 1", "Option 2"];
        body.correctAnswer = "Option 1";
      } else if (qType === "tf") {
        body.options = ["True", "False"];
        body.correctAnswer = "True";
      } else if (qType === "short") {
        body.options = [];
        body.correctAnswer = "";
      }
      
      const q = await authFetch(`/admin/courses/${courseId}/quiz/questions`, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      setQuestions([...questions, q]);
      setShowQuestionTypes(false);
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
          <h1 className="text-2xl font-bold text-[var(--text-main)]">Quiz Builder</h1>
          <button 
            onClick={saveQuiz}
            disabled={isSaving}
            className="px-5 py-2.5 bg-[var(--color-brand-navy)] text-[var(--bg-body)] rounded-lg font-medium hover:bg-[var(--color-primary)] transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Quiz"}
          </button>
        </div>
      </div>

      <CourseEditorNav courseId={courseId || "draft"} />

      <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg-body)] flex gap-8 items-start">
        {/* Main Quiz Area */}
        <div className="flex-1 max-w-4xl space-y-6">
          <div className="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-light)] overflow-hidden">
            <div className="p-4 border-b border-[var(--border-light)] bg-[var(--bg-surface)] flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-main)]">Questions ({questions.length})</h3>
              <div className="relative">
                <button 
                  onClick={() => setShowQuestionTypes(!showQuestionTypes)}
                  className="flex items-center gap-1.5 text-sm font-medium text-[var(--bg-body)] bg-[var(--color-brand-navy)] hover:bg-[var(--color-primary)] px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                {showQuestionTypes && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-surface)] border border-[var(--border-light)] shadow-xl rounded-lg overflow-hidden z-20">
                    <button onClick={() => addQuestion('mcq')} className="w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--bg-dark-surface)] transition-colors">Multiple Choice</button>
                    <button onClick={() => addQuestion('tf')} className="w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--bg-dark-surface)] transition-colors border-t border-[var(--border-light)]">True / False</button>
                    <button onClick={() => addQuestion('short')} className="w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--bg-dark-surface)] transition-colors border-t border-[var(--border-light)]">Short Answer</button>
                  </div>
                )}
              </div>
            </div>
            <div className="divide-y divide-[var(--border-light)]">
              {questions.map((q, index) => (
                <div key={q.id} className="p-6 flex gap-4 group hover:bg-[var(--bg-surface)] transition-colors">
                  <div className="cursor-grab text-[var(--text-muted)] hover:text-[var(--text-secondary)] pt-1">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-[var(--bg-dark-surface)] text-[var(--text-secondary)] text-xs font-bold px-2 py-1 rounded">Q{index + 1}</span>
                        <input 
                          type="text" 
                          value={q.question} 
                          className="font-medium text-[var(--text-main)] outline-none bg-transparent min-w-[300px] border-b border-transparent focus:border-[var(--color-primary)]" 
                          readOnly 
                        />
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--color-primary)] rounded-md hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-light)]"><Settings2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteQuestion(q.id)} className="p-1.5 text-[var(--text-muted)] hover:text-red-600 rounded-md hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-light)]"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="space-y-2 pl-12">
                      {q.type === 'short' ? (
                        <div className="text-sm text-[var(--text-secondary)] italic bg-[var(--bg-dark-surface)] p-3 rounded-lg border border-[var(--border-light)]">Short answer question. Student types response.</div>
                      ) : (
                        q.options && q.options.map((opt: string, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <input type="radio" checked={q.correctAnswer === opt} readOnly className="text-emerald-500 focus:ring-emerald-500 w-4 h-4" />
                            <span className={`text-sm ${q.correctAnswer === opt ? 'text-emerald-400 font-medium' : 'text-[var(--text-secondary)]'}`}>{opt}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="p-12 text-center text-[var(--text-muted)]">
                  No questions added yet. Click "Add Question" to start.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="w-80 bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-light)] p-6 shrink-0 sticky top-8">
          <h3 className="font-semibold text-[var(--text-main)] mb-6 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-[var(--color-brand-navy)]" />
            Quiz Settings
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-main)] mb-2">Passing Score (%)</label>
              <input 
                type="number" 
                value={passScore}
                onChange={(e) => setPassScore(Number(e.target.value))}
                className="w-full border border-[var(--border-light)] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-main)] mb-2">Time Limit (minutes)</label>
              <input 
                type="number" 
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                placeholder="0 = unlimited" 
                className="w-full border border-[var(--border-light)] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-main)] mb-2">Max Attempts</label>
              <input 
                type="number" 
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full border border-[var(--border-light)] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
              />
            </div>
            <label className="flex items-center gap-3 pt-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={shuffle}
                onChange={(e) => setShuffle(e.target.checked)}
                className="w-4 h-4 text-[var(--color-primary)] rounded border-[var(--border-light)] focus:ring-[var(--color-primary)]" 
              />
              <span className="text-sm font-medium text-[var(--text-main)]">Shuffle Questions</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
