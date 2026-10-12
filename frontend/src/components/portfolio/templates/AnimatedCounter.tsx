import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

// Counts up from 0 to `value` when it scrolls into view — used for every
// stat number across the portfolio templates so the page reads as live and
// data-driven rather than a static mock. Non-numeric values (e.g. "—" for
// no practice data yet) render as plain text with no animation.
export default function AnimatedCounter({ value, className, style }: { value: number | string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const isNumeric = typeof value === 'number';
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1200, bounce: 0 });

  useEffect(() => {
    if (inView && isNumeric) motionVal.set(value as number);
  }, [inView, isNumeric, value, motionVal]);

  useEffect(() => {
    if (!isNumeric) return;
    return spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = Math.round(v).toString();
    });
  }, [spring, isNumeric]);

  if (!isNumeric) {
    return <span className={className} style={style}>{value}</span>;
  }

  return <span ref={ref} className={className} style={style}>0</span>;
}
