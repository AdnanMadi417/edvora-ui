"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";

export interface CollapseProps {
  /** Shown when true; mounts and unmounts with a height + fade transition. */
  open: boolean;
  children: ReactNode;
  /** Skip the animation on first render (content that starts open). Default true. */
  skipInitial?: boolean;
  /** Layout only. */
  className?: string;
}

/**
 * Smoothly reveals and hides content that appears on demand: optional
 * fields, an error summary, "show more" sections. Height and opacity
 * animate together (250ms, the app's EASE); under prefers-reduced-motion
 * it only fades, briefly. Content is unmounted when closed, so hidden
 * fields are out of the tab order.
 */
export default function Collapse({ open, children, skipInitial = true, className }: CollapseProps) {
  const reduce = useReducedMotion();
  // Clip only while animating, so focus rings on fields inside aren't cut off at rest.
  const [animating, setAnimating] = useState(false);
  return (
    <AnimatePresence initial={!skipInitial}>
      {open && (
        <motion.div
          key="collapse"
          className={className}
          style={{ overflow: animating ? "hidden" : "visible" }}
          onAnimationStart={() => setAnimating(true)}
          onAnimationComplete={() => setAnimating(false)}
          initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: reduce ? 0.12 : MICRO_DURATION, ease: EASE }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
