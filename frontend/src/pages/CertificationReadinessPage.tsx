import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, Lock, Trophy,
  BookOpen, PencilLine, Code2, ListChecks, FlaskConical, Flag, Loader2,
} from 'lucide-react';
import { authFetch } from '../authClient';
import { COURSE_FULL_NAMES } from '../data/courseNames';
import { useAuth } from '../auth';

interface ConditionDetail {
  done: number;
  required: number;
  passed: boolean;
}

interface EligibilityConditions {
  lecturesCompleted: ConditionDetail;
  practiceCompleted: ConditionDetail;
  tryItEngaged: ConditionDetail;
  quizzesPassed: ConditionDetail;
  problemsSubmitted: ConditionDetail;
  finalProjectApproved: { done: number; passed: boolean };
  milestonesCompleted?: ConditionDetail;
}

interface LectureBreakdownRow {
  number: number;
  title: string;
  lectureCompleted: boolean;
  practiceCompleted: boolean;
  tryIt: { required: boolean; done: boolean };
  quizPassed: boolean;
}

interface ReadinessResult {
  eligible: boolean;
  alreadyIssued: boolean;
  conditions: EligibilityConditions;
  lectureBreakdown: LectureBreakdownRow[];
}

const PILLARS: {
  key: keyof EligibilityConditions;
  label: string;
  description: string;
  icon: typeof BookOpen;
}[] = [
  { key: 'lecturesCompleted', label: 'Lectures Watched', description: 'Finish every lecture in the course.', icon: BookOpen },
  { key: 'practiceCompleted', label: 'Practice Exercises', description: 'Complete the practice exercise in each lecture.', icon: PencilLine },
  { key: 'tryItEngaged', label: 'Try-It-Yourself', description: 'Actually run the code — time spent is tracked, not just opened.', icon: FlaskConical },
  { key: 'quizzesPassed', label: 'Quizzes', description: 'Pass every lecture quiz at 70% or higher.', icon: ListChecks },
  { key: 'problemsSubmitted', label: 'Problems Solved', description: 'Solve the required coding problems across the course.', icon: Code2 },
  { key: 'milestonesCompleted', label: 'Milestone Projects', description: 'Get every milestone project approved.', icon: Flag },
];

