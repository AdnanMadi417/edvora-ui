"use client";

import React, { useEffect, useRef, useState } from "react";

interface TableWrapperProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function TableWrapper({ children, footer }: TableWrapperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateScrollState = () => {
      setCanScrollLeft(el.scrollLeft > 1);
      setCanScrollRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 1);
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
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="relative">
        <div ref={scrollRef} className="overflow-x-auto">
          {children}
        </div>
        {canScrollLeft && (
          <div className="pointer-events-none absolute inset-y-0 left-0 w-4 shadow-[inset_8px_0_8px_-8px_rgba(15,23,42,0.15)]" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-4 shadow-[inset_-8px_0_8px_-8px_rgba(15,23,42,0.15)]" />
        )}
      </div>
      {footer}
    </div>
  );
}
