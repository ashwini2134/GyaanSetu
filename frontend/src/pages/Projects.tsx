import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FolderKanban, CheckCircle, Clock, CircleDashed, ArrowRight, Code, Calculator, ListTodo, Timer, Globe, Cloud, BarChart3, HelpCircle, FileText, MessageSquare, BookOpen, Bot, ShoppingCart, Play, GraduationCap, LineChart, FileSearch, ImageIcon, Star, Landmark, HeartPulse, UtensilsCrossed, Package, Layers, Users, Award } from "lucide-react";
import { projectsData, type Project } from "../data/projectsData";
import { useAllProjectStatuses } from "../hooks/useAllProjectStatuses";

const CATEGORIES = [
  "Beginner Level",
  "Intermediate Level",
  "Advanced Level",
  "AI/ML Projects",
  "Industry Projects"
] as const;

type Category = typeof CATEGORIES[number];

const PROJECT_GRADIENTS = [
  "from-[#007DAF]/20 via-[#0F9FB6]/10 to-transparent",
  "from-[#0F9FB6]/20 via-[#79C8C2]/10 to-transparent",
  "from-[#79C8C2]/20 via-[#006491]/10 to-transparent",
  "from-[#006491]/20 via-[#007DAF]/10 to-transparent",
  "from-[#007DAF]/20 via-[#0F9FB6]/10 to-transparent",
  "from-[#0F9FB6]/20 via-[#79C8C2]/10 to-transparent",
];

const PROJECT_PREVIEWS: Record<string, { gradient: string; icon: React.ReactNode }> = {
  calculator: { gradient: "from-[#007DAF]/25 via-[#0F9FB6]/10 to-slate-900", icon: <Calculator size={48} /> },
  "to-do-app": { gradient: "from-[#0F9FB6]/25 via-[#79C8C2]/10 to-slate-900", icon: <ListTodo size={48} /> },
  stopwatch: { gradient: "from-[#79C8C2]/25 via-[#006491]/10 to-slate-900", icon: <Timer size={48} /> },
  "portfolio-website": { gradient: "from-[#006491]/25 via-[#007DAF]/10 to-slate-900", icon: <Globe size={48} /> },
  "weather-app": { gradient: "from-[#007DAF]/25 via-[#0F9FB6]/10 to-slate-900", icon: <Cloud size={48} /> },
  "expense-tracker": { gradient: "from-[#0F9FB6]/25 via-[#79C8C2]/10 to-slate-900", icon: <BarChart3 size={48} /> },
  "quiz-application": { gradient: "from-[#79C8C2]/25 via-[#006491]/10 to-slate-900", icon: <HelpCircle size={48} /> },
  "blog-website": { gradient: "from-[#006491]/25 via-[#007DAF]/10 to-slate-900", icon: <FileText size={48} /> },
  "chat-application": { gradient: "from-[#007DAF]/25 via-[#0F9FB6]/10 to-slate-900", icon: <MessageSquare size={48} /> },
  "library-management-system": { gradient: "from-[#0F9FB6]/25 via-[#79C8C2]/10 to-slate-900", icon: <BookOpen size={48} /> },
  "ai-chatbot": { gradient: "from-[#79C8C2]/25 via-[#006491]/10 to-slate-900", icon: <Bot size={48} /> },
  "e-commerce-platform": { gradient: "from-[#006491]/25 via-[#007DAF]/10 to-slate-900", icon: <ShoppingCart size={48} /> },
  "video-streaming-platform": { gradient: "from-[#007DAF]/25 via-[#0F9FB6]/10 to-slate-900", icon: <Play size={48} /> },
  "online-compiler": { gradient: "from-[#0F9FB6]/25 via-[#79C8C2]/10 to-slate-900", icon: <Code size={48} /> },
  "lms-system": { gradient: "from-[#79C8C2]/25 via-[#006491]/10 to-slate-900", icon: <GraduationCap size={48} /> },
  "sentiment-analysis": { gradient: "from-[#006491]/25 via-[#007DAF]/10 to-slate-900", icon: <LineChart size={48} /> },
  "resume-analyzer": { gradient: "from-[#007DAF]/25 via-[#0F9FB6]/10 to-slate-900", icon: <FileSearch size={48} /> },
  "image-classification": { gradient: "from-[#0F9FB6]/25 via-[#79C8C2]/10 to-slate-900", icon: <ImageIcon size={48} /> },
  "recommendation-system": { gradient: "from-[#79C8C2]/25 via-[#006491]/10 to-slate-900", icon: <Star size={48} /> },
  "banking-system": { gradient: "from-[#006491]/25 via-[#007DAF]/10 to-slate-900", icon: <Landmark size={48} /> },
  "hospital-management-system": { gradient: "from-[#007DAF]/25 via-[#0F9FB6]/10 to-slate-900", icon: <HeartPulse size={48} /> },
  "food-delivery-app": { gradient: "from-[#0F9FB6]/25 via-[#79C8C2]/10 to-slate-900", icon: <UtensilsCrossed size={48} /> },
  "inventory-management-system": { gradient: "from-[#79C8C2]/25 via-[#006491]/10 to-slate-900", icon: <Package size={48} /> },
};

