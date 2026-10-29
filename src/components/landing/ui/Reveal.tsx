"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li";
}

/**
 * Fade-up on first scroll into view. MotionConfig reducedMotion="user" in
 * LandingMotion turns the movement off for prefers-reduced-motion.
 */
export default function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const Component = as === "li" ? motion.li : motion.div;
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.48, delay, ease: [0, 0, 0.2, 1] }}
    >
      {children}
    </Component>
  );
}
