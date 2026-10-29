"use client";

import { useCallback, useEffect, useState } from "react";
import { applyTheme, readTheme, THEME_CHANGE_EVENT, type Theme } from "./theme";

/** Current theme plus setters; every mounted hook stays in sync. */
export function useTheme() {
  // Starts as "light" on the server and first client render, then syncs after mount.
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(readTheme());
    const onChange = (e: Event) => setThemeState((e as CustomEvent<Theme>).detail);
    window.addEventListener(THEME_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => applyTheme(next), []);
  const toggleTheme = useCallback(() => applyTheme(readTheme() === "dark" ? "light" : "dark"), []);

  return { theme, setTheme, toggleTheme };
}
