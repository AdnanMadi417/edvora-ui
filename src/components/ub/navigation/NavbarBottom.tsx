"use client";

import React, { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { focusRingInset } from "components/ub/recipes";

export interface NavbarBottomItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  /** Count shown on the icon, e.g. applications needing action. 0 hides it. */
  badgeCount?: number;
  /** Screen-reader text for the badge; defaults to "{n} need action". */
  badgeLabel?: (count: number) => string;
}

export interface NavbarBottomProps {
  /** 4–5 items (brief §5). */
  items: NavbarBottomItem[];
  /** Overrides the pathname used to pick the active item. */
  activeHref?: string;
  /** Fixed to the viewport bottom and hidden from md up (default). false renders it in flow, for previews. */
  fixed?: boolean;
  "aria-label"?: string;
  className?: string;
}

/** Longest href that equals the path or is a parent segment of it. */
export function findActiveHref(items: { href: string }[], path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  return items
    .filter((it) => path === it.href || path.startsWith(it.href.endsWith("/") ? it.href : `${it.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

const formatCount = (n: number) => (n > 99 ? "99+" : String(n));

/**
 * Mobile bottom nav (brief §5): 64px plus the safe-area inset, light glass,
 * 4–5 items with an optional count badge, aria-current on the active item.
 * Hidden from md up, where the sidebar takes over.
 */
export default function NavbarBottom({ items, activeHref, fixed = true, "aria-label": ariaLabel = "Main", className }: NavbarBottomProps) {
  const pathname = usePathname();
  const active = findActiveHref(items, activeHref ?? pathname);

  return (
    <nav
      aria-label={ariaLabel}
      className={clsx(
        "ub-glass-light-strong z-40 border-t border-ub-border pb-[env(safe-area-inset-bottom)]",
        fixed ? "fixed inset-x-0 bottom-0 md:hidden" : "relative",
        className,
      )}
    >
      <ul className="grid h-16" style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === active;
          const count = item.badgeCount ?? 0;
          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "flex h-full flex-col items-center justify-center gap-1 rounded-ub-md px-1 transition-colors duration-ub-fast ease-ub-standard",
                  focusRingInset,
                  isActive ? "text-ub-text-link" : "text-ub-text-secondary hover:text-ub-text-primary",
                )}
              >
                <span
                  className={clsx(
                    "relative grid h-8 w-14 place-items-center rounded-ub-full transition-colors duration-ub-fast ease-ub-standard",
                    isActive && "bg-ub-selected",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {count > 0 && (
                    <span
                      aria-hidden="true"
                      className="ub-tabular absolute -top-1 end-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-ub-full bg-ub-danger-600 px-1 text-ub-label-sm text-ub-text-on-action ring-2 ring-ub-surface"
                    >
                      {formatCount(count)}
                    </span>
                  )}
                </span>
                <span className={clsx("max-w-full truncate text-ub-label-sm", isActive && "font-semibold")}>{item.label}</span>
                {count > 0 && <span className="sr-only">, {item.badgeLabel ? item.badgeLabel(count) : `${count} need action`}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
