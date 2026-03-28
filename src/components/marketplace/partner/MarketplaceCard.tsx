"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Search,
  XCircle,
} from 'lucide-react';
import {
  MdPublic,
  MdOutlineTranslate,
  MdOutlineSchool,
  MdBuild,
  MdVisibility,
  MdWhatsapp,
  MdLocationOn,
} from 'react-icons/md';

import { useServiceProviders } from "hooks/service-providers/useServiceProviders";
import Loading from "components/loading/Loading";
import NoMessagesFound from "components/emptyData/NoMessagesFound";
import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";

const MarketplaceCard = () => {
  const { serviceProviders, loading, error } = useServiceProviders();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
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

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:gap-4 w-full">

            <div className="relative w-full sm:w-64 flex-shrink-0">
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
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
              {currentServiceProviders.map((m) => (
                <a
                  href={`/partner/marketplace/${m.id}`}
                  key={m.id}
                  className="flex flex-col overflow-hidden contract-trigger rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between border-b bg-slate-50 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-semibold uppercase text-blue-700">
                            {m.name?.slice(0, 2)}
                          </span>
                        </div>

                        <span
                          className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                            m.is_active ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                      </div>

                      <div>
                        <h3 className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                          {m.name}

                          {m.is_active ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </h3>

                        <p className="flex items-center gap-1 text-xs text-slate-500">
                          <MdPublic className="h-3.5 w-3.5" />
                          {m.main_location || "Not Provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 px-5 py-4 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold uppercase text-slate-500">
                          Single Service
                        </span>
                        <p className="text-sm font-bold text-slate-900">
                          From RM
                          {m.price_range
                            ? `RM ${m.price_range.min_price}`
                            : "-"}
                        </p>
                      </div>

                      <div className="h-10 w-[1px] bg-slate-200" />

                      <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold uppercase text-slate-500">
                          Package
                        </span>
                        <p className="text-sm font-bold text-slate-900">
                          From RM
                          {m.price_range
                            ? `RM ${m.price_range.max_price}`
                            : " - "}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-600">
                      <p className="flex items-center gap-1">
                        <MdOutlineTranslate className="h-4 w-4 text-slate-500" />
                        {m.languages?.slice(0, 3).join(" • ") ||
                          "Language not provided"}
                      </p>

                      <p className="flex items-center gap-1">
                        <MdLocationOn className="h-4 w-4 text-slate-500" />
                        {m.service_locations?.slice(0, 2).join(" • ") ||
                          "Location not provided"}
                      </p>

                      <p className="flex items-center gap-1">
                        <MdOutlineSchool className="h-4 w-4 text-slate-500" />
                        {m.universities_served?.slice(0, 2).join(" • ") ||
                          "universities not provided"}
                      </p>
                    </div>

                    <div className="">
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
                        <MdBuild className="h-4 w-4 text-blue-600" />
                        Services Offered
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {m.services_offered?.slice(0, 3).map((service) => (
                          <span
                            key={service}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                          >
                        {service}
                      </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-3 border-t bg-slate-50 p-4">

                    <a
                      href={`/partner/marketplace/${m.id}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full border border-blue-600 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                    >
                      <MdVisibility className="h-5 w-5" />
                      Details
                    </a>

                    <button
                      aria-label="Contact via WhatsApp"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!m?.whatsapp) return;
                        const number = m.whatsapp.replace("+", "");
                        window.open(`https://wa.me/${number}`, "_blank");
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full border border-green-600 bg-green-100 px-4 py-2 text-sm font-medium text-green-700 transition-all hover:scale-105 hover:border-green-700 hover:bg-green-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      <MdWhatsapp className="h-5 w-5" />
                      Contact
                    </button>

                  </div>
                </a>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 items-center gap-3 border-t border-slate-200 p-4 sm:p-6 md:flex md:items-center md:justify-between">
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

    </div>
  );
};

export default MarketplaceCard;
