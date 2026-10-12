import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../authClient";
import { COURSE_FULL_NAMES } from "../data/courseNames";
import {
  BookOpen, Plus, Search, X, Edit3, Trash2, Archive, Globe,
  CheckCircle2, AlertTriangle, BarChart3, Target, Lightbulb, HelpCircle,
  ListChecks, Clock, Brain, Code,
  Save, Loader2, Eye
} from "lucide-react";

// ── Types ──

type ExerciseType = "ai" | "coding";
type ExerciseStatus = "draft" | "published" | "archived";
type Difficulty = "beginner" | "intermediate" | "advanced";

interface PracticeExercise {
  id: string;
  courseId: string;
  lectureId: string;
  sectionId: string | null;
  title: string;
  type: ExerciseType;
  status: ExerciseStatus;
  learningGoal: string;
  challenge: string;
  promptHint: string;
  validationRules: string[];
  completionCriteria: string[];
  difficulty: Difficulty;
  estimatedTime: number | null;
  systemInstruction: string | null;
  aiWorkspaceEnabled: boolean;
  suggestedPrompt: string | null;
  aiResponseEvalCriteria: string[];
  reflectionRequirements: string[];
  aiCompletionRequirements: string[];
  starterCode: string | null;
  expectedOutput: string | null;
  testCases: { input: string; expected: string }[];
  inputValues: string | null;
  hints: string[];
  solutionCode: string | null;
  attemptCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Analytics {
  exerciseId: string;
  totalAttempts: number;
  uniqueUsers: number;
  completionRate: number;
  averageAttempts: number;
  averageTimeSpent: number | null;
  hintUsageRate: number;
  failureRate: number;
  mostCommonFailures: { reason: string; count: number }[];
}

interface ConnectivityCheck {
  exerciseId: string;
  alignment: "strong" | "moderate" | "weak";
  warnings: { section: string; message: string; severity: "low" | "medium" | "high" }[];
  sections: { learningObjective: string; challenge: string; hint: string };
}

interface GlobalAnalytics {
  totalExercises: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  totalAttempts: number;
  passedAttempts: number;
  overallPassRate: number;
}

interface CourseRef {
  slug: string;
  title: string;
}

// ── Helpers ──

const EMPTY_EXERCISE: PracticeExercise = {
  id: "", courseId: "fundamentals-of-ai", lectureId: "0", sectionId: null,
  title: "", type: "ai", status: "draft",
  learningGoal: "", challenge: "", promptHint: "",
  validationRules: [], completionCriteria: [],
  difficulty: "beginner", estimatedTime: 10,
  systemInstruction: null, aiWorkspaceEnabled: true, suggestedPrompt: null,
  aiResponseEvalCriteria: [], reflectionRequirements: [],
  aiCompletionRequirements: [], starterCode: null,
  expectedOutput: null, testCases: [], inputValues: null,
  hints: [], solutionCode: null, createdAt: "", updatedAt: "",
};

const COURSE_LABELS: Record<string, string> = COURSE_FULL_NAMES;

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-900/30 border-emerald-700/40",
  intermediate: "text-amber-400 bg-amber-900/30 border-amber-700/40",
  advanced: "text-red-400 bg-red-900/30 border-red-700/40",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "text-slate-400 bg-slate-800/60 border-slate-700/50",
  published: "text-emerald-400 bg-emerald-900/30 border-emerald-700/40",
  archived: "text-amber-400 bg-amber-900/30 border-amber-700/40",
};

// ── Tabs ──

type Tab = "library" | "editor" | "analytics" | "connectivity";

// ── Main Component ──

