"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  GraduationCap,
  FileCheck,
  Pencil,
} from "lucide-react";

import { useUniversityTypeDetails } from "features/universities/hooks";

import Loading from "components/ub/feedback/Loading";
import EmptyData from "components/ub/feedback/EmptyTableData";
import Button from "components/ub/core/Button";

interface UniversityDetailsProps {
  id: string;
}

const UniversityConfigDetails = ({ id }: UniversityDetailsProps) => {
  const router = useRouter();

  const { university, loading, error } = useUniversityTypeDetails(id);

  const handleBack = () => {
    router.push("/admin/config-universities");
  };

  if (loading) {
    return <Loading text="Loading university details..." />;
  }

  if (error || !university) {
    return <EmptyData />;
  }

  return (
    <>
      <div className="mt-6 max-w-5xl mx-auto">
        <div className="rounded-md border bg-white shadow-sm">

          <div className="flex items-center gap-4 border-b p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{university?.name || "Not provided"}</h2>
            </div>
          </div>

          <div className="px-6 py-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Overview</h3>
            <p className="text-xs text-slate-500">
              {university.description ? university.description : "Not Provided"}
            </p>
          </div>

          <div className="border-t border-slate-200 px-6 py-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Required Fields Configuration
              </h3>
              <div className="text-xs text-slate-500">
                {university?.required_fields?.filter((f) => f.is_required).length || 0} Required •{" "}
                {university?.required_fields?.filter((f) => !f.is_required).length || 0} Optional
              </div>
            </div>

            {!university || university.required_fields.length === 0 ? (
              <p className="text-sm text-slate-500">No field configuration available.</p>
            ) : (
              <>
                <div className="mb-8">
                  <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-900">
                    Required Fields
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {university.required_fields
                      ?.filter((field) => field.is_required)
                      .map((field) => (
                        <div
                          key={field.id}
                          className="group relative rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-slate-300 hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-500 transition group-hover:bg-blue-100">
                                <FileCheck className="h-4 w-4" />
                              </span>
                              <p className="truncate text-sm font-semibold text-slate-900">{field.field_name}</p>
                            </div>
                            <span className="shrink-0 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                              Required
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Optional Fields
                  </h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {university.required_fields
                      .filter((field) => !field.is_required)
                      .map((field) => (
                        <div
                          key={field.id}
                          className="group relative rounded-lg border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-slate-300 hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                                <FileText className="h-4 w-4" />
                              </span>
                              <p className="truncate text-sm font-semibold text-slate-900">{field.field_name}</p>
                            </div>
                            <span className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                              Optional
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
            <Button
              onClick={handleBack}
              icon={<ChevronLeft className="h-5 w-5" />}
              text="Back"
              bgColor="bg-white"
              textColor="text-slate-600"
              borderColor="border-slate-300"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-400"
              className="flex-1 hover:bg-slate-50"
            />
            <Button
              onClick={() => router.push(`/admin/config-universities/${id}/edit`)}
              icon={<Pencil className="h-5 w-5" />}
              text="Edit Type"
              bgColor="bg-blue-600"
              textColor="text-white"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-white"
              hoverBorderColor="hover:border-blue-700"
              className="flex-1 hover:bg-blue-700"
            />
          </div>

        </div>
      </div>
    </>
  );
};

export default UniversityConfigDetails;
