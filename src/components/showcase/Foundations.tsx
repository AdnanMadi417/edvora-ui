"use client";

import { useState } from "react";
import clsx from "clsx";
import { Play } from "lucide-react";
import { Demo, ShowcaseSection, Variant } from "./Showcase";

const SPACE: [string, number][] = [["0-5", 2], ["1", 4], ["2", 8], ["3", 12], ["4", 16], ["5", 20], ["6", 24], ["8", 32], ["10", 40], ["12", 48], ["16", 64], ["20", 80], ["24", 96], ["32", 128]];
// Full class names so Tailwind's JIT can see them.
const RADII: [string, string, string][] = [
  ["xs", "rounded-ub-xs", "Checkboxes"],
  ["sm", "rounded-ub-sm", "Tags, badges"],
  ["md", "rounded-ub-md", "Inputs, menu items"],
  ["lg", "rounded-ub-lg", "Cards, tables"],
  ["xl", "rounded-ub-xl", "Modals, drawers"],
  ["2xl", "rounded-ub-2xl", "Marketing cards"],
  ["full", "rounded-ub-full", "Buttons, avatars"],
];
const SHADOWS: [string, string, string][] = [
  ["xs", "shadow-ub-xs", "Secondary button hover"],
  ["sm", "shadow-ub-sm", "Interactive card hover"],
  ["md", "shadow-ub-md", "Dropdowns, popovers"],
  ["lg", "shadow-ub-lg", "Toasts, drawers"],
  ["xl", "shadow-ub-xl", "Modals"],
];
const MOTION: [string, number, string][] = [
  ["duration-fast", 120, "Hover, press, toggle"],
  ["duration-base", 200, "Dropdowns, tooltips, tabs"],
  ["duration-slow", 320, "Modals, drawers, tracker step"],
  ["duration-deliberate", 480, "Page transitions, milestones"],
];
const EASING: [string, string][] = [
  ["ease-standard", "cubic-bezier(.2,0,0,1)"],
  ["ease-enter", "cubic-bezier(0,0,.2,1)"],
  ["ease-exit", "cubic-bezier(.4,0,1,1)"],
];
const BREAKPOINTS = [
  ["xs", "0", "4", "16", "16"],
  ["sm", "640", "8", "24", "16"],
  ["md", "768", "8", "32", "24"],
  ["lg", "1024", "12", "32", "24"],
  ["xl", "1280", "12", "40", "24"],
  ["2xl", "1536", "12", "48", "32"],
];

function MotionDemo({ name, ms, easing }: { name: string; ms: number; easing: string }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOn((o) => !o)}
      className="group w-full rounded-ub-md border border-ub-border p-3 text-start transition-colors duration-ub-fast hover:border-ub-border-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus"
    >
      <span className="flex items-center justify-between text-ub-label-sm text-ub-text-primary">
        {name} <Play className="h-3.5 w-3.5 text-ub-icon-interactive" aria-hidden />
      </span>
      <span className="mt-3 block h-2 rounded-ub-full bg-ub-disabled">
        <span
          className="block h-2 w-6 rounded-ub-full bg-ub-action-primary motion-reduce:transition-none"
          style={{ transform: on ? "translateX(calc(100% * 8))" : "translateX(0)", transition: `transform ${ms}ms ${easing}` }}
        />
      </span>
    </button>
  );
}

