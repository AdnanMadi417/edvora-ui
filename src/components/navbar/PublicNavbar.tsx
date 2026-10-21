"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import logoImg from "/public/img/brand/Primary-Logo-Blue.png";

export default function PublicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-white/80 px-6 py-4 backdrop-blur-md transition-shadow duration-200 ${
        isScrolled ? "border-slate-200 shadow-sm" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className="shrink-0">
          <Image
            src={logoImg}
            alt="Unibexs"
            width={110}
            height={36}
            className="object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/apply-as-adviser"
            className="group hidden items-center gap-1 text-sm font-medium text-slate-600 transition hover:text-blue-600 sm:flex"
          >
            Apply as Adviser
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/apply-as-adviser"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600 sm:hidden"
          >
            Apply
          </Link>

          <Link
            href="/auth/sign-in"
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
