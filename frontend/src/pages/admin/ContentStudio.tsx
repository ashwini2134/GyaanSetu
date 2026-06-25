// Fraylon Admin - Phase 2
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, BookOpen, MoreVertical, Archive, CheckCircle2, Clock } from "lucide-react";
import { PublishChecklist } from "../../components/admin/PublishChecklist";
import { authFetch } from "../../authClient";

export default function ContentStudio() {
  const navigate = useNavigate();
  const [showPublishChecklist, setShowPublishChecklist] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await authFetch<any[]>(`/admin/courses?search=${encodeURIComponent(search)}&status=${filter}`);
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetchCourses, 300);
    return () => clearTimeout(debounce);
  }, [search, filter]);

  const handlePublish = async (courseId: string) => {
    try {
      await authFetch(`/admin/courses/${courseId}/publish`, { method: "PATCH" });
      setCourses(courses.map(c => c.id === courseId ? { ...c, status: "PUBLISHED" } : c));
      setShowPublishChecklist(null);
    } catch (err: any) {
      alert("Error publishing course: " + err.message);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Content Studio</h1>
          <p className="text-slate-400 mt-1">Create and manage your courses</p>
        </div>
        <button 
          onClick={() => navigate('/admin/content-studio/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 w-fit"
        >
          <Plus className="w-5 h-5" />
          Create New Course
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">Loading...</div>
      ) : courses.length === 0 && !search && filter === "All" ? (
        <div className="bg-slate-800/40 rounded-xl shadow-lg border border-slate-700/50 flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-blue-900/30 text-blue-400 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-slate-200 mb-2">No courses yet</h3>
          <p className="text-slate-400 text-center max-w-sm mb-6">
            Start building your first interactive learning experience with Fraylon Studio.
          </p>
          <button 
            onClick={() => navigate('/admin/content-studio/new')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm"
          >
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="flex flex-col flex-1 bg-slate-800/40 rounded-xl shadow-lg border border-slate-700/50 overflow-hidden min-h-0">
          {/* Controls */}
          <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row gap-4 justify-between bg-slate-800/50 shrink-0">
            <div className="relative max-w-md w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search courses..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-700/50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm bg-slate-900/50 text-slate-200 placeholder:text-slate-500"
              />
            </div>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-slate-700/50 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm bg-slate-900/50 text-slate-200 min-w-[150px]"
            >
              <option value="All">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-medium uppercase text-xs border-b border-slate-700/50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Lessons</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {courses.map(course => (
                  <tr key={course.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center text-blue-400 shrink-0 overflow-hidden border border-blue-500/20">
                          {course.thumbnailUrl ? (
                            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="w-5 h-5" />
                          )}
                        </div>
                        <span className="font-medium text-slate-200 line-clamp-1">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        course.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        course.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {course.status === 'PUBLISHED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {course.status === 'DRAFT' && <Clock className="w-3.5 h-3.5" />}
                        {course.status === 'ARCHIVED' && <Archive className="w-3.5 h-3.5" />}
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 font-medium">{course._count?.lessons || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/admin/content-studio/${course.id}/lessons`)}
                          className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Edit
                        </button>
                        {course.status === 'DRAFT' && (
                          <button 
                            onClick={() => setShowPublishChecklist(course.id)}
                            className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            Publish
                          </button>
                        )}
                        <button className="text-slate-500 hover:text-slate-300 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {courses.length === 0 && (search || filter !== "All") && (
              <div className="py-16 text-center text-slate-400">
                No courses found matching your search.
              </div>
            )}
          </div>
        </div>
      )}

      {showPublishChecklist && (
        <PublishChecklist 
          onClose={() => setShowPublishChecklist(null)} 
          onPublish={() => handlePublish(showPublishChecklist)} 
        />
      )}
    </div>
  );
}
