// Fraylon Admin - Block Editor
import React from 'react';

export default function CalloutBlock({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const color = data.color || 'blue';
  
  const bgColors: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
    red: 'bg-red-500/10 border-red-500/30 text-red-400',
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        {['blue', 'yellow', 'green', 'red'].map(c => (
          <label key={c} className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name={`color-${data.id || Math.random()}`} 
              value={c} 
              checked={color === c}
              onChange={(e) => onChange({ ...data, color: e.target.value })}
              className="accent-blue-500"
            />
            <span className={`capitalize ${bgColors[c].split(' ')[2]}`}>{c}</span>
          </label>
        ))}
      </div>
      
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Icon (Emoji)</label>
        <input 
          type="text"
          value={data.icon || ''}
          onChange={(e) => onChange({ ...data, icon: e.target.value })}
          placeholder="💡"
          className="w-20 bg-slate-800 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm text-center"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Text Content</label>
        <textarea
          value={data.text || ''}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          placeholder="Callout text here..."
          className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm resize-none h-24"
        />
      </div>

      <div className={`mt-2 p-4 rounded-xl border ${bgColors[color]} flex gap-3`}>
        {data.icon && <span className="text-xl leading-none">{data.icon}</span>}
        <p className="text-sm leading-relaxed text-slate-200">{data.text || 'Preview text...'}</p>
      </div>
    </div>
  );
}