function ProjectPreview({ projectId }: { projectId: string }) {
  const config = PROJECT_PREVIEWS[projectId] || PROJECT_PREVIEWS.calculator;
  const isCalculator = projectId === "calculator";
  const isTodoApp = projectId === "to-do-app";
  const isPortfolioWebsite = projectId === "portfolio-website";
  const isStopwatch = projectId === "stopwatch";
  const isBlogWebsite = projectId === "blog-website";
  const isLibrarySystem = projectId === "library-management-system";
  const isQuizApplication = projectId === "quiz-application";
  const isAiChatbot = projectId === "ai-chatbot";
  const isExpenseTracker = projectId === "expense-tracker";
  const isChatApp = projectId === "chat-application";
  const isVideoStreaming = projectId === "video-streaming-platform";
  const isLmsSystem = projectId === "lms-system";
  const isSentimentAnalysis = projectId === "sentiment-analysis";
  const isImageClassification = projectId === "image-classification";
  const isResumeAnalyzer = projectId === "resume-analyzer";
  const isEcommercePlatform = projectId === "e-commerce-platform";
  const isOnlineCompiler = projectId === "online-compiler";
  const isRecommendationSystem = projectId === "recommendation-system";
  const isWeatherApp = projectId === "weather-app";
  const isInventorySystem = projectId === "inventory-management-system";
  const isFoodDeliveryApp = projectId === "food-delivery-app";
  const isHospitalSystem = projectId === "hospital-management-system";  const isBankingSystem = projectId === "banking-system";



  if (isBankingSystem) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/20.png" 
            alt="Banking System UI Mockup" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isHospitalSystem) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/21.png" 
            alt="Hospital Management System UI Mockup" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isInventorySystem) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/inventory-management-system.png" 
            alt="Inventory Management System UI Mockup" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isFoodDeliveryApp) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/22.png" 
            alt="Food Delivery App UI Mockup" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isEcommercePlatform) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/11.png" 
            alt="E-Commerce Platform UI" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isOnlineCompiler) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/14.png" 
            alt="Online Compiler UI" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isRecommendationSystem) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/19.png" 
            alt="Recommendation System UI" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isWeatherApp) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/4.png" 
            alt="Weather App UI" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isResumeAnalyzer) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/17.png" 
            alt="Resume Analyzer UI Mockup" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isImageClassification) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/18.png" 
            alt="Image Classification UI" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isSentimentAnalysis) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/16.png" 
            alt="Sentiment Analysis UI Mockup" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isLmsSystem) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/15.png" 
            alt="LMS System UI Mockup" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isVideoStreaming) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/13.png" 
            alt="Video Streaming Platform UI" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isAiChatbot) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/10.png" 
            alt="AI Chatbot UI" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isBlogWebsite) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/7.png" 
            alt="Blog Website UI" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isStopwatch) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/2.png" 
            alt="Chrono Timer Mockup" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isChatApp) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/8.png" 
            alt="Chat Application Mockup" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isPortfolioWebsite) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/3.png" 
            alt="Portfolio Website UI" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isCalculator) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/calculator-mockup.png" 
            alt="Calculator UI Mockup" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isExpenseTracker) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/5.png" 
            alt="Expense Tracker UI Mockup" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isTodoApp) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/1.png" 
            alt="To-Do App UI Mockup" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isLibrarySystem) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/9.png" 
            alt="Library Management System UI Mockup" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (isQuizApplication) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/6.png" 
            alt="Quiz Application UI Mockup" 
            className="w-full h-auto max-h-full object-contain object-center block rounded-xl drop-shadow-sm"
          />
        </div>
      </div>
    );
  }

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
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-[#00BFB3] text-white border border-transparent">
        <CheckCircle size={12} />
        Completed
      </span>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-[#00BFB3] text-white border border-transparent">
        <Clock size={12} />
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-slate-200 text-slate-500 border border-transparent">
      <CircleDashed size={12} />
      Not Started
    </span>
  );
}

