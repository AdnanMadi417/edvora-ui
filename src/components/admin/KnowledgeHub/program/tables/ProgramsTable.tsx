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
  Eye,
  CheckCircle,
  Pencil,
  XCircle,
  Globe,
  Trash2,
  ClipboardCheck,
  CalendarDays,
  Sliders,
} from 'lucide-react';
import { MdSchool, MdLibraryAdd, MdVerified } from 'react-icons/md';
import PresignedImage from "components/ui/PresignedImage";
import { AiOutlineBank } from "react-icons/ai";

import { useToast } from "components/context/ToastContext";

import { useAllPrograms } from "hooks/knowledge-hub/programs/useProgramsList";
import { useAllFields } from "hooks/knowledge-hub/field-of-study/useFieldsList";
import { useAllQualifications } from "hooks/knowledge-hub/qualifications/useQualificationsList";
import { useAllStates } from "hooks/knowledge-hub/programs/useStates";
import { useDeletePrograms } from "hooks/knowledge-hub/programs/useDeletePrograms";
import { useAllUniversities } from 'hooks/knowledge-hub/universities/useUniversitiesList';

import FilterSelectField from "components/form/filter/FilterSelectField";
import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";
import Loading from "components/loading/Loading";
import NoMessagesFound from 'components/emptyData/NoMessagesFound';
import Link from "next/link";

import DeleteProgramsConfirmation from "components/admin/KnowledgeHub/program/popups/DeleteProgramsConfirmation";
import BatchUpdatePrograms from "components/admin/KnowledgeHub/program/popups/BatchCommissionPrograms";
import BatchIELTSPrograms from "components/admin/KnowledgeHub/program/popups/BatchIELTSPrograms";
import BatchProgramIntakes from "components/admin/KnowledgeHub/program/popups/BatchProgramIntakes";
import BatchProgramScholarship from "components/admin/KnowledgeHub/program/popups/BatchProgramScholarship";
import BatchFeesPrograms from "components/admin/KnowledgeHub/program/popups/BatchFeesPrograms";
import DefaultVisaFee from "components/admin/KnowledgeHub/program/popups/DefaultVisaFee";


const ProgramsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    programs,
    loading,
    error,
  } = useAllPrograms({});

  const { states } = useAllStates();
  const { fields} = useAllFields();
  const { universities } = useAllUniversities();
  const { qualifications } = useAllQualifications();

  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedField, setSelectedField] = useState<string>("all");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null
  );

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"single" | "batch" | null>(null);
  const { deletePrograms } = useDeletePrograms();

  const [isBatchUpdateOpen, setIsBatchUpdateOpen] = useState(false);
  const [isBatchIeletsUpdateOpen, setIsBatchIeltsUpdateOpen] = useState(false);
  const [isBatchIntakesUpdateOpen, setIsBatchIntakesUpdateOpen] = useState(false);
  const [isBatchScholarshipsUpdateOpen, setIsBatchScholarshipsUpdateOpen] = useState(false);
  const [isBatchFeesUpdateOpen, setIsBatchFeesUpdateOpen] = useState(false);
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  const [isVisaFeeOpen, setIsVisaFeeOpen] = useState(false);

  const { showToast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredPrograms = useMemo(() => {
    if (!Array.isArray(programs) || programs.length === 0) return [];

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const hasSearch = normalizedSearch.length > 0;
    const hasStateFilter = selectedState !== "all";
    const hasFieldFilter = selectedField !== "all";
    const hasUniversityFilter = selectedUniversity !== "all";
    const hasLevelFilter = selectedLevel !== "all";

    return programs.filter((program) => {

      const matchesSearch = !hasSearch || [
        program.name,
        program.university?.name,
        program.qualification_level,
        program.field_of_study?.name,
      ]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(normalizedSearch)
        );

      const matchesState =
        !hasStateFilter || program.branch?.state === selectedState;

      const matchesField =
        !hasFieldFilter || program.field_of_study?.name === selectedField;

      const matchesUniversity =
        !hasUniversityFilter || program.university?.name === selectedUniversity;

      const matchesLevel =
        !hasLevelFilter || program.qualification_level === selectedLevel;


      return matchesSearch && matchesState && matchesField && matchesUniversity && matchesLevel;
    });
  }, [programs, searchTerm, selectedState, selectedField , selectedUniversity, selectedLevel]);

  const currentPrograms = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredPrograms.slice(start, end);
  }, [filteredPrograms, currentPage]);

  const totalItems = filteredPrograms.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

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

  const [selectedPrograms, setSelectedPrograms] = useState<
    Record<string, boolean>
  >({});

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
        ids = Object.keys(selectedPrograms).filter(
          (id) => selectedPrograms[id]
        );
      }

      if (ids.length === 0) return;

      await deletePrograms(ids);

      showToast("Deleted successfully", "success");

      setIsDeleteOpen(false);
      setDeleteMode(null);
      setSelectedProgramId(null);
      setSelectedPrograms({});

      window.location.reload();
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Please try again.";
      showToast(`Delete failed. ${backendMessage}`, "error");
    }
  };

  const selectedCount = Object.values(selectedPrograms).filter(Boolean).length;

  const handleSelectProgram = (id: string) => {
    setSelectedPrograms((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    setSelectedPrograms((prev) => {
      const updated: Record<string, boolean> = { ...prev };
      filteredPrograms.forEach((p) => {
        if (!(p.id in updated)) {
          updated[p.id] = false;
        }
      });
      return updated;
    });
  }, [filteredPrograms]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedState, selectedField, selectedUniversity, selectedLevel]);

  const selectedProgramIds = useMemo(() => {
    return Object.keys(selectedPrograms).filter(
      (id) => selectedPrograms[id]
    );
  }, [selectedPrograms]);

  const handleSelectAll = () => {
    const filteredIds = filteredPrograms.map((p) => p.id);

    const allSelected = filteredIds.every((id) => selectedPrograms[id]);

    const newSelection = { ...selectedPrograms };

    filteredIds.forEach((id) => {
      newSelection[id] = !allSelected;
    });

    setSelectedPrograms(newSelection);
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2">
      <div className="relative mb-8 rounded-lg border border-gray-200 bg-card">
        <div className="relative p-6">
          <div className="mb-6 flex flex-col gap-6 rounded-xl md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Knowledge Hub
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Explore and manage all programs, programs, and learning
                resources
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:gap-4 w-full">

            <div className="relative w-full sm:w-64 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
              <input
                type="text"
                placeholder="Search by university, program, or level..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-background w-full rounded-md border border-gray-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
              />
            </div>

            <div className="w-full sm:w-48 flex-shrink-0">
              <FilterSelectField
                value={selectedState}
                onChange={(val) => { setSelectedState(val); setCurrentPage(1); }}
                options={states}
                icon={Globe}
                defaultOption="All Locations"
              />
            </div>

            <div className="w-full sm:w-48 flex-shrink-0">
              <FilterSelectField
                value={selectedField}
                onChange={(val) => {
                  setSelectedField(val);
                  setCurrentPage(1);
                }}
                options={fields}
                icon={MdSchool}
                defaultOption="All Fields"
              />

            </div>

            <div className="w-full sm:w-48 flex-shrink-0">
              <FilterSelectField
                value={selectedUniversity}
                onChange={(val) => { setSelectedUniversity(val); setCurrentPage(1); }}
                options={universities}
                icon={MdSchool}
                defaultOption="All Universities"
              />
            </div>

            <div className="w-full sm:w-48 flex-shrink-0">
              <FilterSelectField
                value={selectedLevel}
                onChange={(val) => { setSelectedLevel(val); setCurrentPage(1); }}
                options={qualifications}
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

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">

              <Link
                className="bg-background-700 flex items-center justify-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm text-slate-500 outline-0 transition hover:border-blue-700 hover:text-blue-700 sm:w-auto"
                href="/admin/knowledge-hub/programs/create"
              >
                <MdLibraryAdd className="h-4 w-4" />
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
                            { label: "Commission", icon: <Pencil className="h-3.5 w-3.5 text-blue-600" />, bg: "bg-blue-50", onClick: () => setIsBatchUpdateOpen(true) },
                            { label: "IELTS Scores", icon: <ClipboardCheck className="h-3.5 w-3.5 text-violet-600" />, bg: "bg-violet-50", onClick: () => setIsBatchIeltsUpdateOpen(true) },
                            { label: "Intakes", icon: <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />, bg: "bg-emerald-50", onClick: () => setIsBatchIntakesUpdateOpen(true) },
                            { label: "Scholarship", icon: <Sliders className="h-3.5 w-3.5 text-amber-600" />, bg: "bg-amber-50", onClick: () => setIsBatchScholarshipsUpdateOpen(true) },
                            { label: "Tution Fees", icon: <DollarSign className="h-3.5 w-3.5 text-green-600" />, bg: "bg-green-50", onClick: () => setIsBatchFeesUpdateOpen(true) },
                            { label: "Visa Fee", icon: <DollarSign className="h-3.5 w-3.5 text-indigo-600" />, bg: "bg-indigo-50", onClick: () => setIsVisaFeeOpen(true) },
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

      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">

        <div className="block">

          <div className="overflow-x-auto rounded-lg rounded-b-none bg-card">
            <table className="w-full">

              <thead>
              <tr className="border-b border-slate-200 bg-card">
                <td className="pl-6">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    checked={
                      filteredPrograms.length > 0 &&
                      filteredPrograms.every((p) => selectedPrograms[p.id])
                    }
                    onChange={handleSelectAll}
                  />
                </td>

                <th
                  className="group min-w-[250px] cursor-pointer px-6 py-4 text-start font-bold tracking-wider text-slate-900 transition-colors hover:bg-secondary"
                >
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

                <th
                  className="group min-w-[200px] max-w-[250px] cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors"
                >
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

              <tbody className="divide-border-slate-200 divide-y bg-primary">

              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <Loading text="Fetching programs data..." />
                  </td>
                </tr>
              )}

              {!error && !loading && currentPrograms.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <NoMessagesFound
                      title="No programs found"
                      subtitle="There are currently no programs available."
                    />
                  </td>
                </tr>
              )}

              {!error && currentPrograms.map((Program) => (
                <tr
                  key={Program.id}
                  className="hover:bg-primary/10 group transition-colors"
                >
                  <td className="pl-6">
                    <input
                      type="checkbox"
                      aria-label={`Select ${Program.name}`}
                      checked={selectedPrograms[Program.id] || false}
                      onChange={() => handleSelectProgram(Program.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                  </td>

                  <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md">
                        {Program.university?.logo_file_key ? (
                          <PresignedImage
                            fileKey={Program.university.logo_file_key}
                            alt={Program.university.name}
                            className="h-full w-full object-cover"
                            fallback={
                              <div className="flex h-full w-full items-center justify-center bg-accent-light text-h6 font-medium text-blue-700">
                                {Program.name?.slice(0, 2).toUpperCase()}
                              </div>
                            }
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-accent-light text-h6 font-medium text-blue-700">
                            {Program.name?.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="w-full min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {Program.name}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                              <span className="font-medium capitalize text-slate-700">
                                {Program.qualification_level}
                              </span>

                          <span className="text-slate-300">•</span>

                          <span className="max-w-[160px] truncate">
                                {Program.field_of_study?.name}
                              </span>

                          <span className="text-slate-300">•</span>

                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                {Program.duration} Years
                              </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                    {(() => {
                      const tags: { label: string; color: string }[] = [];

                      if (Program.university?.name) {
                        tags.push({
                          label: Program.university.name,
                          color: "green",
                        });
                      }

                      if (Program.branch?.name) {
                        tags.push({
                          label: Program.branch.name,
                          color: "blue",
                        });
                      }

                      if (
                        Program.branch?.location ||
                        Program.branch?.state
                      ) {
                        tags.push({
                          label: `${Program.branch?.location || ""}${
                            Program.branch?.location &&
                            Program.branch?.state
                              ? " | "
                              : ""
                          }${Program.branch?.state || ""}`,
                          color: "gray",
                        });
                      }

                      if (tags.length === 0) {
                        return (
                          <span className="italic text-slate-400">
                                Not provided
                              </span>
                        );
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
                    })()}
                  </td>

                  <td className="min-w-[220px] max-w-[350px] px-6 py-4 text-xs text-slate-500">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-700">
                              First Year Tuition:
                            </span>
                        <span>{Program.yearly_fees?.[0]?.fee ?? "—"} RM</span>
                      </div>
                      <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-700">
                              Commission:
                            </span>
                        <span>{Program.commission_amount ?? "—"} RM</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      {Program.has_scholarship ? (
                        <span className="bg inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-green-600 bg-green-50 px-3 py-1 text-xs text-green-600">
                              <CheckCircle className="h-4 w-4" /> Available
                            </span>
                      ) : (
                        <span className="bg inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-red-600 bg-red-50 px-3 py-1 text-xs text-red-600">
                              <XCircle className="h-4 w-4" /> Not Available
                            </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">
                          {Program.next_intake
                            ? formatDate(Program.next_intake)
                            : "TBA"}
                        </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <a
                        role="menuitem"
                        aria-label="View Program"
                        href={`/admin/knowledge-hub/programs/${Program.id}`}
                        className="flex items-center justify-center rounded-md p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                      >
                        <Eye className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                      </a>

                      <div className="h-6 border-l border-slate-200" />

                      <a
                        role="menuitem"
                        aria-label="Edit Program"
                        href={`/admin/knowledge-hub/programs/${Program.id}/edit`}
                        className="flex items-center justify-center rounded-md p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                      >
                        <Pencil className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                      </a>

                      <div className="h-6 border-l border-slate-200" />

                      <button
                        role="menuitem"
                        aria-label="Delete Program"
                        onClick={() => {
                          setSelectedProgramId(Program.id);
                          setDeleteMode("single");
                          setIsDeleteOpen(true);
                        }}
                        className="flex items-center justify-center rounded-md p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                      >
                        <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              </tbody>
            </table>

          </div>

          <div className="grid grid-cols-1 items-center gap-4 border-t border-gray-200 p-4 sm:p-6 md:flex  md:justify-between">
            {totalItems > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
                Showing
                <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>
                to
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>
                of
                <span className="font-medium">{totalItems}</span>
                programs
              </div>
            )}

            <div className="flex justify-end gap-2">
              <PrevButton
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPage === 1}
                text="Prev"
                icon={<ArrowLeft className="h-4 w-4" />}
              />

              <span className="px-3 py-1 font-medium text-slate-500">
                Page {currentPage} of {totalPages}
                  </span>

              <NextButton
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      totalPages
                    )
                  )
                }
                disabled={
                  currentPage === Math.ceil(programs.length / itemsPerPage)
                }
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
            : programs
                .filter((p) => p.id === selectedProgramId)
                .map((p) => p.name)
        }
      />

      <BatchUpdatePrograms
        isOpen={isBatchUpdateOpen}
        onClose={() => setIsBatchUpdateOpen(false)}
        selectedProgramIds={selectedProgramIds}
      />

      <BatchIELTSPrograms
        isOpen={isBatchIeletsUpdateOpen}
        onClose={() => setIsBatchIeltsUpdateOpen(false)}
        selectedProgramIds={selectedProgramIds}
      />

       <BatchProgramIntakes
        isOpen={isBatchIntakesUpdateOpen}
        onClose={() => setIsBatchIntakesUpdateOpen(false)}
        selectedProgramIds={selectedProgramIds}
      />

      <BatchProgramScholarship
        isOpen={isBatchScholarshipsUpdateOpen}
        onClose={() => setIsBatchScholarshipsUpdateOpen(false)}
        selectedProgramIds={selectedProgramIds}
      />

      <BatchFeesPrograms
        isOpen={isBatchFeesUpdateOpen}
        onClose={() => setIsBatchFeesUpdateOpen(false)}
        selectedProgramIds={selectedProgramIds}
      />

      <DefaultVisaFee
        isOpen={isVisaFeeOpen}
        onClose={() => setIsVisaFeeOpen(false)}
      />

    </div>
  );
};

export default ProgramsTable;
