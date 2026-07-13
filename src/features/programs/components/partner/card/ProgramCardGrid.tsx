"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ArrowRight, ArrowLeft, Award, Send } from 'lucide-react';
import PresignedImage from "components/ui/PresignedImage";

import Loading from "components/loading/Loading";
import NoMessagesFound from "components/emptyData/NoMessagesFound";

import { usePrograms, useStates } from "features/programs/hooks";
import { useAllFields } from "features/knowledge-hub/field-of-study/hooks";
import { useAllQualifications } from "features/knowledge-hub/qualifications/hooks";
import { useUniversities } from "features/universities/hooks";

import ProgramFilterBar from "components/filters/ProgramFilterBar";
import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";
import Link from "next/link";

const ITEMS_PER_PAGE = 9;

const ProgramsCards = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedField, setSelectedField] = useState<string>("all");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedQualId, setSelectedQualId] = useState<string | null>(null);
  const [hasScholarship, setHasScholarship] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { states } = useStates();
  const { fields } = useAllFields();
  const { qualifications } = useAllQualifications();
  const { universities } = useUniversities();

  const fieldOptions = useMemo(() => fields.map((f) => ({ label: f.name, value: f.id })), [fields]);
  const universityOptions = useMemo(() => universities.map((u) => ({ label: u.name, value: u.id })), [universities]);
  const stateOptions = useMemo(() => states.map((s) => ({ label: s.name, value: s.id })), [states]);
  const qualificationOptions = useMemo(() => qualifications.map((q) => ({ label: q.name, value: q.id })), [qualifications]);

  const {
    programs,
    total,
    loading: programsLoading,
    isFetching: programsFetching,
    error: programsError,
  } = usePrograms({
    search: debouncedSearch || undefined,
    field_of_study_id: selectedField !== "all" ? selectedField : undefined,
    qualification_id: selectedQualId ?? undefined,
    state_id: selectedState !== "all" ? selectedState : undefined,
    university_id: selectedUniversity !== "all" ? selectedUniversity : undefined,
    has_scholarship: hasScholarship === "true" ? true : hasScholarship === "false" ? false : undefined,
    sort_by: sortBy !== "all" ? (sortBy as "commission_asc" | "commission_desc" | "tuition_asc" | "tuition_desc") : undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  });

  const activeFiltersCount = [
    selectedState !== "all",
    selectedField !== "all",
    selectedUniversity !== "all",
    selectedQualId !== null,
    hasScholarship !== "all",
    sortBy !== "all",
    searchTerm !== "",
  ].filter(Boolean).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedState("all");
    setSelectedField("all");
    setSelectedUniversity("all");
    setSelectedQualId(null);
    setHasScholarship("all");
    setSortBy("all");
    setCurrentPage(1);
  };

  return (
    <div className="mt-6 overflow-hidden text-p2 max-w-5xl mx-auto">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white ">

      <div className="relative border-b border-slate-200">
          <div className="flex flex-col gap-6 rounded-t-xl md:flex-row md:items-center md:justify-between p-6 border-b border-slate-200">
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

          <div className="p-6 border-b border-slate-200">

            <ProgramFilterBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search by university, program, or level..."
            selectedState={selectedState}
            onStateChange={(val) => { setSelectedState(val); setCurrentPage(1); }}
            stateOptions={stateOptions}
            selectedField={selectedField}
            onFieldChange={(val) => { setSelectedField(val); setCurrentPage(1); }}
            fieldOptions={fieldOptions}
            selectedUniversity={selectedUniversity}
            onUniversityChange={(val) => { setSelectedUniversity(val); setCurrentPage(1); }}
            universityOptions={universityOptions}
            selectedQualId={selectedQualId}
            onQualChange={(id) => { setSelectedQualId(id); setCurrentPage(1); }}
            qualificationOptions={qualificationOptions}
            hasScholarship={hasScholarship}
            onScholarshipChange={(val) => { setHasScholarship(val); setCurrentPage(1); }}
            sortBy={sortBy}
            onSortChange={(val) => { setSortBy(val); setCurrentPage(1); }}
            resultsCount={total}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={clearFilters}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters((v) => !v)}
          />

          </div>

        </div>

        <div className="block">
          {programsLoading && <Loading text="Fetching programs data..." />}

          {!programsError &&
            !programsLoading &&
            programs.length === 0 && (
              <NoMessagesFound
                title="No programs found"
                subtitle="Try adjusting your search or filters."
              />
            )}

          {!programsError && programs.length > 0 && (
            <div className="block">
              <div className={`grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-150 ${programsFetching && !programsLoading ? "opacity-50 pointer-events-none" : ""}`}>
                {programs.map((program) => (
                  <div
                    key={program.id}
                    onClick={() => window.open(`/partner/knowledge-hub/${program.id}`, "_blank")}
                    className="group relative cursor-pointer flex flex-col overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 px-4 pt-5 pb-4">

                      <div className="flex-shrink-0 h-14 w-14 rounded-full overflow-hidden">
                        {program.university?.logo_file_key ? (
                          <PresignedImage
                            fileKey={program.university.logo_file_key}
                            alt={program.university.name}
                            className="h-full w-full object-cover"
                            fallback={
                              <div className="flex h-full w-full items-center justify-center bg-accent-light text-h6 font-medium text-blue-700">
                                {program.university?.name?.slice(0, 2).toUpperCase()}
                              </div>
                            }
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-accent-light text-h6 font-medium text-blue-700">
                            {program.university?.name?.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 " title={program.name}>
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
                          ? `${(program.commission_currency || "RM").toUpperCase()} ${program.commission_amount.toLocaleString()}`
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
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                      >
                        <Send className="h-4 w-4" />
                        Apply Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 items-center gap-4 border-t border-slate-200 p-4 sm:p-6 md:flex md:justify-between">
                {total > 0 && (
                  <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
                    Showing
                    <span className="font-medium">
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                    </span>
                    to
                    <span className="font-medium">
                      {Math.min(currentPage * ITEMS_PER_PAGE, total)}
                    </span>
                    of
                    <span className="font-medium">{total}</span>
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
                    {Math.ceil(total / ITEMS_PER_PAGE)}
                  </span>

                  <NextButton
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(total / ITEMS_PER_PAGE)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(total / ITEMS_PER_PAGE)
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
