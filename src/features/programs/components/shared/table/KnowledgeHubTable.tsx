"use client";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";

import { motion, useReducedMotion } from "framer-motion";
import { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";
import { Fragment, type ReactNode } from "react";
import {
  CopyPlus,
  Eye,
  EyeOff,
  Pencil,
  Share2,
  Trash2,
  GraduationCap,
} from "lucide-react";
import DataTable, {
  type DataTableColumn,
} from "components/ub/data/tables/DataTable";
import TablePagination from "components/ub/data/tables/TablePagination";
import EntityCell from "components/ub/data/display/EntityCell";
import UniversityLogo from "features/universities/components/shared/UniversityLogo";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import Tag from "components/ub/data/badges/Tag";
import { courseTypeLabel } from "features/programs/utils/courseType";
import { getIeltsLabel } from "constants/lists";
import type { Program } from "features/programs/types";

/** Visible to Advisors, or hidden from the catalogue: the circle on the program's logo. */
export const programStatus = (program: { is_hidden?: boolean }) =>
  program.is_hidden
    ? { status: "inactive", label: "Hidden" }
    : { status: "active", label: "Visible" };

/** The one short line under a program's name: its university and branch. */
export const programSubtitle = (
  program: Pick<Program, "university" | "branch">
) =>
  [program.university?.name, program.branch?.name]
    .filter(Boolean)
    .join(" · ") || "University unavailable";

interface KnowledgeHubTableProps {
  basePath?: "/admin" | "/data-entry";
  bulkActions?: ReactNode;
  programs: Program[];
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => void;

  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  total: number;

  selectedPrograms: Record<string, boolean>;
  onSelectProgram: (id: string) => void;
  selectedCount: number;
  isSelectingAll: boolean;
  onSelectAll: () => void;

  onRowClick: (program: Program) => void;
  editHref: (id: string) => string;

  hideDelete?: boolean;
  onDeleteClick?: (program: Program) => void;
  /** When set, shows a "Copy to another branch" row action. */
  onCopyToBranchClick?: (program: Program) => void;
  /** Per-row copy state — used to disable the action for a program that's
   *  already in every branch. */
  copyEligibility?: (program: Program) => { disabled: boolean; title: string };
  /** When set, shows a Hide/Unhide row action (reversible — no confirmation). */
  onToggleHiddenClick?: (program: Program) => void;
  /** Id of the program whose hide/unhide request is in flight. */
  togglingHiddenId?: string | null;
  emptySubtitle?: string;
}

export default function KnowledgeHubTable(props: KnowledgeHubTableProps) {
  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();
  const selectedIds = Object.keys(props.selectedPrograms).filter(
    (id) => props.selectedPrograms[id]
  );
  const money = (amount: number | null | undefined, currency?: string | null) =>
    amount == null
      ? "To be confirmed"
      : `${currency || "MYR"} ${amount.toLocaleString()}`;
  const share = async (program: Program) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${props.editHref(program.id)}`
      );
      showToast("Link copied to clipboard.", "success");
    } catch {
      showToast("Failed to copy link.", "error");
    }
  };
  const columns: DataTableColumn<Program>[] = [
    {
      key: "name",
      width: "34%",
      header: "Program",
      cell: (program) => {
        const ielts = program.english_required_score
          ? getIeltsLabel(program.english_required_score)
          : null;
        return (
          <span className="block min-w-0">
            <EntityCell
              name={program.name}
              avatar={
                <UniversityLogo
                  name={program.university?.name || program.name}
                  fileKey={program.university?.logo_file_key}
                  src={program.university?.logo_file_url}
                />
              }
              status={programStatus(program)}
              subtitle={programSubtitle(program)}
            />
            {/* Cards (below 1024px): the facts in two short lines under the name, no label column. */}
            <span className="mt-3 flex flex-col gap-2 text-ub-body-sm lg:hidden">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {program.qualification_level && (
                  <Tag hue="indigo" size="sm">
                    {program.qualification_level}
                  </Tag>
                )}
                {program.duration ? (
                  <span className="text-ub-text-secondary">
                    {program.duration} {program.duration === 1 ? "year" : "years"}
                  </span>
                ) : null}
                {program.has_scholarship && (
                  <Tag hue="amber" size="sm">
                    Scholarship
                  </Tag>
                )}
              </span>
              <span className="ub-tabular grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1">
                {[
                  ["Tuition", money(program.first_year_tuition, program.yearly_fee_currency), "text-ub-text-primary"],
                  ["Commission", money(program.commission_amount, program.commission_currency), "text-ub-label-md text-ub-tone-success-text"],
                  ["English", ielts ? `IELTS ${ielts.replace(/^Band\s*/i, "")}` : "Not set", "text-ub-text-primary"],
                ].map(([label, value, tone]) => (
                  <Fragment key={label}>
                    <span className="text-ub-caption leading-5 text-ub-text-tertiary">{label}</span>
                    <span className={`whitespace-nowrap ${tone}`}>{value}</span>
                  </Fragment>
                ))}
              </span>
            </span>
          </span>
        );
      },
    },
    {
      key: "level",
      mobileSecondary: true,
      width: "22%",
      header: "Level",
      cell: (program) => {
        const details = [
          courseTypeLabel(program.course_type),
          program.duration
            ? `${program.duration} ${program.duration === 1 ? "year" : "years"}`
            : null,
        ].filter(Boolean);
        return (
          <span className="flex min-w-0 flex-col items-start gap-1">
            {program.qualification_level ? (
              <Tag hue="indigo" size="sm">
                {program.qualification_level}
              </Tag>
            ) : (
              <span className="text-ub-text-tertiary">Not set</span>
            )}
            {details.length > 0 && (
              <span className="text-ub-caption text-ub-text-secondary">
                {details.join(" · ")}
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: "fees",
      mobileSecondary: true,
      width: "18%",
      header: "Tuition / commission",
      align: "end",
      cell: (program) => (
        <span className="ub-tabular flex flex-col items-start gap-0.5 lg:items-end">
          <span
            className="text-ub-body-sm text-ub-text-primary"
            title="First-year tuition"
          >
            {money(program.first_year_tuition, program.yearly_fee_currency)}
          </span>
          <span
            className="text-ub-label-md text-ub-tone-success-text"
            title="Commission"
          >
            {money(program.commission_amount, program.commission_currency)}
          </span>
        </span>
      ),
    },
    {
      key: "english",
      mobileSecondary: true,
      width: "18%",
      header: "English",
      cell: (program) => {
        const ielts = program.english_required_score
          ? getIeltsLabel(program.english_required_score)
          : null;
        return (
          <span className="flex min-w-0 flex-col items-start gap-1">
            <span className="text-ub-body-sm">
              {ielts ? `IELTS ${ielts.replace(/^Band\s*/i, "")}` : "Not set"}
            </span>
            {program.has_scholarship && (
              <Tag hue="amber" size="sm">
                Scholarship
              </Tag>
            )}
          </span>
        );
      },
    },
    {
      key: "actions",
      width: "8%",
      header: "Actions",
      align: "end",
      cell: (program) => {
        const copy = props.copyEligibility?.(program);
        return (
          <TableActions>
            <TableAction
              label={"Edit"}
              icon={<Pencil className="h-4 w-4" />}
              href={props.editHref(program.id)}
              primary
            />
            <TableAction
              label={"Share"}
              icon={<Share2 className="h-4 w-4" />}
              onSelect={() => share(program)}
            />
            {props.onCopyToBranchClick && (
              <TableAction
                label={"Copy to branch"}
                icon={<CopyPlus className="h-4 w-4" />}
                onSelect={() => props.onCopyToBranchClick?.(program)}
                disabled={copy?.disabled}
              />
            )}
            {props.onToggleHiddenClick && (
              <TableAction
                label={program.is_hidden ? "Unhide program" : "Hide program"}
                icon={
                  program.is_hidden ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )
                }
                onSelect={() => props.onToggleHiddenClick?.(program)}
                disabled={props.togglingHiddenId === program.id}
              />
            )}
            {!props.hideDelete && props.onDeleteClick && (
              <TableAction
                label={"Delete program"}
                icon={<Trash2 className="h-4 w-4" />}
                onSelect={() => props.onDeleteClick?.(program)}
                danger
              />
            )}
          </TableActions>
        );
      },
    },
  ];
  return (
    <motion.div
      initial={false}
      animate={{ opacity: props.isFetching && !props.loading ? 0.6 : 1 }}
      transition={{ duration: reducedMotion ? 0 : MICRO_DURATION, ease: EASE }}
      aria-busy={props.isFetching || props.isSelectingAll}
      className="min-w-0"
    >
      <DataTable
        className="ub-knowledge-hub-table"
        mobileLayout="stacked"
        scrollClassName="max-h-[60dvh] overflow-y-auto overscroll-contain md:max-h-[65dvh] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus"
        columns={columns}
        rows={props.programs}
        getRowId={(program) => program.id}
        getRowLabel={(program) => program.name}
        caption="Programs in the Knowledge Hub"
        bulkActions={() => props.bulkActions}
        loading={props.loading}
        error={props.error}
        onRetry={props.refetch}
        selectable
        selectedIds={selectedIds}
        isRowSelectable={() =>
          props.isSelectingAll ? "Selecting programs" : true
        }
        onSelectionChange={(next) => {
          const before = new Set(selectedIds);
          const after = new Set(next);
          for (const id of new Set([...selectedIds, ...next]))
            if (before.has(id) !== after.has(id)) props.onSelectProgram(id);
        }}
        totalCount={props.total}
        allMatchingSelected={
          props.total > 0 && props.selectedCount >= props.total
        }
        onSelectAllMatchingChange={() => {
          void props.onSelectAll();
        }}
        getRowHref={(program) =>
          props.editHref(program.id).replace(/\/edit$/, "")
        }
        rowLinkTarget="_blank"
        empty={{
          title: "No programs found",
          description:
            props.emptySubtitle || "Try adjusting your search or filters.",
          icon: <GraduationCap className="h-6 w-6" />,
        }}
        footer={
          <TablePagination
            currentPage={props.currentPage}
            onPageChange={props.onPageChange}
            itemsPerPage={props.itemsPerPage}
            itemCount={props.programs.length}
            totalCount={props.total}
            itemLabel="programs"
            loading={props.loading}
          />
        }
      />
    </motion.div>
  );
}
