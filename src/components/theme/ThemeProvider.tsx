"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { DARK_MODE_ENABLED, THEME_STORAGE_KEY, THEMES, isForcedLightRoute } from "config/theme";

/**
 * App-wide theme (dark guide §1): follows the device by default, remembers the
 * person's Light / Dark / System choice, and applies it to <html data-ub-theme>
 * before first paint (next-themes injects a blocking script). Forced-light
 * routes (Glass Box) and the dark-mode kill switch pin the theme to light.
 */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const forcedTheme = !DARK_MODE_ENABLED || isForcedLightRoute(pathname) ? "light" : undefined;

  return (
    <NextThemesProvider
      attribute="data-ub-theme"
      themes={[...THEMES]}
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey={THEME_STORAGE_KEY}
      forcedTheme={forcedTheme}
    >
      {children}
    </NextThemesProvider>
  );
}
