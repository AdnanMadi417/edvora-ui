"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import dataEntryRoutes from "../../routes/dataEntryRoutes";
import { getActiveNavbar, getActiveRoute } from "utils/navigation";
import Navbar from "components/ub/navigation/NavbarTop";
import Sidebar from "components/ub/navigation/Sidebar";
import Footer from "components/ub/navigation/Footer";
import RoleGuard from "components/guard/RoleGuard";
import { ToastProvider } from "components/ub/feedback/ToastContext";

const DATA_ENTRY_ROLES = ["admin", "data_entry"];

export default function DataEntryLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <RoleGuard allowedRoles={DATA_ENTRY_ROLES}>

      <ToastProvider>
        <div className="ub-canvas-light relative flex min-h-screen w-full text-ub-text-primary">

          <Sidebar
            routes={dataEntryRoutes}
            open={open}
            setOpen={setOpen}
            variant="admin"
          />

          <div className="relative flex min-h-screen w-full min-w-0 flex-col xl:ms-64">
            <Navbar
              onOpenSidenav={() => setOpen(!open)}
              brandText={getActiveRoute(dataEntryRoutes, pathname)}
              secondary={getActiveNavbar(dataEntryRoutes, pathname)}
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
