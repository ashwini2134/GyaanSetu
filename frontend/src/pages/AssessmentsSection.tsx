import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, MessageSquare, Code2, Monitor, Bot, ClipboardList, BarChart2,
  CheckCircle, Clock, CircleDashed, PlayCircle, Target, TrendingUp, AlertCircle,
  Calculator, Lightbulb, PieChart, BookOpen, Pencil, BookMarked, FileText, Mail, FileUser,
  GitBranch, RefreshCw, List, FunctionSquare, RotateCcw,
  Terminal, Coffee, Braces, Database, Server, Cpu, Network,
  Users, Code, Heart, Video, Trophy, ArrowRight
} from "lucide-react";
import { useAuth } from "../auth";
import { api } from "../api";
import AssessmentPlayer from "./AssessmentPlayer";

// --- DATA DEFINITIONS ---

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Aptitude": Brain,
  "Communication Skills": MessageSquare,
  "Pseudocode & Problem Solving": Code2,
  "Technical Assessments": Monitor,
  "AI Interview Practice": Bot,
  "Mock Tests": ClipboardList,
  "Reports & Analytics": BarChart2
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  "Aptitude": "from-purple-500/10 via-pink-500/5 to-transparent",
  "Communication Skills": "from-blue-500/10 via-cyan-500/5 to-transparent",
  "Pseudocode & Problem Solving": "from-orange-500/10 via-yellow-500/5 to-transparent",
  "Technical Assessments": "from-green-500/10 via-teal-500/5 to-transparent",
  "AI Interview Practice": "from-red-500/10 via-orange-500/5 to-transparent",
  "Mock Tests": "from-indigo-500/10 via-purple-500/5 to-transparent",
  "Reports & Analytics": "from-teal-500/10 via-cyan-500/5 to-transparent"
};

const CARD_GRADIENTS: Record<string, string> = {
  "Aptitude": "from-purple-600/12 via-pink-600/5 to-slate-900",
  "Communication Skills": "from-blue-600/12 via-cyan-600/5 to-slate-900",
  "Pseudocode & Problem Solving": "from-orange-600/12 via-yellow-600/5 to-slate-900",
  "Technical Assessments": "from-green-600/12 via-teal-600/5 to-slate-900",
  "AI Interview Practice": "from-red-600/12 via-orange-600/5 to-slate-900",
  "Mock Tests": "from-indigo-600/12 via-purple-600/5 to-slate-900"
};

const BORDER_GRADIENTS: Record<string, string> = {
  "Aptitude": "from-purple-500 to-pink-500",
  "Communication Skills": "from-blue-500 to-cyan-500",
  "Pseudocode & Problem Solving": "from-orange-500 to-yellow-500",
  "Technical Assessments": "from-green-500 to-teal-500",
  "AI Interview Practice": "from-red-500 to-orange-500",
  "Mock Tests": "from-indigo-500 to-purple-500"
};

const TOPIC_TAGS: Record<string, string[]> = {
  "Quantitative Aptitude": ["Percentages", "Ratios", "Profit & Loss", "Speed & Distance"],
  "Logical Reasoning": ["Series", "Patterns", "Syllogisms", "Coding-Decoding"],
  "Analytical Reasoning": ["Puzzles", "Data Interpretation", "Seating Arrangement"],
  "Verbal Ability": ["Synonyms", "Antonyms", "Fill in the Blanks"],
  "Grammar": ["Tenses", "Articles", "Prepositions", "Sentence Correction"],
  "Vocabulary": ["Word Meanings", "Synonyms", "Usage", "Idioms"],
  "Reading Comprehension": ["Passages", "Inference", "Main Idea"],
  "Email Writing": ["Subject Lines", "Tone", "Format", "Closing"],
  "Resume Writing": ["Structure", "Action Verbs", "Achievements"],
  "Flowcharts": ["Symbols", "Logic Flow", "Decision Points"],
  "Loops": ["for loop", "while loop", "Nested Loops"],
  "Arrays": ["Indexing", "Traversal", "Insertion", "Deletion"],
  "Functions": ["Definition", "Scope", "Return Values"],
  "Recursion": ["Base Case", "Call Stack", "Fibonacci"],
  "Python": ["Syntax", "Data Types", "Functions", "OOP"],
  "Java": ["OOP", "Inheritance", "Syntax", "Collections"],
  "JavaScript": ["DOM", "Closures", "Promises", "ES6"],
  "SQL": ["SELECT", "JOIN", "GROUP BY", "Subqueries"],
  "DBMS": ["Normalization", "Keys", "ER Diagrams"],
  "OS": ["Processes", "Scheduling", "Memory Management"],
  "Computer Networks": ["OSI Model", "TCP/IP", "DNS"],
  "HR Questions": ["Tell Me About Yourself", "STAR Method", "Strengths"],
  "Technical Interview": ["DSA", "Time Complexity", "OOP"],
  "Behavioral Questions": ["Conflict Resolution", "Teamwork", "Leadership"],
  "Mock Interviews": ["Preparation", "Etiquette", "Body Language"],
  "Full Mock": ["Aptitude", "Technical", "Verbal", "Reasoning"]
};

