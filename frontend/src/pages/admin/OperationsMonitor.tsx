import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Bot, GraduationCap, Mail, Settings, Info } from "lucide-react";
import { HealthCard } from "../../components/admin/operations/HealthCard";
import { QuickStats } from "../../components/admin/operations/QuickStats";
import { JobsTable, Job } from "../../components/admin/operations/JobsTable";
import { JobDetailsDrawer } from "../../components/admin/operations/JobDetailsDrawer";
import { BlockedStudentsView } from "../../components/admin/operations/BlockedStudentsView";
import { AiReviewLogsView } from "../../components/admin/operations/AiReviewLogsView";
import { authFetch } from "../../authClient";

interface HealthData {
  timestamp: string;
  services: {
    aiReview: {
      status: "running" | "down" | "unknown" | "not_configured";
      provider: string;
      model: string;
      lastReviewAt: string | null;
      reviewsToday: number;
    };
    certificates: {
      status: "running" | "down";
      issuedToday: number;
      totalIssued: number;
      lastIssuedAt: string | null;
    };
    email: {
      status: "configured" | "not_configured";
      provider: string;
      apiKeySet: boolean;
    };
    backgroundJobs: {
      status: "running" | "mock" | "down";
      mode: string;
      redisConnected: boolean;
      pendingJobs: number;
      completedToday: number;
      failedToday: number;
    };
  };
  stats: {
    activeStudents: number;
    reviewsToday: number;
    certsToday: number;
    failedJobs: number;
  };
}

