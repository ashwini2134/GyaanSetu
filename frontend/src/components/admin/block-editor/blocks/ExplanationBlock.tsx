import React, { useRef, useEffect } from 'react';

export default function ExplanationBlock({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [data.body]);

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={data.title || ''}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Explanation Title (e.g. How it works)..."
        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm font-semibold"
      />
      <textarea
        ref={textareaRef}
        value={data.body || ''}
        onChange={(e) => onChange({ ...data, body: e.target.value })}
        placeholder="Markdown friendly explanation..."
        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm leading-relaxed resize-none min-h-[100px]"
      />
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-400">Accent Color:</label>
        <select 
          value={data.accentColor || 'blue'}
          onChange={(e) => onChange({ ...data, accentColor: e.target.value })}
          className="bg-slate-800 border border-white/10 rounded px-2 py-1 text-xs text-slate-200 outline-none"
        >
          <option value="blue">Blue</option>
          <option value="purple">Purple</option>
          <option value="green">Green</option>
          <option value="orange">Orange</option>
          <option value="amber">Amber</option>
        </select>
      </div>
    </div>
  );
}
