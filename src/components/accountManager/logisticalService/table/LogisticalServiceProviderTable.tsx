"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Search,
  Phone,
  User,
  Globe,
  Settings,
  Eye,
  Pencil,
  DollarSign,
  BookOpen,
} from "lucide-react";
import { MdAddBusiness } from "react-icons/md";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import Loading from "../../../loading/Loading";
import NoMessagesFound from "../../../emptyData/NoMessagesFound";

import EmptyData from "../../../emptyData/EmptyTableData";
import NextButton from "../../../ui/buttons/NextButton";

import PrevButton from "../../../ui/buttons/PrevButton";

import { useServiceProviders } from "hooks/service-providers/useServiceProviders";

import ViewDetailsModal from "../../../accountManager/logisticalService/popup/ViewDetailsModal";
import EditDetailsModal from "../../../accountManager/logisticalService/popup/EditDetailsModal";

import Link from "next/link";

const LogisticalServiceProviderTable = () => {
  const { serviceProviders, loading, error } = useServiceProviders();

  const [selectedProviders, setSelectedProviders] = useState<
    Record<string, boolean>
  >({});

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<any>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProviders = serviceProviders.filter(
    (provider) =>
      provider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentServiceProviders = filteredProviders.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const [showViewModal, setViewModal] = useState(false);
  const [showEditModal, setEditModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  const handleSelectProvider = (id: string) => {
    setSelectedProviders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedProviders).every(Boolean);
    const newSelection: Record<string, boolean> = {};
    Object.keys(selectedProviders).forEach((id) => {
      newSelection[id] = !allSelected;
    });
    setSelectedProviders(newSelection);
  };

  useEffect(() => {
    if (serviceProviders.length) {
      const defaults = {};
      serviceProviders.forEach((p) => {
        defaults[p.id] = 1;
      });
    }
  }, [serviceProviders]);

  useEffect(() => {
    const initialSelection: Record<string, boolean> = {};
    serviceProviders.forEach((p) => {
      initialSelection[p.id] = false;
    });
    setSelectedProviders(initialSelection);
  }, [serviceProviders]);

  return (
    <div className="mt-6 overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="relative p-6">
          <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Logistical Service Providers
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Manage, review, and maintain all registered logistics partners
                and services
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
              <input
                type="text"
                placeholder="Search logistic partner by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-background w-full rounded-full border border-gray-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
              />
            </div>

            <Link
              className="bg-background-700 flex items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm text-slate-500 outline-0 transition hover:border-blue-700 hover:text-blue-700 sm:w-auto"
              href="/admin/logistical-service/create"
            >
              <MdAddBusiness className="h-4 w-4" />
              Create Service
            </Link>

          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg rounded-b-none border border-b-0 border-slate-200 bg-card">
        <div className="block">
          {loading && <Loading text="Fetching service providers data..." />}

          {!error && !loading && filteredProviders.length === 0 && (
            <NoMessagesFound
              title="No service providers found"
              subtitle="Try adjusting your search or filters."
            />
          )}

          {!error && filteredProviders.length > 0 && (
            <div className="overflow-x-auto rounded-lg rounded-b-none border border-b-0 border-slate-200 bg-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-card">

                    <th className="group min-w-[250px] cursor-pointer px-6 py-4 text-start font-bold tracking-wider text-slate-900 transition-colors">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500" />
                        Provider Name
                      </div>
                    </th>

                    <th className="group min-w-[200px] max-w-[250px] cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-slate-500" />
                        Price Range
                      </div>
                    </th>

                    <th className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-500" />
                        Contact
                      </div>
                    </th>

                    <th className="group min-w-[200px] max-w-[250px] cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-slate-500" />
                        University
                      </div>
                    </th>

                    <th className="group px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                      <div className="flex min-w-[120px] items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-500" />
                        Languages
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
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-border-slate-200 divide-y bg-primary">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-4 text-center text-p1 text-slate-500"
                      >
                        Loading Service Providers...
                      </td>
                    </tr>
                  ) : currentServiceProviders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        <EmptyData />
                      </td>
                    </tr>
                  ) : (
                    currentServiceProviders.map((provider) => (
                      <tr
                        key={provider.id}
                        className="hover:bg-primary/10 group transition-colors"
                      >
                        <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center
                rounded-full bg-accent-light text-h6 font-medium text-blue-700 "
                            >
                              {provider ? (
                                provider.name[0].toUpperCase()
                              ) : (
                                <div className="h-5 w-5 animate-pulse rounded-full bg-gray-300" />
                              )}
                            </div>

                            <div className="w-full overflow-hidden">
                              <div className="truncate text-slate-900">
                                {provider.name}
                              </div>
                              <div className="truncate text-caption text-slate-500">
                                {provider.nationality || "Not provided"} •{" "}
                                {provider.main_location || "Not provided"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="min-w-[200px] max-w-[250px] px-6 py-4">
                          <div className="truncate text-slate-500">
                            {provider.price_range.min_price} –{" "}
                            {provider.price_range.max_price} RM
                          </div>
                        </td>

                        <td className="block min-w-[200px] max-w-[250px] space-y-1 px-4 py-3">
                          <div className="flex items-center text-sm ">
                            {provider?.phone_number}
                          </div>
                        </td>

                        <td
                          className=" min-w-
                        [200px] max-w-[300px] px-6 py-4"
                        >
                          <div className="flex flex-wrap gap-2">
                            {provider.universities_served?.length ? (
                              provider.universities_served
                                .slice(0, 2)
                                .map((uni) => (
                                  <span
                                    key={uni}
                                    className="truncate rounded-full border bg-white px-3 py-1 text-xs font-medium text-slate-700"
                                  >
                                    {uni}
                                  </span>
                                ))
                            ) : (
                              <span className="text-xs text-slate-400">
                                Not provided
                              </span>
                            )}
                            {provider.universities_served?.length > 2 && (
                              <button className="text-xs font-medium text-blue-600 hover:underline">
                                +{provider.universities_served.length - 2} more
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="min-w-[150px] max-w-[200px] px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {provider.languages?.length ? (
                              provider.languages.slice(0, 3).map((lang) => (
                                <span
                                  key={lang}
                                  className="rounded-full text-xs font-medium text-slate-700"
                                >
                                  {lang}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">
                                Not provided
                              </span>
                            )}
                            {provider.languages?.length > 3 && (
                              <button className="text-xs font-medium text-blue-600 hover:underline">
                                +{provider.languages.length - 3} more
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${
                              provider.is_active
                                ? "border-green-600 bg-green-100 text-green-700"
                                : "border-slate-300 bg-slate-100 text-slate-500"
                            }`}
                          >
                            {provider.is_active ? (
                              <FaCheckCircle className="text-[10px]" />
                            ) : (
                              <FaTimesCircle className="text-[10px]" />
                            )}
                            {provider.is_active ? "Active" : "Inactive"}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              role="menuitem"
                              aria-label="View Provider"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProvider(provider);
                                setViewModal(true);
                              }}
                              className="flex items-center justify-center rounded-full p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                            >
                              <Eye className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                            </button>

                            <div className="h-6 border-l border-slate-200" />

                            <button
                              role="menuitem"
                              aria-label="Edit Provider"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedManager(provider);
                                setEditModal(true);
                                setOpenDropdownId(null);
                              }}
                              className="flex items-center justify-center rounded-full p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                            >
                              <Pencil className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="grid grid-cols-1 items-center gap-4 border-t border-gray-200 p-4 sm:p-6 md:flex md:items-center md:justify-between">
            {filteredProviders.length > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
                Showing
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>
                to
                <span className="font-medium">
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredProviders.length
                  )}
                </span>
                of
                <span className="font-medium">{filteredProviders.length}</span>
                Service Providers
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <PrevButton
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                text="Prev"
                icon={<ArrowLeft className="h-4 w-4" />}
              />

              <span className="px-3 py-1 font-medium text-slate-500">
                Page {currentPage} of{" "}
                {Math.ceil(filteredProviders.length / itemsPerPage)}
              </span>

              <NextButton
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(filteredProviders.length / itemsPerPage)
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredProviders.length / itemsPerPage)
                }
                text="Next"
                icon={<ArrowRight className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>
      </div>

      <ViewDetailsModal
        isOpen={showViewModal}
        onClose={() => setViewModal(false)}
        provider={selectedProvider}
      />

      <EditDetailsModal
        isOpen={showEditModal}
        onClose={() => setEditModal(false)}
        provider={selectedProvider}
      />

    </div>
  );
};

export default LogisticalServiceProviderTable;
