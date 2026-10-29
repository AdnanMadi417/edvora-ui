"use client";

import { ReactNode, createContext, useCallback, useContext, useState } from "react";
import clsx from "clsx";

/** When set, only demos with these names render, and section wrappers flatten. */
const PickContext = createContext<ReadonlySet<string> | null>(null);

/**
 * Renders just the named demos from any showcase component, so a guide
 * section can mix demos from several files:
 * <Pick demos={["Tag", "DaysTag"]}><NewData /></Pick>
 */
export function Pick({ demos, children }: { demos: string[]; children: ReactNode }) {
  return <PickContext.Provider value={new Set(demos)}>{children}</PickContext.Provider>;
}

/** A gallery section: number eyebrow, anchor, title, intro and a stack of component demos. */
export function ShowcaseSection({ id, number, title, description, children }: { id: string; number?: string; title: string; description?: string; children: ReactNode }) {
  const pick = useContext(PickContext);
  if (pick) return <>{children}</>;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <header className="mb-8">
        {number && <p className="ub-tabular mb-2 text-ub-label-md tracking-[0.08em] text-ub-text-link">{number}</p>}
        <h2 id={`${id}-title`} className="text-ub-heading-xl-mobile text-ub-text-primary sm:text-ub-heading-xl">
          {title}
        </h2>
        {description && <p className="mt-3 max-w-ub-reading text-ub-body-lg text-ub-text-secondary">{description}</p>}
      </header>
      <div className="grid gap-6">{children}</div>
    </section>
  );
}

interface DemoProps {
  name: string;
  /** Source path under src/, shown so people can jump to the file. */
  path: string;
  description?: string;
  children: ReactNode;
  /** Preview area layout classes. */
  className?: string;
  /** Wide demos take the full row on large screens. */
  wide?: boolean;
}

/** One component: name, file path and a live, interactive preview. */
export function Demo({ name, path, description, children, className }: DemoProps) {
  const pick = useContext(PickContext);
  const id = `c-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  if (pick && !pick.has(name)) return null;
  return (
    <article id={id} className="scroll-mt-24 overflow-hidden rounded-ub-lg border border-ub-border bg-ub-surface">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ub-border bg-ub-surface-subtle px-5 py-3">
        <h3 className="text-ub-heading-sm text-ub-text-primary">
          <a href={`#${id}`} className="rounded-ub-xs hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus">
            {name}
          </a>
        </h3>
        <code className="ub-ref text-ub-caption text-ub-text-tertiary">src/{path}</code>
        {description && <p className="w-full text-ub-body-sm text-ub-text-secondary">{description}</p>}
      </header>
      <div className={clsx("p-5", className)}>{children}</div>
    </article>
  );
}

/** A labelled variant inside a demo. */
export function Variant({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={clsx("min-w-0", className)}>
      <p className="mb-2 text-ub-label-sm text-ub-text-tertiary">{label}</p>
      {children}
    </div>
  );
}

/** Segmented control for switching a demo's state (loading/empty/error…). */
export function StateSwitch<T extends string>({ value, options, onChange, label = "State" }: { value: T; options: readonly T[]; onChange: (v: T) => void; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="mb-4 inline-flex flex-wrap gap-1 rounded-ub-full border border-ub-border bg-ub-surface-subtle p-1">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={o === value}
          onClick={() => onChange(o)}
          className={clsx(
            "h-8 rounded-ub-full px-3 text-ub-label-sm capitalize transition-colors duration-ub-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus",
            o === value ? "bg-ub-action-primary text-ub-action-primary-text" : "text-ub-text-secondary hover:bg-ub-surface",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** The formData/errors/updateFormData trio most form fields in this repo expect. */
export function useDemoForm(initial: Record<string, any> = {}, initialErrors: Record<string, string> = {}) {
  const [formData, setFormData] = useState<Record<string, any>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>(initialErrors);
  const updateFormData = useCallback((field: string, value: any) => {
    setFormData((d) => ({ ...d, [field]: value }));
    setErrors((e) => {
      if (!e[field]) return e;
      const { [field]: _removed, ...rest } = e;
      return rest;
    });
  }, []);
  return { formData, errors, updateFormData, setErrors };
}
