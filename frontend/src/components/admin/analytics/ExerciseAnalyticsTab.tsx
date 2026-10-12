import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { ExerciseDifficultyCard } from './ExerciseDifficultyCard';
import { MasteryDistributionChart } from './MasteryDistributionChart';
import { authFetch } from '../../../authClient';

export function ExerciseAnalyticsTab({ period }: { period: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [sortParam, setSortParam] = useState('retries');

  useEffect(() => {
    fetchData();
  }, [period, sortParam]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await authFetch(`/admin/analytics/exercises?period=${period}&sort=${sortParam}`);
      setData(result);
    } catch (err: any) {
      console.error(err);
      setData({ error: err.message || "Failed to load" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--text-secondary)]">Loading exercise analytics...</div>;
  }

  if (data?.error || !data?.summary || !data?.all) {
    return (
      <div className="p-8 text-center text-red-400">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        {data?.error || "Failed to load exercise analytics"}
      </div>
    );
  }

  const { summary, hardest, easiest, all, masteryDistribution } = data;

  const filteredExercises = (all || []).filter((ex: any) => {
    const matchesSearch = ex?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === 'All Courses' || ex?.courseName === courseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6">
      {/* Informational Banner */}
      <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-4 flex items-center gap-3">
        <div className="text-2xl">📊</div>
        <div className="text-sm text-[var(--text-secondary)]">
          Exercise attempt tracking is active. Data will populate as students practice.
        </div>
      </div>

      {/* Section 1 - Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Total Exercises</div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">{summary.totalExercises.toLocaleString()}</div>
          <div className="text-sm text-[var(--text-muted)]">across all courses</div>
        </div>
        
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Avg Mastery Rate</div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">{summary.avgMasteryRate}%</div>
          <div className="text-sm text-[var(--text-muted)]">platform wide</div>
        </div>
        
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Most Retried Exercise</div>
          <div className="text-xl font-bold text-[var(--color-brand-navy)] mb-2 truncate">
            {summary.mostRetried ? `"${summary.mostRetried.name}"` : '—'}
          </div>
          <div className="text-sm text-[var(--text-muted)]">
            {summary.mostRetried ? `${summary.mostRetried.avgAttempts} avg attempts` : 'No data yet'}
          </div>
        </div>
        
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Avg Attempts Per Exercise</div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">{summary.avgAttemptsPerExercise}x</div>
          <div className="text-sm text-[var(--text-muted)]">across platform</div>
        </div>
      </div>

      {/* Section 2 - Exercise Difficulty Leaderboard */}
      <div>
        <h2 className="text-xl font-bold text-[var(--color-brand-navy)] mb-1">Exercise Difficulty Rankings</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Ranked by how many retries students need</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExerciseDifficultyCard title="🔴 Hardest Exercises" type="hardest" exercises={hardest || []} />
          <ExerciseDifficultyCard title="🟢 Easiest Exercises" type="easiest" exercises={easiest || []} />
        </div>
      </div>

      {/* Section 4 - Mastery Rate Chart (Moved up for better layout flow) */}
      <div>
        <MasteryDistributionChart data={masteryDistribution} />
      </div>

      {/* Section 3 - Full Exercise Table */}
      <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg overflow-hidden">
        <div className="p-5 border-b border-[var(--border-light)] bg-[var(--bg-surface)]">
          <h3 className="text-lg font-bold text-[var(--color-brand-navy)] mb-1">All Exercises</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Complete exercise performance data</p>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--bg-body)] border border-[var(--border-light)] text-[var(--text-main)] rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
            
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="bg-[var(--bg-body)] border border-[var(--border-light)] text-[var(--text-main)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="All Courses">All Courses</option>
              <option value="Python for Beginners">Python</option>
              <option value="AI Course">AI</option>
              <option value="Java for Beginners">Java</option>
            </select>
            
            <select
              value={sortParam}
              onChange={(e) => setSortParam(e.target.value)}
              className="bg-[var(--bg-body)] border border-[var(--border-light)] text-[var(--text-main)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="retries">Sort by: Most Retried</option>
              <option value="mastery">Sort by: Lowest Mastery</option>
              <option value="highest_mastery">Sort by: Highest Mastery</option>
              <option value="alpha">Sort by: Alphabetical</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-light)]">
                <th className="px-6 py-4 font-medium">Exercise</th>
                <th className="px-6 py-4 font-medium">Course / Lesson</th>
                <th className="px-6 py-4 font-medium">Attempts</th>
                <th className="px-6 py-4 font-medium">Mastery Rate</th>
                <th className="px-6 py-4 font-medium">Difficulty Score</th>
                <th className="px-6 py-4 font-medium">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {filteredExercises.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                    No exercises found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredExercises.map((ex: any, idx: number) => {
                  let diffColor = 'text-green-500';
                  let diffLabel = '🟢 Easy';
                  if (ex.difficultyScore >= 7) {
                    diffColor = 'text-red-500';
                    diffLabel = '🔴 Hard';
                  } else if (ex.difficultyScore >= 4) {
                    diffColor = 'text-yellow-500';
                    diffLabel = '🟡 Medium';
                  }

                  return (
                    <tr key={idx} className="hover:bg-[var(--bg-surface)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--text-main)] text-sm">{ex.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {ex.courseName} /<br/>
                        <span className="text-[var(--text-muted)]">{ex.lessonName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[var(--text-main)] mb-1">{ex.avgAttempts} avg</div>
                        <div className="text-xs text-[var(--text-muted)]">{ex.uniqueStudents} students</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-[var(--text-main)] mb-1">{ex.masteryRate}%</div>
                        <div className="w-24 bg-[var(--bg-dark-surface)] rounded-full h-1.5 flex items-center">
                          <div 
                            className="h-1.5 rounded-full bg-[var(--color-primary)]" 
                            style={{ width: `${ex.masteryRate}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-bold text-sm mb-1 ${diffColor}`}>
                          {ex.difficultyScore}/10
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">{diffLabel}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {ex.type}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
