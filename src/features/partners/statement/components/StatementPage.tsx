"use client";
import { tableSectionPadding } from "components/ub/recipes";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowUpRight, CheckCircle2, Eye, Hourglass, Landmark, Receipt, Wallet } from "lucide-react";
import StatsFilterCards, { type FilterCardItem } from "components/ub/navigation/controls/StatsFilterCards";
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
import Skeleton from "components/ub/feedback/states/Skeleton";
import { formatCurrency } from "lib/format";
import { unibexsVoice } from "lib/unibexsVoice";
import { usePartnerProfile } from "features/partners/hooks/profile/usePartnerProfile";
import { useAgencyMembers } from "features/agency-members/hooks/useAgencyMembers";
import { useExpectedCommissions, useStatement, useStatementCounts, type ExpectedRow } from "../hooks";
import type { PartnerStatementItem, WaitingOn } from "../types";
import ExpectedSummary from "./ExpectedSummary";
import { normaliseCurrency } from "../utils/expected";
import FilterButton from "components/ub/core/buttons/FilterButton";
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
/** One line under each status: what happens next, and who does it. */
const NEXT_STEP: Record<WaitingOn, string> = {
  university: "Waiting for the university to pay Unibexs.",
  us: "Unibexs will pay this to your bank account.",
  nobody: "Paid to your bank account.",
  disputed: "Unibexs is reviewing the dispute.",
};
/** "expected": active applications before the commission stage (built from their details, not the statement). */
type StatusFilter = "all" | "expected" | WaitingOn;
const EXPECTED = {
  label: "Expected",
  variant: "neutral" as StatusBadgeVariant,
  next: "Commission becomes due once the student reaches the commission stage.",
};
const SUMMARY: { id: WaitingOn; icon: FilterCardItem["icon"]; colorScheme: FilterCardItem["colorScheme"] }[] = [
  { id: "us", icon: Wallet, colorScheme: "amber" },
  { id: "university", icon: Landmark, colorScheme: "blue" },
  { id: "nobody", icon: CheckCircle2, colorScheme: "emerald" },
  { id: "disputed", icon: AlertTriangle, colorScheme: "rose" },
];
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
    ? formatCurrency(item.commission_amount, { currency: normaliseCurrency(item.commission_currency) })
    : "Not available";
