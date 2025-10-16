import React, { useState, useMemo, useEffect } from "react";
import { ChevronUp,
  ChevronDown,
  Eye,
  Building,
  Tag,
  Phone,
  CheckCircle,
  Globe,
  CalendarDays,
  Settings,

} from "lucide-react";
import Image from "next/image";
import partner from "/public/img/dashboards/partner-icon.png";
import { partners as initialPartners } from "components/data/applications";
import EmptyData from '../../emptyData/EmptyTableData';

const ModernPartnersTable = () => {
  const [partners] = useState(initialPartners);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const filteredAndSortedPartners = useMemo(() => {
    let filtered = partners.filter((app) => {
      return (
        app.partner.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterStatus === "all" || app.status === filterStatus) &&
        (filterCountry === "all" || app.country === filterCountry) &&
        (filterType === "all" || app.type === filterType)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    partners,
    searchTerm,
    filterStatus,
    filterCountry,
    filterType,
    sortConfig,
  ]);

  const totalPages = Math.ceil(filteredAndSortedPartners.length / itemsPerPage);
  const paginatedPartners = filteredAndSortedPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      registered: {
        bg: "bg-emerald-50 border-emerald-200",
        text: "text-emerald-700",
      },
      pending: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
      rejected: { bg: "bg-red-50 border-red-200", text: "text-red-700" },
    };

    const config = statusConfig[status] || {
      bg: "bg-gray-50 border-gray-200",
      text: "text-gray-700",
    };

    return (
      <span
        className={`inline-flex rounded-full border px-2 py-1 text-p2 ${config.bg} ${config.text}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const SortIndicator = ({ field }) => {
    if (sortConfig.key !== field)
      return (
        <ChevronUp className="h-4 w-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
      );
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

          <div className="mb-5 block ">

              <h3 className="text-xl font-semibold text-text-primary">
                Partners Dashboard
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                Monitor partnerships and manage collaboration efficiently.
              </p>

          </div>

          <div className="mb-0 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <input
              type="text"
              placeholder="Search partners by name or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-default bg-card px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-64"
            />

            <div className="flex flex-wrap gap-3">
              <select
                className="rounded-full border border-default px-3 py-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="registered">Registered</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                className="rounded-full border border-default px-3 py-2"
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
              >
                <option value="all">All Countries</option>
                <option value="USA">USA</option>
                <option value="Malaysia">Malaysia</option>
              </select>
              <select
                className="rounded-full border border-default px-3 py-2"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="University">University</option>
                <option value="Organization">Organization</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterType("all");
                  setFilterCountry("all");
                }}
                className="bg-background flex items-center justify-center gap-2 rounded-full border border-default px-4 py-2.5 text-sm text-text-muted outline-0 transition hover:border-text-error hover:text-text-error sm:w-auto"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-default bg-card">
        <table className="w-full">

          <thead>
          <tr className="border-b border-default bg-card">
            <th className="min-w-[200px] max-w-[200px] px-6 py-4 text-start font-semibold tracking-wider text-text-primary">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Partner
                <SortIndicator field="partner" />
              </div>
            </th>

            <th className="min-w-[200px] max-w-[250px] px-6 py-4 text-start font-semibold tracking-wider text-text-primary">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Partner Type
                <SortIndicator field="type" />
              </div>
            </th>

            <th className="min-w-[200px] max-w-[200px] px-6 py-4 text-start font-semibold tracking-wider text-text-primary">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact
              </div>
            </th>

            <th className="min-w-[120px] max-w-[120px] px-6 py-4 text-start font-semibold tracking-wider text-text-primary">
              <div className="flex items-center gap-2">
                Country
              </div>
            </th>

            <th className="min-w-[120px] max-w-[120px] px-6 py-4 text-start font-semibold tracking-wider text-text-primary">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Status
              </div>
            </th>

            <th className="min-w-[200px] max-w-[200px] px-6 py-4 text-start font-semibold tracking-wider text-text-primary">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Date Registered
              </div>
            </th>

            <th className="min-w-[150px] max-w-[150px] px-6 py-4 text-start font-semibold tracking-wider text-text-primary">
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
                  colSpan={7}
                  className="px-6 py-4 text-center text-text-muted"
                >
                  Loading partners...
                </td>
              </tr>
            ) : paginatedPartners.length === 0 ? (
               <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-text-muted"
                  >
                    <EmptyData />
                  </td>
                </tr>

            ) : (
              paginatedPartners.map((app) => (
                <tr
                  key={app.id}
                  className="group transition-colors hover:bg-primary"
                >
                  <td className="flex min-w-[250px] max-w-[250px] items-center gap-2 px-6 py-4 text-text-primary">
                    <div className="">
                      <Image
                        width="40"
                        height="40"
                        className="h-10 w-10 rounded-full"
                        src={partner}
                        alt="Profile"
                      />
                    </div>

                    {app.partner}
                  </td>
                  <td className="min-w-[150px] max-w-[150px] px-6 py-4 text-text-muted">
                    {app.type}
                  </td>
                  <td className="min-w-[200px] max-w-[250px] px-6 py-4 text-text-muted">
                    <span className="block font-semibold">
                      {app.emailContact}
                    </span>
                    <span className="block font-normal text-text-primary">
                      {app.phoneContact}
                    </span>
                  </td>
                  <td className="min-w-[120px] max-w-[120px] px-6 py-4 text-text-muted">
                    {app.country}
                  </td>
                  <td className="min-w-[120px] max-w-[120px] px-6 py-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="min-w-[150px] max-w-[150px] px-6 py-4 text-text-muted">
                    {new Date(app.registeredAt).toLocaleDateString()}
                  </td>

                  <td className="min-w-[180px] px-6 py-4">
                    <button
                      aria-label="View Partner"
                      className="flex items-center gap-2 rounded-full p-1.5 text-text-muted outline-0 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-caption">View Partner</span>
                    </button>
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
                filteredAndSortedPartners.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-normal">
              {filteredAndSortedPartners.length}
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

export default ModernPartnersTable;
