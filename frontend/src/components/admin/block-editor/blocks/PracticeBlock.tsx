import React, { useRef, useEffect } from 'react';

export default function PracticeBlock({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const instructionsRef = useRef<HTMLTextAreaElement>(null);
  const starterRef = useRef<HTMLTextAreaElement>(null);
  const solutionRef = useRef<HTMLTextAreaElement>(null);
  const hintRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = (ref: React.RefObject<HTMLTextAreaElement>) => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  };

  useEffect(() => autoResize(instructionsRef), [data.instructions]);
  useEffect(() => autoResize(starterRef), [data.starterCode]);
  useEffect(() => autoResize(solutionRef), [data.solution]);
  useEffect(() => autoResize(hintRef), [data.hint]);

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={data.title || ''}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Practice Title..."
        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-200 text-sm font-semibold"
      />
      <textarea
        ref={instructionsRef}
        value={data.instructions || ''}
        onChange={(e) => onChange({ ...data, instructions: e.target.value })}
        placeholder="Instructions (Markdown friendly)..."
        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-200 text-sm leading-relaxed resize-none min-h-[60px]"
      />
      <textarea
        ref={starterRef}
        value={data.starterCode || ''}
        onChange={(e) => onChange({ ...data, starterCode: e.target.value })}
        placeholder="Starter Code..."
        className="w-full bg-[#1e1e1e] font-mono border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-300 text-sm resize-none min-h-[60px]"
      />
      <textarea
        ref={solutionRef}
        value={data.solution || ''}
        onChange={(e) => onChange({ ...data, solution: e.target.value })}
        placeholder="Solution Code..."
        className="w-full bg-[#1e1e1e] font-mono border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-300 text-sm resize-none min-h-[60px]"
      />
      <textarea
        ref={hintRef}
        value={data.hint || ''}
        onChange={(e) => onChange({ ...data, hint: e.target.value })}
        placeholder="Hint..."
        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-200 text-sm leading-relaxed resize-none min-h-[40px]"
      />
    </div>
  );
}
