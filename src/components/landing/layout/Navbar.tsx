"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { nav } from "lib/content";
import Container from "../ui/Container";
import { ButtonLink } from "../ui/Button";
import Logo from "./Logo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Full-screen menu: lock scroll, close on Esc, return focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const linkClass =
    "rounded-ub-md px-3 py-2 text-ub-label-md text-ub-text-secondary transition-colors duration-ub-fast hover:text-ub-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus";

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 border-b transition-[background-color,border-color] duration-ub-base ease-ub-standard",
        scrolled ? "ub-glass border-x-0 border-t-0 !border-b-ub-border" : "border-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.links.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink href={nav.cta.href} size="sm" className="hidden sm:inline-flex">
            {nav.cta.label}
          </ButtonLink>
          <button
            ref={toggleRef}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-ub-full text-ub-text-primary hover:bg-ub-surface-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus lg:hidden"
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-ub-canvas lg:hidden"
          >
            <nav aria-label="Mobile">
              <Container className="flex flex-col gap-2 py-8">
                {nav.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-ub-md py-3 text-ub-heading-lg text-ub-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus"
                  >
                    {link.label}
                  </Link>
                ))}
                <ButtonLink href={nav.cta.href} size="lg" className="mt-6" onClick={() => setOpen(false)}>
                  {nav.cta.label}
                </ButtonLink>
              </Container>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
