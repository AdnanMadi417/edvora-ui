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
  /** Props table under the preview. */
  props?: PropRow[];
  /** Copyable JSX example under the preview. */
  code?: string;
}

export interface PropRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

/** One component: name, file path and a live, interactive preview. */
export function Demo({ name, path, description, children, className, props, code }: DemoProps) {
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
      {(code || props) && (
        <div className="grid gap-4 border-t border-ub-border px-5 py-4">
          {code && <CodeBlock label="Usage" code={code} />}
          {props && <PropsTable rows={props} />}
        </div>
      )}
    </article>
  );
}

/** "Where to use" strip from components/ub/catalog.ts, shown under each demo header. */
function UsageStrip({ entry }: { entry: CatalogEntry }) {
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
      <CodeBlock label="Import" code={code} />
    </div>
  );
}

/** Copy button + pre block (always LTR). */
export function CodeBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-ub-label-sm text-ub-text-tertiary">{label}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(code).catch(() => undefined);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
          aria-label={`Copy ${label.toLowerCase()}`}
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
  );
}

/** Props table: name, type, default, description. */
export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-ub-label-sm text-ub-text-tertiary">Props</p>
      <div className="overflow-x-auto rounded-ub-md border border-ub-border">
        <table className="w-full min-w-[560px] text-start text-ub-body-sm">
          <thead className="bg-ub-table-head text-ub-label-sm text-ub-text-secondary">
            <tr>
              <th scope="col" className="h-9 px-3 text-start font-medium">Prop</th>
              <th scope="col" className="h-9 px-3 text-start font-medium">Type</th>
              <th scope="col" className="h-9 px-3 text-start font-medium">Default</th>
              <th scope="col" className="h-9 px-3 text-start font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-t border-ub-border align-top">
                <td className="px-3 py-2"><code className="ub-ref text-ub-text-primary">{r.name}</code></td>
                <td className="px-3 py-2"><code dir="ltr" className="text-ub-caption text-ub-text-secondary">{r.type}</code></td>
                <td className="px-3 py-2 text-ub-text-secondary">{r.default ?? "—"}</td>
                <td className="px-3 py-2 text-ub-text-primary">{r.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** The same preview in light, near-black dark and RTL, side by side on wide screens. */
export function ThemePreviews({ children, className }: { children: ReactNode; className?: string }) {
  const frames: { label: string; theme: "light" | "dark"; dir: "ltr" | "rtl" }[] = [
    { label: "Light", theme: "light", dir: "ltr" },
    { label: "Dark", theme: "dark", dir: "ltr" },
    { label: "RTL", theme: "light", dir: "rtl" },
  ];
  return (
    <div className={clsx("grid gap-4 xl:grid-cols-3", className)}>
      {frames.map((f) => (
        <figure key={f.label} className="min-w-0">
          <figcaption className="mb-2 text-ub-label-sm text-ub-text-tertiary">{f.label}</figcaption>
          <div data-ub-theme={f.theme} dir={f.dir} className="rounded-ub-lg border border-ub-border bg-ub-canvas p-4 text-ub-text-primary">
            {children}
          </div>
        </figure>
      ))}
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
