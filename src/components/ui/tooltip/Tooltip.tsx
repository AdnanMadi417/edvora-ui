"use client";

import React from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  /**
   * Which side of the trigger the tooltip pops out on. Defaults to "top".
   * Prefer "left"/"right" for triggers inside dense table rows, where a
   * top/bottom tooltip is tall enough to overlap a neighboring row.
   */
  position?: "top" | "bottom" | "left" | "right";
}

const POSITION_CLASSES: Record<NonNullable<TooltipProps["position"]>, string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

const ARROW_CLASSES: Record<NonNullable<TooltipProps["position"]>, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-slate-900",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-slate-900",
  left: "left-full top-1/2 -translate-y-1/2 border-l-slate-900",
  right: "right-full top-1/2 -translate-y-1/2 border-r-slate-900",
};

export default function Tooltip({ content, children, className, position = "top" }: TooltipProps) {
  return (
    <span className={`group/tooltip relative inline-flex ${className ?? ""}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 w-56 rounded-lg bg-slate-900 px-3 py-2 text-xs font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tooltip:opacity-100 ${POSITION_CLASSES[position]}`}
      >
        {content}
        <span className={`absolute border-4 border-transparent ${ARROW_CLASSES[position]}`} />
      </span>
    </span>
  );
}
