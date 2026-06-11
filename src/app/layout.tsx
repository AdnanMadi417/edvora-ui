import React, { ReactNode } from 'react';
import AppWrappers from './AppWrappers';
import { Plus_Jakarta_Sans } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
    <body id="root" className="font-sans">
    <AppWrappers>{children}</AppWrappers>
    </body>
    </html>
  );
}
