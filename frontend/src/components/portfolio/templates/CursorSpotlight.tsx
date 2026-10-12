import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// A soft radial glow that follows the pointer within its parent container —
// used on hero/banner areas to give the page an "alive under your cursor"
// feel instead of a static gradient. Purely decorative, pointer-events none.
export default function CursorSpotlight({ color = 'rgba(255,255,255,0.18)', size = 420 }: { color?: string; size?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const springX = useSpring(x, { stiffness: 120, damping: 20 });
  const springY = useSpring(y, { stiffness: 120, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(-9999); y.set(-9999); }}
    >
      <motion.div
        className="pointer-events-none absolute rounded-full blur-3xl"
        style={{
          width: size, height: size, left: springX, top: springY,
          x: -size / 2, y: -size / 2,
          background: `radial-gradient(circle, ${color}, transparent 70%)`,
        }}
      />
    </div>
  );
}
