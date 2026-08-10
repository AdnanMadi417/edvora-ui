"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, RefreshCw, CheckCircle, XCircle, GraduationCap } from "lucide-react";
import PresignedImage from "components/ui/PresignedImage";
import { AppDate } from "components/ui/date";
import { useUniversities } from "features/universities/hooks";
import Button from "components/ui/buttons/Button";
import IconButton from "components/ui/buttons/IconButton";
import SearchInput from "components/form/filter/SearchInput";
import { StatusBadge } from "components/ui/badges";
import { TableWrapper, TableSkeletonRows, TableEmptyRow, TableErrorRow, TablePagination } from "components/ui/table";

const ITEMS_PER_PAGE = 10;

export default function DataEntryUniversitiesTable() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { universities, loading, error, refetch } = useUniversities({ includeInactive: true });

  const stats = React.useMemo(() => ({
    total: universities.length,
    active: universities.filter((u) => u.is_active).length,
    inactive: universities.filter((u) => !u.is_active).length,
  }), [universities]);

  const filtered = universities.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || u.name?.toLowerCase().includes(term) || u.country?.toLowerCase().includes(term);
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && u.is_active) ||
      (selectedStatus === "inactive" && !u.is_active);
    return matchesSearch && matchesStatus;
  });

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="mt-6 max-w-5xl mx-auto text-p2 bg-white rounded-lg border border-slate-200">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Universities</h3>
          <p className="mt-0.5 text-sm text-slate-500">Create and edit university records</p>
        </div>
        <Button
          icon={<Plus className="h-4 w-4" />}
          text="New University"
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          borderColor="border-blue-600"
          hoverTextColor="hover:text-blue-800"
          hoverBorderColor="hover:border-blue-700"
          onClick={() => router.push("/data-entry/universities/create")}
          className="whitespace-nowrap"
        />
      </div>

      {/* Stats Cards */}
      <div className="p-6 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => { setSelectedStatus("all"); setCurrentPage(1); }}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
            selectedStatus === "all"
              ? "border-slate-400 bg-slate-100 shadow-sm"
              : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <GraduationCap className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-500">Total Universities</p>
          </div>
        </button>

        <button
          onClick={() => { setSelectedStatus("active"); setCurrentPage(1); }}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
            selectedStatus === "active"
              ? "border-green-300 bg-green-50 shadow-sm"
              : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{stats.active}</p>
            <p className="text-xs text-slate-500">Active</p>
          </div>
        </button>

        <button
          onClick={() => { setSelectedStatus("inactive"); setCurrentPage(1); }}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
            selectedStatus === "inactive"
              ? "border-slate-400 bg-slate-100 shadow-sm"
              : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <XCircle className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{stats.inactive}</p>
            <p className="text-xs text-slate-500">Inactive</p>
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <SearchInput
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name or country..."
            className="sm:w-64 sm:flex-none"
          />
          {loading && (
            <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-slate-400" aria-label="Updating results" />
          )}
        </div>
      </div>

      <div className="p-6">
        <TableWrapper
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              itemCount={paginated.length}
              totalCount={filtered.length}
              itemLabel="universities"
              loading={loading}
            />
          }
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="min-w-[220px] px-6 py-4 text-start text-sm font-semibold text-slate-900">University</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-slate-900">Country</th>
                <th className="min-w-[180px] px-6 py-4 text-start text-sm font-semibold text-slate-900">Next Intake</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading && <TableSkeletonRows columns={5} rows={ITEMS_PER_PAGE} />}

              {!loading && error && (
                <TableErrorRow colSpan={5} message={error} onRetry={refetch} />
              )}

              {!loading && !error && paginated.length === 0 && (
                <TableEmptyRow
                  colSpan={5}
                  title="No universities found"
                  subtitle="No universities match your search."
                />
              )}

              {!loading && !error && paginated.map((uni) => (
                <tr
                  key={uni.id}
                  className="cursor-pointer transition-colors hover:bg-slate-100/50"
                  onClick={() => router.push(`/data-entry/universities/${uni.id}`)}
                >
                  <td className="min-w-[220px] max-w-[300px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <PresignedImage
                        fileKey={uni.logo_file_key}
                        alt={uni.name}
                        className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-slate-200 ring-offset-2"
                        fallback={
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                            {uni.name?.slice(0, 2).toUpperCase() || "NA"}
                          </div>
                        }
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900" title={uni.name}>{uni.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[160px] px-6 py-4">
                    <div className="truncate text-sm text-slate-900" title={uni.country || undefined}>{uni.country || "—"}</div>
                  </td>
                  <td className="min-w-[180px] px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {uni.intake_months && uni.intake_months.length > 0 ? (
                        uni.intake_months.map((date: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                          >
                            <AppDate value={date} format="month" />
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400">TBA</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {uni.is_active ? (
                      <StatusBadge variant="success" icon={<CheckCircle className="h-3 w-3" />}>Active</StatusBadge>
                    ) : (
                      <StatusBadge variant="neutral" icon={<XCircle className="h-3 w-3" />}>Inactive</StatusBadge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <IconButton
                      onClick={(e) => { e.stopPropagation(); router.push(`/data-entry/universities/${uni.id}/edit`); }}
                      title="Edit university"
                      icon={<Pencil className="h-4 w-4" />}
                      bgColor="bg-transparent"
                      textColor="text-slate-400"
                      borderColor="border-transparent"
                      hoverTextColor="hover:text-slate-700"
                      hoverBorderColor="hover:border-transparent"
                      className="hover:bg-slate-100"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
      </div>
    </div>
  );
}
