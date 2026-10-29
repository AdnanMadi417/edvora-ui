'use client';
import React, { ReactNode, useEffect } from 'react';
import 'styles/App.css';
import 'styles/Contact.css';
// import '@asseinfo/react-kanban/dist/styles.css';
// import 'styles/Plugins.css';
import 'styles/MiniCalendar.css';
import 'styles/index.css';
// Unibexs design system tokens (docs/unibexs-frontend-redesign-brief.md).
import 'styles/tokens/primitives.css';
import 'styles/tokens/semantic.css';
import 'styles/tokens/utilities.css';

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

  return <React.Fragment>{children}</React.Fragment>;
}
