import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, BookOpen, Target, Award, ShieldAlert, AlertTriangle } from 'lucide-react';
import { authFetch } from '../../../authClient';

export function GlobalDashboard({ period }: { period: string }) {
  const [data, setData] = useState<{
    courses?: any;
    assessments?: any;
    exercises?: any;
    aiReviews?: any;
    certificates?: any;
  }>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAllData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const endpoints = [
        { key: 'courses', url: `/admin/analytics/courses?period=${period}` },
        { key: 'assessments', url: `/admin/analytics/assessments?period=${period}` },
        { key: 'exercises', url: `/admin/analytics/exercises?period=${period}` },
        { key: 'aiReviews', url: `/admin/analytics/ai-reviews?period=${period}` },
        { key: 'certificates', url: `/admin/analytics/certificates?period=${period}` },
      ];

      const results = await Promise.allSettled(
        endpoints.map(ep => authFetch(ep.url))
      );

      const newData: any = {};
      endpoints.forEach((ep, i) => {
        const result = results[i];
        if (result.status === 'fulfilled') {
          newData[ep.key] = result.value;
        } else {
          console.error(`Failed to fetch ${ep.key}:`, result.reason);
          newData[ep.key] = { error: true };
        }
      });

      setData(newData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData(true);
    
    // 60-second polling
    const interval = setInterval(() => {
      fetchAllData(false);
    }, 60000);

    return () => clearInterval(interval);
  }, [period]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-6 h-32"></div>
        ))}
      </div>
    );
  }

  // Safe extraction of metrics with fallbacks for partial failures
  const coursesSummary = data.courses?.summary || {};
  const assessmentsSummary = data.assessments?.summary || {};
  const exercisesSummary = data.exercises?.summary || {};
  const aiReviewsSummary = data.aiReviews?.summary || {};
  const certificatesSummary = data.certificates?.summary || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--color-brand-navy)]">Platform Overview</h2>
        <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 bg-[var(--bg-surface)] px-3 py-1.5 rounded-full border border-[var(--border-light)]">
          <RefreshCw className="w-3 h-3 animate-spin-slow" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Students KPI */}
        <div className="group bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5 flex items-start gap-4">
          <div className="p-3 bg-[var(--color-brand-navy)] text-[var(--bg-body)] rounded-lg group-hover:bg-[var(--color-primary)] transition-colors duration-200">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[var(--text-secondary)] text-sm mb-1">Active Students</div>
            <div className="text-2xl font-bold text-[var(--color-brand-navy)]">
              {coursesSummary.activeStudents?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Across {coursesSummary.totalCourses || 0} courses</div>
          </div>
        </div>

        {/* Enrollments KPI */}
        <div className="group bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5 flex items-start gap-4">
          <div className="p-3 bg-[var(--color-brand-navy)] text-[var(--bg-body)] rounded-lg group-hover:bg-[var(--color-primary)] transition-colors duration-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[var(--text-secondary)] text-sm mb-1">Total Enrollments</div>
            <div className="text-2xl font-bold text-[var(--color-brand-navy)]">
              {coursesSummary.totalEnrollments?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{coursesSummary.avgCompletionRate || 0}% avg completion</div>
          </div>
        </div>

        {/* Assessment Pass Rate */}
        <div className="group bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5 flex items-start gap-4">
          <div className="p-3 bg-[var(--color-brand-navy)] text-[var(--bg-body)] rounded-lg group-hover:bg-[var(--color-primary)] transition-colors duration-200">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[var(--text-secondary)] text-sm mb-1">Assessment Pass Rate</div>
            <div className="text-2xl font-bold text-[var(--color-brand-navy)]">
              {assessmentsSummary.overallPassRate || 0}%
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">From {assessmentsSummary.totalAttempts?.toLocaleString() || 0} attempts</div>
          </div>
        </div>

        {/* Exercise Mastery Rate */}
        <div className="group bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5 flex items-start gap-4">
          <div className="p-3 bg-[var(--color-brand-navy)] text-[var(--bg-body)] rounded-lg group-hover:bg-[var(--color-primary)] transition-colors duration-200">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[var(--text-secondary)] text-sm mb-1">Exercise Mastery Rate</div>
            <div className="text-2xl font-bold text-[var(--color-brand-navy)]">
              {exercisesSummary.avgMasteryRate || 0}%
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Avg {exercisesSummary.avgAttemptsPerExercise || 0} attempts per ex.</div>
          </div>
        </div>

        {/* Certificates Issued */}
        <div className="group bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5 flex items-start gap-4">
          <div className="p-3 bg-[var(--color-brand-navy)] text-[var(--bg-body)] rounded-lg group-hover:bg-[var(--color-primary)] transition-colors duration-200">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[var(--text-secondary)] text-sm mb-1">Certificates Issued</div>
            <div className="text-2xl font-bold text-[var(--color-brand-navy)]">
              {certificatesSummary.totalCertificates?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              {certificatesSummary.overallAvgDays ? `${certificatesSummary.overallAvgDays} days avg time to cert` : 'No data yet'}
            </div>
          </div>
        </div>

        {/* AI Review Accuracy */}
        <div className="group bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5 flex items-start gap-4">
          <div className="p-3 bg-[var(--color-brand-navy)] text-[var(--bg-body)] rounded-lg group-hover:bg-[var(--color-primary)] transition-colors duration-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[var(--text-secondary)] text-sm mb-1">AI Review Accuracy</div>
            <div className="text-2xl font-bold text-[var(--color-brand-navy)]">
              {aiReviewsSummary.accuracyRate || 100}%
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              {aiReviewsSummary.overrideRate || 0}% manual override rate
            </div>
          </div>
        </div>
      </div>
      
      {/* System Health / Status Section */}
      <div className="bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg p-5 mt-6">
        <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-[var(--text-secondary)]">Data Source Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <HealthIndicator name="Courses" hasError={data.courses?.error} />
          <HealthIndicator name="Assessments" hasError={data.assessments?.error} />
          <HealthIndicator name="Exercises" hasError={data.exercises?.error} />
          <HealthIndicator name="AI Reviews" hasError={data.aiReviews?.error} />
          <HealthIndicator name="Certificates" hasError={data.certificates?.error} />
        </div>
      </div>
    </div>
  );
}

function HealthIndicator({ name, hasError }: { name: string, hasError: boolean }) {
  if (hasError) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--text-main)] bg-red-500/10 px-3 py-2 rounded">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{name}</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--text-main)] bg-green-500/10 px-3 py-2 rounded">
      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
      <span className="truncate">{name}</span>
    </div>
  );
}
