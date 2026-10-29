// Theme preference: light (default, brief §1.3) or dark. Stored per browser;
// applied to <html data-ub-theme> before first paint by THEME_INIT_SCRIPT.

import { FEATURES } from "config/featureFlags";

export type Theme = "light" | "dark";

/** Behind FEATURES.darkMode (NEXT_PUBLIC_ENABLE_DARK_MODE=true). */
export const DARK_MODE_ENABLED = FEATURES.darkMode;
export const THEME_STORAGE_KEY = "ub-theme";
export const THEME_CHANGE_EVENT = "ub-theme-change";

/** Inline, blocking script for <head>: avoids a light flash for dark users. */
export const THEME_INIT_SCRIPT = DARK_MODE_ENABLED
  ? `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");document.documentElement.setAttribute("data-ub-theme",t==="dark"?"dark":"light")}catch(e){document.documentElement.setAttribute("data-ub-theme","light")}})();`
  : `document.documentElement.setAttribute("data-ub-theme","light");`;

export function readTheme(): Theme {
  if (typeof document === "undefined" || !DARK_MODE_ENABLED) return "light";
  return document.documentElement.getAttribute("data-ub-theme") === "dark" ? "dark" : "light";
}

export function applyTheme(requested: Theme) {
  const theme: Theme = DARK_MODE_ENABLED ? requested : "light";
  document.documentElement.setAttribute("data-ub-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage unavailable (private mode): the choice lasts for this page only.
  }
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
}
