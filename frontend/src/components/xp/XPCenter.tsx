import { useEffect, useState } from 'react';
import { Trophy, Clock, BarChart3, Layers, TrendingUp } from 'lucide-react';
import { authFetch } from '../../authClient';
import { WeeklyGraph } from './WeeklyGraph';
import { PreviousWeeks } from './PreviousWeeks';

interface XPCenterData {
  weeklyXp: number;
  weeklyRank: number | null;
  totalLearners: number;
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  secondsUntilReset: number;
  dailyGraph: { date: string; xp: number }[];
  previousWeeks: {
    weekStart: string;
    weekEnd: string;
    weekNumber: number;
    totalXp: number;
    rank: number | null;
    activities: number;
  }[];
}

function formatCountdown(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hrs = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hrs}h`;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function percentile(rank: number | null, total: number): string {
  if (!rank || total <= 1) return '\u2014';
  const pct = Math.round((1 - rank / total) * 100);
  return `Top ${pct}%`;
}

export function XPCenter() {
  const [data, setData] = useState<XPCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'weekly' | 'archive'>('weekly');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const d = await authFetch<XPCenterData>('/xp-center');
        setData(d);
        setCountdown(d.secondsUntilReset);
      } catch (err) {
        console.error('Failed to load XP Center data', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  if (loading) {
    return (
      <div className="bg-[var(--bg-page)] rounded-2xl shadow-xl border border-[var(--border)] p-6">
        <p className="text-[var(--text-muted)] text-sm">Loading XP Center...</p>
      </div>
    );
  }

  if (!data) return null;

  const tabs = [
    { id: 'weekly' as const, label: 'Weekly', icon: TrendingUp },
    { id: 'archive' as const, label: 'Archive', icon: Layers },
  ];

  return (
    <div className="bg-[var(--bg-page)] rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden max-h-[80vh] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center">
            <Trophy size={16} className="text-[var(--brand-primary)]" />
          </div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">XP Center</h2>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        <div className="mx-3 mt-3 p-3 rounded-xl bg-gradient-to-br from-[var(--brand-primary)]/5 to-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Week {data.weekNumber}</p>
              <p className="text-2xl font-black text-[var(--text-primary)] mt-0.5">{data.weeklyXp.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-secondary)]">XP this week</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{data.weeklyRank ? `#${data.weeklyRank}` : '\u2014'}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{percentile(data.weeklyRank, data.totalLearners)}</p>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-[var(--text-muted)]">
                <Clock size={10} />
                <span>{formatCountdown(countdown)}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-inset)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary-dark)] transition-all duration-500"
              style={{ width: `${Math.min(100, (data.weeklyXp / 500) * 100)}%` }}
            />
          </div>
          <p className="text-[9px] text-[var(--text-muted)] mt-0.5">500 XP = weekly target</p>
        </div>

        <div className="flex mx-3 mt-3 gap-1 p-1 rounded-xl bg-[var(--bg-elevated)]">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                  tab === t.id ? 'bg-[var(--bg-surface)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <Icon size={13} />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="px-3 pb-3">
          {tab === 'weekly' && (
            <div className="mt-3">
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                <h3 className="text-[11px] font-bold text-[var(--text-primary)] mb-2 flex items-center gap-1">
                  <BarChart3 size={13} className="text-[var(--brand-primary)]" />
                  This Week
                </h3>
                <WeeklyGraph data={data.dailyGraph} />
              </div>
            </div>
          )}

          {tab === 'archive' && (
            <div className="mt-3 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
              <h3 className="text-[11px] font-bold text-[var(--text-primary)] mb-2 flex items-center gap-1">
                <Layers size={13} className="text-[var(--brand-primary)]" />
                Previous Weeks
              </h3>
              <PreviousWeeks weeks={data.previousWeeks} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
