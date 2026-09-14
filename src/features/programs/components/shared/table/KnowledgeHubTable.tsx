"use client";

import React from "react";
import {
  Settings,
  CheckCircle,
  Pencil,
  XCircle,
  Trash2,
  Share2,
  CopyPlus,
  ChevronRight,
  Calendar,
  DollarSign,
  GraduationCap,
} from "lucide-react";
import { MdSchool } from "react-icons/md";
import { AiOutlineBank } from "react-icons/ai";
import PresignedImage from "components/ui/PresignedImage";
import { getIeltsLabel } from "constants/lists";
import IconButton from "components/ui/buttons/IconButton";
import { Tooltip } from "components/ui/tooltip";
import { TableWrapper, TableLoadingRow, TableEmptyRow, TableErrorRow, TablePagination } from "components/ui/table";
import { StatusBadge } from "components/ui/badges";
import { useToast } from "components/context/ToastContext";
import type { Program } from "features/programs/types";
import IntakeMonthsChips from "features/programs/components/shared/IntakeMonthsChips";
import { courseTypeLabel } from "features/programs/utils/courseType";

function ProgramUniversityCell({ program }: { program: Program }) {
  const tags: { label: string; color: "green" | "blue" | "gray" }[] = [];

  if (program.university?.name) tags.push({ label: program.university.name, color: "green" });
  if (program.branch?.name) tags.push({ label: program.branch.name, color: "blue" });
  if (program.branch?.location || program.branch?.state) {
    tags.push({
      label: [program.branch.location, program.branch.state].filter(Boolean).join(" | "),
      color: "gray",
    });
  }

  if (tags.length === 0) return <span className="italic text-slate-400">Not provided</span>;

  const visibleTags = tags.slice(0, 3);
  const hiddenCount = tags.length - visibleTags.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {visibleTags.map((tag, index) => (
        <span
          key={index}
          title={tag.label}
          className={`truncate rounded-md px-2 py-0.5 font-medium transition ${
            tag.color === "green"
              ? "bg-green-50 text-green-700"
              : tag.color === "blue"
                ? "bg-blue-50 text-blue-700"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          {tag.label}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
}

interface KnowledgeHubTableProps {
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
}

export default function KnowledgeHubTable({
  programs,
  loading,
  isFetching,
  error,
  refetch,
  currentPage,
  onPageChange,
  itemsPerPage,
  total,
  selectedPrograms,
  onSelectProgram,
  selectedCount,
  isSelectingAll,
  onSelectAll,
  onRowClick,
  editHref,
  hideDelete = false,
  onDeleteClick,
  onCopyToBranchClick,
  copyEligibility,
}: KnowledgeHubTableProps) {
  const { showToast } = useToast();

  const handleShare = async (program: Program) => {
    const url = `${window.location.origin}${editHref(program.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard.", "success");
    } catch {
      showToast("Failed to copy link.", "error");
    }
  };

  return (
    <TableWrapper
      footer={
        <TablePagination
          currentPage={currentPage}
          onPageChange={onPageChange}
          itemsPerPage={itemsPerPage}
          itemCount={programs.length}
          totalCount={total}
          itemLabel="programs"
          loading={loading}
        />
      }
    >
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <td className="pl-6 py-4">
              <input
                type="checkbox"
                ref={(el) => {
                  if (el) el.indeterminate = selectedCount > 0 && selectedCount < total;
                }}
                checked={total > 0 && selectedCount >= total}
                disabled={isSelectingAll}
                onChange={() => onSelectAll()}
                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 disabled:cursor-wait"
              />
            </td>

            <th className="group min-w-[260px] px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
              <div className="flex items-center gap-2">
                <MdSchool className="h-4 w-4 text-slate-500" />
                <span>Program Info</span>
              </div>
            </th>

            <th className="group min-w-[200px] max-w-[250px] px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
              <div className="flex items-center gap-2">
                <AiOutlineBank className="h-4 w-4 text-slate-500" />
                <span>University</span>
              </div>
            </th>

            <th className="group px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-500" />
                <span>Fees</span>
              </div>
            </th>

            <th className="group min-w-[160px] px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>Intakes</span>
              </div>
            </th>

            <th className="group min-w-[120px] px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-slate-500" />
                <span>Scholarship</span>
              </div>
            </th>

            <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-500" />
                <span>Actions</span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody className={`divide-y divide-slate-200 bg-white transition-opacity duration-150 ${isFetching && !loading ? "opacity-50 pointer-events-none" : ""}`}>

          {loading && <TableLoadingRow colSpan={7} text="Fetching programs..." />}

          {!loading && error && (
            <TableErrorRow colSpan={7} message={error} onRetry={refetch} />
          )}

          {!loading && !error && programs.length === 0 && (
            <TableEmptyRow
              colSpan={7}
              title="No programs found"
              subtitle="There are currently no programs available."
              icon={<GraduationCap className="h-8 w-8 text-slate-400" />}
            />
          )}

          {!loading && !error && programs.map((program) => (
            <tr
              key={program.id}
              className={`group cursor-pointer transition-colors hover:bg-slate-100/50 ${selectedPrograms[program.id] ? "bg-slate-50" : ""}`}
              onClick={() => onRowClick(program)}
            >
              {/* Checkbox */}
              <td className="pl-6" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  aria-label={`Select ${program.name}`}
                  checked={selectedPrograms[program.id] || false}
                  onChange={() => onSelectProgram(program.id)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
              </td>

              {/* Program Info */}
              <td className="min-w-[260px] max-w-[380px] px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-slate-200 ring-offset-2">
                    {program.university?.logo_file_key ? (
                      <PresignedImage
                        fileKey={program.university.logo_file_key}
                        alt={program.university.name}
                        className="h-full w-full object-cover"
                        fallback={
                          <div className="flex h-full w-full items-center justify-center bg-accent-light text-h6 font-medium text-blue-700">
                            {program.name?.slice(0, 2).toUpperCase()}
                          </div>
                        }
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-accent-light text-h6 font-medium text-blue-700">
                        {program.name?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="w-full min-w-0">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900" title={program.name}>
                      {program.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                      <span className="font-medium capitalize text-slate-700">{program.qualification_level}</span>
                      {program.course_type && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{courseTypeLabel(program.course_type)}</span>
                        </>
                      )}
                      {program.field_of_study?.name && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{program.field_of_study.name}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {program.duration != null && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {program.duration} yr{program.duration !== 1 ? "s" : ""}
                        </span>
                      )}
                      {program.is_on_campus && (
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                          On Campus
                        </span>
                      )}
                      {program.is_online && (
                        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                          Online
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>

              {/* University */}
              <td className="min-w-[200px] max-w-[280px] px-6 py-4">
                <ProgramUniversityCell program={program} />
              </td>

              {/* Fees */}
              <td className="min-w-[200px] max-w-[300px] px-6 py-4 text-xs text-slate-500">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700">First Year:</span>
                    <span>{program.first_year_tuition != null ? `${program.yearly_fee_currency || "MYR"} ${program.first_year_tuition.toLocaleString()}` : "—"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700">Commission:</span>
                    <span>
                      {program.commission_amount != null
                        ? `${(program.commission_currency || "RM").toUpperCase()} ${program.commission_amount.toLocaleString()}`
                        : "—"}
                    </span>
                  </div>
                </div>
              </td>

              {/* Intakes */}
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                  {program.intake_months && program.intake_months.length > 0 ? (
                    <IntakeMonthsChips months={program.intake_months} size="sm" showDot={false} maxVisible={2} />
                  ) : (
                    <span className="text-slate-400">TBA</span>
                  )}
                  {program.english_required_score != null && (
                    <span className="text-slate-400">IELTS: {getIeltsLabel(program.english_required_score)}</span>
                  )}
                </div>
              </td>

              {/* Scholarship */}
              <td className="px-6 py-4">
                {program.has_scholarship ? (
                  <StatusBadge variant="success" icon={<CheckCircle className="h-3.5 w-3.5" />}>Available</StatusBadge>
                ) : (
                  <StatusBadge variant="danger" icon={<XCircle className="h-3.5 w-3.5" />}>None</StatusBadge>
                )}
              </td>

              {/* Actions */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <a
                    role="menuitem"
                    aria-label="Edit Program"
                    href={editHref(program.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="group/edit flex items-center justify-center rounded-lg p-2 text-sm hover:bg-slate-100 focus:outline-none"
                  >
                    <Pencil className="h-4 w-4 text-slate-400 group-hover/edit:text-blue-600" />
                  </a>

                  <IconButton
                    aria-label="Share Program"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(program);
                    }}
                    icon={<Share2 className="h-4 w-4" />}
                    bgColor="bg-transparent"
                    textColor="text-slate-400"
                    borderColor="border-transparent"
                    hoverTextColor="hover:text-blue-600"
                    hoverBorderColor="hover:border-transparent"
                    className="hover:bg-blue-50 focus:outline-none"
                  />

                  {onCopyToBranchClick && (() => {
                    const copy = copyEligibility?.(program) ?? {
                      disabled: false,
                      title: "Copy to another branch",
                    };
                    return (
                      <Tooltip content={copy.title} position="left">
                        <IconButton
                          aria-label="Copy to another branch"
                          disabled={copy.disabled}
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopyToBranchClick(program);
                          }}
                          icon={<CopyPlus className="h-4 w-4" />}
                          bgColor="bg-transparent"
                          textColor="text-slate-400"
                          borderColor="border-transparent"
                          hoverTextColor="hover:text-blue-600"
                          hoverBorderColor="hover:border-transparent"
                          className="hover:bg-blue-50 focus:outline-none"
                        />
                      </Tooltip>
                    );
                  })()}

                  {!hideDelete && (
                    <>
                      <div className="h-6 border-l border-slate-200" />

                      <IconButton
                        aria-label="Delete Program"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick?.(program);
                        }}
                        icon={<Trash2 className="h-4 w-4" />}
                        bgColor="bg-transparent"
                        textColor="text-slate-400"
                        borderColor="border-transparent"
                        hoverTextColor="hover:text-red-600"
                        hoverBorderColor="hover:border-transparent"
                        className="hover:bg-red-50 focus:outline-none"
                      />
                    </>
                  )}

                  <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
}
