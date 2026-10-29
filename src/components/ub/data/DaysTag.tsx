import React from "react";
import { CalendarClock, Clock } from "lucide-react";
import Tag, { type TagHue, type TagSize } from "components/ub/data/Tag";

export type DaysTagMode = "inStage" | "deadline";
export type DaysLevel = "grey" | "amber" | "orange" | "red";

/**
 * Days tag thresholds (brief §4.3). Kept in one place so product can retune
 * them with a one-line change.
 * - inStage: days spent in the current stage; each value is where that level starts.
 * - deadline: days until the deadline; each value is where that level starts
 *   counting down. Anything below `orangeFrom` (due today or overdue) is red.
 */
export const DAYS_TAG_THRESHOLDS = {
  inStage: { amberFrom: 4, orangeFrom: 8, redFrom: 15 },
  deadline: { greyFrom: 15, amberFrom: 8, orangeFrom: 1 },
} as const;

export type DaysTagThresholds = {
  inStage: { amberFrom: number; orangeFrom: number; redFrom: number };
  deadline: { greyFrom: number; amberFrom: number; orangeFrom: number };
};

/** Pure: urgency level for a day count. `days` for deadlines is days remaining (negative = overdue). */
export function getDaysLevel(mode: DaysTagMode, days: number, thresholds: DaysTagThresholds = DAYS_TAG_THRESHOLDS): DaysLevel {
  if (mode === "inStage") {
    const t = thresholds.inStage;
    if (days >= t.redFrom) return "red";
    if (days >= t.orangeFrom) return "orange";
    if (days >= t.amberFrom) return "amber";
    return "grey";
  }
  const t = thresholds.deadline;
  if (days >= t.greyFrom) return "grey";
  if (days >= t.amberFrom) return "amber";
  if (days >= t.orangeFrom) return "orange";
  return "red";
}

const plural = (n: number) => `${n} ${n === 1 ? "day" : "days"}`;

/** Pure: "5 days in stage", "Due in 3 days", "Due today", "Overdue by 2 days". */
export function getDaysLabel(mode: DaysTagMode, days: number): string {
  if (mode === "inStage") return `${plural(Math.max(0, days))} in stage`;
  if (days === 0) return "Due today";
  if (days > 0) return `Due in ${plural(days)}`;
  return `Overdue by ${plural(Math.abs(days))}`;
}

const LEVEL_HUE: Record<DaysLevel, TagHue> = { grey: "grey", amber: "amber", orange: "orange", red: "red" };

export interface DaysTagProps {
  mode: DaysTagMode;
  /** Whole days. inStage: days in the stage. deadline: days until due (0 = today, negative = overdue). */
  days: number;
  size?: TagSize;
  /** Override the default thresholds (e.g. per Institution). */
  thresholds?: DaysTagThresholds;
  className?: string;
}

export default function DaysTag({ mode, days, size, thresholds, className }: DaysTagProps) {
  const whole = Math.trunc(days);
  const level = getDaysLevel(mode, whole, thresholds);
  const Icon = mode === "inStage" ? Clock : CalendarClock;
  return (
    <Tag hue={LEVEL_HUE[level]} size={size} icon={<Icon />} data-level={level} className={`ub-tabular ${className ?? ""}`}>
      {getDaysLabel(mode, whole)}
    </Tag>
  );
}
