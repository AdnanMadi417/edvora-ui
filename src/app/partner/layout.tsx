"use client";

import { usePathname } from "next/navigation";
import React, { useState } from "react";
import partnerRoutes from "routes/partnerRoutes";
import {
  getActiveNavbar,
  getActiveRoute,
  isWindowAvailable,
} from "utils/navigation";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import Footer from "components/footer/Footer";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (isWindowAvailable()) document.documentElement.dir = "ltr";

  return (
    <div className="flex h-full w-full bg-primary dark:bg-background-900">
      <Sidebar routes={partnerRoutes} open={open} setOpen={setOpen} variant="partner" />
      <div className="h-full w-full font-dm dark:bg-navy-900">
        <main className="mx-2.5 flex-none transition-all dark:bg-navy-900 md:pr-2 xl:ml-[300px]">
          <div>
            <Navbar
              onOpenSidenav={() => setOpen(!open)}
              brandText={getActiveRoute(partnerRoutes, pathname)}
              secondary={getActiveNavbar(partnerRoutes, pathname)}
            />
            <div className="mx-auto min-h-screen p-2 !pt-[10px] md:p-2">
              {children}
            </div>
            <div className="p-3">
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
