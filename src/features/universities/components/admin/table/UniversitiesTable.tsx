"use client";

import React, { useEffect, useMemo, useState } from 'react';
import PresignedImage from "components/ui/PresignedImage";
import {
  Search,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Settings,
  ChevronRight,
  CheckCircle,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  GraduationCap, Wallet,
} from 'lucide-react';
import { MdOutlineCategory, MdSchool } from 'react-icons/md';
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import { useDeleteUniversity, useUniversities } from "features/universities/hooks";

import { useRouter } from "next/navigation";
import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";
import Link from "components/ui/links/LinkBtn";

import NoMessagesFound from "components/emptyData/NoMessagesFound";

import DeleteUniversityConfirmation from "../popups/DeleteUniversityConfirmation";
import BatchAssignPaymentMethod from "../payment-methods/BatchAssignPaymentMethod";
import CreateUniversity from "../popups/CreateUniversity";
import AssignPaymentUniversity from "../popups/AssignPaymentMethods";
import Loading from "components/loading/Loading";
import { useToast } from "components/context/ToastContext";

const UniversitiesTable = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { universities, loading, error, refetch } = useUniversities();

  const { deleteUniversity, isDeleting } = useDeleteUniversity();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [isBatchAssignOpen, setIsBatchAssignOpen] = useState(false);
  const [isAssignPaymentOpen, setIsAssignPaymentOpen] = useState(false);
  const [assignPaymentUniversityId, setAssignPaymentUniversityId] = useState<string>("");

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

  const [selectedUniversities, setSelectedUniversities] = useState<
    Record<string, boolean>
  >({});

  const handleSelectUniversity = (id: string) => {
    setSelectedUniversities((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectedUniversityIds = useMemo(() => {
    return Object.keys(selectedUniversities).filter(
      (id) => selectedUniversities[id]
    );
  }, [selectedUniversities]);

  const selectedCount = Object.values(selectedUniversities).filter(Boolean).length;

  useEffect(() => {
    setSelectedUniversities((prev) => {
      const updated: Record<string, boolean> = { ...prev };
      filteredUniversities.forEach((p) => {
        if (!(p.id in updated)) {
          updated[p.id] = false;
        }
      });
      return updated;
    });
  }, [filteredUniversities]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedState, selectedField]);

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedUniversities).every(Boolean);
    const newSelection: Record<string, boolean> = {};
    Object.keys(selectedUniversities).forEach((id) => {
      newSelection[id] = !allSelected;
    });
    setSelectedUniversities(newSelection);
  };

  const handleDelete = async () => {
    if (!selectedUniversityId) return;

    try {
      await deleteUniversity(selectedUniversityId);

      showToast("University deleted successfully.", "success");

      setIsDeleteOpen(false);
      setSelectedUniversityId(null);
      setSelectedUniversityName("");

      refetch();
    }
    catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Please try again.";
      showToast(`Failed to delete university. ${backendMessage}`, "error");
    }
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2">
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

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:gap-4 w-full">

            <div className="relative w-full sm:w-64 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
              <input
                type="text"
                placeholder="Search by university, University, or level..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-background w-full rounded-md border border-gray-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedState("all");
                setSelectedField("all");
                setCurrentPage(1);
              }}
              className="flex items-center justify-center gap-2 rounded-md border border-red-600 px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-100 disabled:opacity-50"
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

            {selectedCount > 0 && (
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">

                <button
                  onClick={() => {
                    setIsBatchAssignOpen(true);
                  }}
                  className="bg-background-700 flex items-center justify-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm text-slate-500 outline-0 transition hover:border-blue-700 hover:text-blue-700 sm:w-auto">
                  <Wallet className="h-4 w-4" />
                  Assign Payment Methods
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
                  className="group cursor-pointer transition-colors hover:bg-primary/10"
                  onClick={() => router.push(`/admin/universities/${uni.id}`)}
                >

                  <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <PresignedImage
                        fileKey={uni?.logo_file_key}
                        alt={uni.name}
                        className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-blue-500 ring-offset-2 shadow-md"
                        fallback={
                            <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center
                rounded-full bg-accent-light text-h6 font-medium text-blue-700 "
                      >
                        {uni ? (
                          uni.name?.slice(0, 2).toUpperCase()
                        ) : (
                          <div className="h-5 w-5 animate-pulse rounded-md bg-gray-300" />
                        )}

                          </div>
                        }
                      />

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
                            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}
                            title={config.label}
                          >
                                <span
                                  className={`h-2 w-2 rounded-md ${config.dot}`}
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
                      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-3 py-1 text-xs font-semibold
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
                      <button
                        role="menuitem"
                        aria-label="Assign Payment Method"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssignPaymentUniversityId(uni.id);
                          setIsAssignPaymentOpen(true);
                        }}
                        className="flex items-center justify-center rounded-md p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                      >
                        <Wallet className="h-4 w-4 text-slate-500 hover:text-blue-600" />
                      </button>

                      <div className="h-6 border-l border-slate-200" />

                      <a
                        role="menuitem"
                        aria-label="Edit University"
                        href={`/admin/universities/${uni.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center rounded-md p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                      >
                        <Pencil className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                      </a>

                      <div className="h-6 border-l border-slate-200" />

                      <button
                        role="menuitem"
                        aria-label="Delete University"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUniversityId(uni.id);
                          setSelectedUniversityName(uni.name);
                          setIsDeleteOpen(true);
                        }}
                        className="flex items-center justify-center rounded-md p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                      >
                        <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
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

      <BatchAssignPaymentMethod
        isOpen={isBatchAssignOpen}
        onClose={() => setIsBatchAssignOpen(false)}
        selectedUniversityIds={selectedUniversityIds}
        onSuccess={refetch}
      />

      <CreateUniversity
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refetch}
      />

      <AssignPaymentUniversity
        isOpen={isAssignPaymentOpen}
        onClose={() => setIsAssignPaymentOpen(false)}
        universityId={assignPaymentUniversityId}
        onSuccess={refetch}
      />

    </div>
  );
};

export default UniversitiesTable;
