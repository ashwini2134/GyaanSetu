import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { AiReviewDecisionCards } from './AiReviewDecisionCards';
import { AiAccuracyTrendChart } from './AiAccuracyTrendChart';
import { authFetch } from '../../../authClient';

export function AiReviewAnalyticsTab({ period }: { period: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await authFetch(`/admin/analytics/ai-reviews?period=${period}`);
      setData(result);
    } catch (err: any) {
      console.error(err);
      setData({ error: err.message || "Failed to load" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--text-secondary)]">Loading AI review analytics...</div>;
  }

  if (data?.error || !data?.summary) {
    return (
      <div className="p-8 text-center text-red-400">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        {data?.error || "Failed to load AI review analytics"}
      </div>
    );
  }

  const { summary, byCourse, overrideAnalysis, timeDistribution, monthlyTrend } = data;

  if (summary.totalReviews === 0) {
    return (
      <div className="p-8 text-center bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg">
        <div className="text-4xl mb-4">🤖</div>
        <h3 className="text-xl font-bold text-[var(--color-brand-navy)] mb-2">No AI reviews yet</h3>
        <p className="text-[var(--text-secondary)]">Data will appear here as students submit projects.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section 1 - Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Total Reviews</div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">{summary.totalReviews.toLocaleString()}</div>
          <div className="text-sm text-[var(--text-muted)]">all time</div>
        </div>
        
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">AI Accuracy Rate</div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">{summary.accuracyRate}%</div>
          <div className="text-sm text-[var(--text-muted)]">(no override needed)</div>
        </div>
        
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Avg Review Time</div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">~{summary.avgReviewTimeSeconds} sec</div>
          <div className="text-sm text-[var(--text-muted)]">from submit to result</div>
        </div>
        
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Override Rate</div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">{summary.overrideRate}%</div>
          <div className="text-sm text-[var(--text-muted)]">admin manually overrode AI</div>
        </div>
      </div>

      {/* Section 2 - Pass vs Fail Rate */}
      <AiReviewDecisionCards 
        approvedCount={summary.approvedCount}
        rejectedCount={summary.rejectedCount}
        overrideCount={summary.overrideCount}
        totalReviews={summary.totalReviews}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 3 - Pass vs Fail Per Course */}
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[var(--border-light)]">
            <h3 className="text-lg font-bold text-[var(--color-brand-navy)] mb-1">Review Results by Course</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-light)]">
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Approved</th>
                  <th className="px-4 py-3 font-medium">Rejected</th>
                  <th className="px-4 py-3 font-medium">Override Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {byCourse.map((course: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[var(--bg-surface)] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-[var(--text-main)]">{course.courseName}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{course.totalReviews}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-[var(--text-main)] mb-1">{course.approvedRate}%</div>
                      <div className="w-16 h-1 bg-[var(--bg-dark-surface)] rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${course.approvedRate}%` }}></div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-[var(--text-main)]">{course.rejectedRate}%</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--text-main)]">{course.overrideRate}%</span>
                        {course.overrideRate > 7 && (
                          <span className="text-xs text-yellow-500 flex items-center gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> High
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4 - AI Review Time Analysis */}
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <h3 className="text-lg font-bold text-[var(--color-brand-navy)] mb-1">Review Speed</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">How fast the AI processes submissions</p>
          
          <div className="font-mono text-sm text-[var(--text-main)] mb-6 bg-[var(--bg-surface)] p-4 rounded border border-[var(--border-light)]">
            <div className="flex items-center mb-2">
              <div className="w-32 text-[var(--text-secondary)]">Queue wait:</div>
              <div className="text-[var(--color-primary)]">█░░░░░░░░░</div>
              <div className="ml-3">~5 sec</div>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-32 text-[var(--text-secondary)]">Security check:</div>
              <div className="text-[var(--color-primary)]">█░░░░░░░░░</div>
              <div className="ml-3">~2 sec</div>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-32 text-[var(--text-secondary)]">Validation:</div>
              <div className="text-[var(--color-primary)]">█░░░░░░░░░</div>
              <div className="ml-3">~3 sec</div>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-32 text-[var(--color-brand-navy)] font-bold">AI API call:</div>
              <div className="text-[var(--color-primary-dark)]">█████████░</div>
              <div className="ml-3 font-bold text-[var(--color-brand-navy)]">~35 sec ← slowest</div>
            </div>
            <div className="flex items-center mb-4">
              <div className="w-32 text-[var(--text-secondary)]">Result save:</div>
              <div className="text-[var(--color-primary)]">█░░░░░░░░░</div>
              <div className="ml-3">~1 sec</div>
            </div>
            <div className="border-t border-[var(--border-light)] pt-2 flex items-center">
              <div className="w-32 text-[var(--text-main)]">Total average:</div>
              <div className="ml-auto font-bold text-[var(--color-brand-navy)]">~46 seconds</div>
            </div>
          </div>
          
          <div className="text-xs text-[var(--text-muted)] italic mb-6">
            Note: AI API call (Google Gemini) takes ~35 seconds which is 76% of total review time.
          </div>
          
          <h4 className="text-sm font-bold text-[var(--text-main)] mb-3">Speed distribution:</h4>
          <div className="space-y-3">
            {timeDistribution.map((dist: any, idx: number) => {
              const barsCount = Math.ceil(dist.percentage / 10);
              const bars = "█".repeat(barsCount) + "░".repeat(Math.max(0, 10 - barsCount));
              let isMost = dist.percentage > 50;
              
              return (
                <div key={idx} className="flex items-center text-sm font-mono">
                  <div className="w-24 text-[var(--text-secondary)]">{dist.bucket}:</div>
                  <div className="text-[var(--color-primary-dark)] tracking-widest">{bars}</div>
                  <div className="ml-3 text-[var(--text-main)] flex-1">{dist.percentage}% of reviews</div>
                  {isMost && <div className="text-[var(--text-muted)] text-xs italic">← most</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 5 - Override Analysis */}
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <h3 className="text-lg font-bold text-[var(--color-brand-navy)] mb-1">Manual Override Insights</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">When the AI got it wrong</p>
          
          {overrideAnalysis.total === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
              <div className="text-2xl">✅</div>
              <div>No overrides yet! The AI has been accurate on all reviews so far.</div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="bg-[var(--bg-surface)] p-3 rounded border border-[var(--border-light)] flex-1">
                  <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Total Overrides</div>
                  <div className="text-2xl font-bold text-[var(--color-brand-navy)]">{overrideAnalysis.total}</div>
                </div>
                <div className="bg-[var(--bg-surface)] p-3 rounded border border-[var(--border-light)] flex-1 min-w-[200px]">
                  <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Most Common Reason</div>
                  <div className="text-sm font-bold text-[var(--text-main)] truncate" title={overrideAnalysis.mostCommonReason}>
                    "{overrideAnalysis.mostCommonReason}"
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-bold text-[var(--text-main)] mb-2">Avg override score vs AI score:</h4>
                <div className="bg-[var(--bg-surface)] p-4 rounded border border-[var(--border-light)] text-sm">
                  <div className="flex justify-between mb-2 text-[var(--text-secondary)]">
                    <span>AI gave:</span>
                    <span className="font-bold text-red-500">{overrideAnalysis.avgAiScore}/100</span>
                  </div>
                  <div className="flex justify-between mb-2 text-[var(--text-secondary)]">
                    <span>Admin gave:</span>
                    <span className="font-bold text-green-500">{overrideAnalysis.avgOverrideScore}/100</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[var(--border-light)] text-[var(--text-main)]">
                    <span>Difference:</span>
                    <span className="font-bold">+{overrideAnalysis.avgOverrideScore - overrideAnalysis.avgAiScore} points on average</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-[var(--text-main)] mb-3">Recent Overrides</h4>
                <div className="overflow-hidden border border-[var(--border-light)] rounded">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--bg-surface)] text-[var(--text-muted)] border-b border-[var(--border-light)]">
                        <tr>
                          <th className="px-3 py-2 font-medium">Student</th>
                          <th className="px-3 py-2 font-medium">Course</th>
                          <th className="px-3 py-2 font-medium">Score</th>
                          <th className="px-3 py-2 font-medium">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-light)]">
                        {overrideAnalysis.recentOverrides.map((ov: any) => (
                          <tr key={ov.id} className="hover:bg-[var(--bg-surface)]">
                            <td className="px-3 py-2 text-[var(--text-main)]">{ov.studentName}</td>
                            <td className="px-3 py-2 text-[var(--text-secondary)] truncate max-w-[100px]" title={ov.courseName}>{ov.courseName}</td>
                            <td className="px-3 py-2 text-[var(--text-main)]">
                              <span className="text-red-500">{ov.aiScore}</span> → <span className="text-green-500 font-bold">{ov.overrideScore}</span>
                            </td>
                            <td className="px-3 py-2 text-[var(--text-secondary)] truncate max-w-[120px]" title={ov.reason}>{ov.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Section 6 - Accuracy Trend Chart */}
        <div>
          <AiAccuracyTrendChart data={monthlyTrend} />
        </div>
      </div>
    </div>
  );
}
