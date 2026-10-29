"use client";

import React, { useEffect, useState } from "react";
import Dropdown from "components/dropdown";
import { FiAlignJustify } from "react-icons/fi";
import { Repeat, Settings, Bell } from "lucide-react";
import Link from "next/link";

import { useMe } from "hooks/useMe";
import { profileRouteMap, notificationsRouteMap, applicationsRouteMap, partnersRouteMap } from "components/navbar/config/navigation";
import { useUnreadCount } from "features/notifications/hooks";
import NotificationsPreviewPopover from "features/notifications/components/NotificationsPreviewPopover";
import { usePartnerProfile } from "features/partners/hooks";
import PresignedImage from "components/ui/PresignedImage";

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
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, loading } = useMe();
  const { partner } = usePartnerProfile({ enabled: user?.role === "partner" });
  const isAgencyPartner = partner?.type === "agency";
  const photoFileKey = isAgencyPartner
    ? partner?.company_details?.logo_file_key
    : partner?.individual_details?.profile_photo_file_key;
  const avatarDisplayName = (isAgencyPartner && partner?.company_details?.company_name) || user?.name || "";

  const { unreadCount, refetch: refetchUnreadCount } = useUnreadCount({ pollIntervalMs: 30000 });

  useEffect(() => {
    const handler = () => refetchUnreadCount();
    window.addEventListener('notifications:refetch', handler);
    return () => window.removeEventListener('notifications:refetch', handler);
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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
    <nav
      className={`sticky z-40 flex flex-wrap items-center justify-between rounded-md bg-brand-50/10 p-2 backdrop-blur-xl transition-all duration-300 ${
        isScrolled ? "top-0" : "top-4"
      }`}
    >
      {/* Left Section */}
      <div className="ml-[6px] flex flex-col">
        <div className="flex items-center text-sm sm:text-base">
          <span className="text-slate-700">Pages</span>
          <span className="mx-1">/</span>
          <span className="capitalize text-slate-700 font-normal">
            {brandText}
          </span>
        </div>

        <p className="text-lg font-bold capitalize sm:text-2xl lg:text-3xl">
          <span className="font-bold text-slate-900 capitalize">
            {brandText}
          </span>
        </p>
      </div>

      <div className="relative mt-3 flex w-fit items-center gap-4 rounded-lg border border-slate-200 bg-white px-2 py-2">
        <span
          className="flex h-5 w-5 cursor-pointer items-center justify-center xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5 text-slate-600" />
        </span>

        <NotificationsPreviewPopover
          notificationsPath={getNotificationsRoute(user?.role)}
          applicationBasePath={getApplicationsBasePath(user?.role)}
          partnerBasePath={getPartnersBasePath(user?.role)}
          onNotificationHandled={refetchUnreadCount}
        >
          <Link href={getNotificationsRoute(user?.role)} className="relative flex items-center justify-center">
            <Bell className="h-5 w-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        </NotificationsPreviewPopover>

        <Dropdown
          button={

            <div className="flex cursor-pointer items-center gap-2">

              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center
                overflow-hidden rounded-full text-h5 font-medium text-blue-700 "
              >
                {user ? (
                  <PresignedImage
                    fileKey={photoFileKey ?? undefined}
                    alt={avatarDisplayName}
                    className="h-full w-full object-cover"
                    fallback={avatarDisplayName ? avatarDisplayName[0].toUpperCase() : "?"}
                  />
                ) : (
                  <div className="h-5 w-5 animate-pulse rounded-md" />
                )}
              </div>

            </div>
          }
          classNames="py-2 top-8 -left-[180px] w-max"
        >
          <div className="flex flex-col w-56 rounded-[12px] border border-slate-200 bg-white shadow-sm text-sm">
            <div className="flex items-center gap-2 p-4">
              <p className="text-slate-900 font-semibold">
                Hey, {loading ? "Loading..." : user?.name || "User"}
              </p>
            </div>

            <div className="border-t border-slate-200" />

            <div className="flex flex-col px-3 py-2 text-slate-900">
              <Link
                href={getProfileRoute(user?.role)}
                className="group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-muted hover:text-slate-900"
              >
                <Settings className="h-4 w-4 text-slate-700 group-hover:text-slate-900" />
                <span>Profile Settings</span>
              </Link>

              <Link
                href="/"
                className="group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-muted hover:text-slate-900"
              >
                <Repeat className="h-4 w-4 text-slate-700 group-hover:text-slate-900" />
                <span>Switch Area</span>
              </Link>
            </div>
          </div>
        </Dropdown>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
