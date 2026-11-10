"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { Bell, Menu, Repeat, Settings } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

import { useMe } from "hooks/useMe";
import { profileRouteMap, notificationsRouteMap, applicationsRouteMap, partnersRouteMap } from "components/ub/navigation/layout/navbarRoutes";
import { useUnreadCount } from "features/notifications/hooks";
import NotificationsPreviewPopover from "features/notifications/components/NotificationsPreviewPopover";
import { usePartnerProfile } from "features/partners/hooks";
import PresignedImage from "components/ub/data/media/PresignedImage";
import ThemeSwitcher from "components/theme/ThemeSwitcher";
import { avatarInitials, focusRing, iconButtonSizes, menuItem, popover } from "components/ub/recipes";

// Circular, borderless icon button for the top bar (bell, menu).
const topBarIconButton = clsx(
  "relative inline-grid shrink-0 place-items-center rounded-ub-full text-ub-icon transition-colors duration-ub-fast ease-ub-standard hover:bg-ub-nav-hover hover:text-ub-icon-interactive",
  iconButtonSizes.md,
  focusRing,
);

const Navbar = ({
  onOpenSidenav,
  brandText,
  open,
  setOpen,
}: {
  onOpenSidenav: () => void;
  brandText: string;
  secondary?: boolean | string;
  routes?: any;
  open?: boolean;
  setOpen?: (v: boolean) => void;
}) => {
  const { user, loading } = useMe();
  const { partner } = usePartnerProfile({ enabled: user?.role === "partner" });
  const isAgencyPartner = partner?.type === "agency";
  const photoFileKey = isAgencyPartner
    ? partner?.company_details?.logo_file_key
    : partner?.individual_details?.profile_photo_file_key;
  const avatarDisplayName = (isAgencyPartner && partner?.company_details?.company_name) || user?.name || "";

  const { unreadCount, refetch: refetchUnreadCount } = useUnreadCount({ pollIntervalMs: 30000 });

  // One main heading per page: the section name is the h1 unless the page
  // brings its own (a student's or Advisor's name), then it's plain text.
  const [pageHasHeading, setPageHasHeading] = useState(false);
  useEffect(() => {
    const main = document.getElementById("main");
    if (!main) return;
    const check = () => setPageHasHeading(!!main.querySelector("h1"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(main, { subtree: true, childList: true });
    return () => observer.disconnect();
  }, []);
  const TitleTag = pageHasHeading ? "p" : "h1";

  useEffect(() => {
    const handler = () => refetchUnreadCount();
    window.addEventListener("notifications:refetch", handler);
    return () => window.removeEventListener("notifications:refetch", handler);
  }, [refetchUnreadCount]);

  const getProfileRoute = (role?: string) => {
    if (!role) return "/";
    return profileRouteMap[role] || "/profile";
  };

  const getNotificationsRoute = (role?: string) => {
    if (!role) return "/";
    return notificationsRouteMap[role] || "/notifications";
  };

  const getApplicationsBasePath = (role?: string) => (role ? applicationsRouteMap[role] : undefined);

  const getPartnersBasePath = (role?: string) => (role ? partnersRouteMap[role] : undefined);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && setOpen) setOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, setOpen]);

  const unreadLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <header className="ub-glass-light-strong sticky top-0 z-40 flex h-16 items-center gap-3 px-4 md:px-6 lg:px-8">
      {/* Tablet only: phones use the bottom nav's Menu button, desktop has the persistent sidebar. */}
      <button
        type="button"
        onClick={onOpenSidenav}
        aria-label="Open navigation menu"
        aria-controls="ub-sidebar"
        aria-expanded={open ?? false}
        className={clsx(topBarIconButton, "hidden md:inline-grid xl:hidden")}
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      <TitleTag className="min-w-0 flex-1 truncate text-ub-heading-sm text-ub-text-primary md:text-ub-heading-md">{brandText}</TitleTag>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <NotificationsPreviewPopover
          notificationsPath={getNotificationsRoute(user?.role)}
          applicationBasePath={getApplicationsBasePath(user?.role)}
          partnerBasePath={getPartnersBasePath(user?.role)}
          onNotificationHandled={refetchUnreadCount}
        >
          <Link
            href={getNotificationsRoute(user?.role)}
            aria-label={unreadCount > 0 ? `Notifications, ${unreadLabel} unread` : "Notifications"}
            className={topBarIconButton}
          >
            <Bell className="h-5 w-5" aria-hidden />
            {unreadCount > 0 && (
              <span
                aria-hidden
                className="absolute -end-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-ub-full bg-ub-danger-600 px-1 text-[10px] font-semibold leading-none text-ub-text-on-action ring-2 ring-ub-surface"
              >
                {unreadLabel}
              </span>
            )}
          </Link>
        </NotificationsPreviewPopover>


        <AvatarMenu
          loading={loading}
          hasUser={!!user}
          userName={user?.name}
          displayName={avatarDisplayName}
          photoFileKey={photoFileKey ?? undefined}
          profileHref={getProfileRoute(user?.role)}
        />
      </div>
    </header>
  );
};

function AvatarMenu({
  loading,
  hasUser,
  userName,
  displayName,
  photoFileKey,
  profileHref,
}: {
  loading: boolean;
  hasUser: boolean;
  userName?: string;
  displayName: string;
  photoFileKey?: string;
  profileHref: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    wrapperRef.current?.querySelector<HTMLElement>('[role="menuitem"], [role="menuitemradio"]')?.focus();
    const onPointerDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Arrow keys move between the menu items (brief §9).
  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"], [role="menuitemradio"]'));
    const i = items.indexOf(document.activeElement as HTMLElement);
    const next = e.key === "ArrowDown" ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  const initial = displayName ? displayName[0].toUpperCase() : "?";

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuOpen ? menuId : undefined}
        onClick={() => setMenuOpen((v) => !v)}
        className={clsx(avatarInitials, "h-10 w-10 text-ub-label-lg", focusRing)}
      >
        {hasUser ? (
          <PresignedImage fileKey={photoFileKey} alt={displayName} className="h-full w-full object-cover" fallback={initial} />
        ) : (
          <span className="h-5 w-5 animate-pulse rounded-ub-full bg-ub-skeleton motion-reduce:animate-none" />
        )}
      </button>

      {menuOpen && (
        <div id={menuId} role="menu" aria-label="Account" onKeyDown={onMenuKeyDown} className={clsx(popover, "absolute end-0 top-full z-50 mt-2 w-60 p-1.5")}>
          <div className="px-3 pb-2 pt-1.5">
            <p className="truncate text-ub-label-md text-ub-text-primary">{loading ? "Loading…" : userName || "Signed in"}</p>
            {displayName && displayName !== userName && <p className="truncate text-ub-caption text-ub-text-tertiary">{displayName}</p>}
          </div>
          <div className="my-1 border-t border-ub-border" role="separator" />
          <Link href={profileHref} role="menuitem" onClick={() => setMenuOpen(false)} className={menuItem}>
            <Settings className="h-4 w-4 text-ub-icon" aria-hidden />
            <span>Profile settings</span>
          </Link>
          <Link href="/" role="menuitem" onClick={() => setMenuOpen(false)} className={menuItem}>
            <Repeat className="h-4 w-4 text-ub-icon" aria-hidden />
            <span>Switch area</span>
          </Link>
          <div className="my-1 border-t border-ub-border" role="separator" />
          <div className="px-3 pb-1.5 pt-1">
            <p className="mb-1.5 text-ub-label-sm text-ub-text-tertiary" aria-hidden>
              Theme
            </p>
            <ThemeSwitcher variant="menu" />
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
