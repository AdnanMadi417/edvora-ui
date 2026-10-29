"use client";

import { Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { focusRing, iconButtonSizes } from "components/ub/recipes";
import { useTheme } from "./useTheme";
import { DARK_MODE_ENABLED } from "./theme";

/** Circular icon button that switches between light and dark. Renders nothing while dark mode is disabled. */
export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  if (!DARK_MODE_ENABLED) return null;
  const dark = theme === "dark";
  const label = dark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
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
