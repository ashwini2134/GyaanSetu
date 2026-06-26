// Fraylon Admin - Block Editor
import React from 'react';

export default function ImageBlock({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Image URL</label>
        <div className="flex gap-2">
          <input 
            type="text"
            value={data.url || ''}
            onChange={(e) => onChange({ ...data, url: e.target.value })}
            placeholder="https://..."
            className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm"
          />
          <button className="px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg">
            Upload
          </button>
        </div>
      </div>

      {data.url && (
        <div className="mt-2 bg-slate-900 rounded-lg overflow-hidden border border-white/10 flex justify-center items-center p-4">
          <img 
            src={data.url} 
            alt={data.alt || 'Preview'} 
            className="max-h-[200px] object-contain rounded"
            onError={(e) => (e.currentTarget.style.display = 'none')}
            onLoad={(e) => (e.currentTarget.style.display = 'block')}
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Caption (Optional)</label>
        <input 
          type="text"
          value={data.caption || ''}
          onChange={(e) => onChange({ ...data, caption: e.target.value })}
          placeholder="A description of the image"
          className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Alt Text (Accessibility)</label>
        <input 
          type="text"
          value={data.alt || ''}
          onChange={(e) => onChange({ ...data, alt: e.target.value })}
          placeholder="Screen reader text"
          className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm"
        />
      </div>
    </div>
  );
}
