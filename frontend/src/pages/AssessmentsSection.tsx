import { useState, useEffect } from "react";
import { 
  Brain, MessageSquare, Code2, Monitor, Bot, ClipboardList, BarChart2,
  CheckCircle, Clock, Circle, PlayCircle, Target, TrendingUp, AlertCircle,
  Calculator, BrainCircuit, Type, FileText, Mails, FileEdit, LayoutTemplate,
  Repeat, List, FunctionSquare, Grip, Database, Server, Network,
  Users, Presentation, Handshake, ShieldCheck
} from "lucide-react";
import { useAuth } from "../auth";
import { api } from "../api";
import AssessmentPlayer from "./AssessmentPlayer";

// --- DATA DEFINITIONS ---

const TOPIC_TAGS: Record<string, string[]> = {
  "Quantitative Aptitude": ["Percentages", "Ratios", "Profit & Loss", "Speed & Distance"],
  "Logical Reasoning": ["Series", "Patterns", "Syllogisms", "Coding-Decoding"],
  "Analytical Reasoning": ["Puzzles", "Data Interpretation", "Seating Arrangement"],
  "Verbal Ability": ["Synonyms", "Antonyms", "Fill in the Blanks", "Grammar"],
  "Grammar": ["Tenses", "Articles", "Prepositions", "Sentence Correction"],
  "Vocabulary": ["Word Meanings", "Synonyms", "Usage", "Idioms"],
  "Reading Comprehension": ["Passages", "Inference", "Main Idea", "Vocabulary in Context"],
  "Email Writing": ["Subject Lines", "Tone", "Format", "Closing"],
  "Resume Writing": ["Structure", "Action Verbs", "Achievements", "Length"],
  "Flowcharts": ["Symbols", "Logic Flow", "Decision Points", "Tracing"],
  "Loops": ["for loop", "while loop", "Nested Loops", "Iteration"],
  "Arrays": ["Indexing", "Traversal", "Insertion", "Deletion"],
  "Functions": ["Definition", "Scope", "Return Values", "Parameters"],
  "Recursion": ["Base Case", "Call Stack", "Fibonacci", "Factorial"],
  "Python": ["Syntax", "Data Types", "Functions", "OOP"],
  "Java": ["OOP", "Inheritance", "Syntax", "Collections"],
  "JavaScript": ["DOM", "Closures", "Promises", "ES6"],
  "SQL": ["SELECT", "JOIN", "GROUP BY", "Subqueries"],
  "DBMS": ["Normalization", "Keys", "ER Diagrams", "Transactions"],
  "OS": ["Processes", "Scheduling", "Memory Management", "Deadlock"],
  "Computer Networks": ["OSI Model", "TCP/IP", "DNS", "HTTP"],
  "HR Questions": ["Tell Me About Yourself", "Strengths", "Weaknesses", "STAR Method"],
  "Technical Interview": ["DSA", "Time Complexity", "OOP", "System Design"],
  "Behavioral Questions": ["Conflict Resolution", "Teamwork", "Leadership", "Adaptability"],
  "Mock Interviews": ["Preparation", "Etiquette", "Body Language", "Follow-up"],
  "Full Mock": ["Aptitude", "Technical", "Verbal", "Reasoning"]
};

interface SubSection {
  name: string;
  icon: React.ElementType;
  difficulty: "Easy" | "Medium" | "Hard";
  duration: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  subsections: SubSection[];
}

