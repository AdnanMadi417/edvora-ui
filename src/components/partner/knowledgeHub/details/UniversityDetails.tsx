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
  MdGroups,
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
} from "lucide-react";
import CardHeader from "../../../ui/card/CardHeader";
import Link from "next/link";
import { useProgram } from "../../../../hooks/programs/useProgram";
import Loading from "../../../loading/Loading";

interface UniversityDetailsProps {
  id: string;
}

const UniversityDetails = ({ id }: UniversityDetailsProps) => {
  const router = useRouter();
  const handleBack = () => {
    router.push("/partner/knowledgeHub/");
  };

  const commissionLabel = {
    one_time_per_year: "One-time (Yearly)",
    monthly: "Monthly",
    per_student: "Per Student",
    percentage: "Percentage",
  };

  const { program, requiredDocuments, commission,} = useProgram(id);

  if (!program) return <Loading text="Loading program details..." />;

  return (
    <>
      <div className="mt-6">
        <div className="rounded-md border border-default bg-card shadow-sm">
          <div className="flex justify-between border-b border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="flex  h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 shadow-sm">
                  <GraduationCap className="h-5 w-5 md:h-8 md:w-8 text-white" />
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
                <h3 className="line-clamp-2 text-lg font-semibold text-text-primary">
                  {program?.name ?? "Not Provided"}
                </h3>
                <p className="mt-1 break-words text-sm text-text-muted">
                  {program?.university?.name ?? "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
              <button
                onClick={handleBack}
                className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Back to Programs</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-text-muted shadow-sm">
                <MdPublic className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted">Country</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-text-primary">
                  {program?.university?.country ?? "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-text-muted shadow-sm">
                <MdLocationCity className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted">State / Province</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-text-primary">
                  {program?.university?.state ?? "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-text-muted shadow-sm">
                <MdMenuBook className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted">Level</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-text-primary">
                  {program?.qualification_level ?? "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-text-muted shadow-sm">
                <MdSchool className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted">Field / Faculty</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-text-primary">
                  {program?.field_of_study?.name ?? "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-text-muted shadow-sm">
                <MdAccessTime className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted">Duration</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-text-primary">
                  {program?.duration
                    ? `${program.duration} years`
                    : "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-text-muted shadow-sm">
                <MdEvent className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-text-muted">Intake Dates</p>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-text-primary">
                  {program?.university.intake_months?.length ? (
                    program.university.intake_months.map((date, index) => (
                      <span
                        key={`${date}-${index}`}
                        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 transition hover:border-green-600"
                      >
                        <span className="h-2 w-2 rounded-full border-2 border-green-600" />
                        <span className="text-xs font-medium text-text-primary">
                          {date}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-medium capitalize text-text-primary">
                      Not Provided
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-text-muted shadow-sm">
                <MdLocationCity className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted">Campus</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-text-primary">
                  {program?.is_on_campus ? "On-campus" : "Online"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-text-muted shadow-sm">
                <MdPublic className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted">City / Country</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-text-primary">
                  {program?.university
                    ? `${program.university.name}, ${program.university.country}`
                    : "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-text-muted shadow-sm">
                <MdGroups className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted">Class Type</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-text-primary">
                  {program?.is_online ? "Online" : "On-campus (Physical)"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-text-muted shadow-sm">
                <MdLanguage className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted">English Requirement</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-text-primary">
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

          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-gray-200 p-6 gap-4 items-start">

            <div>
              <div className="min-w-0">
                <h4 className="text-base font-semibold tracking-tight text-slate-900">
                  Tuition Fee
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  A transparent overview of tuition fees.
                </p>
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
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  All fees listed are paid directly to the university or government
                </p>
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

          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <Award className="h-5 w-5 text-blue-600" />
              </span>

              <div className="min-w-0">
                <h4 className="text-base font-semibold tracking-tight text-slate-900">
                  Scholarships & Discounts
                </h4>
                <p className="felx mt-1 gap-2 text-sm leading-relaxed text-slate-500">
                  Explore available scholarships and tuition discounts
                </p>
              </div>
            </div>

            {program?.has_scholarship && program.scholarships.length > 0 ? (
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
                          RM {item.max_amount.toLocaleString()}{" "}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="col-span-2 px-5 py-4 text-center text-xs text-slate-500 md:text-sm">
                No scholarship available
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
              </span>

              <div className="min-w-0">
                <h4 className="text-base font-semibold tracking-tight text-slate-900">
                  Entry Requirements
                </h4>
                <p className="felx mt-1 gap-2 text-sm leading-relaxed text-slate-500">
                  Review all academic and admission requirements.
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
                      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 sm:text-sm">
                        <CheckCircle className="h-3 w-3" />
                        Required
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
                RM {commission?.rate?.toLocaleString() ?? 0}
              </span>
              <p className="text-sm font-semibold text-indigo-900">
                Commission Rate
              </p>
              <span className="absolute right-3 top-3 h-2 w-2 animate-pulse rounded-full bg-indigo-600" />
            </div>

            <div className="relative flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-md transition-transform">
              <span className="text-2xl font-bold text-green-700">

                {commissionLabel[commission?.type] || "Not Provided"}

              </span>
              <p className="text-sm font-semibold text-green-900">
                Commission Type
              </p>
              <span className="absolute right-3 top-3 h-2 w-2 animate-pulse rounded-full bg-green-600" />
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
                  "Commission paid 30 days after the student completes the first semester of each academic year."}
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
