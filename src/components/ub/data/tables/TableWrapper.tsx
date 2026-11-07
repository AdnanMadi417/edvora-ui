"use client";

import React, { useEffect, useRef, useState } from "react";
import { tableContainer, tableScroll } from "components/ub/recipes";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { focusRing } from "components/ub/recipes";

interface TableWrapperProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  scrollClassName?: string;
  scrollLabel?: string;
}

/**
 * Data table container (brief §4.6): radius 12, 1px border, surface fill.
 * The table scrolls inside its own container; soft edge shadows show which
 * side has more columns. Scroll edges are tracked in logical terms so the
 * hints sit on the correct side in RTL.
 */
export default function TableWrapper({ children, footer, scrollClassName, scrollLabel }: TableWrapperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollStart, setCanScrollStart] = useState(false);
  const [canScrollEnd, setCanScrollEnd] = useState(false);
  const move = (forward: boolean) => {
    const el = scrollRef.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    el.scrollBy({ left: (forward ? 1 : -1) * (rtl ? -1 : 1) * Math.max(160, el.clientWidth * 0.75), behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateScrollState = () => {
      // In RTL scrollLeft runs from 0 to negative values.
      const offset = Math.abs(el.scrollLeft);
      setCanScrollStart(offset > 1);
      setCanScrollEnd(el.scrollWidth - el.clientWidth - offset > 1);
    };

    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [children]);

  return (
    <div className={`min-w-0 max-w-full ${tableContainer}`}>
      <div className="relative">
        <div ref={scrollRef} style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x pan-y pinch-zoom", overscrollBehaviorY: "auto" }} className={`${tableScroll} ${scrollClassName ?? "max-h-[65dvh] overflow-y-auto overscroll-contain"}`} role={scrollLabel ? "region" : undefined} aria-label={scrollLabel} tabIndex={scrollLabel ? 0 : undefined}>
          {children}
        </div>
        {canScrollStart && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 start-0 w-4 bg-gradient-to-r from-ub-navy/10 to-transparent rtl:bg-gradient-to-l dark:from-black/40"
          />
        )}
        {canScrollEnd && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 end-0 w-4 bg-gradient-to-l from-ub-navy/10 to-transparent rtl:bg-gradient-to-r dark:from-black/40"
          />
        )}
      </div>
      {(canScrollStart || canScrollEnd) && (
        <div className="flex items-center justify-between gap-3 border-t border-ub-border bg-ub-surface px-3 py-2">
          <span className="text-ub-caption text-ub-text-tertiary">More columns <span className="hidden sm:inline">— scroll horizontally</span></span>
          <div className="flex gap-1">
            <button type="button" aria-label="Scroll to previous columns" disabled={!canScrollStart} onClick={() => move(false)} className={`grid h-9 w-9 place-items-center rounded-ub-full text-ub-text-link hover:bg-ub-selected disabled:opacity-30 ${focusRing}`}><ChevronLeft className="h-4 w-4 rtl:rotate-180" /></button>
            <button type="button" aria-label="Scroll to next columns" disabled={!canScrollEnd} onClick={() => move(true)} className={`grid h-9 w-9 place-items-center rounded-ub-full text-ub-text-link hover:bg-ub-selected disabled:opacity-30 ${focusRing}`}><ChevronRight className="h-4 w-4 rtl:rotate-180" /></button>
          </div>
        </div>
      )}
      {footer}
    </div>
  );
}
