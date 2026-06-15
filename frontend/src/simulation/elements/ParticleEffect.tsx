import { useMemo } from 'react';

interface ParticleEffectProps {
  count?: number;
  color?: string;
}

export default function ParticleEffect({ count = 12, color = '#fbbf24' }: ParticleEffectProps) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => {
      const angle = (2 * Math.PI * i) / count + (Math.random() - 0.5) * 0.4;
      const distance = 25 + Math.random() * 35;
      return {
        x: 50 + Math.cos(angle) * distance * 0.2,
        y: 50 + Math.sin(angle) * distance * 0.2,
        size: 4 + Math.random() * 6,
        delay: Math.random() * 0.4,
      };
    }), [count]);

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute sim-sparkle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <svg viewBox="0 0 16 16" width={p.size} height={p.size}>
            <path d="M8 1 L9.5 6.5 L15 8 L9.5 9.5 L8 15 L6.5 9.5 L1 8 L6.5 6.5 Z" fill={color} />
          </svg>
        </div>
      ))}
    </>
  );
}
