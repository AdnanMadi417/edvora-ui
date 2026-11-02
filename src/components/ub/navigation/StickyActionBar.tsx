import type { ReactNode } from "react";
import clsx from "clsx";

export interface StickyActionBarProps {
  /** The view's one Primary action (give it flex-1), optionally with a secondary IconButton. */
  children: ReactNode;
  /** Sit above the 64px NavbarBottom (app pages). Default true; false for full-screen flows. */
  aboveBottomNav?: boolean;
  /** Accessible name for the region. */
  "aria-label"?: string;
  className?: string;
}

/**
 * Mobile-only bottom bar (< 768px) that keeps the Primary action in reach on
 * long detail pages. Hidden from md up, where the header shows the action.
 * Give the page bottom padding (pb-20) so the bar never covers content.
 */
export default function StickyActionBar({ children, aboveBottomNav = true, "aria-label": ariaLabel = "Page actions", className }: StickyActionBarProps) {
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={clsx(
        "fixed inset-x-0 z-30 flex items-center gap-3 border-t border-ub-border bg-ub-surface px-4 py-3 shadow-ub-sm md:hidden",
        aboveBottomNav ? "bottom-16" : "bottom-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
