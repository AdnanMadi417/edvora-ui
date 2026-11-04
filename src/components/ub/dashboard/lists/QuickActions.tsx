import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { focusRing } from "components/ub/recipes";

export interface QuickAction {
  label: string;
  href: string;
  description: string;
}
/** Keyboard accessible destinations for common role tasks. */
export default function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <nav aria-label="Quick actions" className="grid gap-3 sm:grid-cols-2">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={`flex min-w-0 items-center justify-between gap-3 rounded-ub-md border border-ub-border p-4 transition-colors hover:bg-ub-action-secondary-hover ${focusRing}`}
        >
          <span className="min-w-0">
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
