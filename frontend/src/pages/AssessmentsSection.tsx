import { useState, useEffect } from "react";
import { 
  Brain, MessageSquare, Code2, Monitor, Bot, ClipboardList, BarChart2,
  ChevronRight, ArrowLeft, CheckCircle, Clock, Circle, PlayCircle, Target, TrendingUp, AlertCircle
} from "lucide-react";
import { useAuth } from "../auth";
import { api } from "../api";
import AssessmentPlayer from "./AssessmentPlayer";

type CategoryName = 
  | "Aptitude" 
  | "Communication Skills" 
  | "Pseudocode & Problem Solving" 
  | "Technical Assessments" 
  | "AI Interview Practice" 
  | "Mock Tests" 
  | "Reports & Analytics";

interface SubSection {
  name: string;
}

interface Category {
  id: string;
  name: CategoryName;
  gradient: string;
  icon: React.ElementType;
  subsections: SubSection[];
}

const CATEGORIES: Category[] = [
  {
    id: "aptitude",
    name: "Aptitude",
    gradient: "from-purple-500 to-pink-500",
    icon: Brain,
    subsections: [
      { name: "Quantitative Aptitude" },
      { name: "Logical Reasoning" },
      { name: "Analytical Reasoning" },
      { name: "Verbal Ability" }
    ]
  },
  {
    id: "communication",
    name: "Communication Skills",
    gradient: "from-blue-500 to-cyan-500",
    icon: MessageSquare,
    subsections: [
      { name: "Grammar" },
      { name: "Vocabulary" },
      { name: "Reading Comprehension" },
      { name: "Email Writing" },
      { name: "Resume Writing" }
    ]
  },
  {
    id: "pseudocode",
    name: "Pseudocode & Problem Solving",
    gradient: "from-orange-500 to-yellow-500",
    icon: Code2,
    subsections: [
      { name: "Flowcharts" },
      { name: "Loops" },
      { name: "Arrays" },
      { name: "Functions" },
      { name: "Recursion" }
    ]
  },
  {
    id: "technical",
    name: "Technical Assessments",
    gradient: "from-green-500 to-teal-500",
    icon: Monitor,
    subsections: [
      { name: "Python" },
      { name: "Java" },
      { name: "JavaScript" },
      { name: "SQL" },
      { name: "DBMS" },
      { name: "OS" },
      { name: "Computer Networks" }
    ]
  },
  {
    id: "ai-interview",
    name: "AI Interview Practice",
    gradient: "from-red-500 to-orange-500",
    icon: Bot,
    subsections: [
      { name: "HR Questions" },
      { name: "Technical Interview" },
      { name: "Behavioral Questions" },
      { name: "Mock Interviews" }
    ]
  },
  {
    id: "mock-tests",
    name: "Mock Tests",
    gradient: "from-indigo-500 to-purple-500",
    icon: ClipboardList,
    subsections: []
  },
  {
    id: "reports",
    name: "Reports & Analytics",
    gradient: "from-teal-500 to-green-500",
    icon: BarChart2,
    subsections: []
  }
];

const TABS = ["All", ...CATEGORIES.map(c => c.name)];

