import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../authClient";

type ReviewStatus = "pending" | "in_progress" | "completed";

interface ReviewItem {
  status: ReviewStatus;
  reviewedBy: string;
  reviewDate: string | null;
  notes: string;
}

interface CourseQA {
  lecturesReviewed: ReviewItem;
  exercisesReviewed: ReviewItem;
  assessmentsReviewed: ReviewItem;
  projectsReviewed: ReviewItem;
  certificateTested: ReviewItem;
  e2eFlowTested: ReviewItem;
}

interface QACourseSummary {
  slug: string;
  title: string;
  healthScore: number;
  completedItems: number;
  totalItems: number;
  inProgress: number;
  qa: CourseQA;
}

interface ValidationResult {
  check: string;
  passed: boolean;
  details: string;
}

type ReviewItemKey = keyof CourseQA;

const REVIEW_LABELS: Record<ReviewItemKey, string> = {
  lecturesReviewed: "Lectures Reviewed",
  exercisesReviewed: "Exercises Reviewed",
  assessmentsReviewed: "Assessments Reviewed",
  projectsReviewed: "Projects Reviewed",
  certificateTested: "Certificate Tested",
  e2eFlowTested: "End-to-End Flow Tested",
};

const STATUS_BADGE: Record<ReviewStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-slate-800", text: "text-slate-400", label: "Pending" },
  in_progress: { bg: "bg-amber-900/40", text: "text-amber-300", label: "In Progress" },
  completed: { bg: "bg-emerald-900/40", text: "text-emerald-300", label: "Completed" },
};

const STATUS_ICON: Record<ReviewStatus, string> = {
  pending: "○",
  in_progress: "◐",
  completed: "●",
};

function HealthRing({ score, size = 80 }: { score: number; size?: number }) {
  const stroke = size * 0.08;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#1e293b"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-700"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#f8fafc"
        fontSize={size * 0.22}
        fontWeight="bold"
      >
        {score}%
      </text>
    </svg>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const s = STATUS_BADGE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {STATUS_ICON[status]} {s.label}
    </span>
  );
}

