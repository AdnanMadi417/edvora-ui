import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { card, cardInteractive, focusRing } from "components/ub/recipes";

export interface QuickAction {
  icon?: LucideIcon;
  label: string;
  href: string;
  description: string;
}
/** Keyboard accessible destinations for common role tasks. */
export default function QuickActions({
  actions,
  className = "",
}: {
  actions: QuickAction[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Quick actions"
      className={`grid gap-3 sm:grid-cols-2 ${className}`}
    >
      {actions.map(({ icon: Icon, ...action }) => (
        <Link
          key={action.href}
          href={action.href}
          className={`${card} ${cardInteractive} ${focusRing} flex min-w-0 items-center gap-3 p-4`}
        >
          {Icon && (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-ub-md bg-ub-tone-brand-bg text-ub-tone-brand-text">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block text-ub-label-md text-ub-text-primary">
              {action.label}
            </span>
            <span className="mt-1 block text-ub-body-sm text-ub-text-secondary">
              {action.description}
            </span>
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-ub-text-link"
          />
        </Link>
      ))}
    </nav>
  );
}
