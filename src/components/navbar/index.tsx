"use client";

import React, { useEffect, useState } from "react";
import Dropdown from "components/dropdown";
import { FiAlignJustify } from "react-icons/fi";
import { KeyRound, LogOut, Settings, Bell } from "lucide-react";
import NavLink from "components/link/NavLink";
import Link from "next/link";
import api, { setLoggingOut, SIGN_IN_URL } from "../../lib/useApi";

import { useMe } from "hooks/useMe";
import { profileRouteMap, notificationsRouteMap } from "components/navbar/config/navigation";
import { useUnreadCount } from "hooks/notifications/useUnreadCount";
import { useToast } from "components/context/ToastContext";
import ChangePasswordPopup from "features/partners/components/partner/ChangePasswordPopup";
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const { user, loading } = useMe();
  const { showToast } = useToast();
  const { partner } = usePartnerProfile({ enabled: user?.role === "partner" });
  const photoFileKey = partner?.individual_details?.profile_photo_file_key;

  const handleSendResetLink = async () => {
    if (!user?.email || isSendingReset) return;
    setIsSendingReset(true);
    try {
      await api.post("/auth/forgot-password", { email: user.email });
    } catch {
      // always show success to prevent enumeration
    } finally {
      setIsSendingReset(false);
      showToast("Password reset link sent to your email.", "success");
    }
  };
  const { unreadCount, refetch: refetchUnreadCount } = useUnreadCount({ pollIntervalMs: 30000 });

  useEffect(() => {
    const handler = () => refetchUnreadCount();
    window.addEventListener('notifications:refetch', handler);
    return () => window.removeEventListener('notifications:refetch', handler);
  }, [refetchUnreadCount]);

  const getProfileRoute = (role?: string) => {
    if (!role) return "/auth/sign-in";
    return profileRouteMap[role] || "/profile";
  };

  const getNotificationsRoute = (role?: string) => {
    if (!role) return "/auth/sign-in";
    return notificationsRouteMap[role] || "/notifications";
  };

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

  const deleteAllCookies = () => {
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLoggingOut(true);

    try {
      await api.post("/auth/logout").catch(() => {});
    } catch (err) {
      console.error("Logout API error:", err);
    }

    localStorage.clear();
    sessionStorage.clear();
    deleteAllCookies();

    window.location.replace(SIGN_IN_URL);
  };

  return (
    <>
    {user?.role === "partner" && (
      <ChangePasswordPopup isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
    )}
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
          <NavLink
            href="#"
            className="capitalize text-slate-700 no-underline font-normal"
          >
            {brandText}
          </NavLink>
        </div>

        <p className="text-lg font-bold capitalize sm:text-2xl lg:text-3xl">
          <NavLink
            href="#"
            className="font-bold text-slate-900 no-underline capitalize"
          >
            {brandText}
          </NavLink>
        </p>
      </div>

      <div className="relative mt-3 flex w-fit items-center gap-4 rounded-md border border-slate-200 bg-card px-2 py-2">
        <span
          className="flex h-5 w-5 cursor-pointer items-center justify-center xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5 text-slate-600" />
        </span>

        <Link href={getNotificationsRoute(user?.role)} className="relative flex items-center justify-center">
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

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
                    alt={user.name}
                    className="h-full w-full object-cover"
                    fallback={user.name[0].toUpperCase()}
                  />
                ) : (
                  <div className="h-5 w-5 animate-pulse rounded-md" />
                )}
              </div>

            </div>
          }
          classNames="py-2 top-8 -left-[180px] w-max"
        >
          <div className="flex flex-col w-56 rounded-[12px] border border-slate-200 bg-card shadow-sm text-sm">
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

              {user?.role === "partner" && (
                <button
                  type="button"
                  onClick={() => setShowChangePassword(true)}
                  className="group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-muted hover:text-slate-900"
                >
                  <KeyRound className="h-4 w-4 text-slate-700 group-hover:text-slate-900" />
                  <span>Change Password</span>
                </button>
              )}

              {(user?.role === "admin" || user?.role === "account_manager") && (
                <button
                  type="button"
                  onClick={handleSendResetLink}
                  disabled={isSendingReset}
                  className="group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-muted hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <KeyRound className="h-4 w-4 text-slate-700 group-hover:text-slate-900" />
                  <span>{isSendingReset ? "Sending…" : "Reset Password"}</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                type="button"
                aria-label="Sign out of your account"
                className="group flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-failed transition-colors duration-200 hover:bg-failed/10 hover:text-failed-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut className="h-4 w-4 text-failed group-hover:text-failed-hover" />
                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
              </button>
            </div>
          </div>
        </Dropdown>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
