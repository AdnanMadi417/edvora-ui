"use client";

import { createContext, useContext, useEffect } from "react";

export const APP_NAME = "Unibexs";

/** "Amina Hossain · Applications · Unibexs": most specific first, empty parts dropped. */
export function formatPageTitle(...parts: (string | null | undefined)[]): string {
  return [...parts, APP_NAME].filter((p) => p && p.trim()).join(" · ");
}

export const PageTitleContext = createContext<((title: string | null) => void) | null>(null);

/**
 * Names the record a page shows (a student, an Advisor) in the browser tab,
 * ahead of the section name the app shell already sets. Outside the shell it
 * sets the tab title directly.
 */
export function usePageTitle(title: string | null | undefined) {
  const setTitle = useContext(PageTitleContext);
  useEffect(() => {
    if (!title) return;
    if (setTitle) {
      setTitle(title);
      return () => setTitle(null);
    }
    const previous = document.title;
    document.title = formatPageTitle(title);
    return () => {
      document.title = previous;
    };
  }, [title, setTitle]);
}
