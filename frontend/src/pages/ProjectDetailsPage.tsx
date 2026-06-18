import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Code2, CheckCircle2, ChevronRight, Play, BookOpen, Target, ArrowRight, GitBranch, Globe } from "lucide-react";
import { projectsData } from "../data/projectsData";
import { useProjectStatus } from "../hooks/useProjectStatus";

export default function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { statuses, loading, startProject, completeProject } = useProjectStatus();

  const [githubUrl, setGithubUrl] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
        <Link
          to="/projects"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all"
        >
          <ArrowLeft size={18} />
          Back to Projects
        </Link>
      </div>
    );
  }

  // Find index for next/prev navigation
  const currentIndex = projectsData.findIndex((p) => p.id === projectId);
  const prevProject = currentIndex > 0 ? projectsData[currentIndex - 1] : null;
  const nextProject = currentIndex < projectsData.length - 1 ? projectsData[currentIndex + 1] : null;

  const currentStatus = statuses[project.id]?.status;

  const handleComplete = async () => {
    if (!githubUrl.trim() || !description.trim()) {
      setError("GitHub Repository URL and Description are required.");
      return;
    }
    setError("");
    await completeProject(project.id, { githubUrl, liveDemoUrl, description });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="w-full min-h-full p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div>
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6 w-fit"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </button>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  {project.difficulty}
                </span>
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300">
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
            
            <div className="flex-shrink-0 flex gap-3">
              {loading ? (
                <div className="px-6 py-3 rounded-xl bg-slate-800 text-slate-400 font-medium">Loading...</div>
              ) : currentStatus === "COMPLETED" ? (
                <button disabled className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-medium cursor-not-allowed">
                  <CheckCircle2 size={18} />
                  Completed
                </button>
              ) : currentStatus === "IN_PROGRESS" ? (
                <button disabled className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 font-medium cursor-not-allowed">
                  <Play size={18} fill="currentColor" />
                  In Progress
                </button>
              ) : (
                <button 
                  onClick={() => startProject(project.id)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-500/20"
                >
                  <Play size={18} fill="currentColor" />
                  Start Project
                </button>
              )}
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
                  <Target className="text-blue-400" size={20} />
                  Key Features & Objectives
                </h2>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {project.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="text-emerald-400 flex-shrink-0 mt-0.5" size={18} />
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
                  <BookOpen className="text-blue-400" size={20} />
                  Step-by-Step Instructions
                </h2>
                <div className="space-y-4">
                  {project.instructions.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
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
            {currentStatus === "COMPLETED" ? (
              <section className="rounded-2xl border border-emerald-500/30 bg-emerald-900/10 backdrop-blur-sm p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-emerald-400">Project Completed</h2>
                    <p className="text-sm text-emerald-500/70">You have successfully submitted this project.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <GitBranch className="text-slate-400 mt-1 flex-shrink-0" size={20} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">GitHub Repository</p>
                      <a href={statuses[project.id]?.githubUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline truncate block">
                        {statuses[project.id]?.githubUrl}
                      </a>
                    </div>
                  </div>

                  {statuses[project.id]?.liveDemoUrl && (
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <Globe className="text-slate-400 mt-1 flex-shrink-0" size={20} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Live Demo</p>
                        <a href={statuses[project.id]?.liveDemoUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline truncate block">
                          {statuses[project.id]?.liveDemoUrl}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <BookOpen className="text-slate-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Submission Description</p>
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{statuses[project.id]?.description}</p>
                    </div>
                  </div>
                </div>
              </section>
            ) : currentStatus === "IN_PROGRESS" ? (
              <section className="rounded-2xl border border-blue-500/30 bg-blue-900/10 backdrop-blur-sm p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-2">Submit Your Project</h2>
                <p className="text-slate-400 mb-6 text-sm">Ready to share what you built? Fill out the details below to mark this project as complete.</p>
                
                {success && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3">
                    <CheckCircle2 size={20} />
                    Project submitted successfully!
                  </div>
                )}
                
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">GitHub Repository URL <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <GitBranch size={18} />
                      </div>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/yourusername/project-name"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Live Demo URL <span className="text-slate-500 font-normal">(Optional)</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Globe size={18} />
                      </div>
                      <input
                        type="url"
                        value={liveDemoUrl}
                        onChange={(e) => setLiveDemoUrl(e.target.value)}
                        placeholder="https://your-live-demo.com"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">What did you build? <span className="text-red-400">*</span></label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Briefly describe what you built and what you learned..."
                      rows={4}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-y"
                    ></textarea>
                  </div>

                  <button
                    onClick={handleComplete}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    <CheckCircle2 size={20} />
                    Submit Project
                  </button>
                </div>
              </section>
            ) : null}

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
                      <CheckCircle2 className="text-emerald-500/70 flex-shrink-0 mt-0.5" size={16} />
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
