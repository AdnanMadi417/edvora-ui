"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, CheckCircle, Search } from "lucide-react";
import {
  MdPublic,
  MdTranslate,
  MdLocalAirport,
  MdMap,
  MdSchool,
  MdVisibility,
} from "react-icons/md";

import Loading from "../../../loading/Loading";
import NoMessagesFound from "../../../emptyData/NoMessagesFound";
import NextButton from "../../../ui/buttons/NextButton";
import PrevButton from "../../../ui/buttons/PrevButton";
import ViewDetails from "../../../ui/buttons/Button";
import { useServiceProviders } from "../../../../hooks/serviceProviders/useServiceProviders";
import ViewDetailsModal from "../../../admin/logisticalService/popup/ViewDetailsModal";

const LogisticalServiceProviderCard = () => {
  const { serviceProviders, loading, error } = useServiceProviders();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
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
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  useEffect(() => {
    if (serviceProviders.length) {
      const defaults = {};
      serviceProviders.forEach((p) => {
        defaults[p.id] = 1;
      });
    }
  }, [serviceProviders]);

  return (
    <div className="mt-6 overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="relative border-b border-gray-200 p-6">
          <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-text-primary">
                Logistical Service Providers
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Manage, review, and maintain all registered logistics partners
                and services
              </p>
            </div>
          </div>

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
        </div>

        <div className="block">
          {loading && <Loading text="Fetching service providers data..." />}

          {!error && !loading && filteredProviders.length === 0 && (
            <NoMessagesFound
              title="No service providers found"
              subtitle="Try adjusting your search or filters."
            />
          )}

          {!error && filteredProviders.length > 0 && (
            <div className="block">
              <div className="grid grid-cols-1 items-stretch gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
                {currentServiceProviders.map((program) => (
                  <div
                    key={program.id}
                    className="relative flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between border-b bg-slate-50 px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <span className="text-sm font-semibold text-slate-900">
                              {program.name?.[0]}
                            </span>
                          </div>
                          <span
                            className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                              program.is_active
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                          />
                        </div>

                        <div>
                          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
                            {program.name}
                          </h3>
                          <p className="flex items-center gap-1 text-xs text-slate-500">
                            <MdPublic className="h-3.5 w-3.5" />
                            {program.nationality || "Not Provided"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          program.is_active
                            ? "border border-emerald-700 bg-emerald-100 text-emerald-700"
                            : "border border-red-700 bg-red-100 text-red-700"
                        }`}
                      >
                        {program.is_active ? "Verified" : "Unverified"}
                      </span>
                    </div>

                    <div className="space-y-2 px-5 py-4 text-xs">
                      <div className="group relative overflow-hidden rounded-md bg-gradient-to-br from-emerald-500 to-green-600 px-5 py-4 shadow-sm transition-all">
                        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-white/10"></div>
                        <div className="relative flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold uppercase  tracking-wide text-emerald-100">
                              Packages Offered
                            </p>

                            <div className="mt-1 flex items-baseline gap-1">
                              <span className="text-lg font-bold text-white">
                                {program.price_range
                                  ? `RM ${program.price_range.min_price} - ${program.price_range.max_price}`
                                  : "Price not available"}
                              </span>
                            </div>
                          </div>
                          <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm transition-colors group-hover:bg-white/30">
                            <MdLocalAirport className="h-7 w-7 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 font-medium text-slate-500">
                          <MdTranslate className="h-5 w-5" /> Languages
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {program.languages?.length
                            ? program.languages.map((lang) => (
                                <span
                                  key={lang}
                                  className="text-xs font-medium text-slate-900"
                                >
                                  {lang}
                                </span>
                              ))
                            : "Not Provided"}
                        </div>
                      </div>

                      <div className="grid gap-4">
                        <div className="rounded-md bg-blue-50/70 p-3">
                          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-800">
                            <MdSchool className="h-5 w-5" />
                            Universities Served
                          </div>

                          <ul className="ml-5 space-y-1 text-xs text-slate-700">
                            {program.universities_served?.length ? (
                              program.universities_served.map((uni) => (
                                <li key={uni} className="list-disc">
                                  {uni}
                                </li>
                              ))
                            ) : (
                              <li className="list-disc">Not Provided</li>
                            )}
                          </ul>
                        </div>

                        <div className="rounded-md bg-orange-50/70 p-3">
                          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-orange-800">
                            <MdMap className="h-5 w-5" />
                            Service Locations
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {program.service_locations?.length ? (
                              program.service_locations.map((location) => (
                                <span
                                  key={location}
                                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-orange-800 ring-1 ring-orange-100"
                                >
                                  {location}
                                </span>
                              ))
                            ) : (
                              <span className="list-disc px-3 py-1">
                                Not Provided
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex justify-between gap-2 border-t border-gray-200 bg-slate-50 p-4">
                      <ViewDetails
                        icon={<MdVisibility className="h-4 w-4" />}
                        text="Details"
                        bgColor="bg-blue-50"
                        textColor="text-blue-700"
                        borderColor="border-blue-600"
                        hoverTextColor="hover:text-blue-800"
                        hoverBorderColor="hover:border-blue-700"
                        onClick={() => {
                          setSelectedProvider(program);
                          setViewModal(true);
                        }}
                      />

                      <button
                        onClick={() => {
                          if (!program?.whatsapp) return;
                          const number = program.whatsapp.replace("+", "");
                          window.open(`https://wa.me/${number}`, "_blank");
                        }}
                        className="flex items-center justify-center gap-2 rounded-full border border-green-600 bg-green-100 px-4 py-2 text-sm font-medium text-green-700 shadow-md transition hover:scale-105 hover:border-green-700 hover:bg-green-200"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Contact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
    </div>
  );
};

export default LogisticalServiceProviderCard;
