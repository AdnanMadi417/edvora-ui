"use client";

import React, { useEffect, useState } from 'react';
import { AnimatePresence } from "framer-motion";
import PresignedImage from "components/ub/data/PresignedImage";
import {
  RefreshCw,
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
  Landmark,
  Eye,
  EyeOff,
  Languages,
} from 'lucide-react';
import { MdOutlineCategory, MdSchool } from 'react-icons/md';
import StatusBadge from "components/ub/data/StatusBadge";

import { useDeleteUniversity, useSetUniversityHidden, useUniversities } from "features/universities/hooks";

import { useRouter } from "next/navigation";
import Button from "components/ub/core/Button";
import IconButton from "components/ub/core/IconButton";
import Link from "components/ub/core/LinkBtn";
import Tooltip from "components/ub/feedback/Tooltip";

import UniversityFilterPanel from "features/universities/components/shared/filters/UniversityFilterPanel";
import TableWrapper from "components/ub/data/TableWrapper";
import TableSkeletonRows from "components/ub/data/TableSkeletonRows";
import TableErrorRow from "components/ub/data/TableErrorRow";
import TableEmptyRow from "components/ub/data/TableEmptyRow";
import TablePagination from "components/ub/data/TablePagination";
import AnimatedTableRow from "components/ub/data/AnimatedTableRow";

import DeleteUniversityConfirmation from "../popups/DeleteUniversityConfirmation";
import AssignPaymentUniversity from "../popups/AssignPaymentMethods";
import { useToast } from "components/ub/feedback/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { monthLabel } from "features/programs/utils/intakeMonths";

type TriFilter = "all" | "true" | "false";

function triToBool(value: TriFilter): boolean | undefined {
  return value === "all" ? undefined : value === "true";
}

