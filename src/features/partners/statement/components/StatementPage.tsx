"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Eye, Receipt, SlidersHorizontal } from "lucide-react";
import DataTable, {
  type DataTableColumn,
} from "components/ub/data/tables/DataTable";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import TablePagination from "components/ub/data/tables/TablePagination";
import StatusBadge, {
  type StatusBadgeVariant,
} from "components/ub/data/badges/StatusBadge";
import AppDate from "components/ub/data/formatting/AppDate";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import SelectField from "components/ub/forms/selection/SelectField";
import SearchableDropdown from "components/ub/forms/selection/SearchableDropdown";
import DescriptionList from "components/ub/data/display/DescriptionList";
import { formatCommissionAmount } from "features/applications/shared/commissionTypes";
import { usePartnerProfile } from "features/partners/hooks/profile/usePartnerProfile";
import { useAgencyMembers } from "features/agency-members/hooks/useAgencyMembers";
import { useStatement } from "../hooks";
import type { PartnerStatementItem, WaitingOn } from "../types";
const PAGE_SIZE = 20;
const STATES: Record<
  WaitingOn,
  { label: string; variant: StatusBadgeVariant }
> = {
  university: { label: "With the university", variant: "info" },
  us: { label: "Due to you", variant: "attention" },
  nobody: { label: "Paid", variant: "success" },
  disputed: { label: "Disputed", variant: "danger" },
};
const stateBadge = (value: WaitingOn) => {
  const state = STATES[value];
  return (
    <StatusBadge variant={state?.variant || "neutral"}>
      {state?.label || "Unknown status"}
    </StatusBadge>
  );
};
const amount = (item: PartnerStatementItem) =>
  item.commission_amount != null
    ? formatCommissionAmount(item.commission_amount, item.commission_currency)
    : "Not available";
