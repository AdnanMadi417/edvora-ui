"use client";

import React, { useState } from "react";
import {
  Search,
  Layers,
  RefreshCw,
  CheckCircle,
  BadgePercent,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  MapPin,
  Calendar,
  MinusCircle,
} from "lucide-react";
import {
  MdMenuBook,
  MdAccessTime,
  MdSchool,
  MdAttachMoney,
  MdLaptop,
  MdApartment,
} from "react-icons/md";

import Loading from "../../../loading/Loading";
import NoMessagesFound from "../../../emptyData/NoMessagesFound";
import { useAllPrograms } from "../../../../hooks/programs/useProgramsList";
import NextButton from "../../../ui/buttons/NextButton";
import PrevButton from "../../../ui/buttons/PrevButton";
import LinkBtn from "../../../ui/links/LinkBtn";
import Link from "next/link";

const KnowledgeHubCards = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all_status");
  const [filterStages, setFilterStages] = useState("all_stages");

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

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const sortDates = (dates: string[]) =>
    [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div className="mt-6 overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="relative border-b border-gray-200 p-6">
          <div className="mb-6 flex flex-col gap-6 rounded-xl md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-text-primary">
                Knowledge Hub
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                Explore and manage all programs, universities, and learning
                resources
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-text-muted" />
              <input
                type="text"
                placeholder="Search by university, program, or level..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background w-full rounded-full border border-gray-200 px-4 py-2.5 pl-10 pr-4 text-sm text-text-muted outline-0 placeholder:text-text-muted focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
              />
            </div>

            <div className="relative flex-1 sm:flex-none">
              <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-text-muted" />
              <select
                value={filterStages}
                onChange={(e) => setFilterStages(e.target.value)}
                className="bg-background w-full cursor-pointer rounded-full border border-gray-200 py-2.5 pl-10 pr-8 text-sm outline-0 focus:border-blue-500 focus:text-blue-500 focus:ring-0 focus:ring-blue-500"
              >
                <option value="all_stages">All Universities</option>
              </select>
            </div>

            <div className="relative flex-1 sm:flex-none">
              <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-text-muted" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-background w-full cursor-pointer rounded-full border border-gray-200 py-2.5 pl-10 pr-8 text-sm outline-0 focus:border-blue-500 focus:text-blue-500 focus:ring-0 focus:ring-blue-500"
              >
                <option value="all_status">All Programs</option>
              </select>
            </div>

            <div className="relative flex-1 sm:flex-none">
              <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-text-muted" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-background w-full cursor-pointer rounded-full border border-gray-200 py-2.5 pl-10 pr-8 text-sm outline-0 focus:border-blue-500 focus:text-blue-500 focus:ring-0 focus:ring-blue-500"
              >
                <option value="all_status">All Levels</option>
              </select>
            </div>

            {/* Clear Button */}
            <button
              onClick={() => setSearchTerm("")}
              className="flex items-center justify-center gap-2 rounded-full border border-red-600 px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Clear
            </button>
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
                    className="relative overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-all"
                  >
                    {/* Gradient Top Accent */}
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-500/80 via-blue-600/80 to-indigo-700/80" />

                    {/* Header */}
                    <div className="relative flex h-[100px] items-center px-5 py-4">
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 shadow-sm">
                            <GraduationCap className="h-6 w-6 text-white" />
                          </div>

                          <span
                            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white ${
                              program.field_of_study?.is_active
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                            {program.name}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {program.university?.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-y border-gray-200 px-5 py-4 text-xs">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-700">
                        <MdSchool className="h-3.5 w-3.5" />
                        <span className="font-medium capitalize text-text-primary">
                          {program.qualification_level}
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
                        {program.is_online ? (
                          <>
                            <MdLaptop className="h-3.5 w-3.5" /> Online
                          </>
                        ) : (
                          <>
                            <MdApartment className="h-3.5 w-3.5" /> On Campus
                          </>
                        )}
                      </div>
                    </div>

                    <div className="px-5 py-4 text-xs">
                      <div className="space-y-2">
                        {/* Duration */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium text-slate-500">
                            <MdAccessTime className="h-3.5 w-3.5" /> Duration
                          </span>
                          <span className="text-xs font-medium text-slate-900">
                            {program.duration
                              ? `${program.duration} years`
                              : "Not provided"}
                          </span>
                        </div>

                        {/* First-Year Cost */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium text-slate-500">
                            <MdAttachMoney className="h-3.5 w-3.5" /> First-Year
                            Cost
                          </span>
                          <span className="text-xs font-medium text-slate-900">
                            {program.first_year_tuition
                              ? `RM${program.first_year_tuition.toLocaleString()}`
                              : "Not provided"}
                          </span>
                        </div>

                        {/* Country */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium text-slate-500">
                            <MapPin className="h-3.5 w-3.5" /> Country
                          </span>
                          <span className="text-xs font-medium text-slate-900">
                            {program.university?.country}
                          </span>
                        </div>

                        {/* Next Intake */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium text-slate-500">
                            <Calendar className="h-3.5 w-3.5" /> Next Intake
                          </span>
                          <span className="text-xs font-medium text-slate-900">
                            {program?.next_intake
                              ? formatDate(program.next_intake)
                              : "Intake not announced"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 font-medium text-slate-500">
                            {program.has_scholarship ? (
                              <CheckCircle className="h-3.5 w-3.5" />
                            ) : (
                              <MinusCircle className="h-3.5 w-3.5" />
                            )}
                            Scholarship
                          </span>

                          <span className="flex items-center gap-2 bg-white transition">
                            <span
                              className={`h-2 w-2 rounded-full border-2 ${
                                program.has_scholarship
                                  ? "border-green-600"
                                  : "border-red-600"
                              }`}
                            />
                            <span className="text-xs font-medium capitalize text-text-primary">
                              {program.has_scholarship
                                ? "Available"
                                : "Not Available"}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-4">
                      <div>
                        <div className="text-xs text-slate-800">
                          Commission
                        </div>
                        <div className="mt-1 text-lg font-bold text-slate-900">
                          {program.first_year_tuition
                            ? `RM${program.first_year_tuition.toLocaleString()}`
                            : "Not provided"}
                        </div>
                      </div>

                      {/*<div className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">*/}
                      {/*  <BadgePercent className="h-4 w-4" />*/}
                      {/*  {program.commission_rate ?? "-"}%*/}
                      {/*</div>*/}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col gap-2 border-t border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <LinkBtn
                        href={`/partner/knowledgeHub/${program.id}`}
                        icon={<MdMenuBook className="h-4 w-4" />}
                        label="View"
                        title="View details"
                        bgColor="bg-blue-50"
                        textColor="text-blue-600"
                        borderColor="border border-blue-600"
                        hoverTextColor="hover:text-blue-800"
                        hoverBorderColor="hover:border-blue-800"
                        className="w-full sm:w-auto"
                      />

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
                        title="Apply Now"
                        className="flex items-center justify-center gap-2 rounded-full border border-green-600 bg-green-100 px-4 py-2 text-sm font-medium text-green-700 transition hover:border-green-700 hover:bg-green-200 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Apply
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

export default KnowledgeHubCards;
