"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { DARK_MODE_ENABLED, type ThemePreference } from "config/theme";
import { focusRingInset } from "components/ub/recipes";

const OPTIONS: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export interface ThemeSwitcherProps {
  /**
   * "segmented": a standalone radio group (arrow keys move and select).
   * "menu": menuitemradio items for use inside a role="menu" (the avatar menu),
   * which handles arrow keys itself.
   */
  variant?: "segmented" | "menu";
  className?: string;
}

/** Light / Dark / System switch. Hidden while dark mode is turned off or on a forced-light route. */
export default function ThemeSwitcher({ variant = "segmented", className }: ThemeSwitcherProps) {
  const { theme, setTheme, forcedTheme } = useTheme();
  // The stored choice is only known after mount; render "none selected" until then (no hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  if (!DARK_MODE_ENABLED || forcedTheme) return null;
  const current = mounted ? ((theme as ThemePreference) ?? "system") : null;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (variant !== "segmented") return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step = { ArrowRight: rtl ? -1 : 1, ArrowDown: 1, ArrowLeft: rtl ? 1 : -1, ArrowUp: -1 }[e.key as "ArrowRight"];
    const index = OPTIONS.findIndex((o) => o.value === current);
    let next: number | null = step ? (Math.max(index, 0) + step + OPTIONS.length) % OPTIONS.length : null;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = OPTIONS.length - 1;
    if (next === null) return;
    e.preventDefault();
    setTheme(OPTIONS[next].value);
    refs.current[next]?.focus();
  };

  const isMenu = variant === "menu";
  return (
    <div
      role={isMenu ? "group" : "radiogroup"}
      aria-label="Theme"
      onKeyDown={onKeyDown}
      className={clsx("grid grid-cols-3 gap-1 rounded-ub-full border border-ub-border bg-ub-surface-subtle p-1", className)}
    >
      {OPTIONS.map(({ value, label, icon: Icon }, i) => {
        const selected = current === value;
        return (
          <button
            key={value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role={isMenu ? "menuitemradio" : "radio"}
            aria-checked={selected}
            // Roving tab stop for the standalone group; the menu manages focus itself.
            tabIndex={isMenu ? -1 : selected || (current === null && i === 2) ? 0 : -1}
            onClick={() => setTheme(value)}
            className={clsx(
              "inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-ub-full px-2 text-ub-label-sm transition-colors duration-ub-fast ease-ub-standard",
              focusRingInset,
              selected ? "bg-ub-action-primary text-ub-action-primary-text" : "text-ub-text-secondary hover:bg-ub-action-ghost-hover hover:text-ub-text-primary",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
