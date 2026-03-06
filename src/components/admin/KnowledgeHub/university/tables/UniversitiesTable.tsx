"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Settings,
  Eye,
  CheckCircle,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  GraduationCap,
} from 'lucide-react';
import { MdOutlineCategory, MdSchool } from 'react-icons/md';
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import { useDeleteUniversity } from "hooks/knowledge-hub/universities/useDeleteKnowledgeHubUniversity";
import { useAllUniversities } from "hooks/knowledge-hub/universities/useUniversitiesList";

import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";
import Link from "components/ui/links/LinkBtn";

import NoMessagesFound from "components/emptyData/NoMessagesFound";

import DeleteUniversityConfirmation from "components/admin/KnowledgeHub/university/popups/DeleteUniversityConfirmation";
import CreateUniversity from "components/admin/KnowledgeHub/university/popups/CreateUniversity";
import UpdateUniversityType from "components/admin/KnowledgeHub/university/popups/UpdateUniversityType";

import Loading from "components/loading/Loading";

import { useToast } from "components/context/ToastContext";

const UniversitiesTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { universities, loading, error } = useAllUniversities();

  const { deleteUniversity, isDeleting } = useDeleteUniversity();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<any>(null);

  const [selectedUniversityId, setSelectedUniversityId] = useState<
    string | null
  >(null);
  const [selectedUniversityName, setSelectedUniversityName] =
    useState<string>("");

  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedField, setSelectedField] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredUniversities = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return universities.filter((university) => {
      const matchSearch =
        !term ||
        university.name?.toLowerCase().includes(term) ||
        university.country?.toLowerCase().includes(term);

      const matchState =
        selectedState === "all" ||
        university.country === selectedState;

      const matchField =
        selectedField === "all" ||
        (university as any).field_id === selectedField;

      return matchSearch && matchState && matchField;
    });
  }, [universities, searchTerm, selectedState, selectedField]);

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
  const sortedUniversities = React.useMemo(() => {
    if (!sortConfig.key) return filteredUniversities;

    return [...filteredUniversities].sort((a, b) => {

      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (!aValue && !bValue) return 0;

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
  }, [filteredUniversities, sortConfig]);
  const currentUniversities = sortedUniversities.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);

    if (isNaN(d.getTime())) return "Invalid date";

    return d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedState, selectedField]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredUniversities, currentPage]);

  const handleDelete = async () => {
    if (!selectedUniversityId) return;

    try {
      await deleteUniversity(selectedUniversityId);

      showToast("University deleted successfully.");

      setIsDeleteOpen(false);
      setSelectedUniversityId(null);
      setSelectedUniversityName("");

      setTimeout(() => location.reload(), 2000);

    } catch (error: any) {
      showToast("Failed to delete university. Please try again.");
    }
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
                Explore and manage all Universities, universities, and learning
                resources
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
              <input
                type="text"
                placeholder="Search by university, University, or level..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-background w-full rounded-full border border-gray-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedState("all");
                setSelectedField("all");
                setCurrentPage(1);
              }}
              className="flex items-center justify-center gap-2 rounded-full border border-red-600 px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Clear
            </button>

            <Link
              href={`/admin/universities/create`}
              icon={<GraduationCap  className="h-5 w-5" />}
              label={loading ? "Creating..." : "Create University"}
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

          </div>
        </div>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">

        <div className="block">

          <div className="overflow-x-auto rounded-lg rounded-b-none bg-card">
            <table className="w-full">

              <thead>
              <tr className="border-b border-slate-200 bg-card">
                <th
                  onClick={() => handleSort("name")}
                  className="group min-w-[250px] cursor-pointer px-6 py-4 text-start font-bold tracking-wider text-slate-900 transition-colors hover:bg-secondary"
                >
                  <div className="flex items-center gap-2">
                    <MdSchool className="h-4 w-4 text-slate-500" />
                    <span>University Info</span>
                    <SortIndicator field="name" />
                  </div>
                </th>

                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                  <div className="flex min-w-[150px] items-center gap-2">
                    <MdOutlineCategory className="h-4 w-4 text-slate-500" />
                    <span>Type</span>
                  </div>
                </th>

                <th className="group px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                  <div className="flex min-w-[120px] items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>Next Intake</span>
                  </div>
                </th>

                <th className="group px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                  <div className="flex min-w-[120px] items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-slate-500" />
                    Status
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
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <Loading text="Fetching Universities data..." />
                  </td>
                </tr>
              )}

              {!error && !loading && currentUniversities.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <NoMessagesFound
                      title="No universities found"
                      subtitle="There are currently no universities available."
                    />
                  </td>
                </tr>
              )}

              {!error && currentUniversities.map((uni) => (
                <tr
                  key={uni.id}
                  className="hover:bg-primary/10 group transition-colors"
                >
                  <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center
                rounded-full bg-accent-light text-h6 font-medium text-blue-700 "
                      >
                        {uni ? (
                          uni.name?.slice(0, 2).toUpperCase()
                        ) : (
                          <div className="h-5 w-5 animate-pulse rounded-full bg-gray-300" />
                        )}
                      </div>

                      <div className="w-full min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {uni.name}
                        </h3>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-start">
                      {(() => {
                        const type = uni.university_type_name;

                        const typeConfig: Record<string, any> = {
                          minimal: {
                            bg: "bg-blue-50 border-blue-200",
                            text: "text-blue-700",
                            dot: "bg-blue-600",
                            label: "Minimal",
                          },
                          extended: {
                            bg: "bg-green-50 border-green-200",
                            text: "text-green-700",
                            dot: "bg-green-600",
                            label: "Extended",
                          },
                          conditional: {
                            bg: "bg-orange-50 border-orange-200",
                            text: "text-orange-700",
                            dot: "bg-orange-600",
                            label: "Conditional",
                          },
                        };

                        const normalizedType = type
                          ?.toLowerCase()
                          .trim()
                          .replace(/\s+/g, "_");

                        const config = typeConfig[normalizedType] || {
                          bg: "bg-gray-100 border-gray-200",
                          text: "text-gray-700",
                          dot: "bg-gray-400",
                          label: type || "Not Provided",
                        };

                        return (
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}
                            title={config.label}
                          >
                                <span
                                  className={`h-2 w-2 rounded-full ${config.dot}`}
                                ></span>
                                <span className="truncate">{config.label}</span>
                              </span>
                        );
                      })()}
                    </div>
                  </td>

                  <td className="px-6 py-4 min-w-[250px]">
                    <div className="flex flex-wrap gap-2">
                      {uni.intake_months &&
                      uni.intake_months.length > 0 ? (
                        uni.intake_months.map(
                          (date: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                            >
                                      {formatDate(date)}
                                    </span>
                          )
                        )
                      ) : (
                        <span className="text-sm text-slate-400">
                                  TBA
                                </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div
                      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold
        ${
                        uni.is_active
                          ? "border-green-600 bg-green-100 text-green-700"
                          : "border-slate-300 bg-slate-100 text-slate-500"
                      }`}
                    >
                      {uni.is_active ? (
                        <FaCheckCircle className="text-[10px]" />
                      ) : (
                        <FaTimesCircle className="text-[10px]" />
                      )}
                      {uni.is_active ? "Active" : "Inactive"}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <a
                        role="menuitem"
                        aria-label="View University"
                        href={`/admin/universities/${uni.id}`}
                        className="flex items-center justify-center rounded-full p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                      >
                        <Eye className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                      </a>


                      <div className="h-6 border-l border-slate-200" />

                      <a
                        role="menuitem"
                        aria-label="Edit University"
                        href={`/admin/universities/${uni.id}/edit`}
                        className="flex items-center justify-center rounded-full p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                      >
                        <Pencil className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                      </a>

                      <div className="h-6 border-l border-slate-200" />

                      <button
                        role="menuitem"
                        aria-label="Delete University"
                        onClick={() => {
                          setSelectedUniversityId(uni.id);
                          setSelectedUniversityName(uni.name);
                          setIsDeleteOpen(true);
                        }}
                        className="flex items-center justify-center rounded-full p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                      >
                        <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" />
                      </button>

                      <div className="h-6 border-l border-slate-200" />

                      <button
                        role="menuitem"
                        aria-label="Delete University"
                        onClick={() => {
                          setSelectedUniversity(uni);
                          setIsUpdateOpen(true);
                        }}
                        className="flex items-center justify-center rounded-full p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                      >
                        <Settings className="h-4 w-4 text-slate-500 hover:text-red-600" />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}

              </tbody>
            </table>

          </div>

          <div className="grid grid-cols-1 items-center gap-4 border-t border-gray-200 p-4 sm:p-6 md:flex  md:justify-between">
            {universities.length > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
                Showing
                <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>
                to
                <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, universities.length)}
                    </span>
                of
                <span className="font-medium">{universities.length}</span>
                Universities
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
                {Math.ceil(universities.length / itemsPerPage)}
                  </span>

              <NextButton
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(universities.length / itemsPerPage)
                    )
                  )
                }
                disabled={
                  currentPage === Math.ceil(universities.length / itemsPerPage)
                }
                text="Next"
                icon={<ArrowRight className="h-4 w-4" />}
              />
            </div>
          </div>

        </div>


      </div>

      <DeleteUniversityConfirmation
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        universityName={selectedUniversityName}
      />

      <UpdateUniversityType
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        universityId={selectedUniversity?.id || null}
        initialData={selectedUniversity}
      />

      <CreateUniversity
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

    </div>
  );
};

export default UniversitiesTable;
