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
} from "lucide-react";
import {
  MdMenuBook,
  MdLocationOn,
  MdAccessTime,
  MdOutlineDateRange,
  MdSchool,
} from "react-icons/md";

import Loading from "components/loading/Loading";
import NoMessagesFound from "components/emptyData/NoMessagesFound";
import { useAllPrograms } from "../../../hooks/programs/useProgramsList";
import NextButton from "../../ui/buttons/NextButton";
import PrevButton from "../../../components/ui/buttons/PrevButton";
import ApplyNowIconBtn from "../../ui/buttons/IconButton";
import IconLinkBtn from "../../ui/links/IconLinkBtn";

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
              <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="relative overflow-hidden rounded-md border border-gray-200 bg-card shadow-sm"
                  >
                    {/* Header */}

                    <div className="bg-background flex h-[100px] items-center gap-4 overflow-hidden rounded-t-lg border-b border-gray-200 p-4">
                      <div className="flex items-center gap-2">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white">
                          <MdSchool className="h-6 w-6 text-blue-600" />

                          <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                              program.university?.is_active
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-text-primary">
                            {program.name}
                          </span>
                          <span className="text-xsm text-text-muted">
                            {program.university?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <MdMenuBook className="h-4 w-4" />
                            <span>Level</span>
                          </div>
                          <span className="text-text-muted">
                            {program.qualification_level}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <MdLocationOn className="h-4 w-4" />
                            <span>Location</span>
                          </div>
                          <span className="text-text-muted">
                            ({program.university?.country})
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <MdAccessTime className="h-4 w-4" />
                            <span>Duration</span>
                          </div>
                          <span className="text-text-muted">
                            {/*{program.duration}*/}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <MdSchool className="h-4 w-4" />
                            <span>Mode of Study</span>
                          </div>
                          <span className="text-text-muted">
                            {/*{program.mode}*/}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <MdOutlineDateRange className="h-4 w-4" />
                            <span>Next Intake</span>
                          </div>
                          <span className="text-text-muted">
                            {/*{program.intake}*/}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <MdOutlineDateRange className="h-4 w-4" />
                            <span>Deadline</span>
                          </div>
                          <span className="text-text-muted">
                            {/*{program.deadline}*/}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 border-t border-gray-200 px-6 py-4 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 text-sm font-semibold text-black">
                          <BadgePercent className="h-4 w-4" />
                          <span>{program.commission_rate ?? "-"}</span>
                        </div>
                        <span className="text-xs text-text-muted">
                          Commission
                        </span>
                      </div>

                      <div className="border-l border-gray-200">
                        <div className="text-sm font-semibold text-black">
                          {program.tuition_fee ?? "-"}
                        </div>
                        <span className="text-xs text-text-muted">Tuition</span>
                      </div>

                      <div className="border-l border-gray-200">
                        <div className="text-sm font-semibold text-black">
                          {/* You can add rating here if you have it */}-
                        </div>
                        <span className="text-xs text-text-muted">Rating</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-background flex justify-between gap-3 border-t border-gray-200 px-6 py-4">
                      <div className="flex items-center text-xs text-text-muted">
                        <span className="uppercase tracking-wide">Created</span>
                        <span className="ml-2 font-medium text-black">
                          {/*{program.createdAt}*/}
                        </span>
                      </div>

                      <div className="flex gap-3">

                        <IconLinkBtn
                          href={`/partner/knowledgeHub/${program.id}`}
                          icon={<MdMenuBook className="h-5 w-5" />}
                          title="View details"
                          bgColor="bg-blue-50"
                          textColor="text-blue-600"
                          borderColor="border border-blue-800"
                          hoverTextColor="hover:text-blue-800"
                          hoverBorderColor="hover:border-blue-800"
                        />

                        <ApplyNowIconBtn
                          // onClick={}
                          icon={<CheckCircle className="h-5 w-5" />}
                          bgColor="bg-green-50"
                          textColor="text-green-600"
                          borderColor="border-green-800"
                          hoverTextColor="hover:text-green-800"
                          hoverBorderColor="hover:border-green-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className=" flex justify-between border-t border-gray-200 p-6">

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
