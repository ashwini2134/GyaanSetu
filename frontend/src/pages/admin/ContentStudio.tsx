// Fraylon Admin - Phase 2
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, BookOpen, MoreVertical, Archive, CheckCircle2, Clock } from "lucide-react";
import { PublishChecklist } from "../../components/admin/PublishChecklist";

export default function ContentStudio() {
  const navigate = useNavigate();
  const [showPublishChecklist, setShowPublishChecklist] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Mock data for Phase 2 UI
  const courses = [
    { id: "c1", title: "Full-Stack Web Development Bootcamp", status: "Published", enrolled: 1240, date: "Jun 16, 2025" },
    { id: "c2", title: "Advanced Machine Learning with Python", status: "Draft", enrolled: 0, date: "Jun 18, 2025" },
    { id: "c3", title: "UI/UX Design Masterclass", status: "Archived", enrolled: 350, date: "May 10, 2025" },
  ];

  const filteredCourses = courses.filter(c => {
    if (filter !== "All" && c.status !== filter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Content Studio</h1>
          <p className="text-slate-500 mt-1">Create and manage your courses</p>
        </div>
        <button 
          onClick={() => navigate('/admin/content-studio/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 w-fit"
        >
          <Plus className="w-5 h-5" />
          Create New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No courses yet</h3>
          <p className="text-slate-500 text-center max-w-sm mb-6">
            Start building your first interactive learning experience with Fraylon Studio.
          </p>
          <button 
            onClick={() => navigate('/admin/content-studio/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm"
          >
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="flex flex-col flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-0">
          {/* Controls */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 shrink-0">
            <div className="relative max-w-md w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search courses..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm bg-white min-w-[150px]"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Students</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map(course => (
                  <tr key={course.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-slate-900 line-clamp-1">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        course.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        course.status === 'Draft' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {course.status === 'Published' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {course.status === 'Draft' && <Clock className="w-3.5 h-3.5" />}
                        {course.status === 'Archived' && <Archive className="w-3.5 h-3.5" />}
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900 font-medium">{course.enrolled.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {course.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/admin/content-studio/${course.id}/lessons`)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Edit
                        </button>
                        {course.status === 'Draft' && (
                          <button 
                            onClick={() => setShowPublishChecklist(true)}
                            className="text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors"
                          >
                            Publish
                          </button>
                        )}
                        <button className="text-slate-400 hover:text-slate-600 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredCourses.length === 0 && (
              <div className="py-16 text-center text-slate-500">
                No courses found matching your search.
              </div>
            )}
          </div>
        </div>
      )}

      {showPublishChecklist && (
        <PublishChecklist 
          onClose={() => setShowPublishChecklist(false)} 
          onPublish={() => {
            alert("Course Published successfully!");
            setShowPublishChecklist(false);
          }} 
        />
      )}
    </div>
  );
}