export default function Foundations() {
  return (
    <ShowcaseSection
      id="foundations"
      number="03"
      title="Foundations"
      description="The spacing, corner radius, borders, elevation, surfaces, motion and screen sizes that keep every screen consistent. A 4px base with an 8px rhythm."
    >
      <Demo name="Spacing" path="styles/tokens/primitives.css" description="Related items 4–8 · within a group 12–16 · between groups 24–32 · between sections 48–96.">
        <ul className="space-y-2">
          {SPACE.map(([token, px]) => (
            <li key={token} className="flex items-center gap-4">
              <code className="ub-ref w-24 shrink-0 text-ub-caption text-ub-text-primary">space-{token}</code>
              <span className="ub-tabular w-12 shrink-0 text-end text-ub-caption text-ub-text-tertiary">{px}px</span>
              <span className="h-3 rounded-ub-xs bg-ub-action-primary" style={{ width: `var(--ub-space-${token})` }} />
            </li>
          ))}
        </ul>
      </Demo>

      <Demo name="Corner radius" path="tailwind.config.js" className="flex flex-wrap gap-6">
        {RADII.map(([r, cls, use]) => (
          <div key={r} className="w-24 text-center">
            <div className={clsx("mx-auto h-16 w-16 border-2 border-ub-border-focus bg-ub-selected", cls)} />
            <p className="ub-ref mt-2 text-ub-label-sm text-ub-text-primary">radius-{r}</p>
            <p className="text-ub-caption text-ub-text-tertiary">{use}</p>
          </div>
        ))}
      </Demo>

      <Demo name="Borders" path="tailwind.config.js" className="flex flex-wrap gap-6">
        {[
          ["1px", "border", "Default, dividers, cards, inputs"],
          ["1.5px", "border-ub-strong", "Outline buttons, dropzones"],
          ["2px", "border-2", "Focus, selected, current step"],
        ].map(([w, cls, use]) => (
          <div key={w} className={clsx("w-48 rounded-ub-md border-ub-border-focus bg-ub-surface p-4", cls)}>
            <p className="ub-tabular text-ub-label-md text-ub-text-primary">{w}</p>
            <p className="text-ub-caption text-ub-text-tertiary">{use}</p>
          </div>
        ))}
      </Demo>

      <Demo name="Elevation" path="tailwind.config.js" description="Navy-tinted shadows for floating layers only. Resting cards use a border, not a shadow." className="flex flex-wrap gap-6 bg-ub-surface-subtle">
        {SHADOWS.map(([s, cls, use]) => (
          <div key={s} className={clsx("w-36 rounded-ub-lg bg-ub-surface p-4", cls)}>
            <p className="ub-ref text-ub-label-sm text-ub-text-primary">shadow-{s}</p>
            <p className="text-ub-caption text-ub-text-tertiary">{use}</p>
          </div>
        ))}
      </Demo>

      <Demo name="The notch" path="styles/tokens/utilities.css" description="A 45° cut at the bottom-end corner (mirrors in RTL). Marketing cards, milestones, the Verified Badge and feature cards only; never product cards, tables, inputs or modals." className="flex flex-wrap gap-6">
        {(
          [
            ["ub-notch-sm", "sm · 12"],
            ["ub-notch-md", "md · 24"],
            ["ub-notch-lg", "lg · 40"],
          ] as const
        ).map(([cls, label]) => (
          <div key={cls} className="text-center">
            <div className={clsx("h-28 w-40 rounded-ub-lg bg-ub-action-primary", cls)} />
            <p className="ub-ref mt-2 text-ub-label-sm text-ub-text-primary">{label}</p>
          </div>
        ))}
      </Demo>

      <Demo name="Surfaces" path="styles/tokens/utilities.css" description="Glass for chrome and summaries; solid white for tables, forms and long text. Glass falls back to solid with reduced transparency.">
        <div className="ub-canvas-light grid gap-4 rounded-ub-lg p-6 sm:grid-cols-3">
          <Variant label=".ub-canvas-light + .ub-glass-light">
            <div className="ub-glass-light rounded-ub-xl p-4 text-ub-body-sm text-ub-text-primary">Stat cards, sidebar, top bar</div>
          </Variant>
          <Variant label=".ub-glass-light-strong">
            <div className="ub-glass-light-strong rounded-ub-xl p-4 text-ub-body-sm text-ub-text-primary">Sticky headers, drawers</div>
          </Variant>
          <Variant label="Solid surface">
            <div className="rounded-ub-xl border border-ub-border bg-ub-surface p-4 text-ub-body-sm text-ub-text-primary">Tables, forms, long text</div>
          </Variant>
        </div>
        <div data-ub-theme="dark" className="mt-4 grid gap-4 rounded-ub-lg bg-ub-canvas p-6 sm:grid-cols-2">
          <Variant label=".ub-glass (dark sections)">
            <div className="ub-glass rounded-ub-xl p-4 text-ub-body-sm text-ub-text-primary">Never on data tables</div>
          </Variant>
          <Variant label="Glow (dark only)">
            <span className="inline-flex h-10 items-center rounded-ub-full bg-ub-action-primary px-4 text-ub-label-md text-ub-action-primary-text shadow-ub-glow">Primary on navy</span>
          </Variant>
        </div>
      </Demo>

      <Demo name="Motion" path="tailwind.config.js" description="Click to play. Nothing loops; with reduced motion, changes are instant." className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MOTION.map(([name, ms, use]) => (
          <div key={name}>
            <MotionDemo name={`${name} · ${ms}ms`} ms={ms} easing="cubic-bezier(.2,0,0,1)" />
            <p className="mt-1 text-ub-caption text-ub-text-tertiary">{use}</p>
          </div>
        ))}
        {EASING.map(([name, curve]) => (
          <div key={name}>
            <MotionDemo name={name} ms={480} easing={curve} />
            <p className="ub-ref mt-1 text-ub-caption text-ub-text-tertiary">{curve}</p>
          </div>
        ))}
      </Demo>

      <Demo name="Screen breakpoints and grid" path="docs/unibexs-frontend-redesign-brief.md" description="Max widths: dashboards 1440 · forms 720 · reading 680 · marketing 1200 (1320 at 2xl).">
        <div className="overflow-x-auto rounded-ub-lg border border-ub-border">
          <table className="w-full text-start">
            <thead className="bg-ub-table-head text-ub-label-sm text-ub-text-secondary">
              <tr>
                {["Name", "Min width", "Columns", "Margin", "Gutter"].map((h) => (
                  <th key={h} className="h-11 px-4 text-start font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BREAKPOINTS.map((row) => (
                <tr key={row[0]} className="border-t border-ub-border">
                  {row.map((cell, i) => (
                    <td key={i} className={clsx("ub-tabular h-12 px-4 text-ub-body-sm", i === 0 ? "ub-ref text-ub-text-primary" : "text-ub-text-secondary")}>
                      {i > 0 && i !== 2 ? `${cell}px` : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Demo>
    </ShowcaseSection>
  );
}
