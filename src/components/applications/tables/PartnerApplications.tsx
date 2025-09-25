import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import avatar from "/public/img/avatars/avatar4.png";
import emptyPng from "/public/img/dashboards/empty-data-icon.png";
import Image from "next/image";

const ModernApplicationsTable = () => {
  const [applications] = useState([
    {
      id: 1,
      studentName: "Sarah Chen",
      applicationName: "Computer Science Masters",
      partner: "Stanford University",
      stage: "Interview",
      status: "in-progress",
      nextAction: "Schedule final interview",
      priority: "high",
      updatedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      studentName: "Marcus Johnson",
      applicationName: "MBA Program",
      partner: "Harvard Business School",
      stage: "Application Review",
      status: "pending",
      nextAction: "Submit transcripts",
      priority: "medium",
      updatedAt: "2024-01-14T14:20:00Z",
    }
  ]);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
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
          app.applicationName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.partner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((app) => app.status === filterStatus);
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
  }, [applications, searchTerm, filterStatus, sortConfig]);

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
      high: "bg-red-100 text-red-700 border-red-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      low: "bg-secondary text-text-muted border-default",
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
    <div className="mt-6  overflow-hidden text-p2">

      <div className="border border-default bg-card p-6 rounded-lg mb-5">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Applications Dashboard
            </h2>
            <p className="mt-1  text-text-muted">
              Manage and track student applications
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-text-muted" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className=" w-full sm:w-64 rounded-md border bg-card py-2.5 pl-10 pr-4 outline-0 focus:border-accent focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-text-muted" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="focus:ring-1 focus:ring-blue-500 cursor-pointer appearance-none rounded-md border border-default bg-card py-2.5 pl-10 pr-8  outline-0 focus:border-accent"
              >
                <option value="all">All Status</option>
                <option value="in-progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-default bg-card rounded-lg">
        <table className="w-full">

          <thead>
          <tr className="border-b border-default bg-card">

            <th
              onClick={() => handleSort("studentName")}
              className="group w-[250px] cursor-pointer px-6 py-4 text-start font-bold tracking-wider text-text-primary transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-text-muted" />
                Student
                <SortIndicator field="studentName" />
              </div>
            </th>

            <th
              onClick={() => handleSort("applicationName")}
              className="group w-[200px] cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-text-primary transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-2">
                Application
                <SortIndicator field="applicationName" />
              </div>
            </th>

            <th
              onClick={() => handleSort("stage")}
              className="group w-[150px] cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-text-primary transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-2">
                Stage
                <SortIndicator field="stage" />
              </div>
            </th>

            <th
              onClick={() => handleSort("status")}
              className="group w-[150px] cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-text-primary transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-2">
                Status
                <SortIndicator field="status" />
              </div>
            </th>

            <th className="min-w-[140px] px-6 py-4 text-start font-semibold tracking-wider text-text-primary">
              Next Action
            </th>

            <th
              onClick={() => handleSort("priority")}
              className="group w-[150px] cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-text-primary transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-2">
                Priority
                <SortIndicator field="priority" />
              </div>
            </th>

            <th
              onClick={() => handleSort("updatedAt")}
              className="group w-[180px] cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-text-primary transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-text-muted" />
                Updated
                <SortIndicator field="updatedAt" />
              </div>
            </th>

            <th className="w-[150px] px-6 py-4 text-start font-semibold tracking-wider text-text-primary">
              Actions
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
                <div className="flex flex-col items-center gap-4">
                  <Image
                    width={100}
                    height={100}
                    className="h-[100px] w-[100px] rounded-md"
                    src={emptyPng}
                    alt="No applications"
                  />
                  <span className="text-p1">No applications found.</span>
                </div>
              </td>
            </tr>
          ) : (
            paginatedApplications.map((app) => (
              <tr
                key={app.id}
                className="group transition-colors hover:bg-primary"
              >
                <td className="w-[250px] px-6 py-4">
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
                    </div>
                  </div>
                </td>

                <td className="w-[200px] px-6 py-4">
                  <div className="text-text-primary">{app.applicationName}</div>
                </td>

                <td className="w-[150px] px-6 py-4">
                  <div className="text-text-muted">{app.stage}</div>
                </td>

                <td className="min-w-[150px] px-6 py-4">
                  <StatusBadge status={app.status} />
                </td>

                <td className="w-[200px] px-6 py-4">
                  <div className="truncate text-text-muted">
                    {app.nextAction}
                  </div>
                </td>

                <td className="w-[150px] px-6 py-4">
                  <PriorityBadge priority={app.priority} />
                </td>

                <td className="w-[180px] px-6 py-4">
                  <div className="flex items-center gap-1 text-text-muted">
                    <Calendar className="h-3 w-3" />
                    {new Date(app.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "2-digit",
                    })}
                  </div>
                </td>

                <td className="w-[150px] px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-blue-50 hover:text-blue-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-green-50 hover:text-green-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="border-t border-default bg-primary px-6 py-4 ">
          <div className="flex items-center justify-between">
            <div className="text-text-muted">
              Showing{" "}
              <span className="">{(currentPage - 1) * itemsPerPage + 1}</span>{" "}
              to{" "}
              <span className="">
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredAndSortedApplications.length
                )}
              </span>{" "}
              of{" "}
              <span className="">{filteredAndSortedApplications.length}</span>{" "}
              results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-md texttext-text-muted border border-default bg-card px-3 py-2 transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-2  text-text-muted">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-md texttext-text-muted border border-default bg-card px-3 py-2 transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernApplicationsTable;
