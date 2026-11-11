'use client';
import React, { ReactNode, useEffect } from 'react';
import ThemeProvider from 'components/theme/ThemeProvider';
// The app's only stylesheet: Tailwind, legacy variables, base styles, tokens.
import 'styles/globals.css';

export default function AppWrappers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const handler = (e: WheelEvent) => {
      if ((e.target as HTMLElement).matches('input[type="number"]')) {
        (e.target as HTMLInputElement).blur();
      }
    };
    document.addEventListener('wheel', handler, { passive: true });
    return () => document.removeEventListener('wheel', handler);
  }, []);

  return <ThemeProvider>{children}</ThemeProvider>;
}
