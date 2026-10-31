import { AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { getStage } from "config/applicationStages";
import Tag, { type TagSize } from "./Tag";

export interface StageTagProps {
  /** Stage id from config/applicationStages.ts, e.g. "offer-received". */
  stageId: string;
  /** Shows the separate "Action needed" flag next to the stage (brief §4.3: a flag, not a stage). */
  actionNeeded?: boolean;
  size?: TagSize;
  /** Leading 6px dot in the stage color. Default true. */
  dot?: boolean;
  className?: string;
}

/**
 * Application stage as a tag, colored from the stage config (brief §4.3).
 * Use it wherever a stage appears: Application Tracker rows and board cards,
 * the Student profile header, notifications and dashboards. Never hard-code
 * stage labels or colors: the stage list is pending confirmation (§11.1).
 */
export default function StageTag({ stageId, actionNeeded = false, size = "md", dot = true, className }: StageTagProps) {
  const stage = getStage(stageId);
  const label = stage?.label ?? stageId;
  const color = !stage ? { tone: "neutral" as const } : stage.hue === "success" ? { tone: "success" as const } : { hue: stage.hue };

  return (
    <span className={clsx("inline-flex flex-wrap items-center gap-1.5", className)}>
      <Tag {...color} size={size} dot={dot}>
        {label}
      </Tag>
      {actionNeeded && (
        <Tag tone="attention" size={size} icon={<AlertTriangle className="h-3 w-3" aria-hidden />}>
          Action needed
        </Tag>
      )}
    </span>
  );
}
