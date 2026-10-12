import { useMemo } from 'react';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface WeeklyGraphProps {
  data: { date: string; xp: number }[];
}

export function WeeklyGraph({ data }: WeeklyGraphProps) {
  const maxXp = useMemo(() => Math.max(...data.map(d => d.xp), 1), [data]);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex items-end gap-2 h-32 px-2">
      {data.map((day, i) => {
        const height = Math.max(4, (day.xp / maxXp) * 100);
        const isToday = day.date === today;
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-[var(--text-muted)] font-medium">{day.xp}</span>
            <div
              className={`w-full rounded-sm transition-all duration-300 ${
                isToday ? 'bg-[var(--brand-primary)]' : 'bg-[var(--brand-primary)]/40'
              }`}
              style={{ height: `${height}%`, minHeight: '4px' }}
            />
            <span className={`text-[10px] font-medium ${isToday ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
              {DAY_LABELS[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
