import { useState, useEffect, useCallback, useRef } from 'react';
import { Scene } from './types';
import Character from './elements/Character';
import SceneObject from './elements/SceneObject';
import ParticleEffect from './elements/ParticleEffect';

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
                  <span className="text-base font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
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
        <div className="absolute left-1/2 -translate-x-1/2 top-[12%] sim-fadeIn pointer-events-none">
          <span className="text-lg font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] sim-float inline-block">
            {scene.narration}
          </span>
        </div>
      )}

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {scenes.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
