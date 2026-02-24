"use client";

import React, { useEffect, useState } from "react";
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
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { MdSchool, MdLibraryAdd } from "react-icons/md";
import { AiOutlineBank } from "react-icons/ai";

import { useAllPrograms } from "../../../../../hooks/knowledge-hub/programs/useProgramsList";
import { useAllFields } from "../../../../../hooks/knowledge-hub/programs/useFieldsList";
import { useKnowledgeHubStates } from "../../../../../hooks/knowledge-hub/programs/useProgramStates";

import FilterSelectField from "../../../../form/filter/FilterSelectField";

import NextButton from "../../../../ui/buttons/NextButton";
import PrevButton from "../../../../ui/buttons/PrevButton";

import NoMessagesFound from "../../../../emptyData/NoMessagesFound";
import EmptyData from "../../../../emptyData/EmptyTableData";

import DeleteProgramsConfirmation from "components/admin/KnowledgeHub/program/popups/DeleteProgramsConfirmation";
import { useDeleteKnowledgeHubProgram } from "../../../../../hooks/knowledge-hub/programs/useDeleteKnowledgeHubProgram";
import { useDeleteKnowledgeHubPrograms } from "../../../../../hooks/knowledge-hub/programs/useDeleteKnowledgeHubPrograms";

import Loading from "../../../../loading/Loading";
import Link from "next/link";
import { useToast } from "components/context/ToastContext";

