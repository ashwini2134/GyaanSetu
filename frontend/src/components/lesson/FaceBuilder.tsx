import { useState, useMemo, useRef } from 'react';
import type { FaceBuilderConfig } from '../../types/lesson';

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
@keyframes fb-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
@keyframes fb-place { 0% { opacity: 0; transform: scale(0.5); } 60% { transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
@keyframes fb-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
@keyframes fb-slide { 0% { opacity: 0; transform: translateY(12px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes fb-glow { 0%,100% { box-shadow: 0 0 4px rgba(52,211,153,0.2); } 50% { box-shadow: 0 0 12px rgba(52,211,153,0.5); } }
@keyframes fb-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes fb-pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.7; } }
@keyframes fb-bounce-in { 0% { opacity: 0; transform: translateY(20px) scale(0.8); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
.fb-shake { animation: fb-shake 0.4s ease-out; }
.fb-place { animation: fb-place 0.5s ease-out forwards; }
.fb-fade { animation: fb-fade 0.4s ease-out forwards; }
.fb-slide { animation: fb-slide 0.4s ease-out forwards; }
.fb-glow { animation: fb-glow 1.5s ease-in-out infinite; }
.fb-float { animation: fb-float 3s ease-in-out infinite; }
.fb-bounce-in { animation: fb-bounce-in 0.5s ease-out forwards; }
`;
  document.head.appendChild(s);
}

interface Props {
  config: FaceBuilderConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

type Phase = 'carousel' | 'build' | 'complete';

const STATUS_LEVELS = [
  { max: 20, label: 'Minimal information' },
  { max: 50, label: 'Partial recognition' },
  { max: 80, label: 'Strong recognition' },
  { max: 100, label: 'High confidence' },
];

export default function FaceBuilder({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<Phase>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [placed, setPlaced] = useState<Record<string, true>>({});
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

  const totalSlides = config.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;

  const faceFeatures = config.features.filter(f => f.isFaceFeature);
  const unplacedFaceFeatures = faceFeatures.filter(f => !placed[f.id]);
  const allUnplaced = config.features.filter(f => !placed[f.id]);

  const shuffledAll = useMemo(() => {
    return [...allUnplaced].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(placed).join(',')]);

  const confidence = useMemo(() => {
    const totalWeight = faceFeatures.reduce((s, f) => s + f.weight, 0);
    const placedWeight = faceFeatures.filter(f => placed[f.id]).reduce((s, f) => s + f.weight, 0);
    return Math.round(10 + (placedWeight / totalWeight) * 88);
  }, [faceFeatures, placed]);

  const statusLabel = STATUS_LEVELS.find(s => confidence <= s.max)?.label || 'High confidence';
  const allPlaced = unplacedFaceFeatures.length === 0;

  const handleSlideNext = () => {
    if (isLastSlide) {
      setPhase('build');
    } else {
      setSlideIdx(i => i + 1);
    }
  };

  const handleSelectFeature = (featureId: string) => {
    if (placed[featureId]) return;
    setSelectedFeature(prev => prev === featureId ? null : featureId);
  };

  const tryPlaceFeature = (featureId: string, zoneId: string) => {
    if (placed[featureId]) return;
    const feature = config.features.find(f => f.id === featureId);
    if (!feature) return;

    if (!feature.isFaceFeature) {
      setShakeId(featureId);
      setFeedback('That is not a facial feature — it cannot go on the face.');
      setTimeout(() => { setShakeId(null); setSelectedFeature(null); setFeedback(null); }, 1200);
      return;
    }

    if (featureId === zoneId || (featureId === 'eyes' && zoneId === 'glasses') || (featureId === 'glasses' && zoneId === 'eyes')) {
      onAttempt?.();
      setPlaced(p => ({ ...p, [featureId]: true }));
      setSelectedFeature(null);
      setFeedback(feature.feedback);
      setTimeout(() => setFeedback(null), 2500);
    } else {
      setShakeId(featureId);
      setFeedback('That area does not match this feature.');
      setTimeout(() => { setShakeId(null); setSelectedFeature(null); setFeedback(null); }, 1200);
    }
  };

  const handleClickZone = (zoneId: string) => {
    if (!selectedFeature) return;
    tryPlaceFeature(selectedFeature, zoneId);
  };

  const handleDragStart = (e: React.DragEvent, featureId: string) => {
    dragId.current = featureId;
    setSelectedFeature(featureId);
    e.dataTransfer.setData('text/plain', featureId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnZone = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverZone(null);
    const featureId = dragId.current || e.dataTransfer.getData('text/plain');
    dragId.current = null;
    if (!featureId) return;
    tryPlaceFeature(featureId, zoneId);
  };

  const handleTryAgain = () => {
    setPlaced({});
    setSelectedFeature(null);
    setFeedback(null);
    setShakeId(null);
    setDragOverZone(null);
    setPhase('carousel');
    setSlideIdx(0);
  };

  const featureColors: Record<string, string> = {
    hair: '#3b82f6',
    eyes: '#22c55e',
    eyebrows: '#f59e0b',
    nose: '#ef4444',
    mouth: '#a855f7',
    ears: '#06b6d4',
    glasses: '#f97316',
    shoulder: '#64748b',
    hand: '#64748b',
    knee: '#64748b',
    elbow: '#64748b',
    ankle: '#64748b',
  };

  // ── Carousel ──
  if (phase === 'carousel') {
    const slide = config.slides[slideIdx];
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Build a Face</p>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === slideIdx ? 'bg-blue-400 scale-125 shadow-sm shadow-blue-400/50' : i < slideIdx ? 'bg-blue-600/60' : 'bg-slate-600/50'
              }`} />
            ))}
          </div>
        </div>
        <div className="px-6 pt-2 pb-6">
          <div className="mx-auto text-center">
            <div className="flex justify-center mb-4 fb-float" style={{ animationDuration: '3s' }}>
              {slideIdx === 0 && (
                <svg className="w-14 h-14" viewBox="0 0 56 56" fill="none">
                  <ellipse cx="28" cy="30" rx="20" ry="24" stroke="#3b82f6" strokeWidth="1.5" fill="#3b82f6" fillOpacity="0.08" />
                  <circle cx="20" cy="25" r="3.5" stroke="#3b82f6" strokeWidth="1" fill="#3b82f6" fillOpacity="0.2" />
                  <circle cx="36" cy="25" r="3.5" stroke="#3b82f6" strokeWidth="1" fill="#3b82f6" fillOpacity="0.2" />
                  <path d="M23 35c3 3 6.5 3 9.5 0" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M14 16c4-6 16-6 20 0" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5" />
                  <rect x="10" y="40" width="8" height="3" rx="1.5" stroke="#64748b" strokeWidth="1" strokeOpacity="0.3" />
                  <rect x="38" y="40" width="8" height="3" rx="1.5" stroke="#64748b" strokeWidth="1" strokeOpacity="0.3" />
                </svg>
              )}
              {slideIdx === 1 && (
                <svg className="w-14 h-14" viewBox="0 0 56 56" fill="none">
                  <ellipse cx="28" cy="30" rx="20" ry="24" stroke="#22c55e" strokeWidth="1.5" fill="#22c55e" fillOpacity="0.08" />
                  <circle cx="16" cy="18" r="5" stroke="#64748b" strokeWidth="1.5" fill="none" strokeDasharray="3,2" />
                  <circle cx="40" cy="18" r="5" stroke="#64748b" strokeWidth="1.5" fill="none" strokeDasharray="3,2" />
                  <path d="M22 36c2.5 2.5 8 2.5 10.5 0" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M20-3L20 7" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
              {slideIdx === 2 && (
                <svg className="w-14 h-14" viewBox="0 0 56 56" fill="none">
                  <ellipse cx="28" cy="30" rx="20" ry="24" stroke="#a855f7" strokeWidth="1.5" fill="#a855f7" fillOpacity="0.08" />
                  <circle cx="20" cy="25" r="3.5" stroke="#a855f7" strokeWidth="1" fill="#a855f7" fillOpacity="0.3" />
                  <circle cx="36" cy="25" r="3.5" stroke="#a855f7" strokeWidth="1" fill="#a855f7" fillOpacity="0.3" />
                  <path d="M24 35c1.5 2 5.5 2 7 0" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round" />
                  <text x="23" y="20" fontSize="6" fill="#94a3b8">98%</text>
                </svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-white">{slide.title}</h3>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line max-w-md mx-auto">{slide.body}</p>
            <div className="mt-7">
              <button onClick={handleSlideNext} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                {isLastSlide ? 'Start Building' : 'Next'}
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

  // ── Build ──
  if (phase === 'build') {
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Build a Face</p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-slate-700/50 overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${(Object.keys(placed).length / config.features.length) * 100}%` }} />
            </div>
            <p className="text-[10px] text-slate-300">{unplacedFaceFeatures.length} face features left</p>
          </div>
        </div>

        <div className="p-4 flex flex-col md:flex-row gap-4">
          {/* Left: Feature Cards */}
          <div className="w-full md:w-44 space-y-2">
            <p className="text-[10px] text-slate-300 uppercase tracking-wider">Features ({shuffledAll.length})</p>
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {shuffledAll.map(f => {
                const color = featureColors[f.id] || '#64748b';
                const isSelected = selectedFeature === f.id;
                const isShake = shakeId === f.id;
                const isDecoy = !f.isFaceFeature;
                return (
                    <div
                      key={f.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, f.id)}
                      onClick={() => handleSelectFeature(f.id)}
                      className={`rounded-lg border px-3 py-2.5 flex items-center gap-2.5 cursor-grab active:cursor-grabbing select-none transition-all ${
                        isShake ? 'fb-shake border-red-500/40 bg-red-900/20' :
                        isSelected ? 'border-blue-500/60 bg-blue-900/20 shadow-sm shadow-blue-500/20' :
                        isDecoy ? 'bg-slate-900/60 border-slate-700/30 text-slate-300 hover:border-slate-600/50' :
                        'bg-slate-900/60 border-slate-700/40 text-slate-200 hover:border-blue-500/40 hover:bg-slate-800/60'
                      }`}
                    >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color, opacity: isDecoy ? 0.4 : 1 }} />
                    <span className={`text-xs font-medium ${isDecoy ? 'text-slate-300' : 'text-slate-200'}`}>{f.label}</span>
                  </div>
                );
              })}
            </div>
            {selectedFeature && (
              <p className="text-[10px] text-blue-400 italic">Click a matching area on the face</p>
            )}
          </div>

          {/* Center: Face Canvas */}
          <div className="flex-1 min-w-0 flex justify-center">
            <svg viewBox="0 0 240 300" className="w-full max-w-[220px] h-auto"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); setDragOverZone(null); }}
            >
              <defs>
                <filter id="fb-glow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Face outline */}
              <ellipse cx="120" cy="158" rx="82" ry="102" stroke="#334155" strokeWidth="1.5" fill="#1e293b" />
              <ellipse cx="120" cy="158" rx="82" ry="102" stroke="#475569" strokeWidth="0.5" fill="none" />

              {/* Placed feature SVGs (behind zone outlines) */}
              {faceFeatures.map(f => {
                if (!placed[f.id]) return null;
                return <FeatureSvg key={f.id + '-placed'} featureId={f.id} color={featureColors[f.id] || '#3b82f6'} />;
              })}

              {/* Feature drop zones */}
              {faceFeatures.map(f => {
                const placedHere = placed[f.id];
                const isOver = selectedFeature === f.id;
                const color = featureColors[f.id] || '#3b82f6';

                const isDragOver = dragOverZone === f.id;
                const zoneActive = isOver || isDragOver;

                if (f.id === 'ears') {
                  return (
                    <g key={f.id}>
                      <rect x={f.zoneX - 10} y={f.zoneY} width={f.zoneW} height={f.zoneH} rx="4" fill="transparent" pointerEvents="all"
                        onClick={() => handleClickZone(f.id)}
                        onDragOver={(e) => { e.preventDefault(); setDragOverZone(f.id); }}
                        onDragEnter={(e) => { e.preventDefault(); setDragOverZone(f.id); }}
                        onDragLeave={() => setDragOverZone(null)}
                        onDrop={(e) => handleDropOnZone(e, f.id)}
                        className="cursor-pointer"
                      />
                      <rect x={230 - f.zoneX + 10 - f.zoneW} y={f.zoneY} width={f.zoneW} height={f.zoneH} rx="4" fill="transparent" pointerEvents="all"
                        onClick={() => handleClickZone(f.id)}
                        onDragOver={(e) => { e.preventDefault(); setDragOverZone(f.id); }}
                        onDragEnter={(e) => { e.preventDefault(); setDragOverZone(f.id); }}
                        onDragLeave={() => setDragOverZone(null)}
                        onDrop={(e) => handleDropOnZone(e, f.id)}
                        className="cursor-pointer"
                      />
                      {(!placedHere || zoneActive) && (
                        <g>
                          <rect x={f.zoneX - 10} y={f.zoneY} width={f.zoneW} height={f.zoneH} rx="4" fill="none" stroke={color} strokeWidth={zoneActive ? 2 : 1} strokeDasharray="4,3" opacity={zoneActive ? 0.8 : 0.3} />
                          <rect x={230 - f.zoneX + 10 - f.zoneW} y={f.zoneY} width={f.zoneW} height={f.zoneH} rx="4" fill="none" stroke={color} strokeWidth={zoneActive ? 2 : 1} strokeDasharray="4,3" opacity={zoneActive ? 0.8 : 0.3} />
                        </g>
                      )}
                    </g>
                  );
                }

                return (
                  <g key={f.id}>
                    <rect x={f.zoneX} y={f.zoneY} width={f.zoneW} height={f.zoneH} rx="4" fill="transparent" pointerEvents="all"
                      onClick={() => handleClickZone(f.id)}
                      onDragOver={(e) => { e.preventDefault(); setDragOverZone(f.id); }}
                      onDragEnter={(e) => { e.preventDefault(); setDragOverZone(f.id); }}
                      onDragLeave={() => setDragOverZone(null)}
                      onDrop={(e) => handleDropOnZone(e, f.id)}
                      className="cursor-pointer"
                    />
                    {!placedHere && (
                      <rect x={f.zoneX} y={f.zoneY} width={f.zoneW} height={f.zoneH} rx="4" fill="none" stroke={color} strokeWidth={zoneActive ? 2 : 1} strokeDasharray={zoneActive ? '4,3' : '3,3'} opacity={zoneActive ? 0.8 : 0.25} />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Right: Recognition Panel */}
          <div className="w-full md:w-44 space-y-3">
            <p className="text-[10px] text-slate-300 uppercase tracking-wider">Recognition</p>
            <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-3 space-y-3">
              <div>
                <p className="text-[10px] text-slate-300 mb-1">Confidence</p>
                <p className="text-2xl font-bold text-white">{confidence}<span className="text-sm text-slate-300">%</span></p>
                <div className="mt-1.5 h-2 rounded-full bg-slate-700/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${confidence >= 85 ? 'bg-emerald-500' : confidence >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-300 mb-1">Status</p>
                <p className="text-xs font-medium text-slate-200">{statusLabel}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-300 mb-1">Features Found</p>
                <div className="space-y-1 max-h-[140px] overflow-y-auto">
                  {faceFeatures.map(f => {
                    const placedHere = placed[f.id];
                    return (
                      <div key={f.id} className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${placedHere ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        <span className={`text-[10px] ${placedHere ? 'text-slate-300' : 'text-slate-300'}`}>{f.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="px-4 pb-4">
            <div className="rounded-xl bg-blue-900/15 border border-blue-500/30 p-3 fb-slide">
              <p className="text-xs text-blue-300 text-center">{feedback}</p>
            </div>
          </div>
        )}

        {/* Continue */}
        {allPlaced && (
          <div className="px-4 pb-4 text-center fb-fade">
            <button onClick={() => setPhase('complete')} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20">
              Complete Exercise
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Complete ──
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20" />
      <div className="p-6 space-y-5">
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-white">{config.completionTitle}</h3>
          <p className="text-sm text-slate-300">{config.completionMessage}</p>
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
          <button onClick={onComplete} className="px-5 py-2 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20">
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureSvg({ featureId, color }: { featureId: string; color: string }) {
  switch (featureId) {
    case 'hair':
      return (
        <g className="fb-bounce-in">
          <path d="M48 72 Q50 38 70 32 Q90 26 120 24 Q150 26 170 32 Q190 38 192 72" stroke={color} strokeWidth="3" fill={color} fillOpacity="0.2" strokeLinecap="round" />
          <path d="M52 68 Q54 42 72 36 Q90 30 120 28 Q150 30 168 36 Q186 42 188 68" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12" />
          <path d="M56 64 Q62 44 76 38 Q96 32 120 30 Q144 32 164 38 Q178 44 184 64" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.08" />
        </g>
      );
    case 'eyes':
      return (
        <g className="fb-bounce-in">
          <ellipse cx="90" cy="115" rx="15" ry="11" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12" />
          <ellipse cx="150" cy="115" rx="15" ry="11" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12" />
          <ellipse cx="90" cy="115" rx="6" ry="7" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.25" />
          <ellipse cx="150" cy="115" rx="6" ry="7" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.25" />
          <circle cx="90" cy="115" r="3.5" fill={color} fillOpacity="0.6" />
          <circle cx="150" cy="115" r="3.5" fill={color} fillOpacity="0.6" />
          <circle cx="88" cy="113" r="1.2" fill="#fff" fillOpacity="0.5" />
          <circle cx="148" cy="113" r="1.2" fill="#fff" fillOpacity="0.5" />
        </g>
      );
    case 'eyebrows':
      return (
        <g className="fb-bounce-in">
          <path d="M72 87 Q90 82 108 87" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M132 87 Q150 82 168 87" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'nose':
      return (
        <g className="fb-bounce-in">
          <path d="M120 128 Q114 145 108 156 Q120 162 132 156 Q126 145 120 128" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M116 142 Q120 148 124 142" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.4" />
        </g>
      );
    case 'mouth':
      return (
        <g className="fb-bounce-in">
          <path d="M92 200 Q120 216 148 200" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M96 200 Q120 212 144 200" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.3" />
        </g>
      );
    case 'ears':
      return (
        <g className="fb-bounce-in">
          <ellipse cx="40" cy="130" rx="9" ry="17" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12" />
          <ellipse cx="200" cy="130" rx="9" ry="17" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12" />
          <ellipse cx="40" cy="130" rx="4" ry="9" stroke={color} strokeWidth="0.8" fill={color} fillOpacity="0.08" />
          <ellipse cx="200" cy="130" rx="4" ry="9" stroke={color} strokeWidth="0.8" fill={color} fillOpacity="0.08" />
        </g>
      );
    case 'glasses':
      return (
        <g className="fb-bounce-in">
          <circle cx="90" cy="115" r="17" stroke={color} strokeWidth="1.8" fill="none" />
          <circle cx="150" cy="115" r="17" stroke={color} strokeWidth="1.8" fill="none" />
          <path d="M107 115 L133 115" stroke={color} strokeWidth="1.8" />
          <path d="M73 113 Q58 110 48 118" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M167 113 Q182 110 192 118" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
}
