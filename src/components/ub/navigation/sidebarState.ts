"use client";

// Desktop sidebar collapse state (brief §5: 256px expanded / 72px collapsed).
// Stored per browser and applied to <html data-ub-sidebar> before first paint
// by SIDEBAR_INIT_SCRIPT (sidebarScript.ts), so a collapsed sidebar doesn't flash open on load.
// The widths and the collapsed styles live in src/styles/tokens/shell.css.

import { useCallback, useEffect, useState } from "react";

import { SIDEBAR_STORAGE_KEY } from "./sidebarScript";

export { SIDEBAR_INIT_SCRIPT, SIDEBAR_STORAGE_KEY } from "./sidebarScript";

const CHANGE_EVENT = "ub-sidebar-change";

export function readSidebarCollapsed(): boolean {
  return typeof document !== "undefined" && document.documentElement.getAttribute("data-ub-sidebar") === "collapsed";
}

export function setSidebarCollapsed(collapsed: boolean) {
  if (collapsed) document.documentElement.setAttribute("data-ub-sidebar", "collapsed");
  else document.documentElement.removeAttribute("data-ub-sidebar");
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? "collapsed" : "expanded");
  } catch {
    // Storage unavailable: the choice lasts for this page only.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: collapsed }));
}

/** Collapse state shared by every mounted consumer (sidebar, links, shell). */
export function useSidebarCollapsed() {
  // false on the server and first client render; synced after mount (no hydration mismatch).
  const [collapsed, setCollapsedState] = useState(false);

  useEffect(() => {
    setCollapsedState(readSidebarCollapsed());
    const onChange = (e: Event) => setCollapsedState((e as CustomEvent<boolean>).detail);
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);

  const toggle = useCallback(() => setSidebarCollapsed(!readSidebarCollapsed()), []);
  const set = useCallback((value: boolean) => setSidebarCollapsed(value), []);
  return { collapsed, toggle, setCollapsed: set };
}
