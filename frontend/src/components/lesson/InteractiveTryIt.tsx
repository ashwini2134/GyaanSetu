import { useState } from 'react';
import type { CodeExampleBlock } from '../../types/lesson';
import CodeEditor from './CodeEditor';

export default function InteractiveTryIt({ block }: { block: CodeExampleBlock }) {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {block.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 ml-6">Try running this code</p>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="text-[11px] text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all font-medium"
          >
            Try It →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          {block.title}
        </h3>
        <button
          onClick={() => setExpanded(false)}
          className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-700/40 hover:bg-slate-700/70 transition-all"
        >
          Collapse
        </button>
      </div>
      <CodeEditor
        initialCode={block.code}
        language={block.language}
        height="180px"
      />
    </div>
  );
}