function SkillPill({ skill }: { skill: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] border bg-[#00BFB3]/15 border-[#00BFB3]/30 text-[#1B2B44] font-semibold">
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
      className={`relative rounded-2xl overflow-hidden cursor-pointer border transition-shadow duration-300 bg-[#F8FAFC] shadow-lg ${expanded ? "border-slate-200" : "border-slate-200 hover:border-slate-300"}`}
    >
      <div className="absolute inset-0 pointer-events-none">
      </div>

      <div className="relative z-10 flex items-center gap-4 px-6 h-[76px]">
        <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] border border-slate-200 flex items-center justify-center flex-shrink-0 transition-all duration-300">
          <Code size={18} className="text-[#1B2B44]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold truncate transition-colors duration-300 text-[#0F172A]">
            {project.title}
          </h3>
          {!expanded && (
            <p className="text-xs text-slate-500 truncate mt-0.5 font-semibold">{project.shortDescription}</p>
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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00BFB3]/15 border border-[#00BFB3]/30 text-[#1B2B44] font-bold text-[11px]">
                    <Clock size={12} />
                    {project.estimatedDuration}
                  </span>
                  <StatusBadge status={status} />
                </div>

                <p className="text-sm leading-relaxed text-[#0F172A] font-semibold">
                  {project.shortDescription}
                </p>

                <div>
                  <p className="uppercase tracking-wider mb-2 text-[13px] text-[#1B2B44] font-bold">Skills</p>
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
                      <span className="text-[13px] text-[#1B2B44] font-bold">Progress</span>
                      <span className="text-[11px] text-[#00BFB3] font-semibold">In Progress</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#F1F5F9]/30 overflow-hidden">
                      <div className="w-2/5 h-full rounded-full bg-[#00BFB3]" />
                    </div>
                  </div>
                )}

                <Link
                  to={`/projects/${project.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B2B44] hover:bg-[#00BFB3] text-[#FFFFFF] text-sm font-bold transition-colors duration-200"
                >
                  {status === "COMPLETED" ? "Review Project" : status === "IN_PROGRESS" ? "Continue Project" : "Start Project"}
                  <ArrowRight size={15} color="#FFFFFF" />
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
  const { statuses } = useAllProjectStatuses();

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
              const getCategoryTextColor = (cat: string) => {
                switch(cat) {
                  case "Beginner Level": return "text-[#1B2B44]";
                  case "Intermediate Level": return "text-[#00BFB3]";
                  case "Advanced Level": return "text-[#1B2B44]";
                  case "AI/ML Projects": return "text-[#00BFB3]";
                  case "Industry Projects": return "text-[#1B2B44]";
                  default: return "text-slate-800";
                }
              };
              const getCategoryHoverBg = (cat: string) => {
                switch(cat) {
                  case "Beginner Level": return "hover:bg-[#1B2B44]/[0.08]";
                  case "Intermediate Level": return "hover:bg-[#00BFB3]/[0.08]";
                  case "Advanced Level": return "hover:bg-[#1B2B44]/[0.08]";
                  case "AI/ML Projects": return "hover:bg-[#00BFB3]/[0.08]";
                  case "Industry Projects": return "hover:bg-[#1B2B44]/[0.08]";
                  default: return "hover:bg-slate-100";
                }
              };
              return (
                  <button
                    key={category}
                    onClick={() => { setActiveCategory(category); setActiveProjectId(projectsData.find(p => p.category === category)?.id ?? null); }}
                    className={`flex-shrink-0 lg:w-full text-left px-5 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 bg-white border border-slate-200 ${getCategoryTextColor(category)} ${getCategoryHoverBg(category)} ${isActive ? 'ring-2 ring-[#00BFB3]' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full bg-white font-bold shadow-sm ${getCategoryTextColor(category)}`}>
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
