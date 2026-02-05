"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  BadgeCheck,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  MdPublic,
  MdTranslate,
  MdLocalAirport,
  MdKeyboardArrowDown,
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
  const currentServiceProviders = serviceProviders.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const [activeTab, setActiveTab] = useState<Record<string, number>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [openPackage, setOpenPackage] = useState<string | null>(null);

  const [showViewModal, setViewModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  useEffect(() => {
    if (serviceProviders.length) {
      const defaults = {};
      serviceProviders.forEach((p) => {
        defaults[p.id] = 1;
      });
      setActiveTab(defaults);
    }
  }, [serviceProviders]);

  return (
    <div className="mt-6 overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="relative border-b border-gray-200 p-6">
          <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-text-primary">
                Partner Marketplace
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                Browse and connect with verified logistics partners and service
                providers
              </p>
            </div>
          </div>
        </div>

        <div className="block">
          {loading && <Loading text="Fetching service providers data..." />}

          {!error && !loading && serviceProviders.length === 0 && (
            <NoMessagesFound
              title="No service providers found"
              subtitle="Try adjusting your search or filters."
            />
          )}

          {!error && serviceProviders.length > 0 && (
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

                    <div className="px-5 py-3">
                      <div className="relative flex w-full rounded-full bg-gray-100 p-1 shadow-sm">
                        {[1, 2].map((tab) => (
                          <div
                            key={tab}
                            className={`flex-1 cursor-pointer rounded-full py-2 text-center text-sm font-medium transition-all duration-200 ${
                              (activeTab[program.id] ?? 1) === tab
                                ? "bg-white text-gray-900 shadow-md"
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                            onClick={() =>
                              setActiveTab((prev) => ({
                                ...prev,
                                [program.id]: tab,
                              }))
                            }
                          >
                            {tab === 1 ? "Overview" : "Packages"}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 px-5 pb-4 text-xs">
                      {(activeTab[program.id] ?? 1) === 1 && (
                        <>
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

                            {/*<div className="rounded-md bg-white p-3 shadow-sm ring-1 ring-green-100">*/}
                            {/*  <div className="flex items-center gap-2 text-sm font-semibold text-green-700">*/}
                            {/*    <MdLocalAirport className="h-5 w-5 text-green-600" />*/}
                            {/*    Services Offered*/}
                            {/*  </div>*/}

                            {/*  <ul className="ml-4 mt-2 space-y-2 text-xs text-slate-600">*/}
                            {/*    {program.services_offered?.length*/}
                            {/*      ? program.services_offered.map((service) => (*/}
                            {/*          <li*/}
                            {/*            key={service}*/}
                            {/*            className="list-disc"*/}
                            {/*          >*/}
                            {/*            {service}*/}
                            {/*          </li>*/}
                            {/*        ))*/}
                            {/*      : "Not Provided"}*/}
                            {/*  </ul>*/}
                            {/*</div>*/}
                          </div>
                        </>
                      )}

                      {(activeTab[program.id] ?? 2) === 2 && (
                        <>
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

                          {program.packages_offered?.map((pkg) => (
                            <div
                              key={pkg.name}
                              className="cursor-pointer rounded-md border border-gray-200 shadow-sm transition-all"
                            >
                              <div
                                className="flex items-center justify-between rounded-md px-5 py-4"
                                onClick={() =>
                                  setOpenPackage(
                                    openPackage === pkg.name ? null : pkg.name
                                  )
                                }
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {pkg.name}
                                  </span>
                                  <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                    RM {pkg.price}
                                  </span>
                                </div>

                                <MdKeyboardArrowDown
                                  className={`h-6 w-6 text-gray-500 transition-transform ${
                                    openPackage === pkg.name ? "rotate-180" : ""
                                  }`}
                                />
                              </div>

                              <div
                                className={`transition-all duration-300 ${
                                  openPackage === pkg.name
                                    ? "max-h-96 opacity-100"
                                    : "max-h-0 opacity-0"
                                } overflow-hidden`}
                              >
                                <div className="border-t border-gray-100 px-6 pb-6 pt-4">
                                  <h4 className="mb-3 text-sm font-semibold text-gray-900">
                                    Package Details
                                  </h4>

                                  <p className="text-sm text-gray-600">
                                    {pkg.description}
                                  </p>

                                  <ul className="mt-4 space-y-2">
                                    {pkg.includes.map((item) => (
                                      <li
                                        key={item}
                                        className="flex items-center text-sm text-gray-600"
                                      >
                                        <span className="mr-3 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
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

              <div className="grid grid-cols-1 items-center gap-4 border-t border-gray-200 p-4 sm:p-6 md:flex md:items-center md:justify-between">
                {serviceProviders.length > 0 && (
                  <div className="flex items-center gap-1 text-sm font-medium text-text-muted">
                    Showing
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>
                    to
                    <span className="font-medium">
                      {Math.min(
                        currentPage * itemsPerPage,
                        serviceProviders.length
                      )}
                    </span>
                    of
                    <span className="font-medium">
                      {serviceProviders.length}
                    </span>
                    Service Providers
                  </div>
                )}

                <div className="flex items-center justify-end gap-2">
                  <PrevButton
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    text="Prev"
                    icon={<ArrowLeft className="h-4 w-4" />}
                  />

                  <span className="px-3 py-1 font-medium text-text-muted">
                    Page {currentPage} of{" "}
                    {Math.ceil(serviceProviders.length / itemsPerPage)}
                  </span>

                  <NextButton
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(serviceProviders.length / itemsPerPage)
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(serviceProviders.length / itemsPerPage)
                    }
                    text="Next"
                    icon={<ArrowRight className="h-4 w-4" />}
                  />
                </div>
              </div>
            </div>
          )}
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
