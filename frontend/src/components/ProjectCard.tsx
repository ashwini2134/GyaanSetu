import { Link } from "react-router-dom";
import { type ProjectMetadata } from "../api";

export interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    difficulty?: string;
  };
  courseSlug: string;
  lectureNumber: string | number;
  metadata: ProjectMetadata;
  status: "completed" | "in_progress" | "not_started";
}

export function ProjectCard({
  project,
  courseSlug,
  lectureNumber,
  metadata,
  status,
}: ProjectCardProps) {
  // Strip markdown formatting from description preview
  const plainDescription = project.description
    .replace(/[#*`_\[\]()]/g, "")
    .split("\n")[0];

  const difficultyColors = {
    Easy: "bg-green-500/10 text-green-400 border-green-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Hard: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const statusConfigs = {
    completed: {
      label: "Completed",
      class: "bg-green-500/10 border-green-500/20 text-green-400 font-semibold",
      buttonText: "Review Workspace",
      buttonClass: "bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200",
    },
    in_progress: {
      label: "In Progress",
      class: "bg-amber-500/10 border-amber-500/20 text-amber-400 font-semibold",
      buttonText: "Resume Project",
      buttonClass: "bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-900/15",
    },
    not_started: {
      label: "Not Started",
      class: "bg-slate-800/40 border-slate-750 text-slate-400 font-medium",
      buttonText: "Start Project",
      buttonClass: "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200",
    },
  };

  const statusConfig = statusConfigs[status];

  return (
    <div className="group flex flex-col justify-between p-6 bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl hover:shadow-xl hover:shadow-blue-950/10 hover:-translate-y-0.5 transition-all duration-300">
      <div>
        {/* Card Header: Status & XP */}
        <div className="flex justify-between items-center mb-4">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${statusConfig.class}`}>
              {statusConfig.label}
            </span>
          <span className="text-xs font-semibold text-slate-400 bg-slate-850 border border-slate-800 px-2 py-1 rounded-lg">
            {metadata.xp} XP
          </span>
        </div>

        {/* Project Title */}
        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2 line-clamp-1">
          {project.title}
        </h3>

        {/* Badges & Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          <span className={`px-2 py-0.5 rounded-md font-semibold border ${difficultyColors[metadata.difficulty]}`}>
            {metadata.difficulty}
          </span>
          <span className="text-slate-400 font-medium flex items-center gap-1">
            Time: {metadata.estimatedTime}
          </span>
        </div>

        {/* Description Preview */}
        <p className="text-slate-400 text-xs leading-relaxed mb-6 line-clamp-2 h-8">
          {plainDescription}
        </p>

        {/* Topic Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {metadata.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold text-slate-400 bg-slate-850/80 border border-slate-800/50 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <Link
        to={`/course/${courseSlug}/lecture/${lectureNumber}/project/${project.id}`}
        className={`w-full text-center py-2.5 rounded-xl text-xs font-semibold transition-all duration-205 flex items-center justify-center gap-1.5 ${statusConfig.buttonClass}`}
      >
        <span>{statusConfig.buttonText}</span>
        <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
