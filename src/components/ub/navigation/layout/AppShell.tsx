"use client";

import { ReactNode, Suspense, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Circle, Menu } from "lucide-react";
import type { IRoute } from "types/navigation";
import { getActiveNavbar, getActiveRoute } from "utils/navigation";
import { focusRing } from "components/ub/recipes";
import Sidebar, { SIDEBAR_ID } from "./Sidebar";
import Navbar from "./NavbarTop";
import Footer from "./Footer";
import Loading from "components/ub/feedback/states/Loading";
import { PageTitleContext, formatPageTitle } from "./pageTitle";
import NavbarBottom, { type NavbarBottomItem } from "./NavbarBottom";

export interface AppShellProps {
  /** Sidebar routes for this role (already filtered for visibility). */
  routes: IRoute[];
  children: ReactNode;
  /** Bottom-nav items below 768px (2–4). Defaults to the first three feature routes; a "Menu" button opens the full drawer. */
  bottomNavItems?: NavbarBottomItem[];
}

/** Notifications live in the header bell. Use the first three other routes below (groups link to their first child). */
// The bottom bar has ~90px per item; long page names get their short form there
// (the full name stays in the sidebar and the page title).
const SHORT_LABELS: Record<string, string> = {
  "Logistics Marketplace": "Logistics",
  "Commission Tracker": "Commission",
  "Account managers": "Managers",
};

function defaultBottomItems(routes: IRoute[]): NavbarBottomItem[] {
  return routes.filter((route) => route.path !== "/notifications").slice(0, 3).map((route) => {
    const target = route.children?.length ? route.children[0] : route;
    return { href: (target.layout ?? "") + target.path, label: SHORT_LABELS[route.name] ?? route.name, icon: route.icon ?? Circle };
  });
}

/**
 * The portal's app shell (brief §5), shared by every role layout:
 * - canvas: soft blue wash (.ub-canvas-light)
 * - sidebar: 256px, collapsible to a 72px rail from 1200px (toggle or Ctrl/⌘+B,
 *   remembered per browser); an overlay drawer below 1200px
 * - top bar: 64px light glass with the page title, notifications and avatar menu
 * - content: padding 16 / 24 / 32 at xs–sm / md / lg+
 * - bottom nav below 768px with the main sections and a Menu button
 */
export default function AppShell({ routes, children, bottomNavItems }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer after navigating.
  useEffect(() => setOpen(false), [pathname]);

  // Browser tab title: the record a page names (usePageTitle), then the section, then the app.
  const section = getActiveRoute(routes, pathname);
  const [recordTitle, setRecordTitle] = useState<string | null>(null);
  useEffect(() => {
    const title = formatPageTitle(recordTitle, section);
    document.title = title;
    // Next.js writes the root metadata title after navigation; put ours back when it does.
    const observer = new MutationObserver(() => {
      if (document.title !== title) document.title = title;
    });
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [recordTitle, section]);

  const bottomItems = useMemo(() => bottomNavItems ?? defaultBottomItems(routes), [bottomNavItems, routes]);

  return (
    <div className="ub-canvas-light relative flex min-h-screen w-full text-ub-text-primary">
      <a
        href="#main"
        className={clsx(
          "sr-only rounded-ub-full bg-ub-action-primary px-4 py-2 text-ub-label-md text-ub-action-primary-text focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[80]",
          focusRing,
        )}
      >
        Skip to content
      </a>

      <Sidebar routes={routes} open={open} setOpen={setOpen} variant="admin" />

      <div className="relative flex min-h-screen w-full min-w-0 flex-col transition-[margin] duration-ub-slow ease-ub-standard motion-reduce:transition-none xl:ms-[var(--ub-sidebar-w)]">
        <Navbar onOpenSidenav={() => setOpen((o) => !o)} brandText={section} secondary={getActiveNavbar(routes, pathname)} open={open} setOpen={setOpen} />
        <main id="main" tabIndex={-1} className="w-full flex-1 p-4 pb-24 focus:outline-none md:p-6 lg:p-8">
          {/* Pages that read useSearchParams() need a boundary to prerender (Next.js). */}
          <PageTitleContext.Provider value={setRecordTitle}>
            {/* One content width for every page (tables, homes, details): centred on wide screens. */}
            <div className="mx-auto w-full min-w-0 max-w-ub-dashboard">
              <Suspense fallback={<Loading />}>{children}</Suspense>
            </div>
          </PageTitleContext.Provider>
        </main>
        <div className="px-4 pb-20 md:px-6 md:pb-0 lg:px-8">
          <div className="mx-auto w-full max-w-ub-dashboard">
            <Footer />
          </div>
        </div>
      </div>

      <NavbarBottom
        items={bottomItems}
        action={{ label: "Menu", icon: Menu, onClick: () => setOpen((o) => !o), expanded: open, controls: SIDEBAR_ID }}
      />
    </div>
  );
}
