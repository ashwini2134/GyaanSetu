import { useState } from 'react';
import type { ReflectionBlock } from '../../types/lesson';
import { renderMarkdown } from '../../utils/renderContent';

export default function ReflectionCard({ block }: { block: ReflectionBlock }) {
  const [revealed, setRevealed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isLong = block.answer.split('\n').length > 2 || block.answer.length > 200;

  return (
    <div className="rounded-2xl border border-[var(--ai-card-border)] bg-[var(--ai-card-bg)] shadow-[var(--ai-card-shadow)] p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider mb-1">Is This Correct?</p>
          <p className="text-sm text-[var(--ai-card-text)] leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(block.question) }} />

          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="mt-3 text-xs font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-dark)] px-3 py-1.5 rounded-lg bg-[var(--brand-primary)]/10 hover:bg-[var(--brand-primary)]/20 border border-[var(--brand-primary)]/20 transition-all"
            >
              Show Answer
            </button>
          ) : (
            <div className="mt-3 p-4 rounded-xl bg-[var(--surface-container)] border border-[var(--ai-card-border)] space-y-2">
              <div className={`text-sm text-[var(--ai-card-text)] leading-relaxed ${!expanded && isLong ? 'line-clamp-2' : ''}`} dangerouslySetInnerHTML={{ __html: renderMarkdown(block.answer) }} />
              {isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-[11px] text-[var(--brand-primary)] hover:text-[var(--brand-primary-dark)] transition-colors"
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
              {block.followupCode && (
                <div className="mt-2 rounded-xl bg-[#0d1117] border border-[var(--ai-card-border)] overflow-hidden">
                  <div className="px-3 py-1 bg-[var(--brand-navy)] border-b border-[var(--ai-card-border)]">
                    <span className="text-[10px] text-[var(--ai-card-text-secondary)] font-medium uppercase">Example</span>
                  </div>
                  <pre className="p-3 text-sm text-[var(--ai-section-text)] font-mono leading-relaxed">{block.followupCode}</pre>
                </div>
              )}
              {block.followupOutput && (
                <div className="rounded-xl bg-[var(--ai-section-bg)] border border-[var(--ai-card-border)] overflow-hidden">
                  <div className="px-3 py-1 bg-[var(--brand-navy)] border-b border-[var(--ai-card-border)]">
                    <span className="text-[10px] text-[var(--ai-card-text-secondary)] font-medium uppercase">Output</span>
                  </div>
                  <pre className="p-3 text-sm text-[var(--brand-primary)] font-mono">{block.followupOutput}</pre>
                </div>
              )}
              <button
                onClick={() => setRevealed(false)}
                className="text-[11px] text-[var(--ai-card-text-secondary)] hover:text-[var(--ai-card-text)] transition-colors"
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
