import { useState, useEffect, useRef, useContext } from 'react';
import { ScrollContext } from '../components/lesson/ScrollContext';

export function useScrollReveal(totalItems: number, advance?: () => void) {
  const [visibleCount, setVisibleCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const scrollRoot = useContext(ScrollContext).current;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let observer: IntersectionObserver;

    if (ref.current) {
      observer = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          if (advance) advance();
          
          setVisibleCount(prev => {
            if (prev > 0) return prev;
            return 1;
          });
          
          for (let i = 1; i < totalItems; i++) {
            timers.push(setTimeout(() => {
              setVisibleCount(prev => Math.max(prev, i + 1));
            }, i * 350));
          }
          
          setTimeout(() => observer.disconnect(), totalItems * 350 + 100);
        }
      }, { threshold: 0.15, root: scrollRoot ?? null });
      
      observer.observe(ref.current);
    }

    return () => {
      if (observer) observer.disconnect();
      timers.forEach(t => clearTimeout(t));
    };
  }, [scrollRoot, totalItems, advance]);

  const outerStyle = {
    transition: 'opacity 700ms ease-out, transform 700ms ease-out',
    opacity: visibleCount > 0 ? 1 : 0,
    transform: visibleCount > 0 ? 'translateY(0)' : 'translateY(40px)',
  };

  const getInnerStyle = (index: number) => ({
    transition: 'opacity 500ms ease-out, transform 500ms ease-out',
    opacity: visibleCount > index ? 1 : 0,
    transform: visibleCount > index ? 'translateY(0)' : 'translateY(8px)',
  });

  return { ref, visibleCount, outerStyle, getInnerStyle };
}
