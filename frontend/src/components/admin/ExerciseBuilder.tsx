// Fraylon Admin - Phase 2
import { useState } from "react";
import { X, Code, CheckSquare, AlignLeft, Plus, Trash2 } from "lucide-react";
import { authFetch } from "../../authClient";

export function ExerciseBuilder({ isOpen, onClose, lessonId }: { isOpen: boolean, onClose: () => void, lessonId?: string }) {
  const [type, setType] = useState('mcq');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctOption, setCorrectOption] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!lessonId) {
      alert("Please select a lesson first");
      return;
    }
    setIsSaving(true);
    try {
      await authFetch(`/admin/lessons/${lessonId}/exercises`, {
        method: 'POST',
        body: JSON.stringify({
          title: "New Exercise",
          type: type.toUpperCase(),
          content: question,
          points: 10,
          validationRules: type === 'mcq' ? { options, correctOption } : {}
        })
      });
      alert('Exercise added successfully!');
      onClose();
    } catch (err: any) {
      alert('Failed to save exercise: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-slate-900">Add Exercise</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Exercise Type</label>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setType('mcq')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border ${type === 'mcq' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
              >
                <CheckSquare className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">MCQ</span>
              </button>
              <button 
                onClick={() => setType('coding')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border ${type === 'coding' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
              >
                <Code className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Coding</span>
              </button>
              <button 
                onClick={() => setType('text')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border ${type === 'text' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
              >
                <AlignLeft className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Short Text</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Question Prompt</label>
            <textarea 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question here..."
              className="w-full border border-slate-300 rounded-lg p-3 min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {type === 'mcq' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Options & Correct Answer</label>
              <div className="space-y-3">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="correctOption" 
                      checked={correctOption === i}
                      onChange={() => setCorrectOption(i)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <input 
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOps = [...options];
                        newOps[i] = e.target.value;
                        setOptions(newOps);
                      }}
                      placeholder={`Option ${i + 1}`}
                      className={`flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 ${correctOption === i ? 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50/30' : 'border-slate-300 focus:ring-blue-500'}`}
                    />
                    {options.length > 2 && (
                      <button 
                        onClick={() => {
                          setOptions(options.filter((_, idx) => idx !== i));
                          if (correctOption === i) setCorrectOption(0);
                          else if (correctOption > i) setCorrectOption(correctOption - 1);
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setOptions([...options, ''])}
                className="mt-4 flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Option
              </button>
            </div>
          )}

          {type === 'coding' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Validation Logic (JSON / Tests)</label>
              <textarea 
                placeholder="[{ input: '...', expectedOutput: '...' }]"
                className="w-full border border-slate-300 rounded-lg p-3 min-h-[150px] font-mono text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Hints (Optional)</label>
            <input 
              type="text" 
              placeholder="Provide a hint if they fail"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Exercise"}
          </button>
        </div>
      </div>
    </div>
  );
}