export default function AssessmentsSection() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("All");
  const [expandedCategory, setExpandedCategory] = useState<Category | null>(null);
  const [activePlayer, setActivePlayer] = useState<{category: string, subsection: string} | null>(null);

  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [statusData, setStatusData] = useState<Record<string, Record<string, string>>>({});
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(true);

  const fetchProgress = async () => {
    if (!user) return;
    try {
      const [progRes, statRes, analyticsRes] = await Promise.all([
        api.client.get(`/api/assessments/progress/${user.id}`),
        api.client.get(`/api/assessments/subsection-status/${user.id}`),
        api.client.get(`/api/assessments/analytics/${user.id}`)
      ]);
      setProgressData(progRes.data);
      setStatusData(statRes.data);
      setAnalyticsData(analyticsRes.data);
    } catch (err) {
      console.error("Failed to fetch assessment progress", err);
    } finally {
      setLoadingProgress(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [user]);

  const filteredCategories = activeTab === "All" 
    ? CATEGORIES 
    : CATEGORIES.filter(c => c.name === activeTab);

  const handleExplore = (category: Category) => {
    setExpandedCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryProgress = (catName: string) => {
    return progressData[catName] || 0;
  };

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
        onComplete={() => {
          fetchProgress();
        }}
      />
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#0a0f1e] overflow-hidden selection:bg-purple-500/30 font-sans pb-20">
      
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
        @keyframes shimmer-border {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animate-aurora {
          background-size: 200% 200%;
          animation: aurora 15s ease infinite;
        }
        .animate-text-gradient {
          background-size: 200% auto;
          animation: text-gradient 4s linear infinite;
        }
        .animate-shimmer-border {
          background: linear-gradient(90deg, rgba(99,102,241,1) 0%, rgba(168,85,247,1) 50%, rgba(99,102,241,1) 100%);
          background-size: 200% auto;
          animation: shimmer-border 3s linear infinite;
        }
        .fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .skeleton-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>

      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-900/40 via-[#0a0f1e] to-blue-900/40 animate-aurora"></div>
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        
        {!expandedCategory ? (
          <>
            {/* PAGE HEADER */}
            <div className="mb-10 fade-in-up">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight animate-text-gradient bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                Assessments
              </h1>
              <p className="text-lg text-white/50 max-w-2xl mb-8">
                Track your skills, practice assessments, and monitor your growth.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                  <span className="text-white text-sm font-medium">Total Categories: <span className="font-bold">7</span></span>
                </div>
              </div>
            </div>

            {/* CATEGORY FILTER TABS */}
            <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex gap-3">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                        isActive 
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
                          : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MAIN CATEGORY CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category, index) => {
                const Icon = category.icon;
                const isMockTest = category.id === "mock-tests";
                const progressValue = getCategoryProgress(category.name);

                return (
                  <div
                    key={category.id}
                    className={`group relative flex flex-col rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all duration-300 hover:-translate-y-1.5 fade-in-up overflow-hidden`}
                    style={{ 
                      animationDelay: `${150 + index * 80}ms`,
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 10px 40px -10px var(--tw-shadow-color)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                    }}
                  >
                    {/* Inject hover shadow color based on gradient */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl border border-white/30`}></div>
                    
                    {/* Top border accent line */}
                    {isMockTest ? (
                      <div className="absolute top-0 left-0 right-0 h-1.5 animate-shimmer-border"></div>
                    ) : (
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${category.gradient}`}></div>
                    )}

                    {/* TOP SECTION */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${category.gradient} shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                          {category.name}
                        </h2>
                        <p className="text-sm text-white/50 mt-1">
                          {isMockTest ? "Timed full-length exams" : category.id === "reports" ? "Performance analytics" : `${category.subsections.length} topics`}
                        </p>
                      </div>
                    </div>

                    {/* MIDDLE SECTION - Subsections preview */}
                    <div className="flex-1 mb-6">
                      {category.subsections.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {category.subsections.slice(0, 3).map((sub, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-white/70">
                              {sub.name}
                            </span>
                          ))}
                          {category.subsections.length > 3 && (
                            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-white/40">
                              +{category.subsections.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-white/40 italic">
                          {isMockTest ? "Challenge yourself with mock exams." : "View your detailed performance."}
                        </div>
                      )}
                    </div>

                    {/* BOTTOM SECTION - Progress & Button */}
                    <div className="mt-auto">
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex-1 mr-4">
                          {loadingProgress ? (
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden skeleton-pulse"></div>
                          ) : (
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${category.gradient} rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${progressValue}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-bold text-white/50 whitespace-nowrap">
                          {loadingProgress ? "..." : `${progressValue}%`} Complete
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleExplore(category)}
                        className={`mt-4 w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white font-medium text-sm transition-all duration-300 hover:bg-gradient-to-r hover:${category.gradient.split(' ')[0]} hover:${category.gradient.split(' ')[1]} hover:border-transparent`}
                      >
                        <span>Explore</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* EXPANDED VIEW */
          <div className="fade-in-up">
            <button
              onClick={() => setExpandedCategory(null)}
              className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 hover:-translate-x-1 backdrop-blur-md"
            >
              <ArrowLeft size={16} />
              <span className="font-medium text-sm">Back to Assessments</span>
            </button>

            <div className="flex items-center gap-4 mb-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${expandedCategory.gradient} shadow-[0_0_20px_rgba(255,255,255,0.2)]`}>
                <expandedCategory.icon size={28} className="text-white" />
              </div>
              <div>
                <h1 className={`text-3xl md:text-4xl font-extrabold bg-gradient-to-r ${expandedCategory.gradient} bg-clip-text text-transparent`}>
                  {expandedCategory.name}
                </h1>
                <p className="text-white/50 mt-2">
                  {expandedCategory.id === "mock-tests" 
                    ? "Test your full knowledge with timed mock exams" 
                    : expandedCategory.id === "reports" 
                    ? "Detailed insights into your performance" 
                    : "Select a topic below to begin or continue your assessment."}
                </p>
              </div>
            </div>

            {/* MOCK TESTS SPECIAL CARD */}
            {expandedCategory.id === "mock-tests" ? (
              <div className="relative rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 animate-shimmer-border"></div>
                
                <div className="mb-8 text-center max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-white mb-3">Ready for the challenge?</h2>
                  <p className="text-white/60">Take a full-length mock test to simulate the real exam environment. Ensure you have uninterrupted time before starting.</p>
                </div>

                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Full Mock Test</h3>
                      <p className="text-sm text-white/50">Duration: 120 mins • 7 Questions (5 MCQ, 2 Coding)</p>
                    </div>
                    <button onClick={() => setActivePlayer({category: expandedCategory.name, subsection: "Full Mock"})} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                      <PlayCircle size={20} />
                      Start Test
                    </button>
                  </div>
                </div>
              </div>
            ) 
            /* REPORTS & ANALYTICS SPECIAL CARD */
            : expandedCategory.id === "reports" ? (
              analyticsData && analyticsData.totalAttempted > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                          <Target size={20} />
                        </div>
                        <h3 className="text-white/60 font-medium">Avg Accuracy</h3>
                      </div>
                      <div className="text-4xl font-bold text-white">{analyticsData.averageScore}%</div>
                    </div>
                    
                    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                          <Clock size={20} />
                        </div>
                        <h3 className="text-white/60 font-medium">Avg Time Taken</h3>
                      </div>
                      <div className="text-3xl font-bold text-white truncate" title={formatTime(analyticsData.averageTimeTaken)}>{formatTime(analyticsData.averageTimeTaken)}</div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all col-span-2">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                          <CheckCircle size={20} />
                        </div>
                        <h3 className="text-white/60 font-medium">Topics Completed</h3>
                      </div>
                      <div className="text-4xl font-bold text-white">{analyticsData.totalCompleted} <span className="text-xl text-white/40">/ {analyticsData.totalAttempted} attempted</span></div>
                    </div>
                  </div>

                  {/* Skill Performance Chart (Simplified) */}
                  <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all flex flex-col min-h-[300px]">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <BarChart2 size={20} />
                      </div>
                      <h3 className="text-white font-medium text-lg">Skill-wise Performance</h3>
                    </div>
                    <div className="flex-1 space-y-4">
                      {Object.entries(analyticsData.accuracyByCategory).map(([cat, score]: [string, any], idx) => (
                        <div key={idx} className="w-full">
                          <div className="flex justify-between text-sm text-white/70 mb-1">
                            <span>{cat}</span>
                            <span>{score}%</span>
                          </div>
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${score}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Attempts */}
                  <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all col-span-1 lg:col-span-2">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <TrendingUp size={20} />
                      </div>
                      <h3 className="text-white font-medium text-lg">Recent Activity</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-white/50 text-sm">
                            <th className="pb-3 font-medium">Topic</th>
                            <th className="pb-3 font-medium text-center">Score</th>
                            <th className="pb-3 font-medium text-center">Time</th>
                            <th className="pb-3 font-medium text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {analyticsData.recentAttempts.map((attempt: any, idx: number) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="py-4">
                                <div className="font-bold text-white">{attempt.subsection}</div>
                                <div className="text-white/40 text-xs">{attempt.category}</div>
                              </td>
                              <td className="py-4 text-center">
                                <span className={`px-2 py-1 rounded-md font-bold ${attempt.score >= 60 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                  {attempt.score}%
                                </span>
                              </td>
                              <td className="py-4 text-center text-white/70">{formatTime(attempt.timeTaken)}</td>
                              <td className="py-4 text-right text-white/50">{new Date(attempt.lastAttemptAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={40} className="text-white/40" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Assessments Taken Yet</h3>
                  <p className="text-white/50 max-w-md">Start practicing assessments to build your analytics profile. Your progress, accuracy, and skill breakdown will appear here.</p>
                </div>
              )
            ) 
            /* STANDARD SUB-SECTION LIST */
            : (
              <div className="space-y-4">
                {expandedCategory.subsections.map((sub, index) => {
                  const status = getStatus(expandedCategory.name, sub.name);
                  return (
                    <div 
                      key={index}
                      className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 hover:translate-x-1"
                    >
                      <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-colors">
                        {sub.name}
                      </h3>
                      
                      <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
                        {status === "completed" ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-teal-500/30 text-teal-300">
                            <CheckCircle size={14} />
                            Completed
                          </span>
                        ) : status === "in_progress" ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                            <Clock size={14} />
                            In Progress
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-slate-600/20 to-gray-500/20 border border-slate-500/30 text-slate-400">
                            <Circle size={14} />
                            Not Started
                          </span>
                        )}

                        <button 
                          onClick={() => setActivePlayer({category: expandedCategory.name, subsection: sub.name})}
                          className={`px-5 py-2 rounded-lg font-bold text-sm text-white transition-all duration-300 hover:scale-105 ${
                          status === "completed" 
                            ? "bg-white/10 hover:bg-white/20 border border-white/20" 
                            : `bg-gradient-to-r ${expandedCategory.gradient} shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]`
                        }`}>
                          {status === "completed" ? "Review" : status === "in_progress" ? "Continue" : "Start"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
