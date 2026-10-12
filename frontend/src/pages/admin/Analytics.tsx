import React, { useState } from 'react';
import { Download, RefreshCw, ChevronDown } from 'lucide-react';
import { CourseAnalyticsTab } from '../../components/admin/analytics/CourseAnalyticsTab';
import { AssessmentAnalyticsTab } from '../../components/admin/analytics/AssessmentAnalyticsTab';
import { ExerciseAnalyticsTab } from '../../components/admin/analytics/ExerciseAnalyticsTab';
import { AiReviewAnalyticsTab } from '../../components/admin/analytics/AiReviewAnalyticsTab';
import { CertificateAnalyticsTab } from '../../components/admin/analytics/CertificateAnalyticsTab';
import { GlobalDashboard } from '../../components/admin/analytics/GlobalDashboard';

const TABS = [
  'Overview',
  'Course Analytics',
  'Assessment Analytics',
  'Exercise Analytics',
  'AI Reviews',
  'Certificates'
];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [period, setPeriod] = useState('30d');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleExport = () => {
    alert('Export coming soon');
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto text-[var(--text-main)] bg-[var(--bg-body)] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-[var(--color-brand-navy)]">Analytics</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Live platform insights — auto-calculated, no admin prep needed
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              className="group bg-[var(--bg-body)] text-[var(--text-main)] border border-[var(--border-light)] text-sm py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-[var(--bg-body)] transition-colors duration-200"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              {period === '7d' && 'Last 7 days'}
              {period === '30d' && 'Last 30 days'}
              {period === '90d' && 'Last 90 days'}
              {period === 'all' && 'All time'}
              <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--bg-body)] transition-colors duration-200" />
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-body)] text-[var(--text-main)] border border-[var(--border-light)] rounded-lg shadow-xl z-10 overflow-hidden">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-surface)]" onClick={() => { setPeriod('7d'); setIsFilterOpen(false); }}>Last 7 days</button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-surface)]" onClick={() => { setPeriod('30d'); setIsFilterOpen(false); }}>Last 30 days</button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-surface)]" onClick={() => { setPeriod('90d'); setIsFilterOpen(false); }}>Last 90 days</button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-surface)]" onClick={() => { setPeriod('all'); setIsFilterOpen(false); }}>All time</button>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleExport}
            className="group flex items-center gap-2 text-sm text-[var(--text-main)] px-4 py-2 border border-[var(--border-light)] bg-[var(--bg-body)] rounded-lg hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-[var(--bg-body)] transition-colors duration-200"
          >
            <Download className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--bg-body)] transition-colors duration-200" /> Export CSV
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide border-b border-[var(--border-light)]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab 
                ? 'bg-[var(--color-brand-navy)] text-[var(--bg-body)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--color-brand-navy)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'Overview' ? (
          <GlobalDashboard period={period} />
        ) : activeTab === 'Course Analytics' ? (
          <CourseAnalyticsTab period={period} />
        ) : activeTab === 'Assessment Analytics' ? (
          <AssessmentAnalyticsTab period={period} />
        ) : activeTab === 'Exercise Analytics' ? (
          <ExerciseAnalyticsTab period={period} />
        ) : activeTab === 'AI Reviews' ? (
          <AiReviewAnalyticsTab period={period} />
        ) : activeTab === 'Certificates' ? (
          <CertificateAnalyticsTab period={period} />
        ) : (
          <div className="p-12 text-center border border-dashed border-[var(--border-light)] rounded-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--bg-body)] border border-[var(--border-light)] mb-4">
              <RefreshCw className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--color-brand-navy)] mb-2">{activeTab}</h3>
            <p className="text-[var(--text-secondary)]">This analytics view is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
