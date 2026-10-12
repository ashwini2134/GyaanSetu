import { useEffect, useState } from 'react';
import { Flame, Trophy, ShieldCheck, ShieldAlert } from 'lucide-react';
import { authFetch } from '../../authClient';

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365];

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function StreakPopover() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch<StreakData>('/streaks')
      .then(setStreak)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-[var(--bg-page)] rounded-2xl shadow-xl border border-[var(--border)] p-5 min-w-[300px]">
        <p className="text-[var(--text-muted)] text-sm">Loading...</p>
      </div>
    );
  }

  if (!streak) return null;

  const todayProtected = streak.lastLoginDate && isToday(streak.lastLoginDate);
  const nextMilestone = STREAK_MILESTONES.find((m) => m > streak.currentStreak) ?? null;
  const daysToMilestone = nextMilestone ? nextMilestone - streak.currentStreak : null;
  const milestoneProgress = nextMilestone ? (streak.currentStreak / nextMilestone) * 100 : 100;

  return (
    <div className="bg-[var(--bg-page)] rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden min-w-[300px] max-w-[360px]">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-400/10 flex items-center justify-center">
            <Flame size={18} className="text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Learning Streak</h2>
            <p className="text-[10px] text-[var(--text-muted)]">Stay active every day to build consistency.</p>
          </div>
        </div>
      </div>

      <div className="mx-4 border-t border-[var(--border)]" />

      <div className="px-4 py-3 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-3xl font-black text-[var(--text-primary)]">{streak.currentStreak}</p>
            <p className="text-[11px] text-[var(--text-muted)] font-medium">Current streak</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)] font-medium">Longest</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{streak.longestStreak}</p>
          </div>
        </div>

        <div className={`p-3 rounded-xl border ${todayProtected ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
          <div className="flex items-start gap-2">
            {todayProtected ? (
              <ShieldCheck size={18} className="text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <ShieldAlert size={18} className="text-amber-400 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">
                {todayProtected ? 'Streak Protected' : 'Keep Your Streak Alive'}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                {todayProtected
                  ? "You've completed an activity today. Come back tomorrow to continue your streak."
                  : 'Complete any lecture, quiz, practice exercise, problem or project today before midnight.'}
              </p>
            </div>
          </div>
        </div>

        {nextMilestone && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Trophy size={12} className="text-[var(--brand-primary)]" />
                <span className="text-[11px] font-bold text-[var(--text-primary)]">Next Milestone</span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">{streak.currentStreak} / {nextMilestone} days</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-inset)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary-dark)] transition-all duration-500"
                style={{ width: `${Math.min(100, milestoneProgress)}%` }}
              />
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              {daysToMilestone} day{daysToMilestone !== 1 ? 's' : ''} until {nextMilestone}-day milestone
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
