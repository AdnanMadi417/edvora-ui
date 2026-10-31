"use client";

import { ComponentType, useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Languages } from "lucide-react";
import { ToastProvider } from "components/ub/feedback/ToastContext";
import ThemeSwitcher from "components/theme/ThemeSwitcher";
import ThemeToggle from "components/theme/ThemeToggle";
import { buttonBase, buttonSizes, buttonVariants, focusRing, focusRingInset } from "components/ub/recipes";
import { SECTIONS } from "./sections";

const DIR_KEY = "ub-guide-dir";

/** Highlights the section currently in view in the contents list. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -60% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

/** Page-wide LTR/RTL switch (brief §7.2), remembered per browser, reset when leaving the page. */
function useDirection() {
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(DIR_KEY);
    } catch {
      // storage unavailable
    }
    if (saved === "rtl") setDir("rtl");
    return () => document.documentElement.setAttribute("dir", "ltr");
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    try {
      localStorage.setItem(DIR_KEY, dir);
    } catch {
      // storage unavailable
    }
  }, [dir]);
  return [dir, setDir] as const;
}

export default function Gallery() {
  const active = useActiveSection(SECTIONS.map((s) => s.id));
  const [dir, setDir] = useDirection();

  return (
    <ToastProvider>
      <div className="ub-canvas-light min-h-screen font-sans text-ub-text-primary">
        {/* Header bar */}
        <header className="ub-glass-light-strong sticky top-0 z-40">
          <div className="mx-auto flex h-16 max-w-ub-dashboard items-center justify-between gap-4 px-4 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <span aria-hidden className="ub-notch-sm grid h-9 w-9 shrink-0 place-items-center rounded-ub-md bg-ub-action-primary text-ub-label-lg text-ub-action-primary-text">
                U
              </span>
              <div className="min-w-0">
                <p className="truncate text-ub-label-lg text-ub-text-primary">Unibexs System</p>
                <p className="truncate text-ub-caption text-ub-text-tertiary">Brand and UI style guide</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDir(dir === "ltr" ? "rtl" : "ltr")}
                aria-pressed={dir === "rtl"}
                className={clsx(buttonBase, buttonVariants.secondary, buttonSizes.sm)}
              >
                <Languages className="h-4 w-4" aria-hidden />
                {dir === "ltr" ? "RTL" : "LTR"}
              </button>
              <ThemeSwitcher className="hidden w-64 md:grid" />
              <ThemeToggle className="md:hidden" />
              <Link href="/" className={clsx(buttonBase, buttonVariants.primary, buttonSizes.sm, "hidden sm:inline-flex")}>
                Open the portal
              </Link>
            </div>
          </div>
        </header>

        {/* Hero: the page's one hero effect */}
        <section data-ub-theme="dark" aria-labelledby="guide-title" className="relative overflow-hidden bg-ub-canvas">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{ backgroundImage: "radial-gradient(60% 80% at 85% 20%, rgba(3,72,209,0.55), transparent 70%)" }}
          />
          <div className="relative mx-auto flex max-w-ub-dashboard items-center justify-between gap-8 px-4 py-14 md:px-8 md:py-20">
            <div className="max-w-ub-reading">
              <p className="inline-flex h-7 items-center rounded-ub-sm border border-ub-tone-brand-border bg-ub-tone-brand-bg px-2.5 text-ub-label-sm uppercase tracking-[0.06em] text-ub-tone-brand-text">
                Version 1.1 · 20 Oct 2026
              </p>
              <h1 id="guide-title" className="mt-5 text-ub-display-lg-mobile text-ub-text-primary sm:text-ub-display-lg">
                Brand and UI style guide
              </h1>
              <p className="mt-4 text-ub-body-lg text-ub-text-secondary">
                The visual language of the Unibexs System: colors, typography, foundations and the interface components used across the Advisor and admin portals. Every example on this page is the live component used in the product.
              </p>
            </div>
            <div aria-hidden className="ub-notch-lg hidden h-48 w-48 shrink-0 place-items-center rounded-ub-2xl bg-ub-action-primary text-[96px] font-bold text-ub-action-primary-text lg:grid">
              U
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-ub-dashboard grid-cols-[minmax(0,1fr)] gap-10 px-4 py-10 md:px-8 lg:grid-cols-[232px_minmax(0,1fr)]">
          {/* Contents */}
          <nav aria-label="Contents" className="min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
            <p className="mb-3 hidden text-ub-label-sm uppercase tracking-[0.12em] text-ub-text-tertiary lg:block">Contents</p>
            <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
              {SECTIONS.map((s) => {
                const current = active === s.id;
                return (
                  <li key={s.id} className="shrink-0">
                    <a
                      href={`#${s.id}`}
                      aria-current={current ? "true" : undefined}
                      className={clsx(
                        "flex h-10 items-center gap-3 rounded-ub-md px-3 text-ub-label-md transition-colors duration-ub-fast",
                        focusRingInset,
                        current ? "bg-ub-action-primary text-ub-action-primary-text" : "text-ub-text-secondary hover:bg-ub-surface hover:text-ub-text-primary",
                      )}
                    >
                      <span className={clsx("ub-tabular text-ub-caption", current ? "text-ub-action-primary-text" : "text-ub-text-tertiary")}>{s.number}</span>
                      {s.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <main className="grid min-w-0 gap-20">
            {SECTIONS.map(({ id, Component }) => (
              <SectionSlot key={id} Component={Component} />
            ))}
            <footer className="border-t border-ub-border pt-6 text-ub-caption text-ub-text-tertiary">
              Unibexs Design System Guide v1.1 · Source of truth: docs/unibexs-frontend-redesign-brief.md ·{" "}
              <a href="#brand" className={clsx("rounded-ub-xs text-ub-text-link hover:underline", focusRing)}>
                Back to top
              </a>
            </footer>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

function SectionSlot({ Component }: { Component: ComponentType }) {
  return <Component />;
}
