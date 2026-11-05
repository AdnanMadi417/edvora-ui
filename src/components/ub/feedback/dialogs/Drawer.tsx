"use client";

import React, { ReactNode, RefObject, useId, useRef } from "react";
import clsx from "clsx";
import { OverlayCloseButton, OverlayPortal, OverlayScrim, useOverlay } from "components/ub/feedback/dialogs/Modal";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Drawer title (heading-sm, brief §2.5). */
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Sticky footer actions. Put the Primary action LAST in reading order. */
  footer?: ReactNode;
  closeLabel?: string;
  /** Clicking the scrim closes the drawer (default true). */
  closeOnScrimClick?: boolean;
  closeOnEsc?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * Drawer (brief §4.7): 480px panel from the END edge (right in LTR, left in
 * RTL), full width below md. Same focus trap / Esc / scrim / portal behaviour
 * as Modal. Header with close button, scrollable body, sticky footer.
 */
export default function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeLabel = "Close panel",
  closeOnScrimClick = true,
  closeOnEsc = true,
  initialFocusRef,
  className,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const { present, visible } = useOverlay({ open, onClose, panelRef, initialFocusRef, closeOnEsc });

  if (!present) return null;

  return (
    <OverlayPortal>
      <div className="fixed inset-0 z-[1000]">
        <OverlayScrim visible={visible} onClick={closeOnScrimClick ? onClose : undefined} />
        {/* justify-end follows dir, so the panel sits on the end edge in both directions. */}
        <div className="pointer-events-none fixed inset-0 flex justify-end">
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            className={clsx(
              "pointer-events-auto flex h-[100dvh] min-w-0 w-full flex-col border-s border-ub-border-overlay bg-ub-modal shadow-ub-lg outline-none md:w-[480px] md:rounded-s-ub-xl",
              "transition-[transform,opacity] duration-ub-slow motion-reduce:transition-opacity motion-reduce:duration-ub-fast",
              visible
                ? "translate-x-0 opacity-100 ease-ub-enter"
                : "ease-ub-exit ltr:translate-x-full rtl:-translate-x-full motion-reduce:translate-x-0 motion-reduce:opacity-0",
              className,
            )}
          >
            <div className="flex shrink-0 items-start gap-4 border-b border-ub-border px-4 py-4 md:px-6">
              <div className="min-w-0 flex-1 pt-1.5">
                <h2 id={titleId} className="text-ub-heading-sm text-ub-text-primary">
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="mt-1 text-ub-body-sm text-ub-text-secondary">
                    {description}
                  </p>
                )}
              </div>
              <OverlayCloseButton onClick={onClose} label={closeLabel} />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 text-ub-body-md text-ub-text-primary md:px-6">{children}</div>
            {footer && (
              <div className="grid shrink-0 grid-cols-1 items-center gap-3 border-t border-ub-border bg-ub-modal px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:flex sm:flex-wrap sm:justify-end md:px-6 [&>button]:min-h-[44px]">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </OverlayPortal>
  );
}
