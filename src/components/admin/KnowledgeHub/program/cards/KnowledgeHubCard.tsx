"use client";

import React, { useState } from "react";
import {
  Search,
  RefreshCw,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Calendar,
  MinusCircle,
  Layers,
  XCircle,
} from "lucide-react";
import {
  MdAccessTime,
  MdAttachMoney,
  MdVisibility,
  MdSchool ,
} from "react-icons/md";

import Loading from "../../../../loading/Loading";
import NoMessagesFound from "../../../../emptyData/NoMessagesFound";

import { useAllPrograms } from "../../../../../hooks/programs/useProgramsList";
import { useAllFields } from "../../../../../hooks/programs/useFieldsList";
import { useKnowledgeHubStates } from "../../../../../hooks/programs/useProgramStates";

import FilterSelectField from "../../../../form/filter/FilterSelectField";
import NextButton from "../../../../ui/buttons/NextButton";
import PrevButton from "../../../../ui/buttons/PrevButton";

const KnowledgeHubCards = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    programs,
    loading: programsLoading,
    error: programsError,
  } = useAllPrograms({});
  const { states, loading, error } = useKnowledgeHubStates();
  const { fields, fieldsLoading, fieldsError } = useAllFields();

  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedField, setSelectedField] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredPrograms = programs.filter((program) => {
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      program.university?.name?.toLowerCase().includes(term) ||
      program.name?.toLowerCase().includes(term) ||
      program.qualification_level?.toLowerCase().includes(term);

    const matchesLocation =
      selectedState === "all" || program.branch?.state === selectedState;

    const matchesField =
      selectedField === "all" || program.field_of_study?.name === selectedField;

    return matchesSearch && matchesLocation && matchesField;
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

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
              <input
                type="text"
                placeholder="Search by university, program, or level..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-background w-full rounded-full border border-gray-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
              />
            </div>

            <FilterSelectField
              value={selectedState}
              onChange={(val) => {
                setSelectedState(val);
                setCurrentPage(1);
              }}
              options={states}
              icon={Layers}
              defaultOption="All Locations"
            />

            <FilterSelectField
              value={selectedState}
              onChange={(val) => {
                setSelectedField(val);
                setCurrentPage(1);
              }}
              options={fields}
              icon={Layers}
              defaultOption="All Fields"
            />

            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedState("all");
                setCurrentPage(1);
              }}
              className="flex items-center justify-center gap-2 rounded-full border border-red-600 px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Clear
            </button>
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
              <div className="grid grid-cols-1 items-stretch gap-6 p-6 md:grid-cols-2 lg:grid-cols-2">
                {currentPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="relative flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:border-slate-300"
                  >

                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">

                      <div className="flex min-w-0 items-center gap-4">

                        <div className="relative flex-shrink-0">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-gray-100 shadow-sm">
                            <span className="text-sm font-semibold uppercase">
                              {program.university.name?.slice(0, 2)}
                            </span>
                          </div>

                          <span
                            className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                              program.university.is_active
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                            title={
                              program.university.is_active
                                ? "University Active"
                                : "University Inactive"
                            }
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-slate-900">
                            {program.name}
                          </h3>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {program.university?.name ??
                              "University not provided"}{" "}
                            • {program.university.country}
                          </p>

                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <span>{program.field_of_study.name}</span>
                            {program.field_of_study?.is_active ? (
                              <CheckCircle className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 px-5 py-4 text-xs text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium text-slate-500">
                          <MdAttachMoney className="h-4 w-4" />
                          First-Year Cost
                        </span>
                        <span className="font-medium text-slate-900">
                          {program.first_year_tuition
                            ? `RM${program.first_year_tuition.toLocaleString()}`
                            : "Not provided"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium text-slate-500">
                          <MdSchool   className="h-4 w-4" />
                          Level
                        </span>
                        <span className="font-medium text-slate-900">
                          {program.qualification_level
                            ? `${program.qualification_level}`
                            : "Not provided"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium text-slate-500">
                          <MdAccessTime className="h-4 w-4" />
                          Duration
                        </span>
                        <span className="font-medium text-slate-900">
                          {program.duration
                            ? `${program.duration} years`
                            : "Not provided"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium text-slate-500">
                          <MapPin className="h-4 w-4" />
                          State
                        </span>
                        <span className="font-medium text-slate-900">
                          {program.branch?.state ?? "Not provided"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium text-slate-500">
                          <Calendar className="h-4 w-4" />
                          Next Intake
                        </span>
                        <span className="font-medium text-slate-900">
                          {program.next_intake
                            ? formatDate(program.next_intake)
                            : "Intake not announced"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium text-slate-500">
                          {program.has_scholarship ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <MinusCircle className="h-4 w-4 text-slate-400" />
                          )}
                          Scholarship
                        </span>
                        <span className={`font-medium text-slate-900 `}>
                          {program.has_scholarship
                            ? "Available"
                            : "Not Available"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">
                          Commission Amount
                        </span>
                        <span className="text-lg font-semibold text-slate-900">
                          {program.commission_amount
                            ? `RM${program.commission_amount.toLocaleString()}`
                            : "Not provided"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 border-t border-slate-200 bg-slate-50 p-4">
                      <a
                        href={`/admin/knowledge-hub/programs/${program.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full border border-blue-600 bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition-all hover:scale-105 hover:border-blue-700 hover:bg-blue-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <MdVisibility className="h-5 w-5" />
                        View details
                      </a>

                      <a
                        href={`/admin/knowledge-hub/programs/${program.id}/edit`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full border border-green-600 bg-green-100 px-4 py-2 text-sm font-medium text-green-700 transition-all hover:scale-105 hover:border-green-700 hover:bg-green-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                        <CheckCircle className="h-5 w-5" />
                        Update details
                      </a>
                    </div>
                  </div>
                ))}
              </div>1

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

export default KnowledgeHubCards;