const expectedBadge = () => (
  <StatusBadge variant={EXPECTED.variant}>{EXPECTED.label}</StatusBadge>
);
/** Expected amount, or why there isn't one yet. */
const expectedAmount = (row: ExpectedRow) => {
  if (row.status === "loading")
    return (
      <>
        <Skeleton className="inline-block h-4 w-20 align-middle" />
        <span className="sr-only">Loading amount</span>
      </>
    );
  if (row.status === "failed") return "Couldn't load";
  return row.expected?.amount != null
    ? formatCurrency(row.expected.amount, { currency: row.expected.currency })
    : "Not available";
};
const stageName = (row: ExpectedRow) => unibexsVoice(row.application.stage) || "Not available";
export default function StatementPage() {
  const { partner } = usePartnerProfile();
  const isAgencyAdmin =
    partner?.type === "agency" && partner.agency_role === "admin";
  const { members } = useAgencyMembers({
    is_active: true,
    page_size: 100,
    enabled: isAgencyAdmin,
  });
  const [filters, setFilters] = useState<{ status: StatusFilter; member: string }>({ status: "all", member: "" });
  const [draft, setDraft] = useState(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PartnerStatementItem | null>(null);
  const [selectedExpected, setSelectedExpected] = useState<ExpectedRow | null>(null);
  const memberFilter = isAgencyAdmin ? filters.member : "";
  const showExpected = filters.status === "expected";
  const { items, total, loading, error, refetch } = useStatement({
    page: showExpected ? 1 : page,
    page_size: PAGE_SIZE,
    waiting_on:
      filters.status === "all" || showExpected ? undefined : (filters.status as WaitingOn),
    member_partner_id: memberFilter || undefined,
  });
  const counts = useStatementCounts({ member_partner_id: memberFilter || undefined });
  // Members see their own applications; agency admins see the team's, narrowed by the member filter.
  const expected = useExpectedCommissions({
    partnerId: partner?.id,
    includeMembers: isAgencyAdmin,
    memberPartnerId: memberFilter || undefined,
    enabled: Boolean(partner),
  });
  const summaryCards: FilterCardItem[] = [
    {
      id: "expected",
      label: EXPECTED.label,
      count: expected.loading || expected.error ? "–" : expected.rows.length,
      icon: Hourglass,
      colorScheme: "violet",
    },
    ...SUMMARY.map(({ id, icon, colorScheme }) => ({
      id,
      // Five tiles share a row on desktop, so the long label is shortened here only.
      label: id === "university" ? "With university" : STATES[id].label,
      count: counts ? counts[id] : "–",
      icon,
      colorScheme,
    })),
  ];
  const query = search.trim().toLowerCase();
  const rows = items.filter((item) =>
    `${item.reference} ${item.student_name} ${item.university_name} ${
      item.program_name
    } ${item.partner_name || ""} ${item.payout_reference || ""}`
      .toLowerCase()
      .includes(query)
  );
  // Expected rows are all in memory, so search covers every one and pages are sliced here.
  const expectedMatches = expected.rows.filter(({ application: app }) =>
    `${app.student_name} ${app.university_name} ${app.program_name} ${app.stage} ${
      app.status
    } ${app.partner_name || ""}`
      .toLowerCase()
      .includes(query)
  );
  const expectedPage = expectedMatches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const listTotal = showExpected ? expectedMatches.length : total;
  const listLoading = showExpected ? expected.loading : loading;
  const listError = showExpected ? expected.error : error;
  const filterCount =
    Number(filters.status !== "all") + Number(Boolean(memberFilter));
  useEffect(() => {
    const last = Math.max(1, Math.ceil(listTotal / PAGE_SIZE));
    if (!listLoading && !listError && page > last) setPage(last);
  }, [listTotal, listLoading, listError, page]);
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
      mobileSecondary: true,
            header: "Team member",
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
      mobileSecondary: true,
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
      cell: (item) => (
        <span className="flex max-w-[220px] flex-col items-start gap-1">
          {stateBadge(item.waiting_on)}
          <span className="text-ub-caption text-ub-text-tertiary">{NEXT_STEP[item.waiting_on]}</span>
        </span>
      ),
    },
    {
      key: "since_date",
      mobileSecondary: true,
      header: "Status since",
      cell: (item) => (
        <span className="whitespace-nowrap">
          <AppDate value={item.since_date} format="short" />
        </span>
      ),
    },
    {
      key: "payout_reference",
      mobileSecondary: true,
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
        <TableActions>
          <TableAction
            label={`View commission ${item.reference}`}
            icon={<Eye className="h-4 w-4" />}
            onSelect={() => setSelected(item)}
          />
        </TableActions>
      ),
    },
  ];
  const expectedColumns: DataTableColumn<ExpectedRow>[] = [
    {
      key: "student_name",
      header: "Student",
      cell: (row) => (
        <p className="max-w-[200px] break-words font-medium">
          {row.application.student_name}
        </p>
      ),
    },
    ...(isAgencyAdmin
      ? [
          {
            key: "partner_name",
            mobileSecondary: true,
            header: "Team member",
            cell: (row: ExpectedRow) => (
              <p className="max-w-[180px] break-words">
                {row.application.partner_name || "Not provided"}
              </p>
            ),
          },
        ]
      : []),
    {
      key: "program",
      mobileSecondary: true,
      header: "University / program",
      cell: (row) => (
        <div className="max-w-xs space-y-1">
          <p className="line-clamp-2 break-words text-ub-label-sm" title={row.application.university_name}>
            {row.application.university_name}
          </p>
          <p
            className="line-clamp-2 break-words text-ub-body-sm text-ub-text-secondary"
            title={row.application.program_name}
          >
            {row.application.program_name}
          </p>
        </div>
      ),
    },
    {
      key: "expected_amount",
      header: "Expected commission",
      cell: (row) => (
        <span className="whitespace-nowrap text-ub-label-md ub-tabular">
          {expectedAmount(row)}
        </span>
      ),
    },
    {
      key: "stage",
      header: "Status",
      cell: (row) => (
        <span className="flex max-w-[220px] flex-col items-start gap-1">
          {expectedBadge()}
          <span className="text-ub-caption text-ub-text-tertiary">
            Now at {stageName(row)}
          </span>
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <TableActions>
          <TableAction
            label={`View expected commission for ${row.application.student_name}`}
            icon={<Eye className="h-4 w-4" />}
            onSelect={() => setSelectedExpected(row)}
          />
        </TableActions>
      ),
    },
  ];
  const emptyState = {
    title: showExpected ? "No expected commission" : "No commissions found",
    description: search
      ? showExpected
        ? "No applications match your search. Try another search."
        : "No entries on this page match your search. Try another search or page."
      : filterCount && !showExpected
      ? "Try changing or clearing your filters."
      : showExpected
      ? "Applications in progress appear here until they reach the commission stage."
      : "Your commissions will appear here when available.",
  };
  // The drawer reads the live row, so its amount fills in once loaded.
  const expectedDetail = selectedExpected
    ? expected.rows.find((r) => r.application.id === selectedExpected.application.id) ?? selectedExpected
    : null;
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
            See the commission coming from applications in progress, then track
            it from the university through to payment.
          </p>
        </div>
      </header>
      <div className="space-y-4 border-b border-ub-border p-4 sm:p-6">
        <ExpectedSummary
          totals={expected.totals}
          count={expected.rows.length}
          loading={expected.loading}
          error={expected.error}
          pending={expected.pending}
          failed={expected.failed}
          onRetry={expected.retry}
        />
        <StatsFilterCards
          cards={summaryCards}
          selectedId={filters.status === "all" ? null : filters.status}
          onSelect={(id) => {
            setFilters((f) => ({ ...f, status: (id ?? "all") as StatusFilter }));
            setPage(1);
            setSelected(null);
            setSelectedExpected(null);
          }}
          className="grid grid-cols-2 gap-3 lg:grid-cols-5 [&>*:first-child]:col-span-2 lg:[&>*:first-child]:col-span-1"
        />
        <DataTableToolbar
          className="!mb-0"
          search={{
            value: search,
            onChange: setSearch,
            placeholder: showExpected
              ? "Search by student, university, or stage..."
              : "Search this page by application, student, or university...",
          }}
          filters={
            <FilterButton
              count={filterCount}
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
                {listLoading
                  ? "Updating…"
                  : showExpected
                  ? `${expected.rows.length} expected`
                  : `${total} commissions`}
              </p>
            </div>
          }
        />
        {search.trim() && (
          <p role="status" className="text-ub-caption text-ub-text-secondary">
            {showExpected
              ? `${expectedMatches.length} of ${expected.rows.length} expected match.`
              : `${rows.length} of ${items.length} entries match on this page.`}
          </p>
        )}
      </div>
      <div className={`min-w-0 ${tableSectionPadding}`}>
        {showExpected ? (
          <DataTable
            columns={expectedColumns}
            rows={expectedPage}
            getRowId={(row) => row.application.id}
            getRowHref={(row) => `/partner/applications/${row.application.id}`}
            caption="Expected commission"
            loading={expected.loading}
            error={expected.error}
            onRetry={expected.retry}
            getRowClassName={() => "md:[&>td]:py-4"}
            scrollClassName="max-h-[60dvh] overflow-y-auto overscroll-contain md:max-h-[65dvh]"
            empty={emptyState}
            footer={
              <TablePagination
                currentPage={page}
                onPageChange={(value) => {
                  setPage(value);
                  setSelectedExpected(null);
                }}
                itemsPerPage={PAGE_SIZE}
                itemCount={expectedPage.length}
                totalCount={expectedMatches.length}
                itemLabel="applications"
                loading={expected.loading}
              />
            }
          />
        ) : (
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
            scrollClassName="max-h-[60dvh] overflow-y-auto overscroll-contain md:max-h-[65dvh]"
            empty={emptyState}
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
        )}
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
                const empty = { status: "all" as StatusFilter, member: "" };
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
                setSelectedExpected(null);
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
              setDraft((prev) => ({ ...prev, [field]: String(value) as StatusFilter }))
            }
            options={[
              { value: "all", label: "All at the commission stage" },
              { value: "expected", label: "Expected (before the commission stage)" },
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
                  ? [{ label: "Team member", value: selected.partner_name }]
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
      <Drawer
        open={Boolean(expectedDetail)}
        onClose={() => setSelectedExpected(null)}
        title="Expected commission"
        description={expectedDetail?.application.student_name}
        footer={
          expectedDetail ? (
            <LinkBtn
              href={`/partner/applications/${expectedDetail.application.id}`}
              label="Open application"
              variant="primary"
              icon={<ArrowUpRight className="h-4 w-4" />}
            />
          ) : undefined
        }
      >
        {expectedDetail && (
          <div className="space-y-6">
            <div className="rounded-ub-lg border border-ub-border bg-ub-surface-subtle p-4">
              <p className="text-ub-label-sm text-ub-text-secondary">Expected commission</p>
              <p className="mt-2 text-ub-heading-lg ub-tabular">{expectedAmount(expectedDetail)}</p>
              <div className="mt-3">{expectedBadge()}</div>
              <p className="mt-2 text-ub-caption text-ub-text-tertiary">{EXPECTED.next}</p>
            </div>
            <DescriptionList
              divided
              fallback="Not available"
              items={[
                { label: "Student", value: expectedDetail.application.student_name },
                { label: "University", value: expectedDetail.application.university_name },
                { label: "Program", value: expectedDetail.application.program_name },
                { label: "Current stage", value: stageName(expectedDetail) },
                { label: "Status", value: unibexsVoice(expectedDetail.application.status) },
                ...(isAgencyAdmin
                  ? [{ label: "Team member", value: expectedDetail.application.partner_name }]
                  : []),
              ]}
            />
          </div>
        )}
      </Drawer>
    </section>
  );
}
