"use client";

import React, { ComponentType, ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import clsx from "clsx";
import { alertTones, focusRing } from "components/ub/recipes";

export type AlertTone = "success" | "danger" | "warning" | "info";

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

const TONE_ICONS: Record<AlertTone, IconComponent> = {
  success: CircleCheck,
  danger: CircleAlert,
  warning: TriangleAlert,
  info: Info,
};

export interface AlertAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  /** One or two sentences: what happened and what to do next. */
  children?: ReactNode;
  /** TextButton-style action under the body, e.g. "Review fees". */
  action?: AlertAction;
  /** Shows a dismiss button when passed. */
  onDismiss?: () => void;
  dismissLabel?: string;
  /** Override the tone's default 20px icon. */
  icon?: IconComponent;
  className?: string;
}

// Local constant: text-button in the alert's own tone colour (keeps 4.5:1 on the tint).
const alertAction = `inline-flex items-center rounded-ub-xs text-ub-label-md font-semibold text-current underline decoration-1 underline-offset-2 hover:decoration-2 ${focusRing}`;

/**
 * Inline alert (brief §4.7): tinted background and border with a 20px tone
 * icon, title, body, optional action and dismiss. Danger alerts use
 * role="alert"; the rest role="status" (polite).
 */
export default function Alert({ tone = "info", title, children, action, onDismiss, dismissLabel = "Dismiss", icon, className }: AlertProps) {
  const Icon = icon ?? TONE_ICONS[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={clsx("flex items-start gap-3 rounded-ub-lg border p-4", alertTones[tone], className)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="text-ub-label-md font-semibold">{title}</p>}
        {children && <div className={clsx("text-ub-body-sm", title && "mt-0.5")}>{children}</div>}
        {action &&
          (action.href ? (
            <a href={action.href} className={clsx(alertAction, "mt-2")}>
              {action.label}
            </a>
          ) : (
            <button type="button" onClick={action.onClick} className={clsx(alertAction, "mt-2")}>
              {action.label}
            </button>
          ))}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className={clsx(
            "-me-1.5 -mt-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-ub-full text-current transition-colors duration-ub-fast ease-ub-standard hover:bg-ub-surface",
            focusRing,
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
