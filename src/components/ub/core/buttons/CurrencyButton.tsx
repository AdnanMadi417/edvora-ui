"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Coins } from "lucide-react";
import { buttonBase, buttonSizes, buttonVariants, focusRing } from "components/ub/recipes";
import { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";

export interface CurrencyButtonProps {
  /** Null preserves amounts in their original currencies. */
  value: string | null;
  options: string[];
  onChange: (currency: string) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

const currencyName = (code: string) => {
  try { return new Intl.DisplayNames(["en"], { type: "currency" }).of(code) || code; }
  catch { return code; }
};

/** Controlled display-currency picker. Conversion remains the caller's responsibility. */
export default function CurrencyButton({ value, options, onChange, disabled, size = "md" }: CurrencyButtonProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const reducedMotion = useReducedMotion();
  const currencies = Array.from(new Set(options));
  const unavailable = disabled || currencies.length <= 1;
  const close = () => { setOpen(false); trigger.current?.focus(); };

  useEffect(() => {
    const outside = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  useEffect(() => {
    if (open) items.current[Math.max(0, currencies.indexOf(value ?? ""))]?.focus();
    // Focus the selected item only when opening the menu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return <div ref={wrapper} className="relative inline-flex" onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }} onKeyDown={(event) => {
    if (event.key === "Escape" && open) { event.preventDefault(); close(); }
  }}>
    <button ref={trigger} type="button" disabled={unavailable} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined}
      aria-label={`Display currency: ${value || "Original currencies"}`}
      onClick={() => setOpen((previous) => !previous)}
      onKeyDown={(event) => {
        if (!unavailable && (event.key === "ArrowDown" || event.key === "ArrowUp")) { event.preventDefault(); setOpen(true); }
      }}
      className={`${buttonBase} ${buttonSizes[size]} ${buttonVariants.secondary}`}>
      <Coins className="h-4 w-4 text-ub-icon" aria-hidden="true" />
      <span className="text-ub-text-secondary">Currency</span>
      <span className="ub-tabular border-s border-ub-border ps-2 text-ub-text-primary">{value || "Original"}</span>
      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`} aria-hidden="true" />
    </button>
    <AnimatePresence>
      {open && !unavailable && <motion.div id={id} role="menu" aria-label="Display currency"
        initial={reducedMotion ? false : { opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4 }}
        transition={{ duration: reducedMotion ? 0 : MICRO_DURATION, ease: EASE }}
        className="fixed inset-x-4 bottom-24 z-50 w-auto sm:absolute sm:inset-auto sm:start-0 sm:top-full sm:bottom-auto sm:mt-2 sm:w-64 sm:max-w-[calc(100vw-2rem)] overflow-hidden rounded-ub-lg border border-ub-border bg-ub-surface shadow-ub-md"
        onKeyDown={(event) => {
          const index = items.current.indexOf(document.activeElement as HTMLButtonElement);
          let next = index;
          if (event.key === "ArrowDown") next = (index + 1) % currencies.length;
          else if (event.key === "ArrowUp") next = (index - 1 + currencies.length) % currencies.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = currencies.length - 1;
          else return;
          event.preventDefault(); items.current[next]?.focus();
        }}>
        <p className="border-b border-ub-border px-4 py-3 text-ub-label-sm text-ub-text-tertiary">Display amounts in</p>
        <div className="max-h-64 overflow-y-auto p-1.5">
          {currencies.map((code, index) => <button key={code} ref={(element) => { items.current[index] = element; }} type="button" role="menuitemradio" aria-checked={value === code}
            onClick={() => { onChange(code); close(); }}
            className={`flex w-full items-center gap-3 rounded-ub-md px-3 py-2.5 text-start transition-colors motion-reduce:transition-none ${focusRing} ${value === code ? "bg-ub-selected text-ub-text-selected" : "text-ub-text-primary hover:bg-ub-action-ghost-hover"}`}>
            <span className="ub-tabular w-10 shrink-0 text-ub-label-md">{code}</span>
            <span className="flex-1 text-ub-body-sm text-ub-text-secondary">{currencyName(code)}</span>
            {value === code && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
          </button>)}
        </div>
      </motion.div>}
    </AnimatePresence>
  </div>;
}
