import React from 'react';

interface MasteryDistributionChartProps {
  data: Array<{
    range: string;
    count: number;
  }>;
}

export function MasteryDistributionChart({ data }: MasteryDistributionChartProps) {
  const safeData = data || [];
  
  // Custom colors based on mastery range
  const getBarColor = (index: number) => {
    if (index < 2) return '#EF4444'; // 0-40% red
    if (index === 2) return '#EAB308'; // 41-60% yellow
    return '#22C55E'; // 61-100% green
  };

  const highMasteryCount = safeData.slice(3).reduce((acc, curr) => acc + (curr.count || 0), 0);
  const lowMasteryCount = safeData.slice(0, 3).reduce((acc, curr) => acc + (curr.count || 0), 0);
  const totalCount = highMasteryCount + lowMasteryCount;
  const highMasteryPercentage = totalCount > 0 ? Math.round((highMasteryCount / totalCount) * 100) : 0;
  
  const maxCount = Math.max(...safeData.map(d => d.count), 1);

  return (
    <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
      <h3 className="text-lg font-bold text-[var(--color-brand-navy)] mb-1">Mastery Rate Distribution</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-6">What % of exercises do students master?</p>
      
      <div className="h-64 w-full flex items-end justify-between relative pb-8 pt-4 px-2">
        {/* Y-axis labels (rough approximation) */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-[var(--text-muted)] pb-1">
          <span>{maxCount}</span>
          <span>{Math.round(maxCount / 2)}</span>
          <span>0</span>
        </div>
        
        {/* Horizontal grid lines */}
        <div className="absolute left-6 right-0 top-4 h-[1px] border-t border-dashed border-[var(--border-light)]"></div>
        <div className="absolute left-6 right-0 top-1/2 h-[1px] border-t border-dashed border-[var(--border-light)] -translate-y-4"></div>
        <div className="absolute left-6 right-0 bottom-8 h-[1px] border-t border-[var(--border-light)]"></div>

        <div className="flex-1 flex justify-around items-end h-full pl-6 relative z-10">
          {safeData.map((item, index) => {
            const heightPct = (item.count / maxCount) * 100;
            return (
              <div key={index} className="flex flex-col items-center group relative w-full px-1 sm:px-4">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-[var(--bg-dark-surface)] text-[var(--text-main)] text-xs py-1 px-2 rounded border border-[var(--border-light)] transition-opacity whitespace-nowrap z-20 pointer-events-none">
                  {item.range}: {item.count}
                </div>
                
                {/* Bar */}
                <div className="w-full flex justify-center h-full items-end pb-[1px]">
                  <div 
                    className="w-full max-w-[40px] rounded-t-sm transition-all duration-500 ease-out hover:opacity-80"
                    style={{ 
                      height: `${heightPct}%`, 
                      minHeight: item.count > 0 ? '4px' : '0px',
                      backgroundColor: getBarColor(index) 
                    }}
                  ></div>
                </div>
                
                {/* X-axis label */}
                <div className="absolute -bottom-6 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                  {item.range}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-light)] text-sm text-[var(--text-secondary)]">
        <span className="font-bold text-[var(--text-main)]">{highMasteryPercentage}%</span> of exercises have a mastery rate above 60%. Consider reviewing the <span className="font-bold text-[var(--text-main)]">{lowMasteryCount}</span> exercises where students consistently struggle.
      </div>
    </div>
  );
}
