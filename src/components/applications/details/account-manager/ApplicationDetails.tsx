import React from "react";
import ApplicationAccountManagerTopBar from "../../topBar/ApplicationAccountManagerTopBar";

import {
  FaTasks,
  FaCogs,
  FaUser,
  FaBirthdayCake,
  FaFlag,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaBook,
  FaGraduationCap,
  FaPhoneAlt,
  FaUsers,
  FaClock,
  FaStream,
  FaCheckCircle

} from 'react-icons/fa';

import { MdAssignmentTurnedIn } from "react-icons/md";

interface ApplicationDetailsProps {
  application: any;
}

export default function ApplicationDetails({
                                             application,
                                           }: ApplicationDetailsProps) {

  function daysSince(dateString: string) {
    if (!dateString) return 0;

    const updatedDate = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - updatedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString();
  }

  const student = application.student || {};
  const program = application.program || {};
  const university = program.university || {};
  const partner = application.partner || {};
  const stage = application.stage || {};
  const emergencyContact = student.emergency_contacts?.[0] || {};
  const englishProficiency = student.english_proficiencies?.[0] || {};
  const previousEducation = student.previous_educations?.[0] || {};
  const currentStatus = stage.statuses?.[0] || {};
  const formatGender = (value: boolean) => {
    return value ? "Male" : "Female";
  };

  const statusText = {
    1: "Active",
    2: "On Hold",
    3: "Cancelled",
  }[application.lifecycle_status] ?? "Not provided";

  const statusClass = {
    1: "border-green-200 bg-green-50 text-green-700",
    2: "border-yellow-200 bg-yellow-50 text-yellow-700",
    3: "border-red-200 bg-red-50 text-red-700",
  }[application.lifecycle_status] ?? "border-gray-200 bg-gray-50 text-gray-600";



  return (
    <section>
      <div className="mb-5 mt-5 block space-y-4 rounded-lg border border-gray-200 bg-card p-4 pt-0 shadow-sm sm:p-6">
        <ApplicationAccountManagerTopBar application={application} />

        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-200">
            <FaTasks className="text-lg text-blue-700" />
          </span>

          <div className="min-w-0 flex-1 space-y-3">
            <h3 className="break-words text-base font-semibold text-gray-800">
              Review {application.program?.name}
            </h3>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 sm:text-sm">
                <FaStream className="text-[10px] text-amber-700" />
                Stage: {stage.name || "Not provided"}
              </span>

              <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium sm:text-sm ${statusClass}`}>
                <FaCheckCircle className="text-[10px]" />
                Status: {statusText}
              </span>

              <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 sm:text-sm">
                <FaClock className="text-[10px] text-purple-700" />
                {daysSince(application.updated_at)} Days
              </span>
            </div>
          </div>

          <div className="w-full self-start sm:w-auto sm:text-end">
            <span className="block truncate text-md text-slate-500">
              {student.name || "Not provided"}
            </span>
            <span className="block truncate text-xs text-slate-500">
              {/*{application.id}*/}
            </span>
          </div>
        </div>

        <div className="block rounded-md border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
              <FaCogs className="text-2xl text-blue-600" />
            </div>

            <div className="flex flex-col">
              <span className="text-sm sm:text-base">
                <span className="font-semibold text-slate-900">
                  Current Status:{" "}
                </span>
                {application.stage?.statuses?.[0]?.name ||
                  application.stage?.name ||
                  "Not provided"}
              </span>

              <span className="mt-1 text-xs text-slate-500 sm:text-sm">
                <span className="font-medium">Next Action: </span>
                {application?.stage?.statuses?.[0]?.next_actions?.[0]?.name ??
                  "Not provided"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-slate-500 sm:text-p2">
            Application created:{" "}
            {application?.updated_at
              ? formatDate(application.updated_at)
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="mb-5 mt-5 block space-y-4 rounded-lg border border-gray-200 bg-card p-6 shadow-sm">
        <h3 className="text-p3 mb-6 flex items-center gap-3 font-semibold text-slate-900">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <MdAssignmentTurnedIn className="text-xl text-blue-700" />
          </span>
          Application Information
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div>
            <span className="block text-p1 font-medium text-slate-900">
              Program
            </span>
            <span className="text-p2 text-slate-500">
              {program.name || "Not provided"}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-slate-900">
              University
            </span>
            <span className="text-p2 text-slate-500">
              {university.name || "Not provided"}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-slate-900">
              Country of University
            </span>
            <span className="text-p2 text-slate-500">
              {university.country || "Not provided"}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-slate-900">
              Partner
            </span>
            <span className="text-p2 text-slate-500">
              {partner.name || "Not provided"}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-slate-900">
              Stage
            </span>
            <span className="text-p2 text-slate-500">
              {stage.name || "Not provided"}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-slate-900">
              Status
            </span>
            <span className="text-p2 text-slate-500">
              {currentStatus.name || "Not provided"}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-slate-900">
              Intake Date
            </span>
            <span className="text-p2 text-slate-500">
              {formatDate(application.intake_date)}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-slate-900">
              Tuition Fee
            </span>
            <span className="text-p1 text-text-success">
              $ {program.tuition_fee?.toLocaleString() || "Not provided"}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6 mt-6 space-y-6 rounded-xl border border-gray-200 bg-card p-6">
        <h3 className="text-p3 mb-6 flex items-center gap-3 font-semibold text-slate-900">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <FaUser className="text-xl text-blue-700" />
          </span>
          Student Information
        </h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-h6 font-semibold text-slate-900">
              <FaUser /> Personal Details
            </h4>

            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-slate-900">
                  Full Name
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <FaUser className="text-slate-500" />
                  {student.name || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-900">
                  Gender
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <FaUser className="text-slate-500" />
                  {formatGender(student.gender)}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-900">
                  Date of Birth
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <FaBirthdayCake className="text-slate-500" />
                  {formatDate(student.birthday)}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-900">
                  Nationality
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <FaFlag className="text-slate-500" />
                  {student.nationality || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-900">
                  Passport Number
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <FaIdCard className="text-slate-500" />
                  {student.passport_number || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-900">
                  Email Address
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <FaEnvelope className="text-slate-500" />
                  {student.email || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-900">
                  Phone Number
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <FaPhone className="text-slate-500" />
                  {student.phone || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-900">
                  Current Address
                </dt>
                <dd className="mt-1 flex items-center gap-2 break-words text-sm text-slate-500">
                  <FaHome className="text-slate-500" />
                  {student.current_address || "Not provided"}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <div className="mb-6">
              <h4 className="mb-3 flex items-center gap-2 text-h6 font-semibold text-slate-900">
                <FaBook /> English Proficiency
              </h4>

              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-slate-900">
                    Test Name
                  </dt>
                  <dd className="text-sm text-slate-500">
                    {englishProficiency.test_type || "Not provided"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-slate-900">
                    Score
                  </dt>
                  <dd className="text-sm font-semibold text-slate-500">
                    {englishProficiency.score || "Not provided"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-slate-900">
                    Test Date
                  </dt>
                  <dd className="text-sm text-slate-500">
                    {formatDate(englishProficiency.test_date)}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="mb-3 flex items-center gap-2 text-h6 font-semibold text-slate-900">
                <FaGraduationCap /> Previous Education
              </h4>

              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-slate-900">
                    Degree
                  </dt>
                  <dd className="text-sm text-slate-500">
                    {previousEducation.qualification || "Not provided"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-slate-900">
                    Institution
                  </dt>
                  <dd className="max-w-[60%] break-words text-right text-sm text-slate-500">
                    {previousEducation.institution_name || "Not provided"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-slate-900">
                    Study Period
                  </dt>
                  <dd className="text-sm text-slate-500">
                    {previousEducation.start_date && previousEducation.end_date
                      ? `${formatDate(
                        previousEducation.start_date
                      )} - ${formatDate(previousEducation.end_date)}`
                      : "Not provided"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-slate-900">
                    GPA / Grade
                  </dt>
                  <dd className="text-sm font-bold text-slate-500">
                    {previousEducation.grade || "Not provided"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <FaPhoneAlt className="text-xs text-red-600" />
                <h4 className="text-p2 font-semibold tracking-wide text-red-700">
                  Emergency Contact
                </h4>
              </div>

              <dl className="space-y-4">
                <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                  <dt className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FaUser /> Name
                  </dt>
                  <dd className="min-w-0 break-words text-sm text-slate-900">
                    {emergencyContact.name || "Not provided"}
                  </dd>
                </div>

                <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                  <dt className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FaUsers /> Relation
                  </dt>
                  <dd className="min-w-0 text-sm text-slate-900">
                    {emergencyContact.relation || "Not provided"}
                  </dd>
                </div>

                <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                  <dt className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FaPhoneAlt /> Phone
                  </dt>
                  <dd className="min-w-0 text-sm text-slate-900">
                    {emergencyContact.phone || "Not provided"}
                  </dd>
                </div>

                <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                  <dt className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FaEnvelope /> Email
                  </dt>
                  <dd className="min-w-0 break-all text-sm text-slate-900">
                    {emergencyContact.email || "Not provided"}
                  </dd>
                </div>
              </dl>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
