"use client";

import { useEffect, useState } from "react";
import Dropdown from "components/dropdown";
import { FiAlignJustify } from "react-icons/fi";
import { LogOut, Settings } from "lucide-react";
import NavLink from "components/link/NavLink";
import Image from "next/image";
import Link from "next/link";
import avatar from "/public/img/avatars/avatar4.png";
import api from "../../lib/useApi";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const Navbar = ({
                  onOpenSidenav,
                  brandText,
                  routes,
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
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchUser();
  }, []);

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
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout API error:", err);
    }
    localStorage.clear();
    sessionStorage.clear();
    deleteAllCookies();
    await router.push("/auth/sign-in");
  };

  return (
    <nav
      className={`sticky z-40 flex flex-wrap items-center justify-between rounded-md bg-brand-50/10 p-2 backdrop-blur-xl transition-all duration-300 ${
        isScrolled ? "top-0" : "top-4"
      }`}
    >
      {/* Left Section */}
      <div className="ml-[6px] flex flex-col">
        <div className="flex items-center text-sm sm:text-base">
          <span className="text-text-secondary">Pages</span>
          <span className="mx-1">/</span>
          <NavLink
            href="#"
            className="capitalize text-text-secondary no-underline font-normal"
          >
            {brandText}
          </NavLink>
        </div>

        <p className="text-lg font-bold capitalize sm:text-2xl lg:text-3xl">
          <NavLink
            href="#"
            className="font-bold text-text-primary no-underline capitalize"
          >
            {brandText}
          </NavLink>
        </p>
      </div>

      <div className="relative mt-3 flex w-fit items-center gap-4 rounded-full border border-default bg-card px-2 py-2">

        <span
          className="flex h-5 w-5 cursor-pointer items-center justify-center xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5 text-text-muted" />
        </span>

        <Dropdown
          button={
            <div className="flex cursor-pointer items-center gap-2">
              <Image
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
                src={avatar}
                alt="Profile"
              />
            </div>
          }
          classNames="py-2 top-8 -left-[180px] w-max"
        >
          <div className="flex flex-col w-56 rounded-[12px] border border-default bg-card shadow-sm text-sm">

            <div className="flex items-center gap-2 p-4">
              <p className="text-text-primary font-semibold">
                Hey, {user ? user.name : "User"}
              </p>
            </div>

            <div className="border-t border-default" />

            <div className="flex flex-col px-3 py-2 text-text-primary">
              <Link
                href=""
                className="group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-muted hover:text-text-primary"
              >
                <Settings className="h-4 w-4 text-text-secondary group-hover:text-text-primary" />
                <span>Profile Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                type="button"
                aria-label="Sign out of your account"
                className="group flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-failed transition-colors duration-200 hover:bg-failed/10 hover:text-failed-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut className="h-4 w-4 text-failed group-hover:text-failed-hover" />
                <span>
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </button>
            </div>
          </div>
        </Dropdown>
      </div>
    </nav>
  );
};

export default Navbar;
