import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// The one signature interaction for the Terminal template — everything
// else stays deliberately restrained (simple fades, no per-element motion).
export default function Typewriter({ text, speed = 35, className }: { text: string; speed?: number; className?: string }) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    setDisplay('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setDisplay(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span className={className}>
      {display}
      <motion.span
        className="inline-block w-[0.55em] h-[1em] align-middle ml-0.5 -mb-0.5"
        style={{ backgroundColor: 'currentColor' }}
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: 'linear' }}
      />
    </span>
  );
}
