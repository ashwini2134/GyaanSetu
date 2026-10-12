import { useMemo } from 'react';
import { hasSimulation } from '../../simulation/registry';
import SceneRenderer from '../../simulation/SceneRenderer';
import type { DebugStep } from '../../interpreter';

interface VisualPreviewProps {
  output: string;
  projectId: string;
  visible: boolean;
  steps?: DebugStep[];
}

const style = document.createElement('style');
style.textContent = `
  @keyframes previewFadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes previewScaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
  @keyframes previewSlideLeft { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes previewFillBar { from { width: 0%; } }
  @keyframes previewSlideInRight { from { opacity: 0; transform: translateX(36px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes previewSlideOutLeft { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-36px); } }
  .pvfade { animation: previewFadeInUp 0.45s ease-out both; }
  .pvscale { animation: previewScaleIn 0.35s ease-out both; }
  .pvslide { animation: previewSlideLeft 0.4s ease-out both; }
  .pvfill { animation: previewFillBar 0.8s ease-out both; }
  .pvslideIn { animation: previewSlideInRight 0.4s ease-out both; }
  .pvslideOut { animation: previewSlideOutLeft 0.25s ease-in both; }

  @keyframes simFadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes simSlideInUp { from { opacity: 0; transform: translate(-50%, calc(-50% + 30px)); } to { opacity: 1; transform: translate(-50%, -50%); } }
  @keyframes simSlideInLeft { from { opacity: 0; transform: translate(calc(-50% - 30px), -50%); } to { opacity: 1; transform: translate(-50%, -50%); } }
  @keyframes simSlideInRight { from { opacity: 0; transform: translate(calc(-50% + 30px), -50%); } to { opacity: 1; transform: translate(-50%, -50%); } }
  @keyframes simScaleIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
  @keyframes simBounce { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); } 50% { transform: translate(-50%, -50%) scale(1.1); } 70% { transform: translate(-50%, -50%) scale(0.9); } 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
  @keyframes simFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  @keyframes simArmWave { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-25deg); } 50% { transform: rotate(15deg); } 75% { transform: rotate(-10deg); } }
  @keyframes simSparkle { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0) rotate(0deg); } 50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2) rotate(180deg); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8) rotate(360deg); } }
  @keyframes simPulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.08); } }
  @keyframes simWiggle { 0%, 100% { transform: translate(-50%, -50%) rotate(0deg); } 25% { transform: translate(-50%, -50%) rotate(-3deg); } 75% { transform: translate(-50%, -50%) rotate(3deg); } }
  .sim-fadeIn { animation: simFadeIn 0.5s ease-out both; }
  .sim-slideInUp { animation: simSlideInUp 0.5s ease-out both; }
  .sim-slideInLeft { animation: simSlideInLeft 0.5s ease-out both; }
  .sim-slideInRight { animation: simSlideInRight 0.5s ease-out both; }
  .sim-scaleIn { animation: simScaleIn 0.4s ease-out both; }
  .sim-bounce { animation: simBounce 0.6s ease-out both; }
  .sim-float { animation: simFloat 2s ease-in-out infinite; }
  .sim-arm-wave { animation: simArmWave 0.6s ease-in-out infinite; }
  .sim-sparkle { animation: simSparkle 1s ease-out both; }
  .sim-pulse { animation: simPulse 2s ease-in-out infinite; }
  .sim-wiggle { animation: simWiggle 0.8s ease-in-out infinite; }
`;
document.head.appendChild(style);


