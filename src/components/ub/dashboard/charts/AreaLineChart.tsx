"use client";

import clsx from "clsx";
import { useId, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  /** "smooth" (default) curves between points; "linear" draws straight segments that never overshoot a value. */
  curve?: "smooth" | "linear";
  /** A dot on every point (otherwise only the hovered one). */
  markers?: boolean;
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
export default function AreaLineChart({ points, label, formatValue = (v) => v.toLocaleString(), heightClass = "h-56", curve = "smooth", markers = false, className }: AreaLineChartProps) {
  const reduce = useReducedMotion();
  // New data replays the draw-in (e.g. switching Daily / Weekly / Monthly).
  const dataKey = points.map((p) => `${p.key}:${p.value}`).join("|");
  const gradient = useId().replace(/:/g, "");
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(0, ...points.map((p) => p.value));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1] || 1;
  const base = H - PAD;
  const x = (i: number) => (points.length <= 1 ? LEFT + (W - LEFT) / 2 : LEFT + PAD + (i / (points.length - 1)) * (W - LEFT - PAD * 2));
  const y = (v: number) => base - (v / top) * (base - PAD);
  const xy = points.map((p, i) => [x(i), y(p.value)] as [number, number]);
  const line = !xy.length ? "" : curve === "linear" ? xy.map(([px, py], i) => `${i ? "L" : "M"}${px},${py}`).join(" ") : smooth(xy, base);
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
          {/* New data draws in from the start: a clip reveal, so the 2px non-scaling line stays exact. */}
          <clipPath id={`${gradient}-reveal`}>
            <motion.rect
              key={`reveal-${dataKey}`}
              x={0}
              y={-PAD}
              height={H + PAD * 2}
              initial={reduce ? false : { width: 0 }}
              animate={{ width: W + PAD }}
              transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
            />
          </clipPath>
          <g clipPath={`url(#${gradient}-reveal)`}>
            {area && <path d={area} fill={`url(#${gradient})`} />}
            {line && <path d={line} fill="none" className="stroke-ub-chart-cat-1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
          </g>
          {active != null && xy[active] && (
            <line x1={xy[active][0]} x2={xy[active][0]} y1={PAD} y2={base} className="stroke-ub-text-tertiary" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          )}
        </svg>
        {/* Markers as HTML so they stay round when the SVG stretches. */}
        {xy.map(([px, py], i) =>
          markers || active === i || points.length === 1 ? (
            <motion.span
              key={`${points[i].key}-${dataKey}`}
              aria-hidden="true"
              className={clsx(
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-ub-full border-2 border-ub-surface bg-ub-chart-cat-1 rtl:translate-x-1/2",
                active === i ? "h-3 w-3" : "h-2.5 w-2.5"
              )}
              style={{ left: `${(px / W) * 100}%`, top: `${(py / H) * 100}%` }}
              // Dots appear along the line as it draws.
              initial={reduce || active === i ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: reduce ? 0 : 0.6 * (i / Math.max(1, points.length - 1)) }}
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
          <span
            key={p.key}
            // Many points on a phone: every other label, always keeping the last.
            className={clsx(
              "absolute -translate-x-1/2 whitespace-nowrap text-ub-caption text-ub-text-secondary rtl:translate-x-1/2",
              points.length > 7 && i % 2 !== (points.length - 1) % 2 && "max-sm:hidden"
            )}
            style={{ left: `${(x(i) / W) * 100}%` }}
          >
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
