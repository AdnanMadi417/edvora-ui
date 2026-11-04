"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

export type FadeInDirection = "up" | "left" | "right" | "none";

interface FadeInProps {
  children: ReactNode;
  /** Which direction the content travels in from. Default "up". */
  direction?: FadeInDirection;
  /** Stagger delay in seconds. Default 0. */
  delay?: number;
  className?: string;
}

// Shared across every scroll-reveal AND every direct motion.*/AnimatePresence
// usage in the app, so all of this app's animation feels like one system
// rather than a pile of unrelated easing curves.
export const EASE = [0.22, 1, 0.36, 1] as const;
/** Scroll-reveal duration — deliberately slow enough to read as a "reveal". */
export const DURATION = 0.55;
/** For snappy interactive UI (dropdowns, tab indicators, accordions) — same
 *  curve as DURATION above, just faster, since 0.55s would feel sluggish
 *  for something the user just clicked and is waiting on. */
export const MICRO_DURATION = 0.25;

const OFFSET = 24;

const offsetFor = (direction: FadeInDirection) => {
  switch (direction) {
    case "up":
      return { y: OFFSET };
    case "left":
      return { x: OFFSET };
    case "right":
      return { x: -OFFSET };
    case "none":
      return {};
  }
};

/**
 * Scroll-triggered fade/slide-in — wraps children in a motion.div that
 * animates in once, the first time it enters the viewport (whileInView,
 * not animate — this never fires on initial mount for content already
 * on-screen with no scrolling involved). Use for sections/cards; for
 * interactive UI (dropdowns, tabs, modals) use motion.* / AnimatePresence
 * directly with the same EASE/DURATION exported above, since those need
 * exit animations and open/close state this component doesn't model.
 */
export default function FadeIn({ children, direction = "up", delay = 0, className }: FadeInProps) {
  const offset = offsetFor(direction);
  const variants: Variants = {
    hidden: { opacity: 0, ...offset },
    visible: { opacity: 1, x: 0, y: 0 },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      transition={{ duration: DURATION, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
