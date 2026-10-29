"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import logoImg from "/public/img/brand/Primary-Logo-Blue.png";
import { buttonBase, buttonSizes, buttonVariants, focusRing } from "components/ub/recipes";

const textLink = clsx(
  "group items-center gap-1 rounded-ub-sm text-ub-label-md text-ub-text-secondary transition-colors duration-ub-fast hover:text-ub-text-link",
  focusRing,
);

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
      className={clsx(
        "ub-glass-light-strong sticky top-0 z-40 transition-shadow duration-ub-base",
        isScrolled ? "shadow-ub-sm" : "shadow-none",
      )}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className={clsx("shrink-0 rounded-ub-sm", focusRing)}>
          <Image
            src={logoImg}
            alt="Unibexs"
            width={110}
            height={36}
            className="object-contain dark:brightness-0 dark:invert"
            priority
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/apply-as-adviser" className={clsx(textLink, "hidden sm:inline-flex")}>
            Apply as Advisor
            <ArrowRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-ub-fast motion-safe:group-hover:translate-x-0.5 rtl:-scale-x-100 motion-safe:rtl:group-hover:-translate-x-0.5"
            />
          </Link>

          <Link href="/apply-as-adviser" className={clsx(textLink, "inline-flex sm:hidden")}>
            Apply
          </Link>

          <Link href="/" className={clsx(buttonBase, buttonVariants.primary, buttonSizes.sm)}>
            Open app
          </Link>
        </div>
      </div>
    </header>
  );
}
