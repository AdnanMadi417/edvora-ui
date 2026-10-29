import type { CSSProperties } from "react";
import clsx from "clsx";
import { tagBase, tagTones } from "components/ub/recipes";

// Verified Badge (brief §4.7): a Light Blue check on a Primary Blue
// (blue-600) rounded square with the small notch. Only for verified entities
// (Advisors, Institutions, providers), never decorative.

/**
 * Badge name is pending (brief §11.4: "Unibexs Verified Badge" in the guide vs
 * "Trust Badge" on the website). Keep the visible text here / in the copy
 * dictionary so the answer is a one-line change.
 */
export const VERIFIED_BADGE_LABEL = "Verified Advisor";

/** 16 inline · "label" tag with text · 64–96 credential. */
export type VerifiedBadgeSize = 16 | "label" | 64 | 72 | 80 | 96;

export interface VerifiedBadgeProps {
  /** Default 16 (inline, next to a name). */
  size?: VerifiedBadgeSize;
  /** Visible text for the label size and accessible name for the others. Default VERIFIED_BADGE_LABEL. */
  label?: string;
  className?: string;
}

/** The notched blue square with the check; aria-hidden, the caller names it. */
function Mark({ px }: { px: number }) {
  // notch-sm (12) on credential sizes; scaled down to a quarter of the badge
  // when inline, where a 12px cut would swallow a 16px square.
  const notch = px >= 48 ? 12 : Math.max(3, Math.round(px / 4));
  const style = { width: px, height: px, "--ub-notch": `${notch}px` } as CSSProperties;
  return (
    <span aria-hidden="true" className={clsx("ub-notch-sm inline-grid shrink-0 place-items-center bg-ub-blue-600 text-ub-light-blue", px >= 48 ? "rounded-ub-lg" : "rounded-ub-xs")} style={style}>
      <svg viewBox="0 0 24 24" width={Math.round(px * 0.62)} height={Math.round(px * 0.62)} fill="none" stroke="currentColor" strokeWidth={px >= 48 ? 2.25 : 3.25} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

/** Verified Badge in inline (16), label-tag or credential (64–96) sizes. */
export default function VerifiedBadge({ size = 16, label = VERIFIED_BADGE_LABEL, className }: VerifiedBadgeProps) {
  if (size === "label") {
    return (
      <span className={clsx(tagBase, tagTones.brand, "ps-1", className)}>
        <Mark px={16} />
        {label}
      </span>
    );
  }
  return (
    <span role="img" aria-label={label} title={label} className={clsx("inline-flex shrink-0 align-middle", className)}>
      <Mark px={size} />
    </span>
  );
}
