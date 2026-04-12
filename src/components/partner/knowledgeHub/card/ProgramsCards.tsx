"use client";

import React, { useState } from "react";
import {
  Search,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  MapPin,
  Award,
  Send,
} from 'lucide-react';
import { MdSchool } from 'react-icons/md';
import PresignedImage from "components/ui/PresignedImage";

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
    <div className="mt-6 overflow-hidden text-p2 max-w-5xl mx-auto">
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
                    className="relative cursor-pointer flex flex-col overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 px-4 pt-5 pb-4">
                      
                      <div className="flex-shrink-0 h-14 w-14 rounded-xl overflow-hidden">
                        {program.university?.logo_file_key ? (
                          <PresignedImage
                            fileKey={program.university.logo_file_key}
                            alt={program.university.name}
                            className="h-full w-full object-cover"
                            fallback={
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
                                <GraduationCap className="h-7 w-7 text-white" />
                              </div>
                            }
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
                            <GraduationCap className="h-7 w-7 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                          {program.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500 truncate">
                          {program.university?.name}
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 border-t border-slate-100" />

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-4">
                      <div>
                        <p className="text-xs text-slate-400">First Year</p>
                        <p className="text-sm font-bold text-slate-900">
                          {program.first_year_tuition
                            ? `RM ${program.first_year_tuition.toLocaleString()}`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Level</p>
                        <p className="text-sm font-bold text-slate-900">
                          {program.qualification_level ?? "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Location</p>
                        <p className="text-sm font-bold text-slate-900">
                          {program.branch?.state ?? "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Duration</p>
                        <p className="text-sm font-bold text-slate-900">
                          {program.duration ?? "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Scholarship badge */}
                    <div className="px-4 pb-3">
                      {program.has_scholarship ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                          <Award className="h-4 w-4" />
                          Scholarship Available
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <Award className="h-4 w-4" />
                          No Scholarship
                        </span>
                      )}
                    </div>

                    {/* Commission */}
                    <div className="mx-4 mb-4 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                      <span className="text-sm font-medium text-emerald-700">Your Commission</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {program.commission_amount
                          ? `RM ${program.commission_amount.toLocaleString()}`
                          : "N/A"}
                      </span>
                    </div>

                    {/* Apply Now */}
                    <div className="px-4 pb-4">
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
                        onClick={(e) => e.stopPropagation()}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                      >
                        <Send className="h-4 w-4" />
                        Apply Now
                      </Link>
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
