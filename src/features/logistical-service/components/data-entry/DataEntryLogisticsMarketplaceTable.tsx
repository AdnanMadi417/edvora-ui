"use client";

import React, { useEffect, useRef, useState } from "react";
import PresignedImage from "components/ub/data/media/PresignedImage";
import {
  CheckCircle,
  XCircle,
  Phone,
  User,
  Settings,
  ChevronRight,
  Pencil,
  BookOpen,
  RefreshCw,
  Truck,
} from 'lucide-react';
import { MdAddBusiness } from "react-icons/md";
import { AnimatePresence } from "framer-motion";

import TableWrapper from "components/ub/data/tables/TableWrapper";
import TableSkeletonRows from "components/ub/data/tables/TableSkeletonRows";
import TableEmptyRow from "components/ub/data/tables/TableEmptyRow";
import TableErrorRow from "components/ub/data/tables/TableErrorRow";
import TablePagination from "components/ub/data/tables/TablePagination";
import AnimatedTableRow from "components/ub/data/tables/AnimatedTableRow";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import SearchInput from "components/ub/forms/selection/SearchInput";
import { useRouter } from "next/navigation";

import { useLogisticProviders } from "features/logistical-service/hooks";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";

const DataEntryLogisticsMarketplaceTable = () => {
  const router = useRouter();
  const { serviceProviders, loading, error, refetch } = useLogisticProviders();

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const loadingStartedRef = useRef(false);
  useEffect(() => {
    if (loading) {
      loadingStartedRef.current = true;
    } else if (loadingStartedRef.current) {
      setHasLoadedOnce(true);
    }
  }, [loading]);

  const isInitialLoad = !hasLoadedOnce;
  const isRefetching = loading && hasLoadedOnce;

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

  return (
    <div className="mt-6 overflow-hidden text-p2 rounded-lg border border-slate-200 bg-white">
      
      <div className="relative overflow-hidden border-b border-slate-200">
        <div className="relative p-6">
          <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mt-1 text-sm text-slate-500">
                Manage, review, and maintain all registered logistics marketplace listings and services
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">
            <SearchInput
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search marketplace listings by name..."
              className="sm:w-64 sm:flex-none"
            />

            {isRefetching && (
              <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-slate-400" aria-label="Updating results" />
            )}

            <Button
              icon={<MdAddBusiness className="h-4 w-4" />}
              text="Create Service"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
              onClick={() => router.push("/data-entry/logistics-marketplace/create")}
              className="whitespace-nowrap"
            />
          </div>
        </div>
      </div>

      <div className="p-6">

        <TableWrapper
        footer={
          <TablePagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            itemCount={currentServiceProviders.length}
            totalCount={filteredProviders.length}
            itemLabel="results"
            loading={loading}
          />
        }
      >
            <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <th className="group min-w-[250px] cursor-pointer px-6 py-4 text-start font-bold tracking-wider text-slate-900 transition-colors">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500" />
                        Provider Name
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

                <tbody className={`divide-y divide-slate-200 bg-white ${isRefetching ? "opacity-60 transition-opacity" : ""}`}>
                  {isInitialLoad && <TableSkeletonRows columns={8} rows={itemsPerPage} />}

                  {!isInitialLoad && error && (
                    <TableErrorRow colSpan={8} message={error} onRetry={refetch} />
                  )}

                  {!isInitialLoad && !error && currentServiceProviders.length === 0 && (
                    <TableEmptyRow
                      colSpan={8}
                      title="No service providers found"
                      subtitle={searchTerm ? "Try adjusting your search." : "No service providers have been added yet."}
                      icon={<Truck className="h-8 w-8 text-slate-400" />}
                      action={
                        searchTerm ? (
                          <Button
                            onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                            icon={<RefreshCw className="h-3.5 w-3.5" />}
                            text="Clear search"
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
                  {!isInitialLoad && !error &&
                    currentServiceProviders.map((provider) => (
                      <AnimatedTableRow
                        key={provider.id}
                        className="group cursor-pointer transition-colors hover:bg-slate-50"
                        onClick={() => router.push(`/data-entry/logistics-marketplace/${provider.id}/edit`)}
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
                        <td className="px-6 py-4">
                          {provider.is_active ? (
                            <StatusBadge variant="success" icon={<CheckCircle className="h-3 w-3" />}>Active</StatusBadge>
                          ) : (
                            <StatusBadge variant="neutral" icon={<XCircle className="h-3 w-3" />}>Inactive</StatusBadge>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <IconButton
                            aria-label="Edit Provider"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/data-entry/logistics-marketplace/${provider.id}/edit`);
                            }}
                            icon={<Pencil className="h-4 w-4 text-slate-500 hover:text-slate-700" />}
                            bgColor="bg-transparent"
                            textColor="text-slate-700"
                            borderColor="border-transparent"
                            hoverTextColor="hover:text-slate-700"
                            hoverBorderColor="hover:border-transparent"
                            className="hover:bg-slate-100 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                        </td>
                      </AnimatedTableRow>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
          </TableWrapper>

      </div>
    
    </div>
  );
};

export default DataEntryLogisticsMarketplaceTable;
