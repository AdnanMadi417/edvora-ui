"use client";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";

import React, { useEffect, useState } from "react";
import {
  Wallet,
  SlidersHorizontal,
  Receipt,
  Eye,
  ArrowUpRight,
} from "lucide-react";

import Combobox from "components/ub/forms/selection/Combobox";
import SelectField from "components/ub/forms/selection/SelectField";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import DescriptionList from "components/ub/data/display/DescriptionList";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import TablePagination from "components/ub/data/tables/TablePagination";
import DataTable, {
  type DataTableColumn,
} from "components/ub/data/tables/DataTable";
import Chip from "components/ub/data/badges/Chip";
import StatusTag from "components/ub/dashboard/shared/StatusTag";
import Checkbox from "components/ub/forms/choices/Checkbox";
import { getAsyncStatus } from "components/ub/feedback/states/AsyncStatus";
import {
  STATUS_BADGE_TONE,
  type StatusBadgeVariant,
} from "components/ub/data/badges/StatusBadge";
import Tooltip from "components/ub/feedback/dialogs/Tooltip";
import AppDate from "components/ub/data/formatting/AppDate";
import { formatCommissionAmount } from "features/applications/shared/commissionTypes";

import { usePartners } from "features/partners/hooks/management/usePartners";
import type { Partner } from "features/partners/types";
import {
  RecordPayIn,
  type RecordPayInRow,
} from "features/applications/pay-ins";
import { useCommissionQueue } from "../../hooks";
import type { CommissionQueueItem, WaitingOn } from "../../types";
import BatchPayout, { type BatchPayoutLine } from "./BatchPayout";

const PAGE_SIZE = 20;

const WAITING_ON_VARIANT: Record<WaitingOn, StatusBadgeVariant> = {
  university: "info",
  us: "attention",
  nobody: "success",
  disputed: "danger",
};

const WAITING_ON_LABEL: Record<WaitingOn, string> = {
  university: "Waiting on University",
  us: "Waiting on Us",
  nobody: "Settled",
  disputed: "Disputed",
};

const WAITING_ON_OPTIONS = [
  { value: "university", label: "Waiting on university" },
  { value: "us", label: "Waiting on us" },
  { value: "disputed", label: "Disputed" },
  { value: "nobody", label: "Settled" },
];

