import { useState, useEffect } from 'react';
import { CheckSquare } from 'lucide-react';

interface TaskChecklistProps {
  projectId: string;
  tasks: string[];
  onProgressChange?: (checkedCount: number, total: number) => void;
}

/** Interactive checklist over a project's requirements — client-side only, not a validation gate.
 * Real correctness is still decided by AI review after submission; this just tracks "have I done this yet." */
export default function TaskChecklist({ projectId, tasks, onProgressChange }: TaskChecklistProps) {
  const storageKey = `lms:taskChecklist:${projectId}`;
  const [checked, setChecked] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setChecked(saved ? JSON.parse(saved) : {});
    } catch {
      setChecked({});
    }
  }, [storageKey]);

  useEffect(() => {
    const count = Object.values(checked).filter(Boolean).length;
    onProgressChange?.(count, tasks.length);
  }, [checked, tasks.length, onProgressChange]);

  const toggle = (i: number) => {
    const next = { ...checked, [i]: !checked[i] };
    setChecked(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  };

  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
          <CheckSquare size={14} className="text-[var(--brand-primary)]" />
          Complete Your Task
        </h3>
        <span className="text-[10px] font-bold text-[var(--brand-primary)]">{doneCount}/{tasks.length}</span>
      </div>
      <div className="space-y-2.5">
        {tasks.map((task, i) => (
          <label key={i} className="flex items-start gap-3 text-sm cursor-pointer group">
            <input
              type="checkbox"
              checked={!!checked[i]}
              onChange={() => toggle(i)}
              className="mt-0.5 w-4 h-4 rounded border-[var(--border-medium)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/40 flex-shrink-0"
            />
            <span className={`leading-relaxed transition-colors ${checked[i] ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
              {task}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
