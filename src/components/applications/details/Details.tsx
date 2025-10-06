import { applications } from 'components/data/applications';
import React from 'react';
import EmptyData from 'components/emptyData/EmptyData';
import ApplicationAccountManagerTopBar from 'components/applications/topBar/ApplicationAccountManagerTopBar';

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
} from 'react-icons/fa';

import { MdAssignmentTurnedIn } from 'react-icons/md';

interface ApplicationPageProps {
  params: {
    id: string;
  };
}

interface ApplicationPageProps {
  params: {
    id: string;
  };
}

export default function ApplicationPage({ params }: ApplicationPageProps) {
  const application = applications.find((app) => app.id === params.id);

  function daysSince(dateString: string) {
    const dateParts = dateString.match(
      /(\d{4})-(\d{2})-(\d{2}) (\d{1,2}):(\d{2})(am|pm)/i,
    );
    if (!dateParts) return 0;

    let [_, year, month, day, hour, minute, meridiem] = dateParts;
    let h = parseInt(hour, 10);
    if (meridiem.toLowerCase() === 'pm' && h < 12) h += 12;
    if (meridiem.toLowerCase() === 'am' && h === 12) h = 0;

    const isoString = `${year}-${month}-${day}T${h
      .toString()
      .padStart(2, '0')}:${minute}:00`;
    const updatedDate = new Date(isoString);

    const today = new Date();
    const diffTime = today.getTime() - updatedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  if (!application) {
    return <EmptyData />;
  }

  return (
    <section>

      <div className="mb-5 mt-5 block space-y-4 rounded-lg border border-default bg-card p-4 shadow-sm sm:p-6">

        <ApplicationAccountManagerTopBar params={params} />

        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-200">
            <FaTasks className="text-lg text-blue-700" />
          </span>

          <div className="min-w-0 flex-1 space-y-3">
            <h3 className="break-words text-base font-semibold text-gray-800">
              Review commission details and approve payment
            </h3>

            <div className="flex flex-wrap gap-2">
              <span
                className="inline-flex whitespace-nowrap rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 sm:text-p2">
                Processing
              </span>
              <span
                className="inline-flex whitespace-nowrap rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 sm:text-p2">
                {application.priority.charAt(0).toUpperCase() +
                  application.priority.slice(1)}{' '}
                Priority
              </span>
              <span
                className="inline-flex whitespace-nowrap rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 sm:text-p2">
                Stage {application.stage}
              </span>
              <span
                className="inline-flex whitespace-nowrap rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 sm:text-p2">
                {daysSince(application.updatedAt)} Days
              </span>
            </div>
          </div>

          <div className="w-full self-start sm:w-auto sm:text-end">
            <span className="block truncate text-p2 text-text-secondary">
              {application.studentInfo?.fullName}
            </span>
            <span className="block truncate text-xs text-text-muted">
              {application.applicationID}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 py-2">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center">
            <FaCogs className="text-xl text-blue-600" />
          </div>
          <span className="text-p2 sm:text-base">Processing in progress</span>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-text-muted sm:text-p2">
            Next: Check status for next steps
          </p>
          <p className="text-xs text-text-secondary">
            Last updated: {application.updatedAt}
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
              {application.program}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-text-primary">
              University
            </span>
            <span className="text-p2 text-text-muted">
              {application.university}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-text-primary">
              Partner
            </span>
            <span className="text-p2 text-text-muted">
              {application.partner}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-text-primary">
              Stage
            </span>
            <span className="text-p2 text-text-muted">{application.stage}</span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-text-primary">
              Status
            </span>
            <span className="text-p2 text-text-muted">
              {application.status}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-text-primary">
              Intake Date
            </span>
            <span className="text-p2 text-text-muted">
              {application.intakeDate}
            </span>
          </div>

          <div>
            <span className="block text-p1 font-medium text-text-primary">
              Tuition Fee
            </span>
            <span className="text-p1 text-text-success ">
              $ {application.tuitionFee}
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
            <h4 className="mb-3 flex items-center gap-2 text-p2 font-semibold text-text-primary">
              <FaUser className="text-sm text-text-primary" />
              Personal Details
            </h4>

            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-text-primary">Full Name</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <FaUser className="text-text-muted" />
                  {application.studentInfo?.fullName || 'Not provided'}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-text-primary">Date of Birth</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <FaBirthdayCake className="text-text-muted" />
                  {application.studentInfo?.dateOfBirth || 'DD/MM/YYYY'}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-text-primary">Nationality</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <FaFlag className="text-text-muted" />
                  {application.studentInfo?.nationality || 'Not specified'}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-text-primary">Passport Number</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <FaIdCard className="text-text-muted" />
                  {application.studentInfo?.passportNumber || 'N/A'}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-text-primary">Email Address</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <FaEnvelope className="text-text-muted" />
                  {application.studentEmail || 'example@email.com'}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-text-primary">Phone Number</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <FaPhone className="text-text-muted" />
                  {application.studentInfo?.phone || '+00 000-000-000'}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-text-primary">Current Address</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-text-muted break-words">
                  <FaHome className="text-text-muted" />
                  {application.studentInfo?.currentAddress || 'No address provided'}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <div className="mb-6">
              <h4 className="mb-3 flex items-center gap-2 text-p2 font-semibold text-text-primary">
                <FaBook className="text-sm text-text-primary" />
                English Proficiency
              </h4>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-text-primary">Test Name</dt>
                  <dd className="text-sm text-text-muted">
                    {application.englishProficiency?.test || 'Not taken'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-text-primary">Score</dt>
                  <dd className="text-sm font-semibold text-text-muted">
                    {application.englishProficiency?.score || 'N/A'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-text-primary">Test Date</dt>
                  <dd className="text-sm text-text-muted">
                    {application.englishProficiency?.testDate || 'DD/MM/YYYY'}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="mb-3 flex items-center gap-2 text-p2 font-semibold text-text-primary">
                <FaGraduationCap className="text-sm text-text-primary" />
                Previous Education
              </h4>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-text-primary">Degree</dt>
                  <dd className="text-sm text-text-muted">
                    {application.previousEducation?.degree || 'Not specified'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-text-primary">Institution</dt>
                  <dd className="max-w-[60%] break-words text-right text-sm text-text-muted">
                    {application.previousEducation?.institution || 'Institution name'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-text-primary">Years</dt>
                  <dd className="text-sm text-text-muted">
                    {application.previousEducation?.years || 'Not provided'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-text-primary">GPA</dt>
                  <dd className="text-sm font-bold text-text-muted">
                    {application.previousEducation?.gpa || 'N/A'}
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
                    {application.studentInfo?.emergencyContact.name || 'Not provided'}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FaUsers className="text-text-secondary" /> Relation
                  </dt>
                  <dd className="text-sm font-normal text-text-primary">
                    {application.studentInfo?.emergencyContact.relation || 'N/A'}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FaPhoneAlt className="text-text-secondary" /> Phone
                  </dt>
                  <dd className="text-sm font-normal text-text-primary">
                    {application.studentInfo?.emergencyContact.phone || '+00 000-000-000'}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <FaEnvelope className="text-text-secondary" /> Email
                  </dt>
                  <dd className="break-words text-sm font-normal text-text-primary">
                    {application.studentInfo?.emergencyContact.email || 'example@email.com'}
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
