'use client';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import adminRoutes from 'routes/adminRoutes';
import { getActiveNavbar, getActiveRoute } from 'utils/navigation';
import Navbar from 'components/navbar';
import Sidebar from 'components/sidebar';
import Footer from 'components/footer/Footer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full bg-background-100 dark:bg-background-900">
      <Sidebar routes={adminRoutes} open={open} setOpen={setOpen} variant="admin" />
      <div className="h-full w-full font-dm dark:bg-navy-900">
        <main className="mx-2.5 flex-none transition-all md:pr-2 xl:ml-[323px]">
          <Navbar
            onOpenSidenav={() => setOpen(!open)}
            brandText={getActiveRoute(adminRoutes, pathname)}
            secondary={getActiveNavbar(adminRoutes, pathname)}
          />
          <div className="mx-auto min-h-screen p-2 !pt-[10px] md:p-2">{children}</div>
          <div className="p-3">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
