"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import FadeIn, { EASE, MICRO_DURATION } from "components/ui/FadeIn";

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
            className={`overflow-hidden rounded-2xl border transition-colors ${
              isOpen ? "border-blue-100 bg-blue-50" : "border-slate-200 bg-white"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className={`flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-base font-medium transition ${
                isOpen ? "text-blue-700" : "text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>{item.question}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-blue-600" : "text-slate-400"
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
                  transition={{ duration: MICRO_DURATION, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-blue-100 px-6 py-4 text-sm leading-relaxed text-slate-600">
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
