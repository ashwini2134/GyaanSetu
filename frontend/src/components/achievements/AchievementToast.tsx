import { motion } from "framer-motion";
import { getAchievementIcon } from "../../lib/achievementIcons";
import type { ResolvedAchievement } from "../../hooks/useAchievements";

const BADGE_GRADIENTS: Record<string, string> = {
  bronze: "from-amber-700 to-amber-900",
  silver: "from-slate-300 to-slate-500",
  gold: "from-yellow-400 to-amber-600",
  platinum: "from-cyan-300 to-blue-500",
  purple: "from-purple-400 to-indigo-600",
  blue: "from-blue-400 to-blue-600",
  green: "from-emerald-400 to-emerald-600",
  red: "from-red-400 to-red-600",
};

export default function AchievementToast({ achievement, onClose }: { achievement: ResolvedAchievement; onClose: () => void }) {
  const Icon = getAchievementIcon(achievement.icon);
  const gradient = BADGE_GRADIENTS[achievement.badgeColor] ?? BADGE_GRADIENTS.bronze;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="pointer-events-auto flex items-center gap-3 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-amber-500/30 bg-[#020617]/95 backdrop-blur-md shadow-xl shadow-amber-500/10 px-4 py-3"
    >
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Icon size={22} className="text-[#fff]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Achievement Unlocked</p>
        <p className="text-sm font-semibold text-[#fff] truncate">{achievement.name}</p>
        <p className="text-xs text-[#94a3b8] truncate">
          {achievement.description}
          {achievement.xpReward > 0 && <span className="text-amber-400 font-medium"> · +{achievement.xpReward} XP</span>}
        </p>
      </div>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="text-[#64748b] hover:text-[#cbd5e1] transition-colors flex-shrink-0 text-lg leading-none"
      >
        ×
      </button>
    </motion.div>
  );
}
