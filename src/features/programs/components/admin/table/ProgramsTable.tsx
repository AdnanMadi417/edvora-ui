"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Calendar,
  BookOpen,
  DollarSign,
  Settings,
  ChevronRight,
  CheckCircle,
  Pencil,
  XCircle,
  Globe,
  Trash2,
  ClipboardCheck,
  CalendarDays,
  Sliders,
  SlidersHorizontal,
  Plus,
  GitBranch,
} from 'lucide-react';
import { MdSchool, MdVerified } from 'react-icons/md';
import PresignedImage from "components/ui/PresignedImage";
import { AiOutlineBank } from "react-icons/ai";

import { useToast } from "components/context/ToastContext";

import { usePrograms, useStates, useDeletePrograms } from "features/programs/hooks";
import { programApi } from "features/programs/services";
import type { Program } from "features/programs/types";
import { useAllFields } from "features/knowledge-hub/field-of-study/hooks";
import { useAllQualifications } from "features/knowledge-hub/qualifications/hooks";
import { useUniversities } from "features/universities/hooks";

import FilterSelectField from "components/form/filter/FilterSelectField";
import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";
import Loading from "components/loading/Loading";
import NoMessagesFound from 'components/emptyData/NoMessagesFound';
import Link from "next/link";

import { useRouter } from "next/navigation";
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

