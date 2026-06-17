import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Course } from "../api";
import { CourseSearchFilters, NoResultsState, DynamicCourseIcon } from "../components";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.courses().then(setCourses).catch((e: Error) => setErr(e.message));
  }, []);

  return (
    <div className="w-full min-h-full p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1">Courses</h1>
        <p className="text-sm text-slate-400 mb-6">Choose a course to get started</p>

        {err && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-700/50 rounded-xl text-red-300 text-sm">
            {err}
          </div>
        )}

        {courses !== null && (
          <CourseSearchFilters
            courses={courses}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onFilteredCoursesChange={setFilteredCourses}
          />
        )}

        {courses === null ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-slate-800/40 animate-pulse border border-slate-700/20" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <NoResultsState query={searchQuery} onSelectSuggestion={setSearchQuery} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredCourses.map((course) => (
              <Link
                key={course.id}
                to={`/course/${course.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6 hover:border-blue-500/30 hover:bg-slate-800/60 hover:shadow-[0_0_24px_rgba(59,130,246,0.06)] transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <DynamicCourseIcon courseName={course.title} category={course.category} />

                    {/* Metadata Badges */}
                    <div className="flex gap-1.5">
                      <span className="inline-flex items-center justify-center whitespace-nowrap overflow-hidden text-ellipsis px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 leading-none">
                        {course.level}
                      </span>
                      <span className="inline-flex items-center justify-center whitespace-nowrap overflow-hidden text-ellipsis px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 border border-slate-700 text-slate-300 leading-none">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors mb-1">
                    {course.title}
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span>Language:</span>
                  <span className="text-slate-300 font-semibold">{course.language}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
