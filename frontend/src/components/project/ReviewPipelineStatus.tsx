import { CheckCircle, Loader2, XCircle, ShieldAlert, Circle } from 'lucide-react';

type Status = 'NOT_SUBMITTED' | 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'ERROR' | 'CANCELLED' | 'NEEDS_REVIEW';

interface ReviewPipelineStatusProps {
  status: Status | undefined;
  feedback?: string | null;
  score?: number | null;
}

const STAGES: { key: string; label: string }[] = [
  { key: 'submitted', label: 'You Submit' },
  { key: 'review', label: 'AI Review' },
  { key: 'decision', label: 'Approved / Needs Changes' },
  { key: 'progress', label: 'Progress Updated' },
];

/** "What Happens Next" / "After Submission" — reflects the real ProjectStatus pipeline, live, instead of a generic static graphic. */
export default function ReviewPipelineStatus({ status, feedback, score }: ReviewPipelineStatusProps) {
  if (!status || status === 'NOT_SUBMITTED') {
    return (
      <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 shadow-sm">
        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">What Happens Next</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Once you submit, here's what happens: your repository goes through an automated AI review (usually within a minute or two), then you'll see either an approval or specific feedback on what to fix.
        </p>
      </div>
    );
  }

  const stageIdx =
    status === 'PENDING' ? 0 :
    status === 'REVIEWING' ? 1 :
    status === 'APPROVED' ? 3 :
    status === 'REJECTED' || status === 'NEEDS_REVIEW' ? 2 :
    -1;

  return (
    <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 shadow-sm">
      <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-5">What Happens Next</h3>

      {status !== 'ERROR' && status !== 'CANCELLED' && (
        <div className="flex items-center mb-5">
          {STAGES.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  i < stageIdx ? 'bg-[var(--brand-primary)] text-white'
                  : i === stageIdx ? 'bg-[var(--brand-primary)]/15 border-2 border-[var(--brand-primary)] text-[var(--brand-primary)]'
                  : 'bg-[var(--surface-container)] border border-[var(--border-light)] text-[var(--text-muted)]'
                }`}>
                  {i < stageIdx ? <CheckCircle size={14} /> : i === stageIdx && (status === 'PENDING' || status === 'REVIEWING') ? <Loader2 size={13} className="animate-spin" /> : <Circle size={8} fill="currentColor" />}
                </div>
                <span className={`text-[9px] font-semibold text-center max-w-[70px] leading-tight ${i <= stageIdx ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>{s.label}</span>
              </div>
              {i < STAGES.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${i < stageIdx ? 'bg-[var(--brand-primary)]/40' : 'bg-[var(--border-light)]'}`} />}
            </div>
          ))}
        </div>
      )}

      {status === 'PENDING' && (
        <p className="text-sm text-[var(--text-secondary)]">Your submission is queued for review — this usually starts within a few seconds.</p>
      )}
      {status === 'REVIEWING' && (
        <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2"><Loader2 size={14} className="animate-spin text-[var(--brand-primary)]" /> AI is reviewing your repository right now.</p>
      )}
      {status === 'APPROVED' && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/20">
          <CheckCircle size={18} className="text-[var(--success)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">Approved{score != null ? ` — ${score}` : ''}</p>
            {feedback && <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{feedback}</p>}
          </div>
        </div>
      )}
      {status === 'REJECTED' && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20">
          <XCircle size={18} className="text-[var(--danger)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">Changes needed</p>
            {feedback && <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{feedback}</p>}
          </div>
        </div>
      )}
      {status === 'NEEDS_REVIEW' && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <ShieldAlert size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">Waiting on a mentor</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">Automated review couldn't finish — a mentor will look at this submission directly.</p>
          </div>
        </div>
      )}
      {status === 'ERROR' && (
        <p className="text-sm text-[var(--danger)]">Something went wrong during review. Try submitting again — if it keeps happening, reach out for help.</p>
      )}
      {status === 'CANCELLED' && (
        <p className="text-sm text-[var(--text-muted)]">This submission was cancelled.</p>
      )}
    </div>
  );
}