interface SubSection {
  name: string;
  icon: React.ElementType;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  duration: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  subsections: SubSection[];
}

const CATEGORIES: Category[] = [
  {
    id: "aptitude",
    name: "Aptitude",
    subsections: [
      { name: "Quantitative Aptitude", icon: Calculator, difficulty: "Intermediate", duration: "~20 mins", description: "Test your numerical problem-solving skills." },
      { name: "Logical Reasoning", icon: Lightbulb, difficulty: "Intermediate", duration: "~20 mins", description: "Evaluate your logical deduction capabilities." },
      { name: "Analytical Reasoning", icon: PieChart, difficulty: "Advanced", duration: "~25 mins", description: "Solve complex analytical puzzles." },
      { name: "Verbal Ability", icon: BookOpen, difficulty: "Beginner", duration: "~15 mins", description: "Test your command over the English language." }
    ]
  },
  {
    id: "communication",
    name: "Communication Skills",
    subsections: [
      { name: "Grammar", icon: Pencil, difficulty: "Beginner", duration: "~15 mins", description: "Assess your knowledge of English grammar rules." },
      { name: "Vocabulary", icon: BookMarked, difficulty: "Intermediate", duration: "~15 mins", description: "Test your vocabulary and word usage." },
      { name: "Reading Comprehension", icon: FileText, difficulty: "Intermediate", duration: "~25 mins", description: "Evaluate your ability to understand written passages." },
      { name: "Email Writing", icon: Mail, difficulty: "Beginner", duration: "~15 mins", description: "Practice professional email formatting." },
      { name: "Resume Writing", icon: FileUser, difficulty: "Intermediate", duration: "~20 mins", description: "Understand the key components of a strong resume." }
    ]
  },
  {
    id: "pseudocode",
    name: "Pseudocode & Problem Solving",
    subsections: [
      { name: "Flowcharts", icon: GitBranch, difficulty: "Beginner", duration: "~15 mins", description: "Understand logical flow and visual representations." },
      { name: "Loops", icon: RefreshCw, difficulty: "Intermediate", duration: "~20 mins", description: "Master iterative control structures." },
      { name: "Arrays", icon: List, difficulty: "Intermediate", duration: "~20 mins", description: "Work with index-based data collections." },
      { name: "Functions", icon: FunctionSquare, difficulty: "Intermediate", duration: "~20 mins", description: "Understand modular programming and scope." },
      { name: "Recursion", icon: RotateCcw, difficulty: "Advanced", duration: "~25 mins", description: "Solve problems using recursive calls." }
    ]
  },
  {
    id: "technical",
    name: "Technical Assessments",
    subsections: [
      { name: "Python", icon: Terminal, difficulty: "Intermediate", duration: "~30 mins", description: "Test your Python programming knowledge." },
      { name: "Java", icon: Coffee, difficulty: "Advanced", duration: "~30 mins", description: "Evaluate your core Java skills." },
      { name: "JavaScript", icon: Braces, difficulty: "Intermediate", duration: "~30 mins", description: "Assess your JavaScript proficiency." },
      { name: "SQL", icon: Database, difficulty: "Intermediate", duration: "~25 mins", description: "Write and analyze database queries." },
      { name: "DBMS", icon: Server, difficulty: "Advanced", duration: "~25 mins", description: "Understand database management concepts." },
      { name: "OS", icon: Cpu, difficulty: "Advanced", duration: "~25 mins", description: "Core concepts of Operating Systems." },
      { name: "Computer Networks", icon: Network, difficulty: "Advanced", duration: "~25 mins", description: "Networking protocols and architecture." }
    ]
  },
  {
    id: "ai-interview",
    name: "AI Interview Practice",
    subsections: [
      { name: "HR Questions", icon: Users, difficulty: "Beginner", duration: "~20 mins", description: "Prepare for common HR screening questions." },
      { name: "Technical Interview", icon: Code, difficulty: "Advanced", duration: "~40 mins", description: "Practice answering technical conceptual questions." },
      { name: "Behavioral Questions", icon: Heart, difficulty: "Intermediate", duration: "~25 mins", description: "Handle situational and behavioral scenarios." },
      { name: "Mock Interviews", icon: Video, difficulty: "Expert", duration: "~45 mins", description: "Full simulated interview practice." }
    ]
  },
  {
    id: "mock-tests",
    name: "Mock Tests",
    subsections: [
      { name: "Full Mock", icon: Trophy, difficulty: "Expert", duration: "~120 mins", description: "A comprehensive full-length exam." }
    ]
  },
  {
    id: "reports",
    name: "Reports & Analytics",
    subsections: [] 
  }
];

