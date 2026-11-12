"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Settings,
  CheckCircle,
  Pencil,
  ClipboardCheck,
  CalendarDays,
  Sliders,
  Plus,
  GitBranch,
  DollarSign,
  Trash2,
} from "lucide-react";

import { usePrograms, useStates, useDeletePrograms, useSetProgramHidden, useProgramsCopyEligibility } from "features/programs/hooks";
import { programApi } from "features/programs/services";
import type { Program } from "features/programs/types";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { useAllFields } from "features/knowledge-hub/field-of-study/hooks";
import { useAllQualifications } from "features/knowledge-hub/qualifications/hooks";
import { useUniversities } from "features/universities/hooks";

import LinkBtn from "components/ub/core/buttons/LinkBtn";
import Button from "components/ub/core/buttons/Button";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ProgramFilterPanel from "features/programs/components/shared/filters/ProgramFilterPanel";
import KnowledgeHubTable from "features/programs/components/shared/table/KnowledgeHubTable";

import BatchUpdatePrograms from "features/programs/components/admin/popups/BatchCommissionPrograms";
import BatchIELTSPrograms from "features/programs/components/admin/popups/BatchIELTSPrograms";
import BatchProgramIntakes from "features/programs/components/admin/popups/BatchProgramIntakes";
import BatchProgramScholarship from "features/programs/components/admin/popups/BatchProgramScholarship";
import BatchDeleteScholarships from "features/programs/components/admin/popups/BatchDeleteScholarships";
import BatchFeesPrograms from "features/programs/components/admin/popups/BatchFeesPrograms";
import BatchBranchPrograms from "features/programs/components/admin/popups/BatchBranchPrograms";
import CopyProgramToBranch from "features/programs/components/admin/popups/CopyProgramToBranch";
import DeleteProgramsConfirmation from "features/programs/components/admin/popups/DeleteProgramsConfirmation";
import DefaultVisaFee from "features/programs/components/admin/popups/DefaultVisaFee";

type BatchModal = "commission" | "ielts" | "intakes" | "scholarship" | "deleteScholarships" | "fees" | "visaFee" | "branch";

const ITEMS_PER_PAGE = 10;

