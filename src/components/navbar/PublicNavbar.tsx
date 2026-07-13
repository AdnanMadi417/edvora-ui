"use client";

import Image from "next/image";
import Link from "next/link";
import logoImg from "/public/img/brand/Primary-Logo-Blue.png";

export default function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/">
          <Image
            src={logoImg}
            alt="Unibexs"
            width={110}
            height={36}
            className="object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/register"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
          >
            Apply as Partner
          </Link>
          <Link
            href="/auth/sign-in"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
