"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ChevronRight, RefreshCw, SlidersHorizontal, Wallet } from "lucide-react";
import SearchInput from "components/ub/forms/selection/SearchInput";
import FilterSelectField from "components/ub/forms/selection/FilterSelectField";
import Button from "components/ub/core/buttons/Button";
import TableWrapper from "components/ub/data/tables/TableWrapper";
import TableSkeletonRows from "components/ub/data/tables/TableSkeletonRows";
import TableEmptyRow from "components/ub/data/tables/TableEmptyRow";
import TableErrorRow from "components/ub/data/tables/TableErrorRow";
import TablePagination from "components/ub/data/tables/TablePagination";
import AnimatedTableRow from "components/ub/data/tables/AnimatedTableRow";
import { getAsyncStatus } from "components/ub/feedback/states/AsyncStatus";
import { useBanks } from "features/partners/banks/hooks";
import { usePartnerBankAccountsList } from "../../hooks";

const CURRENCY_OPTIONS = [
  { value: "RM", label: "RM" },
  { value: "USD", label: "USD" },
];

// Admin-wide "Bank Accounts" view — every partner's current payout account
// in one table. There's no backing endpoint for this (only the per-partner
// GET /partners/{id}/bank-accounts), so usePartnerBankAccountsList
// aggregates it client-side; see that hook for the N+1 caveat. Rows link
// back to the owning partner's details page, where the account is actually
// managed — this table is read-only.
export default function PartnerBankAccountsTable() {
  const router = useRouter();
  const { rows, loading, error, refetch } = usePartnerBankAccountsList();
  const { banks: allBanks } = useBanks({ include_inactive: true });

  const [searchTerm, setSearchTerm] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const bankLookup = useMemo(() => new Map(allBanks.map((b) => [b.id, b])), [allBanks]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rows.filter((row) => {
      const bankName = row.bank_id ? bankLookup.get(row.bank_id)?.name ?? "" : row.intl_bank_name ?? "";
      const matchesSearch =
        !term ||
        row.partner_name.toLowerCase().includes(term) ||
        row.partner_email.toLowerCase().includes(term) ||
        row.account_holder_name.toLowerCase().includes(term) ||
        row.account_number.toLowerCase().includes(term) ||
        bankName.toLowerCase().includes(term);
      const matchesCurrency = !currencyFilter || row.currency === currencyFilter;
      return matchesSearch && matchesCurrency;
    });
  }, [rows, searchTerm, currencyFilter, bankLookup]);

  const status = getAsyncStatus(loading, error, filteredRows, (r) => r.length === 0);
  const activeFiltersCount = (searchTerm.trim() ? 1 : 0) + (currencyFilter ? 1 : 0);
  const clearFilters = () => {
    setSearchTerm("");
    setCurrencyFilter("");
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = filteredRows.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(Math.ceil(filteredRows.length / itemsPerPage), 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, currencyFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <div className="mt-6 overflow-hidden text-p2 rounded-lg border border-ub-border bg-ub-surface">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6">
        <div>
          <p className="mt-1 text-sm text-ub-text-secondary">Every partner&apos;s current payout bank account</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className=" border-y border-ub-border pt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center p-6">
        <div className="flex items-center gap-2 sm:contents">
          <SearchInput
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Search by advisor, bank, or account..."
            className="sm:w-64 sm:flex-none"
          />
          <button
            type="button"
            aria-label={activeFiltersCount > 0 ? `Filters, ${activeFiltersCount} active` : "Filters"}
            aria-expanded={showMobileFilters}
            onClick={() => setShowMobileFilters((v) => !v)}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ub-border bg-ub-surface text-ub-text-secondary hover:bg-ub-surface-subtle sm:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ub-action-primary text-[10px] font-bold text-white">
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
          <div className="w-full sm:w-36 sm:flex-none">
            <FilterSelectField
              value={currencyFilter || "all"}
              onChange={(v: string) => setCurrencyFilter(v === "all" ? "" : v)}
              options={CURRENCY_OPTIONS}
              defaultOption="All Currencies"
            />
          </div>
          {activeFiltersCount > 0 && (
            <Button
              onClick={clearFilters}
              icon={<RefreshCw className="h-4 w-4" />}
              text="Clear"
              variant="secondary"
              className="hover:bg-ub-tone-danger-bg"
            />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        <TableWrapper
          scrollLabel="Scroll to see all columns and rows"
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              itemCount={currentRows.length}
              totalCount={filteredRows.length}
              itemLabel="accounts"
              loading={status === "loading"}
            />
          }
        >
            <table className="w-full min-w-[800px] md:min-w-0">
              <thead>
                <tr className="border-b border-ub-border bg-ub-surface-subtle">
                  <th className="px-6 py-4 text-start font-semibold tracking-wider text-ub-text-primary">Advisor</th>
                  <th className="px-6 py-4 text-start font-semibold tracking-wider text-ub-text-primary">Bank</th>
                  <th className="px-6 py-4 text-start font-semibold tracking-wider text-ub-text-primary">Account holder</th>
                  <th className="px-6 py-4 text-start font-semibold tracking-wider text-ub-text-primary">Account number</th>
                  <th className="px-6 py-4 text-start font-semibold tracking-wider text-ub-text-primary">Currency</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ub-border bg-ub-surface">
                {status === "loading" && <TableSkeletonRows columns={6} rows={5} />}

                {status === "error" && <TableErrorRow colSpan={6} message={error ?? undefined} onRetry={refetch} />}

                {status === "empty" && (
                  <TableEmptyRow
                    colSpan={6}
                    title="No bank accounts found"
                    subtitle={activeFiltersCount > 0 ? "Try adjusting your filters." : "No advisor has added a payout account yet."}
                    icon={<Wallet className="h-8 w-8 text-ub-text-tertiary" />}
                  />
                )}

                <AnimatePresence>
                {status === "success" &&
                  currentRows.map((row) => {
                    const bankName = row.bank_id ? bankLookup.get(row.bank_id)?.name ?? "Curated bank" : row.intl_bank_name;
                    return (
                      <AnimatedTableRow
                        key={row.id}
                        className="group cursor-pointer transition-colors hover:bg-ub-surface-subtle"
                        onClick={() => router.push(`/admin/advisors/${row.partner_id}`)}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-ub-text-primary">
                          <p>{row.partner_name}</p>
                          <p className="text-xs text-ub-text-secondary">{row.partner_email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-ub-text-secondary">{bankName}</td>
                        <td className="px-6 py-4 text-sm text-ub-text-secondary">{row.account_holder_name}</td>
                        <td className="px-6 py-4 text-sm text-ub-text-secondary">{row.account_number}</td>
                        <td className="px-6 py-4 text-sm text-ub-text-secondary">{row.currency}</td>
                        <td className="w-8 pr-4 py-4">
                          <ChevronRight className="h-4 w-4 text-ub-text-tertiary opacity-0 transition-opacity group-hover:opacity-100" />
                        </td>
                      </AnimatedTableRow>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
        </TableWrapper>
      </div>
    </div>
  );
}
