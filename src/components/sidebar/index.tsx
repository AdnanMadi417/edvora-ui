"use client";

import { HiX } from "react-icons/hi";
import { MdLogout } from "react-icons/md";
import { MessageSquarePlus, FlaskConical } from "lucide-react";
import Links from "./components/Links";
import logoImg from "/public/img/brand/Primary-Logo-Blue.png";
import { IRoute } from "types/navigation";
import Image from "next/image";

import { useEffect, useState, useCallback } from "react";
import api, { SIGN_IN_URL, LOGOUT_URL } from "lib/useApi";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

function SidebarUnibexs(props: { routes: IRoute[]; [x: string]: any }) {
  const { routes, open, setOpen } = props;


  const [user, setUser] = useState<User | null>(null);
  const [userError, setUserError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const ROLE_LABELS: Record<string, string> = {
    admin: "Admin",
    account_manager: "Account Manager",
    partner: "Partner",
  };

  function getRoleLabel(role: string): string {
    return ROLE_LABELS[role] || role;
  }

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(LOGOUT_URL, { method: "POST" });
    } catch {
      // non-fatal
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace(SIGN_IN_URL);
  };

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
            alt="Your Business Logo"
            width={140}
            height={70}
            className="object-contain"
            priority
          />
          {user?.role === "partner" && (
            <span className="flex shrink-0 items-center gap-1 rounded-md border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
              <FlaskConical className="h-3 w-3" />
              Beta
            </span>
          )}
        </header>

        <div className="border-y-thin border-gray-200 px-6 py-4">
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
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center
          rounded-full bg-accent-light text-h5 font-medium text-blue-700"
              >
                {user ? (
                  user.name[0].toUpperCase()
                ) : (
                  <div className="h-5 w-5 animate-pulse rounded-md bg-gray-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {user ? (
                  <>
                    <p className="truncate text-p2 font-semibold text-slate-900">
                      {user.name}
                    </p>
                    <p className="truncate text-caption text-slate-500">
                      {getRoleLabel(user.role)}
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
        </div>

        <div className="max-h-30 block overflow-y-auto [&::-webkit-scrollbar-thumb]:bg-slate-100 [&::-webkit-scrollbar-thumb]:[border-radius:3px] [&::-webkit-scrollbar-thumb]:[margin-left:3px] [&::-webkit-scrollbar]:[width:6px]" />

        <div
          className="flex-1 overflow-y-auto py-4
        [&::-webkit-scrollbar-thumb]:bg-slate-200
        [&::-webkit-scrollbar-thumb]:[border-radius:3px]
        [&::-webkit-scrollbar-thumb]:[margin-left:3px]
        [&::-webkit-scrollbar]:[width:6px]
      "
        >
          <Links routes={routes} onLinkClick={() => setOpen(false)} />
        </div>

        <footer className="border-t border-gray-200 px-6 py-4">
          {user?.role === "partner" && (
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScbdcaLfK0utkj8DaMVEJdBUW82swRrWWZODNcFq1DNaRLLTQ/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-1 flex w-full items-center gap-3 rounded-md border border-transparent px-4 py-3 text-left font-medium text-slate-600 transition-all duration-200 hover:border-slate-100 hover:bg-slate-50"
            >
              <MessageSquarePlus className="h-5 w-5" />
              <span className="text-sm">Send feedback</span>
            </a>
          )}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-md
        border border-transparent px-4 py-3 text-left
        font-medium text-red-600 transition-all duration-200
        hover:border-red-100 hover:bg-red-50
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Sign out of your account"
            type="button"
          >
            <MdLogout
              className={`h-5 w-5 ${isLoggingOut ? "animate-spin" : ""}`}
            />
            <span className="text-sm">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </footer>
      </div>

    </>
  );
}

export default SidebarUnibexs;
