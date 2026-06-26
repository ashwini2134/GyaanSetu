// Fraylon Admin - Block Editor
import React from 'react';
import Editor from '@monaco-editor/react';

export default function ExerciseBlock({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const hints = data.hints || [];

  const addHint = () => {
    if (hints.length < 3) onChange({ ...data, hints: [...hints, ''] });
  };
  const updateHint = (idx: number, text: string) => {
    const newHints = [...hints];
    newHints[idx] = text;
    onChange({ ...data, hints: newHints });
  };
  const removeHint = (idx: number) => {
    const newHints = hints.filter((_: any, i: number) => i !== idx);
    onChange({ ...data, hints: newHints });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-300">Difficulty</label>
        <select 
          value={data.difficulty || 'Easy'} 
          onChange={(e) => onChange({ ...data, difficulty: e.target.value })}
          className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-200"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        
        <label className="text-sm font-medium text-slate-300 ml-4">Language</label>
        <select 
          value={data.language || 'java'} 
          onChange={(e) => onChange({ ...data, language: e.target.value })}
          className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-200"
        >
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Question Title</label>
        <input 
          type="text"
          value={data.question || ''}
          onChange={(e) => onChange({ ...data, question: e.target.value })}
          placeholder="e.g. Write a function that returns true..."
          className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm font-semibold"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Detailed Description</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="More details about what the code should do..."
          className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm resize-none h-20"
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Starter Code</label>
        <div className="border border-white/10 rounded-lg overflow-hidden bg-[#1e1e1e]">
          <Editor
            height="150px"
            language={data.language || 'java'}
            theme="vs-dark"
            value={data.starterCode || ''}
            onChange={(value) => onChange({ ...data, starterCode: value })}
            options={{ minimap: { enabled: false }, padding: { top: 12, bottom: 12 }, fontSize: 14 }}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Hints (Max 3)</label>
        <div className="flex flex-col gap-2">
          {hints.map((hint: string, i: number) => (
            <div key={i} className="flex gap-2">
              <input 
                type="text"
                value={hint}
                onChange={(e) => updateHint(i, e.target.value)}
                placeholder={`Hint ${i + 1}`}
                className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm"
              />
              <button 
                onClick={() => removeHint(i)}
                className="px-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
              >✕</button>
            </div>
          ))}
          {hints.length < 3 && (
            <button 
              onClick={addHint}
              className="self-start text-sm text-blue-400 hover:text-blue-300 px-2 py-1"
            >+ Add Hint</button>
          )}
        </div>
      </div>
    </div>
  );
}
