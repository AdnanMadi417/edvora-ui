"use client";

import React, { useEffect, useState } from "react";
import { Wallet, SlidersHorizontal, Receipt, RefreshCw } from "lucide-react";

import SearchInput from "components/ub/forms/selection/SearchInput";
import FilterSelectField from "components/ub/forms/selection/FilterSelectField";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import TablePagination from "components/ub/data/tables/TablePagination";
import DataTable, { type DataTableColumn } from "components/ub/data/tables/DataTable";
import Chip from "components/ub/data/badges/Chip";
import CountBadge from "components/ub/data/badges/CountBadge";
import Tag from "components/ub/data/badges/Tag";
import Checkbox from "components/ub/forms/choices/Checkbox";
import DashboardHeader from "components/ub/dashboard/shared/DashboardHeader";
import { card } from "components/ub/recipes";
import { getAsyncStatus } from "components/ub/feedback/states/AsyncStatus";
import { STATUS_BADGE_TONE, type StatusBadgeVariant } from "components/ub/data/badges/StatusBadge";
import Tooltip from "components/ub/feedback/dialogs/Tooltip";
import AppDate from "components/ub/data/formatting/AppDate";
import { formatCommissionAmount } from "features/applications/shared/commissionTypes";

import { usePartners } from "features/partners/hooks/management/usePartners";
import type { Partner } from "features/partners/types";
import { RecordPayIn, type RecordPayInRow } from "features/applications/pay-ins";
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
  { value: "university", label: "Waiting on University" },
  { value: "us", label: "Waiting on Us" },
  { value: "disputed", label: "Disputed" },
  { value: "nobody", label: "Settled" },
];

