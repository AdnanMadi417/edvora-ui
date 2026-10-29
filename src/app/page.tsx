import Link from "next/link";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import ThemeToggle from "components/theme/ThemeToggle";
import { card, cardInteractive, focusRing } from "components/ub/recipes";

// UI-only mode: no sign-in. Each area runs as a mock user of its role
// (config/mockSession.ts).
const AREAS = [
  { href: "/admin/applications", label: "Admin" },
  { href: "/partner/applications", label: "Advisor" },
  { href: "/account-manager/applications", label: "Account manager" },
  { href: "/reviewer/advisors", label: "Reviewer" },
  { href: "/data-entry/knowledge-hub", label: "Data entry" },
];

export default function Home() {
  return (
    <main className="ub-canvas-light relative flex min-h-screen items-center justify-center px-4 py-16 text-ub-text-primary">
      <ThemeToggle className="absolute end-4 top-4 md:end-6 md:top-6" />
      <div className="ub-glass-light-strong w-full max-w-sm rounded-ub-xl p-6 md:p-8">
        <h1 className="text-ub-heading-lg text-ub-text-primary">Choose an area</h1>
        <p className="mt-1 text-ub-body-sm text-ub-text-secondary">UI preview. No sign-in required.</p>
        <ul className="mt-6 grid gap-2">
          {AREAS.map((area) => (
            <li key={area.href}>
              <Link
                href={area.href}
                className={clsx(
                  card,
                  cardInteractive,
                  focusRing,
                  "group flex h-12 items-center justify-between gap-3 px-4 text-ub-label-md text-ub-text-primary hover:text-ub-text-link",
                )}
              >
                {area.label}
                <ChevronRight aria-hidden className="h-5 w-5 text-ub-icon transition-colors group-hover:text-ub-icon-interactive rtl:-scale-x-100" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
