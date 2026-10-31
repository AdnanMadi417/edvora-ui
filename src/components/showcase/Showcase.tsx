"use client";

import { ReactNode, createContext, useCallback, useContext, useState } from "react";
import clsx from "clsx";
import { Check, Copy } from "lucide-react";
import { CATALOG, type CatalogEntry } from "components/ub/catalog";

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
      {CATALOG[name] && <UsageStrip entry={CATALOG[name]} />}
      <div className={clsx("p-5", className)}>{children}</div>
    </article>
  );
}

/** "Where to use" strip from components/ub/catalog.ts, shown under each demo header. */
function UsageStrip({ entry }: { entry: CatalogEntry }) {
  const [copied, setCopied] = useState(false);
  const code = entry.imports.join("\n");
  return (
    <div className="grid gap-3 border-b border-ub-border px-5 py-4 text-ub-body-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <dl className="space-y-2">
        <div>
          <dt className="text-ub-label-sm text-ub-text-tertiary">Use for</dt>
          <dd className="text-ub-text-primary">{entry.useFor}</dd>
        </div>
        <div>
          <dt className="text-ub-label-sm text-ub-text-tertiary">Where it's used</dt>
          <dd>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {entry.usedIn.map((place) => (
                <li key={place} className="inline-flex h-6 items-center rounded-ub-sm border border-ub-tone-brand-border bg-ub-tone-brand-bg px-2 text-ub-label-sm text-ub-tone-brand-text">
                  {place}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        {entry.avoid && (
          <div>
            <dt className="text-ub-label-sm text-ub-text-tertiary">Avoid</dt>
            <dd className="text-ub-text-secondary">{entry.avoid}</dd>
          </div>
        )}
        {entry.legacyOf && (
          <div>
            <dt className="sr-only">Status</dt>
            <dd className="inline-flex items-center gap-1.5 rounded-ub-sm border border-ub-tone-warning-border bg-ub-tone-warning-bg px-2 py-0.5 text-ub-label-sm text-ub-tone-warning-text">
              Legacy formData API. In new screens use {entry.legacyOf}.
            </dd>
          </div>
        )}
      </dl>
      <div className="min-w-0">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-ub-label-sm text-ub-text-tertiary">Import</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(code).catch(() => undefined);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex h-7 items-center gap-1 rounded-ub-full px-2.5 text-ub-label-sm text-ub-text-link transition-colors duration-ub-fast hover:bg-ub-action-secondary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus"
          >
            {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre dir="ltr" className="overflow-x-auto rounded-ub-md border border-ub-border bg-ub-surface-subtle p-3 text-ub-caption leading-5 text-ub-text-primary">
          <code>{code}</code>
        </pre>
      </div>
    </div>
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
