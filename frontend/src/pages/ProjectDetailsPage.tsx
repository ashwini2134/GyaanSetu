import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileCode } from "lucide-react";
import { projectsData } from "../data/projectsData";
import { useProjectStatus } from "../hooks/useProjectStatus";
import ProjectWorkspace from "../components/workspace/ProjectWorkspace";

export default function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { statuses, loading, startProject, completeProject } = useProjectStatus();

  const project = projectsData.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0f1e] text-center p-6">
        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
          <FileCode className="text-slate-400" size={28} />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Project Not Found</h1>
        <p className="text-slate-400 text-sm mb-6">
          The project you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/projects"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </Link>
      </div>
    );
  }

  const hasTasks = project?.tasks && project.tasks.length > 0;
  const currentStatus = loading ? "NOT_STARTED" : (statuses[project.id]?.status || "NOT_STARTED");

  if (!hasTasks) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-slate-400 text-sm">This project doesn't have a workspace yet.</p>
          <Link to="/projects" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0f1e] flex flex-col">
      <ProjectWorkspace
        project={project}
        currentStatus={currentStatus}
        startProject={startProject}
        completeProject={completeProject}
      />
    </div>
  );
}
