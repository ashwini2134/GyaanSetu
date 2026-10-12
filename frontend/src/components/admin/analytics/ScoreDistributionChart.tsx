import React from 'react';

interface ScoreDistributionChartProps {
  data: Array<{
    range: string;
    min: number;
    max: number;
    count: number;
  }>;
}

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  const safeData = data || [];
  const totalStudents = safeData.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const passingStudents = safeData.filter(d => d.min >= 70).reduce((acc, curr) => acc + (curr.count || 0), 0);
  const passingPercentage = totalStudents > 0 ? Math.round((passingStudents / totalStudents) * 100) : 0;
  const maxCount = Math.max(...safeData.map(d => d.count || 0), 1);

  return (
    <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
      <h3 className="text-lg font-bold text-[var(--color-brand-navy)]">Score Distribution</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-6">How students score across all quizzes</p>

      <div className="h-64 w-full flex items-end justify-between pb-6 relative">
        {totalStudents === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] italic pb-6">
            No quiz score data available yet
          </div>
        ) : (
          data.map((entry, index) => {
            let fillClass = 'bg-red-500'; // red
            if (entry.min >= 70) fillClass = 'bg-green-500'; // green
            else if (entry.min >= 60) fillClass = 'bg-yellow-500'; // yellow

            const heightPercentage = Math.max((entry.count / maxCount) * 100, 2);

            return (
              <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group">
                <div className="relative w-4/5 flex justify-center h-full items-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-[var(--bg-dark-surface)] text-[var(--text-main)] text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 transition-opacity border border-[var(--border-light)]">
                    <div className="font-medium text-[var(--text-main)] mb-0.5">Score: {entry.range}</div>
                    <div className="text-[var(--text-secondary)]">{entry.count} student{entry.count !== 1 ? 's' : ''}</div>
                  </div>
                  
                  <div 
                    className={`w-full rounded-t-sm ${fillClass} transition-all duration-500 opacity-90 group-hover:opacity-100`}
                    style={{ height: `${heightPercentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-2 rotate-[-45deg] origin-top-left translate-y-3 -translate-x-1">
                  {entry.range}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-[var(--border-light)] text-sm text-center text-[var(--text-secondary)]">
        <span className="font-medium text-[var(--text-main)]">{passingPercentage}%</span> of students score above the passing threshold (70%)
      </div>
    </div>
  );
}
