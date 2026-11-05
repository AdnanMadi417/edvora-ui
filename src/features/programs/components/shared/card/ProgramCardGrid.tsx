"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ArrowRight, ArrowLeft, Award, Send, GraduationCap, AlertCircle } from 'lucide-react';
import PresignedImage from "components/ub/data/media/PresignedImage";

import Loading from "components/ub/feedback/states/Loading";
import NoMessagesFound from "components/ub/feedback/states/NoMessagesFound";
import EmptyData from "components/ub/feedback/states/EmptyData";
import CatalogueQuotaNotice from "features/programs/components/shared/CatalogueQuotaNotice";

import { usePrograms, useStates } from "features/programs/hooks";
import { useAllFields } from "features/knowledge-hub/field-of-study/hooks";
import { useAllQualifications } from "features/knowledge-hub/qualifications/hooks";
import { useUniversities } from "features/universities/hooks";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ProgramFilterPanel from "features/programs/components/shared/filters/ProgramFilterPanel";
import IntakeMonthsChips from "features/programs/components/shared/IntakeMonthsChips";
import { nextIntakeMonth, resolveIntakeDate } from "features/programs/utils/intakeMonths";
import { courseTypeLabel } from "features/programs/utils/courseType";
import NextButton from "components/ub/core/buttons/NextButton";
import PrevButton from "components/ub/core/buttons/PrevButton";
import Link from "next/link";

const ITEMS_PER_PAGE = 9;

interface ProgramsCardsProps {
  basePath?: string;
  showApplyAction?: boolean;
}

