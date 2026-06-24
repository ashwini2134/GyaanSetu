import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { authFetch } from '../authClient';
import {
  ShieldCheck, LayoutDashboard, Users, GraduationCap, FileCheck, BookOpen,
  Brain, Clock, CheckCircle2, XCircle, ExternalLink, Search, ChevronRight,
  Award, BarChart3, Zap
} from 'lucide-react';

type Tab = 'overview' | 'students' | 'projects' | 'courses' | 'certifications' | 'assessments';

const TABS: { id: Tab; label: string; icon: typeof ShieldCheck }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'projects', label: 'Project Reviews', icon: FileCheck },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'assessments', label: 'Assessments', icon: Brain },
];

interface Stats {
  totalStudents: number; totalAdmins: number; totalCourses: number;
  totalProjects: number; totalCertsIssued: number; pendingProjects: number;
}

interface StudentSummary {
  id: string; name: string; email: string; xp: number; streak: number;
  joinedAt: string; lastActive: string;
  lecturesCompleted: number; quizzesPassed: number; problemsSolved: number;
  projectsCount: number; certificatesIssued: number;
}

interface PendingProject {
  id: string; userId: string; projectId: string; status: string;
  code: string; githubUrl: string | null; liveDemoUrl: string | null;
  description: string | null; completedAt: string;
  user: { id: string; name: string; email: string };
}

interface CourseInfo { slug: string; totalLectures: number; studentsEnrolled: number; }

interface AssessmentEntry {
  id: string; userId: string; category: string; subsection: string;
  score: number; totalQuestions: number; status: string; attempts: number;
  lastAttemptAt: string;
  user: { id: string; name: string; email: string };
}

interface EligibleStudent {
  userId: string; name: string; email: string;
  courseSlug: string; avgQuizScore: number | null;
}

