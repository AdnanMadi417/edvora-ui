"use client";

import React from "react";
import { tooltip } from "components/ub/recipes";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  /**
   * Which side of the trigger the tooltip pops out on. Defaults to "top".
   * Prefer "left"/"right" for triggers inside dense table rows, where a
   * top/bottom tooltip is tall enough to overlap a neighboring row.
   * "left"/"right" are the start/end sides in LTR and mirror in RTL.
   */
  position?: "top" | "bottom" | "left" | "right";
}

const CENTER_X = "start-1/2 -translate-x-1/2 rtl:translate-x-1/2";
const CENTER_Y = "top-1/2 -translate-y-1/2";

const POSITION_CLASSES: Record<NonNullable<TooltipProps["position"]>, string> = {
  top: `bottom-full mb-2 ${CENTER_X}`,
  bottom: `top-full mt-2 ${CENTER_X}`,
  left: `end-full me-2 ${CENTER_Y}`,
  right: `start-full ms-2 ${CENTER_Y}`,
};

const ARROW_CLASSES: Record<NonNullable<TooltipProps["position"]>, string> = {
  top: `top-full ${CENTER_X} border-t-ub-tooltip`,
  bottom: `bottom-full ${CENTER_X} border-b-ub-tooltip`,
  left: `start-full ${CENTER_Y} ltr:border-l-ub-tooltip rtl:border-r-ub-tooltip`,
  right: `end-full ${CENTER_Y} ltr:border-r-ub-tooltip rtl:border-l-ub-tooltip`,
};

/** Neutral-900 tooltip, max width 280 (brief §4.7). Shows on hover and keyboard focus. */
export default function Tooltip({ content, children, className, position = "top" }: TooltipProps) {
  return (
    <span className={`group/tooltip relative inline-flex ${className ?? ""}`}>
      {children}
      <span
        role="tooltip"
        className={`${tooltip} absolute z-50 w-max whitespace-normal text-start font-normal opacity-0 transition-opacity duration-ub-fast ease-ub-standard motion-reduce:transition-none group-focus-within/tooltip:opacity-100 group-hover/tooltip:opacity-100 ${POSITION_CLASSES[position]}`}
      >
        {content}
        <span aria-hidden className={`absolute border-4 border-transparent ${ARROW_CLASSES[position]}`} />
      </span>
    </span>
  );
}