export default function AdminPracticeExercisesPage() {
  const [tab, setTab] = useState<Tab>("library");
  const [exercises, setExercises] = useState<PracticeExercise[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterLecture, setFilterLecture] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");

  // Editor
  const [editExercise, setEditExercise] = useState<PracticeExercise>(EMPTY_EXERCISE);
  const [isNew, setIsNew] = useState(false);

  // Analytics
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [globalAnalytics, setGlobalAnalytics] = useState<GlobalAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Connectivity
  const [connectivity, setConnectivity] = useState<ConnectivityCheck | null>(null);
  const [connLoading, setConnLoading] = useState(false);

  // Course/lecture refs
  const [courseLectureMap, setCourseLectureMap] = useState<Record<string, { number: number; title: string }[]>>({});
  const [courseList, setCourseList] = useState<CourseRef[]>([]);

  // ── Data Fetching ──

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCourse) params.set("courseId", filterCourse);
      if (filterLecture) params.set("lectureId", filterLecture);
      if (filterStatus) params.set("status", filterStatus);
      if (filterType) params.set("type", filterType);
      if (search.trim()) params.set("search", search.trim());
      const data = await authFetch<{ exercises: PracticeExercise[]; total: number }>(
        `/admin/practice-exercises/configs?${params}`
      );
      setExercises(data.exercises);
      setTotal(data.total);
    } catch { setError("Failed to load exercises"); }
    finally { setLoading(false); }
  }, [search, filterCourse, filterLecture, filterStatus, filterType]);

  const fetchCourseRefs = useCallback(async () => {
    try {
      const data = await authFetch<{ courses: CourseRef[]; courseLectureMap: Record<string, { number: number; title: string }[]> }>(
        "/admin/practice-exercises/course-lectures"
      );
      setCourseList(data.courses);
      setCourseLectureMap(data.courseLectureMap);
    } catch {}
  }, []);

  const fetchAnalytics = useCallback(async (exerciseId: string) => {
    setAnalyticsLoading(true);
    try {
      const [aData, gData] = await Promise.all([
        authFetch<Analytics>(`/admin/practice-exercises/analytics/${exerciseId}`),
        authFetch<GlobalAnalytics>("/admin/practice-exercises/analytics"),
      ]);
      setAnalytics(aData);
      setGlobalAnalytics(gData);
    } catch { setError("Failed to load analytics"); }
    finally { setAnalyticsLoading(false); }
  }, []);

  const fetchConnectivity = useCallback(async (exerciseId: string) => {
    setConnLoading(true);
    try {
      const data = await authFetch<ConnectivityCheck>(
        `/admin/practice-exercises/connectivity-check/${exerciseId}`
      );
      setConnectivity(data);
    } catch { setError("Failed to check connectivity"); }
    finally { setConnLoading(false); }
  }, []);

  useEffect(() => {
    fetchExercises();
    fetchCourseRefs();
  }, [fetchExercises, fetchCourseRefs]);

  // ── Actions ──

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const body = { ...editExercise };
      if (isNew) {
        const data = await authFetch<{ exercise: PracticeExercise }>(
          "/admin/practice-exercises/configs", {
            method: "POST",
            body: JSON.stringify(body),
          }
        );
        setEditExercise(data.exercise);
        setIsNew(false);
        setSuccess("Exercise created");
      } else {
        await authFetch<{ exercise: PracticeExercise }>(
          `/admin/practice-exercises/configs/${editExercise.id}`, {
            method: "PUT",
            body: JSON.stringify(body),
          }
        );
        setSuccess("Exercise updated");
      }
      fetchExercises();
    } catch { setError("Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exercise and all its attempt records?")) return;
    try {
      await authFetch(`/admin/practice-exercises/configs/${id}`, { method: "DELETE" });
      if (editExercise.id === id) { setEditExercise(EMPTY_EXERCISE); setTab("library"); }
      fetchExercises();
    } catch { setError("Delete failed"); }
  };

  const handleStatusChange = async (id: string, status: ExerciseStatus) => {
    try {
      await authFetch(`/admin/practice-exercises/configs/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (editExercise.id === id) setEditExercise({ ...editExercise, status });
      fetchExercises();
    } catch { setError("Status change failed"); }
  };

  const handleEdit = (exercise: PracticeExercise) => {
    setEditExercise(exercise);
    setIsNew(false);
    setTab("editor");
  };

  const handleNew = () => {
    setEditExercise({ ...EMPTY_EXERCISE, courseId: filterCourse || "fundamentals-of-ai" });
    setIsNew(true);
    setTab("editor");
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditExercise((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayField = (field: string, index: number, value: string) => {
    setEditExercise((prev) => {
      const arr = [...((prev as any)[field] || [])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handleArrayFieldAdd = (field: string) => {
    setEditExercise((prev) => ({
      ...prev,
      [field]: [...((prev as any)[field] || []), ""],
    }));
  };

  const handleArrayFieldRemove = (field: string, index: number) => {
    setEditExercise((prev) => {
      const arr = [...((prev as any)[field] || [])];
      arr.splice(index, 1);
      return { ...prev, [field]: arr };
    });
  };

  // ── UI helpers ──

  const lectures = courseLectureMap[editExercise.courseId] || [];
  const availableLectures = filterCourse
    ? (courseLectureMap[filterCourse] || [])
    : [];

  return (
    <div className="min-h-screen bg-[#0B0F17]">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/60 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="text-purple-400" size={22} />
              Practice Exercises Management
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {total} exercises · {globalAnalytics?.totalAttempts || 0} total attempts · {globalAnalytics?.overallPassRate || 0}% pass rate
            </p>
          </div>
          <button onClick={handleNew}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-all">
            <Plus size={14} /> New Exercise
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700/30 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex gap-0">
          {([["library", "Library", BookOpen], ["editor", "Editor", Edit3], ["analytics", "Analytics", BarChart3], ["connectivity", "Connectivity", AlertTriangle]] as [Tab, string, any][]).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
                tab === id
                  ? "text-purple-300 border-purple-500 bg-purple-600/10"
                  : "text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-600"
              }`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Notifications */}
        {error && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-900/20 border border-red-700/30 text-sm text-red-300">
            <AlertTriangle size={14} /> {error}
            <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-900/20 border border-emerald-700/30 text-sm text-emerald-300">
            <CheckCircle2 size={14} /> {success}
            <button onClick={() => setSuccess(null)} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        {/* ── LIBRARY TAB ── */}
        {tab === "library" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" placeholder="Search exercises..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs" />
              </div>
              <select value={filterCourse} onChange={e => { setFilterCourse(e.target.value); setFilterLecture(""); }}
                className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs">
                <option value="">All Courses</option>
                {courseList.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
              </select>
              {filterCourse && (
                <select value={filterLecture} onChange={e => setFilterLecture(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs">
                  <option value="">All Lectures</option>
                  {availableLectures.map(l => (
                    <option key={l.number} value={String(l.number)}>{l.title}</option>
                  ))}
                </select>
              )}
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs">
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs">
                <option value="">All Types</option>
                <option value="ai">AI Practice</option>
                <option value="coding">Coding Practice</option>
              </select>
              {(search || filterCourse || filterLecture || filterStatus || filterType) && (
                <button onClick={() => { setSearch(""); setFilterCourse(""); setFilterLecture(""); setFilterStatus(""); setFilterType(""); }}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 text-xs hover:text-slate-200">
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/60 border-b border-slate-700/50">
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase">Title</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase">Course</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase">Lecture</th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-400 uppercase">Type</th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-400 uppercase">Difficulty</th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-400 uppercase">Attempts</th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {loading ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center"><Loader2 size={24} className="animate-spin text-purple-400 mx-auto" /></td></tr>
                  ) : exercises.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500 text-xs">No exercises found</td></tr>
                  ) : exercises.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-800/40 cursor-pointer" onClick={() => handleEdit(ex)}>
                      <td className="px-4 py-3">
                        <div className="text-slate-200 text-xs font-medium">{ex.title}</div>
                        {ex.sectionId && <div className="text-[10px] text-slate-500">Section: {ex.sectionId}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-300">{COURSE_LABELS[ex.courseId] || ex.courseId}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">Lecture {ex.lectureId}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                          ex.type === "ai" ? "text-purple-400 bg-purple-900/30 border-purple-700/40" : "text-blue-400 bg-blue-900/30 border-blue-700/40"
                        }`}>
                          {ex.type === "ai" ? <Brain size={10} /> : <Code size={10} />}
                          {ex.type === "ai" ? "Fundamentals of AI" : "Coding"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border ${STATUS_COLORS[ex.status] || STATUS_COLORS.draft}`}>
                          {ex.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border ${DIFFICULTY_COLORS[ex.difficulty] || DIFFICULTY_COLORS.beginner}`}>
                          {ex.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-slate-400">{ex.attemptCount || 0}</td>
                      <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(ex)} className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-blue-300" title="Edit"><Edit3 size={12} /></button>
                          <button onClick={() => { setTab("analytics"); fetchAnalytics(ex.id); }} className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-emerald-300" title="Analytics"><BarChart3 size={12} /></button>
                          <button onClick={() => { setTab("connectivity"); fetchConnectivity(ex.id); }} className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-amber-300" title="Connectivity Check"><AlertTriangle size={12} /></button>
                          {ex.status === "published" ? (
                            <button onClick={() => handleStatusChange(ex.id, "archived")} className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-amber-300" title="Archive"><Archive size={12} /></button>
                          ) : ex.status === "draft" ? (
                            <button onClick={() => handleStatusChange(ex.id, "published")} className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-emerald-300" title="Publish"><Globe size={12} /></button>
                          ) : (
                            <button onClick={() => handleStatusChange(ex.id, "draft")} className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-300" title="Draft"><Eye size={12} /></button>
                          )}
                          <button onClick={() => handleDelete(ex.id)} className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-red-300" title="Delete"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── EDITOR TAB ── */}
        {tab === "editor" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main editor */}
            <div className="lg:col-span-2 space-y-5">
              {/* Basic info */}
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit3 size={14} className="text-purple-400" /> {isNew ? "New Exercise" : "Edit Exercise"}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Title</label>
                    <input type="text" value={editExercise.title}
                      onChange={e => handleFieldChange("title", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Type</label>
                    <select value={editExercise.type} onChange={e => handleFieldChange("type", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs">
                      <option value="ai">AI Practice</option>
                      <option value="coding">Coding Practice</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Course</label>
                    <select value={editExercise.courseId} onChange={e => handleFieldChange("courseId", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs">
                      {courseList.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Lecture</label>
                    <select value={editExercise.lectureId} onChange={e => handleFieldChange("lectureId", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs">
                      {lectures.map(l => (
                        <option key={l.number} value={String(l.number)}>{l.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Section ID (optional)</label>
                    <input type="text" value={editExercise.sectionId || ""} placeholder="e.g. what-is-ai"
                      onChange={e => handleFieldChange("sectionId", e.target.value || null)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Difficulty</label>
                      <select value={editExercise.difficulty} onChange={e => handleFieldChange("difficulty", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Est. Time (min)</label>
                      <input type="number" value={editExercise.estimatedTime || ""} min={1}
                        onChange={e => handleFieldChange("estimatedTime", e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Core content */}
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-4">
                <h3 className="text-xs font-bold text-white flex items-center gap-2"><Target size={12} className="text-blue-400" /> Core Content</h3>
                <div>
                  <label className="block text-[10px] font-semibold text-blue-400 uppercase mb-1">What You'll Learn (Learning Objective)</label>
                  <textarea value={editExercise.learningGoal} rows={2}
                    onChange={e => handleFieldChange("learningGoal", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs resize-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-amber-400 uppercase mb-1">Your Challenge</label>
                  <textarea value={editExercise.challenge} rows={2}
                    onChange={e => handleFieldChange("challenge", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs resize-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-violet-400 uppercase mb-1">Prompt Hint</label>
                  <textarea value={editExercise.promptHint} rows={2}
                    onChange={e => handleFieldChange("promptHint", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs resize-none" />
                </div>
              </div>

              {/* Validation & Completion */}
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-4">
                <h3 className="text-xs font-bold text-white flex items-center gap-2"><ListChecks size={12} className="text-emerald-400" /> Validation & Completion</h3>
                {["validationRules", "completionCriteria"].map((field) => (
                  <div key={field}>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      {field === "validationRules" ? "Validation Rules" : "Completion Criteria"}
                    </label>
                    {((editExercise as any)[field] || []).map((item: string, i: number) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input type="text" value={item}
                          onChange={e => handleArrayField(field, i, e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs" />
                        <button onClick={() => handleArrayFieldRemove(field, i)}
                          className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-red-300"><X size={12} /></button>
                      </div>
                    ))}
                    <button onClick={() => handleArrayFieldAdd(field)}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200">
                      <Plus size={10} /> Add {field === "validationRules" ? "rule" : "criterion"}
                    </button>
                  </div>
                ))}
              </div>

              {/* AI-specific fields */}
              {editExercise.type === "ai" && (
                <div className="rounded-xl border border-purple-700/30 bg-purple-900/10 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-purple-300 flex items-center gap-2"><Brain size={12} /> AI Practice Configuration</h3>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input type="checkbox" checked={editExercise.aiWorkspaceEnabled}
                        onChange={e => handleFieldChange("aiWorkspaceEnabled", e.target.checked)}
                        className="rounded bg-slate-800 border-slate-600" />
                      AI Workspace Enabled
                    </label>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">System Instruction (AI behavior prompt)</label>
                    <textarea value={editExercise.systemInstruction || ""} rows={4}
                      onChange={e => handleFieldChange("systemInstruction", e.target.value || null)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs resize-none font-mono"
                      placeholder="You are an AI tutor. Answer factually in 2-4 short sentences..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Suggested Prompt</label>
                    <textarea value={editExercise.suggestedPrompt || ""} rows={2}
                      onChange={e => handleFieldChange("suggestedPrompt", e.target.value || null)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs resize-none" />
                  </div>
                  {["aiResponseEvalCriteria", "reflectionRequirements", "aiCompletionRequirements"].map((field) => (
                    <div key={field}>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                        {field === "aiResponseEvalCriteria" ? "AI Response Evaluation Criteria" :
                         field === "reflectionRequirements" ? "Reflection Requirements" : "Completion Requirements"}
                      </label>
                      {((editExercise as any)[field] || []).map((item: string, i: number) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <input type="text" value={item}
                            onChange={e => handleArrayField(field, i, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs" />
                          <button onClick={() => handleArrayFieldRemove(field, i)}
                            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-red-300"><X size={12} /></button>
                        </div>
                      ))}
                      <button onClick={() => handleArrayFieldAdd(field)}
                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200">
                        <Plus size={10} /> Add
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Coding-specific fields */}
              {editExercise.type === "coding" && (
                <div className="rounded-xl border border-blue-700/30 bg-blue-900/10 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-blue-300 flex items-center gap-2"><Code size={12} /> Coding Practice Configuration</h3>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Starter Code</label>
                    <textarea value={editExercise.starterCode || ""} rows={4}
                      onChange={e => handleFieldChange("starterCode", e.target.value || null)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs font-mono resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Expected Output</label>
                    <textarea value={editExercise.expectedOutput || ""} rows={2}
                      onChange={e => handleFieldChange("expectedOutput", e.target.value || null)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-emerald-300 text-xs font-mono resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Input Values</label>
                    <input type="text" value={editExercise.inputValues || ""}
                      onChange={e => handleFieldChange("inputValues", e.target.value || null)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Test Cases</label>
                    {(editExercise.testCases || []).map((tc, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input type="text" placeholder="Input" value={tc.input}
                          onChange={e => {
                            const tcs = [...(editExercise.testCases || [])];
                            tcs[i] = { ...tcs[i], input: e.target.value };
                            handleFieldChange("testCases", tcs);
                          }}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs" />
                        <input type="text" placeholder="Expected" value={tc.expected}
                          onChange={e => {
                            const tcs = [...(editExercise.testCases || [])];
                            tcs[i] = { ...tcs[i], expected: e.target.value };
                            handleFieldChange("testCases", tcs);
                          }}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-emerald-300 text-xs" />
                        <button onClick={() => {
                          const tcs = [...(editExercise.testCases || [])];
                          tcs.splice(i, 1);
                          handleFieldChange("testCases", tcs);
                        }} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-red-300"><X size={12} /></button>
                      </div>
                    ))}
                    <button onClick={() => handleFieldChange("testCases", [...(editExercise.testCases || []), { input: "", expected: "" }])}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200">
                      <Plus size={10} /> Add Test Case
                    </button>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Hints</label>
                    {(editExercise.hints || []).map((hint, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input type="text" value={hint}
                          onChange={e => handleArrayField("hints", i, e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs" />
                        <button onClick={() => handleArrayFieldRemove("hints", i)}
                          className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-red-300"><X size={12} /></button>
                      </div>
                    ))}
                    <button onClick={() => handleArrayFieldAdd("hints")}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200">
                      <Plus size={10} /> Add Hint
                    </button>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Solution Code</label>
                    <textarea value={editExercise.solutionCode || ""} rows={4}
                      onChange={e => handleFieldChange("solutionCode", e.target.value || null)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-emerald-300 text-xs font-mono resize-none" />
                  </div>
                </div>
              )}

              {/* Save */}
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving || !editExercise.title}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-white px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 transition-all">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "Saving..." : isNew ? "Create Exercise" : "Save Changes"}
                </button>
                <button onClick={() => setTab("library")}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 px-5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/50 transition-all">
                  Cancel
                </button>
              </div>
            </div>

            {/* Preview panel */}
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 sticky top-4">
                <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                  <Eye size={12} className="text-slate-400" /> Student Preview
                </h3>
                {editExercise.title ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600/10 to-slate-800/40 border border-blue-500/20">
                      <p className="text-[10px] font-semibold text-blue-400 uppercase mb-1">What You'll Learn</p>
                      <p className="text-xs text-slate-200 leading-relaxed">{editExercise.learningGoal || "(not set)"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-amber-600/10 to-slate-800/40 border border-amber-500/20">
                      <p className="text-[10px] font-semibold text-amber-400 uppercase mb-1">Your Challenge</p>
                      <p className="text-xs text-slate-200 leading-relaxed">{editExercise.challenge || "(not set)"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-violet-600/10 to-slate-800/40 border border-violet-500/20">
                      <p className="text-[10px] font-semibold text-violet-400 uppercase mb-1">Prompt Hint</p>
                      <p className="text-xs text-violet-300/90 leading-relaxed">{editExercise.promptHint || "(not set)"}</p>
                    </div>
                    {editExercise.estimatedTime && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <Clock size={10} /> {editExercise.estimatedTime} min
                      </div>
                    )}
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border ${DIFFICULTY_COLORS[editExercise.difficulty]}`}>
                      {editExercise.difficulty}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Fill in the fields to see a preview</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === "analytics" && (
          <div className="space-y-6">
            {/* Global stats */}
            {globalAnalytics && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 text-center">
                  <div className="text-lg font-bold text-slate-200">{globalAnalytics.totalExercises}</div>
                  <div className="text-[10px] text-slate-400 uppercase">Exercises</div>
                </div>
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 text-center">
                  <div className="text-lg font-bold text-purple-300">{globalAnalytics.byType?.ai || 0}</div>
                  <div className="text-[10px] text-slate-400 uppercase">AI Practices</div>
                </div>
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 text-center">
                  <div className="text-lg font-bold text-blue-300">{globalAnalytics.byType?.coding || 0}</div>
                  <div className="text-[10px] text-slate-400 uppercase">Coding Practices</div>
                </div>
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 text-center">
                  <div className="text-lg font-bold text-amber-300">{globalAnalytics.totalAttempts}</div>
                  <div className="text-[10px] text-slate-400 uppercase">Total Attempts</div>
                </div>
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 text-center">
                  <div className="text-lg font-bold text-emerald-300">{globalAnalytics.overallPassRate}%</div>
                  <div className="text-[10px] text-slate-400 uppercase">Pass Rate</div>
                </div>
              </div>
            )}

            {/* Select exercise + per-exercise analytics */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 size={14} className="text-emerald-400" /> Exercise Analytics
              </h2>
              <div className="flex gap-3">
                <select onChange={e => e.target.value && fetchAnalytics(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs">
                  <option value="">Select an exercise...</option>
                  {exercises.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.title} ({COURSE_LABELS[ex.courseId] || ex.courseId})</option>
                  ))}
                </select>
                {analytics && (
                  <button onClick={() => fetchAnalytics(analytics.exerciseId)}
                    className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200">
                    <Loader2 size={14} className={analyticsLoading ? "animate-spin" : ""} />
                  </button>
                )}
              </div>

              {analyticsLoading ? (
                <div className="py-8 text-center"><Loader2 size={24} className="animate-spin text-purple-400 mx-auto" /></div>
              ) : analytics ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg bg-slate-800/40 border border-slate-700/30 p-3 text-center">
                      <div className="text-lg font-bold text-slate-200">{analytics.completionRate}%</div>
                      <div className="text-[10px] text-slate-400 uppercase">Completion Rate</div>
                    </div>
                    <div className="rounded-lg bg-slate-800/40 border border-slate-700/30 p-3 text-center">
                      <div className="text-lg font-bold text-slate-200">{analytics.averageAttempts}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Avg Attempts</div>
                    </div>
                    <div className="rounded-lg bg-slate-800/40 border border-slate-700/30 p-3 text-center">
                      <div className="text-lg font-bold text-slate-200">
                        {analytics.averageTimeSpent ? `${Math.round(analytics.averageTimeSpent / 60)}m` : "—"}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase">Avg Time</div>
                    </div>
                    <div className="rounded-lg bg-slate-800/40 border border-slate-700/30 p-3 text-center">
                      <div className="text-lg font-bold text-slate-200">{analytics.hintUsageRate}%</div>
                      <div className="text-[10px] text-slate-400 uppercase">Hint Usage</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-slate-800/40 border border-slate-700/30 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-red-300">{analytics.failureRate}%</span>
                        <span className="text-[10px] text-slate-400 uppercase">Failure Rate</span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${analytics.failureRate}%` }} />
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-800/40 border border-slate-700/30 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-blue-300">{analytics.uniqueUsers}</span>
                        <span className="text-[10px] text-slate-400 uppercase">Unique Students</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{analytics.totalAttempts} total attempts</div>
                    </div>
                  </div>
                  {analytics.mostCommonFailures.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-semibold text-slate-400 uppercase mb-2">Most Common Validation Failures</h4>
                      <div className="space-y-1">
                        {analytics.mostCommonFailures.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
                            <span className="text-xs font-mono text-slate-300 flex-1">{f.reason}</span>
                            <span className="text-xs font-bold text-red-300">{f.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">Select an exercise to view analytics</p>
              )}
            </div>
          </div>
        )}

        {/* ── CONNECTIVITY VALIDATION TAB ── */}
        {tab === "connectivity" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-400" /> Connectivity Validation
                </h2>
                <select onChange={e => e.target.value && fetchConnectivity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs">
                  <option value="">Select an exercise...</option>
                  {exercises.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.title} ({COURSE_LABELS[ex.courseId] || ex.courseId})</option>
                  ))}
                </select>

                {connLoading ? (
                  <div className="py-8 text-center"><Loader2 size={24} className="animate-spin text-purple-400 mx-auto" /></div>
                ) : connectivity ? (
                  <div className="space-y-5">
                    {/* Alignment badge */}
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                      connectivity.alignment === "strong" ? "bg-emerald-900/20 border-emerald-700/30 text-emerald-300" :
                      connectivity.alignment === "weak" ? "bg-red-900/20 border-red-700/30 text-red-300" :
                      "bg-amber-900/20 border-amber-700/30 text-amber-300"
                    }`}>
                      {connectivity.alignment === "strong" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                      <span className="text-xs font-semibold">
                        Alignment: {connectivity.alignment.charAt(0).toUpperCase() + connectivity.alignment.slice(1)}
                      </span>
                    </div>

                    {/* Warnings */}
                    {connectivity.warnings.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-semibold text-slate-400 uppercase">Warnings ({connectivity.warnings.length})</h4>
                        {connectivity.warnings.map((w, i) => (
                          <div key={i} className={`p-3 rounded-xl border ${
                            w.severity === "high" ? "bg-red-900/20 border-red-700/30" :
                            w.severity === "medium" ? "bg-amber-900/20 border-amber-700/30" :
                            "bg-slate-800/60 border-slate-700/50"
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold uppercase ${
                                w.severity === "high" ? "text-red-400" :
                                w.severity === "medium" ? "text-amber-400" : "text-slate-400"
                              }`}>{w.severity}</span>
                              <span className="text-[10px] font-semibold text-slate-400">{w.section}</span>
                            </div>
                            <p className="text-xs text-slate-300">{w.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-900/20 border border-emerald-700/30 text-center">
                        <CheckCircle2 size={20} className="text-emerald-400 mx-auto mb-1" />
                        <p className="text-xs text-emerald-300">All sections are well-aligned. No warnings.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">Select an exercise to check connectivity</p>
                )}
              </div>
            </div>

            {/* Side-by-side section viewer */}
            {connectivity && (
              <div className="space-y-3">
                <div className="rounded-xl border border-blue-500/20 bg-blue-900/10 p-4">
                  <p className="text-[10px] font-semibold text-blue-400 uppercase mb-1 flex items-center gap-1">
                    <Target size={10} /> Learning Objective
                  </p>
                  <p className="text-xs text-slate-200 leading-relaxed">{connectivity.sections.learningObjective}</p>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-900/10 p-4">
                  <p className="text-[10px] font-semibold text-amber-400 uppercase mb-1 flex items-center gap-1">
                    <Lightbulb size={10} /> Challenge
                  </p>
                  <p className="text-xs text-slate-200 leading-relaxed">{connectivity.sections.challenge}</p>
                </div>
                <div className="rounded-xl border border-violet-500/20 bg-violet-900/10 p-4">
                  <p className="text-[10px] font-semibold text-violet-400 uppercase mb-1 flex items-center gap-1">
                    <HelpCircle size={10} /> Hint
                  </p>
                  <p className="text-xs text-violet-300/90 leading-relaxed">{connectivity.sections.hint}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
