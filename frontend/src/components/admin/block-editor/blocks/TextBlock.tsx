// Fraylon Admin - Block Editor
import React, { useRef, useEffect } from 'react';

export default function TextBlock({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [data.body]);

  return (
    <div className="flex flex-col gap-2">
      <textarea
        ref={textareaRef}
        value={data.body || ''}
        onChange={(e) => onChange({ ...data, body: e.target.value })}
        placeholder="Markdown friendly text..."
        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm leading-relaxed resize-none min-h-[100px]"
      />
    </div>
  );
}
