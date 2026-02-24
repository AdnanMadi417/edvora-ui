"use client";

import React, { useEffect,useState } from "react";
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
  Trash2,
  ChevronLeft,
  MoreVertical,
  Clock,
} from "lucide-react";
import CardHeader from "components/ui/card/CardHeader";

import api from "lib/useApi";
import { useProgram } from "../../../../../../hooks/knowledge-hub/programs/useProgram";

import Loading from "../../../../../loading/Loading";
import InputField from '../../../../../form/InputField';
import SelectField from '../../../../../form/SelectField';
import { COUNTRIES } from '../../../../../../constants/lists';
import ToggleInput from '../../../../../form/ToggleInput';
import CheckSimpleBoxGroup from '../../../../../form/CheckSimpleBoxGroup';
import MultipleDateInput from '../../../../../form/MultipleDateInput';

interface UniversityDetailsProps {
  id: string;
}

const EditKnowledgeHubProgramDetails = ({ id }: UniversityDetailsProps) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  const router = useRouter();

  const handleBack = () => {
    router.push("/admin/knowledge-hub");
  };

  const commissionLabel = {
    one_time: "One-time",
    per_student: "Per Student",
  };

  const { program, requiredDocuments, commission } = useProgram(id);

  // useEffect(() => {
  //   if (program) {
  //     setFormData({
  //       name: program.name ?? "",
  //       country: program.branch?.map((b) => b.location) ?? [],
  //       state: program.university?.state ?? "",
  //       level: program.qualification_level ?? "",
  //       field_of_study: program.field_of_study?.id ?? "",
  //       duration: program.duration ?? "",
  //       intake_months: program.university?.intake_months ?? [],
  //       campus: program.is_on_campus ?? false,
  //       english_required_score: program.english_required_score ?? "",
  //     });
  //   }
  // }, [program]);

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

            <div className="flex items-center gap-2 sm:gap-6">
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdownId(
                      openDropdownId === program.id ? null : program.id
                    )
                  }
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition-all hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  Actions
                  <MoreVertical className="h-4 w-4" />
                </button>

                {openDropdownId === program.id && (
                  <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white ring-1 ring-black/5">
                    <div className="space-y-2 p-2">
                      <button
                        aria-label="Update Program Details"
                        className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-amber-200 hover:bg-amber-50 hover:shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProvider(program);
                        }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-200">
                          <Clock className="h-4 w-4" />
                        </div>

                        <span className="font-semibold text-slate-900">
                          Update Details
                        </span>
                      </button>

                      {/*<button*/}
                      {/*  aria-label="Delete Program"*/}
                      {/*  className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-red-200 hover:bg-red-50 hover:shadow-sm"*/}
                      {/*  onClick={(e) => {*/}
                      {/*    e.stopPropagation();*/}
                      {/*    setIsDeleteOpen(true);*/}
                      {/*    setOpenDropdownId(null);*/}
                      {/*  }}*/}

                      {/*>*/}
                      {/*  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors group-hover:bg-red-200">*/}
                      {/*    <Trash2 className="h-4 w-4" />*/}
                      {/*  </div>*/}

                      {/*  <span className="font-semibold text-red-700">*/}
                      {/*    Delete Program*/}
                      {/*  </span>*/}
                      {/*</button>*/}

                      <button
                        aria-label="Back to Programs"
                        className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                        onClick={handleBack}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-200">
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

          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">

            {/*<div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">*/}

            {/*  <InputField*/}
            {/*    label=""*/}
            {/*    field=""*/}
            {/*    placeholder={program?.name}*/}
            {/*    required*/}
            {/*    formData={}*/}
            {/*    errors={}*/}
            {/*    updateFormData={}*/}
            {/*  />*/}

            {/*  <SelectField*/}
            {/*    label=""*/}
            {/*    field=""*/}
            {/*    options={}*/}
            {/*    formData={}*/}
            {/*    errors={}*/}
            {/*    updateFormData={}*/}
            {/*  />*/}

            {/*  <ToggleInput*/}
            {/*    label=""*/}
            {/*    field=""*/}
            {/*    formData={}*/}
            {/*    errors={}*/}
            {/*    updateFormData={}*/}
            {/*  />*/}

            {/*  <CheckSimpleBoxGroup*/}
            {/*    label=""*/}
            {/*    field=""*/}
            {/*    options={}*/}
            {/*    formData={}*/}
            {/*    updateFormData={}*/}
            {/*    errors={}*/}
            {/*    required*/}
            {/*  />*/}

            {/*  <CheckSimpleBoxGroup*/}
            {/*    label=" "*/}
            {/*    field=""*/}
            {/*    options={}*/}
            {/*    formData={}*/}
            {/*    updateFormData={}*/}
            {/*    errors={}*/}
            {/*    required*/}
            {/*  />*/}

            {/*  <MultipleDateInput*/}
            {/*    label=""*/}
            {/*    field=""*/}
            {/*    required*/}
            {/*    formData={}*/}
            {/*    errors={}*/}
            {/*    updateFormData={}*/}
            {/*  />*/}

            {/*  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">*/}
            {/*    <MdPublic className="h-4 w-4" />*/}
            {/*  </div>*/}
            {/*  <div className="min-w-0">*/}
            {/*    <p className="text-xs text-slate-500">Country</p>*/}
            {/*    <p className="mt-0.5 text-sm font-medium capitalize text-slate-900">*/}
            {/*      {program?.branch?.length*/}
            {/*        ? program.branch.map((b) => b.location).join(", ")*/}
            {/*        : "Not Provided"}*/}
            {/*    </p>*/}
            {/*  </div>*/}
            {/*</div>*/}

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                <MdPublic className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Country</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-slate-900">
                  {program?.branch?.length
                    ? program.branch.map((b) => b.location).join(", ")
                    : "Not Provided"}
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
                  {program?.university?.state ?? "Not Provided"}
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
                  {program?.university.intake_months?.length ? (
                    program.university.intake_months.map((date, index) => (
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
                <p className="text-xs text-slate-500">Campus</p>
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
      
    </>
  );
};

export default EditKnowledgeHubProgramDetails;
