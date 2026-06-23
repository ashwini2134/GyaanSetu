import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, LayoutDashboard, CheckCircle2, XCircle, Clock, Download, ShieldCheck } from 'lucide-react';
import { authFetch } from '../authClient';
import { useAuth } from '../auth';

const COURSE_LABELS: Record<string, string> = {
  python:  'CS50P: Introduction to Python',
  cs50ai:  'CS50 AI with Python',
};

interface IssuedCert {
  id: string;
  courseSlug: string;
  certNumber: string;
  issuedAt: string;
  avgScore: number | null;
}

interface ConditionRow {
  done: number;
  required?: number;
  passed: boolean;
}

interface EligibilityResult {
  eligible: boolean;
  alreadyIssued: boolean;
  conditions: {
    lecturesCompleted:  ConditionRow;
    practiceCompleted:  ConditionRow;
    quizzesAttempted:   ConditionRow;
    problemsSubmitted:  ConditionRow;
    projectCompleted:   ConditionRow;
  };
  avgQuizScore: number | null;
}

interface EligibleStudent {
  userId: string;
  name: string;
  email: string;
  courseSlug: string;
  avgQuizScore: number | null;
}

const CONDITION_LABELS: Record<string, string> = {
  lecturesCompleted: 'All lectures completed',
  practiceCompleted: 'All practice exercises done',
  quizzesAttempted:  'Quiz attempted for every lecture',
  problemsSubmitted: 'Problems submitted',
  projectCompleted:  'Capstone project submitted',
};

