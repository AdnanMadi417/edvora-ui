"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Settings,
  CheckCircle,
  Pencil,
  Trash2,
  ClipboardCheck,
  CalendarDays,
  Sliders,
  Plus,
  GitBranch,
  DollarSign,
} from "lucide-react";

import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { usePrograms, useStates, useDeletePrograms } from "features/programs/hooks";
import { programApi } from "features/programs/services";
import type { Program } from "features/programs/types";
import { useAllFields } from "features/knowledge-hub/field-of-study/hooks";
import { useAllQualifications } from "features/knowledge-hub/qualifications/hooks";
import { useUniversities } from "features/universities/hooks";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ProgramFilterPanel from "features/programs/components/shared/filters/ProgramFilterPanel";
import KnowledgeHubTable from "features/programs/components/shared/table/KnowledgeHubTable";

import DeleteProgramsConfirmation from "features/programs/components/admin/popups/DeleteProgramsConfirmation";
import BatchUpdatePrograms from "features/programs/components/admin/popups/BatchCommissionPrograms";
import BatchIELTSPrograms from "features/programs/components/admin/popups/BatchIELTSPrograms";
import BatchProgramIntakes from "features/programs/components/admin/popups/BatchProgramIntakes";
import BatchProgramScholarship from "features/programs/components/admin/popups/BatchProgramScholarship";
import BatchDeleteScholarships from "features/programs/components/admin/popups/BatchDeleteScholarships";
import BatchFeesPrograms from "features/programs/components/admin/popups/BatchFeesPrograms";
import BatchBranchPrograms from "features/programs/components/admin/popups/BatchBranchPrograms";
import DefaultVisaFee from "features/programs/components/admin/popups/DefaultVisaFee";

type BatchModal = "commission" | "ielts" | "intakes" | "scholarship" | "deleteScholarships" | "fees" | "visaFee" | "branch";

const ITEMS_PER_PAGE = 10;

