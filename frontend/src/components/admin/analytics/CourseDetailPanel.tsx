import React from 'react';
import { Clock, Users, Activity, Medal, AlertTriangle } from 'lucide-react';

interface LessonFunnel {
  lessonId: string;
  lessonTitle: string;
  order: number;
  studentsReached: number;
  completionRate: number;
  isDropOff?: boolean;
}

interface CourseDetailPanelProps {
  courseId: string;
  funnel: LessonFunnel[];
  metrics: {
    completionRate: number;
    enrolledCount: number;
    avgDays: string | number;
    fastestDays: string | number;
    slowestDays: string | number;
    activeThisWeek: number;
    quizPassRate: number;
  };
  recentActivity: Array<{
    text: string;
    time: string;
    icon: string;
  }>;
}

export function CourseDetailPanel({ funnel, metrics, recentActivity }: CourseDetailPanelProps) {
  const platformAvgCompletion = 62; // Mock platform average

  return (
    <div className="bg-[var(--bg-body)] border-l-4 border-[var(--color-primary)] p-6 text-[var(--text-main)] grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Lesson Completion Funnel */}
      <div className="lg:col-span-1">
        <h3 className="text-lg font-bold mb-1 text-[var(--color-brand-navy)]">Lesson Completion Funnel</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">Where students drop off</p>
        
        <div className="space-y-4">
          {funnel.length === 0 ? (
            <p className="text-[var(--text-muted)] italic">No funnel data available</p>
          ) : (
            funnel.map((lesson) => (
              <div key={lesson.lessonId} className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium flex items-center">
                    Lesson {lesson.order}: {lesson.lessonTitle}
                    {lesson.isDropOff && (
                      <AlertTriangle className="w-4 h-4 text-yellow-500 ml-2" />
                    )}
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    {lesson.completionRate}% ({lesson.studentsReached} students)
                  </span>
                </div>
                <div className="w-full bg-[var(--bg-dark-surface)] rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      lesson.completionRate > 70 ? 'bg-green-500' : 
                      lesson.completionRate > 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, lesson.completionRate))}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column - Key Metrics */}
      <div className="lg:col-span-1">
        <h3 className="text-lg font-bold mb-1 text-[var(--color-brand-navy)]">Course Health</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">Key metrics overview</p>
        
        <div className="space-y-4">
          {/* Completion Rate */}
          <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border-light)]">
            <div className="text-sm text-[var(--text-secondary)] mb-1">Completion Rate</div>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-2xl font-bold text-[var(--color-brand-navy)]">{metrics.completionRate}%</span>
              <div className="w-24 bg-[var(--bg-dark-surface)] rounded-full h-1.5 mb-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    metrics.completionRate > 70 ? 'bg-green-500' : 
                    metrics.completionRate > 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, metrics.completionRate))}%` }}
                ></div>
              </div>
            </div>
            <div className="text-xs text-[var(--text-secondary)] flex items-center justify-between">
              <span>Platform avg: {platformAvgCompletion}%</span>
              {metrics.completionRate >= platformAvgCompletion ? (
                <span className="text-green-500 flex items-center">↑ Above avg</span>
              ) : (
                <span className="text-red-500 flex items-center">↓ Below avg</span>
              )}
            </div>
          </div>

          {/* Avg Time to Complete */}
          <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border-light)]">
            <div className="text-sm text-[var(--text-secondary)] mb-1">Avg Time to Complete</div>
            <div className="text-2xl font-bold mb-2 text-[var(--color-brand-navy)]">{metrics.avgDays} {typeof metrics.avgDays === 'number' && 'days'}</div>
            <div className="text-xs text-[var(--text-secondary)] flex justify-between">
              <span>Fastest: {metrics.fastestDays} {typeof metrics.fastestDays === 'number' && 'days'}</span>
              <span>Slowest: {metrics.slowestDays} {typeof metrics.slowestDays === 'number' && 'days'}</span>
            </div>
          </div>

          {/* Active This Week */}
          <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border-light)]">
            <div className="text-sm text-[var(--text-secondary)] mb-1">Active This Week</div>
            <div className="text-2xl font-bold mb-1 text-[var(--color-brand-navy)]">{metrics.activeThisWeek} students</div>
            <div className="text-xs text-[var(--text-secondary)]">
              of {metrics.enrolledCount} enrolled ({metrics.enrolledCount > 0 ? Math.round((metrics.activeThisWeek / metrics.enrolledCount) * 100) : 0}%)
            </div>
          </div>

          {/* Quiz Pass Rate */}
          <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border-light)]">
            <div className="text-sm text-[var(--text-secondary)] mb-1">Quiz Pass Rate</div>
            <div className="text-2xl font-bold mb-1 text-[var(--color-brand-navy)]">{metrics.quizPassRate}%</div>
            <div className="text-xs text-[var(--text-secondary)]">
              across all quizzes
            </div>
          </div>
        </div>
      </div>

      {/* Bottom - Recent Activity */}
      <div className="lg:col-span-1">
        <h3 className="text-lg font-bold mb-1 text-[var(--color-brand-navy)]">Recent Activity</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">Last 24h</p>
        
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <p className="text-[var(--text-muted)] italic">No recent activity</p>
          ) : (
            recentActivity.map((activity, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="mt-0.5">
                  {activity.icon === 'certificate' && <Medal className="w-4 h-4 text-[var(--color-primary)]" />}
                  {activity.icon === 'quiz' && <Activity className="w-4 h-4 text-[var(--color-primary)]" />}
                  {activity.icon === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                  {activity.icon === 'completion' && <Medal className="w-4 h-4 text-green-400" />}
                </div>
                <div>
                  <p className="text-sm text-[var(--text-main)]">{activity.text}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{activity.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
