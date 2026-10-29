"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Play, X, Check } from "lucide-react";
import { hero } from "lib/content";

/**
 * The page's one hero effect (brief §0): a blue radial glow on a Night Blue
 * panel with layered product mockups that drift apart on scroll.
 */
export default function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yBack = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [40, -40]);
  const yMid = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [70, -70]);
  const yFront = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [110, -110]);
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <div
      ref={ref}
      className="relative mt-12 overflow-hidden rounded-ub-2xl border border-ub-border bg-ub-navy-surface-1 md:mt-16"
      style={{ backgroundImage: "radial-gradient(60% 70% at 50% 0%, rgba(3,72,209,0.55), transparent 70%)" }}
    >
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[1040px] sm:aspect-[16/10]">
        {/* Dashboard */}
        <motion.div style={{ y: yBack }} className="absolute inset-x-[4%] top-[10%] sm:inset-x-[6%] sm:top-[12%]" aria-hidden>
          <DashboardMock />
        </motion.div>
        {/* Code editor */}
        <motion.div style={{ y: yMid }} className="absolute bottom-[6%] start-[3%] hidden w-[46%] sm:block" aria-hidden>
          <CodeMock />
        </motion.div>
        {/* Mobile app */}
        <motion.div style={{ y: yFront }} className="absolute bottom-[4%] end-[6%] w-[42%] sm:end-[8%] sm:w-[22%]" aria-hidden>
          <PhoneMock />
        </motion.div>

        <button
          type="button"
          onClick={() => setVideoOpen(true)}
          className="ub-glass absolute start-1/2 top-1/2 inline-flex h-12 -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-ub-full px-5 text-ub-label-md text-ub-text-primary transition-colors duration-ub-fast hover:bg-ub-navy-surface-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ub-border-focus rtl:translate-x-1/2"
        >
          <Play className="h-4 w-4" aria-hidden />
          {hero.showreel.label}
        </button>
      </div>

      <ShowreelModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </div>
  );
}

function Window({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="overflow-hidden rounded-ub-lg border border-ub-border bg-ub-navy-surface-2 shadow-ub-xl">
      <div className="flex items-center gap-1.5 border-b border-ub-border px-3 py-2">
        <span className="h-2 w-2 rounded-ub-full bg-ub-navy-border-strong" />
        <span className="h-2 w-2 rounded-ub-full bg-ub-navy-border-strong" />
        <span className="h-2 w-2 rounded-ub-full bg-ub-navy-border-strong" />
        <span className="ms-2 text-ub-caption text-ub-text-secondary">{title}</span>
      </div>
      {children}
    </div>
  );
}

function DashboardMock() {
  const bars = [38, 52, 45, 68, 59, 80, 72, 92];
  return (
    <Window title="Revenue dashboard">
      <div className="grid grid-cols-3 gap-3 p-4">
        {[
          ["Monthly revenue", "RM482k"],
          ["Active users", "18,240"],
          ["Conversion", "6.8%"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-ub-md border border-ub-border bg-ub-navy-surface-1 p-3">
            <p className="text-ub-caption text-ub-text-secondary">{label}</p>
            <p className="ub-tabular mt-1 text-ub-heading-sm text-ub-text-primary">{value}</p>
          </div>
        ))}
        <div className="col-span-3 flex h-28 items-end gap-2 rounded-ub-md border border-ub-border bg-ub-navy-surface-1 p-3 sm:h-40">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t-ub-xs bg-ub-blue-500" style={{ height: `${h}%`, opacity: 0.45 + i * 0.07 }} />
          ))}
        </div>
      </div>
    </Window>
  );
}

function CodeMock() {
  const lines: [string, string][] = [
    ["text-ub-tag-plum-text-dark", "export async function"],
    ["text-ub-tag-sky-text-dark", "  ship(feature) {"],
    ["text-ub-text-secondary", "    await tests.run();"],
    ["text-ub-text-secondary", "    await review(feature);"],
    ["text-ub-tag-teal-text-dark", "    return deploy('prod');"],
    ["text-ub-tag-sky-text-dark", "  }"],
  ];
  return (
    <Window title="release.ts">
      <pre className="p-4 text-ub-caption leading-6">
        {lines.map(([cls, text], i) => (
          <div key={i} className={cls}>
            <span className="me-3 select-none text-ub-navy-border-strong">{i + 1}</span>
            {text}
          </div>
        ))}
      </pre>
    </Window>
  );
}

function PhoneMock() {
  return (
    <div className="rounded-[28px] border border-ub-navy-border-strong bg-ub-navy-surface-2 p-2 shadow-ub-xl">
      <div className="rounded-[22px] bg-ub-navy-surface-1 p-3">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-ub-full bg-ub-navy-border" />
        <p className="text-ub-caption text-ub-text-secondary">Order status</p>
        <p className="text-ub-label-md text-ub-text-primary">Out for delivery</p>
        <div className="mt-3 space-y-2">
          {["Confirmed", "Packed", "Shipped"].map((s) => (
            <div key={s} className="flex items-center gap-2 rounded-ub-md bg-ub-navy-surface-2 px-2 py-1.5">
              <span className="grid h-4 w-4 place-items-center rounded-ub-full bg-ub-blue-500">
                <Check className="h-3 w-3 text-ub-text-on-action" />
              </span>
              <span className="text-ub-caption text-ub-text-primary">{s}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 h-8 rounded-ub-full bg-ub-action-primary" />
      </div>
    </div>
  );
}

function ShowreelModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const src = hero.showreel.src;
  const isEmbed = /youtube|vimeo/.test(src);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Keep focus inside the dialog: it only has one focusable control besides the video.
      if (e.key === "Tab") {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center bg-ub-scrim p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Showreel"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[960px] overflow-hidden rounded-ub-xl border border-ub-border bg-ub-navy-surface-3 shadow-ub-xl"
          >
            <button
              ref={closeRef}
              type="button"
              aria-label="Close showreel"
              onClick={onClose}
              className="absolute end-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-ub-full bg-ub-navy-surface-2 text-ub-text-primary hover:bg-ub-navy-surface-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            <div className="aspect-video">
              {!src ? (
                <div className="grid h-full place-items-center p-8 text-center text-ub-body-md text-ub-text-secondary">
                  Showreel coming soon. Set hero.showreel.src in lib/content.ts.
                </div>
              ) : isEmbed ? (
                <iframe src={src} title="Showreel" className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
              ) : (
                <video src={src} className="h-full w-full" controls autoPlay playsInline preload="none" />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
