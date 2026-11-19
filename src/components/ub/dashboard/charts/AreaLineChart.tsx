"use client";

import clsx from "clsx";
import { useId, useState, type KeyboardEvent } from "react";
import { niceTicks } from "./chartScale";
import { compactNumber } from "../types";

export interface AreaLinePoint {
  key: string;
  /** Axis label, e.g. "Jan". */
  label: string;
  value: number;
}

export interface AreaLineChartProps {
  points: AreaLinePoint[];
  /** Accessible name; also the hidden table's caption. */
  label: string;
  formatValue?: (value: number) => string;
  heightClass?: string;
  className?: string;
}

const W = 600;
const H = 220;
const LEFT = 40;
const PAD = 8;

/** Smooth path through the points (Catmull-Rom as cubic Béziers), never overshooting below zero. */
function smooth(xy: [number, number][], floor: number): string {
  if (xy.length === 1) return `M${xy[0][0]},${xy[0][1]}`;
  let d = `M${xy[0][0]},${xy[0][1]}`;
  for (let i = 0; i < xy.length - 1; i++) {
    const [p0, p1, p2, p3] = [xy[i - 1] ?? xy[i], xy[i], xy[i + 1], xy[i + 2] ?? xy[i + 1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, Math.min(floor, p1[1] + (p2[1] - p0[1]) / 6)];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, Math.min(floor, p2[1] - (p3[1] - p1[1]) / 6)];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/**
 * One series over time: a 2px line with a soft area under it in the brand
 * colour, recessive gridlines, one axis. Hover, or focus and use the arrow
 * keys, for a crosshair and the value; a hidden table has every point.
 */
export default function AreaLineChart({ points, label, formatValue = (v) => v.toLocaleString(), heightClass = "h-56", className }: AreaLineChartProps) {
  const gradient = useId().replace(/:/g, "");
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(0, ...points.map((p) => p.value));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1] || 1;
  const base = H - PAD;
  const x = (i: number) => (points.length <= 1 ? LEFT + (W - LEFT) / 2 : LEFT + PAD + (i / (points.length - 1)) * (W - LEFT - PAD * 2));
  const y = (v: number) => base - (v / top) * (base - PAD);
  const xy = points.map((p, i) => [x(i), y(p.value)] as [number, number]);
  const line = xy.length ? smooth(xy, base) : "";
  const area = xy.length > 1 ? `${line} L${xy[xy.length - 1][0]},${base} L${xy[0][0]},${base} Z` : "";
  const current = active != null ? points[active] : null;

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!points.length) return;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const step = event.key === "ArrowRight" ? (rtl ? -1 : 1) : event.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
    if (event.key === "Home") setActive(0);
    else if (event.key === "End") setActive(points.length - 1);
    else if (step) setActive((i) => Math.min(points.length - 1, Math.max(0, (i ?? (step > 0 ? -1 : points.length)) + step)));
    else return;
    event.preventDefault();
  };

  return (
    <figure className={clsx("min-w-0", className)}>
      <p aria-live="polite" className="ub-tabular mb-3 min-h-5 text-ub-caption text-ub-text-secondary">
        {current ? `${current.label}: ${formatValue(current.value)}` : ""}
      </p>
      <div
        role="group"
        aria-label={`${label}. Use the arrow keys to read each point.`}
        tabIndex={0}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
        onMouseLeave={() => setActive(null)}
        onMouseMove={(event) => {
          if (!points.length) return;
          const box = event.currentTarget.getBoundingClientRect();
          const rel = ((event.clientX - box.left) / box.width) * W;
          let best = 0;
          xy.forEach(([px], i) => {
            if (Math.abs(px - rel) < Math.abs(xy[best][0] - rel)) best = i;
          });
          setActive(best);
        }}
        className={clsx("relative w-full rounded-ub-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus", heightClass)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--ub-chart-cat-1)" }} stopOpacity={0.28} />
              <stop offset="100%" style={{ stopColor: "var(--ub-chart-cat-1)" }} stopOpacity={0} />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <line key={t} x1={LEFT} x2={W} y1={y(t)} y2={y(t)} className="stroke-ub-chart-grid" strokeWidth={1} vectorEffect="non-scaling-stroke" strokeDasharray={t === 0 ? undefined : "4 4"} />
          ))}
          {area && <path d={area} fill={`url(#${gradient})`} />}
          {line && <path d={line} fill="none" className="stroke-ub-chart-cat-1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
          {active != null && xy[active] && (
            <line x1={xy[active][0]} x2={xy[active][0]} y1={PAD} y2={base} className="stroke-ub-text-tertiary" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          )}
        </svg>
        {/* Markers as HTML so they stay round when the SVG stretches. */}
        {xy.map(([px, py], i) =>
          active === i || points.length === 1 ? (
            <span
              key={points[i].key}
              aria-hidden="true"
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-ub-full border-2 border-ub-surface bg-ub-chart-cat-1 rtl:translate-x-1/2"
              style={{ left: `${(px / W) * 100}%`, top: `${(py / H) * 100}%` }}
            />
          ) : null
        )}
        {ticks.map((t) => (
          <span key={t} aria-hidden="true" className="ub-tabular absolute start-0 -translate-y-1/2 text-ub-caption text-ub-text-tertiary" style={{ top: `${(y(t) / H) * 100}%` }}>
            {compactNumber(t)}
          </span>
        ))}
      </div>
      <div aria-hidden="true" className="relative mt-2 h-4">
        {points.map((p, i) => (
          <span key={p.key} className="absolute -translate-x-1/2 whitespace-nowrap text-ub-caption text-ub-text-secondary rtl:translate-x-1/2" style={{ left: `${(x(i) / W) * 100}%` }}>
            {p.label}
          </span>
        ))}
      </div>
      {/* A table ignores the 1px sr-only size; the wrapper hides it without widening the page. */}
      <div className="sr-only">
        <table>
          <caption>{label}</caption>
          <tbody>
            {points.map((p) => (
              <tr key={p.key}>
                <th scope="row">{p.label}</th>
                <td>{formatValue(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
