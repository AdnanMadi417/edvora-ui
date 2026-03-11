"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  CreditCard,
  GraduationCap,
  MoreVertical,
  Settings,
} from "lucide-react";
import { useUniversityDetails } from "hooks/knowledge-hub/universities/useUniversitiesDetails";
import { useUniversityPaymentMethods } from "hooks/knowledge-hub/universities/payment-methods/useUniversityPaymentMethods";
import Loading from "../../../../loading/Loading";
import { MdEvent, MdLocationCity, MdPublic } from "react-icons/md";
import EmptyData from "../../../../emptyData/EmptyTableData";
import UpdateUniversityType from "components/admin/KnowledgeHub/university/popups/UpdateUniversityType";
import AssignPaymentMethods from "components/admin/KnowledgeHub/university/popups/AssignPaymentMethods";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface UniversityDetailsProps {
  id: string;
}

const UniversityDetails = ({ id }: UniversityDetailsProps) => {
  const router = useRouter();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [isUniversityTypeModalOpen, setIsUniversityTypeModalOpen] =
    useState(false);
  const [isPaymentMethodsModalOpen, setIsPaymentMethodsModalOpen] =
    useState(false);
  const [activeUniversity, setActiveUniversity] = useState<any>(null);

  const { universityPaymentMethods, loading } = useUniversityPaymentMethods(id);

  const { university, branches, universityLoading } = useUniversityDetails(id);

  const handleBack = () => {
    router.push("/admin/universities");
  };

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
                <h2 className="text-lg font-semibold">{university.name}</h2>
                <p className="text-sm text-slate-500">{university.country}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdownId(
                      openDropdownId === university.id ? null : university.id
                    )
                  }
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition-all hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  Actions
                  <MoreVertical className="h-4 w-4" />
                </button>

                {openDropdownId === university.id && (
                  <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white ring-1 ring-black/5">
                    <div className="space-y-2 p-2">
                      <button
                        aria-label="Update Program Details"
                        className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-amber-200 hover:bg-amber-50 hover:shadow-sm"
                        onClick={() => {
                          setActiveUniversity(university);
                          setIsUniversityTypeModalOpen(true);
                        }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-200">
                          <Settings className="h-4 w-4" />
                        </div>

                        <span className="font-semibold text-slate-900">
                          Assign University Type
                        </span>
                      </button>

                      <button
                        aria-label="Assign Payment Methods"
                        className="group flex w-full items-center gap-3 rounded-md border border-transparent  px-4 py-3 text-left text-sm transition-all hover:border-blue-200 hover:bg-blue-100 hover:shadow-sm"
                        onClick={() => {
                          setActiveUniversity(university);
                          setIsPaymentMethodsModalOpen(true);
                        }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 transition-colors group-hover:bg-blue-200">
                          <CreditCard className="h-4 w-4" />
                        </div>

                        <span className="font-semibold text-slate-900">
                          Assign Payment Methods
                        </span>
                      </button>

                      <button
                        aria-label="Back to Programs"
                        className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                        onClick={handleBack}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-200">
                          <ChevronLeft className="h-4 w-4" />
                        </div>

                        <span className="font-semibold text-slate-900">
                          Back to Universities
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                  <MdPublic className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Country</p>
                  <p className="mt-0.5 text-sm font-medium capitalize text-slate-900">
                    {university.country ? university.country : "Not Provided"}
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

          <div className="border-t border-gray-200 px-6 py-6">
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
                    className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
                  >

                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {payment.payment_method_name}
                          </p>

                          {payment.currency && (
                            <span className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                              {payment.currency}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium
          ${
            payment.is_active
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
                      >
                        {payment.is_active ? (
                          <>
                            <FaCheckCircle className="text-[12px]" />
                            Active
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="text-[12px]" />
                            Inactive
                          </>
                        )}
                      </span>
                    </div>

                    {payment.instructions && (
                      <div className="mt-4 border-t pt-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Instructions
                        </p>

                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          {payment.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <UpdateUniversityType
        isOpen={isUniversityTypeModalOpen}
        onClose={() => setIsUniversityTypeModalOpen(false)}
        universityId={activeUniversity?.id || null}
        initialData={activeUniversity}
      />

      <AssignPaymentMethods
        isOpen={isPaymentMethodsModalOpen}
        onClose={() => setIsPaymentMethodsModalOpen(false)}
        universityId={activeUniversity?.id || null}
      />
    </>
  );
};

export default UniversityDetails;
