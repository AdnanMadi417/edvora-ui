"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight, RefreshCw, SlidersHorizontal, Wallet } from "lucide-react";
import SearchInput from "components/form/filter/SearchInput";
import FilterSelectField from "components/form/filter/FilterSelectField";
import Button from "components/ui/buttons/Button";
import PrevButton from "components/ui/buttons/PrevButton";
import NextButton from "components/ui/buttons/NextButton";
import Loading from "components/loading/Loading";
import NoMessagesFound from "components/emptyData/NoMessagesFound";
import { useBanks } from "features/banks/hooks";
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
  const { rows, loading, error } = usePartnerBankAccountsList();
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
    <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2 rounded-lg border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Bank Accounts</h3>
          <p className="mt-1 text-sm text-slate-500">Every partner&apos;s current payout bank account</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className=" border-y border-slate-200 pt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center p-6">
        <div className="flex items-center gap-2 sm:contents">
          <SearchInput
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Search by partner, bank, or account..."
            className="sm:w-64 sm:flex-none"
          />
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
          className={`flex w-full flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out sm:contents ${
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

      {/* Table */}
      <div className="p-6">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Partner</th>
                  <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Bank</th>
                  <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Account Holder</th>
                  <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Account Number</th>
                  <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Currency</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <Loading text="Fetching bank accounts..." />
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-red-600">
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <NoMessagesFound
                        title="No bank accounts found"
                        subtitle={activeFiltersCount > 0 ? "Try adjusting your filters." : "No partner has added a payout account yet."}
                        icon={<Wallet className="h-8 w-8 text-slate-400" />}
                      />
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  currentRows.map((row) => {
                    const bankName = row.bank_id ? bankLookup.get(row.bank_id)?.name ?? "Curated bank" : row.intl_bank_name;
                    return (
                      <tr
                        key={row.id}
                        className="group cursor-pointer transition-colors hover:bg-slate-100/50"
                        onClick={() => router.push(`/admin/partners/${row.partner_id}`)}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          <p>{row.partner_name}</p>
                          <p className="text-xs text-slate-500">{row.partner_email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{bankName}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{row.account_holder_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{row.account_number}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{row.currency}</td>
                        <td className="w-8 pr-4 py-4">
                          <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="grid grid-cols-1 items-center gap-4 border-t border-slate-200 p-4 sm:p-6 md:flex md:justify-between">
            {filteredRows.length > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
                Showing
                <span className="font-medium">{indexOfFirstItem + 1}</span>
                to
                <span className="font-medium">{Math.min(indexOfLastItem, filteredRows.length)}</span>
                of
                <span className="font-medium">{filteredRows.length}</span>
                Accounts
              </div>
            )}

            <div className="flex justify-end gap-2">
              <PrevButton
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                text="Prev"
                icon={<ArrowLeft className="h-4 w-4" />}
              />
              <span className="px-3 py-1 font-medium text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <NextButton
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                text="Next"
                icon={<ArrowRight className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
