"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  MdMenuBook,
  MdSchool,
  MdAccessTime,
  MdEvent,
  MdLocationCity,
  MdPublic,
  MdLanguage,
  MdStar,
} from "react-icons/md";
import {
  CreditCard,
  Banknote,
  Calendar,
  Layers,
  CircleDollarSign,
  Award,
  ClipboardCheck,
  GraduationCap,
  FileText,
  CheckCircle,
  Percent,
  ChevronLeft,
 Copy } from "lucide-react";
import { useProgram } from "hooks/knowledge-hub/programs/useProgram";

import Link from "next/link";
import CardHeader from "components/ui/card/CardHeader";
import Loading from "components/loading/Loading";

interface UniversityDetailsProps {
  id: string;
}

const UniversityDetails = ({ id }: UniversityDetailsProps) => {
  const router = useRouter();
  const handleBack = () => {
    router.push("/partner/knowledgeHub/");
  };

  const { program, requiredDocuments, commission } = useProgram(id);

  const handleCopyAll = async () => {
    const text = `
    Program: ${program?.name ?? "-"}
    University: ${program?.university?.name ?? "-"}
    Country: ${program?.university?.country ?? "-"}
    State: ${program?.branch?.state ?? "-"}
    Level: ${program?.qualification_level ?? "-"}
    Field: ${program?.field_of_study?.name ?? "-"}
    Duration: ${program?.duration ?? "-"} years
    Study Mode: ${program?.is_on_campus ? "On-campus" : "Online"}

    Intake Dates: ${program?.intake_dates?.join(", ") ?? "-"}

    English Requirement: ${
        program?.english_required_score
          ? `Min score ${program.english_required_score}`
          : "-"
      }

    Commission: RM ${commission?.amount ?? 0}
    `;

      await navigator.clipboard.writeText(text);
    };

  if (!program) return <Loading text="Loading program details..." />;

  return (
    <>
      <div className="mt-6">
        <div className="rounded-md border border-default bg-card shadow-sm">
          <div className="flex justify-between border-b border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="flex  h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 shadow-sm md:h-14 md:w-14">
                  <GraduationCap className="h-5 w-5 text-white md:h-8 md:w-8" />
                </div>

                <span
                  className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white ${
                    program.field_of_study?.is_active
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                />
              </div>

              <div className="min-w-0">
                <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
                  {program?.name ?? "Not Provided"}
                </h3>
                <p className="mt-1 break-words text-sm text-slate-500">
                  {program?.university?.name ?? "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-6">
              <button
                onClick={handleBack}
                className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Back to Programs</span>
              </button>

                  <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-2 p-2 text-sm text-slate-600 bg-salte-50 transitions hover:text-slate-700 hover:bg-slate-100 rounded-full"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                <MdPublic className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Country</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-slate-900">
                  {program?.university?.country ?? 'Not Provided'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                <MdLocationCity className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">State / Province</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-slate-900">
                  {program && program.branch ? program.branch.state : "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                <MdMenuBook className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Level</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-slate-900">
                  {program?.qualification_level ?? "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                <MdSchool className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Field / Faculty</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-slate-900">
                  {program?.field_of_study?.name ?? "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                <MdAccessTime className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Duration</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-slate-900">
                  {program?.duration
                    ? `${program.duration} years`
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
                  {program?.intake_dates?.length ? (
                    program.intake_dates.map((date, index) => (
                      <span
                        key={`${date}-${index}`}
                        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 transition hover:border-green-600"
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

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                <MdLocationCity className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Campus / Online</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-slate-900">
                  {program?.is_on_campus ? "On-campus" : "Online"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                <MdPublic className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">City </p>
                <p className="mt-0.5 text-sm font-medium capitalize text-slate-900">
                  {program?.university
                    ? `${program.university.country}`
                    : "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                <MdLanguage className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">English Requirement</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-slate-900">
                  {program?.english_required_score
                    ? `Min score: ${program.english_required_score}`
                    : "Not Provided"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="rounded-md border border-default bg-card shadow-sm">
          <CardHeader
            icon={CreditCard}
            title="Fees & Academic Requirements"
            description="Comprehensive overview of tuition fees, mandatory one-time costs, available scholarships, and all academic entry requirements for program enrollment."
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />

          <div className="grid grid-cols-1 items-start gap-4 border-b border-gray-200 p-6 md:grid-cols-2">
            <div>
              <div className="min-w-0">
                <h4 className="text-base font-semibold tracking-tight text-slate-900">
                  Tuition Fee
                </h4>
              </div>

              <div className="mt-6 overflow-hidden rounded-md border border-slate-200">
                <div className="grid grid-cols-2 bg-blue-50">
                  <div className="flex items-center gap-3 px-5 py-4 text-xs font-semibold text-slate-800 md:text-sm">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Year / Semester
                  </div>
                  <div className="flex items-center gap-3 px-5 py-4 font-semibold text-slate-800 md:justify-end md:text-sm">
                    <Banknote className="h-4 w-4 text-blue-600" />
                    Tuition Fee
                  </div>
                </div>

                <div className="overflow-hidden">
                  {program?.yearly_fees?.length ? (
                    program.yearly_fees.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-2 border-t border-slate-100 transition hover:bg-slate-50"
                      >
                        <div className="px-5 py-4 text-xs text-slate-700 md:text-sm">
                          Year {item.year}
                        </div>
                        <div className="px-5 py-4 text-xs font-medium text-slate-900 md:text-right md:text-sm">
                          RM {item.fee.toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 px-5 py-4 text-center text-xs text-slate-500 md:text-sm">
                      No yearly fees available
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="min-w-0">
                <h4 className="text-base font-semibold tracking-tight text-slate-900">
                  Other Mandatory Fees
                </h4>
              </div>

              <div className="mt-6 overflow-hidden rounded-md border border-slate-200">
                <div className="grid grid-cols-2 bg-blue-50">
                  <div className="flex items-center gap-3 px-5 py-4 text-xs font-semibold text-slate-800 md:text-sm">
                    <Layers className="h-4 w-4 text-blue-600" />
                    Fees Type
                  </div>
                  <div className="flex items-center gap-3 px-5 py-4 text-sm font-semibold text-slate-800 md:justify-end">
                    <CircleDollarSign className="h-4 w-4 text-blue-600" />
                    Amount
                  </div>
                </div>

                <div className="overflow-hidden">
                  {program?.one_time_fees?.length ? (
                    program.one_time_fees.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-2 border-t border-slate-100 transition hover:bg-slate-50"
                      >
                        <div className="px-5 py-4 text-xs text-slate-700 md:text-sm">
                          {item.description ?? "Fee"}
                        </div>
                        <div className="px-5 py-4 text-xs font-medium text-slate-900 md:text-right md:text-sm">
                          RM {item.fee.toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 px-5 py-4 text-center text-xs text-slate-500 md:text-sm">
                      No one-time fees available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {program?.has_scholarship && program?.scholarships?.length > 0 && (
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                  <Award className="h-5 w-5 text-blue-600" />
                </span>

                <div className="min-w-0">
                  <h4 className="text-base font-semibold tracking-tight text-slate-900">
                    Scholarships & Discounts
                  </h4>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {program.scholarships.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0">
                        <h5 className="text-sm font-semibold text-slate-900">
                          {item.name}
                        </h5>

                        <p className="mt-1 text-xl font-bold text-blue-600">
                          {item.max_amount > 0 && `Up to RM ${item.max_amount.toLocaleString()}`}
                          {item.max_amount > 0 && item.coverage_percent > 0 && " • "}
                          {item.coverage_percent > 0 && `${item.coverage_percent}% coverage`}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
              </span>

              <div className="min-w-0">
                <h4 className="text-base font-semibold tracking-tight text-slate-900">
                  Required Entry Documents
                </h4>
                <p className="felx mt-1 gap-2 text-sm leading-relaxed text-slate-500">
                   Review the documents needed for admission.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {requiredDocuments.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-start gap-4 rounded-md border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:bg-blue-50/30"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 group-hover:bg-blue-100">
                      <FileText className="h-5 w-5 text-slate-600 group-hover:text-blue-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.description ?? item.type ?? "Document"}
                      </p>

                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium sm:text-sm
                          ${
                            item.is_required_init_app_doc
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-gray-200 bg-gray-50 text-gray-600"
                          }`}
                        >
                          <CheckCircle className="h-3 w-3" />
                          {item.is_required_init_app_doc ? "Required" : "Optional"}
                        </span>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500/80 via-blue-600/80 to-indigo-700/80" />

          <CardHeader
            icon={Percent}
            title="Partner Commission"
            description=" Commission structure and earnings overview"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 shadow-md transition-transform">
              <span className="text-3xl font-bold text-indigo-700">
                RM {commission?.amount?.toLocaleString() ?? 0}
              </span>
              <p className="text-sm font-semibold text-indigo-900">
                Commission amount
              </p>
              <span className="absolute right-3 top-3 h-2 w-2 animate-pulse rounded-full bg-indigo-600" />
            </div>

          </div>

          <div className="mx-6 mb-6 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 shadow-inner">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <MdStar className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-yellow-800">
                Special Notes
              </h5>
              <p className="mt-1 text-sm text-yellow-700">
                {commission?.notes ??
                  "Commission is generally paid within around 3 months, once the university completes its confirmation and payment process."}
              </p>
            </div>
          </div>

          <div
            className="mx-6 mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 shadow-inner">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <MdStar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-green-800">
                Expected Commission Timeline
              </h5>

              <p className="mt-1 text-sm text-green-700">
                {commission.expected_commission_from || commission.expected_commission_to ? (
                  <>
                    Commission is expected between{" "}
                    {commission.expected_commission_from ?? "—"} and{" "}
                    {commission.expected_commission_to ?? "—"} months.
                  </>
                ) : (
                  "Expected commission timeline not provided."
                )}
              </p>
            </div>
          </div>

          <div className="flex justify-end p-6">
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
              className="flex items-center justify-center gap-2 rounded-full border border-green-600 bg-green-100 px-4 py-2 text-sm font-medium text-green-700 shadow-md transition-transform hover:scale-105 hover:border-green-700 hover:bg-green-200 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default UniversityDetails;
