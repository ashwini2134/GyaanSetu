import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../authClient";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  Loader2,
  Users,
} from "lucide-react";

type Course = {
  slug: string;
  totalLectures: number;
  studentsEnrolled: number;
  completedLectures: number;
  avgProgress: number;
  completionRate: number;
};

type EnrolledStudent = {
  id: string; name: string; email: string; xp: number; status: string;
  completedLectures: number; quizzesPassed: number; progress: number;
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authFetch<{ courses: Course[] }>("/admin/courses");
      setCourses(data.courses);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const toggleCourse = async (slug: string) => {
    if (expandedCourse === slug) { setExpandedCourse(null); return; }
    setExpandedCourse(slug);
    setStudentsLoading(true);
    try {
      const data = await authFetch<{ students: EnrolledStudent[] }>(`/admin/courses/${slug}`);
      setStudents(data.students);
    } catch {} finally { setStudentsLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-blue-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-blue-400" size={24} />
          Course Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">{courses.length} courses</p>
      </div>

      {/* Course cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map(c => (
          <div key={c.slug}
            className="rounded-xl border border-slate-700/50 bg-slate-900/60 overflow-hidden transition-all duration-200 hover:border-slate-600/50">
            <button onClick={() => toggleCourse(c.slug)}
              className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-800/30 transition-colors">
              <div className="p-3 rounded-xl bg-blue-900/30 border border-blue-500/20 flex-shrink-0">
                <GraduationCap size={24} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-200 capitalize">{c.slug}</h3>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Users size={14} />{c.studentsEnrolled} enrolled</span>
                  <span className="flex items-center gap-1"><BookOpen size={14} />{c.totalLectures} lectures</span>
                  <span className="flex items-center gap-1"><Clock size={14} />{c.completionRate}% completion</span>
                </div>
                {/* mini progress bar */}
                <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${c.avgProgress}%` }} />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{c.avgProgress}% avg progress</p>
              </div>
              {expandedCourse === c.slug ? <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                : <ChevronRight size={18} className="text-slate-400 flex-shrink-0" />}
            </button>

            {/* Expanded student list */}
            {expandedCourse === c.slug && (
              <div className="border-t border-slate-700/50">
                {studentsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-blue-400" /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-800/40">
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400 uppercase">Student</th>
                          <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-400 uppercase">Progress</th>
                          <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-400 uppercase">Lectures</th>
                          <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-400 uppercase">Quizzes</th>
                          <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-400 uppercase">XP</th>
                          <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-400 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {students.length === 0 ? (
                          <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No enrolled students</td></tr>
                        ) : students.map(s => (
                          <tr key={s.id} className="hover:bg-slate-800/30">
                            <td className="px-4 py-2.5">
                              <div className="text-slate-200 text-xs font-medium">{s.name}</div>
                              <div className="text-[10px] text-slate-500">{s.email}</div>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2 justify-center">
                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.progress}%` }} />
                                </div>
                                <span className="text-xs text-slate-400 font-mono">{s.progress}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-center text-slate-300 font-mono text-xs">{s.completedLectures}/{courses.find(c => c.slug === expandedCourse)?.totalLectures || "?"}</td>
                            <td className="px-4 py-2.5 text-center text-slate-300 font-mono text-xs">{s.quizzesPassed}</td>
                            <td className="px-4 py-2.5 text-center text-blue-300 font-mono text-xs">{s.xp}</td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                s.status === "active" ? "bg-emerald-900/40 text-emerald-300" : "bg-red-900/40 text-red-300"
                              }`}>{s.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
