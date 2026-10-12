import React from 'react';

interface TrendData {
  month: string;
  passRate: number;
  overrideRate: number;
}

interface AiAccuracyTrendChartProps {
  data: TrendData[];
}

export function AiAccuracyTrendChart({ data }: AiAccuracyTrendChartProps) {
  const safeData = data || [];
  
  if (safeData.length === 0) {
    return null;
  }

  const firstMonth = safeData[0];
  const lastMonth = safeData[safeData.length - 1];
  
  const isImproving = lastMonth.overrideRate < firstMonth.overrideRate;
  
  // Create SVG points
  // 100% = top (0px), 0% = bottom (200px)
  const chartHeight = 200;
  const chartWidth = 500;
  const paddingX = 40;
  const stepX = (chartWidth - paddingX * 2) / Math.max(1, safeData.length - 1);
  
  const getPoint = (val: number, idx: number) => {
    const x = paddingX + idx * stepX;
    const y = chartHeight - (val / 100) * chartHeight;
    return `${x},${y}`;
  };

  const passRatePoints = safeData.map((d, i) => getPoint(d.passRate, i)).join(' ');
  const overrideRatePoints = safeData.map((d, i) => getPoint(d.overrideRate, i)).join(' ');

  return (
    <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5">
      <h3 className="text-lg font-bold text-[var(--color-brand-navy)] mb-1">AI Accuracy Over Time</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4">Monthly override rate trend</p>
      
      <div className="flex justify-center gap-6 mb-4 text-xs">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]"></div> Pass Rate %
        </div>
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <div className="w-3 h-3 rounded-full bg-red-500"></div> Override Rate %
        </div>
      </div>
      
      <div className="h-64 w-full relative">
        <div className="absolute inset-0 flex flex-col justify-between text-xs text-[var(--text-muted)] pb-8">
          <div className="flex justify-between items-center w-full relative">
            <span className="w-8">100%</span>
            <div className="absolute left-10 right-0 h-[1px] border-t border-dashed border-[var(--border-light)]"></div>
          </div>
          <div className="flex justify-between items-center w-full relative">
            <span className="w-8">75%</span>
            <div className="absolute left-10 right-0 h-[1px] border-t border-dashed border-[var(--border-light)]"></div>
          </div>
          <div className="flex justify-between items-center w-full relative">
            <span className="w-8">50%</span>
            <div className="absolute left-10 right-0 h-[1px] border-t border-dashed border-[var(--border-light)]"></div>
          </div>
          <div className="flex justify-between items-center w-full relative">
            <span className="w-8">25%</span>
            <div className="absolute left-10 right-0 h-[1px] border-t border-dashed border-[var(--border-light)]"></div>
          </div>
          <div className="flex justify-between items-center w-full relative">
            <span className="w-8">0%</span>
            <div className="absolute left-10 right-0 h-[1px] border-t border-[var(--border-light)]"></div>
          </div>
        </div>
        
        <div className="absolute inset-0 pb-8 pl-10 pr-4">
          <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
            <polyline 
              fill="none" 
              stroke="var(--color-primary)" 
              strokeWidth="3" 
              points={passRatePoints} 
            />
            {safeData.map((d, i) => {
              const [x, y] = getPoint(d.passRate, i).split(',');
              return <circle key={`p-${i}`} cx={x} cy={y} r="4" fill="var(--color-primary)" className="hover:r-6 cursor-pointer" />;
            })}

            <polyline 
              fill="none" 
              stroke="#EF4444" 
              strokeWidth="3" 
              points={overrideRatePoints} 
            />
            {safeData.map((d, i) => {
              const [x, y] = getPoint(d.overrideRate, i).split(',');
              return <circle key={`o-${i}`} cx={x} cy={y} r="4" fill="#EF4444" className="hover:r-6 cursor-pointer" />;
            })}
          </svg>
        </div>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-10 right-4 flex justify-between text-xs text-[var(--text-secondary)]">
          {safeData.map((d, i) => (
            <div key={i} className="text-center" style={{ width: '40px', transform: 'translateX(-50%)' }}>
              {d.month.split(' ')[0]}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border-light)] text-sm text-center">
        {isImproving ? (
          <span className="text-green-400 font-medium">AI accuracy is improving over time ✅</span>
        ) : (
          <span className="text-yellow-400 font-medium">Consider reviewing AI configuration ⚠️</span>
        )}
      </div>
    </div>
  );
}