export default function FinanceQueuePage() {
  // --- Filters ---
  const [partnerSearch, setPartnerSearch] = useState("");
  const [debouncedPartnerSearch, setDebouncedPartnerSearch] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [waitingOnFilter, setWaitingOnFilter] = useState<WaitingOn | undefined>(undefined);
  const [hideSettled, setHideSettled] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedPartnerSearch(partnerSearch.trim()), 400);
    return () => clearTimeout(t);
  }, [partnerSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPartner?.id, waitingOnFilter, hideSettled]);

  const { partners, loading: partnersLoading } = usePartners(
    debouncedPartnerSearch.length >= 2 && !selectedPartner ? { search: debouncedPartnerSearch, page_size: 10 } : {}
  );
  const showPartnerResults = !selectedPartner && debouncedPartnerSearch.length >= 2;

  const { items, total, loading, error, refetch } = useCommissionQueue({
    page: currentPage,
    page_size: PAGE_SIZE,
    partner_id: selectedPartner?.id,
    waiting_on: waitingOnFilter,
    hide_settled: hideSettled,
  });

  const status = getAsyncStatus(loading, error, items, (r) => r.length === 0);
  const activeFiltersCount =
    (selectedPartner ? 1 : 0) + (waitingOnFilter ? 1 : 0) + (hideSettled ? 1 : 0);
  const clearFilters = () => {
    setSelectedPartner(null);
    setPartnerSearch("");
    setWaitingOnFilter(undefined);
    setHideSettled(false);
  };

  // --- Record Pay-In ---
  const [recordPayInRow, setRecordPayInRow] = useState<RecordPayInRow | null>(null);

  // --- Batch Payout selection (locked to one partner + one currency) ---
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchPayout, setShowBatchPayout] = useState(false);
  const selectedItems = items.filter((i) => selectedIds.has(i.application_commission_id));
  const lockedPartnerId = selectedItems[0]?.partner_id;
  const lockedCurrency = selectedItems[0]?.commission_currency;

  useEffect(() => {
    setSelectedIds(new Set());
  }, [selectedPartner?.id, waitingOnFilter, hideSettled, currentPage]);


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
    { key: "reference", header: "Reference", cell: (item) => <span className="ub-ref whitespace-nowrap text-ub-label-md text-ub-text-primary">{item.reference}</span> },
    { key: "student", header: "Student", cell: (item) => item.student_name },
    { key: "advisor", header: "Advisor", cell: (item) => item.partner_name ?? "—" },
    {
      key: "programme",
      header: "University / Program",
      cell: (item) => (
        <span className="block min-w-0">
          <span className="block truncate">{item.university_name}</span>
          <span className="block truncate text-ub-caption text-ub-text-tertiary">{item.program_name}</span>
        </span>
      ),
    },
    {
      key: "commission",
      header: "Commission",
      align: "end",
      cell: (item) => (
        <span className="block whitespace-nowrap">
          <span className="block font-medium text-ub-text-primary">{item.commission_amount != null ? formatCommissionAmount(item.commission_amount, item.commission_currency) : "—"}</span>
          {item.received_amount != null && <span className="block text-ub-caption text-ub-text-tertiary">Received: {formatCommissionAmount(item.received_amount, item.received_currency ?? item.commission_currency)}</span>}
          {item.paid_amount != null && <span className="block text-ub-caption text-ub-text-tertiary">Paid: {formatCommissionAmount(item.paid_amount, item.paid_currency ?? item.commission_currency)}</span>}
        </span>
      ),
    },
    {
      key: "waiting",
      header: "Waiting On",
      cell: (item) => (
        <Tag tone={STATUS_BADGE_TONE[WAITING_ON_VARIANT[item.waiting_on]]} size="sm">
          {WAITING_ON_LABEL[item.waiting_on]}
        </Tag>
      ),
    },
    {
      key: "days",
      header: "Days Waiting",
      cell: (item) => {
        const overdue = item.days_waiting != null && item.typical_days_to != null && item.days_waiting > item.typical_days_to;
        return (
          <span className="block">
            {item.days_waiting != null ? (
              <span className={overdue ? "block whitespace-nowrap font-medium text-ub-tone-warning-text" : "block whitespace-nowrap"}>
                {item.days_waiting} day{item.days_waiting === 1 ? "" : "s"}
              </span>
            ) : (
              <span className="block text-ub-text-tertiary">—</span>
            )}
            {item.last_fact_date && (
              <span className="block whitespace-nowrap text-ub-caption text-ub-text-tertiary">
                <AppDate value={item.last_fact_date} format="short" />
                {item.last_fact_reference ? ` · ${item.last_fact_reference}` : ""}
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      cell: (item) =>
        item.waiting_on === "university" ? (
          <Tooltip content="Record pay-in" position="left">
            <IconButton
              variant="tertiary"
              size="sm"
              onClick={() => setRecordPayInRow({ application_id: item.application_id, reference: item.reference, student_name: item.student_name })}
              aria-label="Record pay-in"
              title="Record pay-in"
              icon={<Receipt className="h-4 w-4" aria-hidden="true" />}
            />
          </Tooltip>
        ) : null,
    },
  ];

  // Batch payout: only rows waiting on us, locked to the first selection's advisor and currency.
  const selectableReason = (item: CommissionQueueItem): true | string => {
    if (item.waiting_on !== "us") return "Only commissions waiting on us can be paid";
    const isSelected = selectedIds.has(item.application_commission_id);
    const matchesLock = selectedIds.size === 0 || (item.partner_id === lockedPartnerId && item.commission_currency === lockedCurrency);
    return isSelected || matchesLock ? true : "Batch payout is limited to one advisor and one currency at a time";
  };

  return (
    <div className={`mx-auto mt-5 ${card}`}>
      <DashboardHeader as="h2" title="Finance Queue" subtitle="Every commission, who's waiting on it, and how to settle it." className="border-b border-ub-border p-6" />

      {/* Filters */}
      <div className="flex flex-col gap-2 border-b border-ub-border p-6 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex items-center gap-2 sm:contents">
          <div className="relative w-full sm:w-64 sm:flex-none">
            {selectedPartner ? (
              <Chip selected onRemove={() => setSelectedPartner(null)} removeLabel="Clear advisor filter">
                {selectedPartner.name}
              </Chip>
            ) : (
              <SearchInput
                value={partnerSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPartnerSearch(e.target.value)}
                placeholder="Filter by advisor..."
              />
            )}
            {showPartnerResults && (
              <div className="absolute z-10 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                {partnersLoading ? (
                  <p className="p-4 text-sm text-slate-500">Searching...</p>
                ) : partners.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500">No advisors found.</p>
                ) : (
                  partners.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPartner(p);
                        setPartnerSearch("");
                      }}
                      className="flex w-full flex-col items-start px-4 py-3 text-left hover:bg-slate-50"
                    >
                      <span className="text-sm font-medium text-slate-900">{p.name}</span>
                      <span className="text-xs text-slate-500">{p.email}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <span className="relative sm:hidden">
            <IconButton variant="secondary" onClick={() => setShowMobileFilters((v) => !v)} aria-label="Show filters" title="Filters" icon={<SlidersHorizontal className="h-4 w-4" aria-hidden="true" />} />
            {activeFiltersCount > 0 && <CountBadge count={activeFiltersCount} label={(n) => `${n} active filters`} className="absolute -end-1 -top-1" />}
          </span>
        </div>

        <div className={`flex w-full flex-col gap-2 overflow-hidden transition-all duration-300 ease-in-out sm:contents ${showMobileFilters ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 sm:max-h-none sm:opacity-100"}`}>
          <div className="w-full sm:w-56 sm:flex-none">
            <FilterSelectField
              value={waitingOnFilter ?? "all"}
              onChange={(v: string) => setWaitingOnFilter(v === "all" ? undefined : (v as WaitingOn))}
              options={WAITING_ON_OPTIONS}
              defaultOption="All States"
            />
          </div>

          {waitingOnFilter !== "nobody" && <Checkbox checked={hideSettled} onChange={setHideSettled} label="Hide settled" className="sm:w-auto" />}

          {activeFiltersCount > 0 && <Button variant="secondary" onClick={clearFilters} icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />} text="Clear" />}
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        <DataTable<CommissionQueueItem>
          caption="Finance queue"
          columns={columns}
          rows={items}
          getRowId={(item) => item.application_commission_id}
          getRowLabel={(item) => `${item.reference}, ${item.student_name}`}
          getRowHref={(item) => `/admin/applications/${item.application_id}`}
          manualSort
          loading={status === "loading"}
          error={status === "error" ? error ?? "Couldn't load the finance queue." : null}
          onRetry={refetch}
          empty={{ title: "No commissions found", description: activeFiltersCount > 0 ? "Try adjusting your filters." : "Nothing in the queue yet.", icon: <Wallet aria-hidden="true" /> }}
          selectable
          selectedIds={Array.from(selectedIds)}
          onSelectionChange={(ids) => setSelectedIds(new Set(ids))}
          isRowSelectable={selectableReason}
          selectionResetKey={[selectedPartner?.id, waitingOnFilter, hideSettled, currentPage].join("|")}
          bulkActions={(ids) => (
            <>
              <span className="text-ub-body-sm text-ub-text-secondary">{lockedCurrency}</span>
              <Button variant="primary" size="sm" onClick={() => setShowBatchPayout(true)} icon={<Wallet className="h-4 w-4" aria-hidden="true" />} text={`Pay Selected (${ids.length})`} />
            </>
          )}
          footer={
            <TablePagination currentPage={currentPage} onPageChange={setCurrentPage} itemsPerPage={PAGE_SIZE} itemCount={items.length} totalCount={total} itemLabel="commissions" loading={status === "loading"} />
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
    </div>
  );
}
