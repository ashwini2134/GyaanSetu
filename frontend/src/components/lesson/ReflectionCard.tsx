import { useState } from 'react';
import type { ReflectionBlock } from '../../types/lesson';
import { renderMarkdown } from '../../utils/renderContent';

export default function ReflectionCard({ block }: { block: ReflectionBlock }) {
  const [revealed, setRevealed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isLong = block.answer.split('\n').length > 2 || block.answer.length > 200;

  return (
    <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-600/10 to-slate-800/40 backdrop-blur-sm p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1">Is This Correct?</p>
          <p className="text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(block.question) }} />

          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="mt-3 text-xs font-medium text-purple-400 hover:text-purple-300 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all"
            >
              Show Answer
            </button>
          ) : (
            <div className="mt-3 p-4 rounded-xl bg-slate-900/60 border border-slate-700/30 space-y-2">
              <div className={`text-sm text-slate-200 leading-relaxed ${!expanded && isLong ? 'line-clamp-2' : ''}`} dangerouslySetInnerHTML={{ __html: renderMarkdown(block.answer) }} />
              {isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
              {block.followupCode && (
                <div className="mt-2 rounded-xl bg-[#0d1117] border border-slate-700/40 overflow-hidden">
                  <div className="px-3 py-1 bg-slate-800/40 border-b border-slate-700/30">
                    <span className="text-[10px] text-slate-500 font-medium uppercase">Example</span>
                  </div>
                  <pre className="p-3 text-sm text-slate-200 font-mono leading-relaxed">{block.followupCode}</pre>
                </div>
              )}
              {block.followupOutput && (
                <div className="rounded-xl bg-slate-900/80 border border-slate-700/30 overflow-hidden">
                  <div className="px-3 py-1 bg-slate-800/40 border-b border-slate-700/30">
                    <span className="text-[10px] text-slate-500 font-medium uppercase">Output</span>
                  </div>
                  <pre className="p-3 text-sm text-green-400 font-mono">{block.followupOutput}</pre>
                </div>
              )}
              <button
                onClick={() => setRevealed(false)}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Hide answer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
