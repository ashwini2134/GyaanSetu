import { useState } from "react";
import { FolderKanban, CheckCircle, Clock, CircleDashed, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { projectsData } from "../data/projectsData";
import { useProjectStatus } from "../hooks/useProjectStatus";

const CATEGORIES = [
  "Beginner Level",
  "Intermediate Level",
  "Advanced Level",
  "AI/ML Projects",
  "Industry Projects",
  "Capstone Projects"
] as const;

type Category = typeof CATEGORIES[number];

const GRADIENTS = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-orange-500 to-yellow-500",
  "from-green-500 to-teal-500",
];

const GLOWS = [
  "group-hover:shadow-[0_8px_32px_rgba(168,85,247,0.3)]",
  "group-hover:shadow-[0_8px_32px_rgba(56,189,248,0.3)]",
  "group-hover:shadow-[0_8px_32px_rgba(249,115,22,0.3)]",
  "group-hover:shadow-[0_8px_32px_rgba(34,197,94,0.3)]",
];

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState<Category>("Beginner Level");
  const { statuses } = useProjectStatus();

  const filteredProjects = projectsData.filter(p => p.category === activeCategory);

  return (
    <div className="w-full min-h-full p-4 md:p-6 bg-[#0f172a]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <FolderKanban size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Projects</h1>
            <p className="text-sm text-slate-400 mt-1">Build real-world applications to master your skills</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar / Tabs */}
          <div className="w-full lg:w-64 flex-shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex-shrink-0 lg:w-full text-left px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                    isActive
                      ? "bg-white/10 text-white border-white/20 shadow-[0_4px_20px_rgba(255,255,255,0.05)] backdrop-blur-md translate-x-1"
                      : "text-slate-400 hover:bg-white/5 hover:text-white border-transparent hover:border-white/10"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Project Grid */}
          <div className="flex-1 w-full grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project, index) => {
              const statusData = statuses[project.id];
              const status = statusData?.status || "NOT_STARTED";
              
              const gradient = GRADIENTS[index % GRADIENTS.length];
              const glow = GLOWS[index % GLOWS.length];

              return (
                <div
                  key={project.id}
                  className={`group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 ${glow} overflow-hidden`}
                >
                  {/* Subtle Gradient Accent Header */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-70 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  {/* Decorative Gradient Blob */}
                  <div className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-500`} />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4 gap-2">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-white/10 border border-white/20 text-slate-300">
                        {project.difficulty}
                      </span>
                      
                      {status === "COMPLETED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-teal-500/30 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.2)]">
                          <CheckCircle size={12} />
                          Completed
                        </span>
                      ) : status === "IN_PROGRESS" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                          <Clock size={12} />
                          In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-gradient-to-r from-slate-600/20 to-gray-500/20 border border-slate-500/30 text-slate-400">
                          <CircleDashed size={12} />
                          Not Started
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300 mb-2 leading-tight">
                      {project.title}
                    </h2>
                    
                    <p className="text-sm text-white/60 leading-relaxed mb-6 line-clamp-3 font-medium">
                      {project.shortDescription}
                    </p>
                  </div>

                  <Link
                    to={`/projects/${project.id}`}
                    className={`relative z-10 w-full flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all duration-300 border border-white/10 group-hover:border-white/20`}
                  >
                    <span>View Project</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
