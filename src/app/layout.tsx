import React, { ReactNode } from 'react';
import AppWrappers from './AppWrappers';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { THEME_INIT_SCRIPT } from 'components/theme/theme';
import { SIDEBAR_INIT_SCRIPT } from 'components/ub/navigation/sidebarScript';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-ub-theme="light" className={inter.variable} suppressHydrationWarning>
    <head>
      {/* Applies the saved light/dark theme before first paint. */}
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT + SIDEBAR_INIT_SCRIPT }} />
    </head>
    <body id="root" className="bg-ub-canvas font-sans text-ub-text-primary">
    <AppWrappers>{children}</AppWrappers>
    {/* Cloudflare Web Analytics. The token is a public site id, and the beacon
        only records hits from the hostname registered in Cloudflare. */}
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon='{"token": "380aea8b03bf4671adf8027401aedb6a"}'
    />
    </body>
    </html>
  );
}
