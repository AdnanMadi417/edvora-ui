import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  Eye,
  Calendar,
  Clock,
  User,
  Building,
  GraduationCap,
  CalendarCheck,
  BadgeCheck,
  Settings,
  ArrowLeft,
  ArrowRight, UserSearch, GitBranch, RotateCcw,
} from 'lucide-react';
import { MdSchool } from 'react-icons/md';
import Link from "next/link";

import { useAdminApplications } from "hooks/applications/useAdminApplications";
import { useAllUniversities } from 'hooks/knowledge-hub/universities/useUniversitiesList';
import { useAllStages } from 'hooks/applications/stages/useStages';
import { useAllStageStatuses } from 'hooks/applications/stages/useStageStatuses';

import EmptyData from "components/emptyData/EmptyTableData";
import PrevButton from "components/ui/buttons/PrevButton";
import NextButton from "components/ui/buttons/NextButton";
import ClearButton from "components/ui/buttons/DangerButton";
import FilterSelectField from 'components/form/filter/FilterSelectField';
import { useRouter } from "next/navigation";

const ModernApplicationsTable = () => {

  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const {
    items: adminApplications,
    loading,
    error,
    total,
  } = useAdminApplications({
    limit: 20,
    offset: (currentPage - 1) * 20,
    status: "active",
  });

  const { universities } = useAllUniversities();
  const { stages } = useAllStages();
  const { stageStatuses, stageStatusesLoading } = useAllStageStatuses();

  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedStages, setSelectedStages] = useState<string>("all");
  const [selectedStageStatus, setSelectedStageStatus] = useState<string>("all");

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedUniversity, selectedStages, selectedStageStatus]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = [...adminApplications];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          (app.student_name?.toLowerCase() ?? "").includes(term) ||
          (app.student_email?.toLowerCase() ?? "").includes(term) ||
          (app.partner_name?.toLowerCase() ?? "").includes(term) ||
          (app.account_manager_name?.toLowerCase() ?? "").includes(term) ||
          (app.program_name?.toLowerCase() ?? "").includes(term) ||
          (app.university_name?.toLowerCase() ?? "").includes(term)
      );
    }

    if (selectedStageStatus !== "all" && !stageStatusesLoading) {
      filtered = filtered.filter(
        (app) =>
          app.status?.toLowerCase().replace(/\s+/g, "_") === selectedStageStatus
      );
    }

    if (selectedStages !== "all") {
      filtered = filtered.filter(
        (app) => app.stage?.toLowerCase() === selectedStages.toLowerCase()
      );
    }

    if (selectedUniversity !== "all") {
      filtered = filtered.filter(
        (app) => app.university_name?.toLowerCase() === selectedUniversity.toLowerCase()
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key]?.toString().toLowerCase() ?? "";
        const bVal = b[sortConfig.key]?.toString().toLowerCase() ?? "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    adminApplications,
    searchTerm,
    selectedUniversity,
    selectedStages,
    selectedStageStatus,
    sortConfig,
    stageStatusesLoading,
  ]);

  const itemsPerPage = 20;
  const totalPages = Math.ceil(total / itemsPerPage);

  const paginatedApplications = filteredAndSortedApplications;

  const SortIndicator = ({ field }) => {
    if (sortConfig.key !== field) {
      return (
        <ChevronUp className="h-4 w-4 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100" />
      );
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4 text-accent" />
    ) : (
      <ChevronDown className="h-4 w-4 text-accent" />
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedUniversity("all");
    setSelectedStages("all");
    setSelectedStageStatus("all");
    setSortConfig({ key: null, direction: "asc" });
  };

  return (
    <div className="mt-6 overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="relative p-6">
          <div className="mb-6 flex flex-col gap-6 rounded-xl md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Applications Dashboard
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Manage and track student applications
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:gap-4 w-full">

            <div className="relative w-full sm:w-64 flex-shrink-0">
              <UserSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background w-full rounded-full border border-gray-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
              />
            </div>

            <div className="w-full sm:w-48 flex-shrink-0">
              <FilterSelectField
                value={selectedStages}
                onChange={(val) => setSelectedStages(val)}
                options={stages}
                icon={GitBranch}
                defaultOption="All Stages"
              />
            </div>

            <div className="w-full sm:w-48 flex-shrink-0">
              <FilterSelectField
                value={selectedStageStatus}
                onChange={(val) => setSelectedStageStatus(val)}
                options={stageStatuses.map(s => ({
                  label: s.name,
                  value: s.name.toLowerCase().replace(/\s+/g, "_")
                }))}
                icon={BadgeCheck}
                defaultOption={stageStatusesLoading ? "Loading statuses..." : "All Statuses"}
              />
            </div>

            <div className="w-full sm:w-48 flex-shrink-0">
              <FilterSelectField
                value={selectedUniversity}
                onChange={(val) => setSelectedUniversity(val)}
                options={universities}
                icon={MdSchool}
                defaultOption="All Universities"
              />
            </div>

            <ClearButton
              onClick={handleClearFilters}
              text="Clear"
              icon={<RotateCcw className="h-4 w-4" />}
            />
          </div>

        </div>
      </div>

      <div className="overflow-x-auto rounded-lg rounded-b-none border border-b-0 border-gray-200 bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-card">
              <th
                onClick={() => handleSort("student_name")}
                className="group cursor-pointer px-6 py-4 text-start font-bold tracking-wider text-slate-900 transition-colors hover:bg-slate-100"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  Student
                  <SortIndicator field="student_name" />
                </div>
              </th>

              <th
                onClick={() => handleSort("application-name")}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-slate-100"
              >
                <div className="flex min-w-[250px] items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-500" />
                  University / Program
                  <SortIndicator field="application-name" />
                </div>
              </th>

              <th
                onClick={() => handleSort("partner_name")}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-slate-100"
              >
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-500" />
                  Ownership
                  <SortIndicator field="partner_name" />
                </div>
              </th>

              <th
                onClick={() => handleSort("status")}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-slate-100"
              >
                <div className="flex min-w-[250px] items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-slate-500" />
                  Stage / Status
                  <SortIndicator field="status" />
                </div>
              </th>

              <th className="min-w-[200px] px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                <div className="flex items-center gap-2 ">
                  <CalendarCheck className="h-4 w-4 text-slate-500" />
                  Next Action
                </div>
              </th>

              <th className="group px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                <div className="flex min-w-[150px] items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  Last Updated
                </div>
              </th>

              <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-slate-500" />
                  Actions
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-border-gray-200 divide-y bg-primary">
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-4 text-center text-p1 text-slate-500"
                >
                  Loading applications...
                </td>
              </tr>
            ) : paginatedApplications.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  <EmptyData />
                </td>
              </tr>
            ) : (
              paginatedApplications.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-primary/10 group cursor-pointer transition-colors"
                  onClick={() => router.push(`/admin/applications/${app.id}`)}
                >
                  <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center
                rounded-full bg-accent-light text-h6 font-medium text-blue-700 "
                      >
                        {app ? (
                          app.student_name[0].toUpperCase()
                        ) : (
                          <div className="h-5 w-5 animate-pulse rounded-full bg-gray-300" />
                        )}
                      </div>

                      <div className="w-full overflow-hidden">
                        <div className="truncate text-slate-900">
                          {app.student_name}
                        </div>
                        <div className="truncate text-caption text-slate-500">
                          {app.student_email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="min-w-[250px] max-w-[300px] px-6 py-4">
                    <div className="text-slate-900">{app.program_name}</div>
                    <div className="truncate text-caption text-slate-500">
                      {app.university_name}
                    </div>
                  </td>

                  <td className="min-w-[200px] max-w-[250px] px-6 py-4">
                    <div className="truncate text-slate-900">
                      {app.partner_name}
                    </div>
                    <div className="truncate text-caption text-slate-500">
                      {app.account_manager_name}
                    </div>
                  </td>

                  <td className="min-w-[250px] max-w-[300px] px-6 py-4">
                    <div className="text-slate-900">{app.stage}</div>
                    <div className="truncate text-caption text-slate-500">
                      {app.status}
                    </div>
                  </td>

                  <td className="max-w-48 px-6 py-4">
                    <div className="break-words text-slate-500">
                      {app.next_action}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(app.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "2-digit",
                      })}
                    </div>
                  </td>

                  <td className="min-w-[150px] px-6 py-4">
                    <Link
                      href={`/admin/applications/${app.id}`}
                      aria-label="View Application"
                      className="flex items-center justify-center gap-2 rounded-full border border-gray-200 p-2 text-caption text-slate-900 transition hover:border-blue-700 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-0 rounded-b-lg border border-gray-200 bg-card px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-slate-500 md:flex-row">
          <div>
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-normal">
              {Math.min(
                currentPage * itemsPerPage,
                filteredAndSortedApplications.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-normal">
              {filteredAndSortedApplications.length}
            </span>{" "}
            results
          </div>

          <div className="flex items-center gap-2">
            <PrevButton
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              text="Previous"
              icon={<ArrowLeft className="h-4 w-4" />}
            />

            <span className="px-2 text-slate-500">
              Page {currentPage} of {totalPages}
            </span>

            <NextButton
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              text="Next"
              icon={<ArrowRight className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernApplicationsTable;
