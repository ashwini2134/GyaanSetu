// Fraylon Admin - Block Editor
import React from 'react';
import Editor from '@monaco-editor/react';

export default function CodeBlock({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-300">Language</label>
        <select 
          value={data.language || 'java'} 
          onChange={(e) => onChange({ ...data, language: e.target.value })}
          className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-200"
        >
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="sql">SQL</option>
          <option value="bash">Bash</option>
        </select>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Code</label>
        <div className="border border-white/10 rounded-lg overflow-hidden bg-[#1e1e1e]">
          <Editor
            height="200px"
            language={data.language || 'java'}
            theme="vs-dark"
            value={data.code || ''}
            onChange={(value) => onChange({ ...data, code: value })}
            options={{
              minimap: { enabled: false },
              padding: { top: 12, bottom: 12 },
              scrollBeyondLastLine: false,
              fontSize: 14,
            }}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Expected Output (Optional)</label>
        <textarea
          value={data.output || ''}
          onChange={(e) => onChange({ ...data, output: e.target.value })}
          placeholder="Console output goes here..."
          className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-300 text-sm font-mono resize-none h-20"
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Caption (Optional)</label>
        <input 
          type="text"
          value={data.caption || ''}
          onChange={(e) => onChange({ ...data, caption: e.target.value })}
          placeholder="e.g. A simple Hello World program"
          className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm"
        />
      </div>
    </div>
  );
}
