import type { ReactNode } from "react";
import clsx from "clsx";
import { CircleAlert, CircleCheck, Clock, FileText, Upload } from "lucide-react";
import Tag from "components/ub/data/badges/Tag";
import type { TagTone } from "components/ub/recipes";
import ProgressBar from "components/ub/feedback/states/ProgressBar";

/**
 * Document states (brief §6 Student profile: Uploading, Uploaded, Verified,
 * Needs replacing) plus Missing for a required file not uploaded yet.
 */
export type FileRowState = "missing" | "uploading" | "uploaded" | "verified" | "needs-replacing";

export const FILE_ROW_STATES: Record<FileRowState, { label: string; tone: TagTone; icon: typeof FileText }> = {
  missing: { label: "Missing", tone: "neutral", icon: Upload },
  uploading: { label: "Uploading", tone: "info", icon: Clock },
  uploaded: { label: "Uploaded", tone: "brand", icon: FileText },
  verified: { label: "Verified", tone: "success", icon: CircleCheck },
  "needs-replacing": { label: "Needs replacing", tone: "danger", icon: CircleAlert },
};

export interface FileRowProps {
  /** Document name, e.g. "Passport". */
  name: string;
  state: FileRowState;
  /** Metadata line: upload date, file size, who uploaded it. */
  meta?: ReactNode;
  /** Why it needs replacing (shown for needs-replacing). */
  reason?: ReactNode;
  /** 0–100 while uploading; omit for an indeterminate bar. */
  progress?: number;
  /** End-side actions: IconButtons (download, view) or a secondary Button (Replace, Upload). */
  actions?: ReactNode;
  /** Overrides the state label, e.g. "In review". */
  stateLabel?: string;
  /** Renders as an <li>. Default true; set false inside a non-list container. */
  asListItem?: boolean;
  className?: string;
}

/**
 * One file in a checklist: state icon, name, metadata, state tag with text,
 * optional reason and actions. Status changes are announced politely.
 */
export default function FileRow({ name, state, meta, reason, progress, actions, stateLabel, asListItem = true, className }: FileRowProps) {
  const { label, tone, icon: Icon } = FILE_ROW_STATES[state];
  const Root = asListItem ? "li" : "div";
  const attention = state === "needs-replacing";

  return (
    <Root className={clsx("flex min-w-0 flex-col gap-3 py-4 sm:flex-row sm:items-center", className)}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          aria-hidden="true"
          className={clsx(
            "grid h-10 w-10 shrink-0 place-items-center rounded-ub-md border",
            attention ? "border-ub-tone-danger-border bg-ub-tone-danger-bg text-ub-tone-danger-text" : state === "verified" ? "border-ub-tone-success-border bg-ub-tone-success-bg text-ub-tone-success-text" : "border-ub-border bg-ub-surface-subtle text-ub-icon",
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="min-w-0 truncate text-ub-label-md text-ub-text-primary">{name}</p>
            <span aria-live="polite">
              <Tag tone={tone} size="sm">
                {stateLabel ?? label}
              </Tag>
            </span>
          </div>
          {meta && <p className="ub-tabular mt-0.5 text-ub-caption text-ub-text-tertiary">{meta}</p>}
          {attention && reason && <p className="mt-1 text-ub-body-sm text-ub-tone-danger-text">{reason}</p>}
          {state === "uploading" && <ProgressBar className="mt-2" value={progress} indeterminate={progress === undefined} showValue={false} aria-label={`Uploading ${name}`} />}
        </div>
      </div>
      {/* Below sm the actions wrap under the name, so indent them past the 40px icon + 12px gap. */}
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 ps-[52px] sm:ps-0">{actions}</div>}
    </Root>
  );
}
