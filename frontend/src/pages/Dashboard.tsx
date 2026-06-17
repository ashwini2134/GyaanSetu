import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Course, getSubmissionHistory } from "../api";
import { useAuth } from "../auth";
import { Card, CourseSearchFilters, NoResultsState, DynamicCourseIcon } from "../components";

import { useGamification, ACHIEVEMENTS } from "../progress";

const IconBook = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const IconGraduation = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v7" />
  </svg>
);

const IconDevice = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const IconBrain = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const IconMonitor = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconStreak = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3C10 7 7 8 7 12a5 5 0 0010 0c0-4-3-5-5-9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9V7" />
  </svg>
);

const IconChart = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
  </svg>
);

const IconDiamond = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 3h12l4 6-10 12L2 9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3L8 9l4 12 4-12-3-6" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 9h20" />
  </svg>
);

const IconTrophy = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4m-4 0H8m12 3v3a6 6 0 01-6 6H10a6 6 0 01-6-6v-3M4 11h16" />
  </svg>
);




export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [submissionHistory, setSubmissionHistory] = useState<Record<string, number>>({});
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  
  // Use our centralized Gamification hook
  const { xp, achievements: unlockedAchievements, streak, stats, overallProgress } = useGamification();

  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeStatId, setActiveStatId] = useState<string | null>(null);
  const [activeBadgeId, setActiveBadgeId] = useState<string | null>(null);

  const handleCourseClick = (slug: string) => {
    setActiveCourseId(slug);
    window.setTimeout(() => {
      setActiveCourseId((current) => (current === slug ? null : current));
    }, 700);
  };

  const handleStatClick = (id: string) => {
    setActiveStatId(id);
    window.setTimeout(() => {
      setActiveStatId((current) => (current === id ? null : current));
    }, 700);
  };

  const handleBadgeClick = (id: string) => {
    setActiveBadgeId(id);
    window.setTimeout(() => {
      setActiveBadgeId((current) => (current === id ? null : current));
    }, 900);
  };

  useEffect(() => {
    setSubmissionHistory(getSubmissionHistory());
  }, []);

  const [courseStatsMap, setCourseStatsMap] = useState<Record<string, { completed: number; inProgressLectures: number; total: number; lecturesCompleted: number; percentage: number; status: string }>>({});
  const [dynamicStats, setDynamicStats] = useState({ coursesStarted: 0, coursesCompleted: 0, lecturesCompleted: 0 });

  useEffect(() => {
    if (!courses) return;

    fetch('http://localhost:3000/api/courses/progress', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const map: Record<string, any> = {};
        let started = 0;
        let completed = 0;
        let lectures = 0;

        data.forEach((p: any) => {
          map[p.courseId] = {
            completed: p.completedLectures,
            inProgressLectures: p.inProgressLectures || 0,
            total: p.totalLectures,
            lecturesCompleted: p.completedLectures,
            percentage: p.percentage,
            status: p.status
          };
          if (p.percentage > 0) started++;
          if (p.percentage === 100) completed++;
          lectures += p.completedLectures;
        });

        setCourseStatsMap(map);
        setDynamicStats({ coursesStarted: started, coursesCompleted: completed, lecturesCompleted: lectures });
      })
      .catch(console.error);
  }, [courses]);

  useEffect(() => {
    api
      .courses()
      .then(setCourses)
      .catch((e: Error) => setErr(e.message));
  }, []);

  const totalCompleted = stats.tasksSubmitted + stats.projectsSolved;

  // Get last 7 days for streak heatmap
  const getStreakDays = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const hasActivity = submissionHistory[dateStr] > 0;
      const isToday = i === 0;
      days.push({
        name: dayNames[date.getDay()],
        hasActivity,
        isToday,
        count: submissionHistory[dateStr] || 0
      });
    }
    return days;
  };

  const streakDays = getStreakDays();

  const displayAchievements = useMemo(() => {
    return ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: unlockedAchievements.includes(a.id)
    }));
  }, [unlockedAchievements]);

  return (
    <div className="w-full min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 px-4 md:px-0">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1 text-xs text-blue-400 mb-4 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Learning Hub
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              Welcome back, {user?.name?.split(' ')[0] || "Student"}!
            </h1>
            <p className="text-slate-400 text-sm">
              Track your progress, earn achievements, and build real skills.
            </p>
          </div>

          {/* Top-Right Stats row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Streak card */}
            <button
              type="button"
              onClick={() => handleStatClick('header_streak')}
              className={`relative flex items-center gap-4 bg-slate-900/30 border rounded-2xl p-4 min-w-[170px] text-left transition-all duration-300 active:scale-[0.96] overflow-hidden ${
                activeStatId === 'header_streak' ? 'border-orange-500/80 bg-orange-500/10 scale-[1.02] shadow-lg shadow-orange-500/10' : 'border-slate-800/80 hover:border-orange-500/30'
              }`}
            >
              <div className="relative rounded-xl bg-orange-500/10 p-3 text-orange-400 flex-shrink-0 transition-transform duration-300">
                <IconStreak />
                {activeStatId === 'header_streak' && (
                  <span className="absolute inset-0 rounded-xl bg-orange-500/30 animate-ping pointer-events-none" />
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-white leading-none">{streak.currentStreak} Days</div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">Current Streak</div>
              </div>
            </button>

            {/* Progress card */}
            <button
              type="button"
              onClick={() => handleStatClick('header_progress')}
              className={`relative flex items-center gap-4 bg-slate-900/30 border rounded-2xl p-4 min-w-[170px] text-left transition-all duration-300 active:scale-[0.96] overflow-hidden ${
                activeStatId === 'header_progress' ? 'border-emerald-500/80 bg-emerald-500/10 scale-[1.02] shadow-lg shadow-emerald-500/10' : 'border-slate-800/80 hover:border-emerald-500/30'
              }`}
            >
              <div className="relative rounded-xl bg-emerald-500/10 p-3 text-emerald-400 flex-shrink-0 transition-transform duration-300">
                <IconChart />
                {activeStatId === 'header_progress' && (
                  <span className="absolute inset-0 rounded-xl bg-emerald-500/30 animate-ping pointer-events-none" />
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-white leading-none">{overallProgress}%</div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">Overall Progress</div>
              </div>
            </button>

            {/* Total XP card */}
            <button
              type="button"
              onClick={() => handleStatClick('header_xp')}
              className={`relative flex items-center gap-4 bg-slate-900/30 border rounded-2xl p-4 min-w-[170px] text-left transition-all duration-300 active:scale-[0.96] overflow-hidden ${
                activeStatId === 'header_xp' ? 'border-cyan-500/80 bg-cyan-500/10 scale-[1.02] shadow-lg shadow-cyan-500/10' : 'border-slate-800/80 hover:border-cyan-500/30'
              }`}
            >
              <div className="relative rounded-xl bg-blue-500/10 p-3 text-cyan-400 flex-shrink-0 transition-transform duration-300">
                <IconDiamond />
                {activeStatId === 'header_xp' && (
                  <span className="absolute inset-0 rounded-xl bg-blue-500/30 animate-ping pointer-events-none" />
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-white leading-none">{xp}</div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">Total XP</div>
              </div>
            </button>
          </div>
        </div>

        {err && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-300 mx-4 md:mx-0">
            <p className="font-semibold text-sm">Error loading courses</p>
            <p className="text-xs mt-1 opacity-80">{err}</p>
          </div>
        )}

        {/* Course Search & Catalog Section */}
        {/* Separated Content Wrapper Pane */}
        <div className="bg-[#0c101b]/80 border border-slate-800/60 rounded-3xl p-6 md:p-8 mb-8">
          {/* Main Columns layout */}
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            {/* Left Panel */}
            <div className="lg:col-span-2 space-y-8">
              {/* 6 Stats card grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Courses Started */}
                <button
                  type="button"
                  onClick={() => handleStatClick('courses_started')}
                  className={`relative flex items-center gap-4 bg-slate-950/40 border rounded-3xl p-5 text-left transition-all duration-300 active:scale-[0.96] overflow-hidden ${
                    activeStatId === 'courses_started' ? 'border-blue-500/80 scale-[1.02] bg-blue-500/10 shadow-lg shadow-blue-500/10' : 'border-slate-800/60 hover:border-slate-700/60'
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0 font-bold">
                    <IconBook />
                    {activeStatId === 'courses_started' && (
                      <span className="absolute inset-0 rounded-2xl bg-blue-500/30 animate-ping pointer-events-none" />
                    )}
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-white leading-none mb-1">{dynamicStats.coursesStarted}</div>
                    <div className="text-[11px] text-slate-400 font-medium">Courses Started</div>
                  </div>
                </button>

                {/* Courses Completed */}
                <button
                  type="button"
                  onClick={() => handleStatClick('courses_completed')}
                  className={`relative flex items-center gap-4 bg-slate-950/40 border rounded-3xl p-5 text-left transition-all duration-300 active:scale-[0.96] overflow-hidden ${
                    activeStatId === 'courses_completed' ? 'border-green-500/80 scale-[1.02] bg-green-500/10 shadow-lg shadow-green-500/10' : 'border-slate-800/60 hover:border-slate-700/60'
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 flex-shrink-0">
                    <IconGraduation />
                    {activeStatId === 'courses_completed' && (
                      <span className="absolute inset-0 rounded-2xl bg-green-500/30 animate-ping pointer-events-none" />
                    )}
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-white leading-none mb-1">{dynamicStats.coursesCompleted}</div>
                    <div className="text-[11px] text-slate-400 font-medium">Courses Completed</div>
                  </div>
                </button>

                {/* Lectures Completed */}
                <button
                  type="button"
                  onClick={() => handleStatClick('lectures_completed')}
                  className={`relative flex items-center gap-4 bg-slate-950/40 border rounded-3xl p-5 text-left transition-all duration-300 active:scale-[0.96] overflow-hidden ${
                    activeStatId === 'lectures_completed' ? 'border-purple-500/80 scale-[1.02] bg-purple-500/10 shadow-lg shadow-purple-500/10' : 'border-slate-800/60 hover:border-slate-700/60'
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                    <IconDevice />
                    {activeStatId === 'lectures_completed' && (
                      <span className="absolute inset-0 rounded-2xl bg-purple-500/30 animate-ping pointer-events-none" />
                    )}
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-white leading-none mb-1">{dynamicStats.lecturesCompleted}</div>
                    <div className="text-[11px] text-slate-400 font-medium">Lectures Completed</div>
                  </div>
                </button>

                {/* Quizzes Passed */}
                <button
                  type="button"
                  onClick={() => handleStatClick('quizzes_passed')}
                  className={`relative flex items-center gap-4 bg-slate-950/40 border rounded-3xl p-5 text-left transition-all duration-300 active:scale-[0.96] overflow-hidden ${
                    activeStatId === 'quizzes_passed' ? 'border-amber-500/80 scale-[1.02] bg-amber-500/10 shadow-lg shadow-amber-500/10' : 'border-slate-800/60 hover:border-slate-700/60'
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0 font-bold">
                    <IconBrain />
                    {activeStatId === 'quizzes_passed' && (
                      <span className="absolute inset-0 rounded-2xl bg-amber-500/30 animate-ping pointer-events-none" />
                    )}
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-white leading-none mb-1">{stats.quizzesPassed}</div>
                    <div className="text-[11px] text-slate-400 font-medium">Quizzes Passed</div>
                  </div>
                </button>

                {/* Tasks Submitted */}
                <button
                  type="button"
                  onClick={() => handleStatClick('tasks_submitted')}
                  className={`relative flex items-center gap-4 bg-slate-950/40 border rounded-3xl p-5 text-left transition-all duration-300 active:scale-[0.96] overflow-hidden ${
                    activeStatId === 'tasks_submitted' ? 'border-teal-500/80 scale-[1.02] bg-teal-500/10 shadow-lg shadow-teal-500/10' : 'border-slate-800/60 hover:border-slate-700/60'
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 flex-shrink-0">
                    <IconCheck />
                    {activeStatId === 'tasks_submitted' && (
                      <span className="absolute inset-0 rounded-2xl bg-teal-500/30 animate-ping pointer-events-none" />
                    )}
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-white leading-none mb-1">{stats.tasksSubmitted}</div>
                    <div className="text-[11px] text-slate-400 font-medium">Tasks Submitted</div>
                  </div>
                </button>

                {/* Projects Solved */}
                <button
                  type="button"
                  onClick={() => handleStatClick('projects_solved')}
                  className={`relative flex items-center gap-4 bg-slate-950/40 border rounded-3xl p-5 text-left transition-all duration-300 active:scale-[0.96] overflow-hidden ${
                    activeStatId === 'projects_solved' ? 'border-orange-500/80 scale-[1.02] bg-orange-500/10 shadow-lg shadow-orange-500/10' : 'border-slate-800/60 hover:border-slate-700/60'
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 flex-shrink-0">
                    <IconMonitor />
                    {activeStatId === 'projects_solved' && (
                      <span className="absolute inset-0 rounded-2xl bg-orange-500/30 animate-ping pointer-events-none" />
                    )}
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-white leading-none mb-1">{stats.projectsSolved}</div>
                    <div className="text-[11px] text-slate-400 font-medium">Projects Solved</div>
                  </div>
                </button>
              </div>

              {/* Course Search & Catalog Section */}
              {courses !== null && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="text-white">
                        <IconBook />
                      </div>
                      <h2 className="text-xl font-bold text-white tracking-tight">Your Courses</h2>
                    </div>
                    <Link
                      to="/courses"
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View Catalog →
                    </Link>
                  </div>

                  <CourseSearchFilters
                    courses={courses}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onFilteredCoursesChange={setFilteredCourses}
                  />

                  {filteredCourses.length === 0 ? (
                    <NoResultsState query={searchQuery} onSelectSuggestion={setSearchQuery} />
                  ) : (
                    <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                      {filteredCourses.map((c) => {
                        const progress = courseStatsMap[c.slug] || { completed: 0, inProgressLectures: 0, total: 10, lecturesCompleted: 0, percentage: 0, status: 'not_started' };
                        const percent = progress.percentage;
                        
                        // Dynamic borders and badge colors
                        let topBorderColor = "border-t-slate-700";
                        if (c.category === "Programming") topBorderColor = "border-t-[#3B82F6]";
                        else if (c.category === "Artificial Intelligence") topBorderColor = "border-t-[#A855F7]";
                        else if (c.category === "Computer Science") topBorderColor = "border-t-[#22C55E]";

                        let diffColor = "bg-green-500/10 border-green-500/20 text-green-400";
                        if (c.level === "Intermediate") diffColor = "bg-amber-500/10 border-amber-500/20 text-amber-400";
                        else if (c.level === "Advanced") diffColor = "bg-red-500/10 border-red-500/20 text-red-400";

                        const isCourseActive = activeCourseId === c.slug;

                        return (
                          <Link key={c.id} to={`/course/${c.slug}`} className="group block active:scale-[0.97] transition-all duration-300 h-full">
                            <Card
                              onClick={() => handleCourseClick(c.slug)}
                              className={`relative p-6 bg-[#161B22] border-y border-r border-[#2D3748] border-l-4 ${topBorderColor.replace('border-t-', 'border-l-')} rounded-[12px] transition-all duration-300 h-full flex flex-col sm:flex-row gap-6 items-start overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)]`}
                            >
                              {/* Left Column: Image and Tags */}
                              <div className="flex flex-col items-center sm:items-start shrink-0 sm:w-1/3 min-w-[140px]">
                                <div className="relative mb-5 flex justify-center w-full">
                                  <DynamicCourseIcon courseName={c.title} category={c.category} />
                                  {isCourseActive && (
                                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[64px] h-[64px] rounded-[16px] bg-cyan-400/20 animate-ping pointer-events-none" />
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start w-full">
                                  <span className={`inline-flex items-center justify-center whitespace-nowrap overflow-hidden text-ellipsis px-3 py-1 rounded-full text-[11px] font-semibold border leading-none ${diffColor}`}>
                                    {c.level}
                                  </span>
                                  <span className="inline-flex items-center justify-center whitespace-nowrap overflow-hidden text-ellipsis px-3 py-1 rounded-full text-[11px] font-semibold bg-[#1F2937] border border-[#2D3748] text-slate-300 leading-none">
                                    {c.category}
                                  </span>
                                </div>
                              </div>

                              {/* Right Column: Details & Progress */}
                              <div className="flex flex-col flex-grow w-full justify-between h-full min-h-[160px]">
                                <div className="text-center sm:text-left mb-6">
                                  <h3 className="text-[18px] font-bold text-white group-hover:text-[#3B82F6] transition-colors">{c.title}</h3>
                                  <p className="text-[13px] text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">{c.description}</p>
                                </div>
                                <div className="flex flex-col justify-end mt-auto">
                                  <div className="space-y-2 mb-5">
                                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                                      <span>Progress</span>
                                      <span className="text-slate-300">{progress.completed} / {progress.total} Lectures ({percent}%)</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
                                      <div className="h-full bg-[#3B82F6] rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                    </div>
                                    {progress.inProgressLectures > 0 && (
                                      <div className="text-[10px] text-amber-400 font-medium mt-1">
                                        {progress.inProgressLectures} In Progress
                                      </div>
                                    )}
                                  </div>
                                  <button className={`w-full h-[38px] text-white rounded-[8px] flex items-center justify-center font-medium text-[13px] transition-colors border-none cursor-pointer shadow-sm ${percent === 100 ? 'bg-[#22C55E] hover:bg-[#16A34A] shadow-green-900/20' : 'bg-[#3B82F6] hover:bg-[#2563EB] shadow-blue-900/20'}`}>
                                    {percent === 100 ? "Completed" : percent > 0 ? "Continue" : "Start Course"}
                                  </button>
                                </div>
                              </div>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Panel: Achievements */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="text-slate-300">
                    <IconTrophy />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Achievements</h3>
                </div>
                <div className="rounded-full bg-slate-900/60 border border-slate-800/80 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400">
                  {displayAchievements.filter(a => a.unlocked).length} / {displayAchievements.length} Unlocked
                </div>
              </div>

              <Card className="bg-slate-950/40 border border-slate-800/60 rounded-3xl p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-4">
                  {displayAchievements.map((achievement) => {
                    const isActive = activeBadgeId === achievement.id;
                    return (
                      <button
                        key={achievement.id}
                        type="button"
                        onClick={() => handleBadgeClick(achievement.id)}
                        className={`relative flex items-start gap-4 p-3 rounded-2xl border text-left transition-all duration-300 active:scale-[0.96] overflow-hidden ${
                          achievement.unlocked
                            ? "border-emerald-500/10 bg-emerald-500/5 hover:border-emerald-500/20"
                            : "border-slate-900 bg-slate-950/40 opacity-50 hover:border-slate-800"
                        } ${isActive ? 'scale-[1.02] border-amber-500/60 bg-amber-500/5 shadow-md shadow-amber-500/5' : ''}`}
                      >
                        <div className="relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className={`absolute inset-0 rounded-full flex items-center justify-center ${
                            achievement.unlocked
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-slate-900 text-slate-500 border border-slate-800"
                          }`}>
                            {achievement.icon}
                          </div>
                          {isActive && (
                            <span className="absolute inset-0 rounded-full bg-amber-500/30 animate-ping pointer-events-none" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-white leading-tight">{achievement.title}</span>
                            {achievement.unlocked && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-extrabold text-amber-400 tracking-wider">
                                UNLOCKED
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal">{achievement.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <Link
                  to="/leaderboard"
                  className="mt-2 block w-full text-center py-2.5 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 text-xs font-bold text-slate-300 rounded-2xl transition-all active:scale-[0.98]"
                >
                  View Leaderboard →
                </Link>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom Submission Activity heatmap - kept exactly as is */}
        <div className="mt-auto pt-4 pb-12 w-full px-4 md:px-0">
          <Card className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <IconChart /> Submission Activity
                </h2>
                <div className="text-xs text-slate-400 uppercase tracking-[0.24em]">Past 7 days</div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl bg-slate-950/70 p-3 text-xs uppercase tracking-[0.24em] text-slate-400">Total Submissions: {totalCompleted}</div>
                <div className="rounded-2xl bg-slate-950/70 p-3 text-xs uppercase tracking-[0.24em] text-slate-400">Longest Streak: {streak.longestStreak} days</div>
                <div className="rounded-2xl bg-slate-950/70 p-3 text-xs uppercase tracking-[0.24em] text-slate-400">Most Active Day: Today</div>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 mb-4">
              {streakDays.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-full aspect-square rounded-md flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                      day.count >= 4
                        ? 'bg-green-500 text-white'
                        : day.count >= 2
                          ? 'bg-green-600/70 text-white'
                          : day.count >= 1
                            ? 'bg-green-700/50 text-white'
                            : day.isToday
                              ? 'bg-slate-700 border border-dashed border-slate-600'
                              : 'bg-slate-800'
                    }`}
                    title={`${day.count} submissions`}
                  >
                    {day.count > 0 ? day.count : ''}
                  </div>
                  <span className={`text-[9px] ${day.isToday ? 'text-green-400' : 'text-slate-500'}`}>
                    {day.name.charAt(0)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