const DataEntryProgramsTable = () => {
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
  const [courseType, setCourseType] = useState<string>(() => searchParams.get("course_type") ?? "all");
  const [classType, setClassType] = useState<string>(() => searchParams.get("class_type") ?? "all");
  const [sortBy, setSortBy] = useState<string>(() => searchParams.get("sort_by") ?? "all");
  const [hiddenFilter, setHiddenFilter] = useState<string>(() => searchParams.get("is_hidden") ?? "all");
  const [copyTarget, setCopyTarget] = useState<Program | null>(null);

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
    if (courseType !== "all") params.set("course_type", courseType);
    if (classType !== "all") params.set("class_type", classType);
    if (sortBy !== "all") params.set("sort_by", sortBy);
    if (hiddenFilter !== "all") params.set("is_hidden", hiddenFilter);
    if (currentPage > 1) params.set("page", String(currentPage));

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [debouncedSearch, selectedState, selectedField, selectedUniversity, selectedQualId, hasScholarship, courseType, classType, sortBy, hiddenFilter, currentPage, pathname, router]);

  const [activeModal, setActiveModal] = useState<BatchModal | null>(null);
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);

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
    course_type: courseType !== "all" ? (courseType as "course_work" | "research" | "mixed_mode") : undefined,
    class_type: classType !== "all" ? (classType as "physical" | "online") : undefined,
    sort_by: sortBy !== "all" ? (sortBy as "commission_asc" | "commission_desc" | "tuition_asc" | "tuition_desc") : undefined,
    is_hidden: hiddenFilter === "true" ? true : undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  });

  const copyEligibility = useProgramsCopyEligibility(programs);

  const { showToast } = useToast();
  const { setProgramHidden } = useSetProgramHidden();
  const [togglingHiddenId, setTogglingHiddenId] = useState<string | null>(null);

  const handleToggleHidden = async (program: Program) => {
    const nextHidden = !program.is_hidden;
    setTogglingHiddenId(program.id);
    try {
      await setProgramHidden(program.id, nextHidden);
      showToast(nextHidden ? "Program hidden" : "Program is visible again", "success");
      refetch();
    } catch (error: unknown) {
      showToast(parseApiError(error, nextHidden ? "Failed to hide program" : "Failed to unhide program"), "error");
    } finally {
      setTogglingHiddenId(null);
    }
  };

  const { deletePrograms } = useDeletePrograms();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await deletePrograms([deleteTargetId]);
      showToast("Deleted successfully", "success");
      setIsDeleteOpen(false);
      setDeleteTargetId(null);
      refetch();
    } catch (error: unknown) {
      showToast(`Delete failed. ${parseApiError(error, "Please try again.")}`, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };


  const [selectedPrograms, setSelectedPrograms] = useState<Record<string, boolean>>({});

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
        course_type: courseType !== "all" ? (courseType as "course_work" | "research" | "mixed_mode") : undefined,
        class_type: classType !== "all" ? (classType as "physical" | "online") : undefined,
        sort_by: sortBy !== "all" ? (sortBy as "commission_asc" | "commission_desc" | "tuition_asc" | "tuition_desc") : undefined,
        is_hidden: hiddenFilter === "true" ? true : undefined,
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

  useEffect(() => { setSelectedPrograms({}); }, [debouncedSearch, selectedState, selectedField, selectedUniversity, selectedQualId, hasScholarship, courseType, classType, sortBy, hiddenFilter]);

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
    setCourseType("all");
    setClassType("all");
    setHiddenFilter("all");
    setCurrentPage(1);
  };

  const bulkActions = (<div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" text="Bulk update" icon={<Settings className="h-4 w-4" />} onClick={() => setIsBulkMenuOpen(true)} />
            <Drawer open={isBulkMenuOpen} onClose={() => setIsBulkMenuOpen(false)} title="Bulk update programs" description={`${selectedCount} programs selected. Choose what to update.`}>
              <div className="flex flex-col gap-3">{[
                        { label: "Commission", icon: Pencil, onClick: () => setActiveModal("commission") },
                        { label: "IELTS Scores", icon: ClipboardCheck, onClick: () => setActiveModal("ielts") },
                        { label: "Intakes", icon: CalendarDays, onClick: () => setActiveModal("intakes") },
                        { label: "Scholarship", icon: Sliders, onClick: () => setActiveModal("scholarship") },
                        { label: "Delete scholarships", icon: Trash2, onClick: () => setActiveModal("deleteScholarships") },
                        { label: "Tuition fees", icon: DollarSign, onClick: () => setActiveModal("fees") },
                        { label: "Visa fee", icon: DollarSign, onClick: () => setActiveModal("visaFee") },
                        ...(sharedUniversityId ? [{ label: "Branch", icon: GitBranch, onClick: () => setActiveModal("branch") }] : []),
                      ].map(({ label, icon: Icon, onClick }) => <Button key={label} variant="secondary" text={label} icon={<Icon className="h-4 w-4" />} onClick={() => { onClick(); setIsBulkMenuOpen(false); }} className="min-h-[44px] justify-start" />)}</div>
            </Drawer>
          </div>);

  return (
    <div className="mt-6 min-w-0 rounded-ub-lg border border-ub-border bg-ub-surface text-ub-body-md">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b border-ub-border">
        <div>
          <p className="mt-1 text-sm text-ub-text-secondary">Explore and manage all programs, universities, and learning resources</p>
        </div>
        <LinkBtn href="/data-entry/knowledge-hub/create" variant="primary" icon={<Plus className="h-4 w-4" />} label="Create program" className="min-h-[44px]" />
      </div>

      <div className="p-4 sm:p-6 border-b border-ub-border">

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
            courseType,
            classType,
            hidden: hiddenFilter,
          }}
          onApplyFilters={(values) => {
            setSelectedState(values.state);
            setSelectedField(values.field);
            setSelectedUniversity(values.university);
            setSelectedQualId(values.qualId);
            setHasScholarship(values.scholarship);
            setCourseType(values.courseType);
            setClassType(values.classType);
            setHiddenFilter(values.hidden ?? "all");
            setCurrentPage(1);
          }}
          onRemoveFilter={(key) => {
            if (key === "state") setSelectedState("all");
            if (key === "field") setSelectedField("all");
            if (key === "university") setSelectedUniversity("all");
            if (key === "qualId") setSelectedQualId(null);
            if (key === "scholarship") setHasScholarship("all");
            if (key === "courseType") setCourseType("all");
            if (key === "classType") setClassType("all");
            if (key === "hidden") setHiddenFilter("all");
            setCurrentPage(1);
          }}
          onClearAll={clearAllFilters}
          showHiddenFilter
          sortBy={sortBy}
          onSortChange={(value) => { setSortBy(value); setCurrentPage(1); }}
          resultsCount={total}
        >
          {/* Bulk operations */}
      </ProgramFilterPanel>

      </div>

      <div>

        <div className="min-w-0 p-3 sm:p-6">

          <KnowledgeHubTable
            bulkActions={bulkActions}
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
            onRowClick={(program) => window.open(`/data-entry/knowledge-hub/${program.id}`, "_blank")}
            editHref={(id) => `/data-entry/knowledge-hub/${id}/edit`}
            onDeleteClick={(program) => {
              setDeleteTargetId(program.id);
              setIsDeleteOpen(true);
            }}
            onCopyToBranchClick={setCopyTarget}
            copyEligibility={copyEligibility}
            onToggleHiddenClick={handleToggleHidden}
            togglingHiddenId={togglingHiddenId}
            emptySubtitle={hiddenFilter === "true" ? "No hidden programs match your filters." : undefined}
          />

        </div>

      </div>

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

      {copyTarget && (
        <CopyProgramToBranch
          isOpen={!!copyTarget}
          onClose={() => setCopyTarget(null)}
          programId={copyTarget.id}
          programName={copyTarget.name}
          qualificationId={copyTarget.qualification_id}
          universityId={copyTarget.university.id}
          currentBranchId={copyTarget.branch?.id}
          onCopied={(created) => {
            const newId = created?.program?.id ?? created?.id;
            setCopyTarget(null);
            if (newId) router.push(`/data-entry/knowledge-hub/${newId}`);
            else refetch();
          }}
        />
      )}

      <DeleteProgramsConfirmation
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteTargetId(null);
        }}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        programNames={programs.filter((p) => p.id === deleteTargetId).map((p) => p.name)}
      />

    </div>
  );
};

export default DataEntryProgramsTable;
