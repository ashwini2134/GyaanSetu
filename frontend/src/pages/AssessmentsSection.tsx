import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authFetch } from "../authClient";
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
  "Aptitude": "from-[#007DAF]/10 via-[#0F9FB6]/5 to-transparent",
  "Communication Skills": "from-[#0F9FB6]/10 via-[#79C8C2]/5 to-transparent",
  "Pseudocode & Problem Solving": "from-[#79C8C2]/10 via-[#006491]/5 to-transparent",
  "Technical Assessments": "from-[#006491]/10 via-[#007DAF]/5 to-transparent",
  "AI Interview Practice": "from-[#007DAF]/10 via-[#79C8C2]/5 to-transparent",
  "Mock Tests": "from-[#0F9FB6]/10 via-[#006491]/5 to-transparent",
  "Reports & Analytics": "from-[#79C8C2]/10 via-[#0F9FB6]/5 to-transparent"
};

const CARD_GRADIENTS: Record<string, string> = {
  "Aptitude": "from-[#007DAF]/12 via-[#0F9FB6]/5 to-slate-900",
  "Communication Skills": "from-[#0F9FB6]/12 via-[#79C8C2]/5 to-slate-900",
  "Pseudocode & Problem Solving": "from-[#79C8C2]/12 via-[#006491]/5 to-slate-900",
  "Technical Assessments": "from-[#006491]/12 via-[#007DAF]/5 to-slate-900",
  "AI Interview Practice": "from-[#007DAF]/12 via-[#79C8C2]/5 to-slate-900",
  "Mock Tests": "from-[#0F9FB6]/12 via-[#006491]/5 to-slate-900"
};

