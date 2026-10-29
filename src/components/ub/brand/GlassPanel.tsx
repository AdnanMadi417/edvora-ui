import { createElement, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";
import clsx from "clsx";

// Glass surface (brief §3.2, §3.3). Use it for chrome and summaries only:
// sidebar, top bar, stat and summary cards, pills. Data tables, forms and any
// text longer than two lines go on solid white instead. The solid fallback
// (no backdrop-filter support, prefers-reduced-transparency) lives in the
// .ub-glass* utilities in src/styles/tokens/utilities.css.

export type GlassVariant = "light" | "light-strong" | "dark";
export type GlassPadding = "none" | "sm" | "md" | "lg";

export type GlassPanelProps<T extends ElementType = "div"> = {
  /** light (62% white, default), light-strong (82% white) or dark (dark sections only, never on data tables). */
  variant?: GlassVariant;
  /** none 0 · sm 16 · md 16→24 (default) · lg 24→32. */
  padding?: GlassPadding;
  /** Element to render, e.g. "aside", "section", "header". Default "div". */
  as?: T;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

const VARIANT: Record<GlassVariant, string> = {
  // Light glass turns into dark glass by itself under data-ub-theme="dark".
  light: "ub-glass-light text-ub-text-primary",
  "light-strong": "ub-glass-light-strong text-ub-text-primary",
  // Dark glass always sits on navy, so its text is always white.
  dark: "ub-glass text-ub-text-on-action",
};

const PADDING: Record<GlassPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-4 md:p-6",
  lg: "p-6 md:p-8",
};

/** A radius-16 glass panel (light, strong or dark). */
export default function GlassPanel<T extends ElementType = "div">({ variant = "light", padding = "md", as, className, children, ...rest }: GlassPanelProps<T>) {
  return createElement(as ?? "div", { ...rest, className: clsx("rounded-ub-xl", VARIANT[variant], PADDING[padding], className) }, children);
}
