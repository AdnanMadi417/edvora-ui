import React from "react";

import { GraduationCap, Building2, Globe, Clock, Calendar, ArrowRight } from "lucide-react";
import {
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
} from 'react-icons/fa';

import { MdAssignmentTurnedIn } from "react-icons/md";
import PresignedImage from "components/ui/PresignedImage";
import OfferLetterCard from './OfferLetterCard';
import AccountManagerTopBar from "features/applications/account-manager/components/topBar/AccountManagerTopBar";
import ApplicationTimeline from 'features/applications/shared/ApplicationTimeline';
import ApplicationCommission from './ApplicationCommission';
import ApplicationDocuments from './ApplicationDocuments';
import { AppDate } from "components/ui/date";



interface ApplicationDetailsProps {
  application: any;
  onRefetch?: () => void;
}

export default function ApplicationDetails({
  application,
  onRefetch,
}: ApplicationDetailsProps) {

  function daysSince(dateString: string) {
    if (!dateString) return 0;
    const updatedDate = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - updatedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  const formatGender = (value: boolean | null) => {
    if (value === null) return "Not provided";
    return value ? "Male" : "Female";
  };

  const hasEmergencyContact =
    emergencyContact &&
    (emergencyContact.name ||
      emergencyContact.relation ||
      emergencyContact.phone ||
      emergencyContact.email);

  const hasEnglishProficiency =
    englishProficiency &&
    (englishProficiency.test_type ||
      englishProficiency.score ||
      englishProficiency.test_date);

  const hasPreviousEducation =
    previousEducation &&
    (previousEducation.institution_name ||
      previousEducation.start_date ||
      previousEducation.end_date ||
      previousEducation.grade);

  return (
    <section className="max-w-5xl mx-auto">
      <div className="mt-4 bg-white rounded-lg border border-slate-200">

        {/* Account Manager TopBar */}
        <div className="border-b border-slate-200">
          <AccountManagerTopBar application={application} onRefetch={onRefetch} />
        </div>

        {/* Hero */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <PresignedImage
                fileKey={application.student_photo_file_key}
                alt={student.name}
                className="h-16 w-16 shrink-0 rounded-full object-cover border-2 border-blue-200"
                fallback={
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-700 border-2 border-blue-200 text-xl font-bold text-white">
                    {student.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                }
              />
              <div>
                <h2 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-slate-900">
                  {student.name}
                </h2>
                {application.intake_date && (
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 sm:hidden">
                    <Clock className="h-3 w-3" />
                    <span>Intake: <AppDate value={application.intake_date} format="short" fallback="Not provided" /></span>
                  </div>
                )}
                <div className="mt-1 block md:flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                  {program.name && (
                    <span className="flex items-center gap-1 hidden md:flex">
                      <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
                      {program.name}
                    </span>
                  )}
                  {university.name && (
                    <>
                      <span className="text-slate-300 hidden md:block">|</span>
                      <span className="flex items-center gap-1 hidden md:flex">
                        <Building2 className="h-3.5 w-3.5 text-blue-400" />
                        {university.name}
                      </span>
                    </>
                  )}
                  {university.country && (
                    <>
                      <span className="text-slate-300 hidden md:block">|</span>
                      <span className="flex items-center gap-1 hidden md:flex">
                        <Globe className="h-3.5 w-3.5 text-blue-400" />
                        {university.country}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-1 block md:flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              {program.name && (
                <span className="flex items-center gap-1 flex md:hidden">
                  <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
                  {program.name}
                </span>
              )}
              {university.name && (
                <>
                  <span className="flex items-center gap-1 flex md:hidden">
                    <Building2 className="h-3.5 w-3.5 text-blue-400" />
                    {university.name}
                  </span>
                </>
              )}
              {university.country && (
                <>
                  <span className="flex items-center gap-1 flex md:hidden">
                    <Globe className="h-3.5 w-3.5 text-blue-400" />
                    {university.country}
                  </span>
                </>
              )}
            </div>

            <div className="hidden sm:block shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-start">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Intake Date</p>
              <p className="mt-1 flex items-center justify-start gap-2 text-lg font-bold text-slate-900">
                <Calendar className="h-4 w-4 text-blue-400" />
                <AppDate value={application.intake_date} format="short" fallback="Not provided" />
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Current Status</p>
              <div className="flex flex-wrap gap-2">
                {currentStatus.name && (
                  <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-normal text-amber-700">
                    {currentStatus.name}
                  </span>
                )}
                {stage.name && (
                  <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1 text-sm font-normal text-slate-800">
                    {stage.name}
                  </span>
                )}
                <p className="inline-flex items-center text-xs font-normal text-slate-600">
                  <span className="sm:hidden rounded-md border border-slate-200 bg-white px-3 py-1">{daysSince(application.updated_at)} d</span>
                  <span className="hidden sm:inline">{daysSince(application.updated_at)} days in stage</span>
                </p>
              </div>
            </div>

            <div className="rounded-lg border-[2px] border-blue-200 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <ArrowRight className="h-4 w-4 text-blue-700" />
                </div>
                <div className="block space-y-1">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-500">Next Action</p>
                  <p className="text-sm font-medium text-slate-800">
                    {application?.stage?.statuses?.[0]?.next_actions?.[0]?.name ?? "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Timeline */}
        <div className="p-6 border-b border-slate-200">
          <ApplicationTimeline application={application} />
        </div>

        {/* Commission Details */}
        <div className="border-b border-slate-200">
          <ApplicationCommission application={application} />
        </div>

        {/* Offer Letter */}
        <div className="border-b border-slate-200">
          <OfferLetterCard application={application} onRefetch={onRefetch} />
        </div>

        {/* Application Information */}
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-p3 mb-6 flex items-center gap-3 font-semibold text-slate-900">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
              <MdAssignmentTurnedIn className="text-xl text-blue-700" />
            </span>
            Application Information
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div>
              <span className="block text-p1 font-medium text-slate-900">Program</span>
              <span className="text-p2 text-slate-500">{program.name || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-p1 font-medium text-slate-900">University</span>
              <span className="text-p2 text-slate-500">{university.name || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-p1 font-medium text-slate-900">Country of University</span>
              <span className="text-p2 text-slate-500">{university.country || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-p1 font-medium text-slate-900">Partner</span>
              <span className="text-p2 text-slate-500">{partner.name || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-p1 font-medium text-slate-900">Stage</span>
              <span className="text-p2 text-slate-500">{stage.name || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-p1 font-medium text-slate-900">Status</span>
              <span className="text-p2 text-slate-500">{currentStatus.name || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-p1 font-medium text-slate-900">Intake Date</span>
              <span className="text-p2 text-slate-500">
                <AppDate value={application.intake_date} format="short" fallback="Not provided" />
              </span>
            </div>
            <div>
              <span className="block text-p1 font-medium text-slate-900">Tuition Fee</span>
              <span className="text-p1 text-green-700">
                $ {program.tuition_fee?.toLocaleString() || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-p3 mb-6 flex items-center gap-3 font-semibold text-slate-900">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
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
                {student.name && (
                  <div>
                    <dt className="text-sm font-medium text-slate-900">Full Name</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <FaUser className="text-slate-500" />
                      {student.name}
                    </dd>
                  </div>
                )}
                {student.gender !== null && (
                  <div>
                    <dt className="text-sm font-medium text-slate-900">Gender</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <FaUser className="text-slate-500" />
                      {formatGender(student.gender)}
                    </dd>
                  </div>
                )}
                {student.birthday && (
                  <div>
                    <dt className="text-sm font-medium text-slate-900">Date of Birth</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <FaBirthdayCake className="text-slate-500" />
                      <AppDate value={student.birthday} format="short" fallback="Not provided" />
                    </dd>
                  </div>
                )}
                {student.nationality && (
                  <div>
                    <dt className="text-sm font-medium text-slate-900">Nationality</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <FaFlag className="text-slate-500" />
                      {student.nationality}
                    </dd>
                  </div>
                )}
                {student.passport_number && (
                  <div>
                    <dt className="text-sm font-medium text-slate-900">Passport Number</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <FaIdCard className="text-slate-500" />
                      {student.passport_number}
                    </dd>
                  </div>
                )}
                {student.email && (
                  <div>
                    <dt className="text-sm font-medium text-slate-900">Email Address</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <FaEnvelope className="text-slate-500" />
                      {student.email}
                    </dd>
                  </div>
                )}
                {student.phone && (
                  <div>
                    <dt className="text-sm font-medium text-slate-900">Phone Number</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <FaPhone className="text-slate-500" />
                      {student.phone}
                    </dd>
                  </div>
                )}
                {student.current_address && (
                  <div>
                    <dt className="text-sm font-medium text-slate-900">Current Address</dt>
                    <dd className="mt-1 flex items-center gap-2 break-words text-sm text-slate-500">
                      <FaHome className="text-slate-500" />
                      {student.current_address}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {hasEnglishProficiency && (
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-h6 font-semibold text-slate-900">
                  <FaBook /> English Proficiency
                </h4>
                <dl className="space-y-3">
                  {englishProficiency.test_type && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-900">Test Name</dt>
                      <dd className="text-sm text-slate-500">{englishProficiency.test_type}</dd>
                    </div>
                  )}
                  {englishProficiency.score && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-900">Score</dt>
                      <dd className="text-sm font-semibold text-slate-500">{englishProficiency.score}</dd>
                    </div>
                  )}
                  {englishProficiency.test_date && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-900">Test Date</dt>
                      <dd className="text-sm text-slate-500">
                        <AppDate value={englishProficiency.test_date} format="short" fallback="Not provided" />
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {hasPreviousEducation && (
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-h6 font-semibold text-slate-900">
                  <FaGraduationCap /> Previous Education
                </h4>
                <dl className="space-y-3">
                  {application.qualification_level && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-900">Degree</dt>
                      <dd className="text-sm text-slate-500">{application.qualification_level}</dd>
                    </div>
                  )}
                  {previousEducation.institution_name && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-900">Institution</dt>
                      <dd className="max-w-[60%] break-words text-right text-sm text-slate-500">
                        {previousEducation.institution_name}
                      </dd>
                    </div>
                  )}
                  {previousEducation.start_date && previousEducation.end_date && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-900">Study Period</dt>
                      <dd className="text-sm text-slate-500">
                        <AppDate value={previousEducation.start_date} format="short" fallback="Not provided" /> – <AppDate value={previousEducation.end_date} format="short" fallback="Not provided" />
                      </dd>
                    </div>
                  )}
                  {previousEducation.grade && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-900">GPA / Grade</dt>
                      <dd className="text-sm font-bold text-slate-500">{previousEducation.grade}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {hasEmergencyContact && (
              <div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <FaPhoneAlt className="text-xs text-red-600" />
                    <h4 className="text-p2 font-semibold tracking-wide text-red-700">Emergency Contact</h4>
                  </div>
                  <dl className="space-y-4">
                    {emergencyContact.name && (
                      <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                        <dt className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <FaUser /> Name
                        </dt>
                        <dd className="min-w-0 break-words text-sm text-slate-900">{emergencyContact.name}</dd>
                      </div>
                    )}
                    {emergencyContact.relation && (
                      <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                        <dt className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <FaUsers /> Relation
                        </dt>
                        <dd className="min-w-0 text-sm text-slate-900">{emergencyContact.relation}</dd>
                      </div>
                    )}
                    {emergencyContact.phone && (
                      <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                        <dt className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <FaPhoneAlt /> Phone
                        </dt>
                        <dd className="min-w-0 text-sm text-slate-900">{emergencyContact.phone}</dd>
                      </div>
                    )}
                    {emergencyContact.email && (
                      <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                        <dt className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <FaEnvelope /> Email
                        </dt>
                        <dd className="min-w-0 break-all text-sm text-slate-900">{emergencyContact.email}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        <ApplicationDocuments application={application} onRefetch={onRefetch} />

      </div>
    </section>
  );
}
