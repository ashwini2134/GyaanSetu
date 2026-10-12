import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";
import { useAchievements } from "../hooks/useAchievements";
import { getAchievementIcon } from "../lib/achievementIcons";

const CATEGORY_LABELS: Record<string, string> = {
  learning: "Learning",
  practice: "Practice",
  problems: "Problems",
  quizzes: "Quizzes",
  projects: "Projects",
  consistency: "Consistency",
  xp: "XP",
  courses: "Courses",
  portfolio: "Portfolio",
  community: "Community",
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

export default function AllAchievementsPage() {
  const { unlocked, catalog, loading } = useAchievements();

  const unlockedMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of unlocked) map.set(a.id, a.unlockedAt ?? "");
    return map;
  }, [unlocked]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof catalog> = {};
    for (const def of catalog) {
      (groups[def.category] ??= []).push(def);
    }
    return groups;
  }, [catalog]);

  const unlockedCount = unlocked.length;
  const totalCount = catalog.length;

  return (
    <div className="dashboard-page w-full min-h-screen bg-[var(--bg-body)] text-[var(--text-main)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Trophy className="text-[var(--color-primary)]" size={28} />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Achievements</h1>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          {loading ? "Loading…" : `${unlockedCount} of ${totalCount} unlocked`}
        </p>

        {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((cat) => (
          <div key={cat} className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-4">
              {CATEGORY_LABELS[cat]}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {grouped[cat].map((def) => {
                const Icon = getAchievementIcon(def.icon);
                const isUnlocked = unlockedMap.has(def.id);
                const unlockedAt = unlockedMap.get(def.id);
                return (
                  <div
                    key={def.id}
                    className={`group relative flex flex-col items-center text-center justify-center gap-1.5 p-3 rounded-2xl border border-transparent shadow-[var(--shadow-sm)] transition-all duration-[280ms] hover:scale-[1.03] hover:-translate-y-0.5 hover:bg-[var(--color-primary)] ${
                      isUnlocked ? "bg-[var(--color-primary)]" : "bg-[var(--color-brand-navy)]/80"
                    }`}
                  >
                    <Icon size={22} className={`transition-all duration-200 group-hover:scale-110 text-[var(--bg-body)] ${isUnlocked ? "" : "opacity-70 group-hover:opacity-100"}`} />
                    <span className="text-[11px] font-bold leading-tight text-[var(--bg-body)]">{def.name}</span>
                    <p className="text-[9px] font-medium leading-snug text-[var(--bg-body)]/90">{def.description}</p>
                    {isUnlocked && unlockedAt && (
                      <span className="text-[8px] font-semibold text-[var(--bg-body)]/70 mt-0.5">
                        {new Date(unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
