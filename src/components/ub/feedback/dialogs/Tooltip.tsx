"use client";

import React, { useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { tooltip } from "components/ub/recipes";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  /** Left/right follow the text direction. */
  position?: "top" | "bottom" | "left" | "right";
}

/** Portalled so long hints cannot widen a table or be clipped by its scroll area. */
export default function Tooltip({ content, children, className, position = "top" }: TooltipProps) {
  const id = useId();
  const trigger = useRef<HTMLSpanElement>(null);
  const hint = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [coordinates, setCoordinates] = useState<{ left: number; top: number } | null>(null);
  const open = hovered || focused;

  useLayoutEffect(() => {
    if (!open || !trigger.current || !hint.current) return;
    const update = () => {
      const anchor = trigger.current?.getBoundingClientRect();
      const box = hint.current?.getBoundingClientRect();
      if (!anchor || !box) return;
      const rtl = getComputedStyle(trigger.current).direction === "rtl";
      const side = rtl && position === "left" ? "right" : rtl && position === "right" ? "left" : position;
      let left = anchor.left + (anchor.width - box.width) / 2;
      let top = anchor.top - box.height - 8;
      if (side === "bottom") top = anchor.bottom + 8;
      if (side === "left" || side === "right") {
        left = side === "left" ? anchor.left - box.width - 8 : anchor.right + 8;
        top = anchor.top + (anchor.height - box.height) / 2;
      }
      setCoordinates({
        left: Math.max(12, Math.min(left, window.innerWidth - box.width - 12)),
        top: Math.max(12, Math.min(top, window.innerHeight - box.height - 12)),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, position, content]);

  return (
    <span
      ref={trigger}
      className={`relative inline-flex min-w-0 max-w-full ${className ?? ""}`}
      aria-describedby={open ? id : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={(event) => { if (event.key === "Escape" && open) { event.stopPropagation(); setHovered(false); setFocused(false); } }}
    >
      {children}
      {open && createPortal(
        <span
          ref={hint}
          id={id}
          role="tooltip"
          className={`${tooltip} fixed z-[1100] w-max whitespace-normal break-words text-start font-normal`}
          style={{ left: coordinates?.left ?? 0, top: coordinates?.top ?? 0, visibility: coordinates ? "visible" : "hidden", maxWidth: "min(280px, calc(100vw - 24px))" }}
        >
          {content}
        </span>,
        document.body
      )}
    </span>
  );
}
