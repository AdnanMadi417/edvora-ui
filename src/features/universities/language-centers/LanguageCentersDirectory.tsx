"use client";
import { tableSectionPadding } from "components/ub/recipes";
import { WORKSPACE_EVENT } from "./workspace/centreWorkspace";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  Languages,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Button from "components/ub/core/buttons/Button";
import Combobox from "components/ub/forms/selection/Combobox";
import DataTable, {
  sortRows,
  type DataTableColumn,
  type DataTableSort,
} from "components/ub/data/tables/DataTable";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import TablePagination from "components/ub/data/tables/TablePagination";
import CardGridPagination from "components/ub/data/cards/CardGridPagination";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";
import LanguageCenterIdentity from "./components/LanguageCenterIdentity";
import LanguageCenterCard from "./components/LanguageCenterCard";
import Loading from "components/ub/feedback/states/Loading";
import EmptyData from "components/ub/feedback/states/EmptyData";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import { ConfirmDialog } from "components/ub/feedback/dialogs/Modal";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { useUniversities } from "features/universities/hooks/institutions/useUniversities";
import { parseApiError } from "utils/parseApiError";
import LanguageCenterForm from "./LanguageCenterForm";
import { languageCentersApi } from "./api";
import { cityState, type LanguageCenter, type LanguageCenterInput } from "./types";
import FilterButton from "components/ub/core/buttons/FilterButton";

