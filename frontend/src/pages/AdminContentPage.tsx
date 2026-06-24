import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../authClient";
import {
  BookOpen, Check, Edit3, FileText, Loader2, Plus, Save, Trash2,
} from "lucide-react";

type Course = {
  slug: string; title: string; description: string;
  level: string; category: string; language: string; lectureCount: number;
};

type Lecture = {
  number: number; title: string;
  hasLesson: boolean; hasProblems: boolean; hasQuiz: boolean; hasProject: boolean;
};

type CourseDetail = { course: Course; lectures: Lecture[] };

export default function AdminContentPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState(false);
  const [newLectureNum, setNewLectureNum] = useState("");
  const [newLectureTitle, setNewLectureTitle] = useState("");

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const d = await authFetch<{ courses: Course[] }>("/admin/content/courses");
      setCourses(d.courses);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const selectCourse = async (slug: string) => {
    setSelected(slug);
    setDetailLoading(true);
    setDetail(null);
    try {
      const d = await authFetch<CourseDetail>(`/admin/content/courses/${slug}`);
      setDetail(d);
    } catch {} finally { setDetailLoading(false); }
  };

  const saveCourse = async () => {
    if (!editCourse) return;
    try {
      await authFetch(`/admin/content/courses/${editCourse.slug}`, {
        method: "PUT", body: JSON.stringify(editCourse),
      });
      setEditCourse(null);
      await fetchCourses();
      if (selected) selectCourse(selected);
    } catch {}
  };

  const createCourse = async (slug: string, title: string) => {
    try {
      await authFetch("/admin/content/courses", {
        method: "POST", body: JSON.stringify({ slug, title }),
      });
      setNewCourse(false);
      await fetchCourses();
      selectCourse(slug);
    } catch {}
  };

  const addLecture = async () => {
    if (!selected || !newLectureNum || !newLectureTitle) return;
    try {
      await authFetch(`/admin/content/courses/${selected}/lectures`, {
        method: "POST", body: JSON.stringify({ number: parseInt(newLectureNum), title: newLectureTitle }),
      });
      setNewLectureNum("");
      setNewLectureTitle("");
      selectCourse(selected);
    } catch {}
  };

  const deleteLecture = async (num: number) => {
    if (!selected) return;
    try {
      await authFetch(`/admin/content/courses/${selected}/lectures/${num}`, { method: "DELETE" });
      selectCourse(selected);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-indigo-400" size={24} />
            Content Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">{courses.length} courses</p>
        </div>
        <button onClick={() => setNewCourse(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-sm font-medium hover:bg-indigo-600/30">
          <Plus size={16} /> New Course
        </button>
      </div>

      {/* New Course Modal */}
      {newCourse && <NewCourseModal onCreate={createCourse} onClose={() => setNewCourse(false)} />}

      {/* Edit Course Modal */}
      {editCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-700/50 bg-slate-900 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-200">Edit Course</h2>
            {(["title", "description", "level", "category", "language"] as const).map(f => (
              <div key={f}>
                <label className="text-xs text-slate-400 uppercase block mb-1">{f}</label>
                {f === "description" ? (
                  <textarea value={editCourse[f]} onChange={e => setEditCourse({ ...editCourse, [f]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700/50 text-slate-200 text-sm" rows={3} />
                ) : (
                  <input value={editCourse[f]} onChange={e => setEditCourse({ ...editCourse, [f]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700/50 text-slate-200 text-sm" />
                )}
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditCourse(null)} className="px-4 py-2 text-sm text-slate-400">Cancel</button>
              <button onClick={saveCourse} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/20 text-indigo-300 text-sm font-medium border border-indigo-500/30">
                <Save size={14} /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course List */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/50 text-sm font-medium text-slate-300">All Courses</div>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-indigo-400" /></div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No courses</div>
          ) : (
            courses.map(c => (
              <button key={c.slug} onClick={() => selectCourse(c.slug)}
                className={`w-full text-left px-4 py-3 border-b border-slate-700/30 hover:bg-slate-800/40 transition-colors ${selected === c.slug ? "bg-indigo-900/20 border-l-2 border-l-indigo-400" : ""}`}>
                <div className="text-sm font-medium text-slate-200">{c.title}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{c.slug} &middot; {c.lectureCount} lectures &middot; {c.level}</div>
              </button>
            ))
          )}
        </div>

        {/* Course Detail */}
        <div className="lg:col-span-2 space-y-4">
          {!selected && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-8 text-center text-slate-500">
              Select a course to manage
            </div>
          )}
          {detailLoading && (
            <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>
          )}
          {detail && !detailLoading && (
            <>
              {/* Course Metadata */}
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-bold text-slate-200">{detail.course.title}</h2>
                  <button onClick={() => setEditCourse({ ...detail.course })}
                    className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200">
                    <Edit3 size={14} />
                  </button>
                </div>
                <p className="text-sm text-slate-400">{detail.course.description}</p>
                <div className="flex gap-3 text-[10px] text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-800">{detail.course.level}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800">{detail.course.category}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800">{detail.course.language}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800">{detail.course.lectureCount} lectures</span>
                </div>
              </div>

              {/* Add Lecture */}
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Add Lecture</h3>
                <div className="flex gap-2">
                  <input type="number" placeholder="Number" value={newLectureNum}
                    onChange={e => setNewLectureNum(e.target.value)}
                    className="w-24 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700/50 text-slate-200 text-sm" />
                  <input type="text" placeholder="Lecture title" value={newLectureTitle}
                    onChange={e => setNewLectureTitle(e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700/50 text-slate-200 text-sm" />
                  <button onClick={addLecture} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600/20 text-indigo-300 text-sm border border-indigo-500/30 hover:bg-indigo-600/30">
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>

              {/* Lecture List */}
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-700/50 text-sm font-medium text-slate-300">Lectures</div>
                {detail.lectures.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">No lectures</div>
                ) : (
                  detail.lectures.map(l => (
                    <div key={l.number} className="px-4 py-3 border-b border-slate-700/30 flex items-center justify-between hover:bg-slate-800/40">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-500 w-6">L{l.number}</span>
                        <span className="text-sm text-slate-200">{l.title}</span>
                        <div className="flex gap-1">
                          {l.hasLesson && <FileText size={12} className="text-emerald-400" />}
                          {l.hasProblems && <Check size={12} className="text-blue-400" />}
                          {l.hasQuiz && <Check size={12} className="text-amber-400" />}
                        </div>
                      </div>
                      <button onClick={() => deleteLecture(l.number)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NewCourseModal({ onCreate, onClose }: { onCreate: (slug: string, title: string) => void; onClose: () => void }) {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-700/50 bg-slate-900 p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-200">New Course</h2>
        <div>
          <label className="text-xs text-slate-400 uppercase block mb-1">Slug</label>
          <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. python"
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700/50 text-slate-200 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-400 uppercase block mb-1">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Python Programming"
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700/50 text-slate-200 text-sm" />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400">Cancel</button>
          <button onClick={() => { if (slug && title) onCreate(slug, title); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/20 text-indigo-300 text-sm font-medium border border-indigo-500/30 disabled:opacity-50"
            disabled={!slug || !title}>
            <Plus size={14} /> Create
          </button>
        </div>
      </div>
    </div>
  );
}
