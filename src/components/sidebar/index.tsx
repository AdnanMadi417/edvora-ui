"use client";

import { HiX } from "react-icons/hi";
import { MdLogout } from "react-icons/md";
import Links from "./components/Links";
import logoImg from "/public/img/brand/Primary-Logo-Blue.png";
import { IRoute } from "types/navigation";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import api from "lib/useApi";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

function SidebarUnibexs(props: { routes: IRoute[]; [x: string]: any }) {
  const { routes, open, setOpen } = props;
  const router = useRouter();

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

  const deleteAllCookies = () => {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;

      const domain = window.location.hostname;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`;

      const parts = domain.split(".");
      if (parts.length > 2) {
        const parentDomain = parts.slice(-2).join(".");
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${parentDomain}`;
      }
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {

      await api.post("/auth/logout").catch(() => {

      });
    } catch (err) {
      console.error("Logout API error:", err);
    }

    localStorage.clear();

    sessionStorage.clear();

    deleteAllCookies();

    setTimeout(() => {
      router.push("/auth/sign-in");
    }, 100);
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
        className={`fixed z-50 flex h-screen w-[280px] flex-col 
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

        <header className="flex items-center justify-center px-6 py-6 mt-3 mb-3">
          <Image
            src={logoImg}
            alt="Your Business Logo"
            width={140}
            height={70}
            className="object-contain"
            priority
          />
        </header>

        <div className="border-gray-200 border-y-thin px-6 py-4">
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
                  <div className="h-5 w-5 animate-pulse rounded-full bg-gray-300" />
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

        <nav className="flex-1 py-4">
          <Links routes={routes} />
        </nav>

        <footer className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-full
              border border-transparent px-4 py-3 text-left
              font-medium text-red-600 transition-all duration-200
              hover:bg-red-50 hover:border-red-100
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