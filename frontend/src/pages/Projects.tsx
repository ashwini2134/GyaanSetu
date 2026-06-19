import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FolderKanban, CheckCircle, Clock, CircleDashed, ArrowRight, Code, Calculator, ListTodo, Timer, Globe, Cloud, BarChart3, HelpCircle, FileText, MessageSquare, BookOpen, Bot, ShoppingCart, Play, GraduationCap, LineChart, FileSearch, ImageIcon, Star, Landmark, HeartPulse, UtensilsCrossed, Package, Layers, Users, Award } from "lucide-react";
import { projectsData, type Project } from "../data/projectsData";
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

const PROJECT_GRADIENTS = [
  "from-violet-500/20 via-fuchsia-500/10 to-transparent",
  "from-blue-500/20 via-cyan-500/10 to-transparent",
  "from-emerald-500/20 via-teal-500/10 to-transparent",
  "from-amber-500/20 via-orange-500/10 to-transparent",
  "from-rose-500/20 via-pink-500/10 to-transparent",
  "from-indigo-500/20 via-purple-500/10 to-transparent",
];

const PROJECT_PREVIEWS: Record<string, { gradient: string; icon: React.ReactNode }> = {
  calculator: { gradient: "from-violet-600/25 via-fuchsia-600/10 to-slate-900", icon: <Calculator size={48} /> },
  "to-do-app": { gradient: "from-blue-600/25 via-cyan-600/10 to-slate-900", icon: <ListTodo size={48} /> },
  stopwatch: { gradient: "from-emerald-600/25 via-teal-600/10 to-slate-900", icon: <Timer size={48} /> },
  "portfolio-website": { gradient: "from-amber-600/25 via-orange-600/10 to-slate-900", icon: <Globe size={48} /> },
  "weather-app": { gradient: "from-sky-600/25 via-blue-600/10 to-slate-900", icon: <Cloud size={48} /> },
  "expense-tracker": { gradient: "from-rose-600/25 via-pink-600/10 to-slate-900", icon: <BarChart3 size={48} /> },
  "quiz-application": { gradient: "from-indigo-600/25 via-purple-600/10 to-slate-900", icon: <HelpCircle size={48} /> },
  "blog-website": { gradient: "from-teal-600/25 via-emerald-600/10 to-slate-900", icon: <FileText size={48} /> },
  "chat-application": { gradient: "from-cyan-600/25 via-blue-600/10 to-slate-900", icon: <MessageSquare size={48} /> },
  "library-management-system": { gradient: "from-violet-600/25 via-indigo-600/10 to-slate-900", icon: <BookOpen size={48} /> },
  "ai-chatbot": { gradient: "from-purple-600/25 via-pink-600/10 to-slate-900", icon: <Bot size={48} /> },
  "e-commerce-platform": { gradient: "from-orange-600/25 via-amber-600/10 to-slate-900", icon: <ShoppingCart size={48} /> },
  "video-streaming-platform": { gradient: "from-red-600/25 via-rose-600/10 to-slate-900", icon: <Play size={48} /> },
  "online-compiler": { gradient: "from-slate-600/25 via-gray-600/10 to-slate-900", icon: <Code size={48} /> },
  "lms-system": { gradient: "from-blue-600/25 via-indigo-600/10 to-slate-900", icon: <GraduationCap size={48} /> },
  "sentiment-analysis": { gradient: "from-green-600/25 via-emerald-600/10 to-slate-900", icon: <LineChart size={48} /> },
  "resume-analyzer": { gradient: "from-cyan-600/25 via-teal-600/10 to-slate-900", icon: <FileSearch size={48} /> },
  "image-classification": { gradient: "from-fuchsia-600/25 via-purple-600/10 to-slate-900", icon: <ImageIcon size={48} /> },
  "recommendation-system": { gradient: "from-pink-600/25 via-rose-600/10 to-slate-900", icon: <Star size={48} /> },
  "banking-system": { gradient: "from-emerald-600/25 via-teal-600/10 to-slate-900", icon: <Landmark size={48} /> },
  "hospital-management-system": { gradient: "from-sky-600/25 via-blue-600/10 to-slate-900", icon: <HeartPulse size={48} /> },
  "food-delivery-app": { gradient: "from-orange-600/25 via-red-600/10 to-slate-900", icon: <UtensilsCrossed size={48} /> },
  "inventory-management-system": { gradient: "from-indigo-600/25 via-violet-600/10 to-slate-900", icon: <Package size={48} /> },
  "full-stack-capstone": { gradient: "from-amber-600/25 via-orange-600/10 to-slate-900", icon: <Layers size={48} /> },
  "team-agile-project": { gradient: "from-blue-600/25 via-cyan-600/10 to-slate-900", icon: <Users size={48} /> },
  "portfolio-masterpiece": { gradient: "from-rose-600/25 via-pink-600/10 to-slate-900", icon: <Award size={48} /> },
};

function ProjectPreview({ projectId }: { projectId: string }) {
  const config = PROJECT_PREVIEWS[projectId] || PROJECT_PREVIEWS.calculator;
  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br ${config.gradient}`}>
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 8px 8px, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white/20">{config.icon}</div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-teal-500/30 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.15)]">
        <CheckCircle size={12} />
        Completed
      </span>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
        <Clock size={12} />
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

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colorMap: Record<string, string> = {
    Beginner: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    Intermediate: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    Advanced: "bg-rose-500/15 text-rose-300 border-rose-500/25",
    Expert: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  };
  const cls = colorMap[difficulty] || "bg-slate-500/15 text-slate-300 border-slate-500/25";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border ${cls}`}>
      {difficulty}
    </span>
  );
}

