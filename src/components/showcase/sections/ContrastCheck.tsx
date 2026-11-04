"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import clsx from "clsx";

type Kind = "text" | "ui" | "exempt";
interface Pair {
  fg: string;
  bg: string;
  /** Background the bg itself sits on, for translucent fills (defaults to canvas). */
  under?: string;
  kind: Kind;
  label: string;
}

const SURFACES = ["--ub-bg-canvas", "--ub-bg-surface", "--ub-bg-surface-raised", "--ub-bg-overlay"];
const TEXT = ["--ub-text-primary", "--ub-text-secondary", "--ub-text-tertiary", "--ub-text-link"];
const STATUS = ["success", "warning", "danger", "info"];
const HUES = ["sky", "indigo", "orange", "plum", "amber", "red", "pink", "teal", "grey"];

/** Every text/background pair the dark guide defines, plus UI boundaries. */
export const PAIRS: Pair[] = [
  ...TEXT.flatMap((fg) => SURFACES.map((bg) => ({ fg, bg, kind: "text" as const, label: `${fg} on ${bg}` }))),
  ...SURFACES.map((bg) => ({ fg: "--ub-text-disabled", bg, kind: "exempt" as const, label: `--ub-text-disabled on ${bg}` })),
  { fg: "--ub-text-selected", bg: "--ub-bg-selected", kind: "text", label: "selected label on --ub-bg-selected" },
  { fg: "--ub-text-primary", bg: "--ub-bg-selected", kind: "text", label: "--ub-text-primary on --ub-bg-selected" },
  { fg: "--ub-action-primary-text", bg: "--ub-action-primary-bg", kind: "text", label: "primary button label on fill" },
  { fg: "--ub-action-primary-text", bg: "--ub-action-primary-bg-pressed", kind: "text", label: "primary button label, pressed" },
  { fg: "--ub-action-secondary-text", bg: "--ub-bg-surface", kind: "text", label: "secondary button label on surface" },
  { fg: "--ub-action-secondary-text", bg: "--ub-action-ghost-hover", under: "--ub-bg-surface", kind: "text", label: "secondary/tertiary label on hover fill" },
  { fg: "--ub-action-inverse-text", bg: "--ub-action-inverse-bg", kind: "text", label: "inverse button label on fill" },
  { fg: "--ub-action-disabled-text", bg: "--ub-action-disabled-bg", under: "--ub-bg-surface", kind: "exempt", label: "disabled button label" },
  { fg: "--ub-text-on-action", bg: "--ub-success-600", kind: "text", label: "positive button label" },
  { fg: "--ub-text-on-action", bg: "--ub-danger-600", kind: "text", label: "destructive button / notification badge" },
  { fg: "--ub-count-text", bg: "--ub-count-bg", kind: "text", label: "count badge" },
  { fg: "--ub-tab-active-text", bg: "--ub-bg-surface", kind: "text", label: "active tab label" },
  { fg: "--ub-brand-subtle-text", bg: "--ub-brand-subtle-bg", kind: "text", label: "avatar initials / callout title" },
  { fg: "--ub-delta-up-text", bg: "--ub-delta-up-bg", kind: "text", label: "StatCard delta (up)" },
  { fg: "--ub-text-on-action", bg: "--ub-bg-toast", kind: "text", label: "toast text" },
  { fg: "--ub-text-on-action", bg: "--ub-bg-tooltip", kind: "text", label: "tooltip text" },
  ...STATUS.map((r) => ({ fg: `--ub-${r}-text`, bg: `--ub-${r}-bg`, kind: "text" as const, label: `${r} alert text` })),
  ...HUES.map((h) => ({ fg: `--ub-tag-${h}-text`, bg: `--ub-tag-${h}-bg`, kind: "text" as const, label: `${h} tag` })),
  { fg: "--ub-border-control", bg: "--ub-bg-surface", kind: "ui", label: "form control border on surface" },
  { fg: "--ub-border-focus", bg: "--ub-bg-canvas", kind: "ui", label: "focus ring on canvas" },
  { fg: "--ub-border-focus", bg: "--ub-bg-surface", kind: "ui", label: "focus ring on surface" },
  { fg: "--ub-action-primary-bg", bg: "--ub-bg-surface", kind: "ui", label: "primary button edge on surface" },
  { fg: "--ub-toggle-off", bg: "--ub-bg-surface", kind: "ui", label: "toggle track (off) on surface" },
];

type RGBA = [number, number, number, number];

