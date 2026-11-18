"use client";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";

import {
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Wallet,
} from "lucide-react";
import DataTable, {
  type DataTableColumn,
  type DataTableSort,
} from "components/ub/data/tables/DataTable";
import TablePagination from "components/ub/data/tables/TablePagination";
import EntityCell from "components/ub/data/display/EntityCell";
import UniversityLogo, {
  universityStatus,
} from "features/universities/components/shared/UniversityLogo";
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
        <EntityCell
          name={university.name}
          avatar={<UniversityLogo name={university.name} fileKey={university.logo_file_key} />}
          status={universityStatus(university)}
          subtitle={university.country || "Country to be confirmed"}
        />
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
            className="!flex flex-wrap md:!grid md:grid-cols-[max-content_max-content] !gap-x-4 !gap-y-2"
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
      key: "actions",
      header: "Actions",
      align: "end",
      cell: (university) => (
        <TableActions>
          {props.canManage && (
            <TableAction
              label={"Edit university"}
              icon={<Pencil className="h-4 w-4" />}
              href={`${props.basePath}/${university.id}/edit`}
              primary
            />
          )}
          {props.onAssignPayment && (
            <TableAction
              label={"Assign payment method"}
              icon={<Wallet className="h-4 w-4" />}
              onSelect={() => props.onAssignPayment?.(university)}
            />
          )}
          {props.onToggleHidden && (
            <TableAction
              label={
                university.is_hidden ? "Unhide university" : "Hide university"
              }
              icon={
                university.is_hidden ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )
              }
              onSelect={() => props.onToggleHidden?.(university)}
              disabled={props.togglingId === university.id}
            />
          )}
          {props.onDelete && (
            <TableAction
              label={"Delete university"}
              icon={<Trash2 className="h-4 w-4" />}
              onSelect={() => props.onDelete?.(university)}
              danger
            />
          )}
        </TableActions>
      ),
    },
  ];
  return (
    <div className="min-w-0">
      <DataTable
        columns={columns}
        rows={props.universities}
        caption="University directory"
        getRowId={(university) => university.id}
        getRowHref={(university) => `${props.basePath}/${university.id}`}
        sort={props.sort}
        onSortChange={props.onSortChange}
        manualSort
        mobileLayout="stacked"
        scrollClassName="max-h-[60dvh] overflow-y-auto overscroll-contain md:max-h-[65dvh]"
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
