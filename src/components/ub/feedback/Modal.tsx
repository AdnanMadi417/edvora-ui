"use client";

import React, { ReactNode, RefObject, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import clsx from "clsx";
import { buttonBase, buttonSizes, buttonVariants, iconButtonSizes, modalPanel, scrim } from "components/ub/recipes";

// ── Shared overlay behaviour (Modal, Drawer, ActionSheet) ───────────────────
// Portal to <body>, scroll lock, focus trap, Esc closes the topmost overlay,
// focus returns to the opener, and a 320ms enter/exit (brief §2.8, §4.7, §9).

/** duration-ub-slow; overlays stay mounted this long after closing so the exit can play. */
export const OVERLAY_EXIT_MS = 320;

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

// Only the most recently opened overlay reacts to Esc / Tab.
const overlayStack: symbol[] = [];
let scrollLocks = 0;
let savedOverflow = "";

function lockScroll() {
  if (scrollLocks++ === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
}
function unlockScroll() {
  if (--scrollLocks <= 0) {
    scrollLocks = 0;
    document.body.style.overflow = savedOverflow;
  }
}

function focusables(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.hasAttribute("aria-hidden"));
}

export interface UseOverlayOptions {
  open: boolean;
  onClose: () => void;
  panelRef: RefObject<HTMLElement | null>;
  /** Element to focus on open. Defaults to the first focusable element in the panel, then the panel itself. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Esc closes the overlay (default true). */
  closeOnEsc?: boolean;
}

/**
 * Lifecycle for a modal overlay. Returns `present` (render it) and `visible`
 * (apply the entered state) so CSS transitions can run on enter and exit.
 */
export function useOverlay({ open, onClose, panelRef, initialFocusRef, closeOnEsc = true }: UseOverlayOptions) {
  // Starts false on the server and first client render; the effect below opens it.
  const [present, setPresent] = useState(false);
  const [visible, setVisible] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Mount / unmount around the transition.
  useEffect(() => {
    if (open) {
      openerRef.current = (document.activeElement as HTMLElement) ?? null;
      setPresent(true);
      // Next frame, so the "from" state paints before the transition starts.
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const t = window.setTimeout(() => setPresent(false), OVERLAY_EXIT_MS);
    // Focus goes back to whatever opened the overlay as soon as it starts closing.
    const opener = openerRef.current;
    if (opener && document.contains(opener)) opener.focus();
    openerRef.current = null;
    return () => window.clearTimeout(t);
  }, [open]);

  // While open: scroll lock, initial focus, Esc and the focus trap.
  useEffect(() => {
    if (!open || !present) return;
    const id = Symbol("overlay");
    overlayStack.push(id);
    lockScroll();

    const panel = panelRef.current;
    if (panel && !panel.contains(document.activeElement)) {
      const target = initialFocusRef?.current ?? focusables(panel)[0] ?? panel;
      target.focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (overlayStack[overlayStack.length - 1] !== id) return;
      if (e.key === "Escape" && closeOnEsc) {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = focusables(panelRef.current);
      if (items.length === 0) {
        e.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = panelRef.current.contains(active);
      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const i = overlayStack.indexOf(id);
      if (i >= 0) overlayStack.splice(i, 1);
      unlockScroll();
    };
  }, [open, present, closeOnEsc, panelRef, initialFocusRef]);

  return { present, visible };
}

/**
 * Renders children into document.body. Only render it once `present` from
 * useOverlay is true (client only), so the panel is in the DOM when focus moves.
 */
export function OverlayPortal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

/** Full-viewport scrim, rgba(0,12,41,.56) (brief §4.7). Click closes when `onClick` is passed. */
export function OverlayScrim({ visible, onClick }: { visible: boolean; onClick?: () => void }) {
  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      className={clsx(
        "fixed inset-0",
        scrim,
        "transition-opacity duration-ub-slow ease-ub-standard motion-reduce:duration-ub-fast",
        visible ? "opacity-100" : "opacity-0",
      )}
    />
  );
}

/** Circular close button used in overlay headers. */
export function OverlayCloseButton({ onClick, label = "Close" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={clsx(buttonBase, iconButtonSizes.md, buttonVariants.tertiary, "shrink-0 p-0 text-ub-icon")}
    >
      <X className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

// ── Modal (PopUp) ───────────────────────────────────────────────────────────

export type ModalSize = "sm" | "md" | "lg";

/** sm 400 · md 560 · lg 720 (brief §4.7). */
const MODAL_WIDTHS: Record<ModalSize, string> = {
  sm: "max-w-[400px]",
  md: "max-w-[560px]",
  lg: "max-w-[720px]",
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Footer actions. Put the Primary action LAST in reading order (brief §4.1). */
  footer?: ReactNode;
  size?: ModalSize;
  /** Show the circular close button in the header (default true). */
  showCloseButton?: boolean;
  closeLabel?: string;
  /** Clicking the scrim closes the dialog (default true). */
  closeOnScrimClick?: boolean;
  closeOnEsc?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** "alertdialog" for confirmations that interrupt the flow. */
  role?: "dialog" | "alertdialog";
  className?: string;
}

/**
 * Modal / PopUp (brief §4.7): 400/560/720 wide, radius 16, navy scrim,
 * focus trapped, Esc closes, focus returns to the opener, background scroll
 * locked. Portalled to <body>.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  showCloseButton = true,
  closeLabel = "Close dialog",
  closeOnScrimClick = true,
  closeOnEsc = true,
  initialFocusRef,
  role = "dialog",
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const { present, visible } = useOverlay({ open, onClose, panelRef, initialFocusRef, closeOnEsc });

  if (!present) return null;

  return (
    <OverlayPortal>
      <div className="fixed inset-0 z-[1000]">
        <OverlayScrim visible={visible} onClick={closeOnScrimClick ? onClose : undefined} />
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
          <div
            ref={panelRef}
            role={role}
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            className={clsx(
              modalPanel,
              MODAL_WIDTHS[size],
              "pointer-events-auto relative flex max-h-full w-full flex-col outline-none",
              "transition-[opacity,transform] duration-ub-slow motion-reduce:transform-none motion-reduce:duration-ub-fast",
              visible ? "translate-y-0 scale-100 opacity-100 ease-ub-enter" : "translate-y-2 scale-[0.98] opacity-0 ease-ub-exit",
              className,
            )}
          >
            <div className="flex items-start gap-4 px-6 pb-2 pt-6">
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="text-ub-heading-md text-ub-text-primary">
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="mt-1 text-ub-body-md text-ub-text-secondary">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <div className="-me-2 -mt-2">
                  <OverlayCloseButton onClick={onClose} label={closeLabel} />
                </div>
              )}
            </div>
            {children && <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 text-ub-body-md text-ub-text-primary">{children}</div>}
            {footer && <div className="flex flex-wrap items-center justify-end gap-3 px-6 pb-6 pt-2">{footer}</div>}
          </div>
        </div>
      </div>
    </OverlayPortal>
  );
}

// ── ConfirmDialog ───────────────────────────────────────────────────────────

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** A question naming the action, e.g. "Withdraw this application?" */
  title: ReactNode;
  /** Names the consequence (brief §8), e.g. "The Institution will be notified, and this can't be undone." */
  consequence?: ReactNode;
  /** Verb + object, e.g. "Withdraw application". */
  confirmLabel: string;
  cancelLabel?: string;
  /** "danger" uses the filled destructive button (allowed only inside confirmation dialogs). */
  tone?: "default" | "danger";
  /** Disables both buttons and shows the confirm action as busy. */
  loading?: boolean;
  size?: ModalSize;
}

/**
 * Confirmation dialog: Cancel first, confirm last in reading order. Focus
 * starts on Cancel so Enter never triggers a destructive action by accident.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  consequence,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "default",
  loading = false,
  size = "sm",
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={consequence}
      size={size}
      role="alertdialog"
      showCloseButton={false}
      closeOnScrimClick={!loading}
      initialFocusRef={cancelRef}
      footer={
        <>
          <button ref={cancelRef} type="button" onClick={onClose} disabled={loading} className={clsx(buttonBase, buttonSizes.md, buttonVariants.secondary)}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading || undefined}
            className={clsx(buttonBase, buttonSizes.md, buttonVariants[tone === "danger" ? "destructive" : "primary"])}
          >
            {confirmLabel}
          </button>
        </>
      }
    />
  );
}
