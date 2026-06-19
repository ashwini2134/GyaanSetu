import { useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, CircleDashed, PlayCircle, Lightbulb, AlertTriangle, Eye, ListChecks, Target, ChevronDown } from "lucide-react";
import type { ProjectTask } from "../../data/projectsData";

interface TaskCardProps {
  task: ProjectTask;
  index: number;
  isExpanded: boolean;
  status: string;
  onHover: () => void;
  onStart: () => void;
  onComplete: () => void;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-teal-500/30 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.15)]">
        <CheckCircle2 size={12} />
        Completed
      </span>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-orange-500/30 text-orange-300 shadow-[0_0_12px_rgba(251,146,60,0.15)]">
        <PlayCircle size={12} />
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-slate-800/60 border border-slate-700/40 text-slate-400">
      <CircleDashed size={12} />
      Not Started
    </span>
  );
}

export default function TaskCard({ task, index, isExpanded, status, onHover, onStart, onComplete }: TaskCardProps) {
  const spotRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!spotRef.current) return;
    const rect = spotRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    spotRef.current.style.setProperty("--mx", `${x}%`);
    spotRef.current.style.setProperty("--my", `${y}%`);
  }, []);

  /* Auto-start task when expanded */
  useEffect(() => {
    if (isExpanded && status === "NOT_STARTED") {
      onStart();
    }
  }, [isExpanded, status, onStart]);

  return (
    <motion.div
      layout
      onMouseEnter={onHover}
      onMouseMove={handleMouseMove}
      animate={{ height: isExpanded ? "auto" : 72 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className={`relative rounded-2xl overflow-hidden cursor-pointer border transition-shadow duration-300 ${
        isExpanded
          ? "border-blue-500/30 shadow-[0_0_40px_-8px_rgba(59,130,246,0.15)] bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl"
          : "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/[0.08] backdrop-blur-md"
      }`}
    >
      {isExpanded && (
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent pointer-events-none" />
      )}

      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          ref={spotRef}
          className={`absolute inset-0 bg-[radial-gradient(600px_circle_at_var(--mx,50%)_var(--my,50%),rgba(59,130,246,0.08)_0%,transparent_60%)] transition-opacity duration-500 ${isExpanded ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      <div className="relative z-10 flex items-center gap-4 px-5 h-[72px]">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${isExpanded ? "from-blue-500/30 to-indigo-500/20" : "from-slate-700/50 to-slate-800/50"} flex items-center justify-center flex-shrink-0 transition-all duration-300`}>
          <span className={`text-sm font-bold ${isExpanded ? "text-blue-300" : "text-slate-400"}`}>{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold truncate transition-colors duration-300 ${isExpanded ? "text-white" : "text-slate-200"}`}>
            {task.title}
          </h3>
          {!isExpanded && (
            <p className="text-xs text-slate-500 truncate mt-0.5">{task.goal}</p>
          )}
        </div>
        {!isExpanded && (
          <div className="flex-shrink-0">
            <StatusBadge status={status} />
          </div>
        )}
        {isExpanded && (
          <ChevronDown size={18} className="text-slate-500 flex-shrink-0" />
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative z-10 px-5 pb-5"
          >
            <div className="border-t border-white/5 pt-4 space-y-5">
              <div>
                <h4 className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Target size={13} />
                  Goal
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">{task.goal}</p>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ListChecks size={13} />
                  Requirements
                </h4>
                <ul className="space-y-1.5">
                  {task.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60 mt-1.5 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                  <h4 className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Lightbulb size={13} />
                    Hints
                  </h4>
                  <ul className="space-y-1.5">
                    {task.hints.map((hint, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-amber-300/80">
                        <span className="w-1 h-1 rounded-full bg-amber-400/60 mt-1.5 flex-shrink-0" />
                        {hint}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                  <h4 className="text-[11px] font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    Common Mistakes
                  </h4>
                  <ul className="space-y-1.5">
                    {task.commonMistakes.map((mistake, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-red-300/80">
                        <span className="w-1 h-1 rounded-full bg-red-400/60 mt-1.5 flex-shrink-0" />
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Eye size={13} />
                  Expected Output
                </h4>
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
                  <p className="text-sm text-purple-200/80 italic">{task.expectedOutput}</p>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  Checklist
                </h4>
                <div className="flex flex-wrap gap-2">
                  {task.checklist.map((item, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-300">
                      <CheckCircle2 size={12} className="text-green-400/60" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                {status === "COMPLETED" ? (
                  <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm font-semibold">
                    <CheckCircle2 size={18} />
                    Task Completed
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); onComplete(); }}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(34,197,94,0.3)] active:scale-95"
                  >
                    <CheckCircle2 size={18} />
                    Mark Task Complete
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
