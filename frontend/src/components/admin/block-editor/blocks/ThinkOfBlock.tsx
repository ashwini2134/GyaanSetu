import React, { useRef, useEffect } from 'react';

export default function ThinkOfBlock({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [data.description]);

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={data.title || ''}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Think Of Title (e.g. A blueprint for a house)..."
        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500 text-amber-200 text-sm font-semibold"
      />
      <textarea
        ref={textareaRef}
        value={data.description || ''}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        placeholder="Think of this as..."
        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 text-slate-200 text-sm leading-relaxed resize-none min-h-[100px]"
      />
    </div>
  );
}
