"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, GraduationCap, MoreVertical} from 'lucide-react';

import { useUniversityDetails } from "hooks/knowledge-hub/config-universities/useUniversityDetails";

import Loading from "components/loading/Loading";

import EmptyData from 'components/emptyData/EmptyTableData';

interface UniversityDetailsProps {
  id: string;
}

const UniversityDetails = ({ id }: UniversityDetailsProps) => {
  const router = useRouter();

  const { university, loading, error } = useUniversityDetails(id);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);


  const handleBack = () => {
    router.push("/admin/config-universities");
  };

  const handleUpdate = () => {
    router.push(`/admin/config-universities/${id}/edit`);
  };

  if (loading) {
    return <Loading text="Loading university details..." />;
  }

  if (error) {
    return <EmptyData />;
  }

  if (!university) {
    return <EmptyData  />;
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
                  {university?.name || "Not provided"}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdownId(
                      openDropdownId === university.id ? null : university.id,
                    )
                  }
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition-all hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  Actions
                  <MoreVertical className="h-4 w-4" />
                </button>

                {openDropdownId === university.id && (
                  <div
                    className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white ring-1 ring-black/5">
                    <div className="space-y-2 p-2">
                      <button
                        aria-label="Update Program Details"
                        className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-amber-200 hover:bg-amber-50 hover:shadow-sm"
                        onClick={handleUpdate}
                      >
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-200">
                          <Clock className="h-4 w-4" />
                        </div>

                        <span className="font-semibold text-slate-900">
                          Update Details
                        </span>
                      </button>

                      <button
                        aria-label="Back to Programs"
                        className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                        onClick={handleBack}
                      >
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-200">
                          <ChevronLeft className="h-4 w-4" />
                        </div>

                        <span className="font-semibold text-slate-900">
                          Back to Programs
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="px-6 py-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Overview
            </h3>

            <div className="grid grid-cols-1 ">

              <p className="text-xs text-slate-500">
                {university.description
                  ? university.description
                  : "Not Provided"}
              </p>

            </div>

          </div>

          <div className="border-t border-gray-200 px-6 py-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Required Fields
            </h3>

            {!university || university.required_fields.length === 0 ? (
              <p className="text-sm text-slate-500">
                No required fields configured.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {university.required_fields.map((field) => (
                  <div
                    key={field.id}
                    className="rounded-md border border-gray-200 bg-gray-50 p-3"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {field.field_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Key: {field.field_key}
                    </p>
                    <p className="text-xs text-slate-500">
                      Required: {field.is_required ? "Yes" : "No"}
                    </p>
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