function SkillPill({ skill }: { skill: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 border border-white/10 text-slate-300">
      {skill}
    </span>
  );
}

interface CarouselCardProps {
  project: Project;
  isExpanded: boolean;
  status: string;
  gradientIndex: number;
  onHover: () => void;
}

function CarouselCard({ project, isExpanded, status, gradientIndex, onHover }: CarouselCardProps) {
  const expanded = isExpanded;
  const spotRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!spotRef.current) return;
    const rect = spotRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    spotRef.current.style.setProperty("--mx", `${x}%`);
    spotRef.current.style.setProperty("--my", `${y}%`);
  }, []);

  return (
    <motion.div
      layout
      onMouseEnter={onHover}
      onMouseMove={handleMouseMove}
      animate={{
        height: expanded ? 420 : 76,
      }}
      transition={{
        duration: 0.3,
        ease: [0.32, 0.72, 0, 1],
      }}
      className={`relative rounded-2xl overflow-hidden cursor-pointer border transition-shadow duration-300 ${
        expanded
          ? "border-blue-500/30 shadow-[0_0_40px_-8px_rgba(59,130,246,0.15)] bg-gradient-to-br from-slate-800/80 to-slate-900/80"
          : "border-slate-800/60 hover:border-slate-700/60 bg-slate-900/40 hover:bg-slate-800/50"
      }`}
    >
      {expanded && (
        <div className={`absolute inset-0 opacity-30 bg-gradient-to-br ${PROJECT_GRADIENTS[gradientIndex]} transition-opacity duration-500`} />
      )}

      <div className="absolute inset-0 pointer-events-none">
        <div
          ref={spotRef}
          className={`absolute inset-0 bg-[radial-gradient(600px_circle_at_var(--mx,50%)_var(--my,50%),rgba(59,130,246,0.08)_0%,transparent_60%)] transition-opacity duration-500 ${expanded ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      <div className="relative z-10 flex items-center gap-4 px-6 h-[76px]">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${expanded ? "from-blue-500/30 to-cyan-500/20" : "from-slate-700/50 to-slate-800/50"} flex items-center justify-center flex-shrink-0 transition-all duration-300`}>
          <Code size={18} className={expanded ? "text-blue-300" : "text-slate-400"} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-semibold truncate transition-colors duration-300 ${expanded ? "text-white" : "text-slate-200"}`}>
            {project.title}
          </h3>
          {!expanded && (
            <p className="text-xs text-slate-500 truncate mt-0.5">{project.shortDescription}</p>
          )}
        </div>
        {!expanded && (
          <div className="flex-shrink-0">
            <StatusBadge status={status} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="relative z-10 px-6 pb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-3 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <DifficultyBadge difficulty={project.difficulty} />
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={13} />
                    {project.estimatedDuration}
                  </span>
                  <StatusBadge status={status} />
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {project.shortDescription}
                </p>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map(t => (
                      <SkillPill key={t} skill={t} />
                    ))}
                    {project.learningOutcomes.slice(0, 2).map(s => (
                      <SkillPill key={s} skill={s} />
                    ))}
                  </div>
                </div>

                {status === "IN_PROGRESS" && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-slate-400">Progress</span>
                      <span className="text-[11px] font-medium text-cyan-400">In Progress</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                      <div className="w-2/5 h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                    </div>
                  </div>
                )}

                <Link
                  to={`/projects/${project.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-semibold transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
                >
                  {status === "COMPLETED" ? "Review Project" : status === "IN_PROGRESS" ? "Continue Project" : "Start Project"}
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="md:col-span-2 hidden md:block">
                <div className="h-full min-h-[180px] rounded-2xl overflow-hidden">
                  <ProjectPreview projectId={project.id} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState<Category>("Beginner Level");
  const firstProjectId = projectsData.find(p => p.category === activeCategory)?.id ?? null;
  const [activeProjectId, setActiveProjectId] = useState<string | null>(firstProjectId);
  const { statuses } = useProjectStatus();

  const filteredProjects = projectsData.filter(p => p.category === activeCategory);

  const getStatus = useCallback((projectId: string) => {
    return statuses[projectId]?.status || "NOT_STARTED";
  }, [statuses]);

  return (
    <div className="w-full min-h-full bg-[#0f172a]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <FolderKanban size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Projects</h1>
            <p className="text-sm text-slate-400 mt-1">Build real-world applications and portfolio-ready projects</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-64 flex-shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              const count = projectsData.filter(p => p.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => { setActiveCategory(category); setActiveProjectId(projectsData.find(p => p.category === category)?.id ?? null); }}
                  className={`flex-shrink-0 lg:w-full text-left px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                    isActive
                      ? "bg-white/10 text-white border-white/20 shadow-[0_4px_20px_rgba(255,255,255,0.05)] backdrop-blur-md"
                      : "text-slate-400 hover:bg-white/5 hover:text-white border-transparent hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{category}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${isActive ? "bg-white/10 text-slate-300" : "bg-slate-800/60 text-slate-500"}`}>
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex-1 w-full space-y-3" onMouseLeave={() => setActiveProjectId(null)}>
            {filteredProjects.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-500 text-sm">No projects in this category yet.</p>
              </div>
            )}

            {filteredProjects.map((project, index) => (
              <CarouselCard
                key={project.id}
                project={project}
                isExpanded={activeProjectId === project.id}
                status={getStatus(project.id)}
                gradientIndex={index % PROJECT_GRADIENTS.length}
                onHover={() => setActiveProjectId(project.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
