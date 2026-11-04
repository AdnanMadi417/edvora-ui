"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import FadeIn, { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";
import { focusRingInset } from "components/ub/recipes";

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

interface FaqProps {
  items: FaqItem[];
  /** Index open on first render; pass `null` to start fully collapsed. Default: 0. */
  defaultOpenIndex?: number | null;
  /** Allow more than one item open at once. Default: false — one open at a
   *  time, clicking the open item closes it (matches the reference design). */
  allowMultiple?: boolean;
  className?: string;
}

/**
 * A reusable FAQ accordion — one bordered card per question, the open item
 * highlighted in blue with its answer revealed below a divider. Used as-is
 * anywhere a question/answer list is needed; the heading above it (if any)
 * is left to the caller since that copy varies per page.
 */
export default function Faq({
  items,
  defaultOpenIndex = 0,
  allowMultiple = false,
  className = "",
}: FaqProps) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(
    () => new Set(defaultOpenIndex === null ? [] : [defaultOpenIndex])
  );

  const reduceMotion = useReducedMotion();

  const toggle = (index: number) => {
    setOpenIndexes((prev) => {
      if (allowMultiple) {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      }
      // Single-open accordion: clicking the already-open item closes it;
      // clicking any other item replaces whichever was open.
      return prev.has(index) ? new Set() : new Set([index]);
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => {
        const isOpen = openIndexes.has(index);
        return (
          <FadeIn
            key={index}
            delay={index * 0.06}
            className={`overflow-hidden rounded-ub-lg border transition-colors duration-ub-fast ease-ub-standard ${
              isOpen ? "border-ub-tone-brand-border bg-ub-selected" : "border-ub-border bg-ub-surface"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className={`flex w-full items-center justify-between gap-4 rounded-ub-lg px-4 py-4 text-start text-ub-label-lg transition-colors duration-ub-fast ease-ub-standard md:px-6 ${focusRingInset} ${
                isOpen ? "text-ub-text-link" : "text-ub-text-primary hover:bg-ub-surface-subtle"
              }`}
            >
              <span>{item.question}</span>
              <ChevronDown
                aria-hidden
                className={`h-5 w-5 shrink-0 transition-transform duration-ub-base ease-ub-standard motion-reduce:transition-none ${
                  isOpen ? "rotate-180 text-ub-icon-interactive" : "text-ub-icon"
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : MICRO_DURATION, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-ub-tone-brand-border px-4 py-4 text-ub-body-md text-ub-text-secondary md:px-6">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </FadeIn>
        );
      })}
    </div>
  );
}
