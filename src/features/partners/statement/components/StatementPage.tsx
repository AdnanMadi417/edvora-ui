"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Receipt, SlidersHorizontal, ChevronRight } from "lucide-react";

import SearchInput from "components/ub/forms/SearchInput";
import FilterSelectField from "components/ub/forms/FilterSelectField";
import SearchableDropdown from "components/ub/forms/SearchableDropdown";
import TableWrapper from "components/ub/data/TableWrapper";
import TableSkeletonRows from "components/ub/data/TableSkeletonRows";
import TableEmptyRow from "components/ub/data/TableEmptyRow";
import TableErrorRow from "components/ub/data/TableErrorRow";
import TablePagination from "components/ub/data/TablePagination";
import AnimatedTableRow from "components/ub/data/AnimatedTableRow";
import { getAsyncStatus } from "components/ub/feedback/AsyncStatus";
import StatusBadge from "components/ub/data/StatusBadge";
import type { StatusBadgeVariant } from "components/ub/data/StatusBadge";
import AppDate from "components/ub/data/AppDate";
import { formatCommissionAmount } from "features/applications/shared/commissionTypes";

import { usePartnerProfile } from "features/partners/hooks/usePartnerProfile";
import { useAgencyMembers } from "features/agency-members/hooks/useAgencyMembers";
import { useStatement } from "../hooks";
import type { WaitingOn } from "../types";

const PAGE_SIZE = 20;

const WAITING_ON_VARIANT: Record<WaitingOn, StatusBadgeVariant> = {
  university: "info",
  us: "attention",
  nobody: "success",
  disputed: "danger",
};

const WAITING_ON_LABEL: Record<WaitingOn, string> = {
  university: "With the university",
  us: "Due to you",
  nobody: "Paid",
  disputed: "Disputed",
};

const WAITING_ON_OPTIONS = [
  { value: "university", label: "With the University" },
  { value: "us", label: "Due to You" },
  { value: "nobody", label: "Paid" },
  { value: "disputed", label: "Disputed" },
];

export default function StatementPage() {
  const router = useRouter();
  const { partner } = usePartnerProfile();
  const isAgencyAdmin = partner?.type === "agency" && partner?.agency_role === "admin";

  const { members } = useAgencyMembers({ is_active: true, page_size: 100, enabled: isAgencyAdmin });
  const memberOptions = [
    { value: "", label: "All Members" },
    ...members.map((m) => ({ value: m.partner_id, label: m.name })),
  ];

  const [waitingOnFilter, setWaitingOnFilter] = useState<WaitingOn | undefined>(undefined);
  const [memberFilter, setMemberFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [waitingOnFilter, memberFilter]);

  const { items, total, loading, error, refetch } = useStatement({
    page: currentPage,
    page_size: PAGE_SIZE,
    waiting_on: waitingOnFilter,
    member_partner_id: memberFilter || undefined,
  });

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (item) =>
        item.reference.toLowerCase().includes(term) ||
        item.student_name.toLowerCase().includes(term) ||
        item.university_name.toLowerCase().includes(term) ||
        item.program_name.toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  const status = getAsyncStatus(loading, error, filteredItems, (r) => r.length === 0);
  const activeFiltersCount = (waitingOnFilter ? 1 : 0) + (memberFilter ? 1 : 0);

  return (
    <div className="mx-auto mt-5 max-w-6xl overflow-hidden rounded-lg border border-slate-200 bg-white text-p2">
      {/* Header */}
      <div className="flex items-center gap-x-4 border-b border-slate-200 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
          <Receipt className="text-blue-700" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Commission Tracker</h3>
          <p className="text-sm text-slate-500">
            Every commission and where it stands.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 border-b border-slate-200 p-6 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex items-center gap-2 sm:contents">
          <SearchInput
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Search by reference, student, or university..."
            className="sm:w-80 sm:flex-none"
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

          {isAgencyAdmin && (
            <div className="w-full sm:w-56 sm:flex-none">
              <SearchableDropdown
                compact
                field="member_partner_id"
                required={false}
                placeholder="Search for a team member..."
                options={memberOptions}
                formData={{ member_partner_id: memberFilter }}
                errors={{}}
                updateFormData={(_field: string, value: string) => setMemberFilter(value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        <TableWrapper
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={PAGE_SIZE}
              itemCount={filteredItems.length}
              totalCount={total}
              itemLabel="commissions"
              loading={status === "loading"}
            />
          }
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Reference</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Student</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">University / Program</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Commission</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Status</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Since</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Reference</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {status === "loading" && <TableSkeletonRows columns={8} rows={5} />}

              {status === "error" && <TableErrorRow colSpan={8} message={error ?? undefined} onRetry={refetch} />}

              {status === "empty" && (
                <TableEmptyRow
                  colSpan={8}
                  title="No commissions found"
                  subtitle={
                    activeFiltersCount > 0 || searchTerm
                      ? "Try adjusting your filters."
                      : "Nothing on your statement yet."
                  }
                  icon={<Receipt className="h-8 w-8 text-slate-400" />}
                />
              )}

              <AnimatePresence>
                {status === "success" &&
                  filteredItems.map((item) => (
                    <AnimatedTableRow
                      key={item.application_commission_id}
                      className="group cursor-pointer transition-colors hover:bg-slate-100/50"
                      onClick={() => router.push(`/partner/applications/${item.application_id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.reference}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{item.student_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <p>{item.university_name}</p>
                        <p className="text-xs text-slate-400">{item.program_name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {item.commission_amount != null
                          ? formatCommissionAmount(item.commission_amount, item.commission_currency)
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge variant={WAITING_ON_VARIANT[item.waiting_on]}>
                          {WAITING_ON_LABEL[item.waiting_on]}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <AppDate value={item.since_date} format="short" />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{item.payout_reference ?? "—"}</td>
                      <td className="w-8 pr-4 py-4">
                        <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                      </td>
                    </AnimatedTableRow>
                  ))}
              </AnimatePresence>
            </tbody>
          </table>
        </TableWrapper>
      </div>
    </div>
  );
}
