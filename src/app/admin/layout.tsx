"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { getActiveNavbar, getActiveRoute } from "utils/navigation";
import Navbar from "components/ub/navigation/NavbarTop";
import Sidebar from "components/ub/navigation/Sidebar";
import Footer from "components/ub/navigation/Footer";
import adminRoutes from '../../routes/adminRoutes';
import RoleGuard from "components/guard/RoleGuard";
import { ToastProvider } from "components/ub/feedback/ToastContext";

const ADMIN_ROLES = ["admin"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <RoleGuard allowedRoles={ADMIN_ROLES}>

      <ToastProvider>
        <div className="ub-canvas-light relative flex min-h-screen w-full text-ub-text-primary">
          <Sidebar
            routes={adminRoutes}
            open={open}
            setOpen={setOpen}
            variant="admin"
          />

          <div className="relative flex min-h-screen w-full min-w-0 flex-col xl:ms-64">
            <Navbar
              onOpenSidenav={() => setOpen(!open)}
              brandText={getActiveRoute(adminRoutes, pathname)}
              secondary={getActiveNavbar(adminRoutes, pathname)}
            />
            <main className="w-full flex-1 p-4 md:p-6 lg:p-8">{children}</main>
            <div className="px-4 md:px-6 lg:px-8">
              <Footer />
            </div>
          </div>
        </div>
      </ToastProvider>

    </RoleGuard>
  );
}