const ProgramsCards = ({ basePath = "/partner", showApplyAction = true }: ProgramsCardsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get("search") ?? "");
  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get("page")) || 1);

  const [selectedState, setSelectedState] = useState<string>(() => searchParams.get("state_id") ?? "all");
  const [selectedField, setSelectedField] = useState<string>(() => searchParams.get("field_of_study_id") ?? "all");
  const [selectedUniversity, setSelectedUniversity] = useState<string>(() => searchParams.get("university_id") ?? "all");
  const [selectedQualId, setSelectedQualId] = useState<string | null>(() => searchParams.get("qualification_id"));
  const [hasScholarship, setHasScholarship] = useState<string>(() => searchParams.get("has_scholarship") ?? "all");
  const [courseType, setCourseType] = useState<string>(() => searchParams.get("course_type") ?? "all");
  const [classType, setClassType] = useState<string>(() => searchParams.get("class_type") ?? "all");
  const [sortBy, setSortBy] = useState<string>(() => searchParams.get("sort_by") ?? "all");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Keep the URL in sync with filter/search/sort/page state so it's
  // shareable and bookmarkable, and survives a refresh.
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedState !== "all") params.set("state_id", selectedState);
    if (selectedField !== "all") params.set("field_of_study_id", selectedField);
    if (selectedUniversity !== "all") params.set("university_id", selectedUniversity);
    if (selectedQualId) params.set("qualification_id", selectedQualId);
    if (hasScholarship !== "all") params.set("has_scholarship", hasScholarship);
    if (courseType !== "all") params.set("course_type", courseType);
    if (classType !== "all") params.set("class_type", classType);
    if (sortBy !== "all") params.set("sort_by", sortBy);
    if (currentPage > 1) params.set("page", String(currentPage));

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [debouncedSearch, selectedState, selectedField, selectedUniversity, selectedQualId, hasScholarship, courseType, classType, sortBy, currentPage, pathname, router]);

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
    quota: programsQuota,
    refetch: refetchPrograms,
  } = usePrograms({
    search: debouncedSearch || undefined,
    field_of_study_id: selectedField !== "all" ? selectedField : undefined,
    qualification_id: selectedQualId ?? undefined,
    state_id: selectedState !== "all" ? selectedState : undefined,
    university_id: selectedUniversity !== "all" ? selectedUniversity : undefined,
    has_scholarship: hasScholarship === "true" ? true : hasScholarship === "false" ? false : undefined,
    course_type: courseType !== "all" ? (courseType as "course_work" | "research" | "mixed_mode") : undefined,
    class_type: classType !== "all" ? (classType as "physical" | "online") : undefined,
    sort_by: sortBy !== "all" ? (sortBy as "commission_asc" | "commission_desc" | "tuition_asc" | "tuition_desc") : undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Scoped to the 5 dropdown filters only — search and sort are separate,
  // independently-controlled UI and aren't cleared by this.
  const clearAllFilters = () => {
    setSelectedState("all");
    setSelectedField("all");
    setSelectedUniversity("all");
    setSelectedQualId(null);
    setHasScholarship("all");
    setCourseType("all");
    setClassType("all");
    setCurrentPage(1);
  };

  return (
    <div className="mt-6 overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white ">

      <div className="relative border-b border-slate-200">
          <div className="flex flex-col gap-6 rounded-t-xl md:flex-row md:items-center md:justify-between p-6 border-b border-slate-200">
            <div>
              <p className="mt-1 text-sm text-slate-500">
                Explore and manage all programs, universities, and learning
                resources
              </p>
            </div>
          </div>

          <div className="p-6 border-b border-slate-200">

            <ProgramFilterPanel
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search by university, program, or level..."
            stateOptions={stateOptions}
            fieldOptions={fieldOptions}
            universityOptions={universityOptions}
            qualificationOptions={qualificationOptions}
            filters={{
              state: selectedState,
              field: selectedField,
              university: selectedUniversity,
              qualId: selectedQualId,
              scholarship: hasScholarship,
              courseType,
              classType,
            }}
            onApplyFilters={(values) => {
              setSelectedState(values.state);
              setSelectedField(values.field);
              setSelectedUniversity(values.university);
              setSelectedQualId(values.qualId);
              setHasScholarship(values.scholarship);
              setCourseType(values.courseType);
              setClassType(values.classType);
              setCurrentPage(1);
            }}
            onRemoveFilter={(key) => {
              if (key === "state") setSelectedState("all");
              if (key === "field") setSelectedField("all");
              if (key === "university") setSelectedUniversity("all");
              if (key === "qualId") setSelectedQualId(null);
              if (key === "scholarship") setHasScholarship("all");
              if (key === "courseType") setCourseType("all");
              if (key === "classType") setClassType("all");
              setCurrentPage(1);
            }}
            onClearAll={clearAllFilters}
            sortBy={sortBy}
            onSortChange={(value) => { setSortBy(value); setCurrentPage(1); }}
            resultsCount={total}
          />

          </div>

        </div>

        <div className="block">
          {programsLoading && <Loading text="Fetching programs data..." />}

          {/* The partner's daily catalogue quota is used up (UBX-425): a limit, not a failure. */}
          {programsQuota && !programsLoading && <CatalogueQuotaNotice quota={programsQuota} />}

          {programsError && !programsQuota && !programsLoading && (
            <EmptyData
              icon={AlertCircle}
              color="red"
              title="Couldn't load programs"
              subtitle={programsError}
              action={
                <button
                  type="button"
                  onClick={refetchPrograms}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Try again
                </button>
              }
            />
          )}

          {!programsError &&
            !programsLoading &&
            programs.length === 0 && (
              <NoMessagesFound
                title="No programs found"
                subtitle="Try adjusting your search or filters."
                icon={<GraduationCap className="h-8 w-8 text-slate-400" />}
              />
            )}

          {!programsError && programs.length > 0 && (
            <div className="block">
              <div className={`grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-150 ${programsFetching && !programsLoading ? "opacity-50 pointer-events-none" : ""}`}>
                {programs.map((program) => (
                  <div
                    key={program.id}
                    onClick={() => window.open(`${basePath}/knowledge-hub/${program.id}`, "_blank")}
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
                            ? `${program.yearly_fee_currency || "MYR"} ${program.first_year_tuition.toLocaleString()}`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Level</p>
                        <p className="text-sm font-bold text-slate-900">
                          {program.qualification_level ?? "N/A"}
                          {program.course_type && (
                            <span className="block text-xs font-medium text-slate-500">
                              {courseTypeLabel(program.course_type)}
                            </span>
                          )}
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

                    {/* Intake Dates */}
                    {program.intake_months && program.intake_months.length > 0 && (
                      <div className="px-4 pb-3">
                        <p className="mb-1.5 text-xs text-slate-400">Intakes</p>
                        <IntakeMonthsChips months={program.intake_months} size="sm" showDot={false} maxVisible={3} />
                      </div>
                    )}

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
                    {program.commission_amount != null && (
                      <div className="mx-4 mb-4 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                        <span className="text-sm font-medium text-emerald-700">Your Commission</span>
                        <span className="text-lg font-bold text-emerald-600">
                          {`${(program.commission_currency || "RM").toUpperCase()} ${program.commission_amount.toLocaleString()}`}
                        </span>
                      </div>
                    )}

                    {/* Apply Now */}
                    {showApplyAction && (
                      <div className="px-4 pb-4">
                        <Link
                          href={{
                            pathname: "/partner/applications/apply-for-program",
                            query: {
                              program_id: program.id,
                              university_id: program.university.id,
                              intake_date: (() => {
                                const month = program.next_intake_month ?? nextIntakeMonth(program.intake_months) ?? nextIntakeMonth(program.university.intake_months);
                                return month ? resolveIntakeDate(month) : new Date().toISOString().split("T")[0];
                              })(),
                            },
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                        >
                          <Send className="h-4 w-4" />
                          Apply Now
                        </Link>
                      </div>
                    )}
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
