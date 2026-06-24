import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth";
import { api, type Course } from "./api";
import {
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  ClipboardList,
  Construction,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  Trophy,
  User,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import { authApi } from "./authClient";

function Logo({ expanded }: { expanded: boolean }) {
  return (
    <NavLink to="/" className="flex items-center gap-2 flex-shrink-0 px-4 h-16 border-b border-slate-700/50 overflow-hidden">
      <img
        src={`${import.meta.env.BASE_URL}logo.svg`}
        alt="Fraylon Academy"
        className="h-8 w-auto object-contain flex-shrink-0"
      />
      <span className={`font-bold text-slate-100 text-base tracking-wide whitespace-nowrap transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
        Fraylon
      </span>
    </NavLink>
  );
}

const navLinkBase =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 border";

const navLinkActive =
  "bg-blue-600/15 text-blue-300 border-blue-500/30 shadow-sm";

const navLinkInactive =
  "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-transparent hover:border-slate-700/50";

const subLinkBase =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 border";

const subLinkActive =
  "text-blue-300 bg-blue-600/10 border-blue-500/20";

const subLinkInactive =
  "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent";

export default function Shell() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const leaveTimer = useRef<number | null>(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifList, setNotifList] = useState<any[]>([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    try {
      const data = await authApi.getInAppNotifications();
      setNotifList(data.notifications);
      setNotifUnread(data.unread);
    } catch {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await authApi.markNotificationRead(id);
      setNotifList((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
      setNotifUnread((u) => Math.max(0, u - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await authApi.markAllNotificationsRead();
      setNotifList((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
      setNotifUnread(0);
    } catch {}
  };

  const onCoursePage = location.pathname.startsWith("/course/");
  const courseSlug = onCoursePage ? location.pathname.split("/")[2] : null;

  useEffect(() => {
    api.courses().then(setCourses).catch(err => console.error('[shell] load courses failed', err));
  }, []);

  useEffect(() => {
    if (onCoursePage) {
      setCoursesOpen(false);
      setExpanded(false);
    }
  }, [onCoursePage]);

  const handleMouseEnter = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setExpanded(true);
  };

  const handleMouseLeave = () => {
    leaveTimer.current = window.setTimeout(() => {
      setExpanded(false);
      setCoursesOpen(false);
    }, 150);
  };

  const handleCourseClick = () => {
    setSidebarOpen(false);
    setCoursesOpen(false);
    setTimeout(() => setExpanded(false), 100);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-900">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm z-50">
        <div className="flex h-16 items-center gap-3 px-4 md:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200 flex-shrink-0 md:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <NavLink to="/" className="md:hidden flex items-center gap-2 flex-shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}logo.svg`}
              alt="Fraylon Academy"
              className="h-8 w-auto object-contain"
            />
            <span className="font-bold text-slate-100 text-base tracking-wide">Fraylon</span>
          </NavLink>

          <div className="flex-1" />

          <div className="flex items-center gap-3 text-sm">
            {user?.role === 'admin' && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-900/40 border border-amber-600/40">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300 font-semibold text-xs whitespace-nowrap">
                  Review Mode
                </span>
                <span className="text-amber-400/70 text-[10px] hidden md:inline">
                  All lectures unlocked
                </span>
              </div>
            )}
              {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-slate-300 truncate max-w-[140px] font-medium">
                  {user.name}
                </span>
                <span className="text-xs text-slate-500 capitalize hidden md:inline">
                  {user.role}
                </span>
              </div>
            )}

            <NavLink to="/profile" className="hidden md:flex rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-3 md:px-4 py-2 text-sm font-medium transition-all duration-200 border border-blue-500/50 whitespace-nowrap">
              Portfolio
            </NavLink>
            
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifs(); }}
                className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200 border border-transparent hover:border-slate-700/50"
              >
                <Bell size={20} />
                {notifUnread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {notifUnread > 9 ? '9+' : notifUnread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#161B22] border border-[#2D3748] rounded-[12px] shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#2D3748]">
                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                    {notifUnread > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-blue-400 hover:text-blue-300">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifList.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet.</div>
                    ) : (
                      notifList.slice(0, 20).map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={`w-full text-left px-4 py-3 border-b border-[#2D3748]/50 hover:bg-[#1F2937]/50 transition-colors ${
                            n.readAt ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="text-sm font-medium text-white">{n.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.body}</div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/settings" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200 border border-transparent hover:border-slate-700/50">
              <Settings size={20} />
            </NavLink>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 px-3 md:px-4 py-2 text-sm font-medium transition-all duration-200 border border-slate-700/50 hover:border-slate-600/50 whitespace-nowrap"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`fixed inset-y-0 left-0 md:relative md:inset-auto
          flex-shrink-0 flex flex-col border-r border-slate-700/50
          bg-slate-900/95 backdrop-blur-sm transition-all duration-200 ease-in-out
          z-40
          ${expanded ? "w-64" : "w-16"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div className="flex-shrink-0 overflow-hidden">
            <Logo expanded={expanded} />
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {/* ── Core navigation (all users) ── */}
            <NavLink to="/" end onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
              title="Dashboard">
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><LayoutDashboard size={18} /></span>
              <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Dashboard</span>
            </NavLink>

            {/* Courses dropdown */}
            <div>
              <button type="button" onClick={() => expanded && setCoursesOpen((o) => !o)}
                onMouseEnter={() => !expanded && setExpanded(true)}
                className={`${navLinkBase} ${onCoursePage ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'} appearance-none`}
                title="Courses">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><BookOpen size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Courses</span>
                <span className={`transition-all duration-200 overflow-hidden flex-shrink-0 flex items-center ${expanded ? 'w-4 opacity-100' : 'w-0 opacity-0'}`}>
                  <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 flex-shrink-0 ${coursesOpen ? "rotate-0" : "-rotate-90"}`} />
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-200 ease-in-out ${expanded && coursesOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="pt-1 pb-1 pl-3 space-y-0.5">
                  {courses.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-slate-500 animate-pulse">Loading...</div>
                  ) : courses.map((course) => {
                    const isActive = courseSlug === course.slug;
                    return (
                      <NavLink key={course.id} to={`/course/${course.slug}`} onClick={handleCourseClick}
                        className={`${subLinkBase} ${isActive ? subLinkActive : subLinkInactive}`}>
                        <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-400' : 'bg-slate-600'}`} />
                        </span>
                        <span className="truncate">{course.title}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </div>

            <NavLink to="/projects" onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
              title="Projects">
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><FolderKanban size={18} /></span>
              <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Projects</span>
            </NavLink>

            <NavLink to="/assessments" onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
              title="Assessments">
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><ClipboardList size={18} /></span>
              <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Assessments</span>
            </NavLink>

            <NavLink to="/certifications" onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
              title="Certifications">
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><Award size={18} /></span>
              <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Certifications</span>
            </NavLink>

            <NavLink to="/leaderboard" onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
              title="Leaderboard">
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><Trophy size={18} /></span>
              <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Leaderboard</span>
            </NavLink>

            <NavLink to="/profile" onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
              title="Profile">
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><User size={18} /></span>
              <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Profile</span>
            </NavLink>

            {/* ── Admin navigation ── */}
            {user?.role === "admin" && <>
              <div className="border-t border-slate-700/30 my-2" />

              <NavLink to="/admin/review-queue" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                title="Review Queue">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><AlertTriangle size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Review Queue</span>
              </NavLink>

              <NavLink to="/admin/students" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                title="Student Management">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><UserCheck size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Student Management</span>
              </NavLink>

              <NavLink to="/admin/courses" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                title="Courses">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><BookOpen size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Courses</span>
              </NavLink>

              <NavLink to="/admin" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                title="Admin Panel">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><ShieldCheck size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Admin Panel</span>
              </NavLink>

              <NavLink to="/admin/notifications" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                title="Notifications">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><Bell size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Notifications</span>
              </NavLink>

              <NavLink to="/admin/projects" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                title="Projects">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><FolderKanban size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Projects</span>
              </NavLink>

              <NavLink to="/admin/practice-exercises" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                title="Practice Exercises">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><BookOpen size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Practice</span>
              </NavLink>

              <NavLink to="/admin/assessments" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                title="Assessments">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><BarChart3 size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Assessments</span>
              </NavLink>

              <NavLink to="/admin/certifications" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                title="Certifications">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><Award size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Certifications</span>
              </NavLink>

              <NavLink to="/admin/content" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                title="Content">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><BookOpen size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Content</span>
              </NavLink>

              <NavLink to="/admin/reports" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                title="Reports">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><BarChart3 size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Reports</span>
              </NavLink>

              <NavLink to="/admin/automations" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                title="Automations">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><Zap size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Automations</span>
              </NavLink>

              <div className="border-t border-slate-700/30 my-2" />

              <NavLink to="/qa" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                title="QA Center">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><Construction size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>QA Center</span>
              </NavLink>

              <NavLink to="/settings" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                title="Settings">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><Settings size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Settings</span>
              </NavLink>
            </>}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 md:hidden z-30"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