const CATEGORIES: Category[] = [
  {
    id: "aptitude",
    name: "Aptitude",
    icon: Brain,
    subsections: [
      { name: "Quantitative Aptitude", icon: Calculator, difficulty: "Medium", duration: "~20 mins", description: "Test your numerical problem-solving skills." },
      { name: "Logical Reasoning", icon: BrainCircuit, difficulty: "Medium", duration: "~20 mins", description: "Evaluate your logical deduction capabilities." },
      { name: "Analytical Reasoning", icon: Target, difficulty: "Hard", duration: "~25 mins", description: "Solve complex analytical puzzles." },
      { name: "Verbal Ability", icon: Type, difficulty: "Easy", duration: "~15 mins", description: "Test your command over the English language." }
    ]
  },
  {
    id: "communication",
    name: "Communication Skills",
    icon: MessageSquare,
    subsections: [
      { name: "Grammar", icon: FileText, difficulty: "Easy", duration: "~15 mins", description: "Assess your knowledge of English grammar rules." },
      { name: "Vocabulary", icon: Type, difficulty: "Medium", duration: "~15 mins", description: "Test your vocabulary and word usage." },
      { name: "Reading Comprehension", icon: FileText, difficulty: "Medium", duration: "~25 mins", description: "Evaluate your ability to understand written passages." },
      { name: "Email Writing", icon: Mails, difficulty: "Easy", duration: "~15 mins", description: "Practice professional email formatting." },
      { name: "Resume Writing", icon: FileEdit, difficulty: "Medium", duration: "~20 mins", description: "Understand the key components of a strong resume." }
    ]
  },
  {
    id: "pseudocode",
    name: "Pseudocode & Problem Solving",
    icon: Code2,
    subsections: [
      { name: "Flowcharts", icon: LayoutTemplate, difficulty: "Easy", duration: "~15 mins", description: "Understand logical flow and visual representations." },
      { name: "Loops", icon: Repeat, difficulty: "Medium", duration: "~20 mins", description: "Master iterative control structures." },
      { name: "Arrays", icon: List, difficulty: "Medium", duration: "~20 mins", description: "Work with index-based data collections." },
      { name: "Functions", icon: FunctionSquare, difficulty: "Medium", duration: "~20 mins", description: "Understand modular programming and scope." },
      { name: "Recursion", icon: Grip, difficulty: "Hard", duration: "~25 mins", description: "Solve problems using recursive calls." }
    ]
  },
  {
    id: "technical",
    name: "Technical Assessments",
    icon: Monitor,
    subsections: [
      { name: "Python", icon: Code2, difficulty: "Medium", duration: "~30 mins", description: "Test your Python programming knowledge." },
      { name: "Java", icon: Code2, difficulty: "Hard", duration: "~30 mins", description: "Evaluate your core Java skills." },
      { name: "JavaScript", icon: Code2, difficulty: "Medium", duration: "~30 mins", description: "Assess your JavaScript proficiency." },
      { name: "SQL", icon: Database, difficulty: "Medium", duration: "~25 mins", description: "Write and analyze database queries." },
      { name: "DBMS", icon: Server, difficulty: "Hard", duration: "~25 mins", description: "Understand database management concepts." },
      { name: "OS", icon: Monitor, difficulty: "Hard", duration: "~25 mins", description: "Core concepts of Operating Systems." },
      { name: "Computer Networks", icon: Network, difficulty: "Hard", duration: "~25 mins", description: "Networking protocols and architecture." }
    ]
  },
  {
    id: "ai-interview",
    name: "AI Interview Practice",
    icon: Bot,
    subsections: [
      { name: "HR Questions", icon: Users, difficulty: "Easy", duration: "~20 mins", description: "Prepare for common HR screening questions." },
      { name: "Technical Interview", icon: Code2, difficulty: "Hard", duration: "~40 mins", description: "Practice answering technical conceptual questions." },
      { name: "Behavioral Questions", icon: Handshake, difficulty: "Medium", duration: "~25 mins", description: "Handle situational and behavioral scenarios." },
      { name: "Mock Interviews", icon: Presentation, difficulty: "Hard", duration: "~45 mins", description: "Full simulated interview practice." }
    ]
  },
  {
    id: "mock-tests",
    name: "Mock Tests",
    icon: ClipboardList,
    subsections: [
      { name: "Full Mock", icon: ShieldCheck, difficulty: "Hard", duration: "~120 mins", description: "A comprehensive full-length exam." }
    ]
  },
  {
    id: "reports",
    name: "Reports & Analytics",
    icon: BarChart2,
    subsections: [] // Handled uniquely
  }
];

