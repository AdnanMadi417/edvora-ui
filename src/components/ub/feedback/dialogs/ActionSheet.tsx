"use client";

import React, { ComponentType, ReactNode, useId, useRef } from "react";
import clsx from "clsx";
import {
  buttonBase,
  buttonSizes,
  buttonVariants,
  focusRingInset,
} from "components/ub/recipes";
import {
  OverlayPortal,
  OverlayScrim,
  useOverlay,
} from "components/ub/feedback/dialogs/Modal";

export interface ActionSheetAction {
  label: string;
  onSelect: (event: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: ComponentType<{
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  /** "danger" for destructive actions (danger text, never a filled button here). */
  tone?: "default" | "danger";
  disabled?: boolean;
}

export interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  actions: ActionSheetAction[];
  /** Short heading, e.g. the student or application the actions apply to. */
  title?: ReactNode;
  description?: ReactNode;
  cancelLabel?: string;
}

// Local constant: 56px full-width row, danger text for destructive tone.
const actionRow = `flex h-14 w-full items-center gap-3 px-4 text-start text-ub-label-lg transition-colors duration-ub-fast ease-ub-standard ${focusRingInset} disabled:cursor-not-allowed disabled:text-ub-text-disabled`;

/**
 * Action sheet: slides up from the bottom on mobile (with the safe-area
 * inset) and renders as a small centered dialog from md up. Same a11y as
 * Modal: focus trap, Esc closes, focus returns to the opener.
 */
export default function ActionSheet({
  open,
  onClose,
  actions,
  title,
  description,
  cancelLabel = "Cancel",
}: ActionSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const { present, visible } = useOverlay({ open, onClose, panelRef });

  if (!present) return null;

  const select = (
    action: ActionSheetAction,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onClose();
    action.onSelect(event);
  };

  return (
    <OverlayPortal>
      <div className="fixed inset-0 z-[1000]">
        <OverlayScrim visible={visible} onClick={onClose} />
        <div className="pointer-events-none fixed inset-0 flex items-end justify-center md:items-center md:p-6">
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : "Actions"}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            className={clsx(
              "pointer-events-auto flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-ub-xl border border-ub-border-overlay bg-ub-modal pb-[env(safe-area-inset-bottom)] shadow-ub-xl outline-none md:max-w-[400px] md:rounded-ub-xl md:pb-0",
              "transition-[opacity,transform] duration-ub-slow motion-reduce:transform-none motion-reduce:duration-ub-fast",
              visible
                ? "translate-y-0 opacity-100 ease-ub-enter"
                : "translate-y-full opacity-0 ease-ub-exit md:translate-y-2"
            )}
          >
            {/* Grabber: visual affordance only. */}
            <div
              aria-hidden="true"
              className="mx-auto mt-2 h-1 w-10 rounded-ub-full bg-ub-border md:hidden"
            />
            {(title || description) && (
              <div className="border-b border-ub-border px-4 pb-3 pt-3 text-center md:pt-5">
                {title && (
                  <h2
                    id={titleId}
                    className="text-ub-heading-sm text-ub-text-primary"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id={descId}
                    className="mt-1 text-ub-body-sm text-ub-text-secondary"
                  >
                    {description}
                  </p>
                )}
              </div>
            )}
            <ul className="min-h-0 overflow-y-auto overscroll-contain divide-y divide-ub-border">
              {actions.map((action) => {
                const Icon = action.icon;
                const danger = action.tone === "danger";
                return (
                  <li key={action.label}>
                    <button
                      type="button"
                      disabled={action.disabled}
                      onClick={(event) => select(action, event)}
                      className={clsx(
                        actionRow,
                        danger
                          ? "text-ub-tone-danger-text hover:bg-ub-tone-danger-bg"
                          : "text-ub-text-primary hover:bg-ub-item-hover"
                      )}
                    >
                      {Icon && (
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      )}
                      <span className="truncate">{action.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-ub-border p-4">
              <button
                type="button"
                onClick={onClose}
                className={clsx(
                  buttonBase,
                  buttonSizes.lg,
                  buttonVariants.secondary,
                  "w-full"
                )}
              >
                {cancelLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </OverlayPortal>
  );
}
