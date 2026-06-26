// Fraylon Admin - Block Editor
import React from 'react';

export default function HeadingBlock({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-300">Level</label>
        <select 
          value={data.level || 'h2'} 
          onChange={(e) => onChange({ ...data, level: e.target.value })}
          className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-200"
        >
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
      </div>
      <input 
        type="text"
        value={data.text || ''}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Heading text..."
        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-lg font-bold"
      />
    </div>
  );
}
