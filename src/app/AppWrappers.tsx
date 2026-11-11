'use client';
import React, { ReactNode, useEffect } from 'react';
import ThemeProvider from 'components/theme/ThemeProvider';
import 'styles/index.css';
// Unibexs design system: tokens, utilities, dark bridge (styles/globals.css).
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
