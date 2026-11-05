"use client";

import { useMemo, useState } from "react";
import { GraduationCap, AlertTriangle } from "lucide-react";
import {
  useUniversities,
  useDeleteUniversity,
  useSetUniversityHidden,
} from "features/universities/hooks";
import type { University } from "features/universities/types";
import {
  sortRows,
  type DataTableSort,
} from "components/ub/data/tables/DataTable";
import UniversityCard from "components/ub/data/cards/UniversityCard";
import TablePagination from "components/ub/data/tables/TablePagination";
import EmptyData from "components/ub/feedback/states/EmptyData";
import Button from "components/ub/core/buttons/Button";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import UniversityFilterPanel, {
  type UniversityFilterValues,
} from "./filters/UniversityFilterPanel";
import UniversitiesDataTable from "./UniversitiesDataTable";
import DeleteUniversityConfirmation from "../admin/popups/DeleteUniversityConfirmation";
import AssignPaymentUniversity from "../admin/popups/AssignPaymentMethods";

const initial: UniversityFilterValues = {
  type: "all",
  isPublic: "all",
  hasLanguageCenter: "all",
  isHidden: "all",
};
const bool = (value: string) =>
  value === "all" ? undefined : value === "true";

export default function UniversityDirectory({
  role,
}: {
  role: "admin" | "data-entry" | "partner";
}) {
  const canManage = role !== "partner";
  const basePath = `/${role}/universities`;
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(initial);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<University | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<University | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { universities, loading, error, refetch } = useUniversities({
    includeInactive: canManage,
    isPublic: bool(filters.isPublic),
    hasLanguageCenter: bool(filters.hasLanguageCenter),
    isHidden: canManage ? bool(filters.isHidden) : false,
  });
  const { deleteUniversity, isDeleting } = useDeleteUniversity();
  const { setUniversityHidden } = useSetUniversityHidden();
  const typeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          universities
            .map((university) => university.university_type_name)
            .filter(Boolean)
        )
      ).map((name) => ({ value: name.toLowerCase().trim(), label: name })),
    [universities]
  );
  const filtered = universities.filter(
    (university) =>
      (canManage || !university.is_hidden) &&
      (!search.trim() ||
        `${university.name} ${university.country}`
          .toLowerCase()
          .includes(search.trim().toLowerCase())) &&
      (filters.type === "all" ||
        university.university_type_name?.toLowerCase().trim() === filters.type)
  );
  const sorted = sort
    ? sortRows(
        filtered,
        [{ key: sort.key, header: sort.key, cell: () => null }],
        sort
      )
    : filtered;
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(sorted.length / 10))
  );
  const toggleHidden = async (university: University) => {
    setTogglingId(university.id);
    try {
      await setUniversityHidden(university.id, !university.is_hidden);
      showToast(
        university.is_hidden
          ? "University is visible again"
          : "University hidden",
        "success"
      );
      await refetch();
    } catch (error: unknown) {
      showToast(
        parseApiError(error, "Failed to update university visibility"),
        "error"
      );
    } finally {
      setTogglingId(null);
    }
  };
  const removeUniversity = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUniversity(deleteTarget.id);
      setDeleteTarget(null);
      showToast("University deleted", "success");
      await refetch();
    } catch (error: unknown) {
      showToast(parseApiError(error, "Failed to delete university"), "error");
    }
  };
  return (
    <div className="mt-6 min-w-0 rounded-ub-lg border border-ub-border bg-ub-surface shadow-ub-xs">
      <div className="flex flex-col gap-4 border-b border-ub-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="text-ub-body-sm text-ub-text-secondary">
          {canManage
            ? "Manage institutions, intakes and university availability."
            : "Explore institutions, study locations and language support."}
        </p>
        {canManage && (
          <LinkBtn
            href={`${basePath}/create`}
            label="Create university"
            icon={<GraduationCap className="h-4 w-4" />}
            variant="primary"
            className="min-h-[44px] shrink-0"
          />
        )}
      </div>
      <div className="border-b border-ub-border p-4 sm:p-6">
        <UniversityFilterPanel
          searchTerm={search}
          onSearchChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          typeOptions={typeOptions}
          filters={filters}
          onApplyFilters={(values) => {
            setFilters(values);
            setPage(1);
          }}
          onRemoveFilter={(key) => {
            setFilters((previous) => ({ ...previous, [key]: "all" }));
            setPage(1);
          }}
          onClearAll={() => {
            setFilters(initial);
            setPage(1);
          }}
          resultsCount={filtered.length}
          showVisibility={canManage}
        />
      </div>
      <div className="min-w-0 p-3 sm:p-6">
        {canManage ? (
          <UniversitiesDataTable
            universities={sorted.slice(
              (currentPage - 1) * 10,
              currentPage * 10
            )}
            basePath={basePath}
            loading={loading}
            error={error}
            onRetry={refetch}
            page={currentPage}
            onPageChange={setPage}
            total={sorted.length}
            sort={sort}
            onSortChange={(value) => {
              setSort(value);
              setPage(1);
            }}
            canManage={canManage}
            togglingId={togglingId}
            onToggleHidden={canManage ? toggleHidden : undefined}
            onDelete={role === "admin" ? setDeleteTarget : undefined}
            onAssignPayment={role === "admin" ? setPaymentTarget : undefined}
          />
        ) : (
          <>
            {loading ? (
              <div
                aria-label="Loading universities"
                className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              >
                {[1, 2, 3].map((key) => (
                  <div
                    key={key}
                    className="h-96 animate-pulse rounded-ub-lg bg-ub-surface-subtle motion-reduce:animate-none"
                  />
                ))}
              </div>
            ) : error ? (
              <EmptyData
                icon={AlertTriangle}
                title="Couldn't load universities"
                subtitle="Please try again."
                action={<Button text="Retry" onClick={refetch} />}
              />
            ) : sorted.length === 0 ? (
              <EmptyData
                title="No universities found"
                subtitle="Try adjusting your search or filters."
              />
            ) : (
              <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {sorted
                  .slice((currentPage - 1) * 10, currentPage * 10)
                  .map((university) => (
                    <UniversityCard
                      key={university.id}
                      university={university}
                      href={`${basePath}/${university.id}`}
                      programsHref={`/partner/knowledge-hub?university_id=${encodeURIComponent(
                        university.id
                      )}`}
                    />
                  ))}
              </div>
            )}
            {!loading && !error && sorted.length > 0 && (
              <TablePagination
                currentPage={currentPage}
                onPageChange={setPage}
                itemsPerPage={10}
                itemCount={Math.min(10, sorted.length - (currentPage - 1) * 10)}
                totalCount={sorted.length}
                itemLabel="universities"
              />
            )}
          </>
        )}
      </div>
      {role === "admin" && (
        <DeleteUniversityConfirmation
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={removeUniversity}
          isDeleting={isDeleting}
          universityName={deleteTarget?.name}
        />
      )}
      {role === "admin" && paymentTarget && (
        <AssignPaymentUniversity
          isOpen
          onClose={() => setPaymentTarget(null)}
          universityId={paymentTarget.id}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
