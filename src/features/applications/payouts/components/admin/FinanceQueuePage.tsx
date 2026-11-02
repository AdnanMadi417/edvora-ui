"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Wallet, X, SlidersHorizontal, Receipt, RefreshCw, ChevronRight } from "lucide-react";

import SearchInput from "components/ub/forms/SearchInput";
import FilterSelectField from "components/ub/forms/FilterSelectField";
import Button from "components/ub/core/Button";
import IconButton from "components/ub/core/IconButton";
import TableWrapper from "components/ub/data/TableWrapper";
import TableSkeletonRows from "components/ub/data/TableSkeletonRows";
import TableEmptyRow from "components/ub/data/TableEmptyRow";
import TableErrorRow from "components/ub/data/TableErrorRow";
import TablePagination from "components/ub/data/TablePagination";
import AnimatedTableRow from "components/ub/data/AnimatedTableRow";
import { getAsyncStatus } from "components/ub/feedback/AsyncStatus";
import StatusBadge from "components/ub/data/StatusBadge";
import type { StatusBadgeVariant } from "components/ub/data/StatusBadge";
import Tooltip from "components/ub/feedback/Tooltip";
import AppDate from "components/ub/data/AppDate";
import { formatCommissionAmount } from "features/applications/shared/commissionTypes";

