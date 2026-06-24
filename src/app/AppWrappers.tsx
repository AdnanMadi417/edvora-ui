'use client';
import React, { ReactNode, useEffect } from 'react';
import 'styles/App.css';
import 'styles/Contact.css';
// import '@asseinfo/react-kanban/dist/styles.css';
// import 'styles/Plugins.css';
import 'styles/MiniCalendar.css';
import 'styles/index.css';

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
