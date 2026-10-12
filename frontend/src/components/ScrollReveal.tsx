import React, { useContext, useEffect, useRef, useState } from 'react';
import { ScrollContext } from './lesson/ScrollContext';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
}

export default function ScrollReveal({ children, delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const scrollRoot = useContext(ScrollContext).current;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0,
        root: scrollRoot ?? null,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    observer.observe(el);

    return () => {
      if (el) {
        observer.unobserve(el);
      }
    };
  }, [scrollRoot]);

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(60px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
    transitionDelay: `${delay}s`,
  };

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}
