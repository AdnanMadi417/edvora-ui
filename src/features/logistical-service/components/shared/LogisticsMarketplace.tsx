"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import PresignedImage from "components/ub/data/PresignedImage";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Search,
  Lock,
  Truck,
} from 'lucide-react';
import {
  MdOutlineTranslate,
  MdWhatsapp,
  MdLocationOn,
  MdLocalShipping,
} from 'react-icons/md';

import { useLogisticProviders } from "features/logistical-service/hooks";
import Loading from "components/ub/feedback/Loading";
import NoMessagesFound from "components/ub/feedback/NoMessagesFound";
import NextButton from "components/ub/core/NextButton";
import PrevButton from "components/ub/core/PrevButton";

const ITEMS_PER_PAGE = 9;

interface LogisticsMarketplaceProps {
  locked?: boolean;
  visaProcessingCount?: number;
  basePath?: string;
}

const LogisticsMarketplace = ({ locked = false, visaProcessingCount = 0, basePath = "/partner" }: LogisticsMarketplaceProps) => {
  const { serviceProviders, loading, error } = useLogisticProviders();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProviders = useMemo(
    () =>
      serviceProviders.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [serviceProviders, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredProviders.length / ITEMS_PER_PAGE));

  const currentServiceProviders = useMemo(
    () => filteredProviders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredProviders, currentPage]
  );

  return (
    <div className="mt-6 overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="relative border-b border-slate-200 p-6">
          <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Logistics Marketplace
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {!loading && serviceProviders.length > 0 ? (
                  locked
                    ? <><span className="font-medium text-slate-700">{serviceProviders.length}</span> listings available · <span className="font-medium text-amber-600">Requires Visa Processing stage or later</span></>
                    : <><span className="font-medium text-slate-700">{serviceProviders.length}</span> listings available</>

                ) : (
                  "Browse and connect with verified logistics marketplace listings and service providers"
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:gap-4 w-full">
            <div className="relative w-full sm:w-64 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
              <input
                type="text"
                placeholder="Search marketplace listings by name..."
                value={searchTerm}
                disabled={locked}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="bg-background w-full rounded-md border border-slate-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {loading && <Loading text="Fetching service providers data..." />}

        {!error && !loading && filteredProviders.length === 0 && (
          <NoMessagesFound
            title="No service providers found"
            subtitle="Try adjusting your search or filters."
            icon={<Truck className="h-8 w-8 text-slate-400" />}
          />
        )}

        {locked && (
          <div className="mx-6 mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1 w-full bg-blue-500" />
            <div className="p-5">

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <Lock className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">Unlock Logistics Marketplace</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    The Logistics Marketplace becomes available once you have at least 1 student at{" "}
                    <span className="font-semibold text-slate-700">Visa Processing or a later stage</span>.
                    This ensures logistics support is used at the right stage — when students are
                    preparing for arrival, accommodation, airport pickup, and local assistance.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Requirement</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">1 student</p>
                  <p className="text-xs text-slate-500">at Visa Processing or later</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Current Status</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${visaProcessingCount > 0 ? "bg-emerald-500" : "bg-red-400"}`} />
                    <p className={`text-sm font-bold ${visaProcessingCount > 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {visaProcessingCount} student{visaProcessingCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">at Visa Processing or later</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-[11px] text-slate-400">
                  Once unlocked, this feature will remain available permanently.
                </p>
                <Link
                  href="/partner/applications"
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  View My Applications <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

            </div>
          </div>
        )}

        {!error && filteredProviders.length > 0 && (
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
            {currentServiceProviders.map((m) => (
              <div key={m.id} className="relative">
                {locked && (
                  <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-slate-900/75 px-2.5 py-1 backdrop-blur-sm">
                    <Lock className="h-3 w-3 text-white" />
                    <span className="text-[10px] font-semibold text-white">Stage Required</span>
                  </div>
                )}
                <a
                  href={locked ? undefined : `${basePath}/logistics-marketplace/${m.id}`}
                  className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md ${locked ? "cursor-default" : ""}`}
                >
                  <div className={`flex items-center gap-4 px-5 py-5 ${locked ? "blur-sm select-none pointer-events-none" : ""}`}>
                    <div className="relative flex-shrink-0">
                      <PresignedImage
                        fileKey={locked ? undefined : m.picture_file_key}
                        alt={locked ? "Locked service provider" : m.name}
                        className="h-14 w-14 rounded-full object-cover"
                        fallback={
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                            <span className="text-base font-semibold uppercase text-blue-700">
                              {locked ? "••" : m.name?.slice(0, 2)}
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
                        <span className="truncate">{locked ? "Locked Provider" : m.name}</span>
                        <CheckCircle className="h-4 w-4 flex-shrink-0 fill-blue-500 text-white" />
                      </h3>
                      <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-slate-500">
                        <MdLocationOn className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{locked ? "Location hidden" : (m.main_location || "Not Provided")}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mx-5 border-t border-slate-100" />

                  <div className="flex flex-col gap-2 px-5 py-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Single Service
                      </span>
                      <p className="text-sm font-bold text-slate-900">
                        {m.services_price_range ? `From RM ${m.services_price_range.min_price}` : "-"}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Package
                      </span>
                      <p className="text-sm font-bold text-slate-900">
                        {m.packages_price_range ? `From RM ${m.packages_price_range.min_price}` : "-"}
                      </p>
                    </div>
                  </div>

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

                  <div className="mt-auto border-t border-slate-100 px-4 pb-4 pt-4">
                    {locked ? (
                      <div className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-400">
                        <Lock className="h-4 w-4" />
                        Contact Locked
                      </div>
                    ) : (
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
                    )}
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 items-center gap-3 border-t border-slate-200 p-4 sm:p-6 md:flex md:items-center md:justify-between">
          {filteredProviders.length > 0 && (
            <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
              Showing
              <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
              to
              <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProviders.length)}</span>
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
              Page {currentPage} of {totalPages}
            </span>
            <NextButton
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              text="Next"
              icon={<ArrowRight className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsMarketplace;
