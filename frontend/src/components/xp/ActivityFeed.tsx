import { Trophy, Target, Brain, Code, Flame, BookOpen, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Activity {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

function getActivityIcon(reason: string): LucideIcon {
  const r = reason.toLowerCase();
  if (r.includes('login') || r.includes('streak')) return Flame;
  if (r.includes('quiz')) return Brain;
  if (r.includes('problem') || r.includes('task')) return Code;
  if (r.includes('lecture') || r.includes('section')) return BookOpen;
  if (r.includes('project') || r.includes('capstone')) return Trophy;
  if (r.includes('practice')) return Zap;
  return Target;
}

function getActivityColor(reason: string): string {
  const r = reason.toLowerCase();
  if (r.includes('login') || r.includes('streak')) return 'text-orange-400';
  if (r.includes('quiz')) return 'text-purple-400';
  if (r.includes('problem') || r.includes('task')) return 'text-blue-400';
  if (r.includes('lecture') || r.includes('section')) return 'text-cyan-400';
  if (r.includes('project') || r.includes('capstone')) return 'text-yellow-400';
  if (r.includes('practice')) return 'text-green-400';
  return 'text-slate-400';
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities.length) {
    return (
      <div className="text-center py-8 text-[var(--text-muted)] text-sm">
        No activity yet this week. Start learning to earn XP!
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((a) => {
        const Icon = getActivityIcon(a.reason);
        const color = getActivityColor(a.reason);
        return (
          <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} bg-[var(--bg-elevated)]`}>
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{a.reason}</p>
              <p className="text-[11px] text-[var(--text-muted)]">{formatTime(a.createdAt)}</p>
            </div>
            <span className="text-sm font-bold text-[var(--brand-primary)] whitespace-nowrap">+{a.amount} XP</span>
          </div>
        );
      })}
    </div>
  );
}
