"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Layers,
  RefreshCw,
  CheckCircle,
  BadgePercent,
} from "lucide-react";
import {
  MdMenuBook,
  MdLocationOn,
  MdAccessTime,
  MdOutlineDateRange,
  MdSchool,
  MdStar,
} from "react-icons/md";

import Image from "next/image";
import avatar from "/public/img/avatars/user.png";
import Link from "next/link";
import Loading from "components/loading/Loading";
import NoMessagesFound from "components/emptyData/NoMessagesFound";

const KnowledgeHubCards = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all_status");
  const [filterStages, setFilterStages] = useState("all_stages");
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const MOCK_PROGRAMS = [
    {
      id: "69607c0e-5148-832c-bd8e-fdb11a7ed9dd",
      title: "Master of Manufacturing Engineering",
      university: "University of Toronto",
      level: "Master",
      location: "Toronto, Canada",
      duration: "2 Years",
      mode: "On-campus",
      intake: "September 2026",
      deadline: "June 30, 2026",
      commission: "12%",
      rating: "4.4",
      tuition: "40,000",
      createdAt: "2 Dec 2021",
      avatar: avatar,
    },
    {
      id: "66607c0e-5148-832c-bd8e-fdb11a7ed9dd",
      title: "Bachelor of Computer Science",
      university: "University of Melbourne",
      level: "Bachelor",
      location: "Melbourne, Australia",
      duration: "3 Years",
      mode: "On-campus",
      intake: "February 2027",
      deadline: "October 15, 2026",
      commission: "10%",
      rating: "4.6",
      tuition: "38,000",
      createdAt: "10 Jan 2022",
      avatar: avatar,
    },
    {
      id: "99607c0e-5148-832c-bd8e-fdb11a7ed9dd",
      title: "PhD in Artificial Intelligence",
      university: "Imperial College London",
      level: "PhD",
      location: "London, United Kingdom",
      duration: "4 Years",
      mode: "Hybrid",
      intake: "October 2026",
      deadline: "May 20, 2026",
      commission: "15%",
      rating: "4.8",
      tuition: "45,000",
      createdAt: "18 Mar 2023",
      avatar: avatar,
    },
  ];

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setPrograms(MOCK_PROGRAMS);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mt-6 overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-default bg-card">
        <div className="relative p-6">
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
                className="bg-background w-full rounded-full border border-default px-4 py-2.5 pl-10 pr-4 text-sm text-text-muted outline-0 placeholder:text-text-muted focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
              />
            </div>

            <div className="relative flex-1 sm:flex-none">
              <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-text-muted" />
              <select
                value={filterStages}
                onChange={(e) => setFilterStages(e.target.value)}
                className="bg-background w-full cursor-pointer rounded-full border border-default py-2.5 pl-10 pr-8 text-sm outline-0 focus:border-blue-500 focus:text-blue-500 focus:ring-0 focus:ring-blue-500"
              >
                <option value="all_stages">All Universities</option>
              </select>
            </div>

            <div className="relative flex-1 sm:flex-none">
              <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-text-muted" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-background w-full cursor-pointer rounded-full border border-default py-2.5 pl-10 pr-8 text-sm outline-0 focus:border-blue-500 focus:text-blue-500 focus:ring-0 focus:ring-blue-500"
              >
                <option value="all_status">All Programs</option>
              </select>
            </div>

            <div className="relative flex-1 sm:flex-none">
              <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-text-muted" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-background w-full cursor-pointer rounded-full border border-default py-2.5 pl-10 pr-8 text-sm outline-0 focus:border-blue-500 focus:text-blue-500 focus:ring-0 focus:ring-blue-500"
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
      </div>

      <div className="block">
        {/* CONTENT AREA */}
        {isLoading && (
          <Loading text="Fetching programs data..." />
        )}

        {!isLoading && programs.length === 0 && (
          <NoMessagesFound
            title="No programs found"
            subtitle="Try adjusting your search or filters."
          />
        )}

        {!isLoading && programs.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <div
                key={program.id}
                className="relative overflow-hidden rounded-md border border-default bg-card shadow-sm"
              >
                {/* Header */}
                <div className="bg-background flex h-[100px] items-center gap-4 overflow-hidden rounded-t-lg border-b border-default p-4">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border bg-white">
                    <Image
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                      src={program.avatar}
                      alt="Program Avatar"
                    />
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <h3 className="text-md line-clamp-2 font-semibold text-text-primary">
                      {program.title}
                    </h3>
                    <p className="text-xsm mt-1 truncate text-text-muted">
                      {program.university}
                    </p>
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
                      <span className="text-text-muted">{program.level}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <MdLocationOn className="h-4 w-4" />
                        <span>Location</span>
                      </div>
                      <span className="text-text-muted">
                        {program.location}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <MdAccessTime className="h-4 w-4" />
                        <span>Duration</span>
                      </div>
                      <span className="text-text-muted">
                        {program.duration}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <MdSchool className="h-4 w-4" />
                        <span>Mode of Study</span>
                      </div>
                      <span className="text-text-muted">{program.mode}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <MdOutlineDateRange className="h-4 w-4" />
                        <span>Next Intake</span>
                      </div>
                      <span className="text-text-muted">{program.intake}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <MdOutlineDateRange className="h-4 w-4" />
                        <span>Deadline</span>
                      </div>
                      <span className="text-text-muted">
                        {program.deadline}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 border-t border-gray-200 px-6 py-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-sm font-semibold text-black">
                      <BadgePercent className="h-4 w-4" />
                      <span>{program.commission}</span>
                    </div>
                    <span className="text-xs text-text-muted">Commission</span>
                  </div>

                  <div className="border-l border-gray-200">
                    <div className="flex items-center justify-center gap-1 text-sm font-semibold text-black">
                      <MdStar className="h-4 w-4" />
                      <span>{program.rating}</span>
                    </div>
                    <span className="text-xs text-text-muted">Rate</span>
                  </div>

                  <div className="border-l border-gray-200">
                    <div className="text-sm font-semibold text-black">
                      {program.tuition}
                    </div>
                    <span className="text-xs text-text-muted">Tuition</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-background flex justify-between gap-3 border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center text-xs text-text-muted">
                    <span className="uppercase tracking-wide">Created</span>
                    <span className="ml-2 font-medium text-black">
                      {program.createdAt}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/partner/knowledgeHub/${program.id}`}
                      className="flex items-center justify-center rounded-full border border-blue-600 p-2 text-blue-600 transition hover:border-blue-700 hover:text-blue-700"
                      title="View Details"
                    >
                      <MdMenuBook className="h-5 w-5" />
                    </Link>

                    <button className="rounded-full border border-green-600 bg-green-50 p-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeHubCards;