export default function FinanceQueuePage() {
  // --- Filters ---
  const [partnerSearch, setPartnerSearch] = useState("");
  const [debouncedPartnerSearch, setDebouncedPartnerSearch] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [waitingOnFilter, setWaitingOnFilter] = useState<WaitingOn | undefined>(
    undefined
  );
  const [hideSettled, setHideSettled] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<{
    partner: Partner | null;
    waiting: WaitingOn | "all";
    hideSettled: boolean;
  }>({ partner: null, waiting: "all", hideSettled: false });
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<CommissionQueueItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedPartnerSearch(partnerSearch.trim()),
      400
    );
    return () => clearTimeout(t);
  }, [partnerSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPartner?.id, waitingOnFilter, hideSettled]);

  const { partners, loading: partnersLoading } = usePartners(
    debouncedPartnerSearch.length >= 2 && !draft.partner
      ? { search: debouncedPartnerSearch, page_size: 10 }
      : {}
  );
  const showPartnerResults =
    !draft.partner && debouncedPartnerSearch.length >= 2;

  const { items, total, loading, error, refetch } = useCommissionQueue({
    page: currentPage,
    page_size: PAGE_SIZE,
    partner_id: selectedPartner?.id,
    waiting_on: waitingOnFilter,
    hide_settled: hideSettled,
  });

  const visibleItems = items.filter((item) =>
    `${item.reference} ${item.student_name} ${item.partner_name || ""} ${
      item.university_name
    } ${item.program_name}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );
  const status = getAsyncStatus(
    loading,
    error,
    visibleItems,
    (r) => r.length === 0
  );
  const activeFiltersCount =
    (selectedPartner ? 1 : 0) +
    (waitingOnFilter ? 1 : 0) +
    (hideSettled ? 1 : 0);
  const clearFilters = () => {
    setSelectedPartner(null);
    setPartnerSearch("");
    setWaitingOnFilter(undefined);
    setHideSettled(false);
    setSearch("");
    setCurrentPage(1);
  };

  // --- Record Pay-In ---
  const [recordPayInRow, setRecordPayInRow] = useState<RecordPayInRow | null>(
    null
  );

  // --- Batch Payout selection (locked to one partner + one currency) ---
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchPayout, setShowBatchPayout] = useState(false);
  const selectedItems = items.filter(
    (i) => selectedIds.has(i.application_commission_id) && i.waiting_on === "us"
  );
  const lockedPartnerId = selectedItems[0]?.partner_id;
  const lockedCurrency = selectedItems[0]?.commission_currency;

  useEffect(() => {
    setSelectedIds(new Set());
  }, [selectedPartner?.id, waitingOnFilter, hideSettled, currentPage]);

  useEffect(() => {
    setSelectedIds((previous) => {
      const eligible = items.filter(
        (item) =>
          previous.has(item.application_commission_id) &&
          item.waiting_on === "us"
      );
      const first = eligible[0];
      const next = new Set(
        eligible
          .filter(
            (item) =>
              item.partner_id === first?.partner_id &&
              item.commission_currency === first?.commission_currency
          )
          .map((item) => item.application_commission_id)
      );
      return next.size === previous.size &&
        Array.from(next).every((id) => previous.has(id))
        ? previous
        : next;
    });
  }, [items]);

  const batchPayoutLines: BatchPayoutLine[] = selectedItems.map((i) => ({
    application_id: i.application_id,
    reference: i.reference,
    student_name: i.student_name,
    commission_amount: i.commission_amount,
  }));

  const handleActionSuccess = () => {
    setSelectedIds(new Set());
    refetch();
  };

  const columns: DataTableColumn<CommissionQueueItem>[] = [
    {
      key: "reference",
      header: "Reference",
      cell: (item) => (
        <span className="ub-ref whitespace-nowrap text-ub-label-md text-ub-text-primary">
          {item.reference}
        </span>
      ),
    },
    { key: "student", header: "Student", cell: (item) => item.student_name },
    {
      key: "advisor",
      header: "Advisor",
      cell: (item) => item.partner_name ?? "—",
    },
    {
      key: "programme",
      header: "University / Program",
      width: "260px",
      cell: (item) => (
        <span className="flex min-w-0 flex-col gap-1.5 md:w-[240px]">
          <span
            className="line-clamp-2 break-words font-medium leading-relaxed text-ub-text-primary"
            title={item.university_name}
          >
            {item.university_name}
          </span>
          <span
            className="line-clamp-2 break-words text-ub-body-sm leading-relaxed text-ub-text-secondary"
            title={item.program_name}
          >
            {item.program_name}
          </span>
        </span>
      ),
    },
    {
      key: "commission",
      header: "Commission",
      align: "end",
      cell: (item) => (
        <span className="block whitespace-nowrap">
          <span className="block font-medium text-ub-text-primary">
            {item.commission_amount != null
              ? formatCommissionAmount(
                  item.commission_amount,
                  item.commission_currency
                )
              : "—"}
          </span>
          {item.received_amount != null && (
            <span className="block text-ub-caption text-ub-text-tertiary">
              Received:{" "}
              {formatCommissionAmount(
                item.received_amount,
                item.received_currency ?? item.commission_currency
              )}
            </span>
          )}
          {item.paid_amount != null && (
            <span className="block text-ub-caption text-ub-text-tertiary">
              Paid:{" "}
              {formatCommissionAmount(
                item.paid_amount,
                item.paid_currency ?? item.commission_currency
              )}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "waiting",
      header: "Waiting On",
      cell: (item) => (
        <StatusTag
          status={item.waiting_on}
          label={WAITING_ON_LABEL[item.waiting_on]}
          tone={STATUS_BADGE_TONE[WAITING_ON_VARIANT[item.waiting_on]]}
          size="sm"
        />
      ),
    },
    {
      key: "days",
      header: "Days Waiting",
      cell: (item) => {
        const overdue =
          item.days_waiting != null &&
          item.typical_days_to != null &&
          item.days_waiting > item.typical_days_to;
        return (
          <span className="block">
            {item.days_waiting != null ? (
              <span
                className={
                  overdue
                    ? "block whitespace-nowrap font-medium text-ub-tone-warning-text"
                    : "block whitespace-nowrap"
                }
              >
                {item.days_waiting} day{item.days_waiting === 1 ? "" : "s"}
              </span>
            ) : (
              <span className="block text-ub-text-tertiary">—</span>
            )}
            {item.last_fact_date && (
              <span className="block whitespace-nowrap text-ub-caption text-ub-text-tertiary">
                <AppDate value={item.last_fact_date} format="short" />
                {item.last_fact_reference
                  ? ` · ${item.last_fact_reference}`
                  : ""}
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      cell: (item) => (
        <TableActions>
          <TableAction
            label={`View commission ${item.reference}`}
            icon={<Eye className="h-4 w-4" />}
            onSelect={() => setPreview(item)}
          />
          {item.waiting_on === "university" ? (
            <Tooltip content="Record pay-in" position="left">
              <TableAction
                label={"Record pay-in"}
                icon={<Receipt className="h-4 w-4" aria-hidden="true" />}
                onSelect={() =>
                  setRecordPayInRow({
                    application_id: item.application_id,
                    reference: item.reference,
                    student_name: item.student_name,
                  })
                }
              />
            </Tooltip>
          ) : null}
        </TableActions>
      ),
    },
  ];

  // Batch payout: only rows waiting on us, locked to the first selection's advisor and currency.
  const selectableReason = (item: CommissionQueueItem): true | string => {
    if (item.waiting_on !== "us")
      return "Only commissions waiting on us can be paid";
    const isSelected = selectedIds.has(item.application_commission_id);
    const matchesLock =
      selectedIds.size === 0 ||
      (item.partner_id === lockedPartnerId &&
        item.commission_currency === lockedCurrency);
    return isSelected || matchesLock
      ? true
      : "Batch payout is limited to one advisor and one currency at a time";
  };

  return (
    <section className="mx-auto mt-5 min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      <header className="flex items-start gap-3 border-b border-ub-border p-4 sm:p-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-ub-md bg-ub-tone-brand-bg text-ub-tone-brand-text">
          <Wallet className="h-5 w-5" />
        </span>
        <div>
          <p className="text-ub-label-md">Manage commission payments</p>
          <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
            Review incoming university payments and settle advisor commissions.
            Batch payouts are limited to one advisor and currency.
          </p>
        </div>
      </header>
      <div className="space-y-3 border-b border-ub-border p-4 sm:p-6">
        <DataTableToolbar
          className="!mb-0"
          search={{
            value: search,
            onChange: (value) => {
              setSearch(value);
              setSelectedIds(new Set());
            },
            placeholder:
              "Search this page by application, student, or advisor...",
          }}
          filters={
            <Button
              variant="secondary"
              text={
                activeFiltersCount
                  ? `Filters (${activeFiltersCount})`
                  : "Filters"
              }
              icon={<SlidersHorizontal className="h-4 w-4" />}
              onClick={() => {
                setDraft({
                  partner: selectedPartner,
                  waiting: waitingOnFilter || "all",
                  hideSettled,
                });
                setPartnerSearch("");
                setFiltersOpen(true);
              }}
            />
          }
          actions={
            <div className="flex items-center gap-3">
              {(search || activeFiltersCount > 0) && (
                <Button
                  text="Clear"
                  variant="tertiary"
                  onClick={clearFilters}
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
          <p className="text-ub-caption text-ub-text-secondary">
            {visibleItems.length} of {items.length} entries match on this page.
          </p>
        )}
      </div>
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter finance queue"
        description="Choose an advisor, payment status, and settled visibility."
        footer={
          <>
            <Button
              text="Clear filters"
              variant="secondary"
              onClick={() => {
                setSelectedPartner(null);
                setWaitingOnFilter(undefined);
                setHideSettled(false);
                setDraft({ partner: null, waiting: "all", hideSettled: false });
                setCurrentPage(1);
                setFiltersOpen(false);
              }}
            />
            <Button
              text="Apply filters"
              variant="primary"
              onClick={() => {
                setSelectedPartner(draft.partner);
                setWaitingOnFilter(
                  draft.waiting === "all" ? undefined : draft.waiting
                );
                setHideSettled(
                  draft.waiting === "nobody" ? false : draft.hideSettled
                );
                setCurrentPage(1);
                setFiltersOpen(false);
              }}
            />
          </>
        }
      >
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-ub-label-sm">Advisor</p>
            {draft.partner ? (
              <Chip
                selected
                onRemove={() =>
                  setDraft((prev) => ({ ...prev, partner: null }))
                }
                removeLabel="Clear advisor filter"
              >
                {draft.partner.name}
              </Chip>
            ) : (
              <Combobox
                label={null}
                ariaLabel="Filter by advisor"
                id="finance-advisor-filter"
                placeholder="Search advisors by name or email..."
                value={null}
                options={partners.map((partner) => ({
                  value: partner.id,
                  label: partner.name,
                  description: partner.email,
                }))}
                onChange={(id) => {
                  setDraft((prev) => ({
                    ...prev,
                    partner:
                      partners.find((partner) => partner.id === id) || null,
                  }));
                  setPartnerSearch("");
                }}
                searchValue={partnerSearch}
                onSearchChange={setPartnerSearch}
                serverResults
                resultsVisible={showPartnerResults}
                loading={partnersLoading}
                emptyMessage={() => "No advisors found."}
              />
            )}
          </div>
          <SelectField
            label="Payment status"
            field="waiting"
            formData={draft}
            errors={{}}
            updateFormData={(_, value) =>
              setDraft((prev) => ({
                ...prev,
                waiting: value as WaitingOn | "all",
                hideSettled: value === "nobody" ? false : prev.hideSettled,
              }))
            }
            options={[
              { value: "all", label: "All states" },
              ...WAITING_ON_OPTIONS,
            ]}
          />
          {draft.waiting !== "nobody" && (
            <Checkbox
              checked={draft.hideSettled}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, hideSettled: value }))
              }
              label="Hide settled"
            />
          )}
        </div>
      </Drawer>
      {/* Table */}
      <div className="min-w-0 p-3 sm:p-6">
        <DataTable<CommissionQueueItem>
          caption="Finance queue"
          columns={columns}
          rows={visibleItems}
          getRowId={(item) => item.application_commission_id}
          getRowLabel={(item) => `${item.reference}, ${item.student_name}`}
          getRowHref={(item) => `/admin/applications/${item.application_id}`}
          manualSort
          getRowClassName={() => "md:[&>td]:py-4"}
          scrollClassName="max-h-[65dvh] overflow-y-auto overscroll-contain"
          loading={status === "loading"}
          error={
            status === "error"
              ? error ?? "Couldn't load the finance queue."
              : null
          }
          onRetry={refetch}
          empty={{
            title: "No commissions found",
            description: search
              ? "No entries on this page match your search. Try another search or page."
              : activeFiltersCount > 0
              ? "Try adjusting your filters."
              : "Nothing in the queue yet.",
            icon: <Wallet aria-hidden="true" />,
          }}
          selectable
          selectedIds={Array.from(selectedIds)}
          onSelectionChange={(ids) =>
            setSelectedIds((previous) => {
              const requested = items.filter(
                (item) =>
                  ids.includes(item.application_commission_id) &&
                  item.waiting_on === "us"
              );
              const anchor =
                requested.find((item) =>
                  previous.has(item.application_commission_id)
                ) || requested[0];
              return new Set(
                requested
                  .filter(
                    (item) =>
                      item.partner_id === anchor?.partner_id &&
                      item.commission_currency === anchor?.commission_currency
                  )
                  .map((item) => item.application_commission_id)
              );
            })
          }
          isRowSelectable={selectableReason}
          selectionResetKey={[
            selectedPartner?.id,
            waitingOnFilter,
            hideSettled,
            currentPage,
          ].join("|")}
          bulkActions={(ids) => (
            <>
              <span className="text-ub-body-sm text-ub-text-secondary">
                {lockedCurrency}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowBatchPayout(true)}
                icon={<Wallet className="h-4 w-4" aria-hidden="true" />}
                text={`Pay Selected (${ids.length})`}
              />
            </>
          )}
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={PAGE_SIZE}
              itemCount={items.length}
              totalCount={total}
              itemLabel="commissions"
              loading={status === "loading"}
            />
          }
        />
      </div>

      <RecordPayIn
        isOpen={!!recordPayInRow}
        onClose={() => setRecordPayInRow(null)}
        row={recordPayInRow}
        onSuccess={handleActionSuccess}
      />

      {lockedPartnerId && lockedCurrency && (
        <BatchPayout
          isOpen={showBatchPayout}
          onClose={() => setShowBatchPayout(false)}
          partnerId={lockedPartnerId}
          currency={lockedCurrency}
          lines={batchPayoutLines}
          onSuccess={handleActionSuccess}
        />
      )}
      <Drawer
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title="Commission details"
        description={preview?.reference}
        footer={
          preview ? (
            <LinkBtn
              href={`/admin/applications/${preview.application_id}`}
              label="Open application"
              variant="primary"
              icon={<ArrowUpRight className="h-4 w-4" />}
            />
          ) : undefined
        }
      >
        {preview && (
          <div className="space-y-6">
            <div className="rounded-ub-lg border border-ub-border bg-ub-surface-subtle p-4">
              <p className="text-ub-label-sm text-ub-text-secondary">
                Agreed commission
              </p>
              <p className="mt-2 text-ub-heading-lg ub-tabular">
                {preview.commission_amount != null
                  ? formatCommissionAmount(
                      preview.commission_amount,
                      preview.commission_currency
                    )
                  : "Not available"}
              </p>
              <div className="mt-3">
                <StatusTag
                  status={preview.waiting_on}
                  label={WAITING_ON_LABEL[preview.waiting_on]}
                  tone={
                    STATUS_BADGE_TONE[WAITING_ON_VARIANT[preview.waiting_on]]
                  }
                  size="sm"
                />
              </div>
            </div>
            <DescriptionList
              divided
              className="[&_dd]:break-words"
              items={[
                { label: "Application", value: preview.reference },
                { label: "Student", value: preview.student_name },
                { label: "Advisor", value: preview.partner_name },
                { label: "University", value: preview.university_name },
                { label: "Program", value: preview.program_name },
                {
                  label: "Received",
                  value:
                    preview.received_amount != null
                      ? formatCommissionAmount(
                          preview.received_amount,
                          preview.received_currency ||
                            preview.commission_currency
                        )
                      : null,
                },
                {
                  label: "Paid",
                  value:
                    preview.paid_amount != null
                      ? formatCommissionAmount(
                          preview.paid_amount,
                          preview.paid_currency || preview.commission_currency
                        )
                      : null,
                },
                {
                  label: "Days waiting",
                  value:
                    preview.days_waiting != null
                      ? `${preview.days_waiting} days`
                      : null,
                },
                {
                  label: "Latest activity",
                  value: preview.last_fact_date ? (
                    <AppDate value={preview.last_fact_date} format="short" />
                  ) : null,
                },
                {
                  label: "Latest reference",
                  value: preview.last_fact_reference,
                },
              ]}
              fallback="Not available"
            />
          </div>
        )}
      </Drawer>
    </section>
  );
}
