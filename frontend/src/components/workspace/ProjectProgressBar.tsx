import { motion } from "framer-motion";
import { CheckCircle2, Clock, ListChecks, PlayCircle } from "lucide-react";

interface ProjectProgressBarProps {
  completedCount: number;
  totalCount: number;
  currentTaskTitle: string | null;
  estimatedDuration: string;
  loading: boolean;
}

export default function ProjectProgressBar({
  completedCount,
  totalCount,
  currentTaskTitle,
  estimatedDuration,
  loading
}: ProjectProgressBarProps) {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
        <div className="h-20 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-transparent" />

      <div className="flex items-center gap-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
          <ListChecks size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Project Progress</h3>
          <p className="text-xs text-slate-400">
            {completedCount} / {totalCount} Tasks Complete
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-sm font-bold text-blue-400">
          {percentage}%
        </div>
      </div>

      <div className="w-full h-2 rounded-full bg-slate-800/60 overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
        />
      </div>

      <div className="flex items-center gap-6 text-xs text-slate-400">
        {currentTaskTitle && (
          <div className="flex items-center gap-1.5">
            <PlayCircle size={14} className="text-amber-400" />
            <span className="text-slate-300 font-medium">{currentTaskTitle}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          <Clock size={14} />
          <span>{estimatedDuration}</span>
        </div>
      </div>
    </motion.div>
  );
}
