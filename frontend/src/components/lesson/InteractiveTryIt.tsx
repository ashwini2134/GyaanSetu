import { useEffect, useRef, useState } from 'react';
import type { CodeExampleBlock } from '../../types/lesson';
import CodeEditor from './CodeEditor';
import { authFetch } from '../../authClient';

const FLUSH_INTERVAL_MS = 15000;

export default function InteractiveTryIt({ block, courseSlug, lectureNumber, blockId }: {
  block: CodeExampleBlock;
  courseSlug?: string;
  lectureNumber?: number;
  blockId?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const pendingSecondsRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const flush = () => {
    const seconds = pendingSecondsRef.current;
    if (seconds <= 0 || !courseSlug || lectureNumber === undefined || !blockId) return;
    pendingSecondsRef.current = 0;
    authFetch('/progress/tryit', {
      method: 'POST',
      body: JSON.stringify({ courseSlug, lectureId: String(lectureNumber), blockId, secondsDelta: seconds }),
    }).catch(() => {
      // Best-effort — a dropped flush just means slightly under-counted
      // engagement time, not a broken feature. Time isn't re-queued.
    });
  };

  useEffect(() => {
    if (!expanded) return;
    const tick = setInterval(() => { pendingSecondsRef.current += 1; }, 1000);
    intervalRef.current = setInterval(flush, FLUSH_INTERVAL_MS);
    return () => {
      clearInterval(tick);
      if (intervalRef.current) clearInterval(intervalRef.current);
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const cardCls = "rounded-2xl border border-[var(--ai-card-border)] bg-[var(--ai-card-bg)] shadow-[var(--ai-card-shadow)] p-5";

  if (!expanded) {
    return (
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--ai-card-heading)] flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--ai-card-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {block.title}
            </h3>
            <p className="text-xs text-[var(--ai-card-text-secondary)] mt-1 ml-6">Try running this code</p>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="text-[11px] text-[var(--ai-card-accent)] hover:text-[var(--brand-primary-dark)] px-3 py-1.5 rounded bg-[var(--ai-card-accent)]/10 hover:bg-[var(--ai-card-accent)]/20 border border-[var(--ai-card-accent)]/20 transition-all font-medium"
          >
            Try It →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cardCls}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--ai-card-heading)] flex items-center gap-2">
          <svg className="w-4 h-4 text-[var(--ai-card-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          {block.title}
        </h3>
        <button
          onClick={() => setExpanded(false)}
          className="text-[11px] text-[var(--ai-card-text-secondary)] hover:text-[var(--ai-card-heading)] px-2 py-1 rounded bg-[var(--surface-container)] hover:bg-[var(--ai-card-border)] transition-all"
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