// ── Animated wrapper ──
function AnimatedCard({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div className={`pvscale ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

function AnimatedItem({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div className={`pvfade ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

// ── Parser & Renderer: Shopping List ──
function parseShoppingList(text: string) {
  const lines = text.split('\n').filter(Boolean);
  const items: { name: string; purchased: boolean }[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    const purchased = /\[\s*x\s*\]|✓|purchased/i.test(trimmed);
    const name = trimmed.replace(/\[\s*x?\s*\]\s*/g, '').replace(/^[\d.]+[\s.)]*/, '').replace(/^- /, '').replace(/• /, '').trim();
    if (name) items.push({ name, purchased });
  }
  if (items.length === 0) {
    for (const line of lines) {
      const t = line.trim();
      if (t && !/^---/.test(t)) items.push({ name: t, purchased: false });
    }
  }
  return items;
}

function ShoppingListCard({ text }: { text: string }) {
  const items = useMemo(() => parseShoppingList(text), [text]);
  const purchasedCount = items.filter(i => i.purchased).length;

  return (
    <div className="max-h-72 overflow-y-auto">
      {items.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-1 pvfade">
          <p className="text-[10px] text-slate-300">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          <p className="text-[10px] text-emerald-400">{purchasedCount} purchased</p>
        </div>
      )}
      <div className="space-y-1.5">
        {items.length > 0 ? (
          items.map((item, i) => (
            <AnimatedItem key={i} delay={0.04 * i}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                item.purchased ? 'bg-emerald-500/5 text-slate-300' : 'bg-slate-800/30 text-slate-200'
              }`}>
                <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  item.purchased
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'border-slate-600/60'
                }`}>
                  {item.purchased ? '✓' : ''}
                </span>
                <span className={item.purchased ? 'line-through' : ''}>{item.name}</span>
              </div>
            </AnimatedItem>
          ))
        ) : (
          <p className="text-xs text-slate-300 italic text-center py-6 pvfade">Run your code to build your shopping list...</p>
        )}
      </div>
    </div>
  );
}

// ── Parser & Renderer: Contact Book ──
function parseContacts(text: string) {
  const lines = text.split('\n').filter(Boolean);
  const contacts: { name: string; phone?: string; email?: string }[] = [];
  let current: any = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^---/.test(trimmed)) continue;
    const parts = trimmed.split(/[-:]\s*/);
    if (parts.length >= 2) {
      const label = parts[0].toLowerCase().trim();
      const value = parts.slice(1).join(': ').trim();
      if (/name|contact/i.test(label)) {
        if (current.name) contacts.push(current);
        current = { name: value };
      } else if (/phone|tel|number|mobile/i.test(label)) {
        current.phone = value;
      } else if (/email|mail/i.test(label)) {
        current.email = value;
      } else if (/^[A-Za-z]/.test(trimmed)) {
        if (current.name) contacts.push(current);
        current = { name: parts[0].trim(), phone: parts.slice(1).join('-').trim() };
      }
    } else if (/^[A-Za-z]/.test(trimmed)) {
      if (current.name) contacts.push(current);
      current = { name: trimmed };
    }
  }
  if (current.name) contacts.push(current);
  return contacts;
}

