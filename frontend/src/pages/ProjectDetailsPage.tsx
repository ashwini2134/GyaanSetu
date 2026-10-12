import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Code2, CheckCircle2, ChevronRight, Play, BookOpen, Target, ArrowRight, GitBranch, Globe, Loader2, AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { projectsData } from "../data/projectsData";
import { useProjectStatus } from "../hooks/useProjectStatus";
import ProjectSubmission from "../components/student/ProjectSubmission";
export default function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  if (!projectId) return null;

  const { submission, loading: statusLoading, error: statusError, submitProject, cancelSubmission } = useProjectStatus(projectId);

  const project = projectsData.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6">
        <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
          <BookOpen className="text-slate-400" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Project Not Found</h1>
        <p className="text-slate-400 max-w-md mb-8">
          The project you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/projects" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00BFB3] hover:bg-[#00BFB3]/90 text-white font-medium transition-all">
          <ArrowLeft size={18} />
          Back to Projects
        </Link>
      </div>
    );
  }

  const currentIndex = projectsData.findIndex((p) => p.id === projectId);
  const prevProject = currentIndex > 0 ? projectsData[currentIndex - 1] : null;
  const nextProject = currentIndex < projectsData.length - 1 ? projectsData[currentIndex + 1] : null;

  const currentStatus = submission?.status || "NOT_SUBMITTED";

  return (
    <div className="w-full min-h-full p-4 md:p-6 lg:p-8">
      {statusError && (
        <div className="max-w-5xl mx-auto mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
          <AlertCircle size={20} />
          Failed to load project status: {statusError}
        </div>
      )}
      
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div>
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-200 bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/60 hover:border-[#00BFB3]/40 hover:text-white transition-all mb-6 w-fit shadow-sm"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </button>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-[#00BFB3] text-[#FFFFFF] border-transparent">
                  {project.category}
                </span>
                {project.estimatedDuration && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/50 border border-slate-700/50 text-slate-400">
                    <Clock size={12} />
                    {project.estimatedDuration}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                {project.title}
              </h1>
              <p className="text-slate-300 text-lg max-w-3xl leading-relaxed">
                {project.longDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Features */}
            {project.features && project.features.length > 0 && (
              <section className="rounded-2xl border border-slate-700/30 bg-slate-800/30 backdrop-blur-sm p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Target className="text-[#00BFB3]" size={20} />
                  Key Features & Objectives
                </h2>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {project.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="text-[#00BFB3] flex-shrink-0 mt-0.5" size={18} />
                      <span className="text-slate-300 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Instructions */}
            {project.instructions && project.instructions.length > 0 && (
              <section className="rounded-2xl border border-slate-700/30 bg-slate-800/30 backdrop-blur-sm p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <BookOpen className="text-[#00BFB3]" size={20} />
                  Step-by-Step Instructions
                </h2>
                <div className="space-y-4">
                  {project.instructions.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1B2B44] text-[#FFFFFF] border-transparent flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <p className="text-slate-300 leading-relaxed pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Expected Output */}
            {project.expectedOutput && (
              <section className="rounded-2xl border border-slate-700/30 bg-slate-800/30 backdrop-blur-sm p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-4">Expected Output</h2>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <p className="text-slate-300 leading-relaxed">{project.expectedOutput}</p>
                </div>
              </section>
            )}
            
            {/* Submission Section */}
            <ProjectSubmission 
              projectId={projectId}
              submission={submission}
              loading={statusLoading}
              error={statusError}
              submitProject={submitProject}
              cancelSubmission={cancelSubmission}
            />

          </div>

          {/* Sidebar Info (Right) */}
          <div className="space-y-6">
            
            {/* Technologies */}
            {project.technologies && project.technologies.length > 0 && (
              <section className="rounded-2xl border border-slate-700/30 bg-slate-800/30 backdrop-blur-sm p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Code2 size={16} />
                  Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Prerequisites */}
            {project.prerequisites && project.prerequisites.length > 0 && (
              <section className="rounded-2xl border border-slate-700/30 bg-slate-800/30 backdrop-blur-sm p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Prerequisites
                </h3>
                <ul className="space-y-3">
                  {project.prerequisites.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <ChevronRight className="text-slate-500 flex-shrink-0 mt-0.5" size={16} />
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Learning Outcomes */}
            {project.learningOutcomes && project.learningOutcomes.length > 0 && (
              <section className="rounded-2xl border border-slate-700/30 bg-slate-800/30 backdrop-blur-sm p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Learning Outcomes
                </h3>
                <ul className="space-y-3">
                  {project.learningOutcomes.map((outcome, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="text-[#00BFB3] flex-shrink-0 mt-0.5" size={16} />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </section>
            )}

          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-8 mt-8 border-t border-slate-700/50 flex items-center justify-between gap-4">
          {prevProject ? (
            <Link
              to={`/projects/${prevProject.id}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 transition-colors group max-w-[45%]"
            >
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-slate-500 transition-colors flex-shrink-0">
                <ArrowLeft size={18} className="text-slate-400 group-hover:text-white" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs text-slate-500 font-medium mb-0.5">Previous Project</div>
                <div className="text-sm font-bold text-slate-200 truncate">{prevProject.title}</div>
              </div>
            </Link>
          ) : <div />}

          {nextProject ? (
            <Link
              to={`/projects/${nextProject.id}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 transition-colors group text-right max-w-[45%]"
            >
              <div className="overflow-hidden">
                <div className="text-xs text-slate-500 font-medium mb-0.5">Next Project</div>
                <div className="text-sm font-bold text-slate-200 truncate">{nextProject.title}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-slate-500 transition-colors flex-shrink-0">
                <ArrowRight size={18} className="text-slate-400 group-hover:text-white" />
              </div>
            </Link>
          ) : <div />}
        </div>
        
      </div>
    </div>
  );
}
