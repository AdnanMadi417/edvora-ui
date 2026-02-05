"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  Search,
  Layers,
  Flag,
  Eye,
  Calendar,
  Clock,
  User,
  BadgeCheck,
  Settings,
  CalendarCheck,
  GraduationCap,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import avatar from "/public/img/avatars/user.png";
import Image from "next/image";
import Link from "next/link";
import EmptyData from "components/emptyData/EmptyTableData";
import api from "lib/useApi";
import Cookies from "js-cookie";
import NextButton from "../../ui/buttons/NextButton";
import PrevButton from "../../ui/buttons/PrevButton";
import ClearButton from "../../ui/buttons/DangerButton";

const PartnerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all_status");
  const [filterStages, setFilterStages] = useState("all_stages");
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = Cookies.get("token");
        const partnerId = localStorage.getItem("partnerId");

        if (!token || !partnerId) {
          console.error("Missing token or partnerId", { token, partnerId });
          return;
        }

        const res = await api.get(`/partners/${partnerId}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const appsWithPriority = res.data.items.map((app: any) => ({
          ...app,
        }));

        setApplications(appsWithPriority);
      } catch (err: any) {
        console.error("Error fetching partner applications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleSort = (key: string) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = [...applications];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          (app.studentName?.toLowerCase() ?? "").includes(term) ||
          (app.studentEmail?.toLowerCase() ?? "").includes(term) ||
          (app.university?.toLowerCase() ?? "").includes(term) ||
          (app.applicationName?.toLowerCase() ?? "").includes(term) ||
          (app.partner?.toLowerCase() ?? "").includes(term) ||
          (app.stage?.toLowerCase() ?? "").includes(term)
      );
    }

    if (filterStatus !== "all_status") {
      filtered = filtered.filter(
        (app) =>
          (app.status?.toLowerCase().replace(/\s+/g, "_") ?? "") ===
          filterStatus
      );
    }

    if (filterStages !== "all_stages") {
      filtered = filtered.filter(
        (app) =>
          (app.stage?.toLowerCase().replace(/\s+/g, "_") ?? "") === filterStages
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
  }, [applications, searchTerm, filterStatus, filterStages, sortConfig]);

  const totalPages = Math.ceil(
    filteredAndSortedApplications.length / itemsPerPage
  );
  const paginatedApplications = filteredAndSortedApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<string, any> = {
      new_application: {
        bg: "bg-blue-50 border-blue-200",
        text: "text-blue-700",
        dot: "bg-blue-600",
        label: "New Application",
      },
      under_review_by_account_manager: {
        bg: "bg-yellow-50 border-yellow-200",
        text: "text-yellow-700",
        dot: "bg-yellow-600",
        label: "Under Review by Account Manager",
      },
      correction_requested_by_account_manager: {
        bg: "bg-orange-50 border-orange-200",
        text: "text-orange-700",
        dot: "bg-orange-600",
        label: "Correction Requested by Account Manager",
      },
      approved_from_stage_1: {
        bg: "bg-green-50 border-green-200",
        text: "text-green-700",
        dot: "bg-green-600",
        label: "Approved",
      },
      rejected: {
        bg: "bg-red-50 border-red-200",
        text: "text-red-700",
        dot: "bg-red-600",
        label: "Rejected",
      },
    };

    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, "_");

    const config = statusConfig[normalizedStatus] || {
      bg: "bg-gray-100 border-gray-200",
      text: "text-gray-700",
      dot: "bg-gray-400",
      label: status || "Unknown",
    };

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-normal ${config.bg} ${config.text}`}
        title={config.label}
      >
        <span className={`h-2 w-2 rounded-full ${config.dot}`}></span>
        <span className="truncate">{config.label}</span>
      </span>
    );
  };

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

  return (
    <div className="mt-6 overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="relative p-6">
          <div className="mb-6 flex flex-col gap-6 rounded-xl md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-text-primary">
                Applications Dashboard
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Manage and track student applications
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
              <input
                type="text"
                placeholder="Search applications by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background w-full rounded-full border border-gray-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
              />
            </div>

            <div className="relative flex-1 sm:flex-none">
              <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
              <select
                value={filterStages}
                onChange={(e) => setFilterStages(e.target.value)}
                className="bg-background w-full cursor-pointer rounded-full border border-gray-200 py-2.5 pl-10 pr-8 text-sm outline-0 focus:border-blue-500 focus:text-blue-500 focus:ring-0 focus:ring-blue-500"
              >
                <option value="all_stages">All Stages</option>
                <option value="application_review">Application Review</option>
                <option value="offer_letter">Offer Letter</option>
                <option value="visa_processing">Visa Processing</option>
              </select>
            </div>

            <div className="relative flex-1 sm:flex-none">
              <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-background w-full cursor-pointer rounded-full border border-gray-200 py-2.5 pl-10 pr-8 text-sm outline-0 focus:border-blue-500 focus:text-blue-500 focus:ring-0 focus:ring-blue-500"
              >
                <option value="all_status">All Status</option>
                <option value="new_application">New Application</option>
                <option value="under_review_by_account_manager">
                  Under Review
                </option>
                <option value="correction_requested_by_account_manager">
                  Correction Requested
                </option>
                <option value="approved_from_stage_1">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <Link
              className="bg-background-700 flex items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm text-slate-500 outline-0 transition hover:border-blue-700 hover:text-blue-700 sm:w-auto"
              href="/partner/applications/new-application"
            >
              New Application
            </Link>

            <ClearButton
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all_status");
                setFilterStages("all_stages");
              }}
              text="Clear"
              icon={<RefreshCw className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg rounded-b-none border border-b-0 border-gray-200 bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-card">
              <th
                onClick={() => handleSort("studentName")}
                className="group cursor-pointer px-6 py-4 text-start font-bold tracking-wider text-text-primary transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student
                  <SortIndicator field="studentName" />
                </div>
              </th>

              <th
                onClick={() => handleSort("applicationName")}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-text-primary transition-colors hover:bg-secondary"
              >
                <div className="flex min-w-[250px] items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  University / Program
                  <SortIndicator field="applicationName" />
                </div>
              </th>

              <th
                onClick={() => handleSort("stage")}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-text-primary transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Stage
                  <SortIndicator field="stage" />
                </div>
              </th>

              <th
                onClick={() => handleSort("status")}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-text-primary transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" />
                  Status
                  <SortIndicator field="status" />
                </div>
              </th>

              <th className="min-w-[200px] px-6 py-4 text-start font-semibold tracking-wider text-text-primary">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  Next Action
                </div>
              </th>

              <th
                onClick={() => handleSort("updatedAt")}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-text-primary transition-colors hover:bg-secondary"
              >
                <div className="flex min-w-[150px] items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Last Updated
                  <SortIndicator field="updatedAt" />
                </div>
              </th>

              <th className="px-6 py-4 text-start font-semibold tracking-wider text-text-primary">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Actions
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-border-gray-200 divide-y bg-primary">
            {loading ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-4 text-center text-p1 text-slate-500"
                >
                  Loading applications...
                </td>
              </tr>
            ) : paginatedApplications.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  <EmptyData />
                </td>
              </tr>
            ) : (
              paginatedApplications.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-primary/10 group transition-colors"
                >
                  <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-gray-200 bg-white">
                        <Image
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full"
                          src={avatar}
                          alt={app.student_name}
                        />
                      </div>

                      <div className="w-full overflow-hidden">
                        <div className="truncate text-text-primary">
                          {app.student_name}
                        </div>
                        <div className="truncate text-caption text-slate-500">
                          {app.student_email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="min-w-[250px] max-w-[300px] px-6 py-4">
                    <div className="text-text-primary">{app.program_name}</div>
                    <div className="truncate text-caption text-slate-500">
                      {app.university_name}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-slate-500">{app.stage}</div>
                  </td>

                  <td className="min-w-[150px] px-6 py-4">
                    <StatusBadge status={app.status} />
                  </td>

                  <td className="px-6 py-4">
                    <div className="max-w-[200px] break-words text-slate-500">
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
                      href={`/partner/applications/${app.id}`}
                      aria-label="View Application"
                      className="flex items-center justify-center gap-2 rounded-full border border-gray-200 p-2 text-caption text-text-primary transition hover:border-blue-700 hover:text-blue-700"
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
        <div className="flex flex-col items-center justify-between gap-2 text-sm text-slate-500 md:flex-row">
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

export default PartnerApplications;
