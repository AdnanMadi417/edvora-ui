"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, CheckCircle, Search } from "lucide-react";
import {
  MdPublic,
  MdLocalAirport,
  MdMap,
  MdSchool,
  MdVisibility,
} from "react-icons/md";

import Loading from "../../loading/Loading";
import NoMessagesFound from "../../emptyData/NoMessagesFound";
import NextButton from "../../ui/buttons/NextButton";
import PrevButton from "../../ui/buttons/PrevButton";
import ViewDetails from "../../ui/buttons/Button";
import { useServiceProviders } from "hooks/serviceProviders/useServiceProviders";
import ViewDetailsModal from "../../../components/partner/marketplace/popup/ViewDetailsModal";

const MarketplaceCard = () => {
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
              <h3 className="text-xl font-semibold text-slate-900">
                Partner Marketplace
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Browse and connect with verified logistics partners and service
                providers
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

                    <div className="space-y-4 px-5 py-4 text-xs">
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Pricing
                          </p>

                          <p className="mt-1 text-base font-semibold text-slate-900">
                            {program.price_range ? (
                              <>
                                RM {program.price_range.min_price}
                                <span className="mx-1 text-slate-400">–</span>
                                {program.price_range.max_price}
                              </>
                            ) : (
                              <span className="text-slate-400">
                                Not available
                              </span>
                            )}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Single services & packages
                          </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                          <MdLocalAirport
                            aria-hidden
                            className="h-5 w-5 text-emerald-600"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <MdSchool
                          aria-hidden
                          className="mt-0.5 h-5 w-5 text-blue-500"
                        />

                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            Universities Served
                          </p>

                          <ul className="ml-4 mt-1 space-y-1 text-xs text-slate-600">
                            {program.universities_served?.length ? (
                              program.universities_served.map((uni) => (
                                <li key={uni} className="list-disc break-words">
                                  {uni}
                                </li>
                              ))
                            ) : (
                              <li className="text-slate-400">Not provided</li>
                            )}
                          </ul>
                        </div>
                      </div>

                      <div className="h-px bg-slate-100" />

                      <div className="flex gap-3">
                        <MdMap
                          aria-hidden
                          className="mt-0.5 h-5 w-5 text-orange-500"
                        />

                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            Service Locations
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {program.service_locations?.length ? (
                              program.service_locations.map((location) => (
                                <span
                                  key={location}
                                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                                >
                                  {location}
                                </span>
                              ))
                            ) : (
                              <ul className="ml-4 mt-1 space-y-1 text-xs text-slate-600">
                                <li className="text-slate-400">
                                  Not provided
                                </li>
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-slate-100" />

                      <div className="flex gap-3">
                        <MdLocalAirport
                          aria-hidden
                          className="mt-0.5 h-5 w-5 text-emerald-600"
                        />

                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            Services Offered
                          </p>

                          <ul className="ml-4 mt-2 space-y-1.5 text-xs text-slate-600">
                            {program.services_offered?.length ? (
                              program.services_offered.map((service) => (
                                <li
                                  key={service}
                                  className="list-disc break-words"
                                >
                                  {service}
                                </li>
                              ))
                            ) : (
                              <li className="text-slate-400">Not provided</li>
                            )}
                          </ul>
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

export default MarketplaceCard;
