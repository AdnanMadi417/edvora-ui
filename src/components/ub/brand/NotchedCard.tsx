"use client";

import { useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

// The notch (brief §3.5): a 45° cut at the bottom-end corner (bottom-left
// under dir="rtl"), drawn with the .ub-notch-* clip-path utilities.
//
// clip-path removes borders and shadows, so:
// - the border is an inner SVG stroke whose path is computed from the card's
//   measured size and the notch size (ResizeObserver);
// - the shadow is filter: drop-shadow() on an unclipped wrapper.

export type NotchSize = "sm" | "md" | "lg";
export type NotchedCardFill = "surface" | "brand" | "navy";

export interface NotchedCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Notch size: sm 12 · md 24 (default) · lg 40. Also sets padding and radius. */
  size?: NotchSize;
  /** surface (white / navy surface in dark, with a border), brand (Primary Blue) or navy. Default "surface". */
  fill?: NotchedCardFill;
  /** Soft navy drop-shadow on the wrapper. Default true. */
  elevated?: boolean;
  /**
   * Content placed in the cut-out at the bottom-end corner, usually the
   * Unibexs symbol. It fits a square of half the notch size (20px on lg).
   */
  symbol?: ReactNode;
  /** Square corners below 640px, for full-screen mobile sheets (MilestoneMoment). Default false. */
  sheetOnMobile?: boolean;
  /** Classes for the outer (unclipped) wrapper, e.g. width or grid placement. */
  wrapperClassName?: string;
  children?: ReactNode;
}

/** Notch sizes in px; mirror --ub-notch-sm/md/lg in primitives.css. */
export const NOTCH_PX: Record<NotchSize, number> = { sm: 12, md: 24, lg: 40 };
/** Fallback corner radius in px when it can't be measured; mirrors --ub-radius-xl (16) and --ub-radius-2xl (24, marketing cards). */
const RADIUS_PX: Record<NotchSize, number> = { sm: 16, md: 24, lg: 24 };

const SIZE: Record<NotchSize, string> = {
  sm: "ub-notch-sm p-4",
  md: "ub-notch-md p-6",
  lg: "ub-notch-lg p-6 md:p-8",
};
const RADIUS: Record<NotchSize, string> = { sm: "rounded-ub-xl", md: "rounded-ub-2xl", lg: "rounded-ub-2xl" };
const RADIUS_SHEET: Record<NotchSize, string> = { sm: "rounded-none sm:rounded-ub-xl", md: "rounded-none sm:rounded-ub-2xl", lg: "rounded-none sm:rounded-ub-2xl" };

const FILL: Record<NotchedCardFill, { body: string; stroke?: string }> = {
  surface: { body: "bg-ub-surface text-ub-text-primary", stroke: "text-ub-border" },
  brand: { body: "bg-ub-blue-600 text-ub-text-on-action" },
  navy: { body: "bg-ub-navy text-ub-text-on-action", stroke: "text-ub-navy-border" },
};

// Navy-tinted drop-shadow, from the deep-navy token (no raw colour).
const DROP_SHADOW = "drop-shadow(0 8px 24px color-mix(in srgb, var(--ub-deep-navy) 10%, transparent))";

/** Outline of a card with rounded corners and a notch at the bottom-right, inset half a pixel for a crisp 1px stroke. */
export function notchPath(w: number, h: number, notch: number, radius: number): string {
  const i = 0.5;
  const r = Math.max(0, Math.min(radius, w / 2, h / 2) - i);
  const n = Math.min(notch, w, h);
  return [
    `M ${i + r} ${i}`,
    `H ${w - i - r}`,
    `A ${r} ${r} 0 0 1 ${w - i} ${i + r}`,
    `V ${h - n}`,
    `L ${w - n} ${h - i}`,
    `H ${i + r}`,
    `A ${r} ${r} 0 0 1 ${i} ${h - i - r}`,
    `V ${i + r}`,
    `A ${r} ${r} 0 0 1 ${i + r} ${i}`,
    "Z",
  ].join(" ");
}

/**
 * Brand / marketing / feature card with the notch.
 *
 * Allowed on marketing cards, milestone moments, the Verified Badge and
 * feature cards only. NEVER use it for product cards, tables, inputs or
 * modals (brief §3.5, §12) — use the standard Card there.
 */
export default function NotchedCard({ size = "md", fill = "surface", elevated = true, symbol, sheetOnMobile = false, wrapperClassName, className, children, ...rest }: NotchedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number; r: number } | null>(null);
  const stroke = FILL[fill].stroke;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !stroke) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      // Follow the rendered radius (it changes at breakpoints for mobile sheets).
      const computed = parseFloat(getComputedStyle(el).borderStartStartRadius || getComputedStyle(el).borderTopLeftRadius);
      const r = Number.isFinite(computed) ? computed : RADIUS_PX[size];
      setBox((prev) => (prev && prev.w === width && prev.h === height && prev.r === r ? prev : { w: width, h: height, r }));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stroke, size]);

  const notch = NOTCH_PX[size];
  const half = notch / 2;

  return (
    <div className={clsx("relative", wrapperClassName)} style={elevated ? { filter: DROP_SHADOW } : undefined}>
      <div ref={ref} {...rest} className={clsx("relative", (sheetOnMobile ? RADIUS_SHEET : RADIUS)[size], "rounded-ee-none", SIZE[size], FILL[fill].body, className)}>
        {stroke && box && box.w > 0 && (
          <svg
            aria-hidden="true"
            focusable="false"
            className={clsx("pointer-events-none absolute inset-0 h-full w-full rtl:-scale-x-100", stroke)}
            viewBox={`0 0 ${box.w} ${box.h}`}
          >
            <path d={notchPath(box.w, box.h, notch, box.r)} fill="none" stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          </svg>
        )}
        {children}
      </div>
      {symbol && (
        <span aria-hidden="true" className="absolute bottom-0 end-0 flex items-end justify-end overflow-hidden" style={{ width: half, height: half }}>
          {symbol}
        </span>
      )}
    </div>
  );
}