export default function AssessmentsSection() {
  const { user } = useAuth();
  
  const [activeCategory, setActiveCategory] = useState<string>("Aptitude");
  const [expandedSubsection, setExpandedSubsection] = useState<string | null>(null);
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

  // When player completes, refresh progress
  if (activePlayer) {
    return (
      <AssessmentPlayer 
        category={activePlayer.category}
        subsection={activePlayer.subsection}
        onClose={() => setActivePlayer(null)}
        onComplete={() => {
          fetchProgress();
        }}
      />
    );
  }

  const currentCategoryData = CATEGORIES.find(c => c.name === activeCategory);

  return (
    <div className="w-full min-h-screen bg-[#0a0f1e] text-white p-6 pb-20 font-sans">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">
          Assessments
        </h1>
        <p className="text-white/50 text-lg">
          Practice tests, track performance, and improve your skills.
        </p>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* LEFT SIDEBAR */}
        <div className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-2">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.name;
            const CatIcon = cat.icon;
            const count = cat.name === "Reports & Analytics" ? "" : cat.subsections.length;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.name);
                  setExpandedSubsection(null);
                }}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 text-left group ${
                  isActive 
                    ? "bg-purple-500/10 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                    : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-white/50 group-hover:text-white"
                  }`}>
                    <CatIcon size={18} />
                  </div>
                  <span className={`font-semibold text-sm transition-colors ${
                    isActive ? "text-white" : "text-white/70 group-hover:text-white"
                  }`}>
                    {cat.name}
                  </span>
                </div>
                {count !== "" && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
                    isActive ? "bg-purple-500/20 text-purple-300" : "bg-white/10 text-white/50 group-hover:bg-white/20"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1">
          
          {activeCategory === "Reports & Analytics" ? (
            /* ANALYTICS DASHBOARD */
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <BarChart2 size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
                  <p className="text-white/50">Detailed insights into your assessment journey</p>
                </div>
              </div>

              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-purple-500 animate-spin"></div>
                </div>
              ) : analyticsData && analyticsData.totalAttempted > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Accuracy */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-4 text-white/60">
                      <Target size={18} className="text-blue-400" />
                      <span className="font-medium">Average Accuracy</span>
                    </div>
                    <div className="text-4xl font-bold">{analyticsData.averageScore}%</div>
                  </div>
                  {/* Time Taken */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-4 text-white/60">
                      <Clock size={18} className="text-amber-400" />
                      <span className="font-medium">Average Time Taken</span>
                    </div>
                    <div className="text-4xl font-bold">{formatTime(analyticsData.averageTimeTaken)}</div>
                  </div>
                  {/* Completed */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-4 text-white/60">
                      <CheckCircle size={18} className="text-green-400" />
                      <span className="font-medium">Topics Completed</span>
                    </div>
                    <div className="text-4xl font-bold">{analyticsData.totalCompleted} <span className="text-xl text-white/40">/ {analyticsData.totalAttempted}</span></div>
                  </div>
                  {/* Skill Performance */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-4 text-white/60">
                      <TrendingUp size={18} className="text-purple-400" />
                      <span className="font-medium">Top Category Score</span>
                    </div>
                    <div className="space-y-3 mt-2">
                      {Object.entries(analyticsData.accuracyByCategory || {}).slice(0, 2).map(([cat, score]: any, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-xs text-white/60 mb-1">
                            <span className="truncate pr-2">{cat}</span>
                            <span>{score}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full" style={{ width: `${score}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <AlertCircle size={48} className="text-white/20 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
                  <p className="text-white/50">Complete some assessments to view your analytics.</p>
                </div>
              )}
            </div>
          ) : (
            /* SUBSECTIONS LIST */
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {currentCategoryData?.subsections.map((sub) => {
                const isExpanded = expandedSubsection === sub.name;
                const status = getStatus(currentCategoryData.name, sub.name);
                const tags = TOPIC_TAGS[sub.name] || [];
                const Icon = sub.icon;

                // STATUS BADGE RENDER
                const StatusBadge = () => {
                  if (loading) return <div className="w-24 h-6 bg-white/10 rounded-full animate-pulse"></div>;
                  if (status === "completed") {
                    return (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/20 border border-green-500/30 text-green-400">
                        <CheckCircle size={14} /> Completed
                      </span>
                    );
                  }
                  if (status === "in_progress") {
                    return (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 border border-blue-500/30 text-blue-400">
                        <Clock size={14} /> In Progress
                      </span>
                    );
                  }
                  return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 border border-white/10 text-white/50">
                      <Circle size={14} /> Not Started
                    </span>
                  );
                };

                if (isExpanded) {
                  return (
                    /* EXPANDED CARD */
                    <div 
                      key={sub.name}
                      className="bg-white/10 border border-purple-400/30 rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all duration-300"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8">
                        {/* LEFT CONTENT */}
                        <div className="flex flex-col">
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white/80">
                              {sub.difficulty}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white/80">
                              {sub.duration}
                            </span>
                            <StatusBadge />
                          </div>

                          <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">
                            {sub.name}
                          </h3>
                          
                          <p className="text-white/70 leading-relaxed mb-6">
                            {sub.description}
                          </p>

                          {tags.length > 0 && (
                            <div className="mb-8">
                              <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
                                Covered Topics
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                  <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 font-medium">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-auto">
                            <button 
                              onClick={() => setActivePlayer({ category: currentCategoryData.name, subsection: sub.name })}
                              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                            >
                              <PlayCircle size={20} />
                              Start Assessment
                            </button>
                            <button 
                              onClick={() => setExpandedSubsection(null)}
                              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>

                        {/* RIGHT ILLUSTRATION */}
                        <div className="hidden md:flex items-center justify-center w-48 border-l border-white/10 pl-8">
                          <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.2)] border border-white/10">
                            <div className="absolute inset-0 rounded-full animate-spin-slow border-t-2 border-l-2 border-purple-400/30" style={{ animationDuration: '8s' }}></div>
                            <Icon size={64} className="text-purple-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  /* COMPACT CARD */
                  <div 
                    key={sub.name}
                    onClick={() => setExpandedSubsection(sub.name)}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] cursor-pointer transition-all duration-200 border-b-white/5 border-b-[3px] hover:border-b-purple-500/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 group-hover:text-white">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{sub.name}</h4>
                        <p className="text-sm text-white/50">{sub.description}</p>
                      </div>
                    </div>
                    <div>
                      <StatusBadge />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