function ConditionList({ conditions }: { conditions: EligibilityResult['conditions'] }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {(Object.entries(conditions) as [string, ConditionRow][]).map(([key, val]) => (
        <li key={key} className="flex items-center gap-2 text-xs">
          {val.passed
            ? <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
            : <XCircle     size={13} className="text-slate-600    flex-shrink-0" />}
          <span className={val.passed ? 'text-slate-300' : 'text-slate-500'}>
            {CONDITION_LABELS[key]}
            {val.required !== undefined && (
              <span className="ml-1 text-slate-500">({val.done}/{val.required})</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function CertificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [certs,       setCerts]       = useState<IssuedCert[]>([]);
  const [eligibility, setEligibility] = useState<Record<string, EligibilityResult>>({});
  const [eligible,    setEligible]    = useState<EligibleStudent[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [issuing,     setIssuing]     = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setError(null);
      try {
        const [certsRes, eligRes] = await Promise.all([
          authFetch<{ certificates: IssuedCert[] }>('/certifications'),
          authFetch<{ eligibility: Record<string, EligibilityResult> }>('/certifications/eligibility'),
        ]);
        setCerts(certsRes.certificates ?? []);
        setEligibility(eligRes.eligibility ?? {});

        if (isAdmin) {
          try {
            const adminRes = await authFetch<{ eligible: EligibleStudent[] }>('/certifications/admin/eligible');
            setEligible(adminRes.eligible ?? []);
          } catch { /* admin panel gracefully hidden */ }
        }
      } catch (err: any) {
        setError(err?.message ?? 'Could not load certification data. Make sure the backend is running.');
      }
      setLoading(false);
    }
    load();
  }, [isAdmin]);

  async function handleIssue(userId: string, courseSlug: string) {
    const key = `${userId}:${courseSlug}`;
    setIssuing(key);
    try {
      await authFetch('/certifications/admin/issue', {
        method: 'POST',
        body: JSON.stringify({ userId, courseSlug }),
      });
      setEligible(prev => prev.filter(e => !(e.userId === userId && e.courseSlug === courseSlug)));
    } catch (err: any) {
      alert(err?.message ?? 'Failed to issue certificate');
    }
    setIssuing(null);
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5" />
        <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <button onClick={() => navigate('/')} className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              <LayoutDashboard size={12} /> Dashboard
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-medium">Certifications</span>
          </nav>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <Award size={28} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Certifications</h1>
              <p className="text-slate-400 text-sm mt-1">Complete all course requirements to earn your certificate.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-10">

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[0, 1].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6 text-center">
            <XCircle size={32} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-red-300">Failed to load certifications</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{error}</p>
          </div>
        ) : (
          <>
            {/* Issued certificates */}
            {certs.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Award size={18} className="text-amber-400" /> Your Certificates
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {certs.map(cert => (
                    <div key={cert.id} className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Certificate of Completion</p>
                          <h3 className="text-base font-bold text-white mt-1">{COURSE_LABELS[cert.courseSlug] ?? cert.courseSlug}</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            Issued {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            {cert.avgScore !== null && <> · Avg quiz score: <span className="text-slate-300">{cert.avgScore}%</span></>}
                          </p>
                        </div>
                        <CheckCircle2 size={22} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">{cert.certNumber}</p>
                      <a
                        href={`${import.meta.env.VITE_CERTS_APP_URL}/c/${cert.certNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <Download size={13} /> View & Download Certificate
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Per-course eligibility status */}
            <section>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock size={18} className="text-slate-400" /> Course Progress
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.keys(eligibility).length === 0
                  ? Object.keys(COURSE_LABELS).map(slug => (
                      <div key={slug} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                        <h3 className="text-sm font-bold text-white">{COURSE_LABELS[slug]}</h3>
                        <p className="text-xs text-slate-500 mt-3">Progress data unavailable — backend not connected.</p>
                      </div>
                    ))
                  : Object.entries(eligibility).map(([slug, result]) => {
                  const issued = certs.find(c => c.courseSlug === slug);
                  return (
                    <div
                      key={slug}
                      className={`rounded-2xl border p-5 ${
                        issued        ? 'border-amber-500/20 bg-amber-500/5'
                        : result.eligible ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-slate-800 bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-white">{COURSE_LABELS[slug] ?? slug}</h3>
                        {issued ? (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Issued</span>
                        ) : result.eligible ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Eligible</span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">In Progress</span>
                        )}
                      </div>

                      {!issued && <ConditionList conditions={result.conditions} />}

                      {issued && (
                        <p className="text-xs text-slate-400 mt-3">
                          Your certificate has been issued. Check above to download it.
                        </p>
                      )}

                      {!issued && result.eligible && (
                        <p className="text-xs text-emerald-400 mt-3">
                          All requirements met. An admin will review and issue your certificate shortly.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>{/* end grid */}
            </section>

            {/* Admin panel — only visible to admin role */}
            {isAdmin && (
              <section>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-400" /> Admin — Eligible Students
                </h2>
                {eligible.length === 0 ? (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-500">
                    No students are currently eligible for a new certificate.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-left text-xs text-slate-500 uppercase tracking-wider">
                          <th className="px-5 py-3 font-medium">Student</th>
                          <th className="px-5 py-3 font-medium">Course</th>
                          <th className="px-5 py-3 font-medium">Avg Quiz</th>
                          <th className="px-5 py-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {eligible.map((e) => {
                          const key = `${e.userId}:${e.courseSlug}`;
                          return (
                            <tr key={key} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors">
                              <td className="px-5 py-3">
                                <p className="font-medium text-white">{e.name}</p>
                                <p className="text-xs text-slate-500">{e.email}</p>
                              </td>
                              <td className="px-5 py-3 text-slate-300 text-xs">
                                {COURSE_LABELS[e.courseSlug] ?? e.courseSlug}
                              </td>
                              <td className="px-5 py-3 text-slate-300">
                                {e.avgQuizScore !== null ? `${e.avgQuizScore}%` : '—'}
                              </td>
                              <td className="px-5 py-3 text-right">
                                <button
                                  onClick={() => handleIssue(e.userId, e.courseSlug)}
                                  disabled={issuing === key}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
                                >
                                  {issuing === key ? 'Issuing…' : 'Issue Certificate'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
