import React, { useState, useMemo, useEffect } from "react";
import { ChevronUp, ChevronDown, Eye, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import patner from "/public/img/dashboards/partner-icon.png";
import emptyPng from "/public/img/dashboards/empty-data-icon.png";

const ModernApplicationsTable = () => {
  const [applications] = useState([
    {
      id: 1,
      partner: "Stanford University",
      type: "University",
      contact: "sarah.chen@stanford.edu",
      country: "USA",
      status: "registered",
      registeredAt: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      partner: "Harvard Business School",
      type: "University",
      contact: "marcus.johnson@hbs.edu",
      country: "USA",
      status: "pending",
      registeredAt: "2024-01-14T14:20:00Z",
    },
    {
      id: 3,
      partner: "Local NGO",
      type: "Organization",
      contact: "info@localngo.org",
      country: "Malaysia",
      status: "registered",
      registeredAt: "2024-02-01T09:00:00Z",
    },
  ]);

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
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = applications.filter((app) => {
      return (
        app.partner.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterStatus === "all" || app.status === filterStatus) &&
        (filterCountry === "all" || app.country === filterCountry) &&
        (filterType === "all" || app.type === filterType)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [applications, searchTerm, filterStatus, filterCountry, filterType, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedApplications.length / itemsPerPage);
  const paginatedPartners = filteredAndSortedApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      registered: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" }, // Active
      pending: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },       // Pending
      rejected: { bg: "bg-red-50 border-red-200", text: "text-red-700" },             // Rejected
    };

    const config = statusConfig[status] || { bg: "bg-gray-50 border-gray-200", text: "text-gray-700" };

    return (
      <span className={`inline-flex rounded-full border px-2 py-1 text-p2 ${config.bg} ${config.text}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
    );
  };

  const SortIndicator = ({ field }) => {
    if (sortConfig.key !== field) return <ChevronUp className="h-4 w-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />;
    return sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4 text-accent" /> : <ChevronDown className="h-4 w-4 text-accent" />;
  };

  return (
    <div className="mt-6 overflow-hidden text-p2">

      <div className="border border-default bg-card p-6 rounded-lg mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search partners by name or business..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 rounded-md border border-default bg-card py-2.5 px-4 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex gap-3 flex-wrap">
          <select className="rounded-md border border-default px-3 py-2" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="registered">Registered</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="rounded-md border border-default px-3 py-2" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}>
            <option value="all">All Countries</option>
            <option value="USA">USA</option>
            <option value="Malaysia">Malaysia</option>
          </select>
          <select className="rounded-md border border-default px-3 py-2" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="University">University</option>
            <option value="Organization">Organization</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-default bg-card rounded-lg">
        <table className="w-full">

          <thead>
          <tr className="border-b border-default bg-card">
            <th
              className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-text-primary min-w-[200px] max-w-[200px]"
              onClick={() => handleSort("partner")}
            >
              <div className="flex items-center gap-2">
                Partner
                <SortIndicator field="partner" />
              </div>
            </th>

            <th
              className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-text-primary min-w-[150px] max-w-[150px]"
              onClick={() => handleSort("type")}
            >
              <div className="flex items-center gap-2">
                Type
                <SortIndicator field="type" />
              </div>
            </th>

            <th className="px-6 py-4 text-start font-semibold tracking-wider text-text-primary min-w-[200px] max-w-[200px]">
              Contact
            </th>

            <th className="px-6 py-4 text-start font-semibold tracking-wider text-text-primary min-w-[120px] max-w-[120px]">
              Country
            </th>

            <th className="px-6 py-4 text-start font-semibold tracking-wider text-text-primary min-w-[120px] max-w-[120px]">
              Status
            </th>

            <th className="px-6 py-4 text-start font-semibold tracking-wider text-text-primary min-w-[150px] max-w-[150px]">
              Registered
            </th>

            <th className="px-6 py-4 text-start font-semibold tracking-wider text-text-primary min-w-[150px] max-w-[150px] text-end">
              Actions
            </th>
          </tr>
          </thead>

          <tbody className="divide-border-default divide-y bg-primary">
          {loading ? (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-text-muted">
                Loading partners...
              </td>
            </tr>
          ) : paginatedPartners.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-text-muted">
                <div className="flex flex-col items-center gap-4">
                  <Image width={100} height={100} src={emptyPng} alt="No data" />
                  <span>No applications found.</span>
                </div>
              </td>
            </tr>
          ) : (
            paginatedPartners.map((app) => (
              <tr key={app.id} className="group transition-colors hover:bg-primary">
                <td className="flex items-center gap-2 px-6 py-4 text-text-primary min-w-[250px] max-w-[250px]">

                  <div className="">

                    <Image
                      width="40"
                      height="40"
                      className="h-10 w-10 rounded-full"
                      src={patner}
                      alt="Profile"
                    />

                  </div>


                  {app.partner}
                </td>
                <td className="px-6 py-4 text-text-muted min-w-[150px] max-w-[150px]">{app.type}</td>
                <td className="px-6 py-4 text-text-muted min-w-[200px] max-w-[200px]">{app.contact}</td>
                <td className="px-6 py-4 text-text-muted min-w-[120px] max-w-[120px]">{app.country}</td>
                <td className="px-6 py-4 min-w-[120px] max-w-[120px]"><StatusBadge status={app.status} /></td>
                <td className="px-6 py-4 text-text-muted min-w-[150px] max-w-[150px]">{new Date(app.registeredAt).toLocaleDateString()}</td>

                <td className="min-w-[200px] px-6 py-4">
                  <button
                    aria-label="View Application"
                    className="flex items-center gap-2 rounded-md p-1.5 text-text-muted transition-colors hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-caption">View Application</span>
                  </button>
                </td>

              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModernApplicationsTable;
