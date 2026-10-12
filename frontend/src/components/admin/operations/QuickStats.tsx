import React from "react";

interface QuickStatsProps {
  stats: {
    activeStudents: number;
    reviewsToday: number;
    certsToday: number;
    failedJobs: number;
  }
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
      <StatCard 
        title="Active Students" 
        value={stats.activeStudents} 
        subtitle="last 7 days" 
      />
      <StatCard 
        title="Reviews Today" 
        value={stats.reviewsToday} 
        subtitle="AI reviewed" 
      />
      <StatCard 
        title="Certs Issued" 
        value={stats.certsToday} 
        subtitle="today" 
      />
      <StatCard 
        title="Failed Jobs" 
        value={stats.failedJobs} 
        subtitle="needs fix"
        accent={stats.failedJobs > 0 ? "red" : "none"}
      />
    </div>
  );
}

function StatCard({ title, value, subtitle, accent = "none" }: { title: string, value: number, subtitle: string, accent?: "red" | "none" }) {
  const isRed = accent === "red";
  return (
    <div className={`bg-[var(--bg-surface)] border ${isRed ? 'border-red-500/50' : 'border-[var(--border-light)]'} rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-md`}>
      <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">{title}</p>
      <p className={`text-3xl font-bold mb-1 ${isRed ? 'text-red-400' : 'text-[var(--color-brand-navy)]'}`}>{value}</p>
      <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
    </div>
  );
}
