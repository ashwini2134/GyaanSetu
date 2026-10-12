import React from 'react';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface AiReviewDecisionCardsProps {
  approvedCount: number;
  rejectedCount: number;
  overrideCount: number;
  totalReviews: number;
}

export function AiReviewDecisionCards({ approvedCount, rejectedCount, overrideCount, totalReviews }: AiReviewDecisionCardsProps) {
  const safeTotal = Math.max(1, totalReviews);
  
  const approvedPct = Math.round((approvedCount / safeTotal) * 100);
  const rejectedPct = Math.round((rejectedCount / safeTotal) * 100);
  const overridePct = Math.round((overrideCount / safeTotal) * 100);
  
  const totalOriginalRejected = rejectedCount + overrideCount;
  const adminApprovedLaterPct = totalOriginalRejected > 0 ? Math.round((overrideCount / totalOriginalRejected) * 100) : 0;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-[var(--color-brand-navy)] mb-1">AI Review Decisions</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4">How the AI rates student submissions</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Approved Card */}
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <div className="text-[var(--text-secondary)] text-sm mb-2 uppercase font-bold tracking-wider">Approved</div>
          <div className="text-4xl font-bold text-green-500 mb-3">{approvedPct}%</div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`w-3 h-4 rounded-sm ${i < approvedPct / 10 ? 'bg-green-500' : 'bg-[var(--bg-dark-surface)]'}`}></div>
              ))}
            </div>
          </div>
          <div className="text-sm text-[var(--text-muted)]">({approvedCount.toLocaleString()})</div>
        </div>
        
        {/* Rejected Card */}
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <div className="text-[var(--text-secondary)] text-sm mb-2 uppercase font-bold tracking-wider">Rejected</div>
          <div className="text-4xl font-bold text-red-500 mb-3">{rejectedPct}%</div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`w-3 h-4 rounded-sm ${i < rejectedPct / 10 ? 'bg-red-500' : 'bg-[var(--bg-dark-surface)]'}`}></div>
              ))}
            </div>
          </div>
          <div className="text-sm text-[var(--text-muted)]">({rejectedCount.toLocaleString()})</div>
        </div>
        
        {/* Overridden Card */}
        <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <RefreshCw className="w-16 h-16 text-[var(--color-primary)]" />
          </div>
          <div className="text-[var(--text-secondary)] text-sm mb-2 uppercase font-bold tracking-wider">Overridden</div>
          <div className="text-4xl font-bold text-[var(--color-primary)] mb-3">{overridePct}%</div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`w-3 h-4 rounded-sm ${i < overridePct / 10 ? 'bg-[var(--color-primary)]' : 'bg-[var(--bg-dark-surface)]'}`}></div>
              ))}
            </div>
          </div>
          <div className="text-sm text-[var(--text-muted)]">({overrideCount.toLocaleString()})</div>
        </div>
      </div>
      
      <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-lg p-4 text-sm text-[var(--text-secondary)]">
        The AI approves <span className="font-bold text-[var(--text-main)]">{approvedPct}%</span> of submissions on first review. 
        Of rejected submissions, <span className="font-bold text-[var(--text-main)]">{adminApprovedLaterPct}%</span> are later manually approved by admin, 
        suggesting some edge cases the AI misses.
      </div>
    </div>
  );
}
