import { useState, useMemo } from 'react';
import type { LostAndFoundConfig, LostAndFoundItem } from '../../types/lesson';

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
@keyframes lf-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
@keyframes lf-place { 0% { opacity: 0; transform: scale(0.8) translateY(-10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes lf-fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
@keyframes lf-slide-up { 0% { opacity: 0; transform: translateY(12px); } 100% { opacity: 1; transform: translateY(0); } }
.lf-shake { animation: lf-shake 0.4s ease-out; }
.lf-place { animation: lf-place 0.3s ease-out forwards; }
.lf-fade { animation: lf-fade-in 0.4s ease-out forwards; }
.lf-slide { animation: lf-slide-up 0.4s ease-out forwards; }
`;
  document.head.appendChild(s);
}

interface Props {
  config: LostAndFoundConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

type Phase = 'carousel' | 'sorting' | 'review' | 'classify' | 'complete';

const CATEGORY_COLORS: Record<string, string> = {
  electronics: '#f59e0b',
  personal: '#22c55e',
  stationery: '#3b82f6',
};

const CATEGORY_ICONS: Record<string, string> = {
  electronics: 'M10 20a1 1 0 01-1-1V5a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4z',
  personal: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  stationery: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
};

function itemIcon(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes('laptop') || lower.includes('computer')) return 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z';
  if (lower.includes('phone') || lower.includes('mobile')) return 'M10 20a1 1 0 01-1-1V5a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4z';
  if (lower.includes('headphone')) return 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z';
  if (lower.includes('calculator')) return 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z';
  if (lower.includes('wallet')) return 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z';
  if (lower.includes('student') || lower.includes('id')) return 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2';
  if (lower.includes('umbrella')) return 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z';
  if (lower.includes('notebook') || lower.includes('diary')) return 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z';
  if (lower.includes('pen') || lower.includes('pencil')) return 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z';
  if (lower.includes('bottle') || lower.includes('water')) return 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z';
  if (lower.includes('watch') || lower.includes('smart')) return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
  if (lower.includes('power') || lower.includes('bank') || lower.includes('battery')) return 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4';
  if (lower.includes('bluetooth') || lower.includes('speaker')) return 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z';
  return 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4';
}

function ItemSvg({ label, size }: { label: string; size?: number }) {
  const s = size || 24;
  return (
    <svg className="flex-shrink-0" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d={itemIcon(label)} />
    </svg>
  );
}

export default function LostAndFoundSorting({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<Phase>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [placed, setPlaced] = useState<Record<string, true>>({});
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [dragOverCat, setDragOverCat] = useState<string | null>(null);
  const [newItemIdx, setNewItemIdx] = useState(0);
  const [newItemFeedback, setNewItemFeedback] = useState<string | null>(null);
  const [newItemCorrect, setNewItemCorrect] = useState(false);
  const [completedNewItems, setCompletedNewItems] = useState(0);

  const totalSlides = config.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;

  const itemsByCategory = useMemo(() => {
    const map: Record<string, LostAndFoundItem[]> = {};
    for (const cat of config.categories) {
      map[cat.id] = [];
    }
    for (const item of config.round1Items) {
      if (placed[item.id]) {
        map[item.categoryId]?.push(item);
      }
    }
    return map;
  }, [config, placed]);

  const allPlaced = config.round1Items.every(item => placed[item.id]);
  const unplacedItems = config.round1Items.filter(item => !placed[item.id]).sort(() => Math.random() - 0.5);

  const handleSlideNext = () => {
    if (isLastSlide) {
      setPhase('sorting');
    } else {
      setSlideIdx(i => i + 1);
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    setDragOverCat(null);
    const itemId = e.dataTransfer.getData('text/plain');
    const item = config.round1Items.find(i => i.id === itemId);
    if (!item || placed[item.id]) return;
    onAttempt?.();

    if (item.categoryId === categoryId) {
      setPlaced(p => ({ ...p, [item.id]: true }));
      const cat = config.categories.find(c => c.id === categoryId);
      setFeedback(`Added to ${cat?.label || categoryId}.`);
      setTimeout(() => setFeedback(null), 2000);
    } else {
      setShakeId(item.id);
      setFeedback('Try another category.');
      setTimeout(() => { setShakeId(null); setFeedback(null); }, 600);
    }
  };

  const handleContinueToReview = () => {
    setPhase('review');
  };

  const handleStartClassify = () => {
    setPhase('classify');
  };

  const handleClassify = (categoryId: string) => {
    const item = shuffledNewItems[newItemIdx];
    onAttempt?.();

    if (item.categoryId === categoryId) {
      setNewItemCorrect(true);
      const cat = config.categories.find(c => c.id === categoryId);
      setNewItemFeedback(`Classified as ${cat?.label}.`);
    } else {
      setNewItemFeedback('Try another category.');
      setTimeout(() => setNewItemFeedback(null), 600);
    }
  };

  const handleNextNewItem = () => {
    if (newItemIdx < config.newItems.length - 1) {
      setNewItemIdx(i => i + 1);
      setNewItemFeedback(null);
      setNewItemCorrect(false);
      setCompletedNewItems(i => i + 1);
    } else {
      setCompletedNewItems(i => i + 1);
      setPhase('complete');
    }
  };

  const handleTryAgain = () => {
    setPlaced({});
    setFeedback(null);
    setNewItemIdx(0);
    setNewItemFeedback(null);
    setNewItemCorrect(false);
    setCompletedNewItems(0);
    setPhase('carousel');
    setSlideIdx(0);
  };

  const shuffledNewItems = useMemo(() => [...config.newItems].sort(() => Math.random() - 0.5), [config.newItems]);
  const currentNewItem = shuffledNewItems[newItemIdx];

  // ── Carousel ──
  if (phase === 'carousel') {
    const slide = config.slides[slideIdx];
    return (
      <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider">Lost & Found Sorting</p>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === slideIdx ? 'bg-[var(--brand-primary)] scale-125 shadow-sm shadow-[var(--brand-primary)]/50' : i < slideIdx ? 'bg-[var(--brand-primary)]/60' : 'bg-slate-600/50'
              }`} />
            ))}
          </div>
        </div>
        <div className="px-6 pt-2 pb-6">
          <div className="mx-auto text-center">
            <div className="flex justify-center mb-4">
              {slideIdx === 0 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <rect x="10" y="14" width="28" height="22" rx="3" stroke="#3b82f6" strokeWidth="1.5" fill="#3b82f6" fillOpacity="0.1" />
                  <path d="M10 20h28M10 26h28M10 32h28" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.3" />
                  <circle cx="34" cy="18" r="2" fill="#3b82f6" fillOpacity="0.4" />
                </svg>
              )}
              {slideIdx === 1 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <rect x="6" y="8" width="36" height="8" rx="2" stroke="#f59e0b" strokeWidth="1.5" fill="#f59e0b" fillOpacity="0.1" />
                  <rect x="6" y="20" width="36" height="8" rx="2" stroke="#22c55e" strokeWidth="1.5" fill="#22c55e" fillOpacity="0.1" />
                  <rect x="6" y="32" width="36" height="8" rx="2" stroke="#3b82f6" strokeWidth="1.5" fill="#3b82f6" fillOpacity="0.1" />
                </svg>
              )}
              {slideIdx === 2 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <rect x="4" y="12" width="14" height="24" rx="2" stroke="#22c55e" strokeWidth="1.5" fill="#22c55e" fillOpacity="0.1" />
                  <text x="11" y="38" fontSize="5" fill="#94a3b8" textAnchor="middle">Examples</text>
                  <path d="M22 24h4" stroke="#f59e0b" strokeWidth="1.5" />
                  <polyline points="24,24 28,20 32,24" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
                  <rect x="30" y="12" width="14" height="24" rx="2" stroke="#3b82f6" strokeWidth="1.5" fill="#3b82f6" fillOpacity="0.1" />
                  <text x="37" y="38" fontSize="5" fill="#94a3b8" textAnchor="middle">New Item</text>
                </svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-white">{slide.title}</h3>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line max-w-md mx-auto">{slide.body}</p>
            <div className="mt-7">
              <button onClick={handleSlideNext} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg bg-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/20 transition-all duration-[280ms] hover:scale-[1.03] hover:-translate-y-0.5">
                {isLastSlide ? 'Start Exercise' : 'Next'}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Sorting (Round 1) ──
  if (phase === 'sorting') {
    return (
      <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider">Lost & Found Sorting</p>
            {!allPlaced && (
              <p className="text-[10px] text-slate-300">
                {unplacedItems.length} item{unplacedItems.length !== 1 ? 's' : ''} remaining
              </p>
            )}
          </div>
        </div>
        <div className="p-4 flex gap-4 flex-col md:flex-row">
          {/* Items stack — left */}
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-[10px] text-slate-300 uppercase tracking-wider">Items ({unplacedItems.length})</p>
            <div className="space-y-1.5">
              {unplacedItems.map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  className={`rounded-lg border px-3 py-2.5 flex items-center gap-2.5 transition-all cursor-grab active:cursor-grabbing select-none ${
                    shakeId === item.id ? 'lf-shake border-red-500/40 bg-red-900/20' :
                    'bg-slate-900/60 border-slate-700/40 text-slate-200 hover:border-[var(--brand-primary)]/40 hover:bg-slate-800/60'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
                  </svg>
                  <ItemSvg label={item.label} size={16} />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              ))}
              {unplacedItems.length === 0 && (
                <p className="text-xs text-slate-300 py-4 text-center">All items organised.</p>
              )}
            </div>
          </div>

          {/* Category panels — right */}
          <div className="w-full md:w-72 space-y-3">
            {config.categories.map(cat => {
              const catItems = itemsByCategory[cat.id] || [];
              const color = CATEGORY_COLORS[cat.id] || '#64748b';
              const isOver = dragOverCat === cat.id;
              return (
                <div
                  key={cat.id}
                  onDragOver={handleDragOver}
                  onDragEnter={() => setDragOverCat(cat.id)}
                  onDragLeave={() => setDragOverCat(null)}
                  onDrop={(e) => handleDrop(e, cat.id)}
                  className={`rounded-xl border overflow-hidden transition-all ${
                    isOver ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/15' : 'border-slate-700/40 bg-slate-900/60'
                  }`}
                >
                  <div className="px-3 py-2 border-b border-slate-700/30 flex items-center gap-2" style={{ backgroundColor: `${color}15` }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={CATEGORY_ICONS[cat.id] || ''} />
                    </svg>
                    <span className="text-xs font-semibold text-slate-200">{cat.label}</span>
                    <span className="text-[10px] text-slate-300 ml-auto">{catItems.length}</span>
                  </div>
                  <div className="p-3 min-h-[80px] space-y-1.5">
                    {catItems.map(item => (
                      <div key={item.id} className="flex items-center gap-1.5 lf-place">
                        <ItemSvg label={item.label} size={13} />
                        <span className="text-[11px] text-slate-300">{item.label}</span>
                      </div>
                    ))}
                    {catItems.length === 0 && (
                      <p className="text-[10px] text-slate-300 italic">Drop items here</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-2.5 lf-slide">
              <p className="text-xs text-slate-300 text-center">{feedback}</p>
            </div>
          )}

          {/* Continue */}
          {allPlaced && (
            <div className="text-center lf-fade">
              <button onClick={handleContinueToReview} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg bg-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/20 transition-all duration-[280ms] hover:scale-[1.03] hover:-translate-y-0.5">
                Continue
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Review ──
  if (phase === 'review') {
    return (
      <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 text-center">
          <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider">Labelled Examples</p>
        </div>
        <div className="p-5">
          <div className="max-w-lg mx-auto space-y-4">
            <p className="text-sm text-slate-300 text-center">These labelled examples are now organised.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {config.categories.map(cat => {
                const color = CATEGORY_COLORS[cat.id] || '#64748b';
                const catItems = itemsByCategory[cat.id] || [];
                return (
                  <div key={cat.id} className="rounded-xl bg-slate-900/60 border border-slate-700/40 overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-700/30 flex items-center gap-2" style={{ backgroundColor: `${color}15` }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d={CATEGORY_ICONS[cat.id] || ''} />
                      </svg>
                      <span className="text-xs font-semibold text-slate-200">{cat.label}</span>
                      <span className="text-[10px] text-slate-300 ml-auto">{catItems.length}</span>
                    </div>
                    <div className="p-3 space-y-1">
                      {catItems.map(item => (
                        <div key={item.id} className="flex items-center gap-1.5 lf-place">
                          <ItemSvg label={item.label} size={12} />
                          <span className="text-[10px] text-slate-300">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center pt-2">
              <button onClick={handleStartClassify} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg bg-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/20 transition-all duration-[280ms] hover:scale-[1.03] hover:-translate-y-0.5">
                Classify New Item
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Classify (New Items) ──
  if (phase === 'classify') {
    const item = currentNewItem;
    return (
      <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 text-center">
          <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider">
            Classify Unseen Item ({newItemIdx + 1} of {config.newItems.length})
          </p>
        </div>
        <div className="p-5">
          <div className="max-w-md mx-auto space-y-5 text-center">
            {/* New item card */}
            <div className="rounded-xl bg-slate-900/60 border border-[var(--brand-primary)]/30 p-6 lf-fade">
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 rounded-xl bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 flex items-center justify-center">
                  <ItemSvg label={item.label} size={28} />
                </div>
              </div>
              <p className="text-lg font-bold text-white">{item.label}</p>
              <p className="text-xs text-slate-300 mt-1">Think about the patterns you learned. Which category does this belong to?</p>
            </div>

            {/* Category choices */}
            <div className="grid grid-cols-1 gap-2">
              {config.categories.map(cat => {
                const color = CATEGORY_COLORS[cat.id] || '#64748b';
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleClassify(cat.id)}
                    disabled={newItemCorrect}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                      newItemCorrect && item.categoryId === cat.id
                        ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-300'
                        : newItemCorrect
                          ? 'bg-slate-900/40 border-slate-700/20 opacity-30'
                          : 'bg-slate-900/60 border-slate-700/40 hover:border-[var(--brand-primary)]/50 hover:bg-slate-800/60 text-slate-200'
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={CATEGORY_ICONS[cat.id] || ''} />
                    </svg>
                    <span className="text-sm font-medium">{cat.label}</span>
                    {newItemCorrect && item.categoryId === cat.id && (
                      <svg className="w-5 h-5 ml-auto text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {newItemFeedback && (
              <div className={`rounded-xl p-3 lf-slide ${newItemCorrect ? 'bg-emerald-900/15 border border-emerald-500/30' : 'bg-slate-900/60 border border-slate-700/40'}`}>
                <p className={`text-xs ${newItemCorrect ? 'text-emerald-300' : 'text-slate-300'}`}>{newItemFeedback}</p>
              </div>
            )}

            {/* Next */}
            {newItemCorrect && (
              <div className="lf-fade">
                <button onClick={handleNextNewItem} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg bg-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/20 transition-all duration-[280ms] hover:scale-[1.03] hover:-translate-y-0.5">
                  {newItemIdx < config.newItems.length - 1 ? 'Next Item' : 'See Results'}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Complete ──
  return (
    <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20"></div>
      <div className="p-6 space-y-5">
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-white">{config.completionTitle}</h3>
          <p className="text-sm text-slate-300">{config.completionMessage}</p>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-4">
          <p className="text-[10px] text-slate-300 uppercase tracking-wider mb-2">What You Did</p>
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-slate-300">
            <span className="px-2 py-1 rounded bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)]">Sorted 10 labelled items</span>
            <span className="text-slate-300">→</span>
            <span className="px-2 py-1 rounded bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)]">Classified {completedNewItems} new items</span>
          </div>
        </div>

        <div className="space-y-1.5 max-w-md mx-auto">
          {config.takeaways.map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
              <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20,6 9,17 4,12" />
              </svg>
              {t}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button onClick={handleTryAgain} className="px-4 py-2 text-xs font-semibold text-slate-300 rounded-lg border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 transition-all">
            Try Again
          </button>
          <button onClick={onComplete} className="px-5 py-2 text-xs font-semibold text-white rounded-lg bg-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/20 transition-all duration-[280ms] hover:scale-[1.03] hover:-translate-y-0.5">
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
}
