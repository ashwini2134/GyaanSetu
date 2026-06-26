import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, ChevronRight, Lock, Download, ShieldCheck,
  Sparkles, BookOpen, Brain, ExternalLink,
} from 'lucide-react';
import { authFetch } from '../authClient';
import { useAuth } from '../auth';

/* ─── config ─── */

interface CourseConfig {
  label:      string;
  fullName:   string;
  accent:     string;
  glow:       string;
  icon:       React.ReactNode;
}

const COURSES: Record<string, CourseConfig> = {
  python: {
    label:    'CS50P',
    fullName: 'CS50P: Introduction to Python',
    accent:   '#3B82F6',
    glow:     'rgba(59,130,246,0.35)',
    icon:     <BookOpen size={18} strokeWidth={1.5} />,
  },
  cs50ai: {
    label:    'CS50 AI',
    fullName: 'CS50 AI with Python',
    accent:   '#A855F7',
    glow:     'rgba(168,85,247,0.35)',
    icon:     <Brain size={18} strokeWidth={1.5} />,
  },
};

/* ─── types ─── */

interface IssuedCert {
  id: string;
  courseSlug: string;
  certNumber: string;
  issuedAt: string;
  avgScore: number | null;
  capstoneTitle?: string | null;
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

/* ─── helpers ─── */

function remainingItems(conditions: EligibilityResult['conditions']): string[] {
  const items: string[] = [];
  if (!conditions.lecturesCompleted.passed) {
    const { done, required } = conditions.lecturesCompleted;
    items.push(`${(required ?? 0) - done} lecture${(required ?? 0) - done !== 1 ? 's' : ''} left to watch`);
  }
  if (!conditions.practiceCompleted.passed) {
    const { done, required } = conditions.practiceCompleted;
    items.push(`${(required ?? 0) - done} practice exercise${(required ?? 0) - done !== 1 ? 's' : ''} remaining`);
  }
  if (!conditions.quizzesAttempted.passed) {
    const { done, required } = conditions.quizzesAttempted;
    items.push(`${(required ?? 0) - done} quiz${(required ?? 0) - done !== 1 ? 'zes' : ''} not yet attempted`);
  }
  if (!conditions.problemsSubmitted.passed) {
    const { done, required } = conditions.problemsSubmitted;
    items.push(`${(required ?? 0) - done} problem${(required ?? 0) - done !== 1 ? 's' : ''} still to submit`);
  }
  if (!conditions.projectCompleted.passed) {
    items.push('Capstone project not yet submitted');
  }
  return items;
}

function overallPct(conditions: EligibilityResult['conditions']): number {
  // weighted by total items where applicable
  const rows = Object.values(conditions);
  let total = 0, done = 0;
  rows.forEach(r => {
    const max = r.required ?? 1;
    total += max;
    done  += Math.min(r.done, max);
  });
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

/* ─── page ─── */

export default function CertificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin  = user?.role === 'admin';

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
            const r = await authFetch<{ eligible: EligibleStudent[] }>('/certifications/admin/eligible');
            setEligible(r.eligible ?? []);
          } catch { /* hidden */ }
        }
      } catch (err: any) {
        setError(err?.message ?? 'Could not load certification data.');
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

      {/* ── header ── */}
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-8 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-slate-600 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-slate-400 transition-colors">Dashboard</button>
          <ChevronRight size={11} className="text-slate-700" />
          <span className="text-slate-400">Certifications</span>
        </nav>
        <h1 className="text-2xl font-black text-white tracking-tight">Your Certificates</h1>
        <p className="text-slate-500 text-sm mt-1">Finish a course to earn a verified certificate you can share anywhere.</p>
      </div>

      <div className="max-w-3xl mx-auto px-5 md:px-8 py-8 space-y-8">

        {/* loading */}
        {loading && (
          <>{[0,1].map(i => <div key={i} className="h-96 rounded-3xl bg-slate-900/50 border border-slate-800 animate-pulse" />)}</>
        )}

        {/* error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-900/30 bg-red-950/15 p-8 text-center">
            <p className="text-sm font-semibold text-red-300 mb-1">Couldn't load your data</p>
            <p className="text-xs text-slate-500">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {Object.keys(COURSES).map(slug => (
              <CertBlock
                key={slug}
                slug={slug}
                studentName={user?.name ?? 'Student'}
                result={eligibility[slug] ?? null}
                cert={certs.find(c => c.courseSlug === slug) ?? null}
              />
            ))}

            {/* admin panel */}
            {isAdmin && eligible.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2">
                  <ShieldCheck size={13} /> Pending issuance
                </p>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden divide-y divide-slate-800/60">
                  {eligible.map(e => {
                    const key    = `${e.userId}:${e.courseSlug}`;
                    const course = COURSES[e.courseSlug];
                    return (
                      <div key={key} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/30 transition-colors">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: `${course?.accent}15`, border: `1px solid ${course?.accent}35`, color: course?.accent }}
                        >
                          {e.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{e.name}</p>
                          <p className="text-xs text-slate-500 truncate">{e.email} · {course?.label}</p>
                        </div>
                        {e.avgQuizScore !== null && (
                          <span className="text-xs text-slate-400 hidden sm:block">avg <span className="text-white font-bold">{e.avgQuizScore}%</span></span>
                        )}
                        <button
                          onClick={() => handleIssue(e.userId, e.courseSlug)}
                          disabled={issuing === key}
                          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-colors"
                        >
                          {issuing === key ? 'Issuing…' : 'Issue'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function downloadCertificateAsSvg(studentName: string, courseFullName: string, certNumber: string, dateString: string, accentColor: string) {
  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b0f19" />
      <stop offset="50%" stop-color="#111827" />
      <stop offset="100%" stop-color="#070a13" />
    </linearGradient>
    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>
  
  <!-- Outer border -->
  <rect x="10" y="10" width="780" height="580" rx="20" fill="url(#bg-grad)" stroke="${accentColor}" stroke-width="3" />
  <rect x="25" y="25" width="750" height="550" rx="15" fill="none" stroke="#1e293b" stroke-width="1" />
  
  <!-- Corner marks -->
  <path d="M 35 55 L 35 35 L 55 35" fill="none" stroke="${accentColor}" stroke-width="2" />
  <path d="M 765 55 L 765 35 L 745 35" fill="none" stroke="${accentColor}" stroke-width="2" />
  <path d="M 35 545 L 35 565 L 55 565" fill="none" stroke="${accentColor}" stroke-width="2" />
  <path d="M 765 545 L 765 565 L 745 565" fill="none" stroke="${accentColor}" stroke-width="2" />
  
  <!-- Content -->
  <g text-anchor="middle" font-family="'Inter', sans-serif">
    <!-- Academy Header -->
    <text x="400" y="100" fill="${accentColor}" font-size="12" font-weight="900" letter-spacing="4">FRAYLON ACADEMY</text>
    
    <!-- Title -->
    <text x="400" y="180" fill="#ffffff" font-size="32" font-weight="900" letter-spacing="1">CERTIFICATE OF COMPLETION</text>
    <line x1="320" y1="205" x2="480" y2="205" stroke="${accentColor}" stroke-width="2" opacity="0.6" />
    
    <!-- Presented to -->
    <text x="400" y="250" fill="#64748b" font-size="14" font-style="italic">This is proudly presented to</text>
    
    <!-- Student Name -->
    <text x="400" y="315" fill="#ffffff" font-size="42" font-weight="900" font-family="'Georgia', serif">${studentName}</text>
    
    <!-- For completing -->
    <text x="400" y="370" fill="#64748b" font-size="14" font-style="italic">for successfully completing the specialized program</text>
    
    <!-- Course Full Name -->
    <text x="400" y="420" fill="${accentColor}" font-size="22" font-weight="800">${courseFullName}</text>
    
    <!-- Bottom Info -->
    <line x1="280" y1="460" x2="520" y2="460" stroke="#334155" stroke-width="1" />
    
    <text x="400" y="495" fill="#94a3b8" font-size="12" font-weight="500">Issued on ${dateString}</text>
    <text x="400" y="520" fill="#64748b" font-size="10" font-family="monospace">CREDENTIAL ID: ${certNumber}</text>
  </g>
  
  <!-- Ribbon/Seal icon -->
  <g transform="translate(680, 480) scale(0.8)">
    <polygon points="30,40 45,95 20,80 -5,95 10,40" fill="#b45309" />
    <polygon points="50,40 65,95 40,80 15,95 30,40" fill="#d97706" />
    <circle cx="30" cy="30" r="35" fill="url(#gold-grad)" />
    <circle cx="30" cy="30" r="28" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.6" />
    <path d="M 30 18 L 33 26 L 41 26 L 35 31 L 37 39 L 30 34 L 23 39 L 25 31 L 19 26 L 27 26 Z" fill="#ffffff" opacity="0.9" />
  </g>
</svg>
  `.trim();

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `certificate-${certNumber}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ─── CertBlock — one per course ─── */

function CertBlock({
  slug, studentName, result, cert,
}: {
  slug:        string;
  studentName: string;
  result:      EligibilityResult | null;
  cert:        IssuedCert | null;
}) {
  const course  = COURSES[slug];
  const accent  = course.accent;
  const issued  = !!cert;
  const allMet  = result?.eligible ?? false;
  const pct     = result ? overallPct(result.conditions) : 0;
  const left    = result ? remainingItems(result.conditions) : [];
  const issueDate = cert
    ? new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;
  const courseTitleWithCapstone = cert?.capstoneTitle
    ? `${course.fullName} (Capstone: ${cert.capstoneTitle})`
    : course.fullName;

  return (
    <div className="rounded-3xl overflow-hidden border border-slate-800/60" style={{ background: '#111827' }}>

      {/* ── Certificate mockup ── */}
      <div className="relative" style={{ height: 340 }}>

        {/* certificate paper */}
        <div
          className="absolute inset-4 rounded-2xl flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: issued
              ? 'linear-gradient(135deg, #1a1400 0%, #221a00 50%, #1a1400 100%)'
              : 'linear-gradient(135deg, #0f1520 0%, #141b2d 50%, #0f1520 100%)',
            border: issued ? `2px solid ${accent}50` : '2px solid #1e2a3a',
            filter: issued ? 'none' : 'none',
          }}
        >
          {/* decorative corner marks */}
          {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map(pos => (
            <div
              key={pos}
              className={`absolute ${pos} w-5 h-5`}
              style={{
                borderColor: issued ? `${accent}60` : '#1e3a5f40',
                borderTopWidth:    pos.includes('top')    ? 2 : 0,
                borderLeftWidth:   pos.includes('left')   ? 2 : 0,
                borderBottomWidth: pos.includes('bottom') ? 2 : 0,
                borderRightWidth:  pos.includes('right')  ? 2 : 0,
                borderStyle: 'solid',
              }}
            />
          ))}

          {/* outer decorative ring */}
          <div
            className="absolute inset-6 rounded-xl pointer-events-none"
            style={{ border: issued ? `1px solid ${accent}20` : '1px solid #1e2a3a60' }}
          />

          {/* certificate content — two completely separate states */}
          {issued ? (
            /* ── UNLOCKED: full certificate text ── */
            <div className="relative z-10 flex flex-col items-center px-10 text-center w-full">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ background: `${accent}20`, border: `2px solid ${accent}60` }}
              >
                <Award size={24} style={{ color: accent }} />
              </div>

              <p className="text-[9px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: `${accent}90` }}>
                Certificate of Completion
              </p>

              <div className="w-24 h-px mb-4" style={{ background: `${accent}40` }} />

              <p className="text-[22px] font-black leading-tight mb-2"
                style={{ color: '#fff', fontFamily: 'Georgia, serif', letterSpacing: '-0.01em' }}>
                {studentName}
              </p>

              <p className="text-sm font-semibold leading-snug mb-4" style={{ color: accent }}>
                {courseTitleWithCapstone}
              </p>

              <div className="w-24 h-px mb-3" style={{ background: `${accent}40` }} />

              {issueDate && (
                <p className="text-[10px]" style={{ color: `${accent}70` }}>
                  {issueDate}{cert?.avgScore !== null && <> · Quiz avg {cert?.avgScore}%</>}
                </p>
              )}

              <p className="text-[9px] uppercase tracking-widest font-semibold mt-2" style={{ color: `${accent}35` }}>
                Fraylon Academy
              </p>
            </div>
          ) : (
            /* ── LOCKED: just the progress, no certificate text ── */
            <div className="relative z-10 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: '#0d1525', border: '2px solid #1e3a5f' }}>
                <Lock size={20} className="text-slate-600" />
              </div>

              {result ? (
                <>
                  <div>
                    <span className="text-5xl font-black text-white">{pct}</span>
                    <span className="text-2xl font-bold text-slate-400">%</span>
                  </div>
                  <p className="text-xs text-slate-500 -mt-1">toward your certificate</p>
                  <div className="w-44 h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-600">Start the course to track progress</p>
              )}
            </div>
          )}
        </div>

        {/* course label pill — top left */}
        <div
          className="absolute top-7 left-7 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
          style={{ background: `${accent}18`, border: `1px solid ${accent}35`, color: accent }}
        >
          {course.icon} {course.label}
        </div>

        {/* verified badge — top right */}
        {issued && (
          <div className="absolute top-7 right-7 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Sparkles size={10} /> Verified
          </div>
        )}
      </div>

      {/* ── bottom info strip ── */}
      <div className="px-6 py-5 border-t border-slate-800/60">
        {issued ? (
          /* earned: cert number + download */
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Certificate ID</p>
              <p className="text-xs font-mono text-slate-400">{cert!.certNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadCertificateAsSvg(studentName, courseTitleWithCapstone, cert!.certNumber, issueDate || '', accent)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: `${accent}20`, border: `1px solid ${accent}40`, color: accent }}
              >
                <Download size={13} /> Download
              </button>
              <a
                href={`${window.location.origin}/#/verify/${cert!.certNumber}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: accent }}
              >
                <ExternalLink size={13} /> Share
              </a>
            </div>
          </div>
        ) : allMet ? (
          /* all requirements met, waiting */
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#34d39920', border: '1px solid #34d39940' }}>
              <Sparkles size={15} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-400">You're done — certificate coming soon</p>
              <p className="text-xs text-slate-500 mt-0.5">All requirements are complete. An admin will review and issue your certificate shortly.</p>
            </div>
          </div>
        ) : result ? (
          /* in progress: what's left in plain English */
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2.5">What's left to unlock this certificate:</p>
            <ul className="space-y-1.5">
              {left.slice(0, 3).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold"
                    style={{ background: `${accent}20`, color: accent }}>
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
              {left.length > 3 && (
                <li className="text-xs text-slate-600 pl-6">+{left.length - 3} more</li>
              )}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-slate-600">Progress data unavailable — make sure the backend is running.</p>
        )}
      </div>
    </div>
  );
}
