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
  FolderKanban,
  LayoutDashboard,
  Menu,
  Settings,
  Trophy,
  User,
  X,
  PlusCircle,
  FileText,
  Layout,
  Code,
  HelpCircle,
  Briefcase,
  UploadCloud
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
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 border-l-2";

const navLinkActive =
  "bg-blue-600/15 text-white border-l-blue-500 shadow-sm";

const navLinkInactive =
  "text-white/75 hover:bg-white/5 hover:text-white border-transparent";

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

  const pathParts = location.pathname.split('/');
  let adminCourseId = "draft";
  if (pathParts[1] === "admin" && pathParts[2] === "content-studio" && pathParts[3] && pathParts[3] !== "new") {
    adminCourseId = pathParts[3];
  }

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

            <NavLink to={user?.role === 'admin' ? '/admin/settings' : '/settings'} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200 border border-transparent hover:border-slate-700/50">
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
          flex-shrink-0 flex flex-col border-r border-white/10
          bg-[#0f172a] backdrop-blur-sm transition-all duration-200 ease-in-out
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
              <div className={`px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
                Admin
              </div>

              {/* Content Studio Section */}
              <div className="mb-2">
                <div className={`flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-300 transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
                  <BookOpen size={18} />
                  <span className="truncate">Content Studio</span>
                </div>
                
                <div className={`flex flex-col space-y-0.5 ${expanded ? 'pl-4' : ''}`}>
                  <NavLink to="/admin/content-studio" end onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `${subLinkBase} ${isActive ? subLinkActive : subLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                    title="Course Creation">
                    <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><PlusCircle size={16} /></span>
                    <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Course Creation</span>
                  </NavLink>

                  <NavLink to={adminCourseId === "draft" ? "/admin/content-studio/new" : `/admin/content-studio/${adminCourseId}/blueprint`} onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `${subLinkBase} ${isActive ? subLinkActive : subLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                    title="Blueprint Builder">
                    <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><FileText size={16} /></span>
                    <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Blueprint Builder</span>
                  </NavLink>

                  <NavLink to={`/admin/content-studio/${adminCourseId}/lessons`} onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `${subLinkBase} ${isActive ? subLinkActive : subLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                    title="Lesson Editor">
                    <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><Layout size={16} /></span>
                    <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Lesson Editor</span>
                  </NavLink>

                  <NavLink to={`/admin/content-studio/${adminCourseId}/exercise`} onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `${subLinkBase} ${isActive ? subLinkActive : subLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                    title="Exercise Builder">
                    <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><Code size={16} /></span>
                    <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Exercise Builder</span>
                  </NavLink>

                  <NavLink to={`/admin/content-studio/${adminCourseId}/quiz`} onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `${subLinkBase} ${isActive ? subLinkActive : subLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                    title="Quiz Builder">
                    <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><HelpCircle size={16} /></span>
                    <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Quiz Builder</span>
                  </NavLink>

                  <NavLink to={`/admin/content-studio/${adminCourseId}/project`} onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `${subLinkBase} ${isActive ? subLinkActive : subLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                    title="Project Builder">
                    <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><Briefcase size={16} /></span>
                    <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Project Builder</span>
                  </NavLink>

                  <NavLink to={`/admin/content-studio/${adminCourseId}/publish`} onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `${subLinkBase} ${isActive ? subLinkActive : subLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                    title="Course Publishing">
                    <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><UploadCloud size={16} /></span>
                    <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Course Publishing</span>
                  </NavLink>
                </div>
              </div>

              <NavLink to="/admin/analytics" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                title="Analytics">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><BarChart3 size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Analytics</span>
              </NavLink>

              <NavLink to="/admin/operations" onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} ${expanded ? '' : 'justify-center px-2 gap-0'}`}
                title="Operations Monitor">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><AlertTriangle size={18} /></span>
                <span className={`truncate flex-1 text-left transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden flex-grow-0'}`}>Operations Monitor</span>
              </NavLink>

              <NavLink to="/admin/settings" onClick={() => setSidebarOpen(false)}
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