export default function StatementPage() {
  const { partner } = usePartnerProfile();
  const isAgencyAdmin =
    partner?.type === "agency" && partner.agency_role === "admin";
  const { members } = useAgencyMembers({
    is_active: true,
    page_size: 100,
    enabled: isAgencyAdmin,
  });
  const [filters, setFilters] = useState({ status: "all", member: "" });
  const [draft, setDraft] = useState(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PartnerStatementItem | null>(null);
  const memberFilter = isAgencyAdmin ? filters.member : "";
  const { items, total, loading, error, refetch } = useStatement({
    page,
    page_size: PAGE_SIZE,
    waiting_on:
      filters.status === "all" ? undefined : (filters.status as WaitingOn),
    member_partner_id: memberFilter || undefined,
  });
  const rows = items.filter((item) =>
    `${item.reference} ${item.student_name} ${item.university_name} ${
      item.program_name
    } ${item.partner_name || ""} ${item.payout_reference || ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );
  const filterCount =
    Number(filters.status !== "all") + Number(Boolean(memberFilter));
  useEffect(() => {
    if (!loading && !error && page > Math.max(1, Math.ceil(total / PAGE_SIZE)))
      setPage(Math.max(1, Math.ceil(total / PAGE_SIZE)));
  }, [total, loading, error, page]);
  const columns: DataTableColumn<PartnerStatementItem>[] = [
    {
      key: "reference",
      header: "Application",
      cell: (item) => (
        <span className="whitespace-nowrap font-medium text-ub-text-primary">
          {item.reference}
        </span>
      ),
    },
    {
      key: "student_name",
      header: "Student",
      cell: (item) => (
        <p className="max-w-[200px] break-words font-medium">
          {item.student_name}
        </p>
      ),
    },
    ...(isAgencyAdmin
      ? [
          {
            key: "partner_name",
            header: "Advisor",
            cell: (item: PartnerStatementItem) => (
              <p className="max-w-[180px] break-words">
                {item.partner_name || "Not provided"}
              </p>
            ),
          },
        ]
      : []),
    {
      key: "program",
      header: "University / program",
      cell: (item) => (
        <div className="max-w-xs space-y-1">
          <p
            className="line-clamp-2 break-words text-ub-label-sm"
            title={item.university_name}
          >
            {item.university_name}
          </p>
          <p
            className="line-clamp-2 break-words text-ub-body-sm text-ub-text-secondary"
            title={item.program_name}
          >
            {item.program_name}
          </p>
        </div>
      ),
    },
    {
      key: "commission",
      header: "Commission",
      cell: (item) => (
        <span className="whitespace-nowrap text-ub-label-md ub-tabular">
          {amount(item)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => stateBadge(item.waiting_on),
    },
    {
      key: "since_date",
      header: "Status since",
      cell: (item) => (
        <span className="whitespace-nowrap">
          <AppDate value={item.since_date} format="short" />
        </span>
      ),
    },
    {
      key: "payout_reference",
      header: "Payout reference",
      width: "180px",
      cell: (item) => (
        <span className="break-all">
          {item.payout_reference || "Not available"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <IconButton
            title={`View commission ${item.reference}`}
            variant="secondary"
            icon={<Eye className="h-4 w-4" />}
            onClick={() => setSelected(item)}
          />
          <LinkBtn
            href={`/partner/applications/${item.application_id}`}
            title={`Open application ${item.reference}`}
            variant="tertiary"
            icon={<ArrowUpRight className="h-4 w-4" />}
          />
        </div>
      ),
    },
  ];
  return (
    <section className="mt-5 min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      <header className="flex items-start gap-3 border-b border-ub-border p-4 sm:p-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-ub-md bg-ub-tone-brand-bg text-ub-tone-brand-text">
          <Receipt className="h-5 w-5" />
        </span>
        <div>
          <p className="text-ub-label-md text-ub-text-primary">
            Your commission progress
          </p>
          <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
            Track commissions from university processing through to payment, and
            open the application for more details.
          </p>
        </div>
      </header>
      <div className="space-y-3 border-b border-ub-border p-4 sm:p-6">
        <DataTableToolbar
          className="!mb-0"
          search={{
            value: search,
            onChange: setSearch,
            placeholder:
              "Search this page by application, student, or university...",
          }}
          filters={
            <Button
              variant="secondary"
              text={filterCount ? `Filters (${filterCount})` : "Filters"}
              icon={<SlidersHorizontal className="h-4 w-4" />}
              onClick={() => {
                setDraft(filters);
                setFiltersOpen(true);
              }}
            />
          }
          actions={
            <div className="flex items-center gap-3">
              {(search || filterCount > 0) && (
                <Button
                  text="Clear"
                  variant="tertiary"
                  onClick={() => {
                    setSearch("");
                    setFilters({ status: "all", member: "" });
                    setPage(1);
                  }}
                />
              )}
              <p
                role="status"
                className="whitespace-nowrap text-ub-label-sm text-ub-text-secondary"
              >
                {loading ? "Updating…" : `${total} commissions`}
              </p>
            </div>
          }
        />
        {search.trim() && (
          <p role="status" className="text-ub-caption text-ub-text-secondary">
            {rows.length} of {items.length} entries match on this page.
          </p>
        )}
      </div>
      <div className="min-w-0 p-3 sm:p-6">
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(item) => item.application_commission_id}
          getRowHref={(item) => `/partner/applications/${item.application_id}`}
          caption="Commission tracker"
          loading={loading}
          error={error}
          onRetry={refetch}
          getRowClassName={() => "md:[&>td]:py-4"}
          scrollClassName="max-h-[65dvh] overflow-y-auto overscroll-contain"
          empty={{
            title: "No commissions found",
            description: search
              ? "No entries on this page match your search. Try another search or page."
              : filterCount
              ? "Try changing or clearing your filters."
              : "Your commissions will appear here when available.",
          }}
          footer={
            <TablePagination
              currentPage={page}
              onPageChange={(value) => {
                setPage(value);
                setSelected(null);
              }}
              itemsPerPage={PAGE_SIZE}
              itemCount={items.length}
              totalCount={total}
              itemLabel="commissions"
              loading={loading}
            />
          }
        />
      </div>
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter commissions"
        description="Choose commission status and, for company administrators, a team member."
        footer={
          <>
            <Button
              variant="secondary"
              text="Clear filters"
              onClick={() => {
                const empty = { status: "all", member: "" };
                setDraft(empty);
                setFilters(empty);
                setPage(1);
                setFiltersOpen(false);
              }}
            />
            <Button
              variant="primary"
              text="Apply filters"
              onClick={() => {
                setFilters({
                  ...draft,
                  member: isAgencyAdmin ? draft.member : "",
                });
                setPage(1);
                setSelected(null);
                setFiltersOpen(false);
              }}
            />
          </>
        }
      >
        <div className="space-y-6">
          <SelectField
            label="Commission status"
            field="status"
            formData={draft}
            errors={{}}
            updateFormData={(field, value) =>
              setDraft((prev) => ({ ...prev, [field]: String(value) }))
            }
            options={[
              { value: "all", label: "All statuses" },
              ...Object.entries(STATES).map(([value, state]) => ({
                value,
                label: state.label,
              })),
            ]}
          />
          {isAgencyAdmin && (
            <SearchableDropdown
              label="Team member"
              field="member"
              required={false}
              placeholder="Choose a team member"
              options={[
                { value: "", label: "All team members" },
                ...members.map((member) => ({
                  value: member.partner_id,
                  label: member.name,
                })),
              ]}
              formData={draft}
              errors={{}}
              updateFormData={(field, value) =>
                setDraft((prev) => ({ ...prev, [field]: String(value) }))
              }
            />
          )}
        </div>
      </Drawer>
      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Commission details"
        description={selected?.reference}
        footer={
          selected ? (
            <LinkBtn
              href={`/partner/applications/${selected.application_id}`}
              label="Open application"
              variant="primary"
              icon={<ArrowUpRight className="h-4 w-4" />}
            />
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-6">
            <div className="rounded-ub-lg border border-ub-border bg-ub-surface-subtle p-4">
              <p className="text-ub-label-sm text-ub-text-secondary">
                Commission
              </p>
              <p className="mt-2 text-ub-heading-lg ub-tabular">
                {amount(selected)}
              </p>
              <div className="mt-3">{stateBadge(selected.waiting_on)}</div>
            </div>
            <DescriptionList
              divided
              fallback="Not available"
              items={[
                { label: "Application", value: selected.reference },
                { label: "Student", value: selected.student_name },
                { label: "University", value: selected.university_name },
                { label: "Program", value: selected.program_name },
                ...(isAgencyAdmin
                  ? [{ label: "Advisor", value: selected.partner_name }]
                  : []),
                {
                  label: "Status since",
                  value: <AppDate value={selected.since_date} format="short" />,
                },
                { label: "Payout reference", value: selected.payout_reference },
              ]}
            />
          </div>
        )}
      </Drawer>
    </section>
  );
}
