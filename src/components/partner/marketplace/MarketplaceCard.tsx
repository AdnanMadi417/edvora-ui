"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Search,
  XCircle,
} from "lucide-react";
import {
  MdPublic,
  MdOutlineTranslate,
  MdOutlineSchool,
  MdBuild,
  MdVisibility,
} from "react-icons/md";

import Loading from "../../loading/Loading";
import NoMessagesFound from "../../emptyData/NoMessagesFound";
import NextButton from "../../ui/buttons/NextButton";
import PrevButton from "../../ui/buttons/PrevButton";
import { useServiceProviders } from "hooks/serviceProviders/useServiceProviders";
import ViewDetailsModal from "../../../components/partner/marketplace/popup/ViewDetailsModal";

const MarketplaceCard = () => {
  const { serviceProviders, loading, error } = useServiceProviders();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
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
      <div className="relative mb-8 overflow-hidden rounded-lg border border-slate-200 bg-card">
        <div className="relative border-b border-slate-200 p-6">
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
              className="bg-background w-full rounded-full border border-slate-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
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
            <div className="grid grid-cols-1 items-stretch gap-6 p-6 md:grid-cols-2 lg:grid-cols-2">
              {currentServiceProviders.map((program) => (
                <div
                  key={program.id}
                  className="relative flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:border-slate-300"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <span className="text-sm font-semibold uppercase text-slate-900">
                              {program.name?.slice(0, 2)}
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
                        <h3 className="md:text-md line-clamp-1 flex items-center gap-1 text-sm font-semibold text-slate-900">
                          {program.name}
                          <span className="text-slate-400">
                              {program.is_active ? (
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </span>
                        </h3>
                        <p className="flex items-center gap-1 text-xs text-slate-500">
                          <MdPublic className="h-3.5 w-3.5" />
                          {program.nationality || "Not Provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 px-5 py-6 text-sm">
                    <div className="flex items-center justify-between rounded-md bg-slate-50 p-4">
                      <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Single Service
                          </span>
                        <p className="text-lg font-bold text-slate-900">
                          From RM {program.price_range.min_price}
                        </p>
                      </div>

                      <div className="h-12 w-[2px] bg-slate-200" />

                      <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Package
                          </span>
                        <p className="text-lg font-bold text-slate-900">
                          From RM {program.price_range.max_price}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-md bg-slate-50 p-3">
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <MdOutlineSchool className="h-5 w-5 text-slate-500" />
                        Universities
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {program.universities_served?.length ? (
                          program.universities_served
                            .slice(0, 3)
                            .map((uni) => (
                              <span
                                key={uni}
                                className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-slate-700"
                              >
                                  {uni}
                                </span>
                            ))
                        ) : (
                          <span className="text-xs text-slate-400">
                              Not provided
                            </span>
                        )}
                        {program.universities_served?.length > 3 && (
                          <button className="text-xs font-medium text-blue-600 hover:underline">
                            +{program.universities_served.length - 3} more
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="rounded-md bg-slate-50 p-3">
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <MdOutlineTranslate className="h-5 w-5 text-slate-500" />
                        Languages
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {program.languages?.length ? (
                          program.languages.slice(0, 3).map((lang) => (
                            <span
                              key={lang}
                              className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-slate-700"
                            >
                                {lang}
                              </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">
                              Not provided
                            </span>
                        )}
                        {program.languages?.length > 3 && (
                          <button className="text-xs font-medium text-blue-600 hover:underline">
                            +{program.languages.length - 3} more
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="rounded-md bg-emerald-50 p-3">
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                        <MdBuild className="h-5 w-5 text-emerald-600" />
                        Services Offered
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {program.services_offered?.length ? (
                          program.services_offered
                            .slice(0, 3)
                            .map((service) => (
                              <span
                                key={service}
                                className="rounded-full border border-emerald-700 bg-white px-3 py-1 text-xs font-medium text-emerald-700"
                              >
                                  {service}
                                </span>
                            ))
                        ) : (
                          <span className="text-xs text-emerald-400">
                              Not provided
                            </span>
                        )}
                        {program.services_offered?.length > 3 && (
                          <button className="text-xs font-medium text-emerald-700 hover:underline">
                            +{program.services_offered.length - 3} more
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-3 border-t border-slate-200 bg-slate-50 p-4">

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProvider(program);
                        setViewModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-full border border-blue-600 bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition-all hover:scale-105 hover:shadow-sm hover:border-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <MdVisibility className="h-5 w-5" />
                      Details
                    </button>

                    <button
                      aria-label="Contact via WhatsApp"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!program?.whatsapp) return;
                        const number = program.whatsapp.replace("+", "");
                        window.open(`https://wa.me/${number}`, "_blank");
                      }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-full border border-green-600 bg-green-100 px-4 py-2 text-sm font-medium text-green-700 transition-all hover:scale-105 hover:shadow-sm hover:border-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Contact
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 items-center gap-4 border-t border-slate-200 p-4 sm:p-6 md:flex md:items-center md:justify-between">
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
