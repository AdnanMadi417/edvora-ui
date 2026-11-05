"use client";

import {
  Eye,
  EyeOff,
  GraduationCap,
  Pencil,
  Trash2,
  Wallet,
} from "lucide-react";
import DataTable, {
  type DataTableColumn,
  type DataTableSort,
} from "components/ub/data/tables/DataTable";
import TablePagination from "components/ub/data/tables/TablePagination";
import PresignedImage from "components/ub/data/media/PresignedImage";
import IconButton from "components/ub/core/buttons/IconButton";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import Tag from "components/ub/data/badges/Tag";
import IntakeMonthsChips from "features/programs/components/shared/IntakeMonthsChips";
import type { University } from "features/universities/types";

interface Props {
  universities: University[];
  basePath: string;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  page: number;
  onPageChange: (page: number) => void;
  total: number;
  sort: DataTableSort | null;
  onSortChange: (sort: DataTableSort | null) => void;
  canManage?: boolean;
  togglingId?: string | null;
  onToggleHidden?: (university: University) => void;
  onDelete?: (university: University) => void;
  onAssignPayment?: (university: University) => void;
}
export default function UniversitiesDataTable(props: Props) {
  const columns: DataTableColumn<University>[] = [
    {
      key: "name",
      header: "University",
      width: "320px",
      sortable: true,
      cell: (university) => (
        <div className="flex min-w-[240px] max-w-[360px] items-start gap-3 py-3 text-start">
          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-ub-md border border-ub-border bg-ub-tone-brand-bg">
            <PresignedImage
              fileKey={university.logo_file_key}
              alt=""
              className="h-full w-full object-contain"
              fallback={
                <GraduationCap className="h-5 w-5 text-ub-tone-brand-text" />
              }
            />
          </div>
          <div className="min-w-0 space-y-1.5">
            <p
              className="line-clamp-2 text-ub-label-md text-ub-text-primary"
              title={university.name}
            >
              {university.name}
            </p>
            <p className="text-ub-body-sm text-ub-text-secondary">
              {university.country || "Country to be confirmed"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Tag hue="indigo" size="sm">
                {university.is_public ? "Public" : "Private"}
              </Tag>
              {props.canManage && university.is_hidden && (
                <Tag hue="amber" size="sm">
                  Hidden
                </Tag>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "university_type_name",
      header: "University type",
      sortable: true,
      cell: (university) => (
        <Tag hue="sky">
          {university.university_type_name || "Not configured"}
        </Tag>
      ),
    },
    {
      key: "intake_months",
      header: "Intakes",
      cell: (university) =>
        university.intake_months?.length ? (
          <IntakeMonthsChips
            months={university.intake_months}
            size="sm"
            maxVisible={4}
            className="!grid grid-cols-[max-content_max-content] !gap-x-4 !gap-y-2"
          />
        ) : (
          "To be confirmed"
        ),
    },
    {
      key: "has_language_center",
      header: "Language center",
      sortable: true,
      cell: (university) => (
        <Tag hue={university.has_language_center ? "teal" : "grey"}>
          {university.has_language_center ? "Available" : "Not available"}
        </Tag>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      sortable: true,
      cell: (university) => (
        <Tag hue={university.is_active ? "teal" : "grey"}>
          {university.is_active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (university) => (
        <div className="flex flex-nowrap items-center gap-1">
          <LinkBtn
            href={`${props.basePath}/${university.id}`}
            icon={<Eye className="h-4 w-4" />}
            title="View university"
            variant="tertiary"
            size="sm"
          />
          {props.canManage && (
            <LinkBtn
              href={`${props.basePath}/${university.id}/edit`}
              icon={<Pencil className="h-4 w-4" />}
              title="Edit university"
              variant="secondary"
              size="sm"
            />
          )}
          {props.onAssignPayment && (
            <IconButton
              type="button"
              size="sm"
              variant="tertiary"
              title="Assign payment method"
              icon={<Wallet className="h-4 w-4" />}
              onClick={() => props.onAssignPayment?.(university)}
            />
          )}
          {props.onToggleHidden && (
            <IconButton
              type="button"
              size="sm"
              variant="tertiary"
              title={
                university.is_hidden ? "Unhide university" : "Hide university"
              }
              disabled={props.togglingId === university.id}
              icon={
                university.is_hidden ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )
              }
              onClick={() => props.onToggleHidden?.(university)}
            />
          )}
          {props.onDelete && (
            <IconButton
              type="button"
              size="sm"
              variant="tertiary"
              title="Delete university"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => props.onDelete?.(university)}
            />
          )}
        </div>
      ),
    },
  ];
  return (
    <div className="min-w-0">
      <p className="mb-2 text-ub-label-sm text-ub-text-tertiary md:hidden">
        Swipe across for more columns. Scroll within the table for more
        universities.
      </p>
      <DataTable
        columns={columns}
        rows={props.universities}
        caption="University directory"
        getRowId={(university) => university.id}
        getRowHref={(university) => `${props.basePath}/${university.id}`}
        sort={props.sort}
        onSortChange={props.onSortChange}
        manualSort
        mobileLayout="scroll"
        scrollClassName="max-h-[65dvh] overflow-y-auto overscroll-contain"
        loading={props.loading}
        error={props.error}
        onRetry={props.onRetry}
        empty={{
          title: "No universities found",
          description: "Try changing your search or filters.",
        }}
        footer={
          <TablePagination
            currentPage={props.page}
            onPageChange={props.onPageChange}
            itemsPerPage={10}
            itemCount={props.universities.length}
            totalCount={props.total}
            itemLabel="universities"
            loading={props.loading}
          />
        }
      />
    </div>
  );
}