function ProgramUniversityCell({ program }: { program: Program }) {
  const tags: { label: string; color: "green" | "blue" | "gray" }[] = [];

  if (program.university?.name) {
    tags.push({ label: program.university.name, color: "green" });
  }
  if (program.branch?.name) {
    tags.push({ label: program.branch.name, color: "blue" });
  }
  if (program.branch?.location || program.branch?.state) {
    tags.push({
      label: [program.branch.location, program.branch.state].filter(Boolean).join(" | "),
      color: "gray",
    });
  }

  if (tags.length === 0) {
    return <span className="italic text-slate-400">Not provided</span>;
  }

  const visibleTags = tags.slice(0, 2);
  const hiddenCount = tags.length - visibleTags.length;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {visibleTags.map((tag, index) => (
        <span
          key={index}
          title={tag.label}
          className={`truncate rounded-md px-2 py-0.5 font-medium transition ${
            tag.color === "green"
              ? "bg-green-50 text-green-700"
              : tag.color === "blue"
                ? "bg-blue-50 text-blue-700"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          {tag.label}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
}

const ITEMS_PER_PAGE = 10;

const ProgramsTable = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { states } = useStates();
  const { fields } = useAllFields();
  const { universities } = useUniversities();
  const { qualifications } = useAllQualifications();

  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedField, setSelectedField] = useState<string>("all");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"single" | "batch" | null>(null);
  const { deletePrograms } = useDeletePrograms();

  const [activeModal, setActiveModal] = useState<BatchModal | null>(null);
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { showToast } = useToast();

  const fieldOptions = useMemo(() => fields.map((f) => ({ label: f.name, value: f.id })), [fields]);
  const universityOptions = useMemo(() => universities.map((u) => ({ label: u.name, value: u.id })), [universities]);
  const stateOptions = useMemo(() => states.map((s) => ({ label: s.name, value: s.id })), [states]);
  const qualificationOptions = useMemo(() => qualifications.map((q) => ({ label: q.name, value: q.id })), [qualifications]);

  const {
    programs,
    total,
    loading,
    isFetching,
    error,
    refetch,
  } = usePrograms({
    search: searchTerm || undefined,
    field_of_study_id: selectedField !== "all" ? selectedField : undefined,
    qualification_id: selectedLevel !== "all" ? selectedLevel : undefined,
    state_id: selectedState !== "all" ? selectedState : undefined,
    university_id: selectedUniversity !== "all" ? selectedUniversity : undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  });

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const activeFiltersCount = [
    selectedState !== "all",
    selectedField !== "all",
    selectedUniversity !== "all",
    selectedLevel !== "all",
    searchTerm !== "",
  ].filter(Boolean).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const [selectedPrograms, setSelectedPrograms] = useState<Record<string, boolean>>({});

  const selectedProgramNames = (programs ?? [])
    .filter((p) => selectedPrograms[p.id])
    .map((p) => p.name);

  const handleDelete = async () => {
    try {
      let ids: string[] = [];

      if (deleteMode === "single" && selectedProgramId) {
        ids = [selectedProgramId];
      }

      if (deleteMode === "batch") {
        ids = Object.keys(selectedPrograms).filter((id) => selectedPrograms[id]);
      }

      if (ids.length === 0) return;

      setIsDeleting(true);
      await deletePrograms(ids);

      showToast("Deleted successfully", "success");

      setIsDeleteOpen(false);
      setDeleteMode(null);
      setSelectedProgramId(null);
      setSelectedPrograms({});

      refetch();
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Please try again.";
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
        search: searchTerm || undefined,
        field_of_study_id: selectedField !== "all" ? selectedField : undefined,
        qualification_id: selectedLevel !== "all" ? selectedLevel : undefined,
        state_id: selectedState !== "all" ? selectedState : undefined,
        university_id: selectedUniversity !== "all" ? selectedUniversity : undefined,
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
    setSelectedPrograms((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    setSelectedPrograms({});
  }, [searchTerm, selectedState, selectedField, selectedUniversity, selectedLevel]);

  const selectedProgramIds = useMemo(() => {
    return Object.keys(selectedPrograms).filter((id) => selectedPrograms[id]);
  }, [selectedPrograms]);

  const sharedUniversityId = useMemo(() => {
    const selected = programs.filter((p) => selectedPrograms[p.id]);
    if (selected.length === 0) return null;
    const uniIds = [...new Set(selected.map((p) => p.university?.id).filter(Boolean))];
    return uniIds.length === 1 ? uniIds[0] : null;
  }, [programs, selectedPrograms]);

  const handleSelectAll = async () => {
    if (selectedCount >= total) {
      setSelectedPrograms({});
      return;
    }
    await selectAllPrograms();
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2">
      <div className="relative mb-8 rounded-lg border border-slate-200 bg-white">
        <div className="relative p-6">
          <div className="mb-6 flex flex-col gap-6 rounded-xl md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Knowledge Hub
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Explore and manage all programs, universities, and learning resources
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:gap-4 w-full">

            {/* Search + mobile filter toggle */}
            <div className="flex items-center gap-2 sm:contents">
              <div className="relative flex-1 sm:w-64 sm:flex-none flex-shrink-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by university, program, or level..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="bg-background w-full rounded-md border border-slate-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
                />
              </div>
              <button
                className="relative sm:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-background text-slate-500 hover:bg-slate-50"
                onClick={() => setShowMobileFilters((v) => !v)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter selects — collapsible on mobile, always visible on sm+ */}
            <div className={`flex-col gap-3 sm:contents ${showMobileFilters ? 'flex' : 'hidden sm:contents'}`}>
              <div className="w-full sm:w-48 flex-shrink-0">
                <FilterSelectField
                  value={selectedState}
                  onChange={(val) => { setSelectedState(val); setCurrentPage(1); }}
                  options={stateOptions}
                  icon={Globe}
                  defaultOption="All Locations"
                />
              </div>

              <div className="w-full sm:w-48 flex-shrink-0">
                <FilterSelectField
                  value={selectedField}
                  onChange={(val) => { setSelectedField(val); setCurrentPage(1); }}
                  options={fieldOptions}
                  icon={MdSchool}
                  defaultOption="All Fields"
                />
              </div>

              <div className="w-full sm:w-48 flex-shrink-0">
                <FilterSelectField
                  value={selectedUniversity}
                  onChange={(val) => { setSelectedUniversity(val); setCurrentPage(1); }}
                  options={universityOptions}
                  icon={MdSchool}
                  defaultOption="All Universities"
                />
              </div>

              <div className="w-full sm:w-48 flex-shrink-0">
                <FilterSelectField
                  value={selectedLevel}
                  onChange={(val) => { setSelectedLevel(val); setCurrentPage(1); }}
                  options={qualificationOptions}
                  icon={MdVerified}
                  defaultOption="All Qualifications"
                />
              </div>

              <div className="w-full sm:w-auto flex-shrink-0">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedState("all");
                    setSelectedField("all");
                    setSelectedUniversity("all");
                    setSelectedLevel("all");
                    setCurrentPage(1);
                  }}
                  className="flex items-center justify-center gap-2 rounded-md border border-red-600 px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">

              <Link
                className="bg-background-700 flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2.5 text-sm text-slate-500 outline-0 transition hover:border-blue-700 hover:text-blue-700 sm:w-auto"
                href="/admin/knowledge-hub/programs/create"
              >
                <Plus className="h-4 w-4" />
                Create Program
              </Link>

              {selectedCount > 0 && (
                <div className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50/60 px-3 py-1.5">
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
                      <svg className={`h-3 w-3 transition-transform ${isBulkMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>

                    {isBulkMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-[90]" onClick={() => setIsBulkMenuOpen(false)} />
                        <div className="absolute left-0 top-full z-[100] mt-2 w-52 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-200/60">
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
            </div>

          </div>

        </div>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="block">

          <div className="overflow-x-auto rounded-lg rounded-b-none bg-white">
            <table className="w-full">

              <thead>
              <tr className="border-b border-slate-200 bg-white">
                <td className="pl-6">
                  <input
                    type="checkbox"
                    ref={(el) => {
                      if (el) el.indeterminate = selectedCount > 0 && selectedCount < total;
                    }}
                    checked={total > 0 && selectedCount >= total}
                    disabled={isSelectingAll}
                    onChange={() => handleSelectAll()}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 disabled:cursor-wait"
                  />
                </td>

                <th className="group min-w-[250px] cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-secondary">
                  <div className="flex items-center gap-2">
                    <MdSchool className="h-4 w-4 text-slate-500" />
                    <span>Program Info</span>
                  </div>
                </th>

                <th className="group min-w-[200px] max-w-[250px] cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                  <div className="flex items-center gap-2">
                    <AiOutlineBank className="h-4 w-4 text-slate-500" />
                    <span>University</span>
                  </div>
                </th>

                <th className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <span>Fees</span>
                  </div>
                </th>

                <th className="group min-w-[200px] max-w-[250px] cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-500" />
                    <span>Scholarships</span>
                  </div>
                </th>

                <th className="group px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                  <div className="flex min-w-[120px] items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>Next Intake</span>
                  </div>
                </th>

                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-slate-500" />
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
              </thead>

              <tbody className={`divide-y divide-slate-200 bg-white transition-opacity duration-150 ${isFetching && !loading ? "opacity-50 pointer-events-none" : ""}`}>

              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <Loading text="Fetching programs data..." />
                  </td>
                </tr>
              )}

              {!error && !loading && programs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <NoMessagesFound
                      title="No programs found"
                      subtitle="There are currently no programs available."
                    />
                  </td>
                </tr>
              )}

              {!error && programs.map((program) => (
                <tr
                  key={program.id}
                  className={`group cursor-pointer hover:bg-slate-50 ${selectedPrograms[program.id] ? "bg-slate-50" : ""}`}
                  onClick={() => router.push(`/admin/knowledge-hub/programs/${program.id}`)}
                >
                  <td className="pl-6" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${program.name}`}
                      checked={selectedPrograms[program.id] || false}
                      onChange={() => handleSelectProgram(program.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                  </td>

                  <td className="min-w-[280px] max-w-[420px] px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-slate-200 ring-offset-2 shadow-sm">
                        {program.university?.logo_file_key ? (
                          <PresignedImage
                            fileKey={program.university.logo_file_key}
                            alt={program.university.name}
                            className="h-full w-full object-cover"
                            fallback={
                              <div className="flex h-full w-full items-center justify-center bg-accent-light text-h6 font-medium text-blue-700">
                                {program.name?.slice(0, 2).toUpperCase()}
                              </div>
                            }
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-accent-light text-h6 font-medium text-blue-700">
                            {program.name?.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="w-full min-w-0">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900" title={program.name}>
                          {program.name}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                          <span className="font-medium capitalize text-slate-700">
                            {program.qualification_level}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            {program.duration} Years
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="min-w-[280px] max-w-[420px] px-6 py-4">
                    <ProgramUniversityCell program={program} />
                  </td>

                  <td className="min-w-[220px] max-w-[350px] px-6 py-4 text-xs text-slate-500">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-700">First Year Tuition:</span>
                        <span>{program.first_year_tuition != null ? `RM ${program.first_year_tuition.toLocaleString()}` : "—"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-700">Commission:</span>
                        <span>
                          {program.commission_amount != null
                            ? `${(program.commission_currency || "RM").toUpperCase()} ${program.commission_amount.toLocaleString()}`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      {program.has_scholarship ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-green-600 bg-green-50 px-3 py-1 text-xs text-green-600">
                          <CheckCircle className="h-4 w-4" /> Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-red-600 bg-red-50 px-3 py-1 text-xs text-red-600">
                          <XCircle className="h-4 w-4" /> Not Available
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700">
                      {program.next_intake ? formatDate(program.next_intake) : "TBA"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <a
                        role="menuitem"
                        aria-label="Edit Program"
                        href={`/admin/knowledge-hub/programs/${program.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="group/edit flex items-center justify-center rounded-md p-2 text-sm hover:bg-slate-50 focus:outline-none"
                      >
                        <Pencil className="h-4 w-4 text-slate-400 group-hover/edit:text-blue-600" />
                      </a>

                      <div className="h-6 border-l border-slate-200" />

                      <button
                        role="menuitem"
                        aria-label="Delete Program"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProgramId(program.id);
                          setDeleteMode("single");
                          setIsDeleteOpen(true);
                        }}
                        className="group/delete flex items-center justify-center rounded-md p-2 text-sm hover:bg-red-50 focus:outline-none"
                      >
                        <Trash2 className="h-4 w-4 text-slate-400 group-hover/delete:text-red-600" />
                      </button>

                      <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100" />
                    </div>
                  </td>
                </tr>
              ))}

              </tbody>
            </table>

          </div>

          <div className="grid grid-cols-1 items-center gap-4 border-t border-slate-200 p-4 sm:p-6 md:flex md:justify-between">
            {total > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
                Showing
                <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
                to
                <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, total)}</span>
                of
                <span className="font-medium">{total}</span>
                programs
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

      <DeleteProgramsConfirmation
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedProgramId(null);
          setDeleteMode(null);
        }}
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
