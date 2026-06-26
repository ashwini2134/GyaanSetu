// Fraylon Admin - Block Editor
import React from 'react';

export default function AnalogyBlock({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-amber-500 uppercase tracking-wider mb-2">Analogy Title</label>
        <input 
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="e.g. Variables are like boxes..."
          className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500 text-slate-200 text-sm font-semibold"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Real Life</label>
          <textarea
            value={data.real || ''}
            onChange={(e) => onChange({ ...data, real: e.target.value })}
            placeholder="A box can hold different things..."
            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 text-slate-200 text-sm resize-none h-24"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">In Code</label>
          <textarea
            value={data.concept || ''}
            onChange={(e) => onChange({ ...data, concept: e.target.value })}
            placeholder="A variable stores data values..."
            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 text-slate-200 text-sm resize-none h-24"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Image URL (Optional)</label>
        <input 
          type="text"
          value={data.image || ''}
          onChange={(e) => onChange({ ...data, image: e.target.value })}
          placeholder="https://images.unsplash.com/..."
          className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500 text-slate-200 text-sm"
        />
      </div>
    </div>
  );
}
