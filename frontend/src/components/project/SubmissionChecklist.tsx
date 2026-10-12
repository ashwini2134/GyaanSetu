import { useState, useEffect } from 'react';
import { ClipboardCheck } from 'lucide-react';

const DEFAULT_ITEMS = [
  'I pushed my code to GitHub',
  'My repository is set to Public',
  'I tested my code and it runs without errors',
  'I did not rename or delete any of the provided files',
];

interface SubmissionChecklistProps {
  items?: string[];
  onAllChecked?: (allChecked: boolean) => void;
}

/** Pre-submit checklist gating the actual submit button. Shared by Milestone and Capstone. */
export default function SubmissionChecklist({ items, onAllChecked }: SubmissionChecklistProps) {
  const list = items && items.length > 0 ? items : DEFAULT_ITEMS;
  const [checked, setChecked] = useState<boolean[]>(() => list.map(() => false));

  useEffect(() => {
    onAllChecked?.(checked.every(Boolean) && checked.length === list.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked]);

  const toggle = (i: number) => {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  return (
    <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 shadow-sm">
      <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
        <ClipboardCheck size={14} className="text-[var(--brand-primary)]" />
        Before You Submit
      </h4>
      <div className="space-y-2.5">
        {list.map((item, i) => (
          <label key={i} className="flex items-start gap-3 text-sm cursor-pointer group">
            <input
              type="checkbox"
              checked={!!checked[i]}
              onChange={() => toggle(i)}
              className="mt-0.5 w-4 h-4 rounded border-[var(--border-medium)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/40 flex-shrink-0"
            />
            <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] leading-relaxed transition-colors">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