function QACenterDashboard() {
  const [courses, setCourses] = useState<QACourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[] | null>(null);
  const [validating, setValidating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadCourses = useCallback(async () => {
    try {
      const data = await authFetch<QACourseSummary[]>("/qa/courses");
      setCourses(data);
    } catch (err) {
      console.error("Failed to load QA courses", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses, refreshKey]);

  const totalCourses = courses.length;
  const readyForRelease = courses.filter((c) => c.healthScore === 100).length;
  const requiringReview = courses.filter((c) => c.healthScore < 100).length;
  const totalIssues = courses.reduce((acc, c) => acc + (c.totalItems - c.completedItems), 0);

  const handleStatusChange = async (slug: string, item: ReviewItemKey, status: ReviewStatus) => {
    try {
      await authFetch(`/qa/courses/${slug}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, status }),
      });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Failed to update review", err);
    }
  };

  const handleNotesChange = async (slug: string, item: ReviewItemKey, notes: string) => {
    try {
      await authFetch(`/qa/courses/${slug}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, notes }),
      });
    } catch (err) {
      console.error("Failed to update notes", err);
    }
  };

  const handleValidate = async (slug: string) => {
    setValidating(true);
    setValidationResults(null);
    try {
      const data = await authFetch<{ slug: string; results: ValidationResult[]; totalIssues: number }>(
        `/qa/courses/${slug}/validate`,
        { method: "POST" }
      );
      setValidationResults(data.results);
    } catch (err) {
      console.error("Validation failed", err);
    } finally {
      setValidating(false);
    }
  };

  const nextStatus = (current: ReviewStatus): ReviewStatus => {
    if (current === "pending") return "in_progress";
    if (current === "in_progress") return "completed";
    return "pending";
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading QA Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1 text-xs text-amber-400 mb-4 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Admin
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Course QA Center
          </h1>
          <p className="text-slate-400 text-sm">
            Verify the quality and completeness of every course before release.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Courses</span>
            </div>
            <div className="text-3xl font-extrabold text-white">{totalCourses}</div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ready for Release</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">{readyForRelease}</div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Requiring Review</span>
            </div>
            <div className="text-3xl font-extrabold text-amber-400">{requiringReview}</div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Validation Issues</span>
            </div>
            <div className="text-3xl font-extrabold text-red-400">{totalIssues}</div>
          </div>
        </div>

        {/* Course List */}
        <div className="bg-[#0c101b]/80 border border-slate-800/60 rounded-3xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-white tracking-tight mb-6">Courses</h2>

          {courses.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-sm">No courses available.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {courses.map((course) => {
                const isSelected = selectedSlug === course.slug;
                const showDetail = isSelected;
                return (
                  <div key={course.slug}>
                    <button
                      type="button"
                      onClick={() => setSelectedSlug(isSelected ? null : course.slug)}
                      className="w-full text-left"
                    >
                      <div className={`flex items-center gap-4 bg-slate-950/40 border rounded-2xl p-5 transition-all duration-200 hover:border-slate-700/60 ${isSelected ? 'border-blue-500/40 bg-blue-500/5' : 'border-slate-800/60'}`}>
                        <HealthRing score={course.healthScore} size={56} />
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-bold text-base">{course.title}</div>
                          <div className="text-xs text-slate-400 mt-1">
                            {course.completedItems}/{course.totalItems} checklist items completed
                            {course.inProgress > 0 && ` (${course.inProgress} in progress)`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            course.healthScore === 100
                              ? "bg-emerald-900/40 text-emerald-300"
                              : course.healthScore >= 50
                                ? "bg-amber-900/40 text-amber-300"
                                : "bg-red-900/40 text-red-300"
                          }`}>
                            {course.healthScore === 100 ? "Ready" : course.healthScore >= 50 ? "In Progress" : "Needs Work"}
                          </div>
                          <svg className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isSelected ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {showDetail && (
                      <div className="mt-3 ml-4 pl-6 border-l-2 border-blue-500/20 space-y-6 pb-4">
                        {/* QA Checklist */}
                        <div className="bg-slate-950/30 border border-slate-800/40 rounded-2xl p-5">
                          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            Review Checklist
                          </h3>
                          <div className="space-y-3">
                            {(Object.keys(REVIEW_LABELS) as ReviewItemKey[]).map((key) => {
                              const item = course.qa[key];
                              return (
                                <div key={key} className="flex items-start gap-4 p-3 rounded-xl bg-slate-900/30 border border-slate-800/30">
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(course.slug, key, nextStatus(item.status))}
                                    className="flex-shrink-0 mt-0.5"
                                  >
                                    <StatusBadge status={item.status} />
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-slate-200">{REVIEW_LABELS[key]}</div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                                      {item.reviewedBy && <span>By: {item.reviewedBy}</span>}
                                      {item.reviewDate && <span>Date: {new Date(item.reviewDate).toLocaleDateString()}</span>}
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Add notes..."
                                      value={item.notes}
                                      onChange={(e) => handleNotesChange(course.slug, key, e.target.value)}
                                      className="mt-2 w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Validate Action */}
                        <div className="bg-slate-950/30 border border-slate-800/40 rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Course Validation
                            </h3>
                            <button
                              type="button"
                              onClick={() => handleValidate(course.slug)}
                              disabled={validating}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
                            >
                              {validating ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Validating...
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Validate Course
                                </>
                              )}
                            </button>
                          </div>

                          {validationResults && (
                            <div className="space-y-2">
                              {validationResults.map((result, i) => (
                                <div
                                  key={i}
                                  className={`flex items-start gap-3 p-3 rounded-xl border ${
                                    result.passed
                                      ? "bg-emerald-900/10 border-emerald-800/20"
                                      : "bg-red-900/10 border-red-800/20"
                                  }`}
                                >
                                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                    result.passed
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-red-500/20 text-red-400"
                                  }`}>
                                    {result.passed ? "✓" : "✗"}
                                  </span>
                                  <div>
                                    <div className={`text-sm font-semibold ${
                                      result.passed ? "text-emerald-300" : "text-red-300"
                                    }`}>
                                      {result.check}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-0.5">{result.details}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Health Score Detail */}
                        <div className="bg-slate-950/30 border border-slate-800/40 rounded-2xl p-5">
                          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Health Score Breakdown
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {(Object.keys(REVIEW_LABELS) as ReviewItemKey[]).map((key) => {
                              const item = course.qa[key];
                              const isComplete = item.status === "completed";
                              return (
                                <div key={key} className={`p-3 rounded-xl border ${isComplete ? 'bg-emerald-900/10 border-emerald-800/20' : 'bg-slate-900/30 border-slate-800/30'}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-slate-400">{REVIEW_LABELS[key]}</span>
                                    <span className={`text-xs font-bold ${isComplete ? 'text-emerald-400' : 'text-slate-500'}`}>
                                      {isComplete ? '100%' : '0%'}
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                      style={{ width: isComplete ? '100%' : '0%' }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QACenterDashboard;
