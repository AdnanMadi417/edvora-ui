"use client";

import { HiX } from "react-icons/hi";
import { MdLogout } from "react-icons/md";
import Links from "./components/Links";
import logoImg from "/public/img/brand/Primary-Logo-Blue.png";
import { IRoute } from "types/navigation";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

function SidebarHorizon(props: { routes: IRoute[]; [x: string]: any }) {
  const { routes, open, setOpen } = props;
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    router.push("/auth/sign-in");
  };
  return (
    <div
      className={`fixed z-50 flex min-h-full flex-col pb-6 xl:z-0 xl:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{
        backgroundColor: "var(--primary-bg)",
        boxShadow: "none",
        width: "300px",
        transition: "var(--transition-medium)",
        borderRight: "var(--border-thin) solid var(--border-color-default)",
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Close button */}
      <button
        className="absolute right-4 top-4 rounded-md p-1 transition-colors duration-200 xl:hidden"
        onClick={() => setOpen(false)}
        aria-label="Close navigation menu"
        type="button"
        style={{
          backgroundColor: "var(--primary-bg)",
          color: "var(--primary-text-color)",
          borderRadius: "var(--radius-md)",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "var(--card-hover)";
          e.target.style.color = "var(--muted-text-color)";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "var(--primary-bg)";
          e.target.style.color = "var(--primary-text-color)";
        }}
      >
        <HiX style={{ fontSize: "var(--icon-size-b)" }} />
      </button>

      <header
        className="flex items-center justify-center px-6"
        style={{ padding: "2rem 1.5rem" }}
      >
        <Image
          src={logoImg}
          alt="Your Business Logo"
          width={160}
          height={80}
          className="object-contain"
          priority
        />
      </header>

      <div
        className="px-6 py-4"
        style={{
          borderTop: "var(--border-thin) solid var(--border-color-default)",
          borderBottom: "var(--border-thin) solid var(--border-color-default)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "var(--accent-light)",
              borderRadius: "var(--radius-full)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-color)",
              fontSize: "var(--font-size-h5)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            U
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate"
              style={{
                color: "var(--primary-text-color)",
                fontSize: "var(--font-size-p2)",
                fontWeight: "var(--font-weight-medium)",
                marginBottom: "2px",
              }}
            >
              Account Manager
            </p>

            <p
              className="truncate"
              style={{
                color: "var(--muted-text-color)",
                fontSize: "var(--font-size-caption)",
              }}
            >
              Administrator
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1" style={{ padding: "1rem 0" }}>
        <Links routes={routes} />
      </nav>

      <footer className="">
        <button
          onClick={handleLogout}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex w-full items-center gap-3 text-left"
          style={{
            padding: isHovered ? "0.75rem 1rem" : "0.75rem 0rem",
            borderRadius: "var(--radius-lg)",
            color: isHovered
              ? "var(--failed-color-hover)"
              : "var(--failed-color)",
            fontWeight: "var(--font-weight-medium)",
            fontSize: "var(--font-size-p1)",
            transition: "var(--transition-fast)",
            backgroundColor: isHovered
              ? "var(--alert-danger-bg)"
              : "transparent",
            margin: "0 auto",
            width: "90%",
          }}
          aria-label="Sign out of your account"
          type="button"
        >
          <MdLogout style={{ fontSize: "var(--icon-size-b)" }} />
          <span>Logout</span>
        </button>
      </footer>
    </div>
  );
}

export default SidebarHorizon;
