"use client";

import React, { useState } from "react";
import {
  Search,
  RefreshCw,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  MapPin,
  MinusCircle,
  Send,
} from 'lucide-react';
import { MdMenuBook, MdAttachMoney, MdSchool } from 'react-icons/md';

import Loading from "components/loading/Loading";
import NoMessagesFound from "components/emptyData/NoMessagesFound";

import { useAllPrograms } from "hooks/knowledge-hub/programs/useProgramsList";
import { useAllFields } from "hooks/knowledge-hub/field-of-study/useFieldsList";
import { useAllStates } from "hooks/knowledge-hub/programs/useStates";
import { useAllUniversities } from "hooks/knowledge-hub/universities/useUniversitiesList";

import FilterSelectField from "components/form/filter/FilterSelectField";
import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";
import Link from "next/link";

const ProgramsCards = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    programs,
    loading: programsLoading,
    error: programsError,
  } = useAllPrograms({});
  const { states, stateLoading, stateError } = useAllStates();
  const { fields, fieldsLoading, fieldsError } = useAllFields();
  const { universities } = useAllUniversities();

  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedField, setSelectedField] = useState<string>("all");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredPrograms = programs.filter((program) => {
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      program.university?.name?.toLowerCase().includes(term) ||
      program.name?.toLowerCase().includes(term) ||
      program.qualification_level?.toLowerCase().includes(term);

    const matchesLocation =
      selectedState === "all" || (program.branch?.state?.toLowerCase() === selectedState.toLowerCase());

    const matchesField =
      selectedField === "all" || (program.field_of_study?.name?.toLowerCase() === selectedField.toLowerCase());

    const matchesUniversity =
      selectedUniversity === "all" || (program.university?.name?.toLowerCase() === selectedUniversity.toLowerCase());

    return matchesSearch && matchesLocation && matchesField && matchesUniversity;
  });

  const currentPrograms = filteredPrograms.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

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
              <h3 className="text-xl font-semibold text-slate-900">
                Knowledge Hub
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Explore and manage all programs, universities, and learning
                resources
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:gap-4 w-full">

            <div className="relative w-full sm:w-64 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by university, program, or level..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-background w-full rounded-full border border-gray-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
              />
            </div>

            <div className="w-full sm:w-48 flex-shrink-0">
              <FilterSelectField
                value={selectedState}
                onChange={(val) => { setSelectedState(val); setCurrentPage(1); }}
                options={states}
                icon={MapPin}
                defaultOption="All Locations"
              />
            </div>

            <div className="w-full sm:w-48 flex-shrink-0">
              <FilterSelectField
                value={selectedField}
                onChange={(val) => { setSelectedField(val); setCurrentPage(1); }}
                options={fields}
                icon={GraduationCap}
                defaultOption="All Fields"
              />
            </div>

            <div className="w-full sm:w-48 flex-shrink-0">
              <FilterSelectField
                value={selectedUniversity}
                onChange={(val) => { setSelectedUniversity(val); setCurrentPage(1); }}
                options={universities}
                icon={MdSchool}
                defaultOption="All Universities"
              />
            </div>

            <div className="w-full sm:w-auto flex-shrink-0">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedState("all");
                  setSelectedField("all");
                  setSelectedUniversity("all");
                  setCurrentPage(1);
                }}
                className="flex items-center justify-center gap-2 rounded-full border border-red-600 px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>

        </div>

        <div className="block">
          {programsLoading && <Loading text="Fetching programs data..." />}

          {!programsError &&
            !programsLoading &&
            currentPrograms.length === 0 && (
              <NoMessagesFound
                title="No programs found"
                subtitle="Try adjusting your search or filters."
              />
            )}

          {!programsError && programs.length > 0 && (
            <div className="block">
              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
                {currentPrograms.map((program) => (
                  <a
                    href={`/partner/knowledge-hub/${program.id}`}
                    key={program.id}
                    className="relative cursor-pointer flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
                  >

                    <div className="flex items-start gap-4 border-b border-gray-200 px-4 py-5">
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
                          title={
                            program.field_of_study?.is_active
                              ? "Active"
                              : "Inactive"
                          }
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-3 text-sm font-semibold text-slate-900 truncate">
                          {program.name}
                        </h3>

                        <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <span className="line-clamp-1">
                            {program.university?.name}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 px-5 py-4 text-sm">

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <MdAttachMoney className="h-4 w-4" />
                          First-Year Cost
                        </span>

                        <span className="text-sm font-semibold text-slate-900">
                          {program.first_year_tuition
                            ? `RM${program.first_year_tuition.toLocaleString()}`
                            : "Not provided"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <GraduationCap className="h-4 w-4" />
                          Level
                        </span>

                        <span className="text-sm font-semibold text-slate-900">
                          {program.qualification_level ?? "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <MapPin className="h-4 w-4" />
                          Location
                        </span>

                        <span className="text-sm font-semibold text-slate-900">
                          {program.branch?.state ?? "Location not provided"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          {program.has_scholarship ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <MinusCircle className="h-4 w-4" />
                          )}
                          Scholarship
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            program.has_scholarship
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {program.has_scholarship
                            ? "Available"
                            : "Not Available"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto grid grid-cols-1">

                      <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4">
                        <div className="text-xs text-slate-500">
                          Your Commission
                        </div>

                        <div className="text-lg font-semibold text-slate-900">
                          {program.commission_amount
                            ? `RM${program.commission_amount.toLocaleString()}`
                            : "Not provided"}
                        </div>
                      </div>

                      <div className="flex justify-between gap-3 border-t p-4">

                        <Link
                          href={`/partner/knowledge-hub/${program.id}`}
                          title="View details"
                          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-blue-600 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                        >
                          <MdMenuBook className="h-5 w-5" />
                          Details
                        </Link>

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

                          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-green-600 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
                        >
                          <Send className="h-5 w-5" />
                          Apply
                        </Link>

                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="grid grid-cols-1 items-center gap-4 border-t border-gray-200 p-4 sm:p-6 md:flex  md:justify-between">
                {programs.length > 0 && (
                  <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
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

                <div className="flex justify-end gap-2">
                  <PrevButton
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    text="Prev"
                    icon={<ArrowLeft className="h-4 w-4" />}
                  />

                  <span className="px-3 py-1 font-medium text-slate-500">
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

export default ProgramsCards;
