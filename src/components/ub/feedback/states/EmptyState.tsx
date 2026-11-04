import React, { ComponentType, ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { buttonBase, buttonSizes, buttonVariants, emptyBody, emptyIconCircle, emptyTitle } from "components/ub/recipes";

export interface EmptyStateAction {
  /** Verb + object, e.g. "Add student". */
  label: string;
  onClick?: () => void;
  /** Renders a link instead of a button. */
  href?: string;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

export interface EmptyStateProps {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  title: ReactNode;
  /** One sentence that invites action (brief §8). */
  description?: ReactNode;
  /** The one Primary action. Pass a ReactNode for anything custom. */
  action?: EmptyStateAction | ReactNode;
  /** compact: tighter padding, 48px circle, heading-sm. */
  size?: "default" | "compact";
  /** Heading level for the title (default h3). */
  as?: "h2" | "h3" | "h4";
  className?: string;
}

// Compact variants of the recipes, swapped rather than layered so only one size class applies.
const compactCircle = emptyIconCircle.replace("h-16 w-16", "h-12 w-12");
const compactTitle = emptyTitle.replace("text-ub-heading-md", "text-ub-heading-sm");
const compactBody = emptyBody.replace("text-ub-body-md", "text-ub-body-sm");

const isActionObject = (a: unknown): a is EmptyStateAction => !!a && typeof a === "object" && "label" in (a as object) && !React.isValidElement(a);

/**
 * Canonical empty state (brief §4.7): 32px icon in a 64px brand-tint circle,
 * heading-md title, one sentence and one Primary action.
 * (EmptyData keeps the legacy API; use this for new screens.)
 */
export default function EmptyState({ icon: Icon, title, description, action, size = "default", as: Heading = "h3", className }: EmptyStateProps) {
  const compact = size === "compact";
  let actionNode: ReactNode = null;
  if (isActionObject(action)) {
    const ActionIcon = action.icon;
    const cls = clsx(buttonBase, buttonSizes.md, buttonVariants.primary);
    const content = (
      <>
        {ActionIcon && <ActionIcon className="h-5 w-5 shrink-0" aria-hidden="true" />}
        {action.label}
      </>
    );
    actionNode = action.href ? (
      <Link href={action.href} className={cls}>
        {content}
      </Link>
    ) : (
      <button type="button" onClick={action.onClick} className={cls}>
        {content}
      </button>
    );
  } else if (action) {
    actionNode = action as ReactNode;
  }

  return (
    <div className={clsx("flex flex-col items-center text-center", compact ? "gap-3 px-4 py-6" : "gap-4 px-4 py-12 md:px-6", className)}>
      <div className={compact ? compactCircle : emptyIconCircle}>
        <Icon className={compact ? "h-6 w-6" : "h-8 w-8"} aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <Heading className={compact ? compactTitle : emptyTitle}>{title}</Heading>
        {description && <p className={clsx(compact ? compactBody : emptyBody, "mx-auto")}>{description}</p>}
      </div>
      {actionNode && <div className="mt-2">{actionNode}</div>}
    </div>
  );
}
