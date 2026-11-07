"use client";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";

import { motion, useReducedMotion } from "framer-motion";
import { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";
import type { ReactNode } from "react";
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
import IconButton from "components/ub/core/buttons/IconButton";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import Tag from "components/ub/data/badges/Tag";
import Tooltip from "components/ub/feedback/dialogs/Tooltip";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import IntakeMonthsChips from "../IntakeMonthsChips";
import { courseTypeLabel } from "features/programs/utils/courseType";
import { getIeltsLabel } from "constants/lists";
import type { Program } from "features/programs/types";

interface KnowledgeHubTableProps {
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
      header: "Program",
      width: "320px",
      cell: (program) => (
        <div className="min-w-0 max-w-[320px] space-y-1.5 py-3 text-start md:min-w-[240px]">
          <Tooltip content={program.name} className="w-full min-w-0">
            <span className="line-clamp-2 break-words text-ub-label-md leading-snug text-ub-text-primary">
              {program.name}
            </span>
          </Tooltip>
          <p
            className="line-clamp-1 text-ub-body-sm text-ub-text-secondary"
            title={program.university?.name}
          >
            {program.university?.name}
          </p>
          <p
            className="line-clamp-1 text-ub-label-sm text-ub-text-tertiary"
            title={[program.branch?.name, program.branch?.state]
              .filter(Boolean)
              .join(" · ")}
          >
            {[program.branch?.name, program.branch?.state]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Tag hue="indigo" size="sm">
              {program.qualification_level}
            </Tag>
            {program.is_hidden && (
              <Tag hue="amber" size="sm">
                Hidden
              </Tag>
            )}
          </div>
          {program.course_type && (
            <p className="text-ub-body-sm text-ub-text-secondary">
              {courseTypeLabel(program.course_type)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "commission",
      header: "Commission",
      cell: (program) => (
        <span className="ub-tabular whitespace-nowrap text-ub-heading-sm text-ub-tone-success-text">
          {money(program.commission_amount, program.commission_currency)}
        </span>
      ),
    },
    {
      key: "tuition",
      header: "First-year tuition",
      cell: (program) => (
        <span className="ub-tabular whitespace-nowrap">
          {money(program.first_year_tuition, program.yearly_fee_currency)}
        </span>
      ),
    },
    {
      key: "intakes",
      header: "Intakes",
      cell: (program) =>
        program.intake_months?.length ? (
          <IntakeMonthsChips
            months={program.intake_months}
            size="sm"
            className="!grid grid-cols-[max-content_max-content] justify-items-start !gap-x-4 !gap-y-2"
            maxVisible={3}
          />
        ) : (
          "To be confirmed"
        ),
    },
    {
      key: "requirements",
      header: "Requirements",
      cell: (program) => (
        <div className="space-y-2">
          <p className="text-ub-body-sm">
            {program.english_required_score
              ? `IELTS ${getIeltsLabel(program.english_required_score)}`
              : "English score not provided"}
          </p>
          <Tag hue={program.has_scholarship ? "amber" : "grey"} size="sm">
            {program.has_scholarship
              ? "Scholarship available"
              : "No scholarship"}
          </Tag>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
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
      <p className="mb-2 text-ub-label-sm text-ub-text-tertiary md:hidden">
        Swipe across for more columns. Scroll within the table for more
        programs.
      </p>
      <DataTable
        mobileLayout="scroll"
        scrollClassName="max-h-[65dvh] overflow-y-auto overscroll-contain focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus"
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
