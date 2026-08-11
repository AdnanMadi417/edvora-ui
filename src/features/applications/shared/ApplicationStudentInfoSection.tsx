import React from "react";
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
} from "react-icons/fa";
import { AppDate } from "components/ui/date";
import { formatGender } from "utils/applicationFormatting";
import { SectionIconBadge } from "components/ui/icons";

interface ApplicationStudentInfoSectionProps {
  application: any;
}

export default function ApplicationStudentInfoSection({ application }: ApplicationStudentInfoSectionProps) {
  const student = application.student || {};
  const emergencyContact = student.emergency_contacts?.[0] || {};
  const englishProficiency = student.english_proficiencies?.[0] || {};
  const previousEducation = student.previous_educations?.[0] || {};

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
    <div className="p-6 border-b border-slate-200">
      <h3 className="text-p3 mb-6 flex items-center gap-3 font-semibold text-slate-900">
        <SectionIconBadge icon={FaUser} color="blue" />
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
              <dl className="space-y-3">
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
  );
}
