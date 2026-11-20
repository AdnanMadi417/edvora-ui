"use client";
import { useMemo, type ReactNode } from "react";
import { ClipboardList } from "lucide-react";
import AppDate from "components/ub/data/formatting/AppDate";
import DataTable, {
  type DataTableColumn,
  type DataTableDensity,
} from "components/ub/data/tables/DataTable";
import PresignedImage from "components/ub/data/media/PresignedImage";
import Tag from "components/ub/data/badges/Tag";
import { Avatar } from "components/ub/data/media/Avatar";
import StatusTag from "components/ub/dashboard/shared/StatusTag";
import "./ApplicationsTable.css";
import { stageLabel, statusLabel as toStatusLabel } from "config/statusLabels";

/** The fields every role's list endpoint returns (admin adds account_manager_name). */
export interface ApplicationListRow {
  id: string;
  student_name: string;
  passport_number?: string | null;
  student_photo_file_key?: string | null;
  program_name: string;
  university_name: string;
  partner_name?: string | null;
  account_manager_name?: string | null;
  stage: string;
  status: string;
  updated_at: string;
}

export type ApplicationsTableOwnership =
  | "advisor-and-manager"
  | "advisor"
  | "none";

export interface ApplicationsTableProps {
  rows: ApplicationListRow[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Detail page for a row, e.g. (id) => `/admin/applications/${id}`. Opens in a new tab, as before. */
  hrefFor: (id: string) => string;
  /** Owner column: Advisor + account manager (admin), Advisor (account manager), none (Advisor). */
  ownership?: ApplicationsTableOwnership;
  /** Display name for a status code, from the stage-status list. */
  statusLabel: (status: string) => string;
  /** Statuses where this viewer has to act: shows the Action needed tag. */
  needsAction: (status: string) => boolean;
  /** Row density. Compact by default. */
  defaultDensity?: DataTableDensity;
  footer?: ReactNode;
  emptyAction?: ReactNode;
}

function StudentCell({ row }: { row: ApplicationListRow }) {
  return (
    <span className="ub-application-student flex min-w-0 w-full items-center gap-3 py-2">
      <PresignedImage
        fileKey={row.student_photo_file_key ?? undefined}
        alt=""
        className="h-8 w-8 shrink-0 rounded-ub-full object-cover"
        fallback={<Avatar name={row.student_name ?? "?"} size={32} alt="" />}
        renderImage={(src) => (
          <Avatar name={row.student_name ?? "?"} src={src} size={32} alt="" />
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-ub-label-md text-ub-text-primary">
          {row.student_name}
        </span>
        {row.passport_number && (
          <span className="ub-ref block truncate text-ub-caption text-ub-text-tertiary">
            {row.passport_number}
          </span>
        )}
      </span>
      {/* Phones: the card itself opens the application (no open button); the time sits up here. */}
      <AppDate
        value={row.updated_at}
        format="relative"
        className="shrink-0 self-start text-ub-caption text-ub-text-tertiary lg:hidden"
      />
    </span>
  );
}

/**
 * Application Tracker table (brief §6), shared by the Advisor, account
 * manager and admin lists. Each row opens the application in a new tab.
 */
export default function ApplicationsTable({
  rows,
  loading,
  error,
  onRetry,
  hrefFor,
  ownership = "none",
  statusLabel,
  needsAction,
  defaultDensity = "compact",
  footer,
  emptyAction,
}: ApplicationsTableProps) {
  const columns = useMemo<DataTableColumn<ApplicationListRow>[]>(() => {
    const cols: DataTableColumn<ApplicationListRow>[] = [
      {
        key: "student",
        header: "Student",
        cell: (r) => <StudentCell row={r} />,
        sortable: true,
        sortValue: (r) => r.student_name,
        width: ownership === "none" ? "26%" : "22%",
      },
      {
        key: "programme",
        header: "Program",
        mobileLabel: "Program",
        width: ownership === "none" ? "32%" : "24%",
        cell: (r) => (
          <span className="ub-application-programme block min-w-0 w-full">
            <span
              className="line-clamp-2 text-ub-body-sm text-ub-text-primary"
              title={r.program_name}
            >
              {r.program_name}
            </span>
            <span className="block truncate text-ub-caption text-ub-text-tertiary">
              {r.university_name}
            </span>
          </span>
        ),
        sortable: true,
        sortValue: (r) => r.program_name,
      },
    ];
    if (ownership !== "none") {
      cols.push({
        key: "owner",
        mobileSecondary: true,
        width: "18%",
        header:
          ownership === "advisor-and-manager" ? "Advisor / manager" : "Advisor",
        cell: (r) => (
          <span className="block min-w-0 w-full">
            <span
              className="block truncate"
              title={r.partner_name ?? undefined}
            >
              {r.partner_name ?? "—"}
            </span>
            {ownership === "advisor-and-manager" && (
              <span className="block truncate text-ub-caption text-ub-text-tertiary">
                {r.account_manager_name ?? "No manager"}
              </span>
            )}
          </span>
        ),
        sortable: true,
        sortValue: (r) => r.partner_name,
      });
    }
    cols.push(
      {
        key: "status",
        width: ownership === "none" ? "28%" : "24%",
        header: "Stage / status",
        cell: (r) => (
          <span className="ub-application-status flex w-full min-w-0 flex-col items-start gap-1">
            <span
              className="block w-full truncate text-ub-caption text-ub-text-tertiary"
              title={stageLabel(r.stage)}
            >
              {stageLabel(r.stage)}
            </span>
            <span className="flex w-full min-w-0 flex-wrap items-center gap-1.5">
              <StatusTag
                status={r.status}
                label={toStatusLabel(statusLabel(r.status))}
                size="sm"
              />
              {needsAction(r.status) && (
                <Tag tone="attention" size="sm">
                  Action needed
                </Tag>
              )}
            </span>
          </span>
        ),
        sortable: true,
        sortValue: (r) => r.stage,
      },
      {
        key: "updated",
        // Phones show the time in the card header instead.
        mobileSecondary: true,
        width: ownership === "none" ? "14%" : "12%",
        header: "Updated",
        cell: (r) => (
          <AppDate
            value={r.updated_at}
            format="relative"
            className="text-ub-text-secondary"
          />
        ),
        sortable: true,
        sortValue: (r) => new Date(r.updated_at),
      }
    );
    return cols;
  }, [ownership, statusLabel, needsAction]);

  return (
    <>
      <DataTable<ApplicationListRow>
        className="ub-applications-table"
        // Phones use separate cards with student identity, programme, status and recency.
        mobileLayout="stacked"
        scrollClassName="max-h-none overflow-y-visible lg:max-h-[65dvh] lg:overflow-y-auto lg:overscroll-contain"
        caption="Applications"
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        getRowLabel={(r) => r.student_name}
        getRowHref={(r) => hrefFor(r.id)}
        rowLinkTarget="_blank"
        density={defaultDensity}
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={{
          title: "No applications found",
          description: "No applications match your current filters.",
          icon: <ClipboardList aria-hidden="true" />,
          action: emptyAction,
        }}
        footer={footer}
      />
    </>
  );
}