/** Parses rgb()/rgba() and color(srgb …) as returned by getComputedStyle. */
function parseColor(value: string): RGBA | null {
  const rgb = value.match(/rgba?\(([^)]+)\)/);
  if (rgb) {
    const [r, g, b, a = "1"] = rgb[1].split(/[\s,/]+/).filter(Boolean);
    return [Number(r), Number(g), Number(b), Number(a)];
  }
  const srgb = value.match(/color\(srgb ([^)]+)\)/);
  if (srgb) {
    const parts = srgb[1].split(/[\s/]+/).filter(Boolean).map(Number);
    return [parts[0] * 255, parts[1] * 255, parts[2] * 255, parts[3] ?? 1];
  }
  return null;
}

const over = (top: RGBA, base: RGBA): RGBA => {
  const a = top[3];
  return [top[0] * a + base[0] * (1 - a), top[1] * a + base[1] * (1 - a), top[2] * a + base[2] * (1 - a), 1];
};

const lum = ([r, g, b]: RGBA) => {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

export const ratio = (a: RGBA, b: RGBA) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

export interface ContrastRow extends Pair {
  ratio: number | null;
  pass: boolean;
  fgHex: string;
  bgHex: string;
}

const hex = (c: RGBA) => "#" + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();

/** Resolves each token through a probe element so var() and color-mix() compute like on screen. */
export function computeContrast(root: HTMLElement): ContrastRow[] {
  const probe = document.createElement("span");
  root.appendChild(probe);
  const read = (token: string): RGBA | null => {
    probe.style.color = `var(${token})`;
    return parseColor(getComputedStyle(probe).color);
  };
  const canvas = read("--ub-bg-canvas") ?? [255, 255, 255, 1];
  const rows = PAIRS.map((pair) => {
    const base = pair.under ? read(pair.under) ?? canvas : canvas;
    const bgRaw = read(pair.bg);
    const fgRaw = read(pair.fg);
    if (!bgRaw || !fgRaw) return { ...pair, ratio: null, pass: false, fgHex: "?", bgHex: "?" };
    const bg = over(bgRaw, over(base, canvas));
    const fg = over(fgRaw, bg);
    const r = ratio(fg, bg);
    const min = pair.kind === "ui" ? 3 : 4.5;
    return { ...pair, ratio: r, pass: pair.kind === "exempt" || r >= min, fgHex: hex(fg), bgHex: hex(bg) };
  });
  probe.remove();
  return rows;
}

/** Live table of every text/background pair in the current theme. */
export default function ContrastCheck() {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [rows, setRows] = useState<ContrastRow[]>([]);

  useEffect(() => {
    // Wait a frame so a theme switch has applied before measuring.
    const id = requestAnimationFrame(() => ref.current && setRows(computeContrast(ref.current)));
    return () => cancelAnimationFrame(id);
  }, [resolvedTheme]);

  const failures = rows.filter((r) => !r.pass).length;
  return (
    <div ref={ref}>
      <p className="mb-3 text-ub-body-sm text-ub-text-secondary" aria-live="polite">
        {rows.length ? `${rows.length} pairs in the ${resolvedTheme ?? "current"} theme · ${failures === 0 ? "all pass" : `${failures} failing`}` : "Measuring…"}
      </p>
      <div className="overflow-x-auto rounded-ub-lg border border-ub-border">
        <table className="w-full min-w-[640px] text-start" data-contrast-table>
          <thead className="bg-ub-table-head text-ub-label-sm text-ub-text-secondary">
            <tr>
              <th className="h-11 px-4 text-start font-medium">Pair</th>
              <th className="h-11 px-4 text-start font-medium">Sample</th>
              <th className="h-11 px-4 text-end font-medium">Ratio</th>
              <th className="h-11 px-4 text-start font-medium">Needs</th>
              <th className="h-11 px-4 text-start font-medium">Result</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-ub-border" data-pass={r.pass}>
                <td className="px-4 py-2 text-ub-body-sm text-ub-text-primary">{r.label}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex h-7 items-center rounded-ub-sm border border-ub-border px-2 text-ub-label-sm" style={{ background: r.bgHex, color: r.fgHex }}>
                    Aa {r.fgHex} / {r.bgHex}
                  </span>
                </td>
                <td className="ub-tabular px-4 py-2 text-end text-ub-body-sm text-ub-text-primary">{r.ratio ? `${r.ratio.toFixed(2)}:1` : "—"}</td>
                <td className="px-4 py-2 text-ub-body-sm text-ub-text-secondary">{r.kind === "ui" ? "3:1 UI" : r.kind === "exempt" ? "exempt" : "4.5:1 text"}</td>
                <td className="px-4 py-2">
                  <span className={clsx("inline-flex h-6 items-center rounded-ub-sm border px-2 text-ub-label-sm", r.pass ? "border-ub-tone-success-border bg-ub-tone-success-bg text-ub-tone-success-text" : "border-ub-tone-danger-border bg-ub-tone-danger-bg text-ub-tone-danger-text")}>
                    {r.kind === "exempt" ? "Exempt" : r.pass ? "Pass" : "Fail"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
