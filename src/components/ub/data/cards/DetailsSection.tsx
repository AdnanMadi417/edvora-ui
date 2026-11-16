"use client";
import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";

/** Shared content section for program and university detail pages. */
export default function DetailsSection({
  id,
  title,
  description,
  action,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reducedMotion ? 0 : MICRO_DURATION,
        ease: EASE,
        delay: reducedMotion ? 0 : 0.08,
      }}
      tabIndex={-1}
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      className="scroll-mt-24 rounded-ub-lg border border-ub-border bg-ub-surface p-5 shadow-ub-xs focus:outline-none sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id={id ? `${id}-title` : undefined}
            className="text-ub-heading-md text-ub-text-primary"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}