const ProgramsTable = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get("search") ?? "");
  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get("page")) || 1);

  const { states } = useStates();
  const { fields } = useAllFields();
  const { universities } = useUniversities();
  const { qualifications } = useAllQualifications();

  const [selectedState, setSelectedState] = useState<string>(() => searchParams.get("state_id") ?? "all");
  const [selectedField, setSelectedField] = useState<string>(() => searchParams.get("field_of_study_id") ?? "all");
  const [selectedUniversity, setSelectedUniversity] = useState<string>(() => searchParams.get("university_id") ?? "all");
  const [selectedQualId, setSelectedQualId] = useState<string | null>(() => searchParams.get("qualification_id"));
  const [hasScholarship, setHasScholarship] = useState<string>(() => searchParams.get("has_scholarship") ?? "all");
  const [sortBy, setSortBy] = useState<string>(() => searchParams.get("sort_by") ?? "all");
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Keep the URL in sync with filter/search/sort/page state so it's
  // shareable and bookmarkable, and survives a refresh.
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedState !== "all") params.set("state_id", selectedState);
    if (selectedField !== "all") params.set("field_of_study_id", selectedField);
    if (selectedUniversity !== "all") params.set("university_id", selectedUniversity);
    if (selectedQualId) params.set("qualification_id", selectedQualId);
    if (hasScholarship !== "all") params.set("has_scholarship", hasScholarship);
    if (sortBy !== "all") params.set("sort_by", sortBy);
    if (currentPage > 1) params.set("page", String(currentPage));

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [debouncedSearch, selectedState, selectedField, selectedUniversity, selectedQualId, hasScholarship, sortBy, currentPage, pathname, router]);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"single" | "batch" | null>(null);
  const { deletePrograms } = useDeletePrograms();

  const [activeModal, setActiveModal] = useState<BatchModal | null>(null);
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);

  const { showToast } = useToast();

  const fieldOptions = useMemo(() => fields.map((f) => ({ label: f.name, value: f.id })), [fields]);
  const universityOptions = useMemo(() => universities.map((u) => ({ label: u.name, value: u.id })), [universities]);
  const stateOptions = useMemo(() => states.map((s) => ({ label: s.name, value: s.id })), [states]);
  const qualificationOptions = useMemo(() => qualifications.map((q) => ({ label: q.name, value: q.id })), [qualifications]);

  const { programs, total, loading, isFetching, error, refetch } = usePrograms({
    search: debouncedSearch || undefined,
    field_of_study_id: selectedField !== "all" ? selectedField : undefined,
    qualification_id: selectedQualId ?? undefined,
    state_id: selectedState !== "all" ? selectedState : undefined,
    university_id: selectedUniversity !== "all" ? selectedUniversity : undefined,
    has_scholarship: hasScholarship === "true" ? true : hasScholarship === "false" ? false : undefined,
    sort_by: sortBy !== "all" ? (sortBy as "commission_asc" | "commission_desc" | "tuition_asc" | "tuition_desc") : undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };


  const [selectedPrograms, setSelectedPrograms] = useState<Record<string, boolean>>({});

  const selectedProgramNames = (programs ?? [])
    .filter((p) => selectedPrograms[p.id])
    .map((p) => p.name);

  const handleDelete = async () => {
    try {
      let ids: string[] = [];
      if (deleteMode === "single" && selectedProgramId) ids = [selectedProgramId];
      if (deleteMode === "batch") ids = Object.keys(selectedPrograms).filter((id) => selectedPrograms[id]);
      if (ids.length === 0) return;

      setIsDeleting(true);
      await deletePrograms(ids);

      showToast("Deleted successfully", "success");
      setIsDeleteOpen(false);
      setDeleteMode(null);
      setSelectedProgramId(null);
      setSelectedPrograms({});
      refetch();
    } catch (error: unknown) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Delete failed. ${backendMessage}`, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedCount = Object.values(selectedPrograms).filter(Boolean).length;
  const [isSelectingAll, setIsSelectingAll] = useState(false);

  const selectAllPrograms = async () => {
    setIsSelectingAll(true);
    try {
      const baseParams = {
        search: debouncedSearch || undefined,
        field_of_study_id: selectedField !== "all" ? selectedField : undefined,
        qualification_id: selectedQualId ?? undefined,
        state_id: selectedState !== "all" ? selectedState : undefined,
        university_id: selectedUniversity !== "all" ? selectedUniversity : undefined,
        has_scholarship: hasScholarship === "true" ? true : hasScholarship === "false" ? false : undefined,
        sort_by: sortBy !== "all" ? (sortBy as "commission_asc" | "commission_desc" | "tuition_asc" | "tuition_desc") : undefined,
      };
      const allIds: string[] = [];
      let page = 1;
      while (true) {
        const res = await programApi.programs.list({ ...baseParams, page, page_size: 100 });
        const data = res.data;
        const items: Program[] = data?.items ?? [];
        items.forEach((p) => allIds.push(p.id));
        if (items.length === 0 || allIds.length >= (data?.total ?? 0)) break;
        page++;
      }
      const next: Record<string, boolean> = {};
      allIds.forEach((id) => { next[id] = true; });
      setSelectedPrograms(next);
    } finally {
      setIsSelectingAll(false);
    }
  };

  const handleSelectProgram = (id: string) => {
    setSelectedPrograms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => { setSelectedPrograms({}); }, [debouncedSearch, selectedState, selectedField, selectedUniversity, selectedQualId, hasScholarship, sortBy]);

  const selectedProgramIds = useMemo(
    () => Object.keys(selectedPrograms).filter((id) => selectedPrograms[id]),
    [selectedPrograms]
  );

  const sharedUniversityId = useMemo(() => {
    const selected = programs.filter((p) => selectedPrograms[p.id]);
    if (selected.length === 0) return null;
    const uniIds = [...new Set(selected.map((p) => p.university?.id).filter(Boolean))];
    return uniIds.length === 1 ? uniIds[0] : null;
  }, [programs, selectedPrograms]);

  const handleSelectAll = async () => {
    if (selectedCount >= total) { setSelectedPrograms({}); return; }
    await selectAllPrograms();
  };

  // Scoped to the 5 dropdown filters only — search and sort are separate,
  // independently-controlled UI and aren't cleared by this.
  const clearAllFilters = () => {
    setSelectedState("all");
    setSelectedField("all");
    setSelectedUniversity("all");
    setSelectedQualId(null);
    setHasScholarship("all");
    setCurrentPage(1);
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto text-p2 rounded-lg border border-slate-200 bg-white">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Knowledge Hub</h3>
          <p className="mt-1 text-sm text-slate-500">Explore and manage all programs, universities, and learning resources</p>
        </div>
        <Link
          href="/admin/knowledge-hub/create"
          className="flex items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition hover:border-blue-700 hover:text-blue-800"
        >
          <Plus className="h-4 w-4" />
          Create Program
        </Link>
      </div>

      <div className="p-6 border-b border-slate-200">

        {/* Filters */}
        <ProgramFilterPanel
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search by university, program, or level..."
          stateOptions={stateOptions}
          fieldOptions={fieldOptions}
          universityOptions={universityOptions}
          qualificationOptions={qualificationOptions}
          filters={{
            state: selectedState,
            field: selectedField,
            university: selectedUniversity,
            qualId: selectedQualId,
            scholarship: hasScholarship,
          }}
          onApplyFilters={(values) => {
            setSelectedState(values.state);
            setSelectedField(values.field);
            setSelectedUniversity(values.university);
            setSelectedQualId(values.qualId);
            setHasScholarship(values.scholarship);
            setCurrentPage(1);
          }}
          onRemoveFilter={(key) => {
            if (key === "state") setSelectedState("all");
            if (key === "field") setSelectedField("all");
            if (key === "university") setSelectedUniversity("all");
            if (key === "qualId") setSelectedQualId(null);
            if (key === "scholarship") setHasScholarship("all");
            setCurrentPage(1);
          }}
          onClearAll={clearAllFilters}
          sortBy={sortBy}
          onSortChange={(value) => { setSortBy(value); setCurrentPage(1); }}
          resultsCount={total}
        >
          {/* Bulk operations */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-1.5">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <CheckCircle className="h-4 w-4" />
                {selectedCount} selected
              </span>

              <div className="mx-1 h-4 w-px bg-slate-200" />

              <div className="relative">
                <button
                  onClick={() => setIsBulkMenuOpen((prev) => !prev)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${isBulkMenuOpen ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white hover:text-blue-700 hover:shadow-sm"}`}
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Bulk Update</span>
                  <svg className={`h-3 w-3 transition-transform ${isBulkMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isBulkMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setIsBulkMenuOpen(false)} />
                    <div className="absolute left-0 top-full z-[100] mt-2 w-52 rounded-lg border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-200/60">
                      {[
                        { label: "Commission", icon: <Pencil className="h-3.5 w-3.5 text-blue-600" />, bg: "bg-blue-50", onClick: () => setActiveModal("commission") },
                        { label: "IELTS Scores", icon: <ClipboardCheck className="h-3.5 w-3.5 text-violet-600" />, bg: "bg-violet-50", onClick: () => setActiveModal("ielts") },
                        { label: "Intakes", icon: <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />, bg: "bg-emerald-50", onClick: () => setActiveModal("intakes") },
                        { label: "Scholarship", icon: <Sliders className="h-3.5 w-3.5 text-amber-600" />, bg: "bg-amber-50", onClick: () => setActiveModal("scholarship") },
                        { label: "Delete Scholarships", icon: <Trash2 className="h-3.5 w-3.5 text-red-600" />, bg: "bg-red-50", onClick: () => setActiveModal("deleteScholarships") },
                        { label: "Tuition Fees", icon: <DollarSign className="h-3.5 w-3.5 text-green-600" />, bg: "bg-green-50", onClick: () => setActiveModal("fees") },
                        { label: "Visa Fee", icon: <DollarSign className="h-3.5 w-3.5 text-indigo-600" />, bg: "bg-indigo-50", onClick: () => setActiveModal("visaFee") },
                        ...(sharedUniversityId ? [{ label: "Branch", icon: <GitBranch className="h-3.5 w-3.5 text-violet-600" />, bg: "bg-violet-50", onClick: () => setActiveModal("branch") }] : []),
                      ].map(({ label, icon, bg, onClick }) => (
                        <button
                          key={label}
                          onClick={() => { onClick(); setIsBulkMenuOpen(false); }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${bg}`}>{icon}</span>
                          {label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

            <div className="mx-1 h-4 w-px bg-slate-200" />

            <button
              onClick={() => { setDeleteMode("batch"); setIsDeleteOpen(true); }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-white hover:shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        )}
      </ProgramFilterPanel>

      </div>

      <div>

        <div className="p-6">

          <KnowledgeHubTable
            programs={programs}
            loading={loading}
            isFetching={isFetching}
            error={error}
            refetch={refetch}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            total={total}
            selectedPrograms={selectedPrograms}
            onSelectProgram={handleSelectProgram}
            selectedCount={selectedCount}
            isSelectingAll={isSelectingAll}
            onSelectAll={handleSelectAll}
            onRowClick={(program) => window.open(`/admin/knowledge-hub/${program.id}`, "_blank")}
            editHref={(id) => `/admin/knowledge-hub/${id}/edit`}
            onDeleteClick={(program) => {
              setSelectedProgramId(program.id);
              setDeleteMode("single");
              setIsDeleteOpen(true);
            }}
          />

        </div>

      </div>

      <DeleteProgramsConfirmation
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedProgramId(null); setDeleteMode(null); }}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        programNames={
          deleteMode === "batch"
            ? selectedProgramNames
            : programs.filter((p) => p.id === selectedProgramId).map((p) => p.name)
        }
      />

      <BatchUpdatePrograms
        isOpen={activeModal === "commission"}
        onClose={() => setActiveModal(null)}
        selectedProgramIds={selectedProgramIds}
        onSuccess={refetch}
      />

      <BatchIELTSPrograms
        isOpen={activeModal === "ielts"}
        onClose={() => setActiveModal(null)}
        selectedProgramIds={selectedProgramIds}
        onSuccess={refetch}
      />

      <BatchProgramIntakes
        isOpen={activeModal === "intakes"}
        onClose={() => setActiveModal(null)}
        selectedProgramIds={selectedProgramIds}
        onSuccess={refetch}
      />

      <BatchProgramScholarship
        isOpen={activeModal === "scholarship"}
        onClose={() => setActiveModal(null)}
        selectedProgramIds={selectedProgramIds}
        onSuccess={refetch}
      />

      <BatchDeleteScholarships
        isOpen={activeModal === "deleteScholarships"}
        onClose={() => setActiveModal(null)}
        selectedProgramIds={selectedProgramIds}
        onSuccess={refetch}
      />

      <BatchFeesPrograms
        isOpen={activeModal === "fees"}
        onClose={() => setActiveModal(null)}
        selectedProgramIds={selectedProgramIds}
        onSuccess={refetch}
      />

      <DefaultVisaFee
        isOpen={activeModal === "visaFee"}
        onClose={() => setActiveModal(null)}
        selectedProgramIds={selectedProgramIds}
        onSuccess={refetch}
      />

      {sharedUniversityId && (
        <BatchBranchPrograms
          isOpen={activeModal === "branch"}
          onClose={() => setActiveModal(null)}
          selectedProgramIds={selectedProgramIds}
          universityId={sharedUniversityId}
          onSuccess={refetch}
        />
      )}

    </div>
  );
};

export default ProgramsTable;
