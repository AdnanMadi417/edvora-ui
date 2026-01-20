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
  Scale,
  BookOpen,
  GraduationCap,
  Download,
  Eye,
  FileText,
  CheckCircle,
  MinusCircle,
  Percent,
  BadgePercent,
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

  const { program, requiredDocuments, commission, loading, error } = useProgram(id);

  if (!program) return <Loading text="Loading program details..." />;

  return (
    <>
      <div className="mt-6">
        <div className="rounded-md border border-default bg-card shadow-sm">
          <div className="flex justify-between border-b border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 shadow-sm">
                  <GraduationCap className="h-8 w-8 text-white" />
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

          <div className="p-6 pb-0">

            <h4 className="flex items-center gap-3 text-lg font-semibold text-text-primary">
              <BookOpen className="h-5 w-5 text-slate-500" />
              University Overview
            </h4>

            {program?.university?.description && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-slate-800">
                  About University
                </h5>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">
                  {program.university.description}
                </p>
              </div>
            )}

            {program?.overview && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-slate-800">
                  Program Overview
                </h5>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">
                  {program.overview}
                </p>
              </div>
            )}

            {program?.curriculum && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-slate-800">
                  Curriculum
                </h5>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">
                  {program.curriculum}
                </p>
              </div>
            )}

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
              {/* Icon */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-text-muted shadow-sm">
                <MdEvent className="h-4 w-4" />
              </div>

              {/* Content */}
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
                        <span className="font-medium capitalize text-text-primary">
                          {date}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-medium capitalize text-text-primary">Not Provided</span>
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
            title="Fees & Cost Breakdown"
            description=" A transparent overview of tuition fees, mandatory costs, and
                available scholarships."
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />

          <div className="border-b border-gray-200 p-6">
            <h4 className="flex items-center gap-3 text-lg font-semibold text-text-primary">
              <CreditCard className="h-5 w-5 text-slate-500" />
              Tuition Fees
            </h4>

            <div className="mt-6 overflow-hidden rounded-md border border-slate-200 ">
              <div className="grid grid-cols-2 bg-blue-50">
                <div className="flex items-center gap-3 px-5 py-4 text-xs font-semibold text-slate-800 md:text-sm">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Year / Semester
                </div>

                <div className="text-sx flex items-center gap-3 px-5 py-4 font-semibold text-slate-800 md:justify-end md:text-sm">
                  <Banknote className="h-4 w-4 text-blue-600" />
                  Tuition Fee
                </div>
              </div>

              <div className="overflow-hidden">

                {program?.yearly_fees && program.yearly_fees.length > 0 ? (
                  program?.yearly_fees?.map((item, index) => (
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
                  <div className="px-5 py-4 text-xs text-slate-500 md:text-sm col-span-2 text-center">
                    No yearly fees available
                  </div>
                )}

                {/* Total row */}
                {program?.yearly_fees?.length > 0 && (
                  <div className="grid grid-cols-2 border-t border-slate-200 bg-gray-50 font-semibold">
                    <div className="px-5 py-4 text-sm text-slate-700">
                      Total amount
                    </div>
                    <div className="px-5 py-4 text-sm text-slate-900 md:text-right">
                      {/*${totalFee.toLocaleString()}*/}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-gray-100 p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <Banknote className="h-5 w-5 text-blue-600" />
              </span>

              <div className="min-w-0">
                <h4 className="text-base font-semibold tracking-tight text-slate-900">
                  Other Mandatory Fees
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  All fees listed are paid directly to the university or
                  government
                </p>
              </div>
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

                {program?.one_time_fees && program.one_time_fees.length > 0 ? (
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
                  <div className="px-5 py-4 text-xs text-slate-500 md:text-sm col-span-2 text-center">
                    No one-time fees available
                  </div>
                )}

              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <Award className="h-5 w-5 text-blue-600" />
              </span>

              <div className="min-w-0">
                <h4 className="text-base font-semibold tracking-tight text-slate-900">
                  Scholarships & Discounts
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Explore available scholarships and tuition discounts
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <div className="min-w-0">
                    <h5 className="text-sm font-semibold text-slate-900">
                      Merit-based Scholarship
                    </h5>
                    <p className="mt-1 text-xl font-bold text-blue-600">
                      RM 20,000 – RM 50,000
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Minimum 3.5 GPA and exceptional academic record required
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <div className="min-w-0">
                    <h5 className="text-sm font-semibold text-slate-900">
                      Early Bird Discount
                    </h5>
                    <p className="mt-1 text-xl font-bold text-green-600">
                      RM 10,000
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Apply before{" "}
                      <span className="font-medium text-slate-700">
                        December 31, 2025
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="rounded-md border border-default bg-card shadow-sm">
          <CardHeader
            icon={ClipboardCheck}
            title="Entry Requirements"
            description="Review all academic and admission requirements."
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />

          <div className="block space-y-4 border-b border-gray-100 p-6">
            <div className="rounded-md border border-slate-200 p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </span>

                <div className="min-w-0">
                  <h5 className="text-sm font-semibold text-slate-900">
                    Academic Requirement
                  </h5>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    A Level: Minimum BBB with Mathematics and Physics or
                    equivalent alternative qualifications
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-md border border-slate-200 p-5">

              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </span>

                <div className="min-w-0">
                  <h5 className="text-sm font-semibold text-slate-900">
                    English Requirement
                  </h5>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    IELTS 6.5 (minimum 6.0 each band), TOEFL iBT 93, or
                    equivalent
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border border-dashed border-slate-300 bg-slate-50 px-5 py-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Scale className="h-4 w-4 text-slate-500" />
                  View qualification equivalency
                </div>

                <div className="flex gap-2">
                  <button
                    className="group cursor-pointer rounded-full border border-green-600 bg-green-50 p-2 text-green-600 transition-all duration-200 hover:border-green-700 hover:bg-green-100 hover:text-green-700 focus-visible:ring-2 focus-visible:ring-green-400"
                    title="View Document"
                    aria-label="View  Document"
                  >
                    <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </button>

                  <button
                    className="group cursor-pointer rounded-full border border-blue-600 bg-blue-50 p-2 text-blue-600 transition-all duration-200 hover:border-blue-700 hover:bg-blue-100 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400"
                    title="Download Document"
                    aria-label="Download Document"
                  >
                    <Download className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <FileText className="h-5 w-5 text-blue-600" />
              </span>

              <div className="min-w-0">
                <h4 className="text-base font-semibold tracking-tight text-slate-900">
                  Required Documents
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Documents required for application and enrollment
                </p>
              </div>
            </div>

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

          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 md:text-lg">
                <BadgePercent className="h-5 w-5 text-blue-600" />
                {commission?.rate ?? 0}%
              </div>
              <p className="mt-1 text-sm text-gray-900 md:text-lg">
                Commission
              </p>
            </div>

            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 md:text-lg">
                <MdStar className="h-5 w-5 text-yellow-500" />
                300RM
              </div>
              <p className="mt-1 text-sm text-gray-900 md:text-lg">
                Total Amount
              </p>
            </div>

            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center">
              <div className="text-base font-semibold text-gray-800 md:text-lg">
                {commission?.type ?? "One-time / year"}
              </div>
              <p className="mt-1 text-sm text-gray-900 md:text-lg">
                Commission Type
              </p>
            </div>
          </div>

          <div className="mx-6 mb-6 flex gap-3 rounded-md border border-orange-200 bg-orange-50 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
              <MdStar className="h-4 w-4 text-orange-600" />
            </div>

            <div>
              <h5 className="text-sm font-semibold text-orange-800">
                Special Notes
              </h5>
              <p className="mt-1 text-sm text-orange-700">
                Commission paid 30 days after the student completes the first
                semester of each academic year.
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
              className="flex items-center justify-center gap-2 rounded-full border border-green-600 bg-green-100 px-4 py-2 text-sm font-medium text-green-700 transition hover:border-green-700 hover:bg-green-200 disabled:opacity-50"
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
