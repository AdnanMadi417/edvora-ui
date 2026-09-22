"use client";

import { HiX } from "react-icons/hi";
import { MessageSquarePlus, FlaskConical } from "lucide-react";
import Links from "./components/Links";
import logoImg from "/public/img/brand/Primary-Logo-Blue.png";
import { IRoute } from "types/navigation";
import Image from "next/image";
import Link from "next/link";

import { useEffect, useState, useCallback } from "react";
import api from "lib/useApi";
import { usePartnerProfile } from "features/partners/hooks";
import { formatAgencyRole } from "features/partners/utils";
import PresignedImage from "components/ui/PresignedImage";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  agency_role?: string | null;
}

function SidebarUnibexs(props: { routes: IRoute[]; [x: string]: any }) {
  const { routes, open, setOpen } = props;


  const [user, setUser] = useState<User | null>(null);
  const [userError, setUserError] = useState(false);
  const [showBetaTooltip, setShowBetaTooltip] = useState(false);
  const { partner } = usePartnerProfile({ enabled: user?.role === "partner" });
  const isAgencyPartner = partner?.type === "agency";
  const photoFileKey = isAgencyPartner
    ? partner?.company_details?.logo_file_key
    : partner?.individual_details?.profile_photo_file_key;
  const sidebarDisplayName = (isAgencyPartner && partner?.company_details?.company_name) || user?.name || "";

  const ROLE_LABELS: Record<string, string> = {
    admin: "Admin",
    account_manager: "Account Manager",
    partner: "Partner",
    data_entry: "Data Entry",
    reviewer: "Reviewer",
  };

  function getRoleLabel(role: string): string {
    return ROLE_LABELS[role] || role;
  }

  const PROFILE_PATHS: Record<string, string> = {
    partner: "/partner/profile",
    account_manager: "/account-manager/profile",
  };
  const profilePath = user?.role ? PROFILE_PATHS[user.role] : undefined;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        setUserError(false);
      } catch (err) {
        console.error("Failed to fetch user", err);
        setUserError(true);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, setOpen]);

  const handleOverlayClick = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-overlay bg-opacity-40 backdrop-blur-sm"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col 
    border-r border-gray-200 bg-white shadow-md
    transition-transform duration-300 ease-in-out xl:z-0 xl:translate-x-0 
    ${open ? "translate-x-0" : "-translate-x-full"}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <button
          className="absolute right-4 top-4 rounded-md bg-primary p-1
      text-slate-900 transition-colors duration-200 hover:bg-card-hover
      hover:text-slate-500 xl:hidden"
          onClick={handleOverlayClick}
          aria-label="Close navigation menu"
          type="button"
        >
          <HiX className="text-icon-b" />
        </button>

        <header className="mb-3 mt-3 flex items-center justify-center gap-2 px-6 py-6">
          <Image
            src={logoImg}
            alt="Unibexs Logo"
            width={140}
            height={70}
            className="object-contain"
            priority
          />
          {user?.role === "partner" && (
            <div className="relative">
              <span
                className="flex shrink-0 cursor-default items-center gap-1 rounded-md border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700"
                onMouseEnter={() => setShowBetaTooltip(true)}
                onMouseLeave={() => setShowBetaTooltip(false)}
              >
                <FlaskConical className="h-3 w-3" />
                Beta
              </span>
              {showBetaTooltip && (
                <div className="absolute left-1/2 top-full z-50 mt-2 w-48 -translate-x-1/2 rounded-md bg-slate-900 px-3 py-2 text-center text-[11px] font-normal normal-case leading-snug text-white shadow-lg">
                  <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-900" />
                  Things are still being polished — you might spot a few bugs. Thanks for testing with us!
                </div>
              )}
            </div>
          )}
        </header>

        <div className="max-h-30 block overflow-y-auto [&::-webkit-scrollbar-thumb]:bg-slate-100 [&::-webkit-scrollbar-thumb]:[border-radius:3px] [&::-webkit-scrollbar-thumb]:[margin-left:3px] [&::-webkit-scrollbar]:[width:6px]" />

        <div
          className="flex-1 overflow-y-auto 
          border-t border-slate-200 pt-6
        [&::-webkit-scrollbar-thumb]:bg-slate-200
        [&::-webkit-scrollbar-thumb]:[border-radius:3px]
        [&::-webkit-scrollbar-thumb]:[margin-left:3px]
        [&::-webkit-scrollbar]:[width:6px]
      "
        >
          <Links routes={routes} onLinkClick={() => setOpen(false)} />
        </div>

        {user?.role === "partner" && (
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScbdcaLfK0utkj8DaMVEJdBUW82swRrWWZODNcFq1DNaRLLTQ/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-slate-500 transition-colors duration-200 ease-in-out hover:text-slate-900"
          >
            <MessageSquarePlus className="h-[18px] w-[18px]" />
            <span>Send feedback</span>
          </a>
        )}

        <footer className="border-t border-gray-200 px-6 py-4">
          {userError ? (
            <div className="text-center">
              <p className="text-p2 text-failed">Failed to load user</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-caption text-accent hover:underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {profilePath ? (
                <Link
                  href={profilePath}
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center
          overflow-hidden rounded-full bg-accent-light text-h5 font-medium text-blue-700"
                >
                  {user ? (
                    <PresignedImage
                      fileKey={photoFileKey ?? undefined}
                      alt={sidebarDisplayName}
                      className="h-full w-full object-cover"
                      fallback={sidebarDisplayName ? sidebarDisplayName[0].toUpperCase() : "?"}
                    />
                  ) : (
                    <div className="h-5 w-5 animate-pulse rounded-md bg-gray-300" />
                  )}
                </Link>
              ) : (
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center
          overflow-hidden rounded-full bg-accent-light text-h5 font-medium text-blue-700"
                >
                  {user ? (
                    <PresignedImage
                      fileKey={photoFileKey ?? undefined}
                      alt={sidebarDisplayName}
                      className="h-full w-full object-cover"
                      fallback={sidebarDisplayName ? sidebarDisplayName[0].toUpperCase() : "?"}
                    />
                  ) : (
                    <div className="h-5 w-5 animate-pulse rounded-md bg-gray-300" />
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                {user ? (
                  <>
                    <p className="truncate text-p2 font-semibold text-slate-900">
                      {sidebarDisplayName}
                    </p>
                    <p className="truncate text-caption text-slate-500">
                      {user.role === "partner" && user.agency_role
                        ? formatAgencyRole(user.agency_role)
                        : getRoleLabel(user.role)}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mb-2 h-4 w-32 animate-pulse rounded bg-gray-300" />
                    <div className="h-3 w-20 animate-pulse rounded bg-gray-300" />
                  </>
                )}
              </div>
            </div>
          )}
        </footer>
      </div>

    </>
  );
}

export default SidebarUnibexs;