const UniversitiesTable = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isPublicFilter, setIsPublicFilter] = useState<TriFilter>("all");
  const [hasLanguageCenterFilter, setHasLanguageCenterFilter] = useState<TriFilter>("all");
  const [isHiddenFilter, setIsHiddenFilter] = useState<TriFilter>("all");
  const { showToast } = useToast();


  const { universities, loading, error, refetch } = useUniversities({
    includeInactive: true,
    isPublic: triToBool(isPublicFilter),
    hasLanguageCenter: triToBool(hasLanguageCenterFilter),
    isHidden: triToBool(isHiddenFilter),
  });

  const { deleteUniversity, isDeleting } = useDeleteUniversity();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { setUniversityHidden } = useSetUniversityHidden();
  const [togglingHiddenId, setTogglingHiddenId] = useState<string | null>(null);

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
  const activeFiltersCount =
    (searchTerm.trim() !== "" ? 1 : 0) +
    (selectedType !== "all" ? 1 : 0) +
    (isPublicFilter !== "all" ? 1 : 0) +
    (hasLanguageCenterFilter !== "all" ? 1 : 0) +
    (isHiddenFilter !== "all" ? 1 : 0);

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
      const matchesType =
        selectedType === "all" ||
        university.university_type_name?.toLowerCase().trim() === selectedType;
      return matchesSearch && matchesType;
    });
  }, [universities, searchTerm, selectedType]);

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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setIsPublicFilter("all");
    setHasLanguageCenterFilter("all");
    setIsHiddenFilter("all");
    setCurrentPage(1);
  };


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
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to delete university. ${backendMessage}`, "error");
    }
  };

  const handleToggleHidden = async (uni: { id: string; is_hidden: boolean }) => {
    const nextHidden = !uni.is_hidden;
    setTogglingHiddenId(uni.id);
    try {
      await setUniversityHidden(uni.id, nextHidden);
      showToast(nextHidden ? "University hidden" : "University is visible again", "success");
      refetch();
    } catch (error: unknown) {
      showToast(parseApiError(error, nextHidden ? "Failed to hide university" : "Failed to unhide university"), "error");
    } finally {
      setTogglingHiddenId(null);
    }
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2 rounded-lg border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6">
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

      {/* Search & Filters */}
      <div className="border-y border-slate-200 p-6">
        <UniversityFilterPanel
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search by name or country..."
          typeOptions={universityTypes.map((type) => ({
            value: type.toLowerCase().trim(),
            label: type,
          }))}
          filters={{
            type: selectedType,
            isPublic: isPublicFilter,
            hasLanguageCenter: hasLanguageCenterFilter,
            isHidden: isHiddenFilter,
          }}
          onApplyFilters={(values) => {
            setSelectedType(values.type);
            setIsPublicFilter(values.isPublic as TriFilter);
            setHasLanguageCenterFilter(values.hasLanguageCenter as TriFilter);
            setIsHiddenFilter(values.isHidden as TriFilter);
            setCurrentPage(1);
          }}
          onRemoveFilter={(key) => {
            if (key === "type") setSelectedType("all");
            if (key === "isPublic") setIsPublicFilter("all");
            if (key === "hasLanguageCenter") setHasLanguageCenterFilter("all");
            if (key === "isHidden") setIsHiddenFilter("all");
            setCurrentPage(1);
          }}
          onClearAll={clearFilters}
          resultsCount={sortedUniversities.length}
        />
      </div>

      <div className="p-6">
        <TableWrapper
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              itemCount={currentUniversities.length}
              totalCount={sortedUniversities.length}
              itemLabel="universities"
              loading={loading}
            />
          }
        >
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
                    <span>Intake Months</span>
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

              {loading && <TableSkeletonRows columns={6} rows={itemsPerPage} />}

              {!loading && error && (
                <TableErrorRow colSpan={6} message={error} onRetry={refetch} />
              )}

              {!loading && !error && currentUniversities.length === 0 && (
                <TableEmptyRow
                  colSpan={6}
                  title="No universities found"
                  subtitle={activeFiltersCount > 0 ? "Try adjusting your filters." : "There are currently no universities available."}
                  icon={<Landmark className="h-8 w-8 text-slate-400" />}
                  action={
                    activeFiltersCount > 0 ? (
                      <Button
                        onClick={clearFilters}
                        icon={<RefreshCw className="h-3.5 w-3.5" />}
                        text="Clear filters"
                        bgColor="bg-white"
                        textColor="text-slate-700"
                        borderColor="border-slate-200"
                        hoverTextColor="hover:text-slate-700"
                        hoverBorderColor="hover:border-slate-200"
                        className="hover:bg-slate-50"
                      />
                    ) : undefined
                  }
                />
              )}

              <AnimatePresence>
              {!loading && !error && currentUniversities.map((uni) => (
                <AnimatedTableRow
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
                        <p className="text-xs text-slate-500">{uni.is_public ? "Public" : "Private"}</p>
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
                          (month: number, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                            >
                                      {monthLabel(month)}
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
                    <div className="flex flex-wrap items-center gap-1.5">
                      {uni.is_active ? (
                        <StatusBadge variant="success" icon={<CheckCircle className="h-3 w-3" />}>Active</StatusBadge>
                      ) : (
                        <StatusBadge variant="neutral" icon={<XCircle className="h-3 w-3" />}>Inactive</StatusBadge>
                      )}
                      {uni.is_hidden && (
                        <StatusBadge variant="warning" icon={<EyeOff className="h-3 w-3" />}>Hidden</StatusBadge>
                      )}
                      {uni.has_language_center && (
                        <StatusBadge variant="info" icon={<Languages className="h-3 w-3" />}>Language Center</StatusBadge>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <IconButton
                        aria-label="Assign Payment Method"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssignPaymentUniversityId(uni.id);
                          setIsAssignPaymentOpen(true);
                        }}
                        icon={<Wallet className="h-4 w-4 text-slate-500 hover:text-blue-600" />}
                        bgColor="bg-transparent"
                        textColor="text-slate-700"
                        borderColor="border-transparent"
                        hoverTextColor="hover:text-slate-700"
                        hoverBorderColor="hover:border-transparent"
                        className="hover:bg-slate-100 focus:outline-none"
                      />

                      <div className="h-6 border-l border-slate-200" />

                      <Tooltip content={uni.is_hidden ? "Unhide university" : "Hide university"} position="left">
                        <IconButton
                          aria-label={uni.is_hidden ? "Unhide University" : "Hide University"}
                          disabled={togglingHiddenId === uni.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleHidden(uni);
                          }}
                          icon={uni.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          bgColor="bg-transparent"
                          textColor="text-slate-700"
                          borderColor="border-transparent"
                          hoverTextColor="hover:text-slate-700"
                          hoverBorderColor="hover:border-transparent"
                          className="hover:bg-slate-100 focus:outline-none"
                        />
                      </Tooltip>

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

                      <IconButton
                        aria-label="Delete University"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUniversityId(uni.id);
                          setSelectedUniversityName(uni.name);
                          setIsDeleteOpen(true);
                        }}
                        icon={<Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" />}
                        bgColor="bg-transparent"
                        textColor="text-slate-700"
                        borderColor="border-transparent"
                        hoverTextColor="hover:text-slate-700"
                        hoverBorderColor="hover:border-transparent"
                        className="hover:bg-slate-100 focus:outline-none"
                      />
                    </div>
                  </td>
                  <td className="w-8 pr-4 py-4">
                    <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                  </td>
                </AnimatedTableRow>
              ))}
              </AnimatePresence>

              </tbody>
            </table>
        </TableWrapper>
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
