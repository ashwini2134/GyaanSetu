import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { getToken, authFetch } from "../authClient";
import { getProjectMetadata } from "../api";
import {
  Settings,
  BookOpen,
  Trophy,
  CheckCircle,
  Calendar,
  Code,
  Award,
  Flame,
  ArrowRight,
  Clock,
  Lock,
  Mail,
  Briefcase,
  Layers,
  Check,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";

// Types matching backend/database models
interface ProgressRecord {
  id: string;
  courseSlug: string;
  lectureId: string;
  status: string;
  completedAt: string | null;
  practiceAttempted: boolean;
  practiceCompleted: boolean;
  projectCompleted: boolean;
  projectId: string | null;
}

interface UserSummary {
  lecturesCompleted: number;
  quizzesPassed: number;
  problemsSolved: number;
  projectsCompleted: number;
  xp: number;
  streak: number;
  lectureProgress: ProgressRecord[];
}

interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  total: number;
  passed: boolean;
  createdAt: string;
}

interface TimelineItem {
  id: string;
  type: "lecture" | "project" | "quiz" | "milestone";
  title: string;
  subtitle: string;
  date: Date;
  xp?: number;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, ready, checkAuth } = useAuth();
  
  // Navigation Tabs: 'portfolio' or 'settings'
  const [activeTab, setActiveTab] = useState<"portfolio" | "settings">("portfolio");

  // Summary and Timeline Data
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings form states
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Feedback states
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [updatingSettings, setUpdatingSettings] = useState(false);

  useEffect(() => {
    if (ready && !user) {
      navigate("/login");
    }
  }, [ready, user, navigate]);

  // Sync user info into form states
  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setBio(user.bio ?? "");
    }
  }, [user]);

  // Fetch API data
  useEffect(() => {
    async function fetchData() {
      const token = getToken();
      if (!token) return;

      try {
        setLoading(true);

        // Fetch User Summary (API endpoint /api/progress/me)
        const summaryData = await authFetch<UserSummary>("/progress/me");
        setSummary(summaryData);

        // Fetch Quiz Attempts (API endpoint /api/quiz-attempts)
        try {
          const qAttempts = await authFetch<QuizAttempt[]>("/quiz-attempts");
          setQuizAttempts(qAttempts);
        } catch (err) {
          console.warn("Failed to fetch quiz attempts", err);
        }

        // Fetch Achievements (API endpoint /api/achievements)
        try {
          const achRes = await authFetch<{ achievements: string[] }>("/achievements");
          setAchievements(achRes.achievements || []);
        } catch (err) {
          console.warn("Failed to fetch achievements", err);
        }

      } catch (error) {
        console.error("Error loading profile data", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Helper: Get user's initials for the avatar
  const getInitials = (userName: string) => {
    if (!userName) return "FA";
    const parts = userName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Helper: Format Date
  const formatDate = (dateStr?: string | Date | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      day: "numeric",
    });
  };

  // Helper: Handle Settings Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError("");
    setSettingsSuccess("");

    if (!name.trim()) {
      setSettingsError("Name is required");
      return;
    }

    if (password && password !== confirmPassword) {
      setSettingsError("Passwords do not match");
      return;
    }

    if (password && password.length < 8) {
      setSettingsError("Password must be at least 8 characters");
      return;
    }

    try {
      setUpdatingSettings(true);
      const updatePayload: { name: string; bio: string; password?: string } = {
        name,
        bio,
      };

      if (password) {
        updatePayload.password = password;
      }

      await authFetch("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(updatePayload),
      });

      setSettingsSuccess("Profile updated successfully!");
      setPassword("");
      setConfirmPassword("");
      
      // Refresh user context
      await checkAuth();
    } catch (err: any) {
      setSettingsError(err.message || "Failed to update profile");
    } finally {
      setUpdatingSettings(false);
    }
  };

  // 1. Dynamic Skills Inference from coursework
  const getSkillsGained = () => {
    if (!summary?.lectureProgress) return ["Foundational Logic"];

    const skills = new Set<string>();
    summary.lectureProgress.forEach((progress) => {
      if (progress.status === "COMPLETED") {
        if (progress.courseSlug === "cs50p") {
          const num = progress.lectureId;
          if (num.includes("0")) {
            skills.add("Variables & Inputs");
            skills.add("String Formats");
          } else if (num.includes("1")) {
            skills.add("Conditional Operations");
            skills.add("Logical Comparison");
          } else if (num.includes("2")) {
            skills.add("Loops & Control Flow");
            skills.add("Data Collections");
          } else if (num.includes("3")) {
            skills.add("Exception Handling");
            skills.add("Tracebacks");
          } else if (num.includes("4")) {
            skills.add("Standard Libraries");
            skills.add("Third-party APIs");
          } else if (num.includes("6")) {
            skills.add("File Operations");
            skills.add("CSV Read/Write");
          } else if (num.includes("7")) {
            skills.add("Regex Validation");
            skills.add("Text Processing");
          } else if (num.includes("8")) {
            skills.add("Classes & Objects");
            skills.add("Object-Oriented Coding");
            skills.add("Encapsulation");
          }
        } else if (progress.courseSlug === "cs50ai") {
          skills.add("Search Algorithms");
          skills.add("Graph BFS/DFS");
        }

        if (progress.projectCompleted) {
          skills.add("Hands-on Problem Solving");
        }
      }
    });

    if (skills.size === 0) {
      skills.add("Introductory Syntax");
    }

    return Array.from(skills);
  };

  const skillsGained = getSkillsGained();

  // 2. Completed Capstone Projects list
  const getCompletedProjects = () => {
    if (!summary?.lectureProgress) return [];
    
    return summary.lectureProgress
      .filter((p) => p.projectCompleted && p.projectId)
      .map((p) => {
        const metadata = getProjectMetadata(p.projectId || "");
        return {
          id: p.projectId!,
          courseSlug: p.courseSlug,
          completedAt: p.completedAt,
          metadata,
        };
      });
  };

  const completedProjects = getCompletedProjects();

  // 3. Certificates Earned
  const getEarnedCertificates = () => {
    if (!summary?.lectureProgress) return [];
    
    // Group progress by course slug
    const courseStats: Record<string, { total: number; completed: number; lastDate: Date }> = {};
    
    // Total lectures checklist in standard courses
    // In our LMS, cs50p has lectures 0-9 (some might not have quizzes or projects, let's look at counts)
    const expectedLectures: Record<string, number> = {
      cs50p: 9,
      cs50ai: 7,
    };

    summary.lectureProgress.forEach((p) => {
      if (!courseStats[p.courseSlug]) {
        courseStats[p.courseSlug] = { total: expectedLectures[p.courseSlug] || 5, completed: 0, lastDate: new Date(0) };
      }
      if (p.status === "COMPLETED") {
        courseStats[p.courseSlug].completed += 1;
        if (p.completedAt) {
          const compDate = new Date(p.completedAt);
          if (compDate > courseStats[p.courseSlug].lastDate) {
            courseStats[p.courseSlug].lastDate = compDate;
          }
        }
      }
    });

    const certs = [];
    for (const [slug, stats] of Object.entries(courseStats)) {
      // Award certificate if they have completed at least 80% of the course lectures
      const pct = stats.completed / stats.total;
      if (pct >= 0.8 || achievements.includes("course_completed")) {
        certs.push({
          id: `cert_${slug}`,
          courseTitle: slug === "cs50p" ? "Introduction to Programming with Python" : "Introduction to Artificial Intelligence with Python",
          courseSlug: slug,
          completedAt: stats.lastDate.getTime() === 0 ? new Date() : stats.lastDate,
          credentialId: `FA-${slug.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
        });
      }
    }

    return certs;
  };

  const earnedCertificates = getEarnedCertificates();

  // 4. Chronological Timeline list compilation
  const getTimelineItems = (): TimelineItem[] => {
    const items: TimelineItem[] = [];

    // Milestone 1: User Registration
    if (user.createdAt) {
      items.push({
        id: "signup",
        type: "milestone",
        title: "Joined Fraylon Academy",
        subtitle: "Began the personal learning journey.",
        date: new Date(user.createdAt),
      });
    }

    if (!summary?.lectureProgress) return items.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Lecture Completions
    summary.lectureProgress.forEach((p) => {
      if (p.status === "COMPLETED" && p.completedAt) {
        items.push({
          id: `lect_${p.courseSlug}_${p.lectureId}`,
          type: "lecture",
          title: `Completed Lecture ${p.lectureId}`,
          subtitle: p.courseSlug === "cs50p" ? "CS50 Introduction to Python" : "CS50 Artificial Intelligence",
          date: new Date(p.completedAt),
          xp: 50,
        });

        // Project Completion
        if (p.projectCompleted) {
          items.push({
            id: `proj_${p.courseSlug}_${p.projectId}`,
            type: "project",
            title: `Submitted Capstone Project: ${p.projectId || "Final Assignment"}`,
            subtitle: `Practiced hands-on programming topics in ${p.courseSlug.toUpperCase()}`,
            date: new Date(p.completedAt),
            xp: 100,
          });
        }
      }
    });

    // Quiz Attempts
    quizAttempts.forEach((q) => {
      if (q.passed) {
        items.push({
          id: `quiz_${q.id}`,
          type: "quiz",
          title: `Passed Lecture Quiz`,
          subtitle: `Scored ${q.score}/${q.total} on ${q.quizId}`,
          date: new Date(q.createdAt),
          xp: 30,
        });
      }
    });

    // Sort timeline descending (newest first)
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const timelineItems = getTimelineItems();

  // 5. Recommended Next Steps
  const getNextSteps = () => {
    if (!summary?.lectureProgress || summary.lectureProgress.length === 0) {
      return [
        {
          title: "Start Your First Course",
          description: "Begin CS50 Python Lecture 0: Functions, Variables.",
          buttonText: "Start CS50P",
          action: () => navigate("/course/cs50p"),
        },
      ];
    }

    const nextSteps = [];

    // Check progress of CS50P
    const cs50pProgress = summary.lectureProgress.filter((p) => p.courseSlug === "cs50p");
    const completedLectures = cs50pProgress.filter((p) => p.status === "COMPLETED");

    if (completedLectures.length < 9) {
      // Find the highest lecture completed
      const completedIds = completedLectures.map((p) => parseInt(p.lectureId)).filter((id) => !isNaN(id));
      const maxCompleted = completedIds.length > 0 ? Math.max(...completedIds) : -1;
      const nextLectureNum = maxCompleted + 1;

      nextSteps.push({
        title: `Continue CS50 Python: Lecture ${nextLectureNum}`,
        description: "Advance your python scripting, debug logic, and take the quiz.",
        buttonText: "Go to Lecture",
        action: () => navigate(`/course/cs50p/lecture/${nextLectureNum}`),
      });
    } else {
      // Completed python, suggest AI
      const aiProgress = summary.lectureProgress.filter((p) => p.courseSlug === "cs50ai");
      if (aiProgress.length === 0) {
        nextSteps.push({
          title: "Unlock CS50 Artificial Intelligence",
          description: "Explore Search Algorithms, Knowledge Graphs, and Machine Learning models.",
          buttonText: "Start CS50 AI",
          action: () => navigate("/course/cs50ai"),
        });
      } else {
        // AI in progress
        const completedAi = aiProgress.filter((p) => p.status === "COMPLETED");
        const completedIds = completedAi.map((p) => parseInt(p.lectureId)).filter((id) => !isNaN(id));
        const maxCompleted = completedIds.length > 0 ? Math.max(...completedIds) : -1;
        const nextLectureNum = maxCompleted + 1;

        if (nextLectureNum < 7) {
          nextSteps.push({
            title: `Continue CS50 AI: Lecture ${nextLectureNum}`,
            description: "Deep dive into state spaces, heuristic algorithms, and search models.",
            buttonText: "Continue CS50 AI",
            action: () => navigate(`/course/cs50ai/lecture/${nextLectureNum}`),
          });
        }
      }
    }

    // Suggest solving a problem
    nextSteps.push({
      title: "Climb the Leaderboard",
      description: "Solve more problems, earn XP points, and boost your streak rankings.",
      buttonText: "View Leaderboard",
      action: () => navigate("/leaderboard"),
    });

    return nextSteps;
  };

  const nextSteps = getNextSteps();

  return (
    <div className="w-full min-h-screen bg-[#0b0f19] text-slate-100 pb-16">
      {/* Header Splash */}
      <div className="border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/20 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <button
              onClick={() => navigate("/")}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Dashboard
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-medium">Learner Profile</span>
          </nav>

          {/* Profile Basic Info Row */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Initials Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-3xl md:text-4xl font-extrabold text-white shadow-xl shadow-blue-500/10 border-2 border-slate-700/50 group-hover:border-blue-400/50 transition-all duration-300">
                {getInitials(user.name)}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-lg border border-slate-800 shadow-md">
                <Sparkles size={14} className="animate-pulse" />
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  {user.name}
                </h1>
                <span className="inline-flex mx-auto md:mx-0 items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                  {user.role} Learner
                </span>
              </div>

              {/* Bio display */}
              <p className="text-slate-300 mt-2 max-w-2xl text-sm leading-relaxed italic">
                {user.bio ? `"${user.bio}"` : "No bio written yet. Customize your portfolio profile in settings!"}
              </p>

              {/* Joined and Email Metas */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 mt-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-500" />
                  Member since {formatDate(user.createdAt)}
                </span>
                <span className="hidden md:inline text-slate-700">•</span>
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-500" />
                  {user.email}
                </span>
              </div>
            </div>

            {/* Profile Tab Toggles */}
            <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800 mt-4 md:mt-0">
              <button
                onClick={() => setActiveTab("portfolio")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "portfolio"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers size={14} />
                My Portfolio
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "settings"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Settings size={14} />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8">
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-slate-900/40 animate-pulse border border-slate-800 rounded-2xl" />
              ))}
            </div>
            <div className="h-64 bg-slate-900/40 animate-pulse border border-slate-800 rounded-2xl" />
          </div>
        ) : activeTab === "portfolio" ? (
          // PORTFOLIO VIEW
          <div className="space-y-8">
            {/* 1. Learning Summary Cards */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total XP Card */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700/60 transition-all flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Trophy size={22} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white tracking-tight">{summary?.xp ?? 0}</div>
                  <div className="text-xs text-slate-400">Total Experience Points</div>
                </div>
              </div>

              {/* Streak Card */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700/60 transition-all flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Flame size={22} className="animate-pulse" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white tracking-tight">{summary?.streak ?? 0} Days</div>
                  <div className="text-xs text-slate-400">Current Login Streak</div>
                </div>
              </div>

              {/* Lectures Completed Card */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700/60 transition-all flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                  <BookOpen size={22} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white tracking-tight">{summary?.lecturesCompleted ?? 0}</div>
                  <div className="text-xs text-slate-400">Lectures Completed</div>
                </div>
              </div>

              {/* Tasks/Problems Completed Card */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700/60 transition-all flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Code size={22} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white tracking-tight">{summary?.problemsSolved ?? 0}</div>
                  <div className="text-xs text-slate-400">Coding Labs Solved</div>
                </div>
              </div>
            </section>

            {/* Split Content: Skills + Next Steps & Certificates */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column (8 cols): Projects, timeline */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* 2. Capstone Projects */}
                <section>
                  <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
                    <Briefcase size={20} className="text-blue-400" />
                    Milestone Capstone Projects
                  </h2>
                  
                  {completedProjects.length === 0 ? (
                    <div className="bg-slate-950/20 border border-slate-800/80 rounded-2xl p-6 text-center">
                      <Code size={36} className="text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No milestone projects completed yet.</p>
                      <p className="text-xs text-slate-500 mt-1">Submit your code drafts for capstone projects inside lectures to show them off here!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {completedProjects.map((proj) => (
                        <div
                          key={proj.id}
                          className="bg-slate-900/30 border border-slate-800 hover:border-blue-500/30 rounded-2xl p-5 hover:bg-slate-900/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                                {proj.courseSlug.toUpperCase()} Project
                              </span>
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Clock size={12} />
                                {formatDate(proj.completedAt)}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-slate-100 mt-3 capitalize">
                              {proj.id.replace(/_/g, " ")}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                              {proj.metadata.learningGoal || "Completed hands-on capstone milestone showing mastery of module concepts."}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-1">
                              {proj.metadata.tags.slice(0, 2).map((t) => (
                                <span key={t} className="text-[9px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                                  {t}
                                </span>
                              ))}
                            </div>
                            <div className="text-xs font-semibold text-green-400 flex items-center gap-1">
                              <CheckCircle size={12} />
                              +{proj.metadata.xp} XP Earned
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* 3. Learning Timeline */}
                <section>
                  <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-blue-400" />
                    Learning Timeline
                  </h2>

                  <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
                    {timelineItems.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-6">Your activities will show up here as you learn.</p>
                    ) : (
                      <div className="relative pl-6 border-l border-slate-800 space-y-6">
                        {timelineItems.slice(0, 10).map((item) => (
                          <div key={item.id} className="relative">
                            {/* Dot indicator */}
                            <div className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                              item.type === "milestone" ? "bg-amber-400 ring-4 ring-amber-400/20" :
                              item.type === "project" ? "bg-purple-500 ring-4 ring-purple-500/20" :
                              item.type === "quiz" ? "bg-emerald-400 ring-4 ring-emerald-400/20" :
                              "bg-blue-400 ring-4 ring-blue-400/20"
                            }`} />
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                                <p className="text-xs text-slate-400">{item.subtitle}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                {item.xp && (
                                  <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md">
                                    +{item.xp} XP
                                  </span>
                                )}
                                <span className="text-xs text-slate-500">{formatDate(item.date)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column (4 cols): Skills, Next Steps, Certificates */}
              <div className="lg:col-span-4 space-y-8">
                {/* 4. Skills Gained */}
                <section className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5">
                  <h2 className="text-base font-extrabold text-white mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-400" />
                    Skills Gained
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skillsGained.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-xl text-xs font-medium bg-gradient-to-r from-blue-900/30 to-indigo-900/30 text-blue-300 border border-blue-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>

                {/* 5. Recommended Next Steps */}
                <section className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <ArrowRight size={16} className="text-blue-400" />
                    Recommended Next Steps
                  </h2>
                  <div className="space-y-3">
                    {nextSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950/40 border border-slate-800 hover:border-blue-500/20 rounded-xl transition-all"
                      >
                        <h3 className="text-xs font-bold text-slate-200">{step.title}</h3>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{step.description}</p>
                        <button
                          onClick={step.action}
                          className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider"
                        >
                          {step.buttonText}
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 6. Earned Certificates */}
                <section className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Award size={16} className="text-blue-400" />
                    Course Certificates
                  </h2>
                  {earnedCertificates.length === 0 ? (
                    <div className="p-4 bg-slate-950/20 rounded-xl text-center border border-slate-800/50">
                      <Lock size={20} className="text-slate-600 mx-auto mb-1" />
                      <p className="text-[11px] text-slate-500">No certificates earned yet.</p>
                      <p className="text-[10px] text-slate-600 mt-1">Complete a course to unlock a Master Certificate.</p>
                    </div>
                  ) : (
                    earnedCertificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-indigo-500/20 rounded-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300"
                      >
                        <div className="absolute -top-8 -right-8 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all" />
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                            <Award size={18} />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-slate-200">{cert.courseTitle}</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">ID: {cert.credentialId}</p>
                            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-semibold text-indigo-400">
                              <Check size={12} /> Issued {formatDate(cert.completedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </section>
              </div>
            </div>
          </div>
        ) : (
          // SETTINGS FORM VIEW
          <div className="max-w-xl mx-auto bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
            <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
              <Settings size={22} className="text-blue-400" />
              Edit Account Settings
            </h2>

            {settingsSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                <CheckCircle size={16} />
                {settingsSuccess}
              </div>
            )}

            {settingsError && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <span className="text-lg">⚠</span>
                {settingsError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Profile Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Profile Info</h3>
                
                {/* Name */}
                <div>
                  <label htmlFor="settings-name" className="block text-xs font-medium text-slate-400 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="settings-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter full name"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="settings-bio" className="block text-xs font-medium text-slate-400 mb-1.5">
                    Profile Bio (Portfolio Tagline)
                  </label>
                  <textarea
                    id="settings-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    maxLength={300}
                    placeholder="Tell other learners about your interests or goals (e.g. 'Aspiring Data Analyst studying Python & AI')"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
                  />
                  <div className="text-[10px] text-slate-500 text-right mt-1">
                    {bio.length}/300 characters
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="pt-4 border-t border-slate-800/80 space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Change Password</h3>
                
                {/* New Password */}
                <div>
                  <label htmlFor="settings-password" className="block text-xs font-medium text-slate-400 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="settings-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                    <Lock className="absolute left-3.5 top-3.5 text-slate-600" size={16} />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="settings-confirm" className="block text-xs font-medium text-slate-400 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="settings-confirm"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                    <Lock className="absolute left-3.5 top-3.5 text-slate-600" size={16} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setName(user.name ?? "");
                    setBio(user.bio ?? "");
                    setPassword("");
                    setConfirmPassword("");
                    setActiveTab("portfolio");
                  }}
                  className="px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingSettings}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-sm font-semibold shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transition-all flex items-center gap-2"
                >
                  {updatingSettings ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
