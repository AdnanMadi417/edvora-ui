"use client";

import React, { useState } from "react";
import { ArrowRight, ArrowLeft, BadgeCheck, AlertCircle } from "lucide-react";
import {
  MdPublic,
  MdChatBubbleOutline,
  MdTranslate,
  MdLocalAirport,
  MdLocationOn,
  MdKeyboardArrowDown,
} from "react-icons/md";

import Loading from "../../loading/Loading";
import NoMessagesFound from "../../emptyData/NoMessagesFound";
import { useAllPrograms } from "../../../hooks/programs/useProgramsList";
import NextButton from "../../ui/buttons/NextButton";
import PrevButton from "../../ui/buttons/PrevButton";
import Link from "next/link";

const MarketplaceCard = () => {
  const {
    programs,
    loading: programsLoading,
    error: programsError,
  } = useAllPrograms({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPrograms = programs.slice(indexOfFirstItem, indexOfLastItem);
  const [activeTab, setActiveTab] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="mt-6 overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="relative border-b border-gray-200 p-6">
          <div className="mb-6 flex flex-col gap-6 rounded-xl md:flex-row md:items-center md:justify-between">
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
          {/* CONTENT AREA */}
          {programsLoading && <Loading text="Fetching programs data..." />}

          {!programsError && !programsLoading && programs.length === 0 && (
            <NoMessagesFound
              title="No programs found"
              subtitle="Try adjusting your search or filters."
            />
          )}

          {!programsError && programs.length > 0 && (
            <div className="block">
              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
                {currentPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="relative overflow-hidden rounded-lg bg-white shadow-md transition-all"
                  >
                    {/* Header */}
                    <div className="relative flex w-full items-center border-b border-gray-100 px-5 py-4">
                      <div className="flex w-full items-start justify-between">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 shadow-inner">
                              <span className="text-lg font-medium text-slate-900">
                                {program.name?.[0]}
                              </span>
                            </div>
                            {/* Verified / Unverified */}
                            <span
                              title={
                                program.field_of_study?.is_active
                                  ? "Verified Partner"
                                  : "Unverified"
                              }
                              className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                                program.field_of_study?.is_active
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                            />
                          </div>

                          {/* Name + Country */}
                          <div className="min-w-0">
                            <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
                              {program.name}
                            </h3>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <MdPublic className="h-3.5 w-3.5" /> Palestinian
                            </p>
                          </div>
                        </div>

                        {/* Verified / Unverified pill */}
                        <span
                          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                            program.field_of_study?.is_active
                              ? "border-emerald-700 bg-emerald-100 text-emerald-700"
                              : "border-red-700 bg-red-100 text-red-700"
                          }`}
                        >
                          {program.field_of_study?.is_active ? (
                            <BadgeCheck size={14} />
                          ) : (
                            <AlertCircle size={14} />
                          )}
                          {program.field_of_study?.is_active
                            ? "Verified"
                            : "Unverified"}
                        </span>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-5 py-3">
                      <div className="relative flex w-full rounded-full bg-gray-100 p-1 shadow-sm">
                        {[1, 2].map((tab) => (
                          <div
                            key={tab}
                            className={`flex-1 cursor-pointer rounded-full py-2 text-center text-sm font-medium transition-all duration-200 ${
                              activeTab === tab
                                ? "bg-white text-gray-900 shadow-md"
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                            onClick={() => setActiveTab(tab)}
                          >
                            {tab === 1 ? "Overview" : "Details"}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-2 px-5 pb-4 text-xs">
                      {activeTab === 1 && (
                        <>
                          <div className="flex items-center justify-between border-b border-gray-100 py-2">
                            <div className="flex items-center gap-2 font-medium text-slate-500">
                              <MdTranslate className="h-5 w-5" /> Languages
                            </div>
                            <div className="text-xs font-medium text-slate-900">
                              English, Arabic, Malay
                            </div>
                          </div>

                          <div className="border-b border-gray-100 py-2">
                            <div className="mb-1 flex items-center gap-2 font-medium text-green-700">
                              <MdLocalAirport className="h-5 w-5 text-green-600" />{" "}
                              Services Offered
                            </div>
                            <ul className="ml-5 flex flex-col gap-1 text-xs text-slate-500">
                              <li className="flex items-center gap-2">
                                <span className="inline-block h-2 w-2 rounded-full bg-green-600" />
                                Airport Pickup (Senai)
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="inline-block h-2 w-2 rounded-full bg-green-600" />
                                Accommodation Search
                              </li>
                            </ul>
                          </div>

                          <div className="border-b border-gray-100 py-2">
                            <div className="mb-1 flex items-center gap-2 font-medium text-blue-700">
                              <MdLocationOn className="h-5 w-5 text-blue-500" />{" "}
                              Universities Served
                            </div>
                            <ul className="ml-5 flex flex-col gap-1 text-xs text-slate-500">
                              <li className="flex items-center gap-2">
                                <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                                UTM Skudai
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                                UIIA
                              </li>
                            </ul>
                          </div>

                          <div className="py-2">
                            <div className="mb-2 flex items-center gap-2 font-medium text-orange-800">
                              <MdLocationOn className="h-5 w-5 text-orange-500" />{" "}
                              Service Locations
                            </div>
                            <div className="ml-5 flex flex-wrap gap-2">
                              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800">
                                Johor Bahru
                              </span>
                              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800">
                                Skudai
                              </span>
                            </div>
                          </div>
                        </>
                      )}

                      {activeTab === 2 && (
                        <>

                          <div className="group relative overflow-hidden rounded-md bg-gradient-to-br from-emerald-500 to-green-600 p-6 shadow-sm transition-all">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative flex items-center justify-between">
                              <div>

                                <p className="text-sm font-semibold text-emerald-100  uppercase tracking-wide">Packages Offered</p>

                                <div className="flex items-baseline gap-1 mt-1">
                                  <span className="text-lg font-bold text-white">RM 200 - 350</span>
                                </div>

                              </div>
                              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full group-hover:bg-white/30 transition-colors">
                                <MdLocalAirport className="h-7 w-7 text-white" />
                              </div>
                            </div>
                          </div>

                          <div className="cursor-pointer rounded-md border border-gray-200 shadow-sm transition-all">

                            <div
                              className="flex items-center justify-between rounded-md px-5 py-4 transition-colors "
                              onClick={() => setIsOpen(!isOpen)}
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900">
                                  Welcome to JB Package
                                </span>
                                <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                  RM 360
                                </span>
                              </div>

                              <MdKeyboardArrowDown
                                className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${
                                  isOpen ? "rotate-180" : "rotate-0"
                                }`}
                              />
                            </div>

                            <div
                              className={`transition-all duration-300 ease-in-out ${
                                isOpen
                                  ? "max-h-96 opacity-100"
                                  : "max-h-0 opacity-0"
                              } overflow-hidden`}
                            >
                              <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                  Package Details
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  This is the detailed content that opens when you click the header.
                                  Replace this with your actual package information, itinerary details,
                                  or service descriptions.
                                </p>
                                <ul className="mt-4 space-y-2">
                                  <li className="flex items-center text-sm text-gray-600">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></span>
                                    Full transportation coverage
                                  </li>
                                  <li className="flex items-center text-sm text-gray-600">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></span>
                                    Professional tour guide
                                  </li>
                                  <li className="flex items-center text-sm text-gray-600">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></span>
                                    Meals and refreshments included
                                  </li>
                                </ul>
                              </div>
                            </div>

                          </div>

                        </>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 border-t border-gray-200 p-4">
                      <Link
                        href={{
                          pathname: "/partner/applications/apply-for-program",
                          query: {
                            program_id: program.id,
                            university_id: program.university.id,
                            intake_date:
                              program.intake_dates?.[0] ??
                              program.university.intake_months?.[0] ??
                              new Date().toISOString().split("T")[0],
                          },
                        }}
                        title="Contact Me"
                        className="flex items-center justify-center gap-2 rounded-full border border-green-600 bg-green-100 px-4 py-2 text-sm font-medium text-green-700 shadow-md transition-transform hover:scale-105 hover:border-green-700 hover:bg-green-200 disabled:opacity-50"
                      >
                        <MdChatBubbleOutline className="h-4 w-4" />
                        Contact Me
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 items-center gap-4 border-t border-gray-200 p-4 sm:p-6 md:flex md:items-center md:justify-between">
                {programs.length > 0 && (
                  <div className="flex items-center gap-1 text-sm font-medium text-text-muted">
                    Showing
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>
                    to
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, programs.length)}
                    </span>
                    of
                    <span className="font-medium">{programs.length}</span>
                    programs
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
                    {Math.ceil(programs.length / itemsPerPage)}
                  </span>

                  <NextButton
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(programs.length / itemsPerPage)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(programs.length / itemsPerPage)
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
    </div>
  );
};

export default MarketplaceCard;
