"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { X } from "lucide-react";
import { buttonBase, buttonSizes, buttonVariants, focusRing, iconButtonSizes } from "components/ub/recipes";
import NotchedCard from "./NotchedCard";

// Milestone moment (brief §4.7): a notched card with a stepped spotlight, a
// white heading and an Inverse button, shown once. A full-screen sheet on
// mobile, a centred card from 640px. Esc closes it; focus is trapped while
// open and restored afterwards.

export const MILESTONE_DEFAULT_ACTION = "Share with the Earners Circle";

export interface MilestoneMomentProps {
  /** Controlled visibility. */
  open: boolean;
  /** Called on Esc, the close button, the scrim or after the action. */
  onClose: () => void;
  /** White heading, e.g. "Nur Aisyah is placed at Sunway University". */
  title: ReactNode;
  /** One or two sentences under the heading. */
  description?: ReactNode;
  /** Small line above the heading, e.g. "Milestone". */
  eyebrow?: ReactNode;
  /** Inverse button label. Default "Share with the Earners Circle". */
  actionLabel?: string;
  /** Inverse button handler; the moment closes afterwards. */
  onAction?: () => void;
  /** Navy (default) or Primary Blue card. */
  fill?: "navy" | "brand";
  /** Rendered in the notch cut-out, usually the Unibexs symbol (20px). */
  symbol?: ReactNode;
  /**
   * localStorage key that remembers the moment was dismissed, so it is shown
   * only once per browser even if `open` stays true.
   */
  storageKey?: string;
  /** Accessible name of the close button. Default "Close". */
  closeLabel?: string;
}

function readDismissed(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "dismissed";
  } catch {
    return false;
  }
}
function writeDismissed(key: string) {
  try {
    window.localStorage.setItem(key, "dismissed");
  } catch {
    // Storage unavailable (private mode): the moment may show again next visit.
  }
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Stepped spotlight: hard-stop rings of blue light falling from the top centre.
const SPOTLIGHT = [
  "radial-gradient(ellipse 120% 90% at 50% -10%,",
  "color-mix(in srgb, var(--ub-blue-400) 34%, transparent) 0 24%,",
  "color-mix(in srgb, var(--ub-blue-400) 22%, transparent) 24% 40%,",
  "color-mix(in srgb, var(--ub-blue-400) 13%, transparent) 40% 56%,",
  "color-mix(in srgb, var(--ub-blue-400) 6%, transparent) 56% 72%,",
  "transparent 72%)",
].join(" ");

const REVEAL_MS = 480; // duration-ub-deliberate
const EASE_ENTER = "cubic-bezier(0,0,.2,1)";

/** One-off celebration for a milestone (offer received, student placed…). */
export default function MilestoneMoment({
  open,
  onClose,
  title,
  description,
  eyebrow,
  actionLabel = MILESTONE_DEFAULT_ACTION,
  onAction,
  fill = "navy",
  symbol,
  storageKey,
  closeLabel = "Close",
}: MilestoneMomentProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  // null until storage has been read on the client (avoids a hydration mismatch).
  const [dismissed, setDismissed] = useState<boolean | null>(storageKey ? null : false);

  useEffect(() => {
    setDismissed(storageKey ? readDismissed(storageKey) : false);
  }, [storageKey]);

  const visible = open && dismissed === false;

  const dismiss = useCallback(() => {
    if (storageKey) {
      writeDismissed(storageKey);
      setDismissed(true);
    }
    onClose();
  }, [storageKey, onClose]);

  // Focus in on open, back out on close; lock page scroll meanwhile.
  useEffect(() => {
    if (!visible) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    actionRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (panel && typeof panel.animate === "function" && !reduce) {
      panel.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: REVEAL_MS, easing: EASE_ENTER });
    }
    return () => {
      document.body.style.overflow = overflow;
      restoreRef.current?.focus?.();
    };
  }, [visible]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      dismiss();
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!items.length) return;
    const first = items[0];
    const lastItem = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      lastItem.focus();
    } else if (!e.shiftKey && document.activeElement === lastItem) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!visible || typeof document === "undefined") return null;

  return createPortal(
    // Navy/blue is a dark section: the dark theme gives blue-300 focus rings on it.
    <div data-ub-theme="dark" className="fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-6" onKeyDown={onKeyDown}>
      <div aria-hidden="true" className="absolute inset-0 bg-ub-scrim" onClick={dismiss} />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descId : undefined} className="relative flex w-full sm:max-w-[560px]">
        <NotchedCard
          size="lg"
          fill={fill}
          symbol={symbol}
          sheetOnMobile
          wrapperClassName="flex w-full"
          className="flex w-full flex-col overflow-hidden pt-16 sm:pt-8"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: SPOTLIGHT }} />
          <button type="button" aria-label={closeLabel} onClick={dismiss} className={clsx("absolute end-4 top-4 inline-grid place-items-center rounded-ub-full text-ub-text-on-action transition-colors duration-ub-fast hover:bg-ub-action-secondary-hover", iconButtonSizes.md, focusRing)}>
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
          <div className="relative flex flex-1 flex-col justify-center gap-4 py-10 text-center sm:py-8">
            {eyebrow && <p className="text-ub-label-md text-ub-blue-200">{eyebrow}</p>}
            <h2 id={titleId} className="text-ub-heading-xl-mobile text-ub-text-on-action sm:text-ub-heading-xl">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mx-auto max-w-ub-reading text-ub-body-md text-ub-blue-100">
                {description}
              </p>
            )}
            <div className="mt-4 flex justify-center">
              <button
                ref={actionRef}
                type="button"
                onClick={() => {
                  onAction?.();
                  dismiss();
                }}
                className={clsx(buttonBase, buttonVariants.inverse, buttonSizes.lg)}
              >
                {actionLabel}
              </button>
            </div>
          </div>
        </NotchedCard>
      </div>
    </div>,
    document.body,
  );
}
