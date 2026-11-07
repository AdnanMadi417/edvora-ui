"use client";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Landmark,
  Pencil,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import DataTable, {
  sortRows,
  type DataTableColumn,
  type DataTableSort,
} from "components/ub/data/tables/DataTable";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import TablePagination from "components/ub/data/tables/TablePagination";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import IconButton from "components/ub/core/buttons/IconButton";
import Button from "components/ub/core/buttons/Button";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import SelectField from "components/ub/forms/selection/SelectField";
import Tag from "components/ub/data/badges/Tag";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { ISO_COUNTRIES, getCountryName } from "constants/lists";
import { useBanks, useUpdateBank } from "../hooks";
import type { Bank } from "../types";
export default function BanksTable({
  basePath = "/admin/advisors/banks",
}: {
  basePath?: string;
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ country: "", status: "all" });
  const [draft, setDraft] = useState(filters);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const { banks, loading, error, refetch } = useBanks({
    country: filters.country || undefined,
    include_inactive: filters.status !== "active",
  });
  const { updateBank } = useUpdateBank();
  const { showToast } = useToast();
  const filtered = banks.filter(
    (bank) =>
      `${bank.name} ${bank.code} ${bank.swift_code || ""}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()) &&
      (filters.status === "all" ||
        (filters.status === "active") === bank.is_active)
  );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / 10))
  );
  const filterCount =
    Number(Boolean(filters.country)) + Number(filters.status !== "all");
  async function toggle(bank: Bank) {
    if (toggling) return;
    setToggling(bank.id);
    try {
      await updateBank(bank.id, { is_active: !bank.is_active });
      refetch();
      showToast(
        bank.is_active ? "Bank deactivated." : "Bank activated.",
        "success"
      );
    } catch (err) {
      showToast(parseApiError(err, "Unable to update bank status."), "error");
    } finally {
      setToggling(null);
    }
  }
  const columns: DataTableColumn<Bank>[] = [
    {
      key: "name",
      header: "Bank name",
      sortable: true,
      cell: (bank) => (
        <p
          className="line-clamp-2 max-w-xs break-words font-medium"
          title={bank.name}
        >
          {bank.name}
        </p>
      ),
    },
    {
      key: "country",
      header: "Country",
      sortable: true,
      sortValue: (bank) => getCountryName(bank.country),
      cell: (bank) => (
        <span className="whitespace-nowrap">
          {getCountryName(bank.country)}{" "}
          <span className="text-ub-text-tertiary">({bank.country})</span>
        </span>
      ),
    },
    {
      key: "code",
      header: "Bank code",
      sortable: true,
      cell: (bank) => <span className="break-all ub-tabular">{bank.code}</span>,
    },
    {
      key: "swift_code",
      header: "SWIFT code",
      cell: (bank) => (
        <span className="break-all ub-tabular">
          {bank.swift_code || "Not provided"}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      cell: (bank) => (
        <Tag hue={bank.is_active ? "teal" : "grey"}>
          {bank.is_active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (bank) => (
        <TableActions>
          <TableAction
            label={`Edit ${bank.name}`}
            icon={<Pencil className="h-4 w-4" />}
            href={`${basePath}/${bank.id}/edit`}
            primary
          />
          <TableAction
            label={`${bank.is_active ? "Deactivate" : "Activate"} ${bank.name}`}
            icon={
              bank.is_active ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )
            }
            onSelect={() => toggle(bank)}
            disabled={Boolean(toggling)}
          />
        </TableActions>
      ),
    },
  ];
  const rows = sortRows(filtered, columns, sort).slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );
  return (
    <section className="mt-6 min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      <header className="flex flex-col gap-4 border-b border-ub-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <Landmark className="h-6 w-6 shrink-0 text-ub-primary" />
          <p className="text-ub-body-md text-ub-text-secondary">
            Manage the banks available for adviser payout accounts.
          </p>
        </div>
        <LinkBtn
          href={`${basePath}/create`}
          label="Add bank"
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
        />
      </header>
      <div className="border-b border-ub-border p-4 sm:p-6">
        <DataTableToolbar
          className="!mb-0"
          search={{
            value: search,
            onChange: (value) => {
              setSearch(value);
              setPage(1);
            },
            placeholder: "Search by bank name, code, or SWIFT code...",
          }}
          filters={
            <Button
              variant="secondary"
              text={filterCount ? `Filters (${filterCount})` : "Filters"}
              icon={<SlidersHorizontal className="h-4 w-4" />}
              onClick={() => {
                setDraft(filters);
                setOpen(true);
              }}
            />
          }
          actions={
            <div className="flex items-center gap-3">
              {(search || filterCount > 0) && (
                <Button
                  variant="tertiary"
                  text="Clear"
                  onClick={() => {
                    setSearch("");
                    setFilters({ country: "", status: "all" });
                    setPage(1);
                  }}
                />
              )}
              <p
                role="status"
                className="whitespace-nowrap text-ub-label-sm text-ub-text-secondary"
              >
                {filtered.length} banks
              </p>
            </div>
          }
        />
      </div>
      <div className="min-w-0 p-3 sm:p-6">
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(bank) => bank.id}
          getRowHref={(bank) => `${basePath}/${bank.id}`}
          caption="Bank reference list"
          loading={loading}
          error={error}
          onRetry={refetch}
          sort={sort}
          onSortChange={(value) => {
            setSort(value);
            setPage(1);
          }}
          manualSort
          getRowClassName={() => "md:[&>td]:py-4"}
          scrollClassName="max-h-[65dvh] overflow-y-auto overscroll-contain"
          empty={{
            title: "No banks found",
            description:
              search || filterCount
                ? "Try another search or clear your filters."
                : "No banks have been added yet.",
          }}
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setPage}
              itemsPerPage={10}
              itemCount={rows.length}
              totalCount={filtered.length}
              itemLabel="banks"
              loading={loading}
            />
          }
        />
      </div>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filter banks"
        description="Choose a country and bank availability."
        footer={
          <>
            <Button
              text="Clear filters"
              variant="secondary"
              onClick={() => {
                const empty = { country: "", status: "all" };
                setDraft(empty);
                setFilters(empty);
                setPage(1);
                setOpen(false);
              }}
            />
            <Button
              text="Apply filters"
              variant="primary"
              onClick={() => {
                setFilters(draft);
                setPage(1);
                setOpen(false);
              }}
            />
          </>
        }
      >
        <div className="space-y-6">
          <SelectField
            label="Country"
            field="country"
            formData={draft}
            errors={{}}
            updateFormData={(field, value) =>
              setDraft((prev) => ({ ...prev, [field]: String(value) }))
            }
            options={[
              { value: "", label: "All countries" },
              ...ISO_COUNTRIES.map((country) => ({
                value: country.code,
                label: `${country.name} (${country.code})`,
              })),
            ]}
          />
          <SelectField
            label="Status"
            field="status"
            formData={draft}
            errors={{}}
            updateFormData={(field, value) =>
              setDraft((prev) => ({ ...prev, [field]: String(value) }))
            }
            options={[
              { value: "all", label: "All banks" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </div>
      </Drawer>
    </section>
  );
}
