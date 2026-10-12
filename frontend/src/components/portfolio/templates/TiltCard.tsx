import { useRef, type ReactNode, type CSSProperties } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Mouse-tracked 3D tilt + a cursor-follow highlight — the "premium template
// gallery" interaction (Canva/Notion-style cards) applied to real portfolio
// content. Tilt is intentionally subtle (max ~8deg) so text stays readable;
// the glare is a small radial highlight that follows the pointer.
export default function TiltCard({
  children, className, style, glareColor = 'rgba(255,255,255,0.35)', maxTilt = 8,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  glareColor?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 200, damping: 20, mass: 0.4 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-maxTilt, maxTilt]), springConfig);
  const glareX = useTransform(mouseX, (v) => `${v * 100}%`);
  const glareY = useTransform(mouseY, (v) => `${v * 100}%`);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, rotateX, rotateY, transformPerspective: 800 }}
      className={`relative ${className ?? ''}`}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: useTransform([glareX, glareY], ([x, y]) => `radial-gradient(circle at ${x} ${y}, ${glareColor}, transparent 60%)`) }}
      />
      {children}
    </motion.div>
  );
}
