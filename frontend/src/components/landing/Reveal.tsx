import { motion } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
  style?: CSSProperties;
}

export default function Reveal({ children, delay = 0, direction = "up", className = "", style }: RevealProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { opacity: 0, y: 20 };
      case "down": return { opacity: 0, y: -20 };
      case "left": return { opacity: 0, x: -20 };
      case "right": return { opacity: 0, x: 20 };
      default: return { opacity: 0, y: 20 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
