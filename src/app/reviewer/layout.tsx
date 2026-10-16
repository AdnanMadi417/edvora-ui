"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import reviewerRoutes from "../../routes/reviewerRoutes";
import { getActiveNavbar, getActiveRoute } from "utils/navigation";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import Footer from "components/footer/Footer";
import RoleGuard from "components/guard/RoleGuard";
import { ToastProvider } from "components/context/ToastContext";

const REVIEWER_ROLES = ["admin", "reviewer"];

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <RoleGuard allowedRoles={REVIEWER_ROLES}>

      <ToastProvider>
        <div className="relative flex min-h-screen w-full bg-slate-50">

          <Sidebar
            routes={reviewerRoutes}
            open={open}
            setOpen={setOpen}
            variant="admin"
          />

          <div className="relative h-full w-full dark:bg-navy-900">
            <main className="mx-2.5 flex-none transition-all md:pr-2 xl:ml-[300px]">
              <Navbar
                onOpenSidenav={() => setOpen(!open)}
                brandText={getActiveRoute(reviewerRoutes, pathname)}
                secondary={getActiveNavbar(reviewerRoutes, pathname)}
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