function ContactBookCard({ text }: { text: string }) {
  const contacts = useMemo(() => parseContacts(text), [text]);
  return (
    <div className="max-h-72 overflow-y-auto">
      {contacts.length > 1 && (
        <p className="text-[10px] text-slate-300 mb-3 px-1 pvfade">{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</p>
      )}
      <div className="grid gap-2">
        {contacts.length > 0 ? contacts.map((c, i) => (
          <AnimatedCard key={i} delay={0.06 * i}>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/20">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center text-base font-bold text-violet-300 flex-shrink-0 border border-violet-500/20 shadow-lg shadow-violet-500/5">
                {(c.name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate">{c.name || 'Unknown'}</p>
                {c.phone && (
                  <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {c.phone}
                  </p>
                )}
                {c.email && (
                  <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {c.email}
                  </p>
                )}
              </div>
            </div>
          </AnimatedCard>
        )) : (
          <p className="text-xs text-slate-300 italic text-center py-6 pvfade">Run your code to build your contact book...</p>
        )}
      </div>
    </div>
  );
}

// ── Parser & Renderer: Grade Tracker ──
function parseGrades(text: string) {
  const lines = text.split('\n').filter(Boolean);
  const grades: { subject: string; score: number }[] = [];
  let avg: number | null = null;
  let letter: string | null = null;

  for (const line of lines) {
    const t = line.trim();
    if (/^---/.test(t) || /^Report for/i.test(t)) continue;
    if (/average|avg/i.test(t)) {
      const m = t.match(/(\d+(?:\.\d+)?)/);
      if (m) avg = parseFloat(m[1]);
      continue;
    }
    if (/letter\s*:\s*\w/i.test(t)) {
      const m = t.match(/letter\s*:\s*(\w)/i);
      if (m) letter = m[1].toUpperCase();
      continue;
    }
    if (/^[A-Za-z]/.test(t) && /:/.test(t)) {
      const parts = t.split(':');
      const val = parseFloat(parts.pop() || '');
      const label = parts.join(':').trim();
      if (!isNaN(val) && !/average|letter|grade|report|class|subject|student|tracker/i.test(label)) {
        grades.push({ subject: label, score: val });
      }
    }
  }

  if (avg === null && grades.length > 0) {
    avg = Math.round((grades.reduce((s, g) => s + g.score, 0) / grades.length) * 10) / 10;
  }
  return { grades, avg, letter };
}

function GradeTrackerCard({ text }: { text: string }) {
  const { grades, avg, letter } = useMemo(() => parseGrades(text), [text]);

  return (
    <div className="max-h-80 overflow-y-auto">
      {grades.length > 0 && (
        <div className="space-y-3 mb-4">
          {grades.map((g, i) => {
            const pct = Math.min(100, Math.max(0, g.score));
            const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
            const textColor = pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400';
            return (
              <AnimatedItem key={i} delay={0.06 * i}>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-300 font-medium">{g.subject}</span>
                    <span className={`text-xs font-bold ${textColor}`}>{g.score}</span>
                  </div>
                  <div className="h-2.5 bg-slate-800/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor} pvfill`} style={{ width: `${pct}%`, animationDelay: `${0.2 + 0.06 * i}s` }} />
                  </div>
                </div>
              </AnimatedItem>
            );
          })}
        </div>
      )}
      {(avg !== null || letter) && (
        <AnimatedCard delay={0.3 + 0.06 * grades.length}>
          <div className="flex gap-3 border-t border-slate-700/30 pt-3">
            {avg !== null && (
              <div className="flex-1 bg-slate-800/40 rounded-xl p-3 border border-slate-700/20 text-center">
                <p className="text-[9px] text-slate-300 uppercase tracking-wider">Average</p>
                <p className="text-xl font-bold text-white mt-0.5">{avg.toFixed(1)}</p>
              </div>
            )}
            {letter && (
              <div className="flex-1 bg-slate-800/40 rounded-xl p-3 border border-slate-700/20 text-center">
                <p className="text-[9px] text-slate-300 uppercase tracking-wider">Grade</p>
                <p className="text-xl font-bold text-emerald-400 mt-0.5">{letter}</p>
              </div>
            )}
          </div>
        </AnimatedCard>
      )}
      {grades.length === 0 && avg === null && (
        <p className="text-xs text-slate-300 italic text-center py-6 pvfade">Run your code to generate your grade report...</p>
      )}
    </div>
  );
}

// ── Parser & Renderer: Rock Paper Scissors ──
function parseGameLog(text: string) {
  const lines = text.split('\n').filter(Boolean);
  let playerScore = 0, computerScore = 0;
  const rounds: { round: number; player: string; computer: string; result: 'win' | 'lose' | 'tie' }[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (/final/i.test(lower) && /:/.test(line)) {
      const num = line.match(/(\d+)/g);
      if (num && num.length >= 2) {
        playerScore = parseInt(num[0]);
        computerScore = parseInt(num[1]);
      }
    }
  }

  // Fallback: extract from round-by-round entries
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    if (/you\s+(win|lose|tie)|computer\s+(win|lose|tie)/i.test(lower)) continue;
    if (/score|final|welcome|goodbye/i.test(lower)) continue;

    // Try to extract choice and result from context
    const choice = lines[i].match(/(?:chose|choose|picked)\s+(\w+)/i) || lines[i].match(/:\s*(\w+)/);
    const playerChoice = choice?.[1] || '';

    // Next line or nearby for result
    let result: 'win' | 'lose' | 'tie' = 'tie';
    const resultLines = [lines[i], lines[i + 1] || '', lines[i - 1] || ''].join(' ').toLowerCase();
    if (/\bwin\b/.test(resultLines)) result = 'win';
    else if (/\blose\b/.test(resultLines)) result = 'lose';

    if (playerChoice) {
      const compChoice = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
      rounds.push({ round: rounds.length + 1, player: playerChoice, computer: compChoice, result });
    }
  }

  return { playerScore, computerScore, rounds };
}

function RPSChoiceIcon({ choice, size = 'md' }: { choice: string; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-6 h-6' : 'w-10 h-10';
  const iconDim = size === 'lg' ? 28 : size === 'sm' ? 12 : 20;
  if (/rock/i.test(choice))
    return <div className={`${dims} rounded-xl bg-slate-700/50 flex items-center justify-center border border-slate-600/30`}>
      <svg className="text-slate-300" width={iconDim} height={iconDim} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-6.6-19.5l-3.9 19.5" />
      </svg>
    </div>;
  if (/paper/i.test(choice))
    return <div className={`${dims} rounded-xl bg-slate-700/50 flex items-center justify-center border border-slate-600/30`}>
      <svg className="text-slate-300" width={iconDim} height={iconDim} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    </div>;
  if (/scissors/i.test(choice))
    return <div className={`${dims} rounded-xl bg-slate-700/50 flex items-center justify-center border border-slate-600/30`}>
      <svg className="text-slate-300" width={iconDim} height={iconDim} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25m0 0a2.25 2.25 0 012.25 2.25m-2.25-2.25a2.25 2.25 0 00-2.25 2.25m2.25-2.25h9m-9 2.25v9m0-9h9m0 0a2.25 2.25 0 012.25 2.25m-2.25-2.25a2.25 2.25 0 012.25 2.25m-2.25 2.25H7.5m9 0a2.25 2.25 0 012.25 2.25m-2.25-2.25a2.25 2.25 0 012.25 2.25m-2.25 2.25H7.5m0 0a2.25 2.25 0 01-2.25 2.25m2.25-2.25a2.25 2.25 0 002.25 2.25" />
      </svg>
    </div>;
  return <div className={`${dims} rounded-xl bg-slate-700/50 flex items-center justify-center border border-slate-600/30`}>
    <span className="text-slate-300 text-xs">?</span>
  </div>;
}

function GameCard({ text }: { text: string }) {
  const { playerScore, computerScore, rounds } = useMemo(() => parseGameLog(text), [text]);

  if (rounds.length === 0 && !playerScore && !computerScore) {
    return (
      <div className="max-h-72 overflow-y-auto pvfade">
        <p className="text-xs text-slate-300 italic text-center py-6 pvfade">Run your code to play the game...</p>
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto space-y-4 pvfade">
      {/* Score board */}
      {(playerScore > 0 || computerScore > 0 || rounds.length > 0) && (
        <AnimatedCard delay={0.05}>
          <div className="bg-slate-800/40 rounded-2xl border border-slate-700/20 p-4">
            <p className="text-[9px] text-slate-300 uppercase tracking-wider font-bold text-center mb-3">Score Board</p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-400">{playerScore}</p>
                <p className="text-[9px] text-slate-300 uppercase tracking-wider mt-0.5">You</p>
              </div>
              <div className="text-slate-300 text-lg font-black">VS</div>
              <div className="text-center">
                <p className="text-2xl font-black text-red-400">{computerScore}</p>
                <p className="text-[9px] text-slate-300 uppercase tracking-wider mt-0.5">Computer</p>
              </div>
            </div>
          </div>
        </AnimatedCard>
      )}

      {/* Rounds */}
      {rounds.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] text-slate-300 uppercase tracking-wider font-semibold px-1">Rounds</p>
          {rounds.slice(-5).map((round, i) => (
            <AnimatedItem key={i} delay={0.08 * i}>
              <div className={`rounded-xl border p-3 transition-all ${
                round.result === 'win'
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : round.result === 'lose'
                  ? 'bg-red-500/10 border-red-500/20'
                  : 'bg-amber-500/5 border-amber-500/10'
              }`}>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <RPSChoiceIcon choice={round.player} />
                    <p className="text-[9px] text-slate-300 mt-1 capitalize">{round.player}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-black text-slate-300">VS</span>
                    <span className={`text-[10px] font-bold ${
                      round.result === 'win' ? 'text-emerald-400' :
                      round.result === 'lose' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {round.result === 'win' ? 'Won' : round.result === 'lose' ? 'Lost' : 'Tie'}
                    </span>
                  </div>
                  <div className="text-center">
                    <RPSChoiceIcon choice={round.computer} />
                    <p className="text-[9px] text-slate-300 mt-1 capitalize">{round.computer}</p>
                  </div>
                </div>
                <p className="text-[9px] text-slate-300 text-center mt-2">Round {round.round}</p>
              </div>
            </AnimatedItem>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Multiplication Table ──
function MultiplicationTableCard({ text }: { text: string }) {
  const lines = text.split('\n').filter(Boolean);
  const grid = lines.map(l => l.trim().split(/\s+/));
  return (
    <div className="max-h-72 overflow-y-auto pvfade">
      {grid.length > 0 ? (
        <div className="font-mono text-xs">
          <div className="grid gap-px bg-slate-700/20 rounded-xl overflow-hidden border border-slate-700/20">
            {grid.map((row, ri) => (
              <AnimatedItem key={ri} delay={0.03 * ri}>
                <div className={`flex ${ri === 0 ? 'bg-slate-800/60' : ri % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-800/10'}`}>
                  {row.map((cell, ci) => (
                    <div key={ci} className={`flex-1 px-2.5 py-1.5 text-right ${
                      ri === 0 || ci === 0 ? 'text-teal-400 font-bold' : 'text-slate-200'
                    } ${ci < row.length - 1 ? 'border-r border-slate-700/20' : ''}`}>
                      {cell}
                    </div>
                  ))}
                </div>
              </AnimatedItem>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-300 italic text-center py-6 pvfade">Run your code to generate the table...</p>
      )}
    </div>
  );
}

// ── Number Guessing Game ──
function GuessingGameCard({ text }: { text: string }) {
  const lines = text.split('\n').filter(Boolean);
  return (
    <div className="max-h-72 overflow-y-auto space-y-1 pvfade">
      {lines.length > 0 ? lines.map((line, i) => (
        <AnimatedItem key={i} delay={0.03 * i}>
          <div className={`text-xs px-3 py-2 rounded-lg ${
            /correct|got it/i.test(line)
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold'
              : /too high|too low/i.test(line)
                ? 'bg-orange-500/5 border border-orange-500/10 text-slate-300'
                : /welcome|select|difficulty/i.test(line)
                  ? 'text-slate-300 font-medium'
                  : 'text-slate-300'
          }`}>
            {line}
          </div>
        </AnimatedItem>
      )) : (
        <p className="text-xs text-slate-300 italic text-center py-6 pvfade">Run your code to play the game...</p>
      )}
    </div>
  );
}

// ── Unit Converter ──
function UnitConverterCard({ text }: { text: string }) {
  const lines = text.split('\n').filter(Boolean);
  const resultLine = lines.find(l => /=|→|->|=>/i.test(l) || /°/.test(l));
  return (
    <div className="max-h-72 overflow-y-auto pvfade">
      {resultLine ? (
        <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/20 text-center pvscale">
          <p className="text-lg font-bold text-cyan-300">{resultLine}</p>
        </div>
      ) : lines.length > 0 ? (
        <div className="space-y-1">
          {lines.map((line, i) => (
            <p key={i} className="text-xs text-slate-300">{line}</p>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-300 italic text-center py-6 pvfade">Run your code to see the conversion...</p>
      )}
    </div>
  );
}

// ── Text Analyzer ──
function TextAnalyzerCard({ text }: { text: string }) {
  const lines = text.split('\n').filter(Boolean);
  const metrics = lines.filter(l => /:/.test(l)).map(l => {
    const [label, ...val] = l.split(':');
    return { label: label.trim(), value: val.join(':').trim() };
  });
  return (
    <div className="max-h-72 overflow-y-auto">
      {metrics.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((m, i) => (
            <AnimatedCard key={i} delay={0.06 * i}>
              <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/20">
                <p className="text-[9px] text-slate-300 uppercase tracking-wider">{m.label}</p>
                <p className="text-lg font-bold text-white mt-0.5">{m.value}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {lines.map((line, i) => (
            <p key={i} className="text-xs text-slate-300">{line}</p>
          ))}
          {lines.length === 0 && <p className="text-xs text-slate-300 italic text-center py-6 pvfade">Run your code to see analysis...</p>}
        </div>
      )}
    </div>
  );
}

// ── Personal Diary ──
function DiaryCard({ text }: { text: string }) {
  const lines = text.split('\n').filter(Boolean);
  const entries: { date?: string; title?: string; content?: string }[] = [];
  let current: any = {};
  for (const line of lines) {
    if (/^\[?\d{4}[-/]\d{2}[-/]\d{2}\]?\s/.test(line) || /^date:/i.test(line)) {
      if (current.date || current.title) entries.push(current);
      current = { date: line.replace(/^\[|\]$/g, '').trim() };
    } else if (/^title:/i.test(line)) {
      current.title = line.split(':').slice(1).join(':').trim();
    } else if (/^content:/i.test(line)) {
      current.content = line.split(':').slice(1).join(':').trim();
    } else if (line.trim()) {
      if (!current.content) current.content = line;
      else current.content += ' ' + line;
    }
  }
  if (current.date || current.title || current.content) entries.push(current);
  return (
    <div className="max-h-72 overflow-y-auto space-y-2">
      {entries.length > 0 ? entries.map((e, i) => (
        <AnimatedItem key={i} delay={0.08 * i}>
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/20 border-l-2 border-l-amber-500/40">
            {e.date && <p className="text-[10px] text-amber-400/60 font-medium">{e.date.replace(/^date:\s*/i, '')}</p>}
            {e.title && <p className="text-xs font-semibold text-slate-200 mt-0.5">{e.title.replace(/^title:\s*/i, '')}</p>}
            {e.content && <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{e.content.replace(/^content:\s*/i, '')}</p>}
          </div>
        </AnimatedItem>
      )) : (
        <p className="text-xs text-slate-300 italic text-center py-6 pvfade">Run your code to see diary entries...</p>
      )}
    </div>
  );
}

// ── Student Management Visualizer ──
function StudentManagementCard() {
  const fileContent = localStorage.getItem('fa_file_students.txt') || '';
  const records = fileContent.split('\n').filter(Boolean).map(line => {
    const [name, grade] = line.split(',');
    return { name: name?.trim() || 'Unknown', grade: grade?.trim() || 'N/A' };
  });
  
  return (
    <div className="max-h-72 overflow-y-auto space-y-2">
      {records.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {records.map((r, i) => (
            <AnimatedCard key={i} delay={0.05 * i}>
              <div className="p-3 bg-slate-800/40 border border-slate-700/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-xs font-bold text-blue-400">
                    {(r.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-100">{r.name}</p>
                    <p className="text-[10px] text-slate-300">Record #{i+1}</p>
                  </div>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded bg-slate-900 text-emerald-400">
                  {r.grade}
                </span>
              </div>
            </AnimatedCard>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-300 italic text-center py-6">No students saved yet. Add a student and save records to students.txt!</p>
      )}
    </div>
  );
}

// ── Expense Tracker Visualizer ──
function ExpenseTrackerCard() {
  const fileContent = localStorage.getItem('fa_file_expenses.txt') || '';
  const records = fileContent.split('\n').filter(Boolean).map(line => {
    const [date, category, description, amount] = line.split(',');
    return {
      date: date?.trim() || 'N/A',
      category: category?.trim() || 'General',
      description: description?.trim() || 'Expense',
      amount: parseFloat(amount?.trim() || '0')
    };
  });
  const total = records.reduce((sum, r) => sum + r.amount, 0);
  
  return (
    <div className="max-h-80 overflow-y-auto space-y-4">
      {records.length > 0 ? (
        <>
          <div className="flex gap-3">
            <div className="flex-1 bg-slate-800/40 border border-slate-700/20 rounded-xl p-3 text-center">
              <p className="text-[9px] text-slate-300 uppercase tracking-wider font-bold">Total Expenses</p>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">${total.toFixed(2)}</p>
            </div>
            <div className="flex-1 bg-slate-800/40 border border-slate-700/20 rounded-xl p-3 text-center">
              <p className="text-[9px] text-slate-300 uppercase tracking-wider font-bold">Transactions</p>
              <p className="text-xl font-bold text-white mt-0.5">{records.length}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {records.map((r, i) => (
              <AnimatedItem key={i} delay={0.04 * i}>
                <div className="flex items-center justify-between px-3 py-2 bg-slate-800/20 rounded-lg text-xs border border-slate-700/10">
                  <div>
                    <p className="font-semibold text-slate-200">{r.description}</p>
                    <p className="text-[10px] text-slate-300">{r.date} · <span className="text-blue-400">{r.category}</span></p>
                  </div>
                  <span className="font-bold text-slate-100">${r.amount.toFixed(2)}</span>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </>
      ) : (
        <p className="text-xs text-slate-300 italic text-center py-6">No expenses saved yet. Add an expense and save data to expenses.txt!</p>
      )}
    </div>
  );
}

// ── To-Do List Visualizer ──
function TodoListCard() {
  const fileContent = localStorage.getItem('fa_file_todo.txt') || '';
  const records = fileContent.split('\n').filter(Boolean).map(line => {
    const [title, completed] = line.split(',');
    return { title: title?.trim() || 'Task', completed: completed?.trim() === '1' };
  });
  const doneCount = records.filter(r => r.completed).length;
  
  return (
    <div className="max-h-72 overflow-y-auto space-y-3">
      {records.length > 0 ? (
        <>
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] text-slate-300">{records.length} task{records.length !== 1 ? 's' : ''}</span>
            <span className="text-[10px] text-emerald-400">{doneCount} completed</span>
          </div>
          <div className="space-y-1.5">
            {records.map((r, i) => (
              <AnimatedItem key={i} delay={0.04 * i}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs border border-slate-700/10 transition-all ${
                  r.completed ? 'bg-emerald-500/5 text-slate-300' : 'bg-slate-800/30 text-slate-200'
                }`}>
                  <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                    r.completed ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'border-slate-600/60'
                  }`}>
                    {r.completed ? '✓' : ''}
                  </span>
                  <span className={r.completed ? 'line-through' : ''}>{r.title}</span>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </>
      ) : (
        <p className="text-xs text-slate-300 italic text-center py-6">No tasks saved yet. Add a task and save data to todo.txt!</p>
      )}
    </div>
  );
}

// ── Quiz Application Visualizer ──
function QuizAppCard({ text }: { text: string }) {
  const lines = text.split('\n').filter(Boolean);
  let score = '';
  let questionsRun = 0;
  let corrects = 0;
  
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('score:') || lower.includes('final score:')) {
      const m = line.match(/(\d+)\/(\d+)/);
      if (m) {
        corrects = parseInt(m[1]);
        questionsRun = parseInt(m[2]);
        score = m[0];
      }
    }
  }
  
  return (
    <div className="max-h-72 overflow-y-auto flex flex-col items-center justify-center py-6">
      {score ? (
        <div className="bg-slate-800/40 border border-slate-700/20 rounded-2xl p-6 text-center w-full max-w-sm pvscale">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-emerald-400 font-bold">✓</span>
          </div>
          <p className="text-[9px] text-slate-300 uppercase tracking-wider font-bold">Quiz Completed</p>
          <p className="text-2xl font-black text-white mt-1">{score}</p>
          <p className="text-xs text-slate-300 mt-2">
            Success rate: {((corrects / (questionsRun || 3)) * 100).toFixed(0)}%
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xs text-slate-300 italic">Run your code and complete the quiz questions in the Console!</p>
        </div>
      )}
    </div>
  );
}

const projectRenderers: Record<string, (text: string) => React.ReactNode> = {
  rock_paper_scissors: (text) => <GameCard text={text} />,
  multiplication_explorer: (text) => <MultiplicationTableCard text={text} />,
  guessing_game_project: (text) => <GuessingGameCard text={text} />,
  shopping_list: (text) => <ShoppingListCard text={text} />,
  contact_book: (text) => <ContactBookCard text={text} />,
  unit_converter: (text) => <UnitConverterCard text={text} />,
  text_analyzer: (text) => <TextAnalyzerCard text={text} />,
  personal_diary: (text) => <DiaryCard text={text} />,
  grade_tracker: (text) => <GradeTrackerCard text={text} />,
  student_management: (_text) => <StudentManagementCard />,
  expense_tracker: (_text) => <ExpenseTrackerCard />,
  todo_list: (_text) => <TodoListCard />,
  quiz_app: (text) => <QuizAppCard text={text} />,
};

function DefaultPreview({ text }: { text: string }) {
  const lines = text.split('\n').filter(Boolean);
  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/20 p-4 max-h-64 overflow-y-auto pvfade">
      <div className="space-y-1">
        {lines.map((line, i) => (
          <p key={i} className="text-xs text-slate-300 font-mono">{line}</p>
        ))}
      </div>
    </div>
  );
}

export default function VisualPreview({ output, projectId, visible, steps }: VisualPreviewProps) {
  if (!visible) return null;

  // Simulation-engine projects
  if (hasSimulation(projectId)) {
    return <SceneRenderer projectId={projectId} steps={steps} />;
  }

  // Legacy renderers for non-migrated projects
  const renderer = projectRenderers[projectId] ?? DefaultPreview;

  if (!output?.trim()) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/40 border border-slate-700/20 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <p className="text-sm text-slate-300 font-medium mb-1">Run your project to see it come to life.</p>
        <p className="text-xs text-slate-300">The output will appear here when you click "Run Project".</p>
      </div>
    );
  }

  return (
    <div className="pvfade">
      {renderer(output)}
    </div>
  );
}
