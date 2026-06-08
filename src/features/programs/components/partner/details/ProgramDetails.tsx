"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Banknote,
  Calendar,
  CircleDollarSign,
  Award,
  GraduationCap,
  Building2,
  FileText,
  CheckCircle,
  ChevronLeft,
  Copy,
  Globe,
  MapPin,
  BookOpen,
  Languages,
  Clock,
} from "lucide-react";

import { useProgram } from "features/programs/hooks";

import Link from "next/link";
import Loading from "components/loading/Loading";
import PresignedImage from "components/ui/PresignedImage";

type RequiredDocument = {
  id: string;
  type: string;
  description: string;
  is_required_for_init: boolean | null;
  is_required_init_app_doc: boolean;
};

function DocumentsSection({ requiredDocuments }: { requiredDocuments: RequiredDocument[] }) {
  const [showOptional, setShowOptional] = useState(false);
  const isReq = (d: RequiredDocument) => d.is_required_for_init ?? d.is_required_init_app_doc;
  const required = requiredDocuments.filter(isReq);
  const optional = requiredDocuments.filter((d) => !isReq(d));

  return (
    <div className="mt-6">
      <div className="rounded-md border border-default bg-card shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Required Documents</h4>
          </div>

          {!requiredDocuments.length ? (
            <p className="mt-6 text-sm text-slate-400">No documents configured for this program.</p>
          ) : (
            <div className="mt-6 space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {required.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <FileText className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-bold text-slate-900">{doc.type}</p>
                        <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                          Required
                        </span>
                      </div>
                      {doc.description && <p className="mt-0.5 text-xs text-slate-400">{doc.description}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {optional.length > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Optional Documents</p>
                    <p className="text-xs text-slate-400">{optional.length} document{optional.length !== 1 ? "s" : ""} available</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showOptional}
                    onClick={() => setShowOptional((v) => !v)}
                    className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${showOptional ? "bg-blue-600" : "bg-slate-300"}`}
                  >
                    <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${showOptional ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              )}

              {showOptional && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {optional.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <FileText className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-sm font-bold text-slate-900">{doc.type}</p>
                          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            Optional
                          </span>
                        </div>
                        {doc.description && <p className="mt-0.5 text-xs text-slate-400">{doc.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProgramDetailsProps {
  id: string;
}

const ProgramDetails = ({ id }: ProgramDetailsProps) => {
  const router = useRouter();
  const handleBack = () => {
    router.push("/partner/knowledge-hub/");
  };

  const { program, requiredDocuments, commission, loading, error } = useProgram(id);
  const [copied, setCopied] = useState(false);

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const handleCopyAll = async () => {
    const lines: string[] = [];

    lines.push(program?.university?.name ?? "");
    lines.push(`  ${program?.name ?? ""}`);
    lines.push("");

    if (program?.duration) lines.push(`Duration: ${program.duration} year(s)`);
    if (program?.english_required_score) lines.push(`English requirement: IELTS ${program.english_required_score}`);
    lines.push("");

    if (program?.intake_dates?.length) lines.push(`Intake: ${program.intake_dates.join(",")}`);
    lines.push("");

    lines.push("Course fee for international students");
    lines.push("");
    lines.push("Yearly Tuition fees");
    lines.push("");

    (program?.yearly_fees ?? []).forEach((item) => {
      lines.push(`${getOrdinal(item.year)} year: MYR ${item.fee.toLocaleString()}`);
    });

    lines.push("");
    lines.push("");
    lines.push("Other fees");
    lines.push("");

    (program?.one_time_fees ?? []).forEach((item) => {
      lines.push(` ${item.description ?? "Fee"}: MYR ${item.fee.toLocaleString()}`);
    });

    lines.push("");
    lines.push("University fees for this course do not include 6% tax (SST)");

    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <Loading text="Loading program details..." />;
  if (error || !program) return <div className="mt-10 text-center text-sm text-slate-500">{error ?? "Program not found."}</div>;

  return (
    <div className="max-w-5xl mx-auto">

      <div className="mt-6">
        <div className="rounded-md border border-default bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">

            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={handleBack}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="relative shrink-0">
                
                <div className="h-10 w-10 overflow-hidden rounded-full sm:h-11 sm:w-11">
                  <PresignedImage
                    fileKey={program.university?.logo_file_key}
                    alt={program.university?.name}
                    className="h-full w-full object-cover"
                    fallback={
                      <div className="flex h-full w-full items-center justify-center bg-accent-light text-h6 font-medium text-blue-700">
                        {program.university?.name ? program.university.name.slice(0, 2).toUpperCase() : <Building2 className="h-5 w-5 text-blue-700" />}
                      </div>
                    }
                  />
                </div>
                
                <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${program.university?.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                  {program?.name ?? "Not Provided"}
                </h3>
                <p className="truncate text-xs text-slate-500 sm:text-sm">
                  {program?.university?.name ?? "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {commission?.amount != null && (
                <div className="rounded-md border border-green-300 bg-green-50 px-3 py-1.5 text-right shadow sm:px-4 sm:py-2">
                  <p className="hidden text-xs font-semibold uppercase tracking-wider text-green-600 sm:block">Your Earnings</p>
                  <p className="text-sm font-bold text-green-700 sm:text-base">{(commission.currency || "RM").toUpperCase()} {commission.amount.toLocaleString()}</p>
                </div>
              )}
              <button
                onClick={handleCopyAll}
                title={copied ? "Copied!" : "Copy program info"}
                className={`flex h-9 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-medium transition ${
                  copied
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-green-300 bg-green-50 p-5 text-center shadow">
          <CircleDollarSign className="h-5 w-5 text-green-600" />
          <p className="text-xs text-green-600">Commission</p>
          <p className="text-xl font-bold text-green-700">
            {commission?.amount != null ? `${(commission.currency || "RM").toUpperCase()} ${commission.amount.toLocaleString()}` : "—"}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-300 bg-white p-5 text-center shadow">
          <Banknote className="h-5 w-5 text-slate-400" />
          <p className="text-xs text-slate-500">First Year</p>
          <p className="text-xl font-bold text-slate-800">
            {program?.yearly_fees?.[0]?.fee != null ? `RM ${program.yearly_fees[0].fee.toLocaleString()}` : "—"}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-300 bg-white p-5 text-center shadow">
          <Clock className="h-5 w-5 text-slate-400" />
          <p className="text-xs text-slate-500">Duration</p>
          <p className="text-xl font-bold text-slate-800">
            {program?.duration ? `${program.duration} Years` : "—"}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-300 bg-white p-5 text-center shadow">
          <Calendar className="h-5 w-5 text-slate-400" />
          <p className="text-xs text-slate-500">Next Intake</p>
          <p className="text-xl font-bold text-slate-800">
            {program?.intake_dates?.[0] ?? "—"}
          </p>
        </div>

      </div>

      <div className="mt-4">
        <div className="rounded-md border border-default bg-card shadow-sm">
          <div className="p-6">
            <h4 className="mb-5 text-base font-bold text-slate-900">Program Details</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <Globe className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Country</p>
                  <p className="text-sm font-semibold text-slate-900">{program?.university?.country ?? "Not Provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <MapPin className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Location</p>
                  <p className="text-sm font-semibold text-slate-900">{program?.branch?.state ?? "Not Provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <BookOpen className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Level</p>
                  <p className="text-sm font-semibold text-slate-900">{program?.qualification_level ?? "Not Provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <GraduationCap className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Field</p>
                  <p className="text-sm font-semibold text-slate-900">{program?.field_of_study?.name ?? "Not Provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <Building2 className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Campus</p>
                  <p className="text-sm font-semibold text-slate-900">{program?.is_on_campus ? "On-Campus" : "Online"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <Languages className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">English</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {program?.english_required_score ? `IELTS ${program.english_required_score}` : "Not Provided"}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="rounded-md border border-default bg-card shadow-sm">

          <div className="px-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Tuition Fees</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 border-b border-gray-200 p-6 md:grid-cols-2">
            <div>
              <h4 className="text-base tracking-tight text-slate-600">Per Year</h4>
              <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
                <div className="grid grid-cols-2 bg-slate-50">
                  <div className="flex items-center gap-3 px-5 py-4 text-xs font-semibold text-slate-800 md:text-sm">Year</div>
                  <div className="flex items-center gap-3 px-5 py-4 font-semibold text-slate-800 md:justify-end md:text-sm">Tuition Fee</div>
                </div>
                <div className="overflow-hidden">
                  {program?.yearly_fees?.length ? (
                    program.yearly_fees.map((item, index) => (
                      <div key={index} className="grid grid-cols-2 border-t border-slate-100 transition hover:bg-slate-50">
                        <div className="px-5 py-4 text-xs text-slate-700 md:text-sm">Year {item.year}</div>
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
              <h4 className="text-base tracking-tight text-slate-600">Other Fees</h4>
              <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
                <div className="grid grid-cols-2 bg-slate-50">
                  <div className="flex items-center gap-3 px-5 py-4 text-xs font-semibold text-slate-800 md:text-sm">Fees Type</div>
                  <div className="flex items-center gap-3 px-5 py-4 text-sm font-semibold text-slate-800 md:justify-end">Amount</div>
                </div>
                <div className="overflow-hidden">
                  {program?.one_time_fees?.length ? (
                    program.one_time_fees.map((item, index) => (
                      <div key={index} className="grid grid-cols-2 border-t border-slate-100 transition hover:bg-slate-50">
                        <div className="px-5 py-4 text-xs text-slate-700 md:text-sm">{item.description ?? "Fee"}</div>
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

        </div>
      </div>

      <div className="mt-6">
        {program?.has_scholarship && program?.scholarships?.length > 0 && (
          <div className="rounded-md shadow-sm border border-amber-300 bg-amber-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Scholarships & Discounts</h4>
                  <p className="text-xs text-slate-500">{program.scholarships.length} available</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 select-none">
                <span>&#8249;</span>
                <span>Scroll</span>
                <span>&#8250;</span>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {program.scholarships.map((item, index) => (
                <div
                  key={item.id ?? index}
                  className="flex w-72 shrink-0 flex-col gap-3 rounded-xl border border-amber-100 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-sm font-bold text-slate-900">{item.name}</h5>
                    {item.coverage_percent > 0 && (
                      <span className="shrink-0 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white">
                        {item.coverage_percent}%
                      </span>
                    )}
                  </div>
                  {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                  {item.max_amount > 0 && (
                    <p className="text-base font-bold text-amber-600">Up to RM {item.max_amount.toLocaleString()}</p>
                  )}
                  {item.conditions && item.conditions.length > 0 && (
                    <div className="border-t border-slate-100 pt-3">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                        </svg>
                        Conditions
                      </p>
                      <ul className="space-y-1.5">
                        {item.conditions.map((condition, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                            {condition}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <DocumentsSection requiredDocuments={requiredDocuments} />

      <div className="mt-6">
        <div className="rounded-xl border border-green-300 bg-green-50 p-6 shadow">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-green-200">
              <CircleDollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-base font-bold text-green-900">Your Commission</p>
              <p className="mt-1 text-3xl font-bold text-green-700">
                {(commission?.currency || "RM").toUpperCase()} {commission?.amount?.toLocaleString() ?? "—"}
              </p>
              <div className="mt-3 space-y-1.5">
                {commission?.notes && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>{commission.notes}</span>
                  </div>
                )}
                {(commission?.expected_commission_from || commission?.expected_commission_to) && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>
                      Expected to be paid between {commission?.expected_commission_from ?? "-"} – {commission?.expected_commission_to ?? "-"} months
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Link
            href={{
              pathname: "/partner/applications/apply-for-program",
              query: {
                program_id: program.id,
                university_id: program.university.id,
                intake_date:
                  program.intake_dates?.[0] ??
                  program.university.intake_months?.[0] ??
                  "",
              },
            }}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <CheckCircle className="h-4 w-4" />
            Apply for This Program
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetails;
