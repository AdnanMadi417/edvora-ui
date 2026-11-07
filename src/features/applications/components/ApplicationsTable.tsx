"use client";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";

import { useMemo, useState, type ReactNode } from "react";
import { ClipboardList, Download, Eye } from "lucide-react";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import IconButton from "components/ub/core/buttons/IconButton";
import Button from "components/ub/core/buttons/Button";
import AppDate from "components/ub/data/formatting/AppDate";
import DataTable, {
  type DataTableColumn,
  type DataTableDensity,
} from "components/ub/data/tables/DataTable";
import PresignedImage from "components/ub/data/media/PresignedImage";
import Tag from "components/ub/data/badges/Tag";
import { Avatar } from "components/ub/data/media/Avatar";
import StatusTag from "components/ub/dashboard/shared/StatusTag";

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
  /** Staff: select rows on the page and export them as CSV. */
  selectable?: boolean;
  /** Changes when filters change, so the selection clears. */
  selectionResetKey?: string;
  footer?: ReactNode;
  emptyAction?: ReactNode;
}

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/** Pure: CSV for the selected rows (client-side; no bulk endpoint needed). */
export function applicationsCsv(
  rows: ApplicationListRow[],
  statusLabel: (s: string) => string
): string {
  const header = [
    "Student",
    "Passport number",
    "Programme",
    "Institution",
    "Advisor",
    "Account manager",
    "Stage",
    "Status",
    "Updated",
  ];
  const lines = rows.map((r) =>
    [
      r.student_name,
      r.passport_number,
      r.program_name,
      r.university_name,
      r.partner_name,
      r.account_manager_name,
      r.stage,
      statusLabel(r.status),
      r.updated_at,
    ]
      .map(csvCell)
      .join(",")
  );
  return [header.map(csvCell).join(","), ...lines].join("\n");
}

function download(csv: string, filename: string) {
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function StudentCell({ row }: { row: ApplicationListRow }) {
  return (
    <span className="flex min-w-[200px] max-w-[300px] items-center gap-3 py-2">
      <PresignedImage
        fileKey={row.student_photo_file_key ?? undefined}
        alt=""
        className="h-8 w-8 shrink-0 rounded-ub-full object-cover"
        fallback={<Avatar name={row.student_name ?? "?"} size={32} alt="" />}
        renderImage={(src) => (
          <Avatar name={row.student_name ?? "?"} src={src} size={32} alt="" />
        )}
      />
      <span className="min-w-0">
        <span className="block truncate text-ub-label-md text-ub-text-primary">
          {row.student_name}
        </span>
        {row.passport_number && (
          <span className="ub-ref block truncate text-ub-caption text-ub-text-tertiary">
            {row.passport_number}
          </span>
        )}
      </span>
    </span>
  );
}

/**
 * Application Tracker table (brief §6), shared by the Advisor, account
 * manager and admin lists. Each row opens the application in a new tab;
 * staff can select rows and export them.
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
  selectable = false,
  selectionResetKey,
  footer,
  emptyAction,
}: ApplicationsTableProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const columns = useMemo<DataTableColumn<ApplicationListRow>[]>(() => {
    const cols: DataTableColumn<ApplicationListRow>[] = [
      {
        key: "student",
        header: "Student",
        cell: (r) => <StudentCell row={r} />,
        sortable: true,
        sortValue: (r) => r.student_name,
        width: "26%",
      },
      {
        key: "programme",
        header: "Programme",
        mobileLabel: "Programme",
        cell: (r) => (
          <span className="block min-w-[220px] max-w-[300px]">
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
        header:
          ownership === "advisor-and-manager" ? "Advisor / manager" : "Advisor",
        cell: (r) => (
          <span className="block min-w-0">
            <span className="block truncate">{r.partner_name ?? "—"}</span>
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
        header: "Stage / status",
        cell: (r) => (
          <span className="flex min-w-[180px] flex-col items-start gap-1">
            <span className="truncate text-ub-caption text-ub-text-tertiary">
              {r.stage}
            </span>
            <span className="flex flex-wrap items-center gap-1.5">
              <StatusTag
                status={r.status}
                label={statusLabel(r.status)}
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
        header: "Updated",
        cell: (r) => (
          <AppDate
            value={r.updated_at}
            format="relative"
            className="whitespace-nowrap text-ub-text-secondary"
          />
        ),
        sortable: true,
        sortValue: (r) => new Date(r.updated_at),
      }
    );
    cols.push({
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <TableActions>
          {selectable && (
            <TableAction
              label={"Export application as CSV"}
              icon={<Download className="h-4 w-4" />}
              onSelect={() =>
                download(
                  applicationsCsv([row], statusLabel),
                  `application-${row.id}.csv`
                )
              }
            />
          )}
        </TableActions>
      ),
    });
    return cols;
  }, [ownership, statusLabel, needsAction, selectable]);

  return (
    <>
      <p className="mb-2 text-ub-label-sm text-ub-text-tertiary md:hidden">
        Swipe across for more columns. Scroll within the table for more
        applications.
      </p>
      <DataTable<ApplicationListRow>
        mobileLayout="scroll"
        scrollClassName="max-h-[65dvh] overflow-y-auto overscroll-contain"
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
        selectable={selectable}
        selectedIds={selected}
        onSelectionChange={setSelected}
        selectionResetKey={selectionResetKey}
        bulkActions={(ids, clear) => (
          <Button
            variant="primary"
            size="sm"
            icon={<Download className="h-4 w-4" aria-hidden="true" />}
            text={`Export ${ids.length} as CSV`}
            onClick={() => {
              const chosen = rows.filter((r) => ids.includes(r.id));
              download(
                applicationsCsv(chosen, statusLabel),
                `applications-${new Date().toISOString().slice(0, 10)}.csv`
              );
              clear();
            }}
          />
        )}
        footer={footer}
      />
    </>
  );
}
