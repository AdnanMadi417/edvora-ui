"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import Avatar from "components/ub/data/media/Avatar";
import Button from "components/ub/core/buttons/Button";
import RefId from "components/ub/core/typography/RefId";
import AppDate from "components/ub/data/formatting/AppDate";
import DaysTag from "components/ub/data/badges/DaysTag";
import StageTag from "components/ub/data/badges/StageTag";
import Tag from "components/ub/data/badges/Tag";
import Skeleton from "components/ub/feedback/states/Skeleton";
import ActionsDropdown from "components/ub/navigation/menus/ActionsDropdown";
import { card } from "components/ub/recipes";

export interface HeaderAction {
  /** Verb + object, e.g. "Upload documents". */
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface OverflowAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  /** Destructive items (Withdraw application) read red. */
  destructive?: boolean;
}

export interface ApplicationHeaderProps {
  studentName: string;
  photoUrl?: string | null;
  /** Reference ID (UBX-…), shown with the ss02 set. Hidden when the API has none. */
  reference?: string | null;
  /** Stage tag id from config/applicationStages.ts; `stageLabel` is shown when it's unknown. */
  stageId?: string | null;
  stageLabel?: string | null;
  /** Shows the "Action needed" flag next to the stage. */
  actionNeeded?: boolean;
  /** Days in the current stage. Omitted when the API doesn't provide it. */
  daysInStage?: number | null;
  institution?: string | null;
  programme?: string | null;
  /** Intake date (ISO). */
  intake?: string | null;
  /** The ONE Primary button: the next action for this viewer. Hidden below md; the page's sticky bar shows it there. */
  primaryAction?: HeaderAction | null;
  /** Everything else, in the overflow menu. */
  overflowActions?: OverflowAction[];
  /** Back link / breadcrumbs above the header row. */
  breadcrumbs?: ReactNode;
  loading?: boolean;
  /** Heading level for the name. Default h1; use h3 when the header is embedded in another page. */
  titleAs?: "h1" | "h2" | "h3";
  className?: string;
}

/**
 * Student profile header (brief §6): avatar, name, reference ID, stage tag,
 * Days tag, Institution · programme · intake, one Primary button for the
 * next action and an overflow menu.
 */
export default function ApplicationHeader({
  studentName,
  photoUrl,
  reference,
  stageId,
  stageLabel,
  actionNeeded = false,
  daysInStage,
  institution,
  programme,
  intake,
  primaryAction,
  overflowActions = [],
  breadcrumbs,
  loading = false,
  titleAs: Title = "h1",
  className,
}: ApplicationHeaderProps) {
  if (loading) {
    return (
      <div
        className={clsx(card, "flex items-center gap-4 p-4 md:p-6", className)}
        aria-busy="true"
        role="status"
        aria-label="Loading application"
      >
        <Skeleton className="h-16 w-16 shrink-0 rounded-ub-full" />
        <div className="grid flex-1 gap-2">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-5 w-1/3" />
        </div>
      </div>
    );
  }

  const meta = [institution, programme].filter(Boolean);

  return (
    <header className={clsx(card, "p-4 md:p-6", className)}>
      {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <Avatar
            name={studentName}
            src={photoUrl}
            size={64}
            className="hidden sm:inline-flex"
          />
          <Avatar
            name={studentName}
            src={photoUrl}
            size={48}
            className="sm:hidden"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Title className="min-w-0 text-ub-heading-lg text-ub-text-primary">
                {studentName}
              </Title>
              {reference && (
                <RefId
                  value={reference}
                  copyable
                  className="text-ub-body-sm text-ub-text-secondary"
                />
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {stageId ? (
                <StageTag stageId={stageId} actionNeeded={actionNeeded} />
              ) : stageLabel ? (
                <Tag dot>{stageLabel}</Tag>
              ) : null}
              {typeof daysInStage === "number" && (
                <DaysTag mode="inStage" days={daysInStage} />
              )}
            </div>
            {(meta.length > 0 || intake) && (
              <p className="mt-2 text-ub-body-sm text-ub-text-secondary">
                {meta.join(" · ")}
                {intake && (
                  <>
                    {meta.length > 0 && " · "}
                    Intake{" "}
                    <AppDate
                      value={intake}
                      format="short"
                      className="ub-tabular"
                    />
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {(primaryAction || overflowActions.length > 0) && (
          <div className="flex shrink-0 items-center gap-2 md:justify-end">
            {primaryAction && (
              <Button
                variant="primary"
                text={primaryAction.label}
                icon={
                  primaryAction.icon ? (
                    <primaryAction.icon
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  ) : undefined
                }
                onClick={primaryAction.onClick}
                loading={primaryAction.loading}
                disabled={primaryAction.disabled}
                className="hidden md:inline-flex"
              />
            )}
            {overflowActions.length > 0 && (
              <ActionsDropdown
                iconOnly
                label="More actions"
                items={overflowActions.map((a) => ({
                  label: a.label,
                  icon: a.icon,
                  onClick: a.onClick,
                  color: a.destructive ? "red" : "blue",
                }))}
              />
            )}
          </div>
        )}
      </div>
    </header>
  );
}
