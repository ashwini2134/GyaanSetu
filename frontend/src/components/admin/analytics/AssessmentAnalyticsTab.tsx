import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ScoreDistributionChart } from './ScoreDistributionChart';
import { HardestQuestionCard } from './HardestQuestionCard';
import { RetryAnalysis } from './RetryAnalysis';
import { authFetch } from '../../../authClient';

export function AssessmentAnalyticsTab({ period }: { period: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await authFetch(`/admin/analytics/assessments?period=${period}`);
      setData(result);
    } catch (err) {
      console.error(err);
      setData({ error: err.message || "Failed to load" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--text-secondary)]">Loading assessment analytics...</div>;
  }

  if (data?.error || !data?.summary || !data?.quizzes) {
    return (
      <div className="p-8 text-center text-red-400">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        {data?.error || "Failed to load assessment analytics"}
      </div>
    );
  }

  const { summary, quizzes, scoreDistribution, hardestQuestions, retryAnalysis } = data;

  return (
    <div className="space-y-6">
      {/* Section 1 - Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Total Quiz Attempts</div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">{summary.totalAttempts.toLocaleString()}</div>
          <div className="text-sm text-[var(--text-muted)]">all time</div>
        </div>
        
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Overall Pass Rate</div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">{summary.overallPassRate}%</div>
          <div className="text-sm text-[var(--text-muted)]">platform wide</div>
        </div>
        
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Avg Score</div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">{summary.avgScore}%</div>
          <div className="text-sm text-[var(--text-muted)]">across all quizzes</div>
        </div>
        
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
          <div className="text-[var(--text-secondary)] text-sm mb-2">Avg Retry Rate</div>
          <div className="text-3xl font-bold text-[var(--color-brand-navy)] mb-2">{summary.avgRetryRate}x</div>
          <div className="text-sm text-[var(--text-muted)]">per student</div>
        </div>
      </div>

      {/* Section 2 - Quiz Pass Rates Table */}
      <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg overflow-hidden">
        <div className="p-5 border-b border-[var(--border-light)] bg-[var(--bg-surface)]">
          <h3 className="text-lg font-bold text-[var(--color-brand-navy)]">Quiz Performance by Course</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-light)]">
                <th className="px-6 py-4 font-medium">Quiz</th>
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium">Attempts</th>
                <th className="px-6 py-4 font-medium">Pass Rate</th>
                <th className="px-6 py-4 font-medium">Avg Score</th>
                <th className="px-6 py-4 font-medium">Avg Retries</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                    No quiz data available yet.
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[var(--bg-surface)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--text-main)] text-sm">{quiz.quizName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {quiz.courseName}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-main)]">
                      {quiz.totalAttempts.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-bold text-sm mb-1 ${quiz.passRate > 70 ? 'text-green-500' : quiz.passRate >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {quiz.passRate}%
                      </div>
                      <div className="w-24 bg-[var(--bg-dark-surface)] rounded-full h-1.5 flex items-center">
                        <div 
                          className={`h-1.5 rounded-full ${quiz.passRate > 70 ? 'bg-green-500' : quiz.passRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                          style={{ width: `${quiz.passRate}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-main)]">
                      <div className="flex items-center">
                        {quiz.avgScore}/100
                        {quiz.passRate < 60 && <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-main)]">
                      <div className="flex items-center">
                        {quiz.avgRetries}x
                        {parseFloat(quiz.avgRetries) > 2 && <AlertTriangle className="w-4 h-4 text-yellow-500 ml-2" />}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row containing Score Distribution and Retry Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreDistributionChart data={scoreDistribution} />
        <RetryAnalysis distribution={retryAnalysis.distribution} mostRetried={retryAnalysis.mostRetried} />
      </div>

      {/* Section 4 - Most Failed Questions */}
      <div>
        <h3 className="text-lg font-bold text-[var(--color-brand-navy)] mb-1">Hardest Questions</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Questions with lowest correct answer rate across all courses</p>
        
        {hardestQuestions.length === 0 ? (
          <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-8 text-center text-[var(--text-secondary)]">
            No question data available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hardestQuestions.map((question: any, idx: number) => (
              <HardestQuestionCard key={idx} rank={idx + 1} question={question} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
