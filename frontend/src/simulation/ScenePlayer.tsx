import { useState, useEffect, useCallback, useRef } from 'react';
import { Scene } from './types';
import Character from './elements/Character';
import SceneObject from './elements/SceneObject';
import ParticleEffect from './elements/ParticleEffect';

const simStyle = document.createElement('style');
simStyle.textContent = `
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
  @keyframes simBlink { 0%, 95%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } }
  @keyframes simPageOpen { 0% { transform: translate(-50%, -50%) scaleX(0.3) scaleY(0.5); opacity: 0; } 50% { transform: translate(-50%, -50%) scaleX(1.1) scaleY(1); opacity: 1; } 100% { transform: translate(-50%, -50%) scaleX(1) scaleY(1); opacity: 1; } }
  @keyframes simType { 0%, 100% { transform: translateY(0); } 25% { transform: translateY(-2px); } 75% { transform: translateY(1px); } }
  @keyframes simDance { 0%, 100% { transform: translate(-50%, -50%) rotate(0deg); } 25% { transform: translate(-50%, -50%) rotate(-4deg) translateY(-4px); } 50% { transform: translate(-50%, -50%) rotate(0deg) translateY(-8px); } 75% { transform: translate(-50%, -50%) rotate(4deg) translateY(-4px); } }
  @keyframes simSmile { 0%, 100% { d: path('M 35 27 Q 40 32 45 27'); } 50% { d: path('M 33 25 Q 40 34 47 25'); } }
  @keyframes simNarrate { 0% { opacity: 0; transform: translateY(-6px); } 100% { opacity: 1; transform: translateY(0); } }
  @keyframes simTypewriter { 0% { width: 0; opacity: 0; } 10% { opacity: 1; } 95% { opacity: 1; } 100% { width: 100%; opacity: 1; } }
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
  .sim-eyes { animation: simBlink 3s ease-in-out infinite; transform-origin: center; }
  .sim-pageOpen { animation: simPageOpen 0.8s ease-out both; }
  .sim-type { animation: simType 0.6s ease-in-out infinite; }
  .sim-dance { animation: simDance 0.8s ease-in-out infinite; }
  .sim-smile { animation: simSmile 1.5s ease-in-out infinite; }
  .sim-typewriter { overflow: hidden; white-space: nowrap; animation: simTypewriter 2s steps(30) forwards; }
  .sim-narrate { animation: simNarrate 0.4s ease-out both; }
`;
document.head.appendChild(simStyle);

interface ScenePlayerProps {
  scenes: Scene[];
  onFinish?: () => void;
  className?: string;
}

export default function ScenePlayer({ scenes, onFinish, className = '' }: ScenePlayerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());
  const [showNarration, setShowNarration] = useState(false);
  const timersRef = useRef<number[]>([]);
  const scene = scenes[currentIdx];

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const advance = useCallback(() => {
    clearTimers();
    if (currentIdx < scenes.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      onFinish?.();
    }
  }, [currentIdx, scenes.length, clearTimers, onFinish]);

  useEffect(() => {
    if (!scene) return;

    setVisibleElements(new Set());
    setShowNarration(false);

    scene.elements.forEach(el => {
      const t = window.setTimeout(() => {
        setVisibleElements(prev => new Set(prev).add(el.id));
      }, el.delay ?? 0);
      timersRef.current.push(t);
    });

    const maxDelay = Math.max(0, ...scene.elements.map(el => (el.delay ?? 0) + 500));
    const nt = window.setTimeout(() => setShowNarration(true), maxDelay);
    timersRef.current.push(nt);

    const at = window.setTimeout(advance, scene.duration);
    timersRef.current.push(at);

    return clearTimers;
  }, [scene]);

  if (!scenes.length) {
    return null;
  }

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`} onClick={advance}>
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{ background: scene.background }}
      />

      <div className="absolute inset-0">
        {scene.elements.map(el => {
          const isVisible = visibleElements.has(el.id);
          if (!isVisible) return null;

          const animClass = `sim-${el.motion}`;
          const idleClass = el.idle && el.idle !== 'none' ? `sim-${el.idle}` : '';
          const classes = [animClass, idleClass].filter(Boolean).join(' ');
          const posStyle: React.CSSProperties = {
            position: 'absolute',
            left: `${el.x}%`,
            top: `${el.y}%`,
            transform: 'translate(-50%, -50%)',
          };

          switch (el.type) {
            case 'character':
              return (
                <div key={el.id} className={classes} style={posStyle}>
                  <Character
                    skinTone={el.data.skinTone}
                    hairColor={el.data.hairColor}
                    shirtColor={el.data.shirtColor}
                    size={el.data.size ?? 1}
                    waving={el.data.waving ?? false}
                    gender={el.data.gender ?? 'neutral'}
                  />
                </div>
              );
            case 'object':
              return (
                <div key={el.id} className={classes} style={posStyle}>
                  <SceneObject
                    type={el.data.objectType}
                    color={el.data.color}
                    label={el.data.label}
                    size={el.data.size ?? 1}
                  />
                </div>
              );
            case 'text':
              return (
                <div key={el.id} className={classes} style={posStyle}>
                  <span
                    className="font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] inline-block"
                    style={{
                      color: el.data.color || '#f1f5f9',
                      fontSize: `${(el.data.size ?? 0.8) * 1.2}rem`,
                      textShadow: el.data.color && el.data.size >= 2
                        ? `0 0 24px ${el.data.color}40, 0 0 48px ${el.data.color}20`
                        : undefined,
                    }}
                  >
                    {el.data.text}
                  </span>
                </div>
              );
            case 'particles':
              return (
                <ParticleEffect key={el.id} count={el.data.count ?? 12} color={el.data.color} />
              );
            default:
              return null;
          }
        })}
      </div>

      {showNarration && scene.narration && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[5%] sim-narrate pointer-events-none z-20">
          <span className="text-sm font-semibold text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] tracking-wide">
            {scene.narration}
          </span>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {scenes.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === currentIdx
                ? 'w-5 h-1.5 bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.3)]'
                : 'w-1.5 h-1.5 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