export default function OperationsMonitor() {
  const [data, setData] = useState<HealthData | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [lastCheckedText, setLastCheckedText] = useState("Just now");

  // Jobs State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsTotal, setJobsTotal] = useState(0);
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsTotalPages, setJobsTotalPages] = useState(1);
  const [jobsStatusFilter, setJobsStatusFilter] = useState("all");
  const [jobsSearch, setJobsSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await authFetch<{ jobs: Job[], total: number, totalPages: number }>(`/admin/jobs?status=${jobsStatusFilter}&search=${encodeURIComponent(jobsSearch)}&page=${jobsPage}&limit=20`);
      setJobs(data.jobs);
      setJobsTotal(data.total);
      setJobsTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  }, [jobsStatusFilter, jobsSearch, jobsPage]);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await authFetch<HealthData>("/admin/health");
      setData(result);
      setLastChecked(new Date());
      setCountdown(60);
    } catch (error) {
      console.error("Failed to fetch health data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchJobs();
  }, [fetchData, fetchJobs]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchData();
          return 60;
        }
        return prev - 1;
      });

      // Update "Last checked" text
      if (lastChecked) {
        const secondsAgo = Math.floor((new Date().getTime() - lastChecked.getTime()) / 1000);
        if (secondsAgo < 10) setLastCheckedText("Just now");
        else setLastCheckedText(`${secondsAgo} seconds ago`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchData, lastChecked]);

  const handleManualRefresh = () => {
    fetchData();
    fetchJobs();
  };

  const handleRetryJob = async (job: Job) => {
    setIsRetrying(job.id);
    try {
      const res = await authFetch<{ success: boolean; message: string }>(`/admin/jobs/${job.id}/retry`, { method: "POST" });
      if (res.success) {
        setToastMessage("Job queued for retry");
        fetchJobs(); // refresh list
      } else {
        setToastMessage(res.message || "Retry failed. Please try again.");
      }
    } catch (err: any) {
      setToastMessage("Retry failed. Please try again.");
    } finally {
      setIsRetrying(null);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return "Never";
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (!data) {
    return <div className="p-8 text-slate-400">Loading operations data...</div>;
  }

  const { services, stats } = data;

  return (
    <div className="p-8 max-w-7xl mx-auto bg-[var(--bg-body)] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-brand-navy)] tracking-tight">Operations Monitor</h1>
          <p className="text-[var(--text-secondary)] mt-1">Platform health and background jobs</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-[var(--text-secondary)]">Last checked: {lastCheckedText}</p>
            <p className="text-xs text-green-400 flex items-center justify-end gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Auto-refreshing in {countdown}s
            </p>
          </div>
          <button 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-body)] hover:bg-[var(--bg-surface)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] text-[var(--text-main)] text-sm font-medium rounded-lg transition-colors border border-[var(--border-light)] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 text-[var(--color-brand-navy)] p-4 rounded-xl flex items-start gap-3 mb-8">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed">
          This is a monitoring dashboard, not a control panel. The platform runs automatically. You are here to observe, not operate.
        </p>
      </div>

      {/* Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* AI Review Service */}
        <HealthCard 
          title="AI Review Service" 
          icon={<Bot className="w-8 h-8" />}
          status={services.aiReview.status}
        >
          <p>Provider: {services.aiReview.provider === 'google' ? 'Google Gemini' : services.aiReview.provider}</p>
          <p>Model: {services.aiReview.model}</p>
          <p>Last review: {getTimeAgo(services.aiReview.lastReviewAt)}</p>
          <p>Reviews today: {services.aiReview.reviewsToday}</p>
        </HealthCard>

        {/* Certificate Generator */}
        <HealthCard 
          title="Certificate Generator" 
          icon={<GraduationCap className="w-8 h-8" />}
          status={services.certificates.status}
        >
          <p>Certificates today: {services.certificates.issuedToday}</p>
          <p>Total issued: {services.certificates.totalIssued}</p>
          <p>Last generated: {getTimeAgo(services.certificates.lastIssuedAt)}</p>
        </HealthCard>

        {/* Email Service */}
        <HealthCard 
          title="Email Service" 
          icon={<Mail className="w-8 h-8" />}
          status={services.email.status}
          warning={services.email.status === 'not_configured'}
        >
          <p>Provider: {services.email.provider === 'none' ? 'Not set' : services.email.provider}</p>
          <p>RESEND_API_KEY: {services.email.apiKeySet ? 'Configured' : 'Missing'}</p>
          {services.email.status === 'not_configured' && (
            <p className="mt-2 text-yellow-500 font-medium">⚠️ Emails will not be sent</p>
          )}
        </HealthCard>

        {/* Background Jobs */}
        <HealthCard 
          title="Background Jobs" 
          icon={<Settings className="w-8 h-8" />}
          status={services.backgroundJobs.status}
        >
          <p>Queue: {services.backgroundJobs.mode === 'bullmq' ? 'BullMQ' : 'Mock Mode (Local Dev)'}</p>
          <p>Pending jobs: {services.backgroundJobs.pendingJobs}</p>
          <p>Completed today: {services.backgroundJobs.completedToday}</p>
          <p>Failed today: {services.backgroundJobs.failedToday}</p>
          {services.backgroundJobs.failedToday > 0 && (
            <p className="mt-2 text-red-400 font-medium">⚠️ {services.backgroundJobs.failedToday} failed job{services.backgroundJobs.failedToday !== 1 ? 's' : ''} needs attention</p>
          )}
        </HealthCard>
      </div>

      {/* Quick Stats Row */}
      <QuickStats stats={stats} />

      {/* Background Jobs Section */}
      <div className="mt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-brand-navy)]">Background Jobs</h2>
            <p className="text-[var(--text-secondary)] mt-1">Recent automated tasks processed by the platform</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex bg-[var(--bg-body)] p-1 rounded-lg border border-[var(--border-light)]">
              {['all', 'completed', 'pending', 'failed'].map(filter => (
                <button
                  key={filter}
                  onClick={() => { setJobsStatusFilter(filter); setJobsPage(1); }}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    jobsStatusFilter === filter 
                      ? 'bg-[var(--color-brand-navy)] text-[var(--bg-body)]' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--color-brand-navy)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
            
            <input
              type="text"
              placeholder="Search by student or course..."
              value={jobsSearch}
              onChange={(e) => { setJobsSearch(e.target.value); setJobsPage(1); }}
              className="bg-[var(--bg-body)] border border-[var(--border-light)] text-[var(--text-main)] px-4 py-2 rounded-lg focus:outline-none focus:border-[var(--color-primary)] w-64 text-sm"
            />
            
            <button
              onClick={fetchJobs}
              className="p-2 rounded-lg bg-[var(--bg-body)] border border-[var(--border-light)] text-[var(--text-muted)] hover:text-[var(--color-brand-navy)] hover:bg-[var(--bg-surface)] transition-colors"
              title="Refresh jobs"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {jobs.length > 0 ? (
          <>
            <JobsTable 
              jobs={jobs} 
              onViewJob={handleViewJob} 
              onRetryJob={handleRetryJob}
              isRetrying={isRetrying}
            />
            
            {/* Pagination */}
            {jobsTotalPages > 1 && (
              <div className="mt-6 flex items-center justify-between text-sm text-[var(--text-secondary)]">
                <div>
                  Showing {(jobsPage - 1) * 20 + 1}-{Math.min(jobsPage * 20, jobsTotal)} of {jobsTotal} jobs
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setJobsPage(p => Math.max(1, p - 1))}
                    disabled={jobsPage === 1}
                    className="px-3 py-1 bg-[var(--bg-body)] border border-[var(--border-light)] rounded hover:bg-[var(--bg-surface)] disabled:opacity-50"
                  >
                    ← Previous
                  </button>
                  <span className="px-3 py-1">{jobsPage}</span>
                  <button
                    onClick={() => setJobsPage(p => Math.min(jobsTotalPages, p + 1))}
                    disabled={jobsPage === jobsTotalPages}
                    className="px-3 py-1 bg-[var(--bg-body)] border border-[var(--border-light)] rounded hover:bg-[var(--bg-surface)] disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-lg p-12 text-center">
            {jobsStatusFilter === "failed" ? (
              <p className="text-[var(--text-secondary)]">🎉 No failed jobs! Everything is running smoothly.</p>
            ) : jobsStatusFilter === "pending" ? (
              <p className="text-[var(--text-secondary)]">✅ No jobs waiting. All tasks are processed.</p>
            ) : (
              <p className="text-[var(--text-secondary)]">No background jobs yet.<br/>Jobs will appear here as students use the platform.</p>
            )}
          </div>
        )}
      </div>

      <BlockedStudentsView />
      <AiReviewLogsView />

      <JobDetailsDrawer
        jobId={selectedJob?.id || null}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <Info className="w-5 h-5 text-blue-400" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
