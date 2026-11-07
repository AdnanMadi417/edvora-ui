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

export interface NavbarBottomAction {
  label: string;
  icon: NavbarBottomItem["icon"];
  onClick: () => void;
  /** For a menu/drawer toggle: whether what it controls is open. */
  expanded?: boolean;
  /** id of the element it controls (aria-controls). */
  controls?: string;
}

export interface NavbarBottomProps {
  /** 4–5 items (brief §5). */
  items: NavbarBottomItem[];
  /** Optional trailing button, e.g. "Menu" that opens the full navigation drawer. */
  action?: NavbarBottomAction;
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
 * Mobile bottom nav (brief §5): 64px plus the safe-area inset, inset rounded surface,
 * 4–5 items with an optional count badge, aria-current on the active item.
 * Hidden from md up, where the sidebar takes over.
 */
export default function NavbarBottom({ items, action, activeHref, fixed = true, "aria-label": ariaLabel = "Main", className }: NavbarBottomProps) {
  const pathname = usePathname();
  const active = findActiveHref(items, activeHref ?? pathname);
  const actionActive = Boolean(action && (action.expanded || !active));

  return (
    <nav
      aria-label={ariaLabel}
      className={clsx(
        "z-40 border-t border-ub-border bg-ub-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgba(0,12,41,0.03)]",
        fixed ? "fixed inset-x-0 bottom-0 md:hidden" : "relative",
        className,
      )}
    >
      <ul className="grid h-16 px-2" style={{ gridTemplateColumns: `repeat(${Math.max(items.length + (action ? 1 : 0), 1)}, minmax(0, 1fr))` }}>
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
                  "relative flex h-full min-w-0 flex-col items-center justify-center gap-1 px-0.5 transition-colors duration-200 motion-reduce:transition-none",
                  focusRingInset,
                  isActive ? "text-ub-text-link" : "text-ub-text-secondary hover:bg-ub-surface-subtle hover:text-ub-text-primary",
                )}
              >
                {isActive && <span aria-hidden="true" className="absolute top-0 h-[3px] w-7 rounded-b-ub-full bg-ub-action-primary" />}
                <span
                  className={clsx(
                    "relative grid h-7 w-10 place-items-center rounded-ub-md transition-colors duration-200 motion-reduce:transition-none",
                    isActive && "text-ub-text-link",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {count > 0 && (
                    <span
                      aria-hidden="true"
                      className="ub-tabular absolute -top-0.5 -end-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-ub-full bg-ub-danger-600 px-1 text-ub-label-sm text-ub-text-on-action ring-2 ring-ub-surface"
                    >
                      {formatCount(count)}
                    </span>
                  )}
                </span>
                <span className={clsx("max-w-full truncate text-[11px] leading-4", isActive && "font-semibold")}>{item.label}</span>
                {count > 0 && <span className="sr-only">, {item.badgeLabel ? item.badgeLabel(count) : `${count} need action`}</span>}
              </Link>
            </li>
          );
        })}
        {action && (
          <li className="min-w-0">
            <button
              type="button"
              onClick={action.onClick}
              aria-expanded={action.expanded}
              aria-controls={action.controls}
              className={clsx(
                "relative flex h-full w-full min-w-0 flex-col items-center justify-center gap-1 px-0.5 transition-colors duration-200 motion-reduce:transition-none",
                focusRingInset,
                actionActive ? "text-ub-text-link" : "text-ub-text-secondary hover:bg-ub-surface-subtle hover:text-ub-text-primary",
              )}
            >
              {actionActive && <span aria-hidden="true" className="absolute top-0 h-[3px] w-7 rounded-b-ub-full bg-ub-action-primary" />}
              <span className="grid h-7 w-10 place-items-center">
                <action.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="max-w-full truncate text-[11px] leading-4">{action.label}</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
