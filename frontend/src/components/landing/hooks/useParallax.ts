import { RefObject } from "react";
import { useScroll, useTransform, useReducedMotion, MotionValue } from "framer-motion";

/**
 * A shared hook for consistent scroll-linked parallax motion.
 * Maps the target ref's scroll progress through the viewport to a pixel offset.
 *
 * @param ref The target element to track scroll progress against
 * @param distance The pixel distance to move (e.g., 50 means [-50px, 50px] range)
 * @param offset How to map scroll progress (defaults to when target enters/leaves viewport)
 * @returns A framer-motion MotionValue for `y` or `x` transforms
 */
export function useParallax(
  ref: RefObject<HTMLElement>,
  distance: number,
  offset: ["start end", "end start"] | ["start start", "end end"] | any = ["start end", "end start"]
): MotionValue<number> {
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset,
  });

  return useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [-distance, distance]
  );
}
