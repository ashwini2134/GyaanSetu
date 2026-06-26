// Fraylon Admin - Block Editor
import React from 'react';

export default function ListBlock({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const items = data.items || ['', '', ''];
  const style = data.style || 'bullet';

  const addItem = () => onChange({ ...data, items: [...items, ''] });
  const updateItem = (idx: number, text: string) => {
    const newItems = [...items];
    newItems[idx] = text;
    onChange({ ...data, items: newItems });
  };
  const removeItem = (idx: number) => {
    const newItems = items.filter((_: any, i: number) => i !== idx);
    onChange({ ...data, items: newItems });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-300">List Style</label>
        <select 
          value={style} 
          onChange={(e) => onChange({ ...data, style: e.target.value })}
          className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-200"
        >
          <option value="bullet">Bullet Points</option>
          <option value="numbered">Numbered List</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">List Items</label>
        <div className="flex flex-col gap-2">
          {items.map((item: string, i: number) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-slate-500 font-bold mt-2 w-5 text-right flex-shrink-0">
                {style === 'numbered' ? `${i + 1}.` : '•'}
              </span>
              <textarea
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder={`List item ${i + 1}...`}
                className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm resize-none h-14"
              />
              <button 
                onClick={() => removeItem(i)}
                disabled={items.length <= 1}
                className="mt-2 px-2 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
              >✕</button>
            </div>
          ))}
          <button 
            onClick={addItem}
            className="self-start text-sm text-blue-400 hover:text-blue-300 px-2 py-1 mt-2 ml-6"
          >+ Add Item</button>
        </div>
      </div>
    </div>
  );
}
