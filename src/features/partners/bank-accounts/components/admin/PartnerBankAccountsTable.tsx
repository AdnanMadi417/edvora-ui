"use client";
import { tableSectionPadding } from "components/ub/recipes";

import React, { useEffect, useMemo, useState } from "react";
import { Eye, RefreshCw, Wallet } from "lucide-react";
import SearchInput from "components/ub/forms/selection/SearchInput";
import FilterSelectField from "components/ub/forms/selection/FilterSelectField";
import Button from "components/ub/core/buttons/Button";
import DataTable, { type DataTableColumn } from "components/ub/data/tables/DataTable";
import TableActions, { TableAction } from "components/ub/data/tables/TableActions";
import TablePagination from "components/ub/data/tables/TablePagination";
import EntityCell from "components/ub/data/display/EntityCell";
import { getAsyncStatus } from "components/ub/feedback/states/AsyncStatus";
import { useBanks } from "features/partners/banks/hooks";
import { usePartnerBankAccountsList } from "../../hooks";
import FilterButton from "components/ub/core/buttons/FilterButton";

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
type BankAccountRow = ReturnType<typeof usePartnerBankAccountsList>["rows"][number];

export default function PartnerBankAccountsTable() {
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

  const columns: DataTableColumn<BankAccountRow>[] = [
    {
      key: "advisor",
      header: "Advisor",
      cell: (row) => <EntityCell name={row.partner_name} />,
    },
    {
      key: "bank",
      header: "Bank",
      cell: (row) => (row.bank_id ? bankLookup.get(row.bank_id)?.name ?? "Curated bank" : row.intl_bank_name) || "—",
    },
    {
      key: "holder",
      header: "Account holder",
      cell: (row) => row.account_holder_name,
    },
    {
      key: "account",
      header: "Account number",
      cell: (row) => (
        <span className="ub-tabular">
          {row.account_number}
          <span className="text-ub-text-tertiary"> · {row.currency}</span>
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "end",
      cell: (row) => (
        <TableActions label={row.partner_name}>
          <TableAction label={`View ${row.partner_name}`} icon={<Eye className="h-4 w-4" />} href={`/admin/advisors/${row.partner_id}`} primary />
        </TableActions>
      ),
    },
  ];

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
          <FilterButton className="sm:hidden" count={activeFiltersCount} expanded={showMobileFilters} onClick={() => setShowMobileFilters((v) => !v)} />
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
      <div className={tableSectionPadding}>
        <DataTable
          columns={columns}
          rows={currentRows}
          getRowId={(row) => row.id}
          getRowHref={(row) => `/admin/advisors/${row.partner_id}`}
          caption="Advisor bank accounts"
          loading={status === "loading"}
          skeletonRows={5}
          error={status === "error" ? error ?? "Couldn't load bank accounts." : null}
          onRetry={refetch}
          empty={{
            title: "No bank accounts found",
            description: activeFiltersCount > 0 ? "Try adjusting your filters." : "No advisor has added a payout account yet.",
            icon: <Wallet className="h-8 w-8 text-ub-text-tertiary" />,
          }}
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
        />
      </div>
    </div>
  );
}
