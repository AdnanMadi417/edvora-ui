/**
 * One segment style for every dashboard chart: each part is its own piece with
 * small rounded corners and a surface gap of the same width before the next
 * piece (never a grey track showing through the gap).
 *
 * HTML bars use SEGMENT_CLASS on each piece and SEGMENT_ROW_CLASS on the row.
 * SVG rings (donut, gauge, radial rings) use ringSegmentPath.
 */

/** Each stacked/HTML bar piece: 4px corners. */
export const SEGMENT_CLASS = "h-full min-w-1 rounded-ub-xs";
/** The row of pieces: 2px surface gap, no track behind it. */
export const SEGMENT_ROW_CLASS = "flex w-full gap-0.5";
/** Empty remainder of a bar (e.g. a shorter period on a shared scale). */
export const SEGMENT_TRACK_CLASS = "h-full min-w-0 flex-1 rounded-ub-xs bg-ub-chart-track";

/** Corner radius and gap for SVG ring segments, in viewBox units (a 100-unit box). */
export const RING_CORNER = 2;
export const RING_GAP = 1.6;

const point = (cx: number, cy: number, r: number, angle: number) =>
  `${(cx + r * Math.sin(angle)).toFixed(3)} ${(cy - r * Math.cos(angle)).toFixed(3)}`;

export interface RingSegment {
  cx?: number;
  cy?: number;
  rIn: number;
  rOut: number;
  /** Start and end angles in radians, clockwise from 12 o'clock. */
  a0: number;
  a1: number;
  /** Gap left at the start / end of this piece (0 where it meets nothing). */
  gapStart?: number;
  gapEnd?: number;
  corner?: number;
}

/**
 * A ring segment as a filled path, shrunk by `corner` on every side so that
 * stroking it with strokeWidth = corner × 2 and round joins gives rounded
 * corners at the true size. Draw with: fill + stroke in the same colour,
 * strokeWidth={RING_CORNER * 2}, strokeLinejoin="round".
 */
export function ringSegmentPath({ cx = 50, cy = 50, rIn, rOut, a0, a1, gapStart = RING_GAP, gapEnd = RING_GAP, corner = RING_CORNER }: RingSegment) {
  const ro = rOut - corner;
  const ri = rIn + corner;
  // The same gap width (not angle) on the inner and outer edge.
  const span = (r: number) => {
    const s = a0 + (gapStart / 2 + corner) / r;
    const e = a1 - (gapEnd / 2 + corner) / r;
    // Keep a sliver so a tiny part still shows as a small rounded mark.
    return e - s > 0.0005 ? [s, e] : [(a0 + a1) / 2 - 0.00025, (a0 + a1) / 2 + 0.00025];
  };
  const [o0, o1] = span(ro);
  const [i0, i1] = span(ri);
  const large = (s: number, e: number) => (e - s > Math.PI ? 1 : 0);
  return [
    `M ${point(cx, cy, ro, o0)}`,
    `A ${ro} ${ro} 0 ${large(o0, o1)} 1 ${point(cx, cy, ro, o1)}`,
    `L ${point(cx, cy, ri, i1)}`,
    `A ${ri} ${ri} 0 ${large(i0, i1)} 0 ${point(cx, cy, ri, i0)}`,
    "Z",
  ].join(" ");
}

/** Props for a <path> drawn from ringSegmentPath. */
export const ringSegmentStroke = { strokeWidth: RING_CORNER * 2, strokeLinejoin: "round" as const };
