import React, { ReactNode } from 'react';
import AppWrappers from './AppWrappers';
import { Inter } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
    <body id="root" className="font-sans">
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
