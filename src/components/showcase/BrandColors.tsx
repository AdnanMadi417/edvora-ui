"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Check, X } from "lucide-react";
import { Demo, ShowcaseSection } from "./Showcase";

// ── Live token values + WCAG contrast (brief §7.2: computed, never hard-coded) ──

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().replace("#", "").match(/^([0-9a-f]{6})/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]: [number, number, number]) {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function contrast(a: string, b: string): number | null {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return null;
  const [l1, l2] = [luminance(ra), luminance(rb)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Resolved values of CSS variables, read after mount so token edits show immediately. */
export function useCssVars(names: string[]) {
  const [values, setValues] = useState<Record<string, string>>({});
  const key = names.join("|");
  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setValues(Object.fromEntries(key.split("|").map((n) => [n, style.getPropertyValue(n).trim()])));
  }, [key]);
  return values;
}

function Ratio({ fg, bg, label }: { fg?: string; bg?: string; label: string }) {
  const r = fg && bg ? contrast(fg, bg) : null;
  if (r === null) return null;
  const pass = r >= 4.5;
  const large = !pass && r >= 3;
  return (
    <span
      title={`${label}: ${r.toFixed(2)}:1`}
      className={clsx(
        "ub-tabular inline-flex h-5 items-center gap-1 rounded-ub-sm border px-1.5 text-ub-label-sm",
        pass ? "border-ub-tone-success-border bg-ub-tone-success-bg text-ub-tone-success-text" : large ? "border-ub-tone-warning-border bg-ub-tone-warning-bg text-ub-tone-warning-text" : "border-ub-tone-danger-border bg-ub-tone-danger-bg text-ub-tone-danger-text",
      )}
    >
      {label} {r.toFixed(1)}
      {pass ? <Check className="h-3 w-3" aria-hidden /> : large ? <span aria-hidden>L</span> : <X className="h-3 w-3" aria-hidden />}
      <span className="sr-only">{pass ? "passes AA" : large ? "passes for large text only" : "fails AA"}</span>
    </span>
  );
}

/** Swatch grid: token name, live hex, contrast on white and on navy; click copies var(). */
export function Swatches({ tokens, prefix = "--ub-", notes = {} }: { tokens: string[]; prefix?: string; notes?: Record<string, string> }) {
  const vars = tokens.map((t) => `${prefix}${t}`);
  const values = useCssVars([...vars, "--ub-neutral-0", "--ub-deep-navy"]);
  const [copied, setCopied] = useState<string | null>(null);
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {vars.map((v, i) => (
        <li key={v}>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(`var(${v})`).catch(() => undefined);
              setCopied(v);
              window.setTimeout(() => setCopied((c) => (c === v ? null : c)), 1500);
            }}
            className="w-full rounded-ub-md text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ub-border-focus"
            aria-label={`Copy var(${v})`}
          >
            <span className="block h-14 rounded-ub-md border border-ub-border" style={{ background: `var(${v})` }} />
            <span className="ub-ref mt-1.5 block truncate text-ub-caption text-ub-text-primary">{copied === v ? "Copied" : v.replace("--", "")}</span>
            <span className="ub-ref block text-ub-caption uppercase text-ub-text-tertiary">{values[v] || " "}</span>
            {notes[tokens[i]] && <span className="block text-ub-caption text-ub-text-tertiary">{notes[tokens[i]]}</span>}
            <span className="mt-1 flex flex-wrap gap-1">
              <Ratio fg={values[v]} bg={values["--ub-neutral-0"]} label="on white" />
              <Ratio fg={values[v]} bg={values["--ub-deep-navy"]} label="on navy" />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

const PRIMARY = [
  { token: "deep-navy", name: "Deep Navy", role: "Primary text, dark canvas", on: "text-white" },
  { token: "primary-blue", name: "Primary Blue", role: "CTAs, links, active, progress", on: "text-white" },
  { token: "light-blue", name: "Light Blue", role: "Light fills, selected states", on: "text-ub-blue-700" },
  { token: "light-grey", name: "Light Grey", role: "Quiet surfaces, disabled fills", on: "text-ub-neutral-700" },
];

const PAIRS: { fg: string; bg: string; use: boolean; note: string }[] = [
  { fg: "--ub-neutral-950", bg: "--ub-neutral-0", use: true, note: "Body text on white" },
  { fg: "--ub-neutral-0", bg: "--ub-blue-600", use: true, note: "White on Primary Blue" },
  { fg: "--ub-blue-600", bg: "--ub-blue-50", use: true, note: "Link on Light Blue" },
  { fg: "--ub-neutral-0", bg: "--ub-deep-navy", use: true, note: "White on navy" },
  { fg: "--ub-blue-600", bg: "--ub-deep-navy", use: false, note: "Primary Blue text on navy" },
  { fg: "--ub-neutral-400", bg: "--ub-neutral-0", use: false, note: "neutral-400 text (disabled only)" },
  { fg: "--ub-neutral-0", bg: "--ub-warning-500", use: false, note: "White on warning" },
  { fg: "--ub-deep-navy", bg: "--ub-warning-500", use: true, note: "Navy on warning fill" },
];

export default function BrandColors() {
  const pairVars = useCssVars(Array.from(new Set(PAIRS.flatMap((p) => [p.fg, p.bg]))));
  const primaryVars = useCssVars(PRIMARY.map((p) => `--ub-${p.token}`));

  return (
    <ShowcaseSection
      id="brand"
      number="01"
      title="Brand identity and colors"
      description="The Unibexs System is built on Deep Navy and Primary Blue, supported by a navy-tinted neutral scale. Every swatch shows its live token value and its contrast on white and on navy; click one to copy its CSS variable. Atmosphere colors are for brand and social only, never product UI."
    >
      <Demo name="Primary palette" path="styles/tokens/primitives.css">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PRIMARY.map((p) => (
            <li key={p.token} className="overflow-hidden rounded-ub-lg border border-ub-border">
              <div className={clsx("flex h-28 flex-col justify-end p-4", p.on)} style={{ background: `var(--ub-${p.token})` }}>
                <p className="text-ub-heading-sm">{p.name}</p>
                <p className="ub-ref text-ub-caption uppercase opacity-80">{primaryVars[`--ub-${p.token}`]}</p>
              </div>
              <p className="bg-ub-surface p-3 text-ub-body-sm text-ub-text-secondary">
                <code className="ub-ref text-ub-caption text-ub-text-primary">--ub-{p.token}</code>
                <br />
                {p.role}
              </p>
            </li>
          ))}
        </ul>
      </Demo>

      <Demo name="Blue scale" path="styles/tokens/primitives.css">
        <Swatches tokens={[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((s) => `blue-${s}`)} notes={{ "blue-600": "Primary Blue", "blue-50": "Light Blue" }} />
      </Demo>

      <Demo name="Neutral scale (navy-tinted)" path="styles/tokens/primitives.css">
        <Swatches
          tokens={[0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((s) => `neutral-${s}`)}
          notes={{ "neutral-200": "Default borders", "neutral-400": "Disabled only, never text", "neutral-500": "Form control borders", "neutral-600": "Captions, placeholders", "neutral-700": "Secondary text" }}
        />
      </Demo>

      <Demo name="Background and surface" path="styles/tokens/semantic.css" description="Semantic roles components use. They switch automatically in the dark theme.">
        <Swatches tokens={["bg-canvas", "bg-surface", "bg-surface-subtle", "bg-selected", "bg-disabled", "bg-table-head"]} />
      </Demo>

      <Demo name="Text" path="styles/tokens/semantic.css" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["text-primary", "text-ub-text-primary", "Headings and body"],
          ["text-secondary", "text-ub-text-secondary", "Supporting text"],
          ["text-tertiary", "text-ub-text-tertiary", "Captions and placeholders"],
          ["text-disabled", "text-ub-text-disabled", "Disabled labels only"],
          ["text-link", "text-ub-text-link", "Links and interactive text"],
        ].map(([token, cls, use]) => (
          <div key={token} className="rounded-ub-md border border-ub-border p-3">
            <p className={clsx("text-ub-heading-sm", cls)}>Nur Aisyah Binti Kamal</p>
            <p className="ub-ref text-ub-caption text-ub-text-tertiary">--ub-{token}</p>
            <p className="text-ub-caption text-ub-text-tertiary">{use}</p>
          </div>
        ))}
      </Demo>

      <Demo name="Semantic colors" path="styles/tokens/primitives.css" description="Tinted alerts use 700 text on the 50 background with a 200 border (warning uses 800). Never white text on warning.">
        <div className="space-y-4">
          {["success", "warning", "danger", "info"].map((role) => (
            <div key={role}>
              <p className="mb-2 text-ub-label-md capitalize text-ub-text-primary">{role}</p>
              <Swatches tokens={[50, 200, 500, 600, 700, 800].map((s) => `${role}-${s}`)} />
            </div>
          ))}
        </div>
      </Demo>

      <Demo name="Tag hues" path="styles/tokens/primitives.css" description="Functional only: stage, status and days tags. Text is always present.">
        <div className="flex flex-wrap gap-2">
          {["sky", "indigo", "orange", "plum", "amber", "red", "pink", "teal", "grey"].map((h) => (
            <span
              key={h}
              className="inline-flex h-6 items-center gap-1.5 rounded-ub-sm border px-2 text-ub-label-sm capitalize"
              style={{ background: `var(--ub-tag-${h}-bg)`, borderColor: `var(--ub-tag-${h}-border)`, color: `var(--ub-tag-${h}-text)` }}
            >
              <span className="h-1.5 w-1.5 rounded-ub-full" style={{ background: `var(--ub-tag-${h}-solid)` }} />
              {h}
            </span>
          ))}
        </div>
      </Demo>

      <Demo name="Borders" path="styles/tokens/semantic.css" className="grid gap-3 sm:grid-cols-3">
        {[
          ["border-default", "border border-ub-border", "1px · cards, dividers"],
          ["border-control", "border border-ub-border-control", "1px · inputs"],
          ["border-focus", "border-2 border-ub-border-focus", "2px · focus, selected"],
        ].map(([token, cls, use]) => (
          <div key={token} className={clsx("rounded-ub-md bg-ub-surface p-4", cls)}>
            <p className="ub-ref text-ub-caption text-ub-text-primary">--ub-{token}</p>
            <p className="text-ub-caption text-ub-text-tertiary">{use}</p>
          </div>
        ))}
      </Demo>

      <Demo name="Dark theme palette" path="styles/tokens/primitives.css" description="Six values drive every dark surface. Dark mode is behind FEATURES.darkMode; change these to retheme it.">
        <Swatches tokens={["dark-canvas", "dark-surface-1", "dark-surface-2", "dark-surface-3", "dark-border", "dark-border-strong"]} />
      </Demo>

      <Demo name="Chart palette" path="styles/tokens/primitives.css" description="Categorical, in order. Use at most 6 series, then group the rest into Other.">
        <Swatches tokens={[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `chart-${n}`)} />
      </Demo>

      <Demo name="Verified contrast pairs" path="docs/unibexs-frontend-redesign-brief.md" description="Computed live from the tokens. Text needs 4.5:1 (3:1 at 24px+).">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PAIRS.map((p) => {
            const r = pairVars[p.fg] && pairVars[p.bg] ? contrast(pairVars[p.fg], pairVars[p.bg]) : null;
            return (
              <li key={p.note} className="overflow-hidden rounded-ub-lg border border-ub-border">
                <div className="flex h-20 items-center justify-center text-ub-heading-sm" style={{ background: `var(${p.bg})`, color: `var(${p.fg})` }}>
                  RM4,200
                </div>
                <div className="flex items-center justify-between gap-2 bg-ub-surface p-3">
                  <span className="text-ub-body-sm text-ub-text-secondary">{p.note}</span>
                  <span
                    className={clsx(
                      "ub-tabular inline-flex h-6 shrink-0 items-center gap-1 rounded-ub-sm border px-2 text-ub-label-sm",
                      p.use ? "border-ub-tone-success-border bg-ub-tone-success-bg text-ub-tone-success-text" : "border-ub-tone-danger-border bg-ub-tone-danger-bg text-ub-tone-danger-text",
                    )}
                  >
                    {p.use ? "Use" : "Avoid"} {r ? `${r.toFixed(2)}:1` : ""}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </Demo>
    </ShowcaseSection>
  );
}
