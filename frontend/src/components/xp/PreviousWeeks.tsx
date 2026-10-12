import { useState } from 'react';
import { ChevronDown, ChevronRight, Trophy, BarChart3 } from 'lucide-react';

interface Week {
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  totalXp: number;
  rank: number | null;
  activities: number;
}

interface PreviousWeeksProps {
  weeks: Week[];
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}`;
}

export function PreviousWeeks({ weeks }: PreviousWeeksProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!weeks.length) {
    return (
      <div className="text-center py-8 text-[var(--text-muted)] text-sm">
        No previous weeks archived yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {weeks.map((w) => {
        const isOpen = expanded === w.weekStart;
        return (
          <div key={w.weekStart} className="rounded-xl border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : w.weekStart)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-colors text-left cursor-pointer border-0"
            >
              {isOpen ? <ChevronDown size={16} className="text-[var(--text-muted)]" /> : <ChevronRight size={16} className="text-[var(--text-muted)]" />}
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Week {w.weekNumber}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{formatWeekRange(w.weekStart)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[var(--brand-primary)]">{w.totalXp} XP</p>
                {w.rank && <p className="text-[11px] text-[var(--text-muted)]">#{w.rank} rank</p>}
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-3 bg-[var(--bg-surface)] border-t border-[var(--border)]">
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-elevated)]">
                    <Trophy size={14} className="text-yellow-400" />
                    <div>
                      <p className="text-[11px] text-[var(--text-muted)]">Rank</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{w.rank ? `#${w.rank}` : '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-elevated)]">
                    <BarChart3 size={14} className="text-blue-400" />
                    <div>
                      <p className="text-[11px] text-[var(--text-muted)]">Activities</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{w.activities}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
