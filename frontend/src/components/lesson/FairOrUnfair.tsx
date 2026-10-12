import { useState } from 'react';
import type { FairOrUnfairConfig } from '../../types/lesson';

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
@keyframes fou-slide { 0% { opacity: 0; transform: translateY(14px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes fou-pop { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
@keyframes fou-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
@keyframes fou-glow { 0%,100% { box-shadow: 0 0 4px rgba(16,185,129,0.3); } 50% { box-shadow: 0 0 12px rgba(16,185,129,0.6); } }
.fou-slide { animation: fou-slide 0.5s ease-out forwards; }
.fou-pop { animation: fou-pop 0.4s ease-out forwards; }
`;
  document.head.appendChild(s);
}

interface Props {
  config: FairOrUnfairConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

function PermissionToggle({ label, selected, onToggle, disabled }: { label: string; selected: boolean; onToggle: () => void; disabled: boolean }) {
  return (
    <button onClick={onToggle} disabled={disabled}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
        selected
          ? 'bg-[var(--brand-primary)]/30 border-[var(--brand-primary)]/60 text-[var(--brand-primary)]'
          : 'bg-slate-900/60 border-slate-700/40 text-slate-300 hover:border-[var(--brand-primary)]/40 hover:text-slate-300'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="flex items-center gap-2">
        {selected && (
          <svg className="w-3.5 h-3.5 text-[var(--brand-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <polyline points="20,6 9,17 4,12" />
          </svg>
        )}
        {label}
      </div>
    </button>
  );
}

const CAROUSEL_SVGS = [
  <svg key="s1" className="w-16 h-16 mx-auto mb-4 text-[var(--brand-primary)]" viewBox="0 0 80 80" fill="none">
    <rect x="8" y="8" width="64" height="64" rx="12" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.05" />
    <line x1="40" y1="18" x2="40" y2="62" stroke="currentColor" strokeWidth="1.5" />
    <path d="M24 30 L40 26 L56 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M24 50 L40 54 L56 50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="40" cy="26" r="4" fill="currentColor" fillOpacity="0.3" />
    <circle cx="40" cy="54" r="4" fill="currentColor" fillOpacity="0.3" />
  </svg>,
  <svg key="s2" className="w-16 h-16 mx-auto mb-4 text-[var(--brand-primary)]" viewBox="0 0 80 80" fill="none">
    <circle cx="36" cy="36" r="20" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
    <circle cx="36" cy="36" r="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" fill="currentColor" fillOpacity="0.08" />
    <line x1="50" y1="50" x2="66" y2="66" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="56" y="56" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
  </svg>,
  <svg key="s3" className="w-16 h-16 mx-auto mb-4 text-emerald-400" viewBox="0 0 80 80" fill="none">
    <rect x="12" y="20" width="56" height="48" rx="8" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.05" />
    <polyline points="28,44 38,54 54,34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M40 12 L40 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M28 16 L32 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M52 16 L48 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>,
];

export default function FairOrUnfair({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<'carousel' | 'bias' | 'privacy' | 'complete'>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [biasIdx, setBiasIdx] = useState(0);
  const [biasAnswer, setBiasAnswer] = useState<boolean | null>(null);
  const [biasFeedback, setBiasFeedback] = useState(false);
  const [privacyIdx, setPrivacyIdx] = useState(0);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [privacyResults, setPrivacyResults] = useState<{ perm: string; correct: boolean; missed: boolean; extra: boolean }[]>([]);

  const totalSlides = config.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;

  const bias = config.biasScenarios;
  const privacy = config.privacyScenarios;
  const currentBias = bias[biasIdx];
  const currentPrivacy = privacy[privacyIdx];
  const isLastBias = biasIdx >= bias.length - 1;
  const isLastPrivacy = privacyIdx >= privacy.length - 1;

  const handleSlideNext = () => {
    if (isLastSlide) setPhase('bias');
    else setSlideIdx(i => i + 1);
  };

  const handleBiasAnswer = (answer: boolean) => {
    if (biasFeedback) return;
    onAttempt?.();
    setBiasAnswer(answer);
    setBiasFeedback(true);
  };

  const handleBiasNext = () => {
    if (isLastBias) {
      setBiasIdx(0);
      setBiasAnswer(null);
      setBiasFeedback(false);
      setPhase('privacy');
    } else {
      setBiasIdx(i => i + 1);
      setBiasAnswer(null);
      setBiasFeedback(false);
    }
  };

  const togglePermission = (perm: string) => {
    if (privacyChecked) return;
    setSelectedPerms(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleCheckPermissions = () => {
    if (privacyChecked) return;
    onAttempt?.();
    const results = currentPrivacy.permissions.map(perm => {
      const isRequired = currentPrivacy.requiredPermissions.includes(perm);
      const isSelected = selectedPerms.includes(perm);
      return {
        perm,
        correct: isRequired === isSelected,
        missed: isRequired && !isSelected,
        extra: !isRequired && isSelected,
      };
    });
    setPrivacyResults(results);
    setPrivacyChecked(true);
  };

  const handlePrivacyNext = () => {
    if (isLastPrivacy) setPhase('complete');
    else {
      setPrivacyIdx(i => i + 1);
      setSelectedPerms([]);
      setPrivacyChecked(false);
      setPrivacyResults([]);
    }
  };

  const handleTryAgain = () => {
    setPhase('carousel');
    setSlideIdx(0);
    setBiasIdx(0);
    setBiasAnswer(null);
    setBiasFeedback(false);
    setPrivacyIdx(0);
    setSelectedPerms([]);
    setPrivacyChecked(false);
    setPrivacyResults([]);
  };

  // ── Carousel ──
  if (phase === 'carousel') {
    const slide = config.slides[slideIdx];
    return (
      <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--brand-primary)] uppercase tracking-wider">Fair or Unfair?</p>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                i === slideIdx ? 'bg-[var(--brand-primary)] scale-125 shadow-sm shadow-[var(--brand-primary)]/50' : i < slideIdx ? 'bg-[var(--brand-primary)]/60' : 'bg-slate-600/50'
              }`} />
            ))}
          </div>
        </div>
        <div className="px-8 pt-6 pb-8">
          <div className="mx-auto text-center max-w-lg">
            <div className="fou-pop">{CAROUSEL_SVGS[slideIdx]}</div>
            <h3 className="text-2xl font-bold text-white">{slide.title}</h3>
            <p className="mt-3 text-base text-slate-300 leading-relaxed whitespace-pre-line">{slide.body}</p>
            <div className="mt-8">
              <button onClick={handleSlideNext} className="inline-flex items-center gap-2 text-base font-semibold text-white px-7 py-3 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all shadow-lg shadow-[var(--brand-primary)]/20">
                {isLastSlide ? 'Start Challenge' : 'Next'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Bias Challenge ──
  if (phase === 'bias') {
    const isCorrect = biasAnswer === currentBias.correctAnswer;
    return (
      <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--brand-primary)] uppercase tracking-wider">Bias Challenge</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">Scenario {biasIdx + 1} of {bias.length}</span>
            <div className="flex items-center gap-1.5">
              {bias.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${
                  i < biasIdx ? 'bg-emerald-500/60' : i === biasIdx ? 'bg-[var(--brand-primary)]' : 'bg-slate-600/50'
                }`} />
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 lg:p-8">
          <div className="max-w-xl mx-auto space-y-5">
            {/* Candidate Profile Card */}
            <div className="rounded-xl bg-slate-900/80 border border-slate-700/40 overflow-hidden fou-slide">
              <div className="px-5 py-3 bg-slate-800/60 border-b border-slate-700/30">
                <p className="text-sm font-semibold text-slate-200">{currentBias.name}</p>
              </div>
              <div className="p-5 space-y-3">
                {currentBias.details.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{d.label}</span>
                    <span className={`text-slate-200 font-medium ${d.label === 'Gender' || d.label === 'Age' || d.label === 'Location' ? 'text-rose-300' : ''}`}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Question */}
            <p className="text-base text-slate-100 font-medium text-center">{currentBias.question}</p>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => handleBiasAnswer(true)} disabled={biasFeedback}
                className={`px-8 py-3 rounded-xl text-base font-semibold transition-all ${
                  biasFeedback
                    ? biasAnswer === true
                      ? isCorrect ? 'bg-emerald-900/30 border-2 border-emerald-500/60 text-emerald-300' : 'bg-red-900/20 border-2 border-red-500/30 text-red-300'
                      : 'bg-slate-800/50 border border-slate-700/30 text-slate-300'
                    : 'bg-slate-900/60 border border-slate-700/40 text-slate-200 hover:border-[var(--brand-primary)]/40 hover:bg-slate-800/60'
                }`}
              >
                Yes
              </button>
              <button onClick={() => handleBiasAnswer(false)} disabled={biasFeedback}
                className={`px-8 py-3 rounded-xl text-base font-semibold transition-all ${
                  biasFeedback
                    ? biasAnswer === false
                      ? isCorrect ? 'bg-emerald-900/30 border-2 border-emerald-500/60 text-emerald-300' : 'bg-red-900/20 border-2 border-red-500/30 text-red-300'
                      : 'bg-slate-800/50 border border-slate-700/30 text-slate-300'
                    : 'bg-slate-900/60 border border-slate-700/40 text-slate-200 hover:border-[var(--brand-primary)]/40 hover:bg-slate-800/60'
                }`}
              >
                No
              </button>
            </div>

            {/* Feedback */}
            {biasFeedback && (
              <div className={`rounded-xl p-5 fou-slide ${
                isCorrect ? 'bg-emerald-900/15 border border-emerald-500/25' : 'bg-rose-900/15 border border-rose-500/25'
              }`}>
                <div className="flex items-start gap-3">
                  <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    {isCorrect
                      ? <polyline points="20,6 9,17 4,12" />
                      : <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>
                    }
                  </svg>
                  <div>
                    <p className="text-sm font-semibold mb-1">{isCorrect ? 'Fair Decision' : 'Unfair Decision'}</p>
                    <p className={`text-sm leading-relaxed ${isCorrect ? 'text-[var(--text-primary)]' : 'text-rose-300'}`}>{currentBias.explanation}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-center">
                  <button onClick={handleBiasNext}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary)] hover:from-[var(--brand-primary)] hover:to-[var(--brand-primary)] transition-all"
                  >
                    {isLastBias ? 'Continue to Privacy Challenge' : 'Next Scenario'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Privacy Challenge ──
  if (phase === 'privacy') {
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider">Privacy Challenge</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">App {privacyIdx + 1} of {privacy.length}</span>
            <div className="flex items-center gap-1.5">
              {privacy.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${
                  i < privacyIdx ? 'bg-emerald-500/60' : i === privacyIdx ? 'bg-blue-400' : 'bg-slate-600/50'
                }`} />
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 lg:p-8">
          <div className="max-w-xl mx-auto space-y-5">
            {/* App Permission Dialog */}
            <div className="rounded-xl bg-slate-900/80 border border-slate-700/40 overflow-hidden fou-slide">
              <div className="px-5 py-4 bg-slate-800/60 border-b border-slate-700/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold">{currentPrivacy.appName.split(' ')[0][0]}{currentPrivacy.appName.split(' ').slice(-1)[0][0]}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{currentPrivacy.appName}</p>
                  <p className="text-[11px] text-slate-300">Requested Permissions</p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs text-slate-300 mb-3 uppercase tracking-wider">Select the permissions this app actually requires</p>
                <div className="flex flex-wrap gap-2">
                  {currentPrivacy.permissions.map(perm => (
                    <PermissionToggle key={perm} label={perm} selected={selectedPerms.includes(perm)} onToggle={() => togglePermission(perm)} disabled={privacyChecked} />
                  ))}
                </div>
              </div>
            </div>

            {/* Check Button */}
            {!privacyChecked && (
              <div className="flex justify-center">
                <button onClick={handleCheckPermissions} disabled={selectedPerms.length === 0}
                  className={`inline-flex items-center gap-2 text-base font-semibold px-5 py-3 rounded-xl transition-all ${
                    selectedPerms.length > 0 ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/20' : 'text-slate-300 bg-slate-800/50 cursor-not-allowed'
                  }`}>
                  Check Permissions
                </button>
              </div>
            )}

            {/* Feedback */}
            {privacyChecked && (
              <div className="rounded-xl bg-slate-900/80 border border-blue-500/30 p-5 fou-slide space-y-3">
                <p className="text-sm font-semibold text-blue-300">Permission Review</p>
                {privacyResults.map(r => {
                  const isReq = currentPrivacy.requiredPermissions.includes(r.perm);
                  const isSel = r.perm && selectedPerms.includes(r.perm);
                  if (isReq && isSel) {
                    return (
                      <div key={r.perm} className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                        <span className="text-slate-300">{r.perm}</span>
                        <span className="text-xs ml-auto text-emerald-400 font-medium">Required</span>
                      </div>
                    );
                  }
                  if (isReq && !isSel) {
                    return (
                      <div key={r.perm} className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-[var(--brand-primary)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span className="text-[var(--brand-primary)]">{r.perm}</span>
                        <span className="text-xs ml-auto text-[var(--brand-primary)] font-medium">Required but not selected</span>
                      </div>
                    );
                  }
                  if (!isReq && isSel) {
                    return (
                      <div key={r.perm} className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-rose-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        <span className="text-rose-200">{r.perm}</span>
                        <span className="text-xs ml-auto text-rose-400 font-medium">Unnecessary for this app</span>
                      </div>
                    );
                  }
                  return (
                    <div key={r.perm} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="w-4" />
                      <span className="text-slate-300">{r.perm}</span>
                      <span className="text-[10px] ml-auto text-slate-300">Not required</span>
                    </div>
                  );
                })}
                <p className="text-xs text-slate-300 pt-2 border-t border-slate-700/30">{currentPrivacy.explanation}</p>
                <div className="flex justify-center pt-1">
                  <button onClick={handlePrivacyNext}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all"
                  >
                    {isLastPrivacy ? 'See Results' : 'Next App'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Complete ──
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20" />
      <div className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white">{config.completionTitle}</h3>
          <p className="text-base text-slate-300 max-w-lg mx-auto">{config.completionMessage}</p>
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          {config.takeaways.map((t, i) => (
            <div key={i} className="flex items-start gap-2.5 text-base text-slate-300">
              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20,6 9,17 4,12" />
              </svg>
              {t}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 pt-3">
          <button onClick={handleTryAgain} className="px-5 py-2.5 text-sm font-semibold text-slate-300 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 transition-all">
            Try Again
          </button>
          <button onClick={onComplete} className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20">
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
}
