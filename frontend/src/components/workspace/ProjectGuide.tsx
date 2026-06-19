import { CheckCircle2, XCircle, Lightbulb, Target, Eye, ArrowRight, ChevronRight, AlertTriangle, ExternalLink, Sparkles, Clock, Code2 } from "lucide-react";
import type { ProjectTask, Project } from "../../data/projectsData";

interface ProjectGuideProps {
  project?: Project;
  task: ProjectTask | null;
  taskIndex: number;
  totalTasks: number;
  isCompleted: boolean;
  completedCount: number;
  validationResults: { ruleId: string; label: string; passed: boolean }[];
  onPrev: () => void;
  onNext: () => void;
  onCheckProgress: () => void;
}

export default function ProjectGuide({ project, task, taskIndex, totalTasks, isCompleted, completedCount, validationResults, onPrev, onNext, onCheckProgress }: ProjectGuideProps) {
  if (!task) return null;

  const passedCount = validationResults.filter(r => r.passed).length;
  const totalRules = validationResults.length;
  const isLastTask = taskIndex === totalTasks - 1;
  const allDone = completedCount === totalTasks;
  const showBanner = taskIndex === 0 && !isCompleted;

  return (
    <div className="h-full flex flex-col bg-slate-900/90">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">
            Step {taskIndex + 1} of {totalTasks}
          </span>
          <span className="text-[10px] text-slate-500 ml-auto">{completedCount}/{totalTasks} done</span>
        </div>
        <h2 className="text-sm font-bold text-white leading-snug">{task.title}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* Project overview banner (Step 1 only, before completion) */}
        {showBanner && project && (
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">You Will Build</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{project.longDescription}</p>
            <div className="flex items-center gap-3 pt-1">
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Clock size={10} />
                {project.estimatedDuration}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Code2 size={10} />
                {project.technologies.join(", ")}
              </span>
            </div>
          </div>
        )}

        {/* Why this matters */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Target size={12} className="text-blue-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">Your Goal</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{task.goal}</p>
        </div>

        {/* Expected Result */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Eye size={12} className="text-purple-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400">Expected Result</span>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-xs text-purple-200/80 leading-relaxed">{task.expectedOutput}</p>
          </div>
        </div>

        {/* All hints */}
        {task.hints.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lightbulb size={12} className="text-amber-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Hints</span>
            </div>
            <div className="space-y-1.5">
              {task.hints.map((hint, i) => (
                <div key={i} className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <pre className="text-xs text-amber-200/80 font-mono whitespace-pre-wrap">{hint}</pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common mistakes */}
        {task.commonMistakes.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertTriangle size={12} className="text-red-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">Watch Out For</span>
            </div>
            <ul className="space-y-1">
              {task.commonMistakes.map((m, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-red-300/70">
                  <span className="text-red-400/60 mt-0.5">•</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Resources */}
        {task.resources.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Resources</span>
            </div>
            <div className="space-y-1">
              {task.resources.map((r, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs text-blue-300 transition-colors cursor-default"
                  title="External resource links coming soon"
                >
                  <ExternalLink size={10} />
                  {r.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Requirements checklist */}
        {validationResults.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Requirements</span>
              <span className="text-[10px] text-slate-500">({passedCount}/{totalRules})</span>
            </div>
            <div className="space-y-1">
              {validationResults.map(r => (
                <div key={r.ruleId} className={`flex items-center gap-2 px-2 py-1 rounded text-[11px] ${
                  r.passed ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300"
                }`}>
                  {r.passed ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                  {r.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="px-4 py-3 border-t border-white/10 space-y-2">
        {!isCompleted && !allDone && (
          <button
            onClick={onCheckProgress}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all active:scale-[0.98]"
          >
            <CheckCircle2 size={14} />
            Check Progress
          </button>
        )}
        {isCompleted && !isLastTask && (
          <button
            onClick={onNext}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all active:scale-[0.98]"
          >
            Next Step
            <ArrowRight size={14} />
          </button>
        )}
        {isCompleted && isLastTask && (
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 size={14} />
            Project Complete
          </div>
        )}
        {allDone && (
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles size={14} />
            All Steps Complete
          </div>
        )}
        <div className="flex items-center justify-between">
          <button
            disabled={taskIndex === 0}
            onClick={onPrev}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={11} className="rotate-180" />
            Prev
          </button>
          <span className="text-[10px] text-slate-600 font-medium">Step {taskIndex + 1}</span>
          <button
            disabled={!isCompleted || isLastTask}
            onClick={onNext}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
