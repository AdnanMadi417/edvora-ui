"use client";

import React, { useEffect, useMemo, useState } from 'react';
import PresignedImage from "components/ui/PresignedImage";
import {
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
  GraduationCap,
  Wallet,
  XCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { MdOutlineCategory, MdSchool } from 'react-icons/md';
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import { useDeleteUniversity, useUniversities } from "features/universities/hooks";

import { useRouter } from "next/navigation";
import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";
import Link from "components/ui/links/LinkBtn";

import NoMessagesFound from "components/emptyData/NoMessagesFound";
import FilterSelectField from "components/form/filter/FilterSelectField";
import SearchInput from "components/form/filter/SearchInput";

import DeleteUniversityConfirmation from "../popups/DeleteUniversityConfirmation";
import AssignPaymentUniversity from "../popups/AssignPaymentMethods";
import Loading from "components/loading/Loading";
import { useToast } from "components/context/ToastContext";
import { AppDate } from "components/ui/date";

const UniversitiesTable = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const { showToast } = useToast();


  const { universities, loading, error, refetch } = useUniversities();

  const { deleteUniversity, isDeleting } = useDeleteUniversity();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [isAssignPaymentOpen, setIsAssignPaymentOpen] = useState(false);
  const [assignPaymentUniversityId, setAssignPaymentUniversityId] = useState<string>("");

  const [selectedUniversityId, setSelectedUniversityId] = useState<
    string | null
  >(null);
  const [selectedUniversityName, setSelectedUniversityName] =
    useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const activeFiltersCount = (selectedStatus !== "all" ? 1 : 0) + (selectedType !== "all" ? 1 : 0);

  const stats = React.useMemo(() => ({
    total: universities.length,
    active: universities.filter((u) => u.is_active).length,
    inactive: universities.filter((u) => !u.is_active).length,
  }), [universities]);

  const universityTypes = React.useMemo(() => {
    const types = universities.map((u) => u.university_type_name).filter(Boolean);
    return [...new Set(types)] as string[];
  }, [universities]);

  const filteredUniversities = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return universities.filter((university) => {
      const matchesSearch = !term ||
        university.name?.toLowerCase().includes(term) ||
        university.country?.toLowerCase().includes(term);
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && university.is_active) ||
        (selectedStatus === "inactive" && !university.is_active);
      const matchesType =
        selectedType === "all" ||
        university.university_type_name?.toLowerCase().trim() === selectedType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [universities, searchTerm, selectedStatus, selectedType]);

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


  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
    <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2 rounded-lg border border-slate-200 bg-white p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Universities</h3>
          <p className="mt-1 text-sm text-slate-500">Manage university listings and their payment methods</p>
        </div>
        <Link
          href="/admin/universities/create"
          icon={<GraduationCap className="h-5 w-5" />}
          label="Create University"
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          borderColor="border-blue-600"
          hoverTextColor="hover:text-blue-800"
          hoverBorderColor="hover:border-blue-700"
        />
      </div>

      {/* Stats Cards */}
      <div className="mb-6 border-t border-slate-200 pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => { setSelectedStatus("all"); setCurrentPage(1); }}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
            selectedStatus === "all"
              ? "border-slate-400 bg-slate-100 shadow-sm"
              : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <GraduationCap className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-500">Total Universities</p>
          </div>
        </button>

        <button
          onClick={() => { setSelectedStatus("active"); setCurrentPage(1); }}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
            selectedStatus === "active"
              ? "border-green-300 bg-green-50 shadow-sm"
              : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{stats.active}</p>
            <p className="text-xs text-slate-500">Active</p>
          </div>
        </button>

        <button
          onClick={() => { setSelectedStatus("inactive"); setCurrentPage(1); }}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
            selectedStatus === "inactive"
              ? "border-slate-400 bg-slate-100 shadow-sm"
              : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <XCircle className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{stats.inactive}</p>
            <p className="text-xs text-slate-500">Inactive</p>
          </div>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="mb-4 border-t border-slate-200 pt-6 flex flex-wrap items-center gap-3">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by name or country..."
        />

        <button
          className="relative sm:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-background text-slate-500 hover:bg-slate-50"
          onClick={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className={`${showFilters ? "flex" : "hidden"} w-full items-center gap-3 sm:contents`}>
          <div className="flex-1 sm:flex-none">
            <FilterSelectField
              value={selectedType}
              onChange={(val: string) => { setSelectedType(val); setCurrentPage(1); }}
              icon={MdOutlineCategory}
              defaultOption="All Types"
              options={universityTypes.map((type) => ({
                value: type.toLowerCase().trim(),
                label: type,
              }))}
            />
          </div>

          <button
            onClick={() => { setSearchTerm(""); setSelectedStatus("all"); setSelectedType("all"); setCurrentPage(1); setShowFilters(false); }}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white">

        <div className="block">

          <div className="overflow-x-auto rounded-lg rounded-b-none bg-white">
            <table className="w-full">

              <thead>

              <tr className="border-b border-slate-200 bg-slate-50">

                <th
                  onClick={() => handleSort("name")}
                  className="group min-w-[250px] cursor-pointer px-6 py-4 text-start font-bold tracking-wider text-slate-900 transition-colors hover:bg-slate-100"
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

                <th className="group min-w-[250px] px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                  <div className="flex items-center gap-2">
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

              <tbody className="divide-y divide-slate-200 bg-white">

              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <Loading text="Fetching Universities data..." />
                  </td>
                </tr>
              )}

              {!error && !loading && currentUniversities.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
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
                  className="group cursor-pointer transition-colors hover:bg-slate-100/50"
                  onClick={() => router.push(`/admin/universities/${uni.id}`)}
                >

                  <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <PresignedImage
                        fileKey={uni?.logo_file_key}
                        alt={uni.name}
                        className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-slate-200 ring-offset-2 shadow-sm"
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
                          bg: "bg-gray-100 border-slate-200",
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

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {uni.intake_months &&
                      uni.intake_months.length > 0 ? (
                        uni.intake_months.map(
                          (date: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                            >
                                      <AppDate value={date} format="month" />
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
                  <td className="w-8 pr-4 py-4">
                    <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                  </td>
                </tr>
              ))}

              </tbody>
            </table>

          </div>

          <div className="grid grid-cols-1 items-center gap-4 border-t border-slate-200 p-4 sm:p-6 md:flex  md:justify-between">
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