const BORDER_GRADIENTS: Record<string, string> = {
  "Aptitude": "from-[#007DAF] to-[#0F9FB6]",
  "Communication Skills": "from-[#0F9FB6] to-[#79C8C2]",
  "Pseudocode & Problem Solving": "from-[#79C8C2] to-[#006491]",
  "Technical Assessments": "from-[#006491] to-[#007DAF]",
  "AI Interview Practice": "from-[#007DAF] to-[#79C8C2]",
  "Mock Tests": "from-[#0F9FB6] to-[#006491]"
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

const LEGACY_METADATA: Record<string, any> = {
  "Quantitative Aptitude": { icon: Calculator, difficulty: "Intermediate", duration: "~20 mins", description: "Test your numerical problem-solving skills." },
  "Logical Reasoning": { icon: Lightbulb, difficulty: "Intermediate", duration: "~20 mins", description: "Evaluate your logical deduction capabilities." },
  "Analytical Reasoning": { icon: PieChart, difficulty: "Advanced", duration: "~25 mins", description: "Solve complex analytical puzzles." },
  "Verbal Ability": { icon: BookOpen, difficulty: "Beginner", duration: "~15 mins", description: "Test your command over the English language." },
  "Grammar": { icon: Pencil, difficulty: "Beginner", duration: "~15 mins", description: "Assess your knowledge of English grammar rules." },
  "Vocabulary": { icon: BookMarked, difficulty: "Intermediate", duration: "~15 mins", description: "Test your vocabulary and word usage." },
  "Reading Comprehension": { icon: FileText, difficulty: "Intermediate", duration: "~25 mins", description: "Evaluate your ability to understand written passages." },
  "Email Writing": { icon: Mail, difficulty: "Beginner", duration: "~15 mins", description: "Practice professional email formatting." },
  "Resume Writing": { icon: FileUser, difficulty: "Intermediate", duration: "~20 mins", description: "Understand the key components of a strong resume." },
  "Flowcharts": { icon: GitBranch, difficulty: "Beginner", duration: "~15 mins", description: "Understand logical flow and visual representations." },
  "Loops": { icon: RefreshCw, difficulty: "Intermediate", duration: "~20 mins", description: "Master iterative control structures." },
  "Arrays": { icon: List, difficulty: "Intermediate", duration: "~20 mins", description: "Work with index-based data collections." },
  "Functions": { icon: FunctionSquare, difficulty: "Intermediate", duration: "~20 mins", description: "Understand modular programming and scope." },
  "Recursion": { icon: RotateCcw, difficulty: "Advanced", duration: "~25 mins", description: "Solve problems using recursive calls." },
  "Python": { icon: Terminal, difficulty: "Intermediate", duration: "~30 mins", description: "Test your Python programming knowledge." },
  "Java": { icon: Coffee, difficulty: "Advanced", duration: "~30 mins", description: "Evaluate your core Java skills." },
  "JavaScript": { icon: Braces, difficulty: "Intermediate", duration: "~30 mins", description: "Assess your JavaScript proficiency." },
  "SQL": { icon: Database, difficulty: "Intermediate", duration: "~25 mins", description: "Write and analyze database queries." },
  "DBMS": { icon: Server, difficulty: "Advanced", duration: "~25 mins", description: "Understand database management concepts." },
  "OS": { icon: Cpu, difficulty: "Advanced", duration: "~25 mins", description: "Core concepts of Operating Systems." },
  "Computer Networks": { icon: Network, difficulty: "Advanced", duration: "~25 mins", description: "Networking protocols and architecture." },
  "HR Questions": { icon: Users, difficulty: "Beginner", duration: "~20 mins", description: "Prepare for common HR screening questions." },
  "Technical Interview": { icon: Code, difficulty: "Advanced", duration: "~40 mins", description: "Practice answering technical conceptual questions." },
  "Behavioral Questions": { icon: Heart, difficulty: "Intermediate", duration: "~25 mins", description: "Handle situational and behavioral scenarios." },
  "Mock Interviews": { icon: Video, difficulty: "Expert", duration: "~45 mins", description: "Full simulated interview practice." },
  "Full Mock": { icon: Trophy, difficulty: "Expert", duration: "~120 mins", description: "A comprehensive full-length exam." }
};

// --- COMPONENTS ---

function StatusBadge({ status, loading }: { status: string, loading: boolean }) {
  if (loading) {
    return (
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }} 
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-24 h-6 bg-slate-200 rounded-full"
      />
    );
  }
  if (status === "completed") {
    return (
      <motion.span 
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-[#00BFB3] text-white border border-transparent"
      >
        <CheckCircle size={12} /> Completed
      </motion.span>
    );
  }
  if (status === "in_progress") {
    return (
      <motion.span 
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-[#00BFB3] text-white border border-transparent"
      >
        <Clock size={12} /> In Progress
      </motion.span>
    );
  }
  return (
    <motion.span 
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-slate-200 text-slate-500 border border-transparent"
    >
      <CircleDashed size={12} /> Not Started
    </motion.span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border bg-[#00BFB3] text-white border-transparent">
      {difficulty}
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
    : category === "Aptitude" ? "rgba(15,159,182,0.15)"
    : "rgba(59,130,246,0.15)";

  const borderGradientClass = BORDER_GRADIENTS[category] || "from-blue-500 to[#007DAF]";
  const bgGradientClass = CARD_GRADIENTS[category] || "from-blue-600/25 via[#007DAF]/10 to-slate-900";

  return (
    <motion.div
      layout
      onMouseEnter={onHover}
      onMouseMove={handleMouseMove}
      animate={{ height: isExpanded ? "auto" : 76 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className={`relative rounded-2xl overflow-hidden cursor-pointer border transition-shadow duration-300 bg-[#F8FAFC] shadow-lg ${isExpanded ? "border-slate-200" : "border-slate-200 hover:border-slate-300"}`}
    >
      <div className="absolute inset-0 pointer-events-none z-0">
      </div>

      <div className="relative z-10 flex items-center gap-4 px-6 h-[76px]">
        <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] border border-slate-200 flex items-center justify-center flex-shrink-0 transition-all duration-300">
          <Icon size={18} className="text-[#1B2B44]" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold truncate transition-colors duration-300 text-[#0F172A]">
            {sub.name}
          </h3>
          {!isExpanded && (
            <p className="text-xs text-slate-500 truncate mt-0.5 font-semibold">{sub.description}</p>
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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00BFB3]/15 border border-[#00BFB3]/30 text-[#1B2B44] font-bold text-[11px]">
                    <Clock size={13} />
                    {sub.duration}
                  </span>
                  <StatusBadge status={status} loading={loading} />
                </div>

                <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight mt-1 mb-2">
                  {sub.name}
                </h3>

                <p className="text-sm text-[#0F172A] font-semibold leading-relaxed mb-4">
                  {sub.description}
                </p>

                {tags.length > 0 && (
                  <div>
                    <p className="uppercase tracking-wider mb-2 text-[13px] text-[#1B2B44] font-bold">Topics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(t => (
                        <SkillPill key={t} skill={t} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); onStart(); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B2B44] hover:bg-[#00BFB3] text-[#FFFFFF] text-sm font-bold transition-colors duration-200"
                  >
                    {status === "completed" ? "Review Assessment" : status === "in_progress" ? "Continue Assessment" : "Start Assessment"}
                    <PlayCircle size={18} />
                  </motion.button>
                </div>
              </div>

              <div className="hidden md:flex items-center justify-center w-48 border-l border-slate-200 pl-8">
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
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("Aptitude");
  const [expandedSubsection, setExpandedSubsection] = useState<string | null>(null);
  const [activePlayer, setActivePlayer] = useState<{category: string, subsection: string} | null>(null);

  const [statusData, setStatusData] = useState<Record<string, Record<string, string>>>({});
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    if (!user) return;
    try {
      const [statRes, analyticsRes, catRes] = await Promise.all([
        authFetch<any>(`/assessments/subsection-status/${user.id}`),
        authFetch<any>(`/assessments/analytics/${user.id}`),
        authFetch<any>(`/assessments/categories`)
      ]);
      setStatusData(statRes);
      setAnalyticsData(analyticsRes);

      const dynamicCategories = catRes.categories.map((cat: any) => ({
        ...cat,
        subsections: cat.subsections.map((sub: any) => {
          const meta = LEGACY_METADATA[sub.name];
          return {
            name: sub.name,
            icon: meta?.icon || Target,
            difficulty: meta?.difficulty || "Intermediate",
            duration: meta?.duration || "~20 mins",
            description: sub.description || meta?.description || `Assessment on ${sub.name}`
          };
        })
      }));

      // Ensure Reports & Analytics is there
      if (!dynamicCategories.find((c: any) => c.name === "Reports & Analytics")) {
        dynamicCategories.push({
          id: "reports",
          name: "Reports & Analytics",
          subsections: []
        });
      }

      // Maintain legacy category order roughly, or sort alphabetically
      // Actually, relying on the API's order is fine, but we can hardcode the specific known order if needed.
      const order = ["Aptitude", "Communication Skills", "Pseudocode & Problem Solving", "Technical Assessments", "AI Interview Practice", "Mock Tests", "Reports & Analytics"];
      dynamicCategories.sort((a: any, b: any) => {
        const idxA = order.indexOf(a.name);
        const idxB = order.indexOf(b.name);
        if (idxA === -1 && idxB === -1) return a.name.localeCompare(b.name);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });

      setCategories(dynamicCategories);
      
      setExpandedSubsection(prev => {
        if (prev) return prev;
        const apt = dynamicCategories.find((c: any) => c.name === "Aptitude");
        return apt?.subsections[0]?.name || dynamicCategories[0]?.subsections[0]?.name || null;
      });
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

  const currentCategoryData = categories.find(c => c.name === activeCategory);
  const filteredSubsections = currentCategoryData?.subsections || [];

  return (
    <div className="relative w-full min-h-screen bg-[#0f172a] text-white p-6 pb-20 font-sans overflow-hidden">
      
      {/* Subtle animated aurora background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg[#0F9FB6]/20 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", delay: 2 }}
          className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg[#007DAF]/20 blur-[120px] rounded-full" 
        />
      </div>

      {/* HEADER */}
      <div className="relative z-10 max-w-6xl mx-auto mb-10 px-4 md:px-6 py-6 md:py-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from[#0F9FB6]/20 to[#79C8C2]/20 border border[#0F9FB6]/30 flex items-center justify-center text[#0F9FB6] shadow-[0_0_15px_rgba(15,159,182,0.2)]">
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
          {categories.map((cat, i) => {
            const isActive = activeCategory === cat.name;
            const CatIcon = CATEGORY_ICONS[cat.name] || Brain;
            const count = cat.name === "Reports & Analytics" ? "" : cat.subsections.length;

            const getCategoryTextColor = (categoryName: string) => {
              switch(categoryName) {
                case "Aptitude": return "text-[#1B2B44]";
                case "Communication Skills": return "text-[#00BFB3]";
                case "Pseudocode & Problem Solving": return "text-[#1B2B44]";
                case "Technical Assessments": return "text-[#00BFB3]";
                case "AI Interview Practice": return "text-[#1B2B44]";
                case "Mock Tests": return "text-[#00BFB3]";
                case "Reports & Analytics": return "text-[#1B2B44]";
                default: return "text-slate-500";
              }
            };
            
            const getCategoryHoverBg = (categoryName: string) => {
              switch(categoryName) {
                case "Aptitude": return "hover:bg-[#1B2B44]/[0.08]";
                case "Communication Skills": return "hover:bg-[#00BFB3]/[0.08]";
                case "Pseudocode & Problem Solving": return "hover:bg-[#1B2B44]/[0.08]";
                case "Technical Assessments": return "hover:bg-[#00BFB3]/[0.08]";
                case "AI Interview Practice": return "hover:bg-[#1B2B44]/[0.08]";
                case "Mock Tests": return "hover:bg-[#00BFB3]/[0.08]";
                case "Reports & Analytics": return "hover:bg-[#1B2B44]/[0.08]";
                default: return "hover:bg-slate-100";
              }
            };

            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => {
                  setActiveCategory(cat.name);
                  setExpandedSubsection(cat.subsections[0]?.name ?? null);
                }}
                className={`flex-shrink-0 lg:w-full text-left px-5 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 bg-white border border-slate-200 ${getCategoryTextColor(cat.name)} ${getCategoryHoverBg(cat.name)} ${isActive ? 'ring-2 ring-[#00BFB3]' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CatIcon size={16} className={getCategoryTextColor(cat.name)} />
                    <span>{cat.name}</span>
                  </div>
                  {count !== "" && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full bg-white font-bold shadow-sm ${getCategoryTextColor(cat.name)}`}>
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to[#007DAF]/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                    <BarChart2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
                    <p className="text-slate-400 text-sm">Detailed insights into your assessment journey</p>
                  </div>
                </div>

                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#0F9FB6] animate-spin"></div>
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
                        <TrendingUp size={18} className="text[#0F9FB6]" />
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
                                className="h-full bg-gradient-to-r from[#0F9FB6] to[#007DAF] rounded-full" 
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
