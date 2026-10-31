import React, { type HTMLAttributes, type ReactNode } from "react";
import { tagBase, tagDot, tagSm, tagSolidTones, tagTones, type TagTone } from "components/ub/recipes";

/** Stage-tag hues (brief §4.3), backed by the --ub-tag-<hue>-* tokens. */
export type TagHue = "sky" | "indigo" | "orange" | "plum" | "amber" | "red" | "pink" | "teal" | "grey";
export type TagSize = "md" | "sm";
export type TagVariant = "tinted" | "solid";

// Hue tags read the tag tokens directly. In the dark theme those tokens swap
// to the v1.1 dark pairs with a 40% solid-hue border (semantic.css), so no
// dark: classes are needed here.
// Written out in full so Tailwind's JIT sees every class.
export const tagHueTones: Record<TagHue, string> = {
  sky: "border-ub-tag-sky-border bg-ub-tag-sky-bg text-ub-tag-sky-text",
  indigo:
    "border-ub-tag-indigo-border bg-ub-tag-indigo-bg text-ub-tag-indigo-text",
  orange:
    "border-ub-tag-orange-border bg-ub-tag-orange-bg text-ub-tag-orange-text",
  plum: "border-ub-tag-plum-border bg-ub-tag-plum-bg text-ub-tag-plum-text",
  amber:
    "border-ub-tag-amber-border bg-ub-tag-amber-bg text-ub-tag-amber-text",
  red: "border-ub-tag-red-border bg-ub-tag-red-bg text-ub-tag-red-text",
  pink: "border-ub-tag-pink-border bg-ub-tag-pink-bg text-ub-tag-pink-text",
  teal: "border-ub-tag-teal-border bg-ub-tag-teal-bg text-ub-tag-teal-text",
  grey: "border-ub-tag-grey-border bg-ub-tag-grey-bg text-ub-tag-grey-text",
};

/** Solid hue fills. Navy text except on the two hues dark enough for white (≥ 4.5:1). */
export const tagHueSolidTones: Record<TagHue, string> = {
  sky: "border-transparent bg-ub-tag-sky-solid text-ub-navy",
  indigo: "border-transparent bg-ub-tag-indigo-solid text-ub-text-on-action",
  orange: "border-transparent bg-ub-tag-orange-solid text-ub-navy",
  plum: "border-transparent bg-ub-tag-plum-solid text-ub-text-on-action",
  amber: "border-transparent bg-ub-tag-amber-solid text-ub-navy",
  red: "border-transparent bg-ub-tag-red-solid text-ub-navy",
  pink: "border-transparent bg-ub-tag-pink-solid text-ub-navy",
  teal: "border-transparent bg-ub-tag-teal-solid text-ub-navy",
  grey: "border-transparent bg-ub-tag-grey-solid text-ub-navy",
};

export const tagHueDot: Record<TagHue, string> = {
  sky: "bg-ub-tag-sky-solid",
  indigo: "bg-ub-tag-indigo-solid",
  orange: "bg-ub-tag-orange-solid",
  plum: "bg-ub-tag-plum-solid",
  amber: "bg-ub-tag-amber-solid",
  red: "bg-ub-tag-red-solid",
  pink: "bg-ub-tag-pink-solid",
  teal: "bg-ub-tag-teal-solid",
  grey: "bg-ub-tag-grey-solid",
};

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Visible label. Required: colour is never the only signal (brief §9). */
  children: ReactNode;
  /** Semantic tone. Ignored when `hue` is set. Defaults to "neutral". */
  tone?: TagTone;
  /** Stage-tag hue (sky, indigo, …). Wins over `tone`. */
  hue?: TagHue;
  /** md 24px (default) · sm 20px. */
  size?: TagSize;
  variant?: TagVariant;
  /** Leading 6px dot. */
  dot?: boolean;
  /** Leading 12px icon, e.g. a lucide icon element. Wins over `dot`. */
  icon?: ReactNode;
}

/** Generic tag (brief §4.3): radius 6, label-sm, never a pill. */
export default function Tag({ children, tone = "neutral", hue, size = "md", variant = "tinted", dot, icon, className, ...rest }: TagProps) {
  const solid = variant === "solid";
  const colors = hue ? (solid ? tagHueSolidTones[hue] : tagHueTones[hue]) : solid ? tagSolidTones[tone] : tagTones[tone];
  const dotColor = solid ? "bg-current" : hue ? tagHueDot[hue] : tagDot[tone];

  return (
    <span className={`${tagBase} ${size === "sm" ? `${tagSm} gap-1` : ""} ${colors} ${className ?? ""}`} {...rest}>
      {icon ? (
        <span aria-hidden="true" className="flex shrink-0 items-center [&>svg]:h-3 [&>svg]:w-3">
          {icon}
        </span>
      ) : (
        dot && <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-ub-full ${dotColor}`} />
      )}
      {children}
    </span>
  );
}
