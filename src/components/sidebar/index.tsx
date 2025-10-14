"use client";

import { HiX } from "react-icons/hi";
import { MdLogout } from "react-icons/md";
import Links from "./components/Links";
import logoImg from "/public/img/brand/Primary-Logo-Blue.png";
import { IRoute } from "types/navigation";
import Image from "next/image";
import { useRouter } from "next/navigation";

function SidebarHorizon(props: { routes: IRoute[]; [x: string]: any }) {
  const { routes, open, setOpen } = props;
  const router = useRouter();

  const handleLogout = () => {
    router.push("/auth/sign-in");
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-overlay backdrop-blur-sm transition-opacity duration-300 xl:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <div
        className={`border-default fixed z-50 flex min-h-full w-[280px] flex-col 
        border-r-thin bg-card pb-6 shadow-none 
        transition-transform duration-300 ease-in-out 
        xl:z-0 xl:translate-x-0 
        ${open ? "translate-x-0" : "-translate-x-full"}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <button
          className="absolute right-4 top-4 rounded-md bg-primary p-1
          text-text-primary transition-colors duration-200 hover:bg-card-hover
          hover:text-text-muted xl:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation menu"
          type="button"
        >
          <HiX className="text-icon-b" />
        </button>

        <header className="flex items-center justify-center px-6 py-8">
          <Image
            src={logoImg}
            alt="Your Business Logo"
            width={160}
            height={80}
            className="object-contain h-20 w-auto"
            priority
          />

        </header>

        <div className="border-default border-y-thin px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center
            rounded-full bg-accent-light text-h5 font-medium text-accent"
            >
              U
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-p2 font-semibold text-text-primary">
                Adnan
              </p>
              <p className="truncate text-caption text-text-muted">
                Account Manager
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4">
          <Links routes={routes} />
        </nav>

        <footer>
          <button
            onClick={handleLogout}
            className="mx-auto flex w-[90%] items-center gap-3 rounded-lg
            px-4 py-3 text-left text-p1 font-medium text-failed
            transition-fast hover:bg-alert-danger hover:text-failed-hover"
            aria-label="Sign out of your account"
            type="button"
          >
            <MdLogout className="text-icon-b" />
            <span>Logout</span>
          </button>
        </footer>
      </div>
    </>
  );



}

export default SidebarHorizon;
