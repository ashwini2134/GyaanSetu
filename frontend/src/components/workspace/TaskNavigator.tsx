import { CheckCircle2, PlayCircle, Lock } from "lucide-react";
import type { ProjectTask } from "../../data/projectsData";

interface TaskNavigatorProps {
  tasks: ProjectTask[];
  currentIndex: number;
  taskStatuses: Record<string, { status: string }>;
  onSelectTask: (index: number) => void;
}

export default function TaskNavigator({ tasks, currentIndex, taskStatuses, onSelectTask }: TaskNavigatorProps) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Project Tasks</h3>
      {tasks.map((task, index) => {
        const taskStatus = taskStatuses[task.id]?.status || "NOT_STARTED";
        const isLocked = index > 0 && (taskStatuses[tasks[index - 1]?.id]?.status !== "COMPLETED");
        const isCurrent = index === currentIndex;
        const isCompleted = taskStatus === "COMPLETED";

        return (
          <button
            key={task.id}
            disabled={isLocked}
            onClick={() => !isLocked && onSelectTask(index)}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 border ${
              isCurrent
                ? "bg-blue-500/10 border-blue-500/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                : isCompleted
                ? "bg-green-500/5 border-green-500/20 text-slate-300"
                : isLocked
                ? "bg-white/[0.02] border-white/5 text-slate-600 cursor-not-allowed"
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
                {isCompleted ? (
                  <CheckCircle2 size={16} className="text-green-400" />
                ) : isCurrent ? (
                  <PlayCircle size={16} className="text-blue-400" />
                ) : isLocked ? (
                  <Lock size={14} className="text-slate-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-xs font-semibold truncate ${
                  isCurrent ? "text-white" : isCompleted ? "text-green-300" : isLocked ? "text-slate-600" : "text-slate-400"
                }`}>
                  {task.title}
                </div>
                {isCurrent && !isCompleted && (
                  <div className="text-[10px] text-blue-400 mt-0.5">In Progress</div>
                )}
                {isCompleted && (
                  <div className="text-[10px] text-green-500/70 mt-0.5">Completed</div>
                )}
              </div>
              <div className={`text-[10px] font-bold ${
                isCompleted ? "text-green-500" : isCurrent ? "text-blue-500" : "text-slate-600"
              }`}>
                {isCompleted ? "✓" : isCurrent ? "●" : ""}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