const KnowledgeHubTable = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    programs,
    loading: programsLoading,
    error: programsError,
  } = useAllPrograms({});

  const { states, stateLoading, stateError } = useKnowledgeHubStates();
  const { fields, fieldsLoading, fieldsError } = useAllFields();

  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedField, setSelectedField] = useState<string>("all");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null
  );

  const { deleteProgram } = useDeleteKnowledgeHubProgram();
  const { deletePrograms } =
    useDeleteKnowledgeHubPrograms();

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"single" | "batch" | null>(null);
  const { showToast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredPrograms = programs.filter((program) => {
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      program.university?.name?.toLowerCase().includes(term) ||
      program.name?.toLowerCase().includes(term) ||
      program.qualification_level?.toLowerCase().includes(term);

    const matchesLocation =
      selectedState === "all" || program.branch?.state === selectedState;

    const matchesField =
      selectedField === "all" || program.field_of_study?.name === selectedField;

    return matchesSearch && matchesLocation && matchesField;
  });
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "",
    direction: "asc",
  });
  const handleSort = (field: string) => {
    setSortConfig((prev) => {
      if (prev.key !== field) {
        return {
          key: field,
          direction: "asc",
        };
      }

      return {
        key: field,
        direction: prev.direction === "asc" ? "desc" : "asc",
      };
    });
  };
  const SortIndicator = ({ field }: { field: string }) => {
    if (!sortConfig || sortConfig.key !== field) {
      return (
        <ChevronUp className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
      );
    }

    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4 text-accent" />
    ) : (
      <ChevronDown className="h-4 w-4 text-accent" />
    );
  };
  const sortedPrograms = React.useMemo(() => {
    if (!sortConfig.key) return filteredPrograms;

    return [...filteredPrograms].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return sortConfig.direction === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      if (typeof aValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue || "")
          : (bValue || "").localeCompare(aValue || "");
      }

      if (typeof aValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });
  }, [filteredPrograms, sortConfig]);
  const currentPrograms = sortedPrograms.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
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

  const sortDates = (dates: string[]) =>
    [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const [selectedPrograms, setSelectedPrograms] = useState<
    Record<string, boolean>
  >({});

  const selectedProgramNames = programs
    .filter((p) => selectedPrograms[p.id])
    .map((p) => p.name);

  const handleDelete = async () => {
    try {

      if (deleteMode === "single" && selectedProgramId) {
        await deleteProgram(selectedProgramId);
      }

      if (deleteMode === "batch") {
        const ids = Object.keys(selectedPrograms).filter(
          (id) => selectedPrograms[id]
        );

        if (ids.length === 0) return;

        await deletePrograms(ids);
      }

      showToast( "Deleted successfully");

      setIsDeleteOpen(false);
      setDeleteMode(null);
      setSelectedProgramId(null);
      setSelectedPrograms({});

      window.location.reload();
    } catch (error) {
      console.error(error);
      showToast("Delete failed");
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
    if (currentPrograms.length) {
      const defaults = {};
      currentPrograms.forEach((p) => {
        defaults[p.id] = 1;
      });
    }
  }, [filteredPrograms]);

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

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedPrograms).every(Boolean);
    const newSelection: Record<string, boolean> = {};
    Object.keys(selectedPrograms).forEach((id) => {
      newSelection[id] = !allSelected;
    });
    setSelectedPrograms(newSelection);
  };

  return (
    <div className="mt-6 overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="relative p-6">
          <div className="mb-6 flex flex-col gap-6 rounded-xl md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Knowledge Hub
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Explore and manage all programs, universities, and learning
                resources
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
              <input
                type="text"
                placeholder="Search by university, program, or level..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-background w-full rounded-full border border-gray-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
              />
            </div>

            <FilterSelectField
              value={selectedState}
              onChange={(val) => {
                setSelectedState(val);
                setCurrentPage(1);
              }}
              options={states}
              icon={Globe}
              defaultOption="All Locations"
            />

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

            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedState("all");
                setCurrentPage(1);
              }}
              className="flex items-center justify-center gap-2 rounded-full border border-red-600 px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Clear
            </button>

            <Link
              className="bg-background-700 flex items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm text-slate-500 outline-0 transition hover:border-blue-700 hover:text-blue-700 sm:w-auto"
              href="/admin/knowledge-hub/programs/create"
            >
              <MdLibraryAdd className="h-4 w-4" />
              Create Program
            </Link>

            {selectedCount > 0 && (

              <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">

                <button
                  onClick={() => {
                    setDeleteMode("batch");
                    setIsDeleteOpen(true);
                  }}
                  className="bg-background-700 flex items-center justify-center gap-2 rounded-full border border-red-500 px-4 py-2.5 text-sm text-red-500 outline-0 transition hover:border-red-700 hover:text-red-700 sm:w-auto">
                  <Trash2 className="h-4 w-4" />
                  Delete Programs
                </button>

                <button className="bg-background-700 flex items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm text-slate-500 outline-0 transition hover:border-blue-700 hover:text-blue-700 sm:w-auto">
                  <Pencil className="h-4 w-4" />
                  Update Programs
                </button>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  {selectedCount} selected
                </div>



              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="block">
          {programsLoading && <Loading text="Fetching programs data..." />}

          {!programsError &&
            !programsLoading &&
            currentPrograms.length === 0 && (
              <div></div>
            )}

          {!programsError && programs.length > 0 && (
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
                            Object.values(selectedPrograms).length > 0 &&
                            Object.values(selectedPrograms).every(Boolean)
                          }
                          onChange={handleSelectAll}
                        />
                      </td>

                      <th
                        onClick={() => handleSort("name")}
                        className="group min-w-[250px] cursor-pointer px-6 py-4 text-start font-bold tracking-wider text-slate-900 transition-colors hover:bg-secondary"
                      >
                        <div className="flex items-center gap-2">
                          <MdSchool className="h-4 w-4 text-slate-500" />
                          <span>Program Info</span>
                          <SortIndicator field="name" />
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
                        onClick={() => handleSort("has_scholarship")}
                        className="group min-w-[200px] max-w-[250px] cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-secondary"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-slate-500" />
                          <span>Scholarships</span>
                          <SortIndicator field="has_scholarship" />
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
                    {programsLoading ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-4 text-center text-p1 text-slate-500"
                        >
                          Loading Service Programs...
                        </td>
                      </tr>
                    ) : currentPrograms.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-8 text-center text-slate-500"
                        >
                          <EmptyData />
                        </td>
                      </tr>
                    ) : (
                      currentPrograms.map((Program) => (
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
                              <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center
                rounded-full bg-accent-light text-h6 font-medium text-blue-700 "
                              >
                                {Program ? (
                                  Program.name?.slice(0, 2).toUpperCase()
                                ) : (
                                  <div className="h-5 w-5 animate-pulse rounded-full bg-gray-300" />
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

                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                    {Program.duration} Years
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                            {(() => {
                              const tags: { label: string; color: string }[] =
                                [];

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
                              const hiddenCount =
                                tags.length - visibleTags.length;

                              return (
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  {visibleTags.map((tag, index) => (
                                    <span
                                      key={index}
                                      title={tag.label}
                                      className={`truncate rounded-full px-2 py-0.5 font-medium transition ${
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
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
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
                                <span>
                                  {Program.first_year_tuition ?? "—"} RM
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-slate-700">
                                  Commission:
                                </span>
                                <span>
                                  {Program.commission_amount ?? "—"} RM
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm">
                              {Program.has_scholarship ? (
                                <span className="bg inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs text-green-600">
                                  <XCircle className="h-4 w-4" /> Available
                                </span>
                              ) : (
                                <span className="bg inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-600">
                                  <CheckCircle className="h-4 w-4" /> Not
                                  Available
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
                                className="flex items-center justify-center rounded-full p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                              >
                                <Eye className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                              </a>

                              <div className="h-6 border-l border-slate-200" />

                              <a
                                role="menuitem"
                                aria-label="Edit Program"
                                href={`/admin/knowledge-hub/programs/${Program.id}/edit`}
                                className="flex items-center justify-center rounded-full p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
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
                                className="flex items-center justify-center rounded-full p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                              >
                                <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 items-center gap-4 border-t border-gray-200 p-4 sm:p-6 md:flex  md:justify-between">
                {programs.length > 0 && (
                  <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
                    Showing
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>
                    to
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, programs.length)}
                    </span>
                    of
                    <span className="font-medium">{programs.length}</span>
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
                    Page {currentPage} of{" "}
                    {Math.ceil(programs.length / itemsPerPage)}
                  </span>

                  <NextButton
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(programs.length / itemsPerPage)
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
          )}
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

    </div>
  );
};

export default KnowledgeHubTable;
