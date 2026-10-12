import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, BookOpen, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { CourseDetailPanel } from './CourseDetailPanel';
import { authFetch } from '../../../authClient';

export function CourseAnalyticsTab({ period }: { period: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [courseDetails, setCourseDetails] = useState<Record<string, any>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await authFetch(`/admin/analytics/courses?period=${period}`);
      setData(result);
    } catch (err) {
      console.error(err);
      setData({ error: err.message || "Failed to load" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetail = async (courseId: string) => {
    if (courseDetails[courseId]) return;
    try {
      const res = await fetch(`/api/admin/analytics/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await res.json();
      setCourseDetails(prev => ({ ...prev, [courseId]: result }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCourse = (courseId: string) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      fetchCourseDetail(courseId);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--text-secondary)]">Loading course analytics...</div>;
  }

  if (data?.error || !data?.summary || !data?.courses) {
    return (
      <div className="p-8 text-center text-red-400">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        {data?.error || "Failed to load course analytics"}
      </div>
    );
  }

  const { summary, courses } = data;
  
  const filteredCourses = (courses || []).filter((c: any) => 
    c?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Section 1 - Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Total Courses</div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">{summary.totalCourses}</div>
          <div className="text-sm text-[var(--text-muted)]">
            {summary.publishedCourses} published<br/>
            {summary.totalCourses - summary.publishedCourses} draft
          </div>
        </div>
        
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Avg Completion Rate</div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">{summary.avgCompletionRate}%</div>
          <div className="text-sm text-[var(--text-muted)]">across all<br/>courses</div>
        </div>
        
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Active Students <span className="text-xs">(last 7 days)</span></div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">{summary.activeStudents}</div>
          <div className="text-sm text-green-500 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> 12% this week
          </div>
        </div>
        
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Total Enrollments</div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">{summary.totalEnrollments.toLocaleString()}</div>
          <div className="text-sm text-[var(--text-muted)]">all time<br/>&nbsp;</div>
        </div>
      </div>

      {/* Section 2 - Course Analytics Table */}
      <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg overflow-hidden">
        <div className="p-5 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-surface)]">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-brand-navy)]">Per-Course Breakdown</h3>
            <p className="text-sm text-[var(--text-secondary)]">Click any course to see detailed analytics</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-light)]">
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium">Students</th>
                <th className="px-6 py-4 font-medium">Completion</th>
                <th className="px-6 py-4 font-medium">Avg Time</th>
                <th className="px-6 py-4 font-medium">Drop-Off</th>
                <th className="px-6 py-4 font-medium">Trend</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                    No courses found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course: any) => (
                  <React.Fragment key={course.id}>
                    <tr 
                      className={`hover:bg-[var(--bg-surface)] cursor-pointer transition-colors ${expandedCourse === course.id ? 'bg-[var(--bg-surface)] border-l-2 border-l-[var(--color-primary)]' : ''}`}
                      onClick={() => toggleCourse(course.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[var(--bg-dark-surface)] flex items-center justify-center overflow-hidden flex-shrink-0">
                            {course.thumbnailUrl ? (
                              <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen className="w-4 h-4 text-[var(--text-muted)]" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-[var(--text-main)] text-sm">{course.title}</div>
                            <div className="text-xs text-[var(--text-muted)] mt-0.5 px-1.5 py-0.5 bg-[var(--bg-dark-surface)] rounded inline-block">
                              {course.status.toLowerCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[var(--text-main)] text-sm">{course.enrolledCount.toLocaleString()}</div>
                        <div className="text-xs text-[var(--text-secondary)]">enrolled</div>
                        <div className="w-16 bg-[var(--bg-dark-surface)] rounded-full h-1 mt-1">
                          <div className="bg-[var(--color-primary)] h-1 rounded-full" style={{ width: `${Math.max(5, (course.enrolledCount / (summary.totalEnrollments || 1)) * 100)}%` }}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-bold text-sm ${course.completionRate > 70 ? 'text-green-500' : course.completionRate > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {course.completionRate}%
                        </div>
                        <div className="w-20 bg-[var(--bg-dark-surface)] rounded-full h-1.5 mt-1">
                          <div 
                            className={`h-1.5 rounded-full ${course.completionRate > 70 ? 'bg-green-500' : course.completionRate > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{ width: `${course.completionRate}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-main)]">
                        {course.avgCompletionDays} {typeof course.avgCompletionDays === 'number' && 'days'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-main)]">
                        <div className="flex items-center max-w-[150px] truncate">
                          {course.dropOffLesson !== '—' && <AlertTriangle className="w-3 h-3 text-yellow-500 mr-1.5 flex-shrink-0" />}
                          <span className="truncate" title={course.dropOffLesson}>{course.dropOffLesson}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {course.trend > 0 ? (
                          <div className="text-green-500 text-sm flex items-center">↑ +{course.trend}%<br/><span className="text-xs text-[var(--text-muted)] ml-1 hidden lg:inline">this week</span></div>
                        ) : course.trend < 0 ? (
                          <div className="text-red-500 text-sm flex items-center">↓ {course.trend}%<br/><span className="text-xs text-[var(--text-muted)] ml-1 hidden lg:inline">this week</span></div>
                        ) : (
                          <div className="text-gray-400 text-sm flex items-center">→ 0%<br/><span className="text-xs text-[var(--text-muted)] ml-1 hidden lg:inline">this week</span></div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {expandedCourse === course.id ? (
                          <ChevronUp className="w-5 h-5 text-[var(--text-muted)] inline-block" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[var(--text-muted)] inline-block" />
                        )}
                      </td>
                    </tr>
                    
                    {/* Section 3 - Course Detail Panel */}
                    {expandedCourse === course.id && (
                      <tr>
                        <td colSpan={7} className="p-0 border-b border-[var(--border-light)]">
                          {courseDetails[course.id] ? (
                            <CourseDetailPanel 
                              courseId={course.id}
                              funnel={courseDetails[course.id].lessonFunnel}
                              metrics={courseDetails[course.id].metrics}
                              recentActivity={courseDetails[course.id].recentActivity}
                            />
                          ) : (
                            <div className="p-8 text-center text-[var(--text-secondary)] bg-[var(--bg-surface)] border-l-4 border-l-[var(--color-primary)]">
                              Loading details...
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
