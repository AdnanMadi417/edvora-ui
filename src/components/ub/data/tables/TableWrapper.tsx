"use client";

import React, { useEffect, useRef, useState } from "react";
import { tableContainer, tableScroll } from "components/ub/recipes";

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
        <div ref={scrollRef} className={`${tableScroll} ${scrollClassName ?? "max-h-[65dvh] overflow-y-auto overscroll-contain"}`} role={scrollLabel ? "region" : undefined} aria-label={scrollLabel} tabIndex={scrollLabel ? 0 : undefined}>
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
      {footer}
    </div>
  );
}
