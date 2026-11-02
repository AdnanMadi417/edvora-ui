"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronLeft,
  EyeOff,
  GraduationCap,
  Languages,
  Pencil,
} from "lucide-react";
import Button from "components/ub/core/Button";
import PresignedImage from "components/ub/data/PresignedImage";
import RichTextDisplay from "components/ub/data/RichTextDisplay";
import { FaTimesCircle } from "react-icons/fa";
import { MdEvent, MdLocationCity, MdPublic } from "react-icons/md";
import { HiOutlineCheckCircle } from "react-icons/hi";

import { useUniversityDetails, useUniversityPaymentMethods } from "features/universities/hooks";
import { monthLabel } from "features/programs/utils/intakeMonths";

import Loading from "components/ub/feedback/Loading";
import EmptyData from "components/ub/feedback/EmptyTableData";

interface UniversityDetailsProps {
  id: string;
  basePath?: string;
}

const UniversityDetails = ({ id, basePath = "/admin/universities" }: UniversityDetailsProps) => {
  const router = useRouter();

  const { universityPaymentMethods, loading } = useUniversityPaymentMethods(id);

  const { university, branches, universityLoading } = useUniversityDetails(id);

  const handleBack = () => {
    router.push(basePath);
  };

  if (universityLoading) {
    return <Loading text="Loading university details..." />;
  }

  if (!university ) {
    return <EmptyData />;
  }

  return (
    <>
      <div className="mt-6 max-w-ub-dashboard mx-auto">
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="flex justify-between border-b p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg">
                <PresignedImage
                  fileKey={university.logo_file_key}
                  alt={university.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-200 ring-offset-2 shadow-sm"
                  fallback={
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                  }
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold">{university.name}</h2>
                <p className="text-sm text-slate-500">{university.country}</p>
              </div>
            </div>


          </div>

          <div className="px-6 py-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Overview
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 shadow-sm">
                  <MdPublic className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Country</p>
                  <p className="mt-0.5 text-sm font-medium capitalize text-slate-900">
                    {university.country ? university.country : "Not Provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 shadow-sm">
                  <MdEvent className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Intake Months</p>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-slate-900">
                    {university?.intake_months?.length ? (
                      university.intake_months.map((month, index) => (
                        <span
                          key={`${month}-${index}`}
                          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 transition"
                        >
                          <span className="h-2 w-2 rounded-lg border-2 border-green-600" />
                          <span className="text-xs font-medium text-slate-900">
                            {monthLabel(month, false)}
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

              <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 shadow-sm">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Institution Type</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-900">
                    {university.is_public ? "Public" : "Private"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 shadow-sm">
                  <Languages className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Language Center</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-900">
                    {university.has_language_center ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 shadow-sm">
                  <EyeOff className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Visibility</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-900">
                    {university.is_hidden ? "Hidden from advisors" : "Visible to advisors"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 px-6 py-6">
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
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
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

          <div className="border-t border-slate-200 px-6 py-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Payment Methods
            </h3>

            {universityPaymentMethods.length === 0 ? (
              <p className="text-sm text-slate-500">No Payment Method found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {universityPaymentMethods.map((payment) => (
                  <div
                    key={payment.id}
                    className="group relative cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {payment.payment_method_name}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`flex items-center gap-1 p-1 text-xs font-medium
                          ${
                            payment.is_active
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                      >
                        {payment.is_active ? (
                          <>
                            <HiOutlineCheckCircle className=" w-5 h-5" />
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="w-5 h-5" />
                          </>
                        )}
                      </span>
                    </div>

                    {payment.instructions && (
                      <div className="mt-4 border-t pt-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Instructions
                        </p>

                        <RichTextDisplay html={payment.instructions} className="mt-1 text-xs" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
              onClick={() => router.push(`${basePath}/${id}/edit`)}
              icon={<Pencil className="h-5 w-5" />}
              text="Edit University"
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

export default UniversityDetails;
