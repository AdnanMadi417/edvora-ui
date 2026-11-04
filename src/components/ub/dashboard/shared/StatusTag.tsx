import type { TagTone } from "components/ub/recipes";
import StageTag from "components/ub/data/badges/StageTag";
import Tag, { type TagSize } from "components/ub/data/badges/Tag";
import { STATUS_BADGE_TONE } from "components/ub/data/badges/StatusBadge";
import { getStage } from "config/applicationStages";
import { getStatusVariant } from "utils/getStatusVariant";

export interface StatusTagProps {
  /** A stage id from config/applicationStages.ts ("offer-received") or a status name/code ("Waiting for Payment"). */
  status: string;
  /** Preserve a domain-specific status tone; stages always use the stage map. */
  tone?: TagTone;
  /** Visible text; defaults to the stage label or the status as given. */
  label?: string;
  size?: TagSize;
  className?: string;
}

/**
 * Status label coloured from the one stage/status map: stage ids use the
 * stage hues (config/applicationStages.ts); other statuses get a tone from
 * getStatusVariant (approved → success, rejected → danger…). Always has text.
 */
export default function StatusTag({ status, label, tone, size = "sm", className }: StatusTagProps) {
  if (getStage(status)) return <StageTag stageId={status} size={size} className={className} />;
  return (
    <Tag tone={tone ?? STATUS_BADGE_TONE[getStatusVariant(status)]} size={size} className={className}>
      {label ?? status}
    </Tag>
  );
}
