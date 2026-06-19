import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Clock, Code2, CheckCircle2, ChevronRight, BookOpen, Target, 
  ArrowRight, GitBranch, Globe, ListChecks, Eye, Send, GraduationCap 
} from "lucide-react";
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
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-[#0a0f1e]">
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

  const currentIndex = projectsData.findIndex((p) => p.id === projectId);
  const prevProject = currentIndex > 0 ? projectsData[currentIndex - 1] : null;
  const nextProject = currentIndex < projectsData.length - 1 ? projectsData[currentIndex + 1] : null;

  const currentStatus = statuses[project.id]?.status || "NOT_STARTED";

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
    <div className="relative w-full min-h-screen bg-[#0a0f1e] overflow-hidden selection:bg-purple-500/30 font-sans">
      
      {/* Inline Styles for Custom Keyframe Animations */}
      <style>{`
        @keyframes aurora {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes text-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-left {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-aurora {
          background-size: 200% 200%;
          animation: aurora 15s ease infinite;
        }
        .animate-text-gradient {
          background-size: 200% auto;
          animation: text-gradient 4s linear infinite;
        }
        .fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .slide-in-left {
          animation: slide-in-left 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
      `}</style>

      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-900/40 via-[#0a0f1e] to-cyan-900/40 animate-aurora"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        
        {/* 1. TOP NAVIGATION BAR */}
        <div className="flex items-center gap-4 mb-10 fade-in-up">
          <button
            onClick={() => navigate("/projects")}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300 hover:-translate-x-1 backdrop-blur-md"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Back to Projects</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-white/40 tracking-wider uppercase">
            <span>Projects</span>
            <ChevronRight size={12} />
            <span className="text-white/70">{project.title}</span>
          </div>
        </div>
        
        {/* 2. PROJECT HEADER SECTION */}
        <div className="mb-12 fade-in-up delay-100">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/80 shadow-[0_0_10px_rgba(255,255,255,0.05)]">
              {project.difficulty}
            </span>
            <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/80 shadow-[0_0_10px_rgba(255,255,255,0.05)]">
              {project.category}
            </span>
            {project.estimatedDuration && (
              <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/80 shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                <Clock size={12} />
                {project.estimatedDuration}
              </span>
            )}

            {/* Status Badge */}
            {loading ? (
              <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/50">
                Loading...
              </span>
            ) : currentStatus === "COMPLETED" ? (
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-teal-500/40 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                <CheckCircle2 size={14} />
                Completed
              </span>
            ) : currentStatus === "IN_PROGRESS" ? (
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                In Progress
              </span>
            ) : (
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-slate-600/20 to-gray-500/20 border border-slate-500/30 text-slate-300 shadow-[0_0_10px_rgba(148,163,184,0.1)]">
                Not Started
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight animate-text-gradient bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
            {project.title}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed font-medium">
            {project.longDescription}
          </p>

          {currentStatus === "NOT_STARTED" && !loading && (
            <button 
              onClick={() => startProject(project.id)}
              className="mt-8 flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-95"
            >
              Start Project Now
              <ArrowRight size={20} className="animate-pulse" />
            </button>
          )}
        </div>

        {/* 3. MAIN CONTENT — TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* A. KEY FEATURES & OBJECTIVES CARD */}
            {project.features && project.features.length > 0 && (
              <div className="group relative rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(20,184,166,0.15)] overflow-hidden fade-in-up delay-200">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-teal-500" />
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Target className="text-teal-400" size={24} />
                  Key Features & Objectives
                </h2>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {project.features.map((feature, idx) => (
                    <li 
                      key={idx} 
                      className="flex items-start gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-green-500/10 hover:shadow-[inset_0_0_10px_rgba(34,197,94,0.1)] slide-in-left"
                      style={{ animationDelay: `${200 + idx * 100}ms` }}
                    >
                      <CheckCircle2 className="text-green-400 flex-shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" size={18} />
                      <span className="text-white/70 leading-relaxed text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* B. STEP-BY-STEP INSTRUCTIONS CARD */}
            {project.instructions && project.instructions.length > 0 && (
              <div className="group relative rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] overflow-hidden fade-in-up delay-300">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500" />
                <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                  <ListChecks className="text-blue-400" size={24} />
                  Step-by-Step Instructions
                </h2>
                <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-5 md:before:translate-x-0 before:h-full before:w-0.5 before:bg-blue-500/30">
                  {project.instructions.map((step, idx) => (
                    <div 
                      key={idx} 
                      className="relative flex items-start gap-6 slide-in-left group/step"
                      style={{ animationDelay: `${300 + idx * 100}ms` }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-900/50 border border-blue-400/50 text-blue-300 flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.2)] z-10 group-hover/step:bg-blue-500 group-hover/step:text-white group-hover/step:border-blue-400 group-hover/step:shadow-[0_0_20px_rgba(59,130,246,0.6)] group-hover/step:scale-110 transition-all duration-300">
                        {idx + 1}
                      </div>
                      <div className="pt-2 pb-2 px-4 rounded-xl transition-all duration-300 group-hover/step:bg-white/5 group-hover/step:shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                        <p className="text-white/70 leading-relaxed font-medium">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* C. EXPECTED OUTPUT CARD */}
            {project.expectedOutput && (
              <div className="group relative rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)] overflow-hidden fade-in-up delay-400">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-500" />
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Eye className="text-purple-400" size={24} />
                  Expected Output
                </h2>
                <div className="relative p-6 rounded-xl bg-white/10 border border-white/10 before:absolute before:inset-0 before:rounded-xl before:border before:border-purple-500/0 hover:before:border-purple-500/30 before:transition-all before:duration-500 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <p className="text-white/80 leading-relaxed italic font-medium relative z-10">{project.expectedOutput}</p>
                </div>
              </div>
            )}
            
            {/* D. SUBMIT YOUR PROJECT FORM CARD */}
            {currentStatus === "IN_PROGRESS" && (
              <div className="group relative rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)] overflow-hidden fade-in-up delay-500">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-yellow-500" />
                <div className="flex items-center gap-3 mb-2">
                  <Send className="text-orange-400" size={28} />
                  <h2 className="text-2xl font-bold text-white">Submit Your Project</h2>
                </div>
                <p className="text-white/50 mb-8 text-sm font-medium">Ready to share what you built? Fill out the details below.</p>
                
                {success && (
                  <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 flex items-center gap-3 font-medium shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <CheckCircle2 size={20} />
                    Project submitted successfully!
                  </div>
                )}
                
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2">GitHub Repository URL <span className="text-orange-400">*</span></label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within/input:text-purple-400 transition-colors">
                        <GitBranch size={18} />
                      </div>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/yourusername/project-name"
                        className="w-full bg-white/5 border border-white/15 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2">Live Demo URL <span className="text-white/40 font-normal">(Optional)</span></label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within/input:text-purple-400 transition-colors">
                        <Globe size={18} />
                      </div>
                      <input
                        type="url"
                        value={liveDemoUrl}
                        onChange={(e) => setLiveDemoUrl(e.target.value)}
                        placeholder="https://your-live-demo.com"
                        className="w-full bg-white/5 border border-white/15 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2">What did you build? <span className="text-orange-400">*</span></label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Briefly describe what you built and what you learned..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/15 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all resize-y shadow-inner"
                    ></textarea>
                  </div>

                  <button
                    onClick={handleComplete}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(217,70,239,0.4)] active:scale-95"
                  >
                    <CheckCircle2 size={22} />
                    Submit Project
                  </button>
                </div>
              </div>
            )}

            {/* SUBMITTED PROJECT SUMMARY */}
            {currentStatus === "COMPLETED" && (
              <div className="group relative rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(20,184,166,0.15)] overflow-hidden fade-in-up delay-500">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-teal-500" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Project Completed</h2>
                    <p className="text-sm font-medium text-white/60">You have successfully submitted this project.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10 transition-colors hover:bg-white/10">
                    <GitBranch className="text-teal-400 mt-1 flex-shrink-0" size={20} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">GitHub Repository</p>
                      <a href={statuses[project.id]?.githubUrl} target="_blank" rel="noreferrer" className="text-white hover:text-teal-300 hover:underline truncate block font-medium transition-colors">
                        {statuses[project.id]?.githubUrl}
                      </a>
                    </div>
                  </div>

                  {statuses[project.id]?.liveDemoUrl && (
                    <div className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10 transition-colors hover:bg-white/10">
                      <Globe className="text-teal-400 mt-1 flex-shrink-0" size={20} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Live Demo</p>
                        <a href={statuses[project.id]?.liveDemoUrl} target="_blank" rel="noreferrer" className="text-white hover:text-teal-300 hover:underline truncate block font-medium transition-colors">
                          {statuses[project.id]?.liveDemoUrl}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10 transition-colors hover:bg-white/10">
                    <BookOpen className="text-teal-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Submission Description</p>
                      <p className="text-white/80 leading-relaxed whitespace-pre-wrap font-medium">{statuses[project.id]?.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* E. TECHNOLOGIES CARD */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="group rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] relative overflow-hidden fade-in-up delay-200">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Code2 className="text-cyan-400" size={20} />
                  Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, idx) => {
                    const pillGradients = [
                      "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]",
                      "from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]",
                      "from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]",
                      "from-green-500/20 to-teal-500/20 text-green-300 border-green-500/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                    ];
                    return (
                      <span 
                        key={idx} 
                        className={`px-3 py-1.5 rounded-lg bg-gradient-to-r border text-sm font-bold transition-all duration-300 hover:scale-105 cursor-default ${pillGradients[idx % pillGradients.length]}`}
                      >
                        {tech}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* F. PREREQUISITES CARD */}
            {project.prerequisites && project.prerequisites.length > 0 && (
              <div className="group rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] relative overflow-hidden fade-in-up delay-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <BookOpen className="text-indigo-400" size={20} />
                  Prerequisites
                </h3>
                <ul className="space-y-3">
                  {project.prerequisites.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-2 rounded-lg transition-all duration-300 hover:bg-white/5 hover:translate-x-1 cursor-default">
                      <ChevronRight className="text-purple-400 flex-shrink-0 mt-0.5 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]" size={18} />
                      <span className="text-white/70 text-sm font-medium leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* G. LEARNING OUTCOMES CARD */}
            {project.learningOutcomes && project.learningOutcomes.length > 0 && (
              <div className="group rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(34,197,94,0.15)] relative overflow-hidden fade-in-up delay-400">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <GraduationCap className="text-green-400" size={20} />
                  Learning Outcomes
                </h3>
                <ul className="space-y-3">
                  {project.learningOutcomes.map((outcome, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-2 rounded-lg transition-all duration-300 hover:bg-white/5 hover:shadow-[inset_0_0_10px_rgba(52,211,153,0.1)] cursor-default">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] flex-shrink-0" />
                      <span className="text-white/70 text-sm font-medium leading-relaxed">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>

        {/* 4. PREVIOUS / NEXT PROJECT NAVIGATION */}
        <div className="mt-12 grid grid-cols-2 gap-4 lg:gap-6 fade-in-up delay-500">
          {prevProject ? (
            <Link
              to={`/projects/${prevProject.id}`}
              className="group flex items-center gap-4 p-4 lg:p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)]"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-purple-500/20 group-hover:border-purple-500/50 group-hover:text-purple-300 transition-colors flex-shrink-0 text-white/50">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Previous Project</div>
                <div className="text-sm lg:text-base font-bold text-white truncate group-hover:text-purple-300 transition-colors">{prevProject.title}</div>
              </div>
            </Link>
          ) : <div />}

          {nextProject ? (
            <Link
              to={`/projects/${nextProject.id}`}
              className="group flex items-center justify-end text-right gap-4 p-4 lg:p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)]"
            >
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Next Project</div>
                <div className="text-sm lg:text-base font-bold text-white truncate group-hover:text-cyan-300 transition-colors">{nextProject.title}</div>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/50 group-hover:text-cyan-300 transition-colors flex-shrink-0 text-white/50">
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ) : <div />}
        </div>
        
      </div>
    </div>
  );
}
