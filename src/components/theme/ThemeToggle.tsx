"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { DARK_MODE_ENABLED } from "config/theme";
import { focusRing, iconButtonSizes } from "components/ub/recipes";

/** Compact icon button that flips between light and dark (leaves System). Prefer ThemeSwitcher in menus. */
export default function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!DARK_MODE_ENABLED || forcedTheme) return null;

  const dark = mounted && resolvedTheme === "dark";
  const label = dark ? "Switch to light theme" : "Switch to dark theme";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={label}
      title={label}
      aria-pressed={dark}
      className={clsx(
        "inline-grid shrink-0 place-items-center rounded-ub-full border border-ub-border bg-ub-surface text-ub-icon transition-colors duration-ub-fast hover:border-ub-border-hover hover:text-ub-icon-interactive",
        iconButtonSizes.md,
        focusRing,
        className,
      )}
    >
      {dark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
    </button>
  );
}