export default function LanguageCentersDirectory({
  basePath = "/admin",
  allowDelete = true,
  readOnly = false,
  fixedUniversityId,
}: {
  basePath?: string;
  allowDelete?: boolean;
  readOnly?: boolean;
  fixedUniversityId?: string;
}) {
  const params = useSearchParams();
  const detailsHref = (center: LanguageCenter) =>
    `${basePath}/language-centers/${encodeURIComponent(center.id)}`;
  const linkedUniversity =
    fixedUniversityId ?? params.get("university_id") ?? "";
  const [universityId, setUniversityId] = useState(linkedUniversity);
  useEffect(() => {
    setUniversityId(linkedUniversity);
    setPage(1);
  }, [linkedUniversity]);
  const {
    universities,
    loading: universitiesLoading,
    error: universitiesError,
    refetch: refetchUniversities,
  } = useUniversities({
    includeInactive: !readOnly,
    ...(readOnly ? { isHidden: false } : {}),
  });
  const [centers, setCenters] = useState<LanguageCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [universityFilters, setUniversityFilters] = useState({ type: "all" });
  const [draftFilters, setDraftFilters] = useState(universityFilters);
  const [draftUniversityId, setDraftUniversityId] = useState(universityId);
  const [draftStatus, setDraftStatus] = useState(status);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterCount =
    Object.values(universityFilters).filter((value) => value && value !== "all")
      .length +
    (!fixedUniversityId && universityId ? 1 : 0) +
    (!readOnly && status !== "all" ? 1 : 0);
  const universityFor = (id: string) =>
    universities.find((university) => university.id === id);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const [form, setForm] = useState<LanguageCenter | "new" | null>(null);
  const [deleting, setDeleting] = useState<LanguageCenter | null>(null);
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await languageCentersApi.list();
      setCenters(response.data.items);
    } catch (failure) {
      setError(parseApiError(failure, "Unable to load language centers."));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
    const refresh = () => {
      void load();
    };
    window.addEventListener(WORKSPACE_EVENT, refresh);
    return () => window.removeEventListener(WORKSPACE_EVENT, refresh);
  }, [load]);
  const universityName = (id: string) =>
    universities.find((university) => university.id === id)?.name ||
    "University unavailable";
  const visibleUniversities = readOnly
    ? universities.filter(
        (university) => university.is_active && !university.is_hidden
      )
    : universities;
  const matching = centers.filter(
    (center) =>
      (!readOnly ||
        (center.is_active &&
          (center.centre_type === "independent" ||
            visibleUniversities.some(
              (university) => university.id === center.university_id
            )))) &&
      (!(fixedUniversityId ?? universityId) ||
        center.university_id === (fixedUniversityId ?? universityId)) &&
      (status === "all" || center.is_active === (status === "active")) &&
      (universityFilters.type === "all" ||
        universityFor(center.university_id)?.is_public ===
          (universityFilters.type === "public")) &&
      `${center.name} ${center.location} ${universityName(
        center.university_id
      )}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())
  );
  // Advisor cards: 9 per page (three rows of three), like Programs; the staff table keeps 10.
  const perPage = readOnly ? 9 : 10;
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(matching.length / perPage))
  );
  const allColumns: DataTableColumn<LanguageCenter>[] = [
    {
      key: "name",
      header: fixedUniversityId
        ? "Language center"
        : "University / language center",
      sortValue: (center) =>
        fixedUniversityId
          ? center.name
          : `${universityName(center.university_id)} ${center.name}`,
      sortable: true,
      width: "52%",
      cell: (center) => (
        <LanguageCenterIdentity
          center={center}
          university={universityFor(center.university_id)}
          showUniversity={!fixedUniversityId}
          showPlace
        />
      ),
    },
    {
      key: "location",
      header: "Location",
      // Phones show the city and state under the name instead.
      mobileSecondary: true,
      cell: (center) => (
        <span className="flex items-start gap-1.5 text-ub-text-secondary" title={center.location}>
          <MapPin
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-ub-icon"
          />
          <span className="min-w-0 break-words">{cityState(center.location)}</span>
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "end",
      cell: (center) => (
        <TableActions label={center.name}>
          <TableAction
            view
            primary
            label={`View ${center.name}`}
            icon={<Eye className="h-4 w-4" />}
            href={detailsHref(center)}
          />
          {!readOnly && center.centre_type !== "independent" && (
            <TableAction
              label={`Edit ${center.name}`}
              icon={<Pencil className="h-4 w-4" />}
              onSelect={() => setForm(center)}
            />
          )}
          {!readOnly &&
            allowDelete &&
            center.centre_type !== "independent" && (
              <TableAction
                label={`Delete ${center.name}`}
                danger
                icon={<Trash2 className="h-4 w-4" />}
                onSelect={() => setDeleting(center)}
              />
            )}
        </TableActions>
      ),
    },
  ];
  const columns = allColumns;
  const rows = sortRows(matching, columns, sort).slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );
  const initial: LanguageCenterInput =
    form && form !== "new"
      ? form
      : {
          name: "",
          university_id: universityId,
          location: "",
          email: "",
          phone: "",
          description: "",
          is_active: true,
        };
  const universityPicker = (
    <Combobox
      className="min-w-0"
      label="University"
      ariaLabel="Filter by university"
      placeholder="All universities"
      options={[
        { value: "", label: "All universities" },
        ...visibleUniversities.map((university) => ({
          value: university.id,
          label: university.name,
        })),
      ]}
      value={draftUniversityId}
      onChange={(value) => setDraftUniversityId(value || "")}
    />
  );
  const pagination = (
    <TablePagination
      currentPage={currentPage}
      onPageChange={setPage}
      itemsPerPage={perPage}
      itemCount={rows.length}
      totalCount={matching.length}
      itemLabel="centers"
      loading={loading || universitiesLoading}
    />
  );
  const retry = () => {
    void load();
    void refetchUniversities();
  };
  return (
    <section className="min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      <header
        className={`flex flex-col gap-4 border-b border-ub-border p-4 md:flex-row md:items-center md:justify-between ${
          readOnly ? "md:px-5 md:py-4" : "md:p-6"
        }`}
      >
        <div className="flex items-center gap-3">
          <Languages className="h-6 w-6 shrink-0 text-ub-text-link" />
          <p className="text-ub-body-md text-ub-text-secondary">
            {readOnly
              ? "Explore language centers and their universities."
              : "Manage language centers and their university links."}
          </p>
        </div>
        {!readOnly && (
          <Button
            variant="primary"
            text="Create language center"
            icon={<Plus className="h-4 w-4" />}
            disabled={universitiesLoading || !!universitiesError}
            onClick={() => setForm("new")}
            className="shrink-0"
          />
        )}
      </header>
      <div
        className={`space-y-3 border-b border-ub-border p-4 ${
          readOnly ? "md:p-5" : "md:p-6"
        }`}
      >
        <DataTableToolbar
          search={{
            value: search,
            onChange: (value) => {
              setSearch(value);
              setPage(1);
            },
            placeholder: "Search centers, universities, or locations...",
          }}
          filters={
            (!fixedUniversityId || !readOnly) && (
              <FilterButton
                count={filterCount}
                label="University filters"
                className="shrink-0"
                onClick={() => {
                  setDraftFilters(universityFilters);
                  setDraftUniversityId(universityId);
                  setDraftStatus(status);
                  setFiltersOpen(true);
                }}
              />
            )
          }
          className="!mb-0"
        />
      </div>
      <div className={tableSectionPadding}>
        {readOnly ? (
          loading || universitiesLoading ? (
            <Loading text="Loading language centres…" />
          ) : error || universitiesError ? (
            <div role="alert" className="space-y-4 p-4">
              <p className="text-ub-body-sm text-ub-text-secondary">
                {error || universitiesError}
              </p>
              <Button text="Try again" onClick={retry} />
            </div>
          ) : !rows.length ? (
            <EmptyData
              title="No language centers found"
              subtitle="Try another search or university."
            />
          ) : (
            <div>
              <div
                className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3"
                aria-label="Language centres"
              >
                {rows.map((center) => (
                  <LanguageCenterCard
                    key={center.id}
                    center={center}
                    university={universityFor(center.university_id)}
                    href={detailsHref(center)}
                  />
                ))}
              </div>
              <CardGridPagination
                currentPage={currentPage}
                onPageChange={setPage}
                itemsPerPage={perPage}
                totalCount={matching.length}
                itemLabel="language centres"
              />
            </div>
          )
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            sort={sort}
            onSortChange={(value) => {
              setSort(value);
              setPage(1);
            }}
            manualSort
            getRowId={(center) => center.id}
            getRowHref={detailsHref}
            getRowLabel={(center) => center.name}
            caption="Language centers"
            loading={loading || universitiesLoading}
            error={error || universitiesError}
            onRetry={() => {
              void load();
              void refetchUniversities();
            }}
            empty={{
              title: "No language centers found",
              description: readOnly
                ? "Try another search or university."
                : "Try another search or university, or create a language center.",
            }}
            footer={pagination}
          />
        )}
      </div>
      {!readOnly && form && (
        <LanguageCenterForm
          key={form === "new" ? "new" : form.id}
          initial={initial}
          editing={form !== "new"}
          universities={universities}
          onClose={() => setForm(null)}
          onSave={async (data) => {
            const response =
              form === "new"
                ? await languageCentersApi.create(data)
                : await languageCentersApi.update(form.id, data);
            setCenters((previous) =>
              form === "new"
                ? [response.data, ...previous]
                : previous.map((center) =>
                    center.id === response.data.id ? response.data : center
                  )
            );
            setPage(1);
            setForm(null);
            void refetchUniversities();
            showToast(
              form === "new"
                ? "Language center created."
                : "Language center updated.",
              "success"
            );
          }}
        />
      )}
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter language centers"
        description="Filter centers by university, status, and university type."
        footer={
          <>
            <Button
              text="Clear filters"
              onClick={() => {
                setDraftUniversityId(fixedUniversityId || "");
                setUniversityId(fixedUniversityId || "");
                setDraftStatus("all");
                setStatus("all");
                setDraftFilters({ type: "all" });
                setUniversityFilters({
                  type: "all",
                });
                setPage(1);
                setFiltersOpen(false);
              }}
            />
            <Button
              variant="primary"
              text="Apply filters"
              onClick={() => {
                setUniversityId(draftUniversityId);
                setStatus(draftStatus);
                setUniversityFilters(draftFilters);
                setPage(1);
                setFiltersOpen(false);
              }}
            />
          </>
        }
      >
        <div className="space-y-5">
          {!fixedUniversityId && universityPicker}
          {!readOnly && (
            <Combobox
              label="Status"
              ariaLabel="Filter by status"
              options={[
                { value: "all", label: "All statuses" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              value={draftStatus}
              onChange={(value) => setDraftStatus(value || "all")}
            />
          )}
          {!fixedUniversityId && (
            <Combobox
              label="University type"
              options={[
                { value: "all", label: "All university types" },
                { value: "public", label: "Public university" },
                { value: "private", label: "Private university" },
              ]}
              value={draftFilters.type}
              onChange={(value) =>
                setDraftFilters((previous) => ({
                  ...previous,
                  type: value || "all",
                }))
              }
            />
          )}
        </div>
      </Drawer>
      <ConfirmDialog
        open={!readOnly && !!deleting}
        onClose={() => {
          if (!busy) setDeleting(null);
        }}
        title="Delete language center?"
        tone="danger"
        consequence={`Remove ${
          deleting?.name || "this center"
        }? Its university will remain available.`}
        confirmLabel="Delete center"
        loading={busy}
        onConfirm={async () => {
          if (!deleting || busy) return;
          setBusy(true);
          try {
            await languageCentersApi.remove(deleting.id);
            setCenters((previous) =>
              previous.filter((center) => center.id !== deleting.id)
            );
            setDeleting(null);
            void refetchUniversities();
            showToast("Language center deleted.", "success");
          } catch (failure) {
            showToast(
              parseApiError(failure, "Unable to delete language center."),
              "error"
            );
          } finally {
            setBusy(false);
          }
        }}
      />
    </section>
  );
}
