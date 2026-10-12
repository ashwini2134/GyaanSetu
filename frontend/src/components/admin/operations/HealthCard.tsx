import React from "react";

interface HealthCardProps {
  title: string;
  icon: React.ReactNode;
  status: "running" | "down" | "unknown" | "not_configured" | "configured" | "mock";
  children: React.ReactNode;
  warning?: boolean;
}

export function HealthCard({ title, icon, status, children, warning }: HealthCardProps) {
  const isDown = status === "down";
  const isWarning = status === "unknown" || status === "not_configured" || warning || status === "mock";
  const isRunning = status === "running" || status === "configured";

  const getStatusDisplay = () => {
    switch (status) {
      case "running": return { text: "RUNNING", color: "bg-green-500/20 text-green-400", dot: "bg-green-500" };
      case "configured": return { text: "CONFIGURED", color: "bg-green-500/20 text-green-400", dot: "bg-green-500" };
      case "down": return { text: "DOWN", color: "bg-red-500/20 text-red-400", dot: "bg-red-500" };
      case "unknown": return { text: "UNKNOWN", color: "bg-yellow-500/20 text-yellow-400", dot: "bg-yellow-500" };
      case "not_configured": return { text: "NOT CONFIGURED", color: "bg-yellow-500/20 text-yellow-400", dot: "bg-yellow-500" };
      case "mock": return { text: "MOCK MODE", color: "bg-yellow-500/20 text-yellow-400", dot: "bg-yellow-500" };
      default: return { text: status.toUpperCase(), color: "bg-slate-500/20 text-slate-400", dot: "bg-slate-500" };
    }
  };

  const statusDisplay = getStatusDisplay();

  let leftBorderClass = "border-l-transparent";
  if (isDown) leftBorderClass = "border-l-red-500";
  else if (isWarning) leftBorderClass = "border-l-yellow-500";

  return (
    <div className={`bg-[var(--bg-body)] border border-[var(--border-light)] ${leftBorderClass} border-l-[3px] rounded-xl p-6 transition-transform hover:-translate-y-1 hover:shadow-xl flex flex-col gap-4`}>
      <div className="flex items-center gap-3">
        <div className="text-[var(--color-brand-navy)]">
          {icon}
        </div>
        <h3 className="font-bold text-[var(--color-brand-navy)] text-base">{title}</h3>
      </div>
      
      <div>
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${statusDisplay.color}`}>
          <span className={`w-2 h-2 rounded-full ${statusDisplay.dot}`}></span>
          {statusDisplay.text}
        </span>
      </div>

      <div className="text-sm text-[var(--text-secondary)] flex flex-col gap-1.5 mt-2">
        {children}
      </div>
    </div>
  );
}
