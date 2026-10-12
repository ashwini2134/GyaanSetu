import React, { useState, useEffect } from 'react';
import { Award, AlertTriangle, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { authFetch } from '../../../authClient';

export function CertificateAnalyticsTab({ period }: { period: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await authFetch(`/admin/analytics/certificates?period=${period}`);
      setData(result);
    } catch (err: any) {
      console.error(err);
      setData({ error: err.message || "Failed to load certificates analytics" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--text-secondary)]">Loading certificate analytics...</div>;
  }

  if (data?.error) {
    return (
      <div className="p-8 text-center text-red-400">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        {data.error}
      </div>
    );
  }

  const { summary, certificatesPerMonth, avgTimeToCompletion, certificateRateByCourse } = data;
  const filteredCourses = (certificateRateByCourse || []).filter((c: any) => 
    c?.courseName?.toLowerCase().includes(search.toLowerCase())
  );

  // If no data is available (Phase 3 not built)
  if (!summary || summary.totalCertificates === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[var(--border-light)] rounded-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--bg-body)] border border-[var(--border-light)] mb-4">
          <Award className="w-8 h-8 text-[var(--text-muted)]" />
        </div>
        <h3 className="text-lg font-medium text-[var(--color-brand-navy)] mb-2">No Certificates Issued Yet</h3>
        <p className="text-[var(--text-secondary)] max-w-md mx-auto">
          Certificate auto-generation has not processed any certificates for this period. 
          When students start completing courses with certification enabled, data will appear here.
        </p>
      </div>
    );
  }

  // Native Chart prep
  const maxCertCount = Math.max(...certificatesPerMonth.map((d: any) => d.count), 10); // floor of 10 for scaling
  
  return (
    <div className="space-y-6">
      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Total Certificates Issued</div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">{summary.totalCertificates.toLocaleString()}</div>
          <div className="text-sm text-[var(--text-muted)]">
            For selected period ({period})
          </div>
        </div>
        
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Avg. Time to Completion</div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">
            {summary.overallAvgDays !== null ? `${summary.overallAvgDays} days` : 'N/A'}
          </div>
          <div className="text-sm text-[var(--text-muted)]">From enrollment to certification</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5 lg:col-span-2">
          <h3 className="text-lg font-bold text-[var(--color-brand-navy)] mb-6">Certificates Issued per Month</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {certificatesPerMonth.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">No monthly data</div>
            ) : (
              certificatesPerMonth.map((item: any, i: number) => {
                const heightPct = Math.max((item.count / maxCertCount) * 100, 5);
                return (
                  <div key={i} className="flex flex-col items-center flex-1 group">
                    <div className="w-full relative flex justify-center h-full items-end pb-2">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[var(--bg-dark-surface)] text-[var(--text-main)] text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none border border-[var(--border-light)]">
                        {item.count} certificates
                      </div>
                      <div 
                        className="w-full max-w-[40px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-t-sm transition-all"
                        style={{ height: `${heightPct}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] transform -rotate-45 origin-top-left mt-2 truncate w-full text-center">
                      {item.month}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Fastest Courses (Avg Time) */}
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <h3 className="text-lg font-bold text-[var(--color-brand-navy)] mb-4">Time to Certification</h3>
          <div className="space-y-4">
            {avgTimeToCompletion.byCourse.length === 0 ? (
              <div className="text-[var(--text-muted)] text-sm">No course data available</div>
            ) : (
              [...avgTimeToCompletion.byCourse]
                .sort((a, b) => a.avgDays - b.avgDays)
                .slice(0, 5)
                .map((course: any, i: number) => (
                <div key={course.courseId} className="flex justify-between items-center p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-light)]">
                  <div className="flex items-center gap-3">
                    <div className="text-[var(--text-muted)] text-sm font-medium w-4">{i + 1}.</div>
                    <div className="text-sm font-medium text-[var(--text-main)] truncate max-w-[120px] xl:max-w-[150px]">{course.courseName}</div>
                  </div>
                  <div className="text-sm font-bold text-[var(--color-primary)]">{course.avgDays} days</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Course Certification Rate Table */}
      <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg overflow-hidden">
        <div className="p-5 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-surface)]">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-brand-navy)]">Certification Rate by Course</h3>
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
                <th className="px-6 py-4 font-medium">Enrolled</th>
                <th className="px-6 py-4 font-medium">Certified</th>
                <th className="px-6 py-4 font-medium">Cert. Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                    No course certification data found.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course: any) => (
                  <tr key={course.courseId} className="hover:bg-[var(--bg-surface)] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-[var(--text-main)]">{course.courseName}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{course.enrolledCount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{course.certifiedCount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-bold text-[var(--text-main)] w-10">{course.ratePercent}%</div>
                        <div className="w-24 bg-[var(--bg-dark-surface)] rounded-full h-1.5">
                          <div 
                            className="bg-[var(--color-primary)] h-1.5 rounded-full" 
                            style={{ width: `${course.ratePercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
