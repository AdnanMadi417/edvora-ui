"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, CheckCircle, XCircle, GraduationCap, Landmark, MapPin, ChevronRight, AlertTriangle, Building2, Languages } from "lucide-react";
import PresignedImage from "components/ub/data/media/PresignedImage";
import { monthLabel } from "features/programs/utils/intakeMonths";
import { useUniversities } from "features/universities/hooks";
import SearchInput from "components/ub/forms/selection/SearchInput";
import FilterSelectField from "components/ub/forms/selection/FilterSelectField";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import Button from "components/ub/core/buttons/Button";
import TablePagination from "components/ub/data/tables/TablePagination";
import NoMessagesFound from "components/ub/feedback/states/NoMessagesFound";

const ITEMS_PER_PAGE = 10;

type TriFilter = "all" | "true" | "false";

const TRI_OPTIONS = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

function triToBool(value: TriFilter): boolean | undefined {
  return value === "all" ? undefined : value === "true";
}

// Cycled by row position — gives each card a distinct avatar color, same
// idea as the reference design, without needing a per-university color field.
const AVATAR_COLORS = [
  "bg-blue-600", "bg-rose-600", "bg-amber-600", "bg-emerald-600", "bg-violet-600", "bg-cyan-600",
];

export default function PartnerUniversitiesTable() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isPublicFilter, setIsPublicFilter] = useState<TriFilter>("all");
  const [hasLanguageCenterFilter, setHasLanguageCenterFilter] = useState<TriFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  // isHidden: false — hidden universities are data-entry/admin-only and must
  // never reach the partner UI, even though this shared knowledge-hub
  // endpoint has no role-based access control of its own.
  const { universities, loading, error, refetch } = useUniversities({
    isHidden: false,
    isPublic: triToBool(isPublicFilter),
    hasLanguageCenter: triToBool(hasLanguageCenterFilter),
  });

  const activeFiltersCount =
    (searchTerm.trim() !== "" ? 1 : 0) +
    (isPublicFilter !== "all" ? 1 : 0) +
    (hasLanguageCenterFilter !== "all" ? 1 : 0);

  const clearFilters = () => {
    setSearchTerm("");
    setIsPublicFilter("all");
    setHasLanguageCenterFilter("all");
    setCurrentPage(1);
  };

  const filtered = universities.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    return !term || u.name?.toLowerCase().includes(term) || u.country?.toLowerCase().includes(term);
  });

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="mt-6 text-p2 bg-white rounded-lg border border-slate-200">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-200">
        <div>
          <p className="mt-0.5 text-sm text-slate-500">Browse university listings and their branches</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name or country..."
            className="sm:w-64 sm:flex-none"
          />
          {loading && (
            <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-slate-400" aria-label="Updating results" />
          )}

          <div className="flex-1 sm:flex-none sm:w-40">
            <FilterSelectField
              value={isPublicFilter}
              onChange={(v: string) => { setIsPublicFilter(v as TriFilter); setCurrentPage(1); }}
              icon={Building2}
              defaultOption="Public: All"
              options={TRI_OPTIONS}
            />
          </div>

          <div className="flex-1 sm:flex-none sm:w-52">
            <FilterSelectField
              value={hasLanguageCenterFilter}
              onChange={(v: string) => { setHasLanguageCenterFilter(v as TriFilter); setCurrentPage(1); }}
              icon={Languages}
              defaultOption="Language Center: All"
              options={TRI_OPTIONS}
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

      <div className="p-6">
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-slate-200 p-10 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-sm font-medium text-slate-900">Something went wrong</p>
              <p className="text-xs text-slate-500">{error}</p>
              <button
                type="button"
                onClick={refetch}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && paginated.length === 0 && (
          <div className="rounded-xl border border-slate-200 p-10">
            <NoMessagesFound
              title="No universities found"
              subtitle={activeFiltersCount > 0 ? "Try adjusting your filters." : "No universities are available yet."}
              icon={<Landmark className="h-8 w-8 text-slate-400" />}
            />
            {activeFiltersCount > 0 && (
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={clearFilters}
                  icon={<RefreshCw className="h-3.5 w-3.5" />}
                  text="Clear filters"
                  bgColor="bg-white"
                  textColor="text-slate-700"
                  borderColor="border-slate-200"
                  hoverTextColor="hover:text-slate-700"
                  hoverBorderColor="hover:border-slate-200"
                  className="hover:bg-slate-50"
                />
              </div>
            )}
          </div>
        )}

        {!loading && !error && paginated.length > 0 && (
          <div className="space-y-4">
            {paginated.map((uni, index) => (
              <div
                key={uni.id}
                onClick={() => router.push(`/partner/universities/${uni.id}`)}
                className="group flex cursor-pointer items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-sm"
              >
                <PresignedImage
                  fileKey={uni.logo_file_key}
                  alt={uni.name}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  fallback={
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}>
                      {uni.name?.slice(0, 2).toUpperCase() || "NA"}
                    </div>
                  }
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate text-base font-semibold text-slate-900">{uni.name}</h4>
                      {uni.country && (
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {uni.country}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-blue-500" />
                  </div>

                  {uni.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">{uni.description}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {uni.university_type_name && (
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {uni.university_type_name}
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
                      {uni.is_public ? "Public" : "Private"}
                    </span>
                    {uni.has_language_center && (
                      <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                        Language Center
                      </span>
                    )}
                    {uni.is_active ? (
                      <StatusBadge variant="success" icon={<CheckCircle className="h-3 w-3" />}>Active</StatusBadge>
                    ) : (
                      <StatusBadge variant="neutral" icon={<XCircle className="h-3 w-3" />}>Inactive</StatusBadge>
                    )}
                    {uni.intake_months && uni.intake_months.length > 0 && (
                      uni.intake_months.map((month: number, i: number) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                        >
                          {monthLabel(month)}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <TablePagination
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        itemCount={paginated.length}
        totalCount={filtered.length}
        itemLabel="universities"
        loading={loading}
      />
    </div>
  );
}
