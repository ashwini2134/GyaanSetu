import { motion } from "framer-motion";

// A small, one-time celebratory burst — brand colors only (teal, navy, mint),
// not a rainbow. Meant to be used exactly once on the page.
const COLORS = ["#00BFB3", "#1B2B44", "#79C8C2"];
const PIECES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 340,
  rotate: Math.random() * 360,
  delay: Math.random() * 0.15,
  color: COLORS[i % COLORS.length],
  size: 5 + Math.random() * 5,
  shape: i % 3 === 0 ? "circle" : "rect",
}));

export default function Confetti({ trigger }: { trigger: boolean }) {
  if (!trigger) return null;
  return (
    <div className="absolute inset-x-0 top-1/3 flex justify-center pointer-events-none overflow-visible" aria-hidden>
      {PIECES.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: 0, x: p.x, y: 160 + Math.random() * 60, rotate: p.rotate }}
          transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
