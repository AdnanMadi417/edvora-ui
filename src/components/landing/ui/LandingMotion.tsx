"use client";

import { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

/** Honors prefers-reduced-motion for every framer-motion animation below it. */
export default function LandingMotion({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
