"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { getActiveNavbar, getActiveRoute } from "utils/navigation";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import Footer from "components/footer/Footer";
import partnerRoutes from '../../routes/partnerRoutes';
import RoleGuard from "components/guard/RoleGuard";
import { ToastProvider } from "components/context/ToastContext";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <RoleGuard allowedRoles={["partner"]}>

      <ToastProvider>
        <div className="relative flex min-h-screen w-full bg-background-100 dark:bg-background-900">
          <div className="z-[60]">
            <Sidebar
              routes={partnerRoutes}
              open={open}
              setOpen={setOpen}
              variant="admin"
            />
          </div>

          <div className="relative h-full w-full font-dm dark:bg-navy-900">
            <main className="mx-2.5 flex-none transition-all md:pr-2 xl:ml-[300px]">
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
            </main>

          </div>
        </div>
      </ToastProvider>

    </RoleGuard>
  );
}
