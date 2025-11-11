import React from "react";
import ApplicationPartnerTopBar from "../../topBar/ApplicationPartnerTopBar";

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
} from "react-icons/fa";

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

  return (
    <section>
      <div className="mb-5 mt-5 block space-y-4 rounded-lg border border-default bg-card p-4 pt-0 shadow-sm sm:p-6">
        <ApplicationPartnerTopBar params={{ id: application.id }} />

        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-200">
            <FaTasks className="text-lg text-blue-700" />
          </span>

          <div className="min-w-0 flex-1 space-y-3">

            <h3 className="break-words text-base font-semibold text-gray-800">
              Review {application.program?.name}
            </h3>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex whitespace-nowrap rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 sm:text-sm">
                Normal Priority
              </span>
              <span className="inline-flex whitespace-nowrap rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 sm:text-sm">
                {stage.name || "Not provided"}
              </span>
              <span className="inline-flex whitespace-nowrap rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 sm:text-sm">
                {daysSince(application.updated_at)} Days
              </span>
            </div>
          </div>

          <div className="w-full self-start sm:w-auto sm:text-end">
            <span className="block truncate text-sm text-text-muted">
              {student.name || "Not provided"}
            </span>
            <span className="block truncate text-xs text-text-muted">
              {application.id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 py-2">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center">
            <FaCogs className="text-xl text-blue-600" />
          </div>
          <span className="text-p2 sm:text-base">

            <span className="text-p1 font-medium text-text-primary">
              Current Status:{" "}
            </span>

            {application.stage?.statuses?.[0]?.name ||
              application.stage?.name ||
              "Not provided"}
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-text-muted sm:text-p2">
            Next Action:{" "}
            {application.stage?.statuses?.[0]?.next_actions?.[0]?.name ||
              "Not provided"}
          </p>
          <p className="text-xs text-text-secondary">
            Last updated: {formatDate(application.updated_at)}
          </p>
        </div>
      </div>

      <div className="mb-5 mt-5 block space-y-4 rounded-lg border border-default bg-card p-6 shadow-sm">
        <h3 className="text-p3 mb-6 flex items-center gap-3 font-semibold text-text-primary">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <MdAssignmentTurnedIn className="text-xl text-blue-700" />
          </span>
          Application Information
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div>
            <span className="block text-p1 font-medium text-text-primary">
              Program
            </span>
            <span className="text-p2 text-text-muted">
              {program.name || "Not provided"}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-text-primary">
              University
            </span>
            <span className="text-p2 text-text-muted">
              {university.name || "Not provided"}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-text-primary">
              Country of University
            </span>
            <span className="text-p2 text-text-muted">
              {university.country || "Not provided"}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-text-primary">
              Partner
            </span>
            <span className="text-p2 text-text-muted">
              {partner.name || "Not provided"}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-text-primary">
              Stage
            </span>
            <span className="text-p2 text-text-muted">
              {stage.name || "Not provided"}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-text-primary">
              Status
            </span>
            <span className="text-p2 text-text-muted">
              {currentStatus.name || "Not provided"}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-text-primary">
              Intake Date
            </span>
            <span className="text-p2 text-text-muted">
              {formatDate(program.intake_date)}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-text-primary">
              Tuition Fee
            </span>
            <span className="text-p1 text-text-success">
              $ {program.tuition_fee?.toLocaleString() || "Not provided"}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6 mt-6 space-y-6 rounded-xl border border-default bg-card p-6">
        <h3 className="text-p3 mb-6 flex items-center gap-3 font-semibold text-text-primary">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <FaUser className="text-xl text-blue-700" />
          </span>
          Student Information
        </h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-h6 font-semibold text-text-primary">
              <FaUser /> Personal Details
            </h4>

            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-text-primary">
                  Full Name
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <FaUser className="text-text-muted" />
                  {student.name || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-text-primary">
                  Student Gender
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <FaUser  className="text-text-muted" />
                  {formatDate(student.gender)}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-text-primary">
                  Date of Birth
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <FaBirthdayCake className="text-text-muted" />
                  {formatDate(student.birthday)}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-text-primary">
                  Nationality
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <FaFlag className="text-text-muted" />
                  {student.nationality || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-text-primary">
                  Passport Number
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <FaIdCard className="text-text-muted" />
                  {student.passport_number || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-text-primary">
                  Email Address
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <FaEnvelope className="text-text-muted" />
                  {student.email || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-text-primary">
                  Phone Number
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <FaPhone className="text-text-muted" />
                  {student.phone || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-text-primary">
                  Current Address
                </dt>
                <dd className="mt-1 flex items-center gap-2 break-words text-sm text-text-muted">
                  <FaHome className="text-text-muted" />
                  {student.current_address || "Not provided"}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <div className="mb-6">
              <h4 className="mb-3 flex items-center gap-2 text-h6 font-semibold text-text-primary">
                <FaBook /> English Proficiency
              </h4>

              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-text-primary">
                    Test Name
                  </dt>
                  <dd className="text-sm text-text-muted">
                    {englishProficiency.test_name || "Not provided"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-text-primary">
                    Score
                  </dt>
                  <dd className="text-sm font-semibold text-text-muted">
                    {englishProficiency.score || "Not provided"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-text-primary">
                    Test Date
                  </dt>
                  <dd className="text-sm text-text-muted">
                    {formatDate(englishProficiency.test_date)}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="mb-3 flex items-center gap-2 text-h6 font-semibold text-text-primary">
                <FaGraduationCap /> Previous Education
              </h4>

              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-text-primary">
                    Degree
                  </dt>
                  <dd className="text-sm text-text-muted">
                    {previousEducation.qualification || "Not provided"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-text-primary">
                    Institution
                  </dt>
                  <dd className="max-w-[60%] break-words text-right text-sm text-text-muted">
                    {previousEducation.institution_name || "Not provided"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-text-primary">
                    Years
                  </dt>
                  <dd className="text-sm text-text-muted">
                    {previousEducation.start_date && previousEducation.end_date
                      ? `${formatDate(
                        previousEducation.start_date
                      )} - ${formatDate(previousEducation.end_date)}`
                      : "Not provided"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-text-primary">GPA</dt>
                  <dd className="text-sm font-bold text-text-muted">
                    {previousEducation.gpa || "Not provided"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <FaPhoneAlt className="text-xs text-red-600" />
                <h4 className="text-p2 font-semibold tracking-wide text-red-700">
                  Emergency Contact
                </h4>
              </div>

              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FaUser className="text-text-secondary" /> Name
                  </dt>
                  <dd className="text-sm font-normal text-text-primary">
                    {emergencyContact.name || "Not provided"}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FaUsers className="text-text-secondary" /> Relation
                  </dt>
                  <dd className="text-sm font-normal text-text-primary">
                    {emergencyContact.relation || "Not provided"}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FaPhoneAlt className="text-text-secondary" /> Phone
                  </dt>
                  <dd className="text-sm font-normal text-text-primary">
                    {emergencyContact.phone || "Not provided"}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FaEnvelope className="text-text-secondary" /> Email
                  </dt>
                  <dd className="break-words text-sm font-normal text-text-primary">
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
