import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import Reveal from "./Reveal";
import { useParallax } from "./hooks/useParallax";
import Confetti from "./Confetti";
import MagneticButton from "./MagneticButton";

export default function CTASection() {
  const containerRef = useRef<HTMLElement>(null);
  const [celebrated, setCelebrated] = useState(false);
  const inView = useInView(containerRef, { once: true, margin: "-100px" });

  // Fires exactly once on this page — the only confetti moment, saved for
  // the very end so it lands as a payoff, not decoration.
  useEffect(() => {
    if (inView) setCelebrated(true);
  }, [inView]);

  // Outer shapes float in opposite directions
  const topBlobY = useParallax(containerRef, -40);
  const bottomBlobY = useParallax(containerRef, 40);

  return (
    <section ref={containerRef} className="py-24 relative overflow-hidden bg-[var(--bg-main)] border-y border-[var(--border-primary)]">
      {/* Decorative blurred shapes behind text — subtle ambient light, not a color block */}
      <motion.div style={{ y: topBlobY }} className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent-indigo)]/10 blur-[100px] rounded-full pointer-events-none" />
      <motion.div style={{ y: bottomBlobY }} className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--accent-violet)]/8 blur-[100px] rounded-full pointer-events-none" />
      <Confetti trigger={celebrated} />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <Reveal delay={0.1}>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-6 leading-tight">
            Ready to build something real?
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-[var(--text-secondary)] text-lg mb-10 max-w-2xl mx-auto">
            Start your first AI-reviewed project today.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <MagneticButton>
            <Link to="/register" className="px-10 py-4 bg-[var(--accent-indigo)] text-[#fff] hover:bg-[var(--accent-indigo)]/80 rounded-lg font-bold text-base transition-colors duration-300 shadow-lg shadow-black/20 inline-block">
              Start Building
            </Link>
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}
