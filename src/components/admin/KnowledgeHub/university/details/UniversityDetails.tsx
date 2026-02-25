"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, GraduationCap } from "lucide-react";
import { useUniversityDetails } from "hooks/knowledge-hub/universities/useUniversitiesDetails";
import Loading from "../../../../loading/Loading";
import { MdEvent, MdLocationCity, MdPublic } from 'react-icons/md';
import EmptyData from '../../../../emptyData/EmptyTableData';

interface UniversityDetailsProps {
  id: string;
}

const UniversityDetails = ({ id }: UniversityDetailsProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.push("/admin/universities");
  };

  const { university, branches, universityLoading } =
    useUniversityDetails(id);

  if (universityLoading) {
    return <Loading text="Loading university details..." />;
  }

  if (!university) {
    return <EmptyData />;
  }

  return (
    <>

      <div className="mt-6">
        <div className="rounded-md border bg-card shadow-sm">
          <div className="flex justify-between border-b p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  {university.name}
                </h2>
                <p className="text-sm text-slate-500">
                  {university.country}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
              <button
                onClick={handleBack}
                className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Back to universities</span>
              </button>

            </div>
          </div>

          <div className="px-6 py-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Overview
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                  <MdPublic className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Country</p>
                  <p className="mt-0.5 text-sm font-medium capitalize text-slate-900">
                    {university.country
                      ? university.country
                      : "Not Provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                  <MdEvent className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Intake Dates</p>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-slate-900">
                    {university?.intake_months?.length ? (
                      university.intake_months.map((date, index) => (
                        <span
                          key={`${date}-${index}`}
                          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 transition"
                        >
                          <span className="h-2 w-2 rounded-full border-2 border-green-600" />
                          <span className="text-xs font-medium text-slate-900">
                            {date}
                          </span>
                        </span>
                      ))
                    ) : (
                      <span className="text-sm font-medium capitalize text-slate-900">
                        Not Provided
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="border-t border-gray-200 px-6 py-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Description
            </h3>

            <p className="text-sm leading-relaxed text-slate-700">
              {university.description || "No description provided."}
            </p>
          </div>

          <div className="border-t border-gray-200 px-6 py-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Branches
            </h3>

            {branches.length === 0 ? (
              <p className="text-sm text-slate-500">No branches found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className="rounded-md border border-gray-200 bg-gray-50 p-4 transition hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                        <MdLocationCity className="h-4 w-4 text-slate-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {branch.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {branch.location}, {branch.state}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

    </>
  );
};

export default UniversityDetails;
