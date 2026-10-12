import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface ScrollRevealProps {
  totalItems: number;
  advance?: () => void;
  className?: string;
  children: (
    visibleCount: number,
    outerStyle: React.CSSProperties,
    getInnerStyle: (index: number) => React.CSSProperties
  ) => React.ReactNode;
}

export function ScrollReveal({ totalItems, advance, className, children }: ScrollRevealProps) {
  const { ref, visibleCount, outerStyle, getInnerStyle } = useScrollReveal(totalItems, advance);
  
  return (
    <div ref={ref} className={className}>
      {children(visibleCount, outerStyle, getInnerStyle)}
    </div>
  );
}
