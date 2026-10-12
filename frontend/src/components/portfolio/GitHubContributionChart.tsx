import { Code as Github, Link as LinkIcon } from 'lucide-react';

interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface GithubActivityResponse {
  available: boolean;
  reason?: 'no_github_linked' | 'not_configured' | 'github_error' | 'github_user_not_found';
  username?: string;
  totalContributions?: number;
  weeks?: ContributionWeek[];
  cached?: boolean;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function levelFor(count: number, max: number): number {
  if (count === 0) return 0;
  if (max <= 0) return 1;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

const LEVEL_OPACITY = [0.06, 0.28, 0.5, 0.72, 1];

export default function GitHubContributionChart({ data, loading, isOwn = true, hideTitle = false, bare = false }: { data: GithubActivityResponse | null; loading: boolean; isOwn?: boolean; hideTitle?: boolean; bare?: boolean }) {
  const shellClass = bare ? '' : 'bg-[var(--bg-surface)] rounded-[12px] border border-[var(--border-light)] p-6';

  if (loading) {
    return (
      <div className={shellClass}>
        {!hideTitle && <h2 className="text-[18px] font-bold text-[var(--text-main)] mb-5">GitHub Activity</h2>}
        <div className="h-[140px] flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!data || !data.available) {
    const messages: Record<string, string> = {
      no_github_linked: isOwn
        ? 'Link your GitHub profile in Settings to show a live contribution chart here.'
        : "This student hasn't linked a GitHub profile yet.",
      not_configured: 'Live GitHub contribution data is temporarily unavailable.',
      github_error: "We couldn't reach GitHub to load contribution data right now.",
      github_user_not_found: `We couldn't find a GitHub account for "${data?.username ?? 'this profile'}".`,
    };
    return (
      <div className={shellClass}>
        {!hideTitle && <h2 className="text-[18px] font-bold text-[var(--text-main)] mb-5">GitHub Activity</h2>}
        <div className="text-center py-8">
          <Github size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-[var(--text-muted)] text-sm max-w-sm mx-auto">
            {messages[data?.reason ?? 'no_github_linked']}
          </p>
          {isOwn && data?.reason === 'no_github_linked' && (
            <a href="#/settings" className="inline-flex items-center gap-1.5 mt-4 text-sm text-[var(--color-primary)] hover:text-blue-300">
              <LinkIcon size={14} /> Go to Settings
            </a>
          )}
        </div>
      </div>
    );
  }

  const weeks = data.weeks ?? [];
  const allDays = weeks.flatMap((w) => w.contributionDays);
  const max = allDays.reduce((m, d) => Math.max(m, d.contributionCount), 0);

  let lastMonth = -1;
  const monthMarkers = weeks.map((w) => {
    const first = w.contributionDays[0];
    if (!first) return null;
    const m = new Date(first.date).getMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      return MONTH_LABELS[m];
    }
    return null;
  });

  return (
    <div className={shellClass}>
      <div className="flex items-center justify-between mb-5">
        {!hideTitle && (
          <h2 className="text-[18px] font-bold text-[var(--text-main)] flex items-center gap-2">
            <Github size={18} /> GitHub Activity
          </h2>
        )}
        {data.username && (
          <a
            href={`https://github.com/${data.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--color-primary)] hover:text-blue-300 font-medium"
          >
            @{data.username}
          </a>
        )}
      </div>

      <p className="text-[13px] text-[var(--text-muted)] mb-4">
        {(data.totalContributions ?? 0).toLocaleString()} contributions in the last year
      </p>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1 min-w-full">
          <div className="flex gap-1 pl-0" style={{ marginLeft: '2px' }}>
            {monthMarkers.map((label, i) => (
              <div key={i} className="w-[11px] text-[10px] text-[var(--text-muted)] flex-shrink-0">
                {label ?? ''}
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.contributionDays.map((day, di) => {
                  const level = levelFor(day.contributionCount, max);
                  return (
                    <div
                      key={di}
                      title={`${day.contributionCount} contribution${day.contributionCount === 1 ? '' : 's'} on ${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      className="w-[11px] h-[11px] rounded-[2px]"
                      style={{
                        backgroundColor: level === 0 ? 'var(--bg-dark-surface)' : 'var(--color-primary)',
                        opacity: level === 0 ? 1 : LEVEL_OPACITY[level],
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 mt-3 text-[11px] text-[var(--text-muted)]">
        <span>Less</span>
        {LEVEL_OPACITY.map((op, i) => (
          <div
            key={i}
            className="w-[11px] h-[11px] rounded-[2px]"
            style={{
              backgroundColor: i === 0 ? 'var(--bg-dark-surface)' : 'var(--color-primary)',
              opacity: i === 0 ? 1 : op,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