import { usePartners } from "features/partners/hooks/usePartners";
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
  const router = useRouter();
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

  const toggleSelected = (item: CommissionQueueItem) => {
    if (item.waiting_on !== "us") return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.application_commission_id)) next.delete(item.application_commission_id);
      else next.add(item.application_commission_id);
      return next;
    });
  };

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

  return (
    <div className="mx-auto mt-5 max-w-ub-dashboard overflow-hidden rounded-lg border border-slate-200 bg-white text-p2">
      {/* Header */}
      <div className="flex items-center gap-x-4 border-b border-slate-200 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
          <Wallet className="text-blue-700" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Finance Queue</h3>
          <p className="text-sm text-slate-500">
            Every commission, who's waiting on it, and how to settle it.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 border-b border-slate-200 p-6 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex items-center gap-2 sm:contents">
          <div className="relative w-full sm:w-64 sm:flex-none">
            {selectedPartner ? (
              <div className="flex h-10 items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3">
                <span className="truncate text-sm font-medium text-slate-900">{selectedPartner.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedPartner(null)}
                  className="ml-2 shrink-0 text-slate-500 hover:text-slate-700"
                  aria-label="Clear advisor filter"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
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

          <button
            type="button"
            onClick={() => setShowMobileFilters((v) => !v)}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 sm:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div
          className={`flex w-full flex-col gap-2 overflow-hidden transition-all duration-300 ease-in-out sm:contents ${
            showMobileFilters ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 sm:max-h-none sm:opacity-100"
          }`}
        >
          <div className="w-full sm:w-56 sm:flex-none">
            <FilterSelectField
              value={waitingOnFilter ?? "all"}
              onChange={(v: string) => setWaitingOnFilter(v === "all" ? undefined : (v as WaitingOn))}
              options={WAITING_ON_OPTIONS}
              defaultOption="All States"
            />
          </div>

          {waitingOnFilter !== "nobody" && (
            <label className="flex h-10 w-full shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 sm:w-auto">
              <input
                type="checkbox"
                checked={hideSettled}
                onChange={(e) => setHideSettled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Hide settled
            </label>
          )}

          {activeFiltersCount > 0 && (
            <Button
              onClick={clearFilters}
              icon={<RefreshCw className="h-4 w-4" />}
              text="Clear"
              bgColor="bg-white"
              textColor="text-red-600"
              borderColor="border-red-200"
              hoverTextColor="hover:text-red-600"
              hoverBorderColor="hover:border-red-200"
              className="hover:bg-red-50"
            />
          )}
        </div>
      </div>

      {/* Batch payout bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 border-b border-blue-200 bg-blue-50 px-6 py-3">
          <p className="text-sm font-medium text-slate-900">
            {selectedIds.size} selected · {lockedCurrency}
          </p>
          <Button
            onClick={() => setShowBatchPayout(true)}
            icon={<Wallet className="h-4 w-4" />}
            text={`Pay Selected (${selectedIds.size})`}
            bgColor="bg-blue-600"
            textColor="text-white"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-white"
            hoverBorderColor="hover:border-blue-700"
            className="hover:bg-blue-700"
          />
        </div>
      )}

      {/* Table */}
      <div className="p-6">
        <TableWrapper
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
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="w-10 px-6 py-4" />
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Reference</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Student</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Advisor</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">University / Program</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Commission</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Waiting On</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Days Waiting</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Actions</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {status === "loading" && <TableSkeletonRows columns={10} rows={5} />}

              {status === "error" && <TableErrorRow colSpan={10} message={error ?? undefined} onRetry={refetch} />}

              {status === "empty" && (
                <TableEmptyRow
                  colSpan={10}
                  title="No commissions found"
                  subtitle={activeFiltersCount > 0 ? "Try adjusting your filters." : "Nothing in the queue yet."}
                  icon={<Wallet className="h-8 w-8 text-slate-400" />}
                />
              )}

              <AnimatePresence>
                {status === "success" &&
                  items.map((item) => {
                    const isSelectable = item.waiting_on === "us";
                    const isSelected = selectedIds.has(item.application_commission_id);
                    const isLocked = selectedIds.size > 0;
                    const matchesLock =
                      !isLocked ||
                      (item.partner_id === lockedPartnerId && item.commission_currency === lockedCurrency);
                    const checkboxDisabled = !isSelectable || (!isSelected && !matchesLock);
                    const overdue =
                      item.days_waiting != null &&
                      item.typical_days_to != null &&
                      item.days_waiting > item.typical_days_to;

                    return (
                      <AnimatedTableRow
                        key={item.application_commission_id}
                        className="group cursor-pointer transition-colors hover:bg-slate-100/50"
                        onClick={() => router.push(`/admin/applications/${item.application_id}`)}
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          {isSelectable && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={checkboxDisabled}
                              onChange={() => toggleSelected(item)}
                              title={
                                checkboxDisabled && !isSelected
                                  ? "Batch payout is limited to one advisor and one currency at a time"
                                  : undefined
                              }
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                            />
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.reference}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{item.student_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{item.partner_name ?? "—"}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          <p>{item.university_name}</p>
                          <p className="text-xs text-slate-400">{item.program_name}</p>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <p className="font-medium text-slate-900">
                            {item.commission_amount != null
                              ? formatCommissionAmount(item.commission_amount, item.commission_currency)
                              : "—"}
                          </p>
                          {item.received_amount != null && (
                            <p className="text-xs text-slate-400">
                              Received: {formatCommissionAmount(item.received_amount, item.received_currency ?? item.commission_currency)}
                            </p>
                          )}
                          {item.paid_amount != null && (
                            <p className="text-xs text-slate-400">
                              Paid: {formatCommissionAmount(item.paid_amount, item.paid_currency ?? item.commission_currency)}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge variant={WAITING_ON_VARIANT[item.waiting_on]}>
                            {WAITING_ON_LABEL[item.waiting_on]}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {item.days_waiting != null ? (
                            <p className={overdue ? "font-medium text-amber-600" : "text-slate-700"}>
                              {item.days_waiting} day{item.days_waiting === 1 ? "" : "s"}
                            </p>
                          ) : (
                            <p className="text-slate-400">—</p>
                          )}
                          {item.last_fact_date && (
                            <p className="text-xs text-slate-400">
                              <AppDate value={item.last_fact_date} format="short" />
                              {item.last_fact_reference ? ` · ${item.last_fact_reference}` : ""}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          {item.waiting_on === "university" && (
                            <Tooltip content="Record pay-in" position="left">
                              <IconButton
                                onClick={() =>
                                  setRecordPayInRow({
                                    application_id: item.application_id,
                                    reference: item.reference,
                                    student_name: item.student_name,
                                  })
                                }
                                aria-label="Record pay-in"
                                icon={<Receipt className="h-4 w-4" />}
                                bgColor="bg-transparent"
                                textColor="text-blue-600"
                                borderColor="border-transparent"
                                hoverTextColor="hover:text-blue-700"
                                hoverBorderColor="hover:border-transparent"
                                className="hover:bg-blue-50"
                              />
                            </Tooltip>
                          )}
                        </td>
                        <td className="w-8 pr-4 py-4">
                          <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                        </td>
                      </AnimatedTableRow>
                    );
                  })}
              </AnimatePresence>
            </tbody>
          </table>
        </TableWrapper>
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
