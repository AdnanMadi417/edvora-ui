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
  Building,
  AlertTriangle,
  GraduationCap,
  CalendarCheck,
  BadgeCheck,
  Settings
} from "lucide-react";
import avatar from "/public/img/avatars/user.png";
import Image from "next/image";
import Link from "next/link";
import { applications as initialApplications } from "components/data/applications";
import EmptyData from "components/emptyData/EmptyTableData";

const ModernApplicationsTable = () => {
  const [applications] = useState(initialApplications);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.stage.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.applicationName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.partner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((app) => app.status === filterStatus);
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((app) => app.priority === filterPriority);
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [applications, searchTerm, filterStatus, filterPriority, sortConfig]);

  const totalPages = Math.ceil(
    filteredAndSortedApplications.length / itemsPerPage
  );
  const paginatedApplications = filteredAndSortedApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      "in-progress": {
        bg: "bg-blue-50 border-blue-200",
        text: "text-blue-700",
        dot: "bg-blue-500",
        width: "100px",
      },
      pending: {
        bg: "bg-amber-50 border-amber-200",
        text: "text-amber-700",
        dot: "bg-amber-500",
        width: "100px",
      },
      accepted: {
        bg: "bg-emerald-50 border-emerald-200",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        width: "100px",
      },
      rejected: {
        bg: "bg-red-50 border-red-200",
        text: "text-red-700",
        dot: "bg-red-500",
        width: "100px",
      },
    };

    const config = statusConfig[status] || statusConfig["pending"];

    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-p2 ${config.bg} ${config.text}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
      </div>
    );
  };

  const PriorityBadge = ({ priority }) => {
    const priorityConfig = {
      high: "bg-red-100 text-red-700 border-red-200 px-3 py-1",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200 px-3 py-1",
      low: "bg-gray-100 text-text-muted border-gray-200 px-3 py-1",
    };

    return (
      <span
        className={`inline-flex rounded-full border px-2 py-1 text-p2 ${priorityConfig[priority]}`}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const SortIndicator = ({ field }) => {
    if (sortConfig.key !== field) {
      return (
        <ChevronUp className="h-4 w-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
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
      <div className="relative mb-8 overflow-hidden rounded-lg border border-default bg-card">
        <div className="relative p-6">
          <div className="mb-6 flex flex-col gap-6 rounded-xl md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-text-primary">
                Applications Dashboard
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                Manage and track student applications
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-text-muted" />
              <input
                type="text"
                placeholder="Search applications by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background w-full rounded-full text-text-muted border border-default px-4 py-2.5 pl-10 pr-4 text-sm outline-0 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="relative flex-1 sm:flex-none">
              <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-text-muted" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-background w-full cursor-pointer rounded-full border border-default py-2.5 pl-10 pr-8 text-sm outline-0 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="in-progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="relative flex-1 sm:flex-none">
              <Flag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-text-muted" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-background w-full cursor-pointer rounded-full border border-default py-2.5 pl-10 pr-8 text-sm outline-0 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
                setFilterPriority("all");
              }}
              className="bg-background flex items-center justify-center outline-0 gap-2 rounded-full border border-default px-4 py-2.5 text-sm text-text-muted transition hover:border-text-error hover:text-text-error sm:w-auto"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg rounded-b-none border border-b-0 border-default bg-card">
        <table className="w-full">

          <thead>
          <tr className="border-b border-default bg-card">
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
              <div className="min-w-[250px] flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                University / Program
                <SortIndicator field="applicationName" />
              </div>
            </th>

            <th
              onClick={() => handleSort("partner")}
              className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-text-primary transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Partner
                <SortIndicator field="partner" />
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
              onClick={() => handleSort("priority")}
              className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-text-primary transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Priority
                <SortIndicator field="priority" />
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


          <tbody className="divide-border-default divide-y bg-primary">
          {loading ? (
            <tr>
              <td
                colSpan={9}
                className="px-6 py-4 text-center text-p1 text-text-muted"
              >
                Loading applications...
              </td>
            </tr>
          ) : paginatedApplications.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="px-6 py-8 text-center text-text-muted"
              >
                <EmptyData />
              </td>
            </tr>
          ) : (
            paginatedApplications.map((app) => (
              <tr
                key={app.id}
                className="group transition-colors hover:bg-primary"
              >
                <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-text-muted">
                      <Image
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full"
                        src={avatar}
                        alt={app.studentName}
                      />
                    </div>

                    <div className="truncate">
                      <div className="truncate text-text-primary">
                        {app.studentName}
                      </div>

                      <div className="truncate text-caption text-text-muted">
                        {app.studentEmail}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="min-w-[250px] max-w-[300px] px-6 py-4">
                  <div className=" text-text-primary">
                    {app.applicationName}
                  </div>

                  <div className="truncate text-caption text-text-muted">
                    {app.university}
                  </div>
                </td>

                <td className="min-w-[200px] max-w-[250px] px-6 py-4">
                  <div className="text-text-muted ">{app.partner}</div>
                </td>

                <td className="px-6 py-4">
                  <div className="text-text-muted">{app.stage}</div>
                </td>

                <td className="min-w-[150px] max-w-[150px] px-6 py-4">
                  <StatusBadge status={app.status} />
                </td>

                <td className="px-6 py-4 ">
                  <div className="max-w-48 truncate text-text-muted">
                    {app.nextAction}
                  </div>
                </td>

                <td className="min-w-[150px] max-w-[150px] px-6 py-4">
                  <PriorityBadge priority={app.priority} />
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-text-muted">
                    <Calendar className="h-3 w-3" />
                    {new Date(app.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "2-digit",
                    })}
                  </div>
                </td>

                <td className="min-w-[200px] px-6 py-4">
                  <Link
                    href={`/account-manager/applications/${app.id}`}
                    aria-label="View Application"
                    className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-blue-500 transition-colors duration-300 ease-in-out hover:bg-blue-100 hover:text-blue-600"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-caption">View Application</span>
                  </Link>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-0 rounded-b-lg border border-default bg-card px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-text-muted md:flex-row">
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
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-full border border-default bg-card px-3 py-2 transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2 text-text-muted">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-full border border-default bg-card px-3 py-2 transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernApplicationsTable;