function PillarRow({
  label, description, icon: Icon, done, required, passed,
}: {
  label: string;
  description: string;
  icon: typeof BookOpen;
  done: number;
  required: number;
  passed: boolean;
}) {
  const pct = required > 0 ? Math.min(100, Math.round((done / required) * 100)) : 100;
  return (
    <div className="flex items-start gap-4 py-4 border-b border-[var(--border-light)] last:border-b-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
        passed
          ? 'bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success)]'
          : 'bg-[var(--surface-container)] border-[var(--border-light)] text-[var(--text-muted)]'
      }`}>
        {passed ? <CheckCircle2 size={18} /> : <Icon size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-bold text-[var(--text-primary)]">{label}</h4>
          <span className={`text-xs font-semibold tabular-nums ${passed ? 'text-[var(--success)]' : 'text-[var(--text-secondary)]'}`}>
            {done}/{required}
          </span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>
        <div className="h-1.5 rounded-full bg-[var(--surface-container)] mt-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${passed ? 'bg-[var(--success)]' : 'bg-[var(--brand-primary)]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function CertificationReadinessPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [data, setData] = useState<ReadinessResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    authFetch<ReadinessResult>(`/certifications/${slug}/readiness`)
      .then(setData)
      .catch((err) => setError(err.message ?? 'Failed to load certification readiness'))
      .finally(() => setLoading(false));
  }, [slug]);

  const courseName = slug ? (COURSE_FULL_NAMES[slug] ?? slug) : '';
  const hasMilestones = !!data?.conditions.milestonesCompleted;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface-page)] flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--surface-page)] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-[var(--text-secondary)]">{error ?? 'Something went wrong loading your readiness data.'}</p>
        <button
          onClick={() => navigate(`/course/${slug}`)}
          className="text-xs font-bold px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white"
        >
          Back to Course
        </button>
      </div>
    );
  }

  const finalProjectPillar = data.conditions.finalProjectApproved;

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)] flex flex-col font-sans">
      <header className="border-b border-[var(--border-light)] bg-[var(--surface-card)]/80 backdrop-blur-md flex-shrink-0 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(`/course/${slug}`)}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 bg-[var(--surface-container)] hover:bg-[var(--surface-card-hover)] px-3 py-1.5 rounded-lg border border-[var(--border-light)] font-medium"
          >
            <ArrowLeft size={14} />
            Back to Course
          </button>
          <span className="text-xs font-semibold text-[var(--text-secondary)]">{courseName}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#F8FCFD] to-[var(--surface-page)]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* ── Explainer ── */}
          <div className="text-center mb-12">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand-primary)] bg-[rgba(0,191,179,0.08)] px-4 py-1.5 rounded-full border border-[rgba(0,191,179,0.2)]">
              Certification Readiness
            </span>
            <h1 className="text-3xl font-extrabold mt-5 tracking-tight">
              How Your <span className="text-[var(--brand-primary)]">Certificate</span> Is Graded
            </h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed mt-3">
              Your certificate is earned, not handed out. It's based on real engagement across the course —
              {hasMilestones
                ? ' lectures, practice, try-it engagement, quizzes, problems, milestone projects, and your final project.'
                : ' lectures, practice, try-it engagement, quizzes, problems, and your final project.'}
              {' '}Finish everything below, then move on to your final project.
            </p>
          </div>

          {/* ── Overall pillars ── */}
          <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 shadow-sm mb-10">
            <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Overall Progress</h2>
            <div>
              {PILLARS.filter((p) => data.conditions[p.key]).map((p) => {
                const c = data.conditions[p.key] as ConditionDetail;
                return (
                  <PillarRow
                    key={p.key}
                    label={p.label}
                    description={p.description}
                    icon={p.icon}
                    done={c.done}
                    required={c.required}
                    passed={c.passed}
                  />
                );
              })}
              <div className="flex items-start gap-4 py-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  finalProjectPillar.passed
                    ? 'bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success)]'
                    : 'bg-[var(--surface-container)] border-[var(--border-light)] text-[var(--text-muted)]'
                }`}>
                  {finalProjectPillar.passed ? <CheckCircle2 size={18} /> : <Trophy size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Final Project</h4>
                    <span className={`text-xs font-semibold ${finalProjectPillar.passed ? 'text-[var(--success)]' : 'text-[var(--text-secondary)]'}`}>
                      {finalProjectPillar.passed ? 'Approved' : 'Not yet approved'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Submit and get your final project approved by review.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Per-lecture checklist ── */}
          <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 shadow-sm mb-10">
            <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Per-Lecture Checklist</h2>
            <div className="space-y-2">
              {data.lectureBreakdown.map((lec) => {
                const tryItOk = !lec.tryIt.required || lec.tryIt.done;
                const complete = lec.lectureCompleted && lec.practiceCompleted && tryItOk && lec.quizPassed;
                return (
                  <div
                    key={lec.number}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                      complete
                        ? 'border-[var(--success)]/20 bg-[var(--success)]/5'
                        : 'border-[var(--border-light)] bg-[var(--surface-container)]/40'
                    }`}
                  >
                    <div className="w-6 shrink-0">
                      {complete ? (
                        <CheckCircle2 size={18} className="text-[var(--success)]" />
                      ) : (
                        <Circle size={18} className="text-[var(--border-medium)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {lec.number}. {lec.title}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <StatusChip label="Watched" ok={lec.lectureCompleted} />
                      <StatusChip label="Practice" ok={lec.practiceCompleted} />
                      <StatusChip label="Try-It" ok={tryItOk} muted={!lec.tryIt.required} />
                      <StatusChip label="Quiz" ok={lec.quizPassed} />
                    </div>
                    {!complete && (
                      <button
                        onClick={() => navigate(`/course/${slug}/lecture/${lec.number}`)}
                        className="text-[11px] font-bold text-[var(--brand-primary)] hover:text-[var(--brand-primary-dark)] px-3 py-1.5 rounded-lg bg-[var(--brand-primary)]/10 hover:bg-[var(--brand-primary)]/20 border border-[var(--brand-primary)]/20 transition-all shrink-0"
                      >
                        Finish
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {!data.conditions.problemsSubmitted.passed && (
              <div className="mt-4 pt-4 border-t border-[var(--border-light)] flex items-center justify-between gap-3">
                <p className="text-xs text-[var(--text-secondary)]">
                  Problems Solved is tracked course-wide ({data.conditions.problemsSubmitted.done}/{data.conditions.problemsSubmitted.required}) — revisit any lecture's Problems section to keep solving.
                </p>
              </div>
            )}
          </div>

          {/* ── Continue ── */}
          <div className="flex flex-col items-center gap-3 pt-2">
            {data.eligible || isAdmin ? (
              <button
                onClick={() => navigate(`/course/${slug}/capstone`)}
                className="inline-flex items-center gap-2 text-sm font-bold px-8 py-3.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white shadow-md shadow-[var(--brand-primary)]/20 transition-all"
              >
                Continue to Final Project
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-2 text-sm font-bold px-8 py-3.5 rounded-xl bg-[var(--surface-container)] text-[var(--text-muted)] border border-[var(--border-light)] cursor-not-allowed"
              >
                <Lock size={16} />
                Finish Everything Above to Unlock Final Project
              </button>
            )}
            {!data.eligible && isAdmin && (
              <p className="text-xs text-[var(--warning)]">Admin override — a real student would still see this locked until every item above is complete.</p>
            )}
            {!data.eligible && !isAdmin && (
              <p className="text-xs text-[var(--text-muted)]">You can come back any time — nothing here expires.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusChip({ label, ok, muted }: { label: string; ok: boolean; muted?: boolean }) {
  if (muted) {
    return (
      <span className="text-[9px] font-bold px-2 py-1 rounded-md bg-[var(--surface-container)] text-[var(--text-muted)] border border-[var(--border-light)] uppercase tracking-wide">
        {label}
      </span>
    );
  }
  return (
    <span className={`text-[9px] font-bold px-2 py-1 rounded-md border uppercase tracking-wide ${
      ok
        ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20'
        : 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20'
    }`}>
      {label}
    </span>
  );
}
