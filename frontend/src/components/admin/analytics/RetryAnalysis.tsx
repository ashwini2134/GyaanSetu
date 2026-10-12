import React from 'react';

interface RetryAnalysisProps {
  distribution: {
    pass1: { count: number; percentage: number };
    pass2: { count: number; percentage: number };
    pass3: { count: number; percentage: number };
    neverPassed: { count: number; percentage: number };
  };
  mostRetried: {
    quizName: string;
    courseName: string;
    avgRetries: string | number;
  } | null;
}

export function RetryAnalysis({ distribution, mostRetried }: RetryAnalysisProps) {
  const totalFailsInitially = distribution.pass2.count + distribution.pass3.count + distribution.neverPassed.count;
  const eventuallyPassed = distribution.pass2.count + distribution.pass3.count;
  const retrySuccessRate = totalFailsInitially > 0 ? Math.round((eventuallyPassed / totalFailsInitially) * 100) : 0;

  return (
    <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
      <h3 className="text-lg font-bold text-[var(--color-brand-navy)]">Retry Patterns</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-6">How many times students attempt quizzes</p>

      <div className="space-y-4 mb-8">
        <div className="text-sm font-medium text-[var(--text-secondary)] mb-2">Attempt Distribution:</div>
        
        {/* Pass on 1st Attempt */}
        <div className="relative">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[var(--text-secondary)]">1st attempt passed:</span>
            <span className="text-[var(--text-secondary)]">
              <span className="text-[var(--text-main)] font-medium">{distribution.pass1.percentage}%</span> ({distribution.pass1.count} students)
            </span>
          </div>
          <div className="w-full bg-[var(--bg-dark-surface)] rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${distribution.pass1.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Passed on 2nd try */}
        <div className="relative">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[var(--text-secondary)]">Passed on 2nd try:</span>
            <span className="text-[var(--text-secondary)]">
              <span className="text-[var(--text-main)] font-medium">{distribution.pass2.percentage}%</span> ({distribution.pass2.count} students)
            </span>
          </div>
          <div className="w-full bg-[var(--bg-dark-surface)] rounded-full h-2">
            <div 
              className="bg-[var(--color-primary)] h-2 rounded-full"
              style={{ width: `${distribution.pass2.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Passed on 3rd try */}
        <div className="relative">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[var(--text-secondary)]">Passed on 3rd try:</span>
            <span className="text-[var(--text-secondary)]">
              <span className="text-[var(--text-main)] font-medium">{distribution.pass3.percentage}%</span> ({distribution.pass3.count} students)
            </span>
          </div>
          <div className="w-full bg-[var(--bg-dark-surface)] rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full"
              style={{ width: `${distribution.pass3.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Never passed */}
        <div className="relative">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[var(--text-secondary)]">Never passed:</span>
            <span className="text-[var(--text-secondary)]">
              <span className="text-[var(--text-main)] font-medium">{distribution.neverPassed.percentage}%</span> ({distribution.neverPassed.count} students)
            </span>
          </div>
          <div className="w-full bg-[var(--bg-dark-surface)] rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full"
              style={{ width: `${distribution.neverPassed.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border-light)] pt-4">
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Students who retry: <span className="font-bold text-[var(--text-main)]">{retrySuccessRate}%</span> of those who fail initially eventually pass on a later attempt.
        </p>

        {mostRetried && (
          <div>
            <div className="text-xs text-[var(--text-muted)] uppercase font-bold mb-1">Most Retried Quiz</div>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded p-3 flex justify-between items-center">
              <div>
                <div className="text-[var(--text-main)] font-medium text-sm">{mostRetried.quizName}</div>
                <div className="text-xs text-[var(--text-secondary)]">{mostRetried.courseName}</div>
              </div>
              <div className="text-right">
                <div className="text-yellow-500 font-bold">{mostRetried.avgRetries} attempts</div>
                <div className="text-xs text-[var(--text-muted)]">avg per student</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
