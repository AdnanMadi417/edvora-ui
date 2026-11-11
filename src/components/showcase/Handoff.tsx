"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import clsx from "clsx";
import { CATALOG, type CatalogCategory } from "components/ub/catalog";
import { Demo, ShowcaseSection } from "./Showcase";

const CATEGORIES: ("all" | CatalogCategory)[] = ["all", "core", "forms", "navigation", "feedback", "data", "brand", "icons"];

/** Searchable index of every component, generated from components/ub/catalog.ts. */
function ComponentIndex() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | CatalogCategory>("all");
  const q = query.trim().toLowerCase();
  const rows = Object.entries(CATALOG).filter(([name, e]) => {
    if (category !== "all" && e.category !== category) return false;
    if (!q) return true;
    return [name, e.useFor, e.avoid ?? "", ...e.usedIn].join(" ").toLowerCase().includes(q);
  });
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[240px] flex-1">
          <span className="sr-only">Search components</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or screen, e.g. Student profile"
            className="h-10 w-full rounded-ub-full border border-ub-border-control bg-ub-surface px-4 text-ub-body-sm text-ub-text-primary placeholder:text-ub-text-tertiary focus:border-ub-border-focus focus:outline-none focus:ring-1 focus:ring-ub-border-focus"
          />
        </label>
        <div role="radiogroup" aria-label="Category" className="flex flex-wrap gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={category === c}
              onClick={() => setCategory(c)}
              className={clsx(
                "h-8 rounded-ub-full px-3 text-ub-label-sm capitalize transition-colors duration-ub-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus",
                category === c ? "bg-ub-action-primary text-ub-action-primary-text" : "border border-ub-border text-ub-text-secondary hover:border-ub-border-hover",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <p className="mb-2 text-ub-caption text-ub-text-tertiary" aria-live="polite">
        {rows.length} of {Object.keys(CATALOG).length} components
      </p>
      <div className="overflow-x-auto rounded-ub-lg border border-ub-border">
        <table className="w-full min-w-[720px] text-start">
          <thead className="bg-ub-table-head text-ub-label-sm text-ub-text-secondary">
            <tr>
              <th className="h-11 px-4 text-start font-medium">Component</th>
              <th className="h-11 px-4 text-start font-medium">Use for</th>
              <th className="h-11 px-4 text-start font-medium">Where it&apos;s used</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, e]) => (
              <tr key={name} className="border-t border-ub-border align-top">
                <td className="px-4 py-3">
                  <a href={`#c-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`} className="rounded-ub-xs text-ub-label-md text-ub-text-link hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus">
                    {name}
                  </a>
                  <p className="text-ub-caption capitalize text-ub-text-tertiary">
                    {e.category}
                    {e.legacyOf ? " · legacy" : ""}
                  </p>
                </td>
                <td className="px-4 py-3 text-ub-body-sm text-ub-text-primary">
                  {e.useFor}
                  {e.legacyOf && <span className="block text-ub-caption text-ub-tone-warning-text">New screens: {e.legacyOf}</span>}
                </td>
                <td className="px-4 py-3 text-ub-body-sm text-ub-text-secondary">{e.usedIn.join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-ub-lg border border-ub-border">
      <div className="flex items-center justify-between border-b border-ub-border bg-ub-table-head px-4 py-2">
        <span className="text-ub-label-sm text-ub-text-secondary">{label}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(code).catch(() => undefined);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-ub-full px-3 text-ub-label-sm text-ub-text-link transition-colors duration-ub-fast hover:bg-ub-action-secondary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus"
        >
          {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre dir="ltr" className="overflow-x-auto bg-ub-surface-subtle p-4 text-ub-caption leading-5 text-ub-text-primary">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const STRUCTURE = `src/
  styles/
    globals.css              # the only stylesheet: Tailwind, then the files below, in cascade order
    base.css                 # element defaults (base layer) and touch tap targets
    tokens/
      primitives.css         # raw colors, spacing, radius, type, shadow, motion, dark palette
      semantic.css           # role tokens (light + dark), tone tokens
      utilities.css          # .ub-canvas-light, .ub-glass*, .ub-notch-*, .ub-tabular, .ub-ref
      legacy-dark.css        # dark bridge for screens not yet migrated
  components/ub/
    recipes.ts               # shared class recipes every component composes
    catalog.ts               # where each component is used (drives this guide's usage notes)
    core/                    # Button, TextButton, IconButton, ButtonGroup, PageContainer…
    forms/                   # Input, Checkbox, Radio, Toggle, Stepper, Combobox, FileUpload, legacy fields
    navigation/              # NavbarTop, Sidebar, NavbarBottom, Tabs, Breadcrumbs, Pagination, ContextMenu
    feedback/                # Alert, Toast, Tooltip, Modal, Drawer, ActionSheet, ProgressBar, EmptyState
    data/                    # Card, StatCard, Tag, DaysTag, Chip, Avatar, List, DataTable, table kit
    brand/                   # Logo, GlassPanel, NotchedCard, VerifiedBadge, VerificationStamp, ApplicationTracker
    icons/                   # Icon wrapper, SectionIconBadge
  config/
    applicationStages.ts     # stage list (pending confirmation, brief §11.1)
    featureFlags.ts          # FEATURES.darkMode and others
  app/(internal)/design-system/page.tsx   # this page`;

const IMPORTS = `import Button from "components/ub/core/buttons/Button";
import Input from "components/ub/forms/text/Input";
import DataTable from "components/ub/data/tables/DataTable";
import Modal from "components/ub/feedback/dialogs/Modal";
import ApplicationTracker from "components/ub/brand/ApplicationTracker";
import { STUDENT_PROFILE_STEPS } from "config/applicationStages";
import { card, cardPadding, focusRing } from "components/ub/recipes";`;

const TOKENS = `// Do: semantic tokens through the ub namespace
<div className="rounded-ub-lg border border-ub-border bg-ub-surface p-6">
  <h2 className="text-ub-heading-md text-ub-text-primary">Commission pending</h2>
  <p className="ub-tabular text-ub-data-xl text-ub-text-primary">RM12,400</p>
</div>

// Don't: raw hex, legacy palette, physical directions
<div className="rounded-xl bg-white bg-[#0348D1] text-slate-900 ml-4 text-left" />`;

const DARK = `# .env.local — turn the dark theme and its toggle on
NEXT_PUBLIC_ENABLE_DARK_MODE=true

/* src/styles/tokens/primitives.css — the only place dark colors live */
--ub-dark-canvas: var(--ub-navy-canvas);      /* e.g. #000000 for true black */
--ub-dark-surface-1: var(--ub-navy-surface-1);
--ub-dark-surface-2: var(--ub-navy-surface-2);
--ub-dark-surface-3: var(--ub-navy-surface-3);
--ub-dark-border: var(--ub-navy-border);
--ub-dark-border-strong: var(--ub-navy-border-strong);`;

const NEW_COMPONENT = `"use client";

import clsx from "clsx";
import { card, cardPadding, focusRing } from "components/ub/recipes";

export interface ExampleCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/** One-line doc comment: what it is, when to use it (brief §4.x). */
export default function ExampleCard({ title, children, className }: ExampleCardProps) {
  return (
    <section className={clsx(card, cardPadding, className)}>
      <h3 className="text-ub-heading-md text-ub-text-primary">{title}</h3>
      <div className="mt-2 text-ub-body-md text-ub-text-secondary">{children}</div>
    </section>
  );
}`;

const CHECKLIST = [
  "Only --ub-* tokens: no raw hex values, pixel radii or font names.",
  "One Primary button per view, labelled verb + object.",
  "Buttons are pills, tags are 6px, cards are radius 12 with a border and no resting shadow.",
  "Glass only on chrome and summaries; data, forms and long text on solid surfaces.",
  "No notch on product cards, tables, inputs or modals.",
  "At most one hero effect, and no glow in light mode.",
  "Tabular numerals for amounts, dates and KPIs; .ub-ref for IDs.",
  "Approved terms only: Advisor, Institution, Unibexs System, placed.",
  "Sentence case, no emoji, no lorem ipsum; date and currency formats correct.",
  "Correct in light and dark, and in LTR and RTL (logical properties only).",
  "Works at 375, 768, 1024 and 1440 widths and at 200% zoom.",
  "Keyboard only: tab order, visible focus, Esc closes overlays.",
  "Contrast passes; color is never the only signal.",
  "Reduced motion and reduced transparency respected.",
];

const OPEN_QUESTIONS: [string, string, string][] = [
  ["Application stages", "Blocker", "Built from config/applicationStages.ts; one-line change once confirmed."],
  ["Primary Blue #0348D1 vs #1A4EB5", "Pending", "#0348D1 is the token value."],
  ["Thmanya Sans web licence", "Pending", "System Arabic font fallback in --ub-font-arabic."],
  ["Badge name", "Pending", "Label kept in a VerifiedBadge prop."],
  ["Proof points (admin saving, Advisor count)", "Pending", "Not shown in product UI."],
  ["Iconoir vs Lucide", "Pending", "Everything goes through <Icon>; set is swappable."],
  ["Languages beyond EN / AR", "Pending", "Western numerals by default."],
  ["SVG logos", "Missing asset", "PNG logos used for now."],
  ["Dark theme colors", "Pending", "Behind FEATURES.darkMode; six palette values."],
];

export default function Handoff() {
  const [done, setDone] = useState<Set<number>>(new Set());
  return (
    <ShowcaseSection
      id="handoff"
      number="14"
      title="Developer handoff"
      description="Everything a developer needs to build Unibexs screens with this system: where things live, how to import them, the token rules, dark mode, a component template, the PR checklist and the open questions."
    >
      <Demo name="File structure" path="docs/unibexs-frontend-redesign-brief.md">
        <CodeBlock label="Brief §1.1" code={STRUCTURE} />
      </Demo>
      <Demo name="Component index" path="components/ub/catalog.ts" description="Every component, what it's for and which screens use it. Generated from the catalog that also drives the Where to use strip on each demo; add an entry when you add a component.">
        <ComponentIndex />
      </Demo>
      <Demo name="Importing components" path="components/ub/">
        <CodeBlock label="TypeScript" code={IMPORTS} />
      </Demo>
      <Demo name="Using tokens" path="tailwind.config.js" description="Components use semantic tokens only. In className, ban arbitrary hex values (bg-[#…]).">
        <CodeBlock label="TSX" code={TOKENS} />
      </Demo>
      <Demo name="Dark mode" path="config/featureFlags.ts" description="Off by default. One flag turns it on; six values change its colors.">
        <CodeBlock label="Config" code={DARK} />
      </Demo>
      <Demo name="Adding a component" path="components/ub/" description="Put it in the matching category folder, compose the shared recipes, support all states, and add a demo to this page.">
        <CodeBlock label="components/ub/data/ExampleCard.tsx" code={NEW_COMPONENT} />
      </Demo>
      <Demo name="PR acceptance checklist" path="docs/unibexs-frontend-redesign-brief.md" description="Brief §12, per screen. Ticks are local to this page.">
        <ul className="grid gap-2 md:grid-cols-2">
          {CHECKLIST.map((item, i) => {
            const checked = done.has(i);
            return (
              <li key={item}>
                <label className="flex cursor-pointer items-start gap-3 rounded-ub-md border border-ub-border p-3 transition-colors duration-ub-fast hover:border-ub-border-hover">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setDone((d) => {
                        const next = new Set(d);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        return next;
                      })
                    }
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--ub-blue-600)]"
                  />
                  <span className={clsx("text-ub-body-sm", checked ? "text-ub-text-tertiary line-through" : "text-ub-text-primary")}>{item}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </Demo>
      <Demo name="Open questions" path="docs/unibexs-frontend-redesign-brief.md" description="Brief §11. Each is kept as a token or config so the answer is a one-line change.">
        <div className="overflow-x-auto rounded-ub-lg border border-ub-border">
          <table className="w-full text-start">
            <thead className="bg-ub-table-head text-ub-label-sm text-ub-text-secondary">
              <tr>
                <th className="h-11 px-4 text-start font-medium">Question</th>
                <th className="h-11 px-4 text-start font-medium">Status</th>
                <th className="h-11 px-4 text-start font-medium">Handled by</th>
              </tr>
            </thead>
            <tbody>
              {OPEN_QUESTIONS.map(([q, status, how]) => (
                <tr key={q} className="border-t border-ub-border">
                  <td className="px-4 py-3 text-ub-body-sm text-ub-text-primary">{q}</td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "inline-flex h-6 items-center rounded-ub-sm border px-2 text-ub-label-sm",
                        status === "Blocker" ? "border-ub-tone-danger-border bg-ub-tone-danger-bg text-ub-tone-danger-text" : status === "Missing asset" ? "border-ub-tone-attention-border bg-ub-tone-attention-bg text-ub-tone-attention-text" : "border-ub-tone-warning-border bg-ub-tone-warning-bg text-ub-tone-warning-text",
                      )}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ub-body-sm text-ub-text-secondary">{how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Demo>
    </ShowcaseSection>
  );
}
