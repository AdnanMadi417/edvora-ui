import React, { type HTMLAttributes, type ReactNode } from "react";
import { tagBase, tagDot, tagSm, tagSolidTones, tagTones, type TagTone } from "components/ub/recipes";

/** Stage-tag hues (brief §4.3), backed by the --ub-tag-<hue>-* tokens. */
export type TagHue = "sky" | "indigo" | "orange" | "plum" | "amber" | "red" | "pink" | "teal" | "grey";
export type TagSize = "md" | "sm";
export type TagVariant = "tinted" | "solid";

// Hue tags: light uses the tag tokens directly; dark swaps to the *-dark
// tokens and a 35% text-tinted border (same recipe as the dark tone tokens).
// Written out in full so Tailwind's JIT sees every class.
export const tagHueTones: Record<TagHue, string> = {
  sky: "border-ub-tag-sky-border bg-ub-tag-sky-bg text-ub-tag-sky-text dark:border-[color:color-mix(in_srgb,var(--ub-tag-sky-text-dark)_35%,transparent)] dark:bg-ub-tag-sky-bg-dark dark:text-ub-tag-sky-text-dark",
  indigo:
    "border-ub-tag-indigo-border bg-ub-tag-indigo-bg text-ub-tag-indigo-text dark:border-[color:color-mix(in_srgb,var(--ub-tag-indigo-text-dark)_35%,transparent)] dark:bg-ub-tag-indigo-bg-dark dark:text-ub-tag-indigo-text-dark",
  orange:
    "border-ub-tag-orange-border bg-ub-tag-orange-bg text-ub-tag-orange-text dark:border-[color:color-mix(in_srgb,var(--ub-tag-orange-text-dark)_35%,transparent)] dark:bg-ub-tag-orange-bg-dark dark:text-ub-tag-orange-text-dark",
  plum: "border-ub-tag-plum-border bg-ub-tag-plum-bg text-ub-tag-plum-text dark:border-[color:color-mix(in_srgb,var(--ub-tag-plum-text-dark)_35%,transparent)] dark:bg-ub-tag-plum-bg-dark dark:text-ub-tag-plum-text-dark",
  amber:
    "border-ub-tag-amber-border bg-ub-tag-amber-bg text-ub-tag-amber-text dark:border-[color:color-mix(in_srgb,var(--ub-tag-amber-text-dark)_35%,transparent)] dark:bg-ub-tag-amber-bg-dark dark:text-ub-tag-amber-text-dark",
  red: "border-ub-tag-red-border bg-ub-tag-red-bg text-ub-tag-red-text dark:border-[color:color-mix(in_srgb,var(--ub-tag-red-text-dark)_35%,transparent)] dark:bg-ub-tag-red-bg-dark dark:text-ub-tag-red-text-dark",
  pink: "border-ub-tag-pink-border bg-ub-tag-pink-bg text-ub-tag-pink-text dark:border-[color:color-mix(in_srgb,var(--ub-tag-pink-text-dark)_35%,transparent)] dark:bg-ub-tag-pink-bg-dark dark:text-ub-tag-pink-text-dark",
  teal: "border-ub-tag-teal-border bg-ub-tag-teal-bg text-ub-tag-teal-text dark:border-[color:color-mix(in_srgb,var(--ub-tag-teal-text-dark)_35%,transparent)] dark:bg-ub-tag-teal-bg-dark dark:text-ub-tag-teal-text-dark",
  grey: "border-ub-tag-grey-border bg-ub-tag-grey-bg text-ub-tag-grey-text dark:border-[color:color-mix(in_srgb,var(--ub-tag-grey-text-dark)_35%,transparent)] dark:bg-ub-tag-grey-bg-dark dark:text-ub-tag-grey-text-dark",
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
