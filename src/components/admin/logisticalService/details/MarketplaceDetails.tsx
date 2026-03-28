"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import {
  MdContentCopy,
  MdKeyboardArrowDown,
  MdLocalAirport,
  MdPublic,
  MdSchool,
  MdTranslate,
} from "react-icons/md";
import { ChevronLeft, Globe, MapPin, Truck } from "lucide-react";

import { useLogisticServiceDetails } from "hooks/service-providers/useLogisticServiceDetails";

import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyData";

interface MarketplaceDetailsProps {
  id: string;
}

const MarketplaceDetails = ({ id }: MarketplaceDetailsProps) => {
  const router = useRouter();
  const handleBack = () => {
    router.push("/admin/logistical-service");
  };

  const { service, loadingService, errorService } =
    useLogisticServiceDetails(id);

  const [openPackage, setOpenPackage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!service || loadingService)
    return <Loading text="Loading service details..." />;

  if (errorService) return <EmptyData />;

  return (
    <>
      <div className="mt-6">
        <div className="rounded-md border border-default bg-card shadow-sm">
          <div className="flex justify-between border-b border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="flex  h-10 w-10 items-center justify-center rounded-full bg-blue-100 md:h-14 md:w-14">
                  <Truck className="h-5 w-5 text-blue-700 md:h-8 md:w-8" />
                </div>

                <span
                  className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white ${
                    service.id ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
              </div>

              <div className="min-w-0">
                <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
                  Logistical Service Providers
                </h3>
                <p className="mt-1 break-words text-sm text-slate-500">
                  Browse and view available service providers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
              <button
                onClick={handleBack}
                className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Back to services</span>
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-white px-6 py-5">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100/20 blur-2xl" />

            <div className="flex flex-col space-y-3 md:flex-row md:items-start md:justify-between md:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {service?.name}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Nationality:{" "}
                  <span className="font-medium">
                    {service?.nationality || "Not provided"}
                  </span>
                </p>
              </div>

              <div className="mt-3 md:mt-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Price Range
                </p>
                <p className="mt-1 text-lg font-bold text-slate-800">
                  {service?.price_range
                    ? `RM ${service.price_range.min_price} - ${service.price_range.max_price}`
                    : "Not available"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-3">

            <div className="flex items-center justify-between rounded-xl border bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>Residence</span>
              </div>
              <span className="truncate rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                {service?.main_location || "Not provided"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Globe className="h-4 w-4 text-slate-400" />
                <span>Nationality</span>
              </div>
              <span className="truncate rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                {service?.nationality || "Not provided"}
              </span>
            </div>

            <div className="rounded-xl border bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MdTranslate className="h-4 w-4 text-slate-500" /> Languages
              </div>
              <div className="flex flex-wrap gap-2">
                {service?.languages?.length ? (
                  service.languages.map((lang) => (
                    <span
                      key={lang}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {lang}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Not provided</span>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="border-y border-slate-200 py-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MdPublic className="h-4 w-4 text-slate-500" /> Service
                Locations
              </div>
              <div className="flex flex-wrap gap-2">
                {service?.service_locations?.length ? (
                  service.service_locations.map((loc) => (
                    <span
                      key={loc}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {loc}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Not provided</span>
                )}
              </div>
            </div>

            <div className="border-b border-slate-200 py-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MdSchool className="h-5 w-5 text-blue-600" /> Universities
                Served
              </div>
              <ul className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
                {service?.universities_served?.length ? (
                  service.universities_served.map((uni) => (
                    <li key={uni} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      {uni}
                    </li>
                  ))
                ) : (
                  <li>Not provided</li>
                )}
              </ul>
            </div>

            <div className="border-b border-slate-200 py-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MdLocalAirport className="h-5 w-5 text-emerald-600" /> Services
                Offered
              </div>
              <div className="flex flex-wrap gap-3">
                {service?.services_offered?.length ? (
                  service.services_offered.map((srv) => (
                    <span
                      key={srv}
                      className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                    >
                      {srv}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Not provided</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5">
            <p className="text-sm font-semibold text-slate-800">Packages</p>

            {service?.packages_offered?.map((pkg) => (
              <div
                key={pkg.name}
                className="rounded-xl border border-slate-200 bg-slate-50 "
              >
                <button
                  onClick={() =>
                    setOpenPackage(openPackage === pkg.name ? null : pkg.name)
                  }
                  className="flex w-full items-center justify-between px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">{pkg.name}</p>
                    <p className="text-xs text-slate-500">RM {pkg.price}</p>
                  </div>

                  <MdKeyboardArrowDown
                    className={`h-5 w-5 transition ${
                      openPackage === pkg.name ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openPackage === pkg.name && (
                  <div className="space-y-2 border-t px-5 py-4 text-sm text-slate-600">
                    <p>{pkg.description}</p>
                    <ul className="space-y-1">
                      {pkg.includes.map((i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {i}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <div className="flex items-center justify-end gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{service?.phone_number}</span>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(service.phone_number);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="rounded p-1 hover:bg-slate-100"
                >
                  <MdContentCopy className="h-4 w-4" />
                </button>

                {copied && (
                  <span className="text-xs text-emerald-600">Copied</span>
                )}
              </div>

              <button
                onClick={() =>
                  window.open(`https://wa.me/${service.whatsapp}`, "_blank")
                }
                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Contact on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarketplaceDetails;