// --- COMPONENTS ---

function StatusBadge({ status, loading }: { status: string, loading: boolean }) {
  if (loading) {
    return (
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }} 
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-24 h-6 bg-white/10 rounded-full"
      />
    );
  }
  if (status === "completed") {
    return (
      <motion.span 
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-teal-500/30 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.15)]"
      >
        <CheckCircle size={12} /> Completed
      </motion.span>
    );
  }
  if (status === "in_progress") {
    return (
      <motion.span 
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
      >
        <Clock size={12} /> In Progress
      </motion.span>
    );
  }
  return (
    <motion.span 
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-slate-800/60 border border-slate-700/40 text-slate-400"
    >
      <CircleDashed size={12} /> Not Started
    </motion.span>
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
  sub: SubSection;
  category: string;
  isExpanded: boolean;
  status: string;
  loading: boolean;
  onHover: () => void;
  onStart: () => void;
}

function CarouselCard({ sub, category, isExpanded, status, loading, onHover, onStart }: CarouselCardProps) {
  const Icon = sub.icon;
  const tags = TOPIC_TAGS[sub.name] || [];
  const spotRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!spotRef.current) return;
    const rect = spotRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    spotRef.current.style.setProperty("--mx", `${x}%`);
    spotRef.current.style.setProperty("--my", `${y}%`);
  }, []);

  const baseGradientColor = category === "Communication Skills" ? "rgba(6,182,212,0.15)" 
    : category === "Aptitude" ? "rgba(168,85,247,0.15)"
    : "rgba(59,130,246,0.15)";

  const borderGradientClass = BORDER_GRADIENTS[category] || "from-blue-500 to-cyan-500";
  const bgGradientClass = CARD_GRADIENTS[category] || "from-blue-600/25 via-cyan-600/10 to-slate-900";

  return (
    <motion.div
      layout
      onMouseEnter={onHover}
      onMouseMove={handleMouseMove}
      animate={{ height: isExpanded ? "auto" : 76 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className={`relative rounded-2xl overflow-hidden cursor-pointer border transition-shadow duration-300 ${
        isExpanded
          ? `border-transparent bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl shadow-[0_0_40px_-8px_${baseGradientColor}]`
          : "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/[0.08] backdrop-blur-md"
      }`}
    >
      {/* Animated glowing border effect for expanded state */}
      {isExpanded && (
        <div className={`absolute inset-0 p-[1px] bg-gradient-to-br ${borderGradientClass} rounded-2xl pointer-events-none opacity-50`} style={{ mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", WebkitMaskComposite: "destination-out" }} />
      )}

      {isExpanded && (
        <div className={`absolute inset-0 opacity-30 bg-gradient-to-br ${bgGradientClass} transition-opacity duration-500 pointer-events-none`} />
      )}

      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          ref={spotRef}
          className={`absolute inset-0 bg-[radial-gradient(600px_circle_at_var(--mx,50%)_var(--my,50%),${baseGradientColor}_0%,transparent_60%)] transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${isExpanded ? 'opacity-100' : ''}`}
        />
      </div>

      <div className="relative z-10 flex items-center gap-4 px-6 h-[76px]">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isExpanded ? borderGradientClass : "from-slate-700/50 to-slate-800/50"} flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isExpanded ? "opacity-20" : ""}`}>
          <Icon size={18} className={isExpanded ? "text-white" : "text-slate-400"} />
        </div>
        
        {isExpanded && (
          <div className="absolute left-6 w-10 h-10 flex items-center justify-center pointer-events-none">
            <Icon size={18} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-semibold truncate transition-colors duration-300 ${isExpanded ? "text-white opacity-0" : "text-slate-200"}`}>
            {sub.name}
          </h3>
          {!isExpanded && (
            <p className="text-xs text-slate-500 truncate mt-0.5">{sub.description}</p>
          )}
        </div>
        
        {!isExpanded && (
          <div className="flex-shrink-0">
            <StatusBadge status={status} loading={loading} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative z-10 px-6 pb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <DifficultyBadge difficulty={sub.difficulty} />
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={13} />
                    {sub.duration}
                  </span>
                  <StatusBadge status={status} loading={loading} />
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight mt-1 mb-2">
                  {sub.name}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {sub.description}
                </p>

                {tags.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Topics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(t => (
                        <SkillPill key={t} skill={t} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); onStart(); }}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r ${borderGradientClass} text-white font-bold transition-all duration-300 hover:shadow-lg`}
                  >
                    {status === "completed" ? "Review Assessment" : status === "in_progress" ? "Continue Assessment" : "Start Assessment"}
                    <PlayCircle size={18} />
                  </motion.button>
                </div>
              </div>

              <div className="hidden md:flex items-center justify-center w-48 border-l border-white/5 pl-8">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${bgGradientClass} flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white/10`}
                >
                  <Icon size={64} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] opacity-80" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- MAIN COMPONENT ---

export default function AssessmentsSection() {
  const { user } = useAuth();
  
  const [activeCategory, setActiveCategory] = useState<string>("Aptitude");
  const firstSubName = CATEGORIES.find(c => c.name === "Aptitude")?.subsections[0]?.name ?? null;
  const [expandedSubsection, setExpandedSubsection] = useState<string | null>(firstSubName);
  const [activePlayer, setActivePlayer] = useState<{category: string, subsection: string} | null>(null);

  const [statusData, setStatusData] = useState<Record<string, Record<string, string>>>({});
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    if (!user) return;
    try {
      const [statRes, analyticsRes] = await Promise.all([
        api.client.get(`/api/assessments/subsection-status/${user.id}`),
        api.client.get(`/api/assessments/analytics/${user.id}`)
      ]);
      setStatusData(statRes.data);
      setAnalyticsData(analyticsRes.data);
    } catch (err) {
      console.error("Failed to fetch assessment progress", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [user]);

  const getStatus = (categoryName: string, subsectionName: string) => {
    if (!statusData[categoryName]) return "not_started";
    return statusData[categoryName][subsectionName] || "not_started";
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "0m 0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
  };

  if (activePlayer) {
    return (
      <AssessmentPlayer 
        category={activePlayer.category}
        subsection={activePlayer.subsection}
        onClose={() => setActivePlayer(null)}
        onComplete={() => fetchProgress()}
      />
    );
  }

  const currentCategoryData = CATEGORIES.find(c => c.name === activeCategory);
  const filteredSubsections = currentCategoryData?.subsections || [];

  return (
    <div className="relative w-full min-h-screen bg-[#0f172a] text-white p-6 pb-20 font-sans overflow-hidden">
      
      {/* Subtle animated aurora background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", delay: 2 }}
          className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-cyan-600/20 blur-[120px] rounded-full" 
        />
      </div>

      {/* HEADER */}
      <div className="relative z-10 max-w-6xl mx-auto mb-10 px-4 md:px-6 py-6 md:py-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Target size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Assessments</h1>
            <p className="text-sm text-slate-400 mt-1">Practice tests, track performance, and improve your skills</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT SIDEBAR */}
        <div className="w-full lg:w-64 flex-shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
          {CATEGORIES.map((cat, i) => {
            const isActive = activeCategory === cat.name;
            const CatIcon = CATEGORY_ICONS[cat.name] || Brain;
            const count = cat.name === "Reports & Analytics" ? "" : cat.subsections.length;

            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveCategory(cat.name);
                  setExpandedSubsection(cat.subsections[0]?.name ?? null);
                }}
                className={`flex-shrink-0 lg:w-full text-left px-5 py-3 rounded-xl text-sm font-semibold transition-colors duration-300 border ${
                  isActive
                    ? "bg-white/10 text-white border-purple-400/50 shadow-[0_4px_20px_rgba(168,85,247,0.15)] backdrop-blur-md"
                    : "bg-[#0f172a]/50 backdrop-blur-md text-slate-400 border-white/10 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CatIcon size={16} className={isActive ? "text-purple-400" : "text-slate-500"} />
                    <span>{cat.name}</span>
                  </div>
                  {count !== "" && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${isActive ? "bg-purple-500/20 text-purple-300" : "bg-white/10 text-slate-500"}`}>
                      {count}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 w-full space-y-3" onMouseLeave={() => setExpandedSubsection(null)}>
          <AnimatePresence mode="wait">
            {activeCategory === "Reports & Analytics" ? (
              /* ANALYTICS DASHBOARD */
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 md:p-8"
              >
                <div className="flex items-center gap-4 mb-8 border-b border-slate-700/50 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                    <BarChart2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
                    <p className="text-slate-400 text-sm">Detailed insights into your assessment journey</p>
                  </div>
                </div>

                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-purple-500 animate-spin"></div>
                  </div>
                ) : analyticsData && analyticsData.totalAttempted > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stat Cards */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                      <div className="flex items-center gap-3 mb-4 text-slate-400">
                        <Target size={18} className="text-blue-400" />
                        <span className="font-medium text-sm uppercase tracking-wider">Average Accuracy</span>
                      </div>
                      <div className="text-4xl font-bold text-white">{analyticsData.averageScore}%</div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                      <div className="flex items-center gap-3 mb-4 text-slate-400">
                        <Clock size={18} className="text-amber-400" />
                        <span className="font-medium text-sm uppercase tracking-wider">Average Time</span>
                      </div>
                      <div className="text-4xl font-bold text-white">{formatTime(analyticsData.averageTimeTaken)}</div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                      <div className="flex items-center gap-3 mb-4 text-slate-400">
                        <CheckCircle size={18} className="text-green-400" />
                        <span className="font-medium text-sm uppercase tracking-wider">Topics Completed</span>
                      </div>
                      <div className="text-4xl font-bold text-white">{analyticsData.totalCompleted} <span className="text-xl text-slate-500">/ {analyticsData.totalAttempted}</span></div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                      <div className="flex items-center gap-3 mb-4 text-slate-400">
                        <TrendingUp size={18} className="text-purple-400" />
                        <span className="font-medium text-sm uppercase tracking-wider">Top Skills</span>
                      </div>
                      <div className="space-y-3 mt-2">
                        {Object.entries(analyticsData.accuracyByCategory || {}).slice(0, 2).map(([cat, score]: any, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between text-xs text-slate-300 mb-1">
                              <span className="truncate pr-2">{cat}</span>
                              <span>{score}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <AlertCircle size={48} className="text-slate-600 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
                    <p className="text-slate-400">Complete some assessments to view your analytics.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              /* SUBSECTIONS LIST */
              <motion.div 
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                {filteredSubsections.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-slate-500 text-sm">No assessments in this category yet.</p>
                  </div>
                )}
                
                {filteredSubsections.map((sub, index) => (
                  <motion.div
                    key={sub.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <CarouselCard
                      sub={sub}
                      category={activeCategory}
                      isExpanded={expandedSubsection === sub.name}
                      status={getStatus(activeCategory, sub.name)}
                      loading={loading}
                      onHover={() => setExpandedSubsection(sub.name)}
                      onStart={() => setActivePlayer({ category: activeCategory, subsection: sub.name })}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
