// Fraylon Admin - Block Editor
import React from 'react';

export default function QuizBlock({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const options = data.options || ['', '', '', ''];
  const correct = data.correct !== undefined ? data.correct : 0;

  const addOption = () => {
    if (options.length < 6) onChange({ ...data, options: [...options, ''] });
  };
  const updateOption = (idx: number, text: string) => {
    const newOpts = [...options];
    newOpts[idx] = text;
    onChange({ ...data, options: newOpts });
  };
  const removeOption = (idx: number) => {
    const newOpts = options.filter((_: any, i: number) => i !== idx);
    let newCorrect = correct;
    if (correct === idx) newCorrect = 0;
    else if (correct > idx) newCorrect--;
    onChange({ ...data, options: newOpts, correct: newCorrect });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Question</label>
        <textarea
          value={data.question || ''}
          onChange={(e) => onChange({ ...data, question: e.target.value })}
          placeholder="What is the output of..."
          className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm font-semibold resize-none h-20"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Options & Correct Answer</label>
        <div className="flex flex-col gap-2">
          {options.map((opt: string, i: number) => (
            <div key={i} className={`flex items-center gap-3 p-2 rounded-lg border ${correct === i ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800 border-white/10'}`}>
              <input 
                type="radio"
                name={`correct-${data.id || Math.random()}`}
                checked={correct === i}
                onChange={() => onChange({ ...data, correct: i })}
                className="w-4 h-4 accent-green-500 cursor-pointer ml-2"
              />
              <input 
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 bg-transparent border-none outline-none text-slate-200 text-sm"
              />
              <button 
                onClick={() => removeOption(i)}
                disabled={options.length <= 2}
                className="px-2 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
              >✕</button>
            </div>
          ))}
          {options.length < 6 && (
            <button 
              onClick={addOption}
              className="self-start text-sm text-blue-400 hover:text-blue-300 px-2 py-1 mt-1"
            >+ Add Option</button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Explanation (Shown after answer)</label>
        <textarea
          value={data.explanation || ''}
          onChange={(e) => onChange({ ...data, explanation: e.target.value })}
          placeholder="Why is this the correct answer?"
          className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm resize-none h-20"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-300">Points</label>
        <input 
          type="number"
          value={data.points || 10}
          onChange={(e) => onChange({ ...data, points: parseInt(e.target.value) || 0 })}
          className="w-20 bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm text-center"
        />
      </div>
    </div>
  );
}
