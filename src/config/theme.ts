import { FEATURES } from "./featureFlags";

/** Theme names written to <html data-ub-theme> by next-themes. */
export const THEMES = ["light", "dark"] as const;
export type ThemeName = (typeof THEMES)[number];
/** What people can pick in the switcher; "system" follows the device. */
export type ThemePreference = ThemeName | "system";

export const THEME_STORAGE_KEY = "ub-theme";
export const DARK_MODE_ENABLED = FEATURES.darkMode;

/**
 * Routes that always render light, whatever the person picked (dark guide §1:
 * the student-facing Glass Box is light-only). Prefix match; add the Glass Box
 * route here when it ships.
 */
export const FORCED_LIGHT_ROUTES: readonly string[] = ["/glass-box"];

export function isForcedLightRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return FORCED_LIGHT_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
