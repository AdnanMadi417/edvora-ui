"use client";

import React, { useState, useEffect } from "react";
import PresignedImage from "components/ui/PresignedImage";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Search,
  Phone,
  User,
  Globe,
  Settings,
  ChevronRight,
  Pencil,
  DollarSign,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { MdAddBusiness } from "react-icons/md";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import Loading from "components/loading/Loading";
import NoMessagesFound from "components/emptyData/NoMessagesFound";
import EmptyData from "components/emptyData/EmptyTableData";
import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";
import { useToast } from 'components/context/ToastContext';
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useLogisticProviders, useDeleteLogisticProvider } from "features/logistical-service/hooks";
import DeleteServiceConfirmation from "../DeleteServiceConfirmation";

const LogisticalServiceTable = () => {
  const router = useRouter();
  const { serviceProviders, loading, error } = useLogisticProviders();
  const { showToast } = useToast();

  const [selectedProviders, setSelectedProviders] = useState<Record<string, boolean>>({});
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedServiceName, setSelectedServiceName] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const { deleteProvider, isDeleting } = useDeleteLogisticProvider();

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
  const currentServiceProviders = filteredProviders.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (serviceProviders.length) {
      const defaults: Record<string, boolean> = {};
      serviceProviders.forEach((p) => { defaults[p.id] = false; });
      setSelectedProviders(defaults);
    }
  }, [serviceProviders]);

  const handleDelete = async () => {
    if (!selectedServiceId) return;
    try {
      await deleteProvider(selectedServiceId);
      showToast("Service deleted successfully.", "success");
      setIsDeleteOpen(false);
      setSelectedServiceId(null);
      setSelectedServiceName("");
      setTimeout(() => location.reload(), 2000);
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Please try again.";
      showToast(`Failed to delete service. ${backendMessage}`, "error");
    }
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="relative p-6">
          <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Logistical Service Providers
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Manage, review, and maintain all registered logistics partners and services
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
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="bg-background w-full rounded-md border border-gray-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
              />
            </div>

            <Link
              className="bg-background-700 flex items-center justify-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm text-slate-500 outline-0 transition hover:border-blue-700 hover:text-blue-700 sm:w-auto"
              href="/admin/logistical-service/create"
            >
              <MdAddBusiness className="h-4 w-4" />
              Create Service
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg rounded-b-none border border-b-0 border-slate-200 bg-white">
          {loading && <Loading text="Fetching service providers data..." />}

          {!error && !loading && filteredProviders.length === 0 && (
            <NoMessagesFound
              title="No service providers found"
              subtitle="Try adjusting your search or filters."
            />
          )}

          {!error && filteredProviders.length > 0 && (
            <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
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

                <tbody className="divide-y divide-slate-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-p1 text-slate-500">
                        Loading Service Providers...
                      </td>
                    </tr>
                  ) : currentServiceProviders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                        <EmptyData />
                      </td>
                    </tr>
                  ) : (
                    currentServiceProviders.map((provider) => (
                      <tr
                        key={provider.id}
                        className="group cursor-pointer transition-colors bg-white hover:bg-slate-50"
                        onClick={() => router.push(`/admin/logistical-service/${provider.id}`)}
                      >
                        <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                          <div className="flex items-center gap-3">
                            {provider.picture_file_key ? (
                              <PresignedImage
                                fileKey={provider.picture_file_key}
                                alt={provider.name}
                                className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-blue-500 ring-offset-2 shadow-md"
                                fallback={
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                    {provider.name[0].toUpperCase()}
                                  </div>
                                }
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                {provider.name[0].toUpperCase()}
                              </div>
                            )}
                            <div className="w-full overflow-hidden">
                              <div className="truncate text-slate-900">{provider.name}</div>
                              <div className="truncate text-caption text-slate-500">
                                {provider.nationality || "Not provided"} •{" "}
                                {provider.main_location || "Not provided"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="min-w-[200px] max-w-[250px] px-6 py-4">
                          <div className="truncate text-slate-500">
                            {provider.price_range
                              ? `RM ${provider.price_range.min_price ?? "NA"} – ${provider.price_range.max_price ?? "NA"}`
                              : "Not provided"}
                          </div>
                        </td>

                        <td className="block min-w-[200px] max-w-[250px] space-y-1 px-4 py-3">
                          <div className="truncate text-sm">{provider?.phone_number}</div>
                        </td>

                        <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {provider.universities_served?.length ? (
                              provider.universities_served.slice(0, 1).map((uni) => (
                                <span key={uni} className="truncate rounded-md border bg-white px-3 py-1 text-xs font-medium text-slate-700">
                                  {uni}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">Not provided</span>
                            )}
                            {provider.universities_served?.length > 1 && (
                              <button className="text-xs font-medium text-blue-600 hover:underline">
                                +{provider.universities_served.length - 1} more
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="min-w-[150px] max-w-[200px] px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {provider.languages?.length ? (
                              provider.languages.slice(0, 2).map((lang) => (
                                <span key={lang} className="rounded-md text-xs font-medium text-slate-700">
                                  {lang}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">Not provided</span>
                            )}
                            {provider.languages?.length > 2 && (
                              <button className="text-xs font-medium text-blue-600 hover:underline">
                                +{provider.languages.length - 2} more
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-3 py-1 text-xs font-semibold ${
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
                            <a
                              role="menuitem"
                              aria-label="Edit Provider"
                              href={`/admin/logistical-service/${provider.id}/edit`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center justify-center rounded-md p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                            >
                              <Pencil className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                            </a>

                            <div className="h-6 border-l border-slate-200" />

                            <button
                              role="menuitem"
                              aria-label="Delete Provider"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedServiceId(provider.id);
                                setSelectedServiceName(provider.name);
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
                    ))
                  )}
                </tbody>
              </table>
          )}

      </div>

      <div className="rounded-b-lg border border-gray-200 bg-white px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-2 text-sm text-slate-500 md:flex-row">
          <div>
            {filteredProviders.length === 0 ? (
              <span>No results found</span>
            ) : (
              <>
                Showing{" "}
                <span className="font-medium text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span>
                {" "}to{" "}
                <span className="font-medium text-slate-700">{Math.min(currentPage * itemsPerPage, filteredProviders.length)}</span>
                {" "}of{" "}
                <span className="font-medium text-slate-700">{filteredProviders.length}</span>
                {" "}results
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <PrevButton
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              text="Prev"
              icon={<ArrowLeft className="h-4 w-4" />}
            />
            <span className="px-2 text-slate-500">
              Page {currentPage} of {Math.max(Math.ceil(filteredProviders.length / itemsPerPage), 1)}
            </span>
            <NextButton
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredProviders.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(filteredProviders.length / itemsPerPage) || filteredProviders.length === 0}
              text="Next"
              icon={<ArrowRight className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      <DeleteServiceConfirmation
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        serviceName={selectedServiceName}
      />
    </div>
  );
};

export default LogisticalServiceTable;