const COURSE_LABELS: Record<string, string> = {
  python: 'CS50P: Introduction to Python',
  cs50ai: 'CS50 AI with Python',
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<Stats | null>(null);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [pending, setPending] = useState<PendingProject[]>([]);
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [eligible, setEligible] = useState<EligibleStudent[]>([]);
  const [assessments, setAssessments] = useState<AssessmentEntry[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [rejectOpen, setRejectOpen] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [statsRes, studentsRes, pendingRes, coursesRes, eligibleRes, assesRes] = await Promise.all([
          authFetch<Stats>('/admin/stats'),
          authFetch<{ students: StudentSummary[] }>('/admin/students'),
          authFetch<{ pending: PendingProject[] }>('/projects/admin/pending'),
          authFetch<{ courses: CourseInfo[] }>('/admin/courses'),
          authFetch<{ eligible: EligibleStudent[] }>('/certifications/admin/eligible').catch(() => ({ eligible: [] })),
          authFetch<{ assessments: AssessmentEntry[] }>('/admin/assessments').catch(() => ({ assessments: [] })),
        ]);
        setStats(statsRes);
        setStudents(studentsRes.students ?? []);
        setPending(pendingRes.pending ?? []);
        setCourses(coursesRes.courses ?? []);
        setEligible(eligibleRes.eligible ?? []);
        setAssessments(assesRes.assessments ?? []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleApprove(projectId: string, userId: string) {
    setActionLoading(`approve:${userId}:${projectId}`);
    try {
      await authFetch(`/projects/admin/approve/${projectId}`, { method: 'POST', body: JSON.stringify({ userId }) });
      setPending(prev => prev.filter(p => !(p.projectId === projectId && p.userId === userId)));
    } catch { alert('Failed to approve'); }
    setActionLoading(null);
  }

  async function handleReject(projectId: string, userId: string) {
    setActionLoading(`reject:${userId}:${projectId}`);
    try {
      await authFetch(`/projects/admin/reject/${projectId}`, { method: 'POST', body: JSON.stringify({ userId, notes: rejectNotes[`${userId}:${projectId}`] || '' }) });
      setPending(prev => prev.filter(p => !(p.projectId === projectId && p.userId === userId)));
      setRejectOpen(null);
    } catch { alert('Failed to reject'); }
    setActionLoading(null);
  }

  async function handleIssueCert(userId: string, courseSlug: string) {
    const key = `cert:${userId}:${courseSlug}`;
    setActionLoading(key);
    try {
      await authFetch('/certifications/admin/issue', { method: 'POST', body: JSON.stringify({ userId, courseSlug }) });
      setEligible(prev => prev.filter(e => !(e.userId === userId && e.courseSlug === courseSlug)));
    } catch { alert('Failed to issue certificate'); }
    setActionLoading(null);
  }

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const TabIcon = TABS.find(t => t.id === tab)?.icon || BarChart3;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100">
      <div className="relative overflow-hidden border-b border-slate-800">
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <button onClick={() => navigate('/')} className="text-blue-400 hover:text-blue-300 flex items-center gap-1"><LayoutDashboard size={12} /> Dashboard</button>
            <span className="text-slate-600">/</span>
            <span className="text-blue-400 font-medium">Admin Panel</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20"><ShieldCheck size={28} className="text-blue-400" /></div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Admin Panel</h1>
              <p className="text-slate-400 text-sm mt-1">Full LMS oversight — students, projects, courses, certifications, and assessments.</p>
            </div>
          </div>

          <div className="flex gap-1 bg-slate-800/60 rounded-xl p-1 border border-slate-700/50 overflow-x-auto">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    tab === t.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {loading ? (
          <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />)}</div>
        ) : (
          <>
            {tab === 'overview' && stats && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { label: 'Students', value: stats.totalStudents, icon: Users, color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10' },
                    { label: 'Courses', value: stats.totalCourses, icon: BookOpen, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
                    { label: 'Projects Done', value: stats.totalProjects, icon: FileCheck, color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10' },
                    { label: 'Certs Issued', value: stats.totalCertsIssued, icon: Award, color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/10' },
                    { label: 'Pending Reviews', value: stats.pendingProjects, icon: Clock, color: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/10' },
                    { label: 'Admins', value: stats.totalAdmins, icon: ShieldCheck, color: 'text-slate-400', border: 'border-slate-500/20', bg: 'bg-slate-500/10' },
                  ].map(s => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} p-4`}>
                        <div className="flex items-center gap-3">
                          <Icon size={20} className={s.color} />
                          <div>
                            <p className="text-2xl font-extrabold text-white">{s.value}</p>
                            <p className="text-[10px] text-slate-400">{s.label}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Users size={16} className="text-blue-400" /> Recent Students</h3>
                    <div className="space-y-2">
                      {students.slice(0, 5).map(s => (
                        <div key={s.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/40 last:border-0">
                          <div><span className="text-white font-medium">{s.name}</span><span className="text-slate-500 ml-2">{s.email}</span></div>
                          <div className="flex gap-3 text-slate-400"><span>{s.xp} XP</span><span className="text-amber-400">🔥{s.streak}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Award size={16} className="text-emerald-400" /> Pending Actions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Project reviews pending</span>
                        <span className="font-bold text-amber-400">{stats.pendingProjects}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Students eligible for certs</span>
                        <span className="font-bold text-emerald-400">{eligible.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Courses available</span>
                        <span className="font-bold text-blue-400">{stats.totalCourses}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'students' && (
              <div className="space-y-4">
                <div className="relative max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input value={studentSearch} onChange={e => setStudentSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-left text-[10px] text-slate-500 uppercase tracking-wider">
                        <th className="px-4 py-3 font-medium">Student</th>
                        <th className="px-4 py-3 font-medium text-center">Lectures</th>
                        <th className="px-4 py-3 font-medium text-center">Quizzes</th>
                        <th className="px-4 py-3 font-medium text-center">Problems</th>
                        <th className="px-4 py-3 font-medium text-center">Projects</th>
                        <th className="px-4 py-3 font-medium text-center">Certs</th>
                        <th className="px-4 py-3 font-medium text-right">XP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(s => (
                        <tr key={s.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors cursor-pointer"
                          onClick={() => navigate(`/profile/${s.id}`)}
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-white text-xs">{s.name}</p>
                            <p className="text-[10px] text-slate-500">{s.email}</p>
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-slate-300">{s.lecturesCompleted}</td>
                          <td className="px-4 py-3 text-center text-xs text-slate-300">{s.quizzesPassed}</td>
                          <td className="px-4 py-3 text-center text-xs text-slate-300">{s.problemsSolved}</td>
                          <td className="px-4 py-3 text-center text-xs text-slate-300">{s.projectsCount}</td>
                          <td className="px-4 py-3 text-center text-xs text-slate-300">{s.certificatesIssued}</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-blue-400">{s.xp}</td>
                        </tr>
                      ))}
                      {filteredStudents.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">No students found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-slate-500">{filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}</p>
              </div>
            )}

            {tab === 'projects' && (
              pending.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-500">
                  <FileCheck size={28} className="mx-auto mb-2 text-slate-600" />
                  No pending project reviews.
                </div>
              ) : (
                <div className="space-y-3">
                  {pending.map(p => (
                    <div key={`${p.userId}:${p.projectId}`} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-white">{p.projectId}</h3>
                            <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full font-mono">{p.user.name}</span>
                            <span className="text-[10px] text-slate-500">{p.user.email}</span>
                          </div>
                          {p.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>}
                          <p className="text-[10px] text-slate-500 mt-1">Submitted {new Date(p.completedAt).toLocaleDateString()}</p>
                        </div>
                        {(p.githubUrl || p.liveDemoUrl) && (
                          <div className="flex gap-1">
                            {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"><ExternalLink size={14} /></a>}
                            {p.liveDemoUrl && <a href={p.liveDemoUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"><ExternalLink size={14} /></a>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <button onClick={() => handleApprove(p.projectId, p.userId)}
                          disabled={actionLoading === `approve:${p.userId}:${p.projectId}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
                        >
                          {actionLoading === `approve:${p.userId}:${p.projectId}` ? 'Approving…' : <><CheckCircle2 size={14} /> Approve</>}
                        </button>
                        {rejectOpen === `${p.userId}:${p.projectId}` ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input value={rejectNotes[`${p.userId}:${p.projectId}`] ?? ''}
                              onChange={e => setRejectNotes(p => ({ ...p, [`${p.userId}:${p.projectId}`]: e.target.value }))}
                              placeholder="Feedback for revision..." className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                            />
                            <button onClick={() => handleReject(p.projectId, p.userId)}
                              disabled={actionLoading === `reject:${p.userId}:${p.projectId}`}
                              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold"
                            >{actionLoading === `reject:${p.userId}:${p.projectId}` ? '…' : 'Send'}</button>
                            <button onClick={() => setRejectOpen(null)} className="text-xs text-slate-500 hover:text-slate-300">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setRejectOpen(`${p.userId}:${p.projectId}`)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-400 text-xs font-semibold transition-colors"
                          ><XCircle size={14} /> Request Changes</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {tab === 'courses' && (
              <div className="grid md:grid-cols-2 gap-4">
                {courses.map(c => (
                  <div key={c.slug} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                    <h3 className="text-sm font-bold text-white">{COURSE_LABELS[c.slug] ?? c.slug}</h3>
                    <div className="flex items-center gap-4 mt-3 text-xs">
                      <div><span className="text-slate-400">Lectures:</span> <span className="text-white font-semibold">{c.totalLectures}</span></div>
                      <div><span className="text-slate-400">Enrolled:</span> <span className="text-blue-400 font-semibold">{c.studentsEnrolled}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'certifications' && (
              eligible.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-500">
                  <GraduationCap size={28} className="mx-auto mb-2 text-slate-600" />
                  No students eligible for certificates yet.
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-left text-xs text-slate-500 uppercase tracking-wider">
                        <th className="px-5 py-3 font-medium">Student</th>
                        <th className="px-5 py-3 font-medium">Course</th>
                        <th className="px-5 py-3 font-medium">Avg Quiz</th>
                        <th className="px-5 py-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {eligible.map(e => {
                        const key = `cert:${e.userId}:${e.courseSlug}`;
                        return (
                          <tr key={key} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors">
                            <td className="px-5 py-3"><p className="font-medium text-white text-xs">{e.name}</p><p className="text-[10px] text-slate-500">{e.email}</p></td>
                            <td className="px-5 py-3 text-xs text-slate-300">{COURSE_LABELS[e.courseSlug] ?? e.courseSlug}</td>
                            <td className="px-5 py-3 text-xs text-slate-300">{e.avgQuizScore !== null ? `${e.avgQuizScore}%` : '—'}</td>
                            <td className="px-5 py-3 text-right">
                              <button onClick={() => handleIssueCert(e.userId, e.courseSlug)}
                                disabled={actionLoading === key}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
                              >{actionLoading === key ? 'Issuing…' : 'Issue Certificate'}</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {tab === 'assessments' && (
              assessments.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-500">
                  <Brain size={28} className="mx-auto mb-2 text-slate-600" />
                  No assessment submissions yet.
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-left text-[10px] text-slate-500 uppercase tracking-wider">
                        <th className="px-4 py-3 font-medium">Student</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Score</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Attempts</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.map(a => (
                        <tr key={a.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3"><p className="font-medium text-white text-xs">{a.user.name}</p><p className="text-[10px] text-slate-500">{a.user.email}</p></td>
                          <td className="px-4 py-3 text-xs text-slate-300">{a.category} — {a.subsection}</td>
                          <td className="px-4 py-3 text-xs text-slate-300">{a.score}/{a.totalQuestions}</td>
                          <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.status === 'passed' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'}`}>{a.status}</span></td>
                          <td className="px-4 py-3 text-xs text-slate-300">{a.attempts}</td>
                          <td className="px-4 py-3 text-[10px] text-slate-500">{new Date(a.lastAttemptAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
