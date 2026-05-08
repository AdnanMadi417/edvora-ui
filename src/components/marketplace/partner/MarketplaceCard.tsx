"use client";

import React, { useState } from "react";
import PresignedImage from "components/ui/PresignedImage";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Search,
} from 'lucide-react';
import {
  MdOutlineTranslate,
  MdWhatsapp,
  MdLocationOn,
  MdLocalShipping,
} from 'react-icons/md';

import { useServiceProviders } from "hooks/service-providers/useServiceProviders";
import Loading from "components/loading/Loading";
import NoMessagesFound from "components/emptyData/NoMessagesFound";
import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";

const MarketplaceCard = () => {
  const { serviceProviders, loading, error } = useServiceProviders();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
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

  return (
    <div className="mt-6 overflow-hidden text-p2 max-w-5xl mx-auto">
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
                className="bg-background w-full rounded-md border border-slate-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
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
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Header */}
                  <div className="flex items-center gap-4 px-5 py-5">
                    <div className="relative flex-shrink-0">
                      <PresignedImage
                        fileKey={m.picture_file_key}
                        alt={m.name}
                        className="h-14 w-14 rounded-full object-cover"
                        fallback={
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                            <span className="text-base font-semibold uppercase text-blue-700">
                              {m.name?.slice(0, 2)}
                            </span>
                          </div>
                        }
                      />
                      <span
                        className={`absolute bottom-0 left-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                          m.is_active ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                    </div>

                    <div className="min-w-0 overflow-hidden">
                      <h3 className="flex min-w-0 items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-slate-900">
                        <span className="truncate">{m.name}</span>
                        <CheckCircle className="h-4 w-4 flex-shrink-0 fill-blue-500 text-white" />
                      </h3>
                      <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-slate-500">
                        <MdLocationOn className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{m.main_location || "Not Provided"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mx-5 border-t border-slate-100" />

                  {/* Pricing */}
                  <div className="flex flex-col gap-2 px-5 py-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Single Service
                      </span>
                      <p className="text-sm font-bold text-slate-900">
                        {m.services_price_range
                          ? `From RM ${m.services_price_range.min_price}`
                          : "-"}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Package
                      </span>
                      <p className="text-sm font-bold text-slate-900">
                        {m.packages_price_range
                          ? `From RM ${m.packages_price_range.min_price}`
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 px-5 pb-4 text-xs text-slate-600">
                    <p className="flex min-w-0 items-center gap-1.5">
                      <MdOutlineTranslate className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">
                        {m.languages?.slice(0, 3).join(" • ") || "Language not provided"}
                      </span>
                    </p>
                    <p className="flex min-w-0 items-center gap-1.5">
                      <MdLocationOn className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">
                        {m.service_locations?.slice(0, 2).join(" • ") || "Location not provided"}
                      </span>
                    </p>
                  </div>

                  {/* Services */}
                  <div className="px-5 pb-5">
                    <p className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                      <MdLocalShipping className="h-4 w-4" />
                      Services
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {m.services_offered?.slice(0, 1).map((service) => (
                        <span
                          key={service.id}
                          className="max-w-[160px] truncate rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {service.name}
                        </span>
                      ))}
                      {m.services_offered?.length > 1 && (
                        <span className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                          +{m.services_offered.length - 1} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* WhatsApp Button */}
                  <div className="mt-auto border-t border-slate-100 px-4 pb-4 pt-4">
                    <button
                      aria-label="Contact via WhatsApp"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!m?.whatsapp) return;
                        const number = m.whatsapp.replace("+", "");
                        window.open(`https://wa.me/${number}`, "_blank");
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <MdWhatsapp className="h-5 w-5" />
                      Contact on WhatsApp
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
                  {Math.min(currentPage * itemsPerPage, filteredProviders.length)}
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
                  currentPage === Math.ceil(filteredProviders.length / itemsPerPage)
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
