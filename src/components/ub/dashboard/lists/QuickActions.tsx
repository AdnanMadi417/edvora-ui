import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { focusRing } from "components/ub/recipes";

export interface QuickAction {
  icon?: LucideIcon;
  /** Verb + object, e.g. "Explore programs". */
  label: string;
  href: string;
  /** Optional short line; home pages leave it out (no sentences in rows). */
  description?: string;
}

/**
 * Common next steps as a list of rows (icon, label, arrow on the end), sized
 * for a side column and 44px tall for touch. Not the page's primary action.
 */
export default function QuickActions({
  actions,
  className = "",
}: {
  actions: QuickAction[];
  className?: string;
}) {
  return (
    <nav aria-label="Quick actions" className={className}>
      <ul className="divide-y divide-ub-border">
        {actions.map(({ icon: Icon, ...action }) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className={`group flex min-h-11 min-w-0 items-center gap-3 rounded-ub-md py-2.5 text-ub-text-primary hover:text-ub-text-link ${focusRing}`}
            >
              {Icon && (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-ub-md bg-ub-tone-brand-bg text-ub-tone-brand-text">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-ub-label-md">{action.label}</span>
                {action.description && <span className="block truncate text-ub-caption text-ub-text-tertiary">{action.description}</span>}
              </span>
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-ub-icon rtl:-scale-x-100" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
