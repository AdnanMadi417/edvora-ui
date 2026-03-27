import React, { useState } from "react";

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
  FaStream,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import { MdAssignmentTurnedIn } from "react-icons/md";
import { Clock, Wallet, Plane } from 'lucide-react';
import { useApplicationActions } from "hooks/applications/stages/useApplicationActions";

import ApplicationPartnerTopBar from "components/applications/topBar/PartnerTopBar";
import RequiredAction from "components/applications/popups/partner/RequiredAction";
import ProgramDecision from "components/applications/popups/partner/ProgramDecision";
import OfferLetterDecision, { OfferLetterDecisionType } from './OfferLetter';
import VisaTrackingTimeline from "./VisaTrackingTimeline";
import VisaPaymentConfirmation from "components/applications/popups/partner/VisaPaymentConfirmation";
import ArrivalDate from "components/applications/popups/partner/ArrivalDate";
import ApplicationCommission from './ApplicationCommission';
import { submitOfferLetterDecision } from '../../../../services/offerLetterService';
import { useToast } from '../../../context/ToastContext';

interface OfferLetterDecisionPayload {
  decision: OfferLetterDecisionType;
  reason?: string;
  notes?: string;
}

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

  const { actions, loading: actionsLoading } = useApplicationActions(
    application?.id
  );

  const student = application.student || {};
  const program = application.program || {};
  const university = program.university || {};
  const partner = application.partner || {};
  const stage = application.stage || {};
  const emergencyContact = student.emergency_contacts?.[0] || {};
  const englishProficiency = student.english_proficiencies?.[0] || {};
  const previousEducation = student.previous_educations?.[0] || {};
  const currentStatus = stage.statuses?.[0] || {};
  const [showRequiredActionPopup, setShowRequiredActionPopup] = useState(false);
  const openRequiredActionPopup = () => setShowRequiredActionPopup(true);
  const closeRequiredActionPopup = () => setShowRequiredActionPopup(false);

  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const isUniversityApproved =
    currentStatus === "University Approved";

  const [showProgramDecisionPopup, setShowProgramDecisionPopup] =
    useState(false);
  const openProgramDecisionPopup = () => setShowProgramDecisionPopup(true);
  const closeProgramDecisionPopup = () => setShowProgramDecisionPopup(false);

  const [showVisaPaymentPopup, setShowVisaPaymentPopup] = useState(false);

  const stageName = stage?.name;
  const stageStatuses = stage?.statuses || [];
  const showVisaPayment =
    stageName === "Visa Processing" &&
    stageStatuses.some((s: any) => s.name === "Waiting for Payment");

  const [showArrivalPopup, setShowArrivalPopup] = useState(false);

  const showArrivalConfirmation =
    stageName === "Student Arrival & Enrollment" &&
    stageStatuses.some((s: any) => s.name === "Waiting Partner to confirm arrival date");

  const formatGender = (value: boolean | null) => {
    if (value === null) return "Not provided";
    return value ? "Male" : "Female";
  };

  const statusText =
    {
      1: "Active",
      2: "On Hold",
      3: "Cancelled",
    }[application.lifecycle_status] ?? "Not provided";

  const statusClass =
    {
      1: "border-green-200 bg-green-50 text-green-700",
      2: "border-yellow-200 bg-yellow-50 text-yellow-700",
      3: "border-red-200 bg-red-50 text-red-700",
    }[application.lifecycle_status] ??
    "border-gray-200 bg-gray-50 text-gray-600";

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

  const handleDecision = async (decision: OfferLetterDecisionType) => {
    if (!application?.id || submitting) return;

    let reason: string | undefined;

    if (decision === "reject") {
      reason = prompt("Please provide a reason for rejection") || undefined;
      if (!reason) return;
    }

    try {
      setSubmitting(true);

      const payload: OfferLetterDecisionPayload = {
        decision,
        reason,
        notes: "",
      };

      await submitOfferLetterDecision(application.id, payload);

      showToast(
        decision === "accept"
          ? "Offer accepted successfully."
          : "Offer rejected successfully.",
        "success"
      );

      setTimeout(() => {
        location.reload();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      showToast(
        err?.response?.data?.message || "Failed to submit decision",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <div className="mb-5 mt-5 block space-y-4 rounded-lg border border-gray-200 bg-card p-4 pt-0 shadow-sm sm:p-6">
        <ApplicationPartnerTopBar application={{ id: application.id }} />

        <div className="block space-y-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/40 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <FaCogs className="text-xl text-blue-600" />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Current Status
              </span>

              <span className="text-lg font-semibold text-slate-900">
                {application.stage?.statuses?.[0]?.name ||
                  application.stage?.name ||
                  "Not provided"}
              </span>

              <span className="text-sm text-slate-600">
                <span className="font-medium text-slate-700">
                  Next action →{" "}
                </span>{" "}
                {application?.stage?.statuses?.[0]?.next_actions?.[0]?.name ??
                  "Not provided"}
              </span>

              <span className="text-sm text-slate-600">
                {actions && actions.document_types?.length > 0 && (
                  <div className="flex items-start gap-1">
                    <span className="font-medium text-slate-700">
                      Requested docs{" "}:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {actions.document_types.map((doc) => (
                        <span
                          key={doc.id}
                          className="rounded-full p-1 text-xs font-medium text-slate-800"
                        >
                          {doc.type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </span>
            </div>
          </div>

          {actions && (
            <>
              {actions.document_types?.length > 0 ? (
                <button
                  onClick={openRequiredActionPopup}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-2 text-center text-sm font-medium text-slate-800 transition-all hover:bg-orange-200 focus-visible:ring-2 focus-visible:ring-orange-400"
                >
                  <Clock className="h-4 w-4 text-orange-500" />
                  Upload Required Documents
                </button>
              ) : actions.stage_statuses?.some(
                  (status) => status.is_requires_reason
                ) ? (
                <button
                  onClick={openProgramDecisionPopup}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-100 px-4 py-2 text-center text-sm font-medium text-slate-800 transition-all hover:bg-blue-200 focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <Clock className="h-4 w-4 text-blue-500" />
                  Submit Program Decision
                </button>
              ) : (
                <span></span>
              )}
            </>
          )}

          {showVisaPayment && (
            <button
              type="button"
              onClick={() => setShowVisaPaymentPopup(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-blue-600 bg-blue-100 px-4 py-2 text-center text-sm font-medium text-blue-700 transition-all hover:bg-blue-200 focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Wallet className="h-4 w-4" />
              Proceed to Payment
            </button>
          )}

          {showArrivalConfirmation && (
            <button
              type="button"
              onClick={() => setShowArrivalPopup(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-blue-600 bg-blue-100 px-4 py-2 text-center text-sm font-medium text-blue-700 transition-all hover:bg-blue-200 focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Plane className="h-4 w-4" />
              Confirm Arrival
            </button>
          )}

          {isUniversityApproved && (
            <>
              <p className="text-sm text-slate-500">
                Please review the offer letter carefully before accepting or rejecting.
              </p>

            </>
          )}


        </div>

        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
              <FaTasks className="text-lg text-slate-700" />
            </div>

            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-slate-900">
                Review {application.program?.name}
              </h3>

              <span className="text-sm text-slate-500">
                Applicant • {student.name || "Not provided"}
              </span>
            </div>
          </div>

          <div className="text-sm text-slate-500">
            Updated{" "}
            {application?.updated_at
              ? formatDate(application.updated_at)
              : "N/A"}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 sm:text-sm">
            <FaStream className="text-[10px] text-amber-700" />
            Stage: {stage.name || "Not provided"}
          </span>

          <span
            className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium sm:text-sm ${statusClass}`}
          >
            <FaCheckCircle className="text-[10px]" />
            Status: {statusText}
          </span>

          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 sm:text-sm">
            <FaClock className="text-[10px] text-purple-700" />
            {daysSince(application.updated_at)} Days
          </span>
        </div>
      </div>

      <OfferLetterDecision application={application} />
      <VisaTrackingTimeline application={application} />
      <ApplicationCommission application={application} />


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
              {student.name && (
                <div>
                  <dt className="text-sm font-medium text-slate-900">
                    Full Name
                  </dt>
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
                  <dt className="text-sm font-medium text-slate-900">
                    Date of Birth
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <FaBirthdayCake className="text-slate-500" />
                    {formatDate(student.birthday)}
                  </dd>
                </div>
              )}
              {student.nationality && (
                <div>
                  <dt className="text-sm font-medium text-slate-900">
                    Nationality
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <FaFlag className="text-slate-500" />
                    {student.nationality}
                  </dd>
                </div>
              )}
              {student.passport_number && (
                <div>
                  <dt className="text-sm font-medium text-slate-900">
                    Passport Number
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <FaIdCard className="text-slate-500" />
                    {student.passport_number}
                  </dd>
                </div>
              )}
              {student.email && (
                <div>
                  <dt className="text-sm font-medium text-slate-900">
                    Email Address
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <FaEnvelope className="text-slate-500" />
                    {student.email}
                  </dd>
                </div>
              )}
              {student.phone && (
                <div>
                  <dt className="text-sm font-medium text-slate-900">
                    Phone Number
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <FaPhone className="text-slate-500" />
                    {student.phone}
                  </dd>
                </div>
              )}
              {student.current_address && (
                <div>
                  <dt className="text-sm font-medium text-slate-900">
                    Current Address
                  </dt>
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
                    <dt className="text-sm font-medium text-slate-900">
                      Test Name
                    </dt>
                    <dd className="text-sm text-slate-500">
                      {englishProficiency.test_type}
                    </dd>
                  </div>
                )}
                {englishProficiency.score && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-slate-900">
                      Score
                    </dt>
                    <dd className="text-sm font-semibold text-slate-500">
                      {englishProficiency.score}
                    </dd>
                  </div>
                )}
                {englishProficiency.test_date && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-slate-900">
                      Test Date
                    </dt>
                    <dd className="text-sm text-slate-500">
                      {formatDate(englishProficiency.test_date)}
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
                    <dt className="text-sm font-medium text-slate-900">
                      Degree
                    </dt>
                    <dd className="text-sm text-slate-500">
                      {application.qualification_level}
                    </dd>
                  </div>
                )}
                {previousEducation.institution_name && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-slate-900">
                      Institution
                    </dt>
                    <dd className="max-w-[60%] break-words text-right text-sm text-slate-500">
                      {previousEducation.institution_name}
                    </dd>
                  </div>
                )}
                {previousEducation.start_date && previousEducation.end_date && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-slate-900">
                      Study Period
                    </dt>
                    <dd className="text-sm text-slate-500">
                      {`${formatDate(
                        previousEducation.start_date
                      )} - ${formatDate(previousEducation.end_date)}`}
                    </dd>
                  </div>
                )}
                {previousEducation.grade && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-slate-900">
                      GPA / Grade
                    </dt>
                    <dd className="text-sm font-bold text-slate-500">
                      {previousEducation.grade}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {hasEmergencyContact && (
            <div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <FaPhoneAlt className="text-xs text-red-600" />
                  <h4 className="text-p2 font-semibold tracking-wide text-red-700">
                    Emergency Contact
                  </h4>
                </div>
                <dl className="space-y-4">
                  {emergencyContact.name && (
                    <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                      <dt className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                        <FaUser /> Name
                      </dt>
                      <dd className="min-w-0 break-words text-sm text-slate-900">
                        {emergencyContact.name}
                      </dd>
                    </div>
                  )}
                  {emergencyContact.relation && (
                    <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                      <dt className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                        <FaUsers /> Relation
                      </dt>
                      <dd className="min-w-0 text-sm text-slate-900">
                        {emergencyContact.relation}
                      </dd>
                    </div>
                  )}
                  {emergencyContact.phone && (
                    <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                      <dt className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                        <FaPhoneAlt /> Phone
                      </dt>
                      <dd className="min-w-0 text-sm text-slate-900">
                        {emergencyContact.phone}
                      </dd>
                    </div>
                  )}
                  {emergencyContact.email && (
                    <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                      <dt className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                        <FaEnvelope /> Email
                      </dt>
                      <dd className="min-w-0 break-all text-sm text-slate-900">
                        {emergencyContact.email}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>

      {application && showRequiredActionPopup && (
        <RequiredAction
          isOpen={showRequiredActionPopup}
          onClose={closeRequiredActionPopup}
          applicationId={application.id}
        />
      )}

      {showArrivalPopup && (
        <ArrivalDate
          isOpen={showArrivalPopup}
          onClose={() => setShowArrivalPopup(false)}
          applicationId={application.id}
        />
      )}

      {showVisaPaymentPopup && (
        <VisaPaymentConfirmation
          isOpen={showVisaPaymentPopup}
          onClose={() => setShowVisaPaymentPopup(false)}
          applicationId={application.id}
        />
      )}

      {application && showProgramDecisionPopup && (
        <ProgramDecision
          isOpen={showProgramDecisionPopup}
          onClose={closeProgramDecisionPopup}
          applicationId={application.id}
          universityId={application.program?.university?.id || ""}
        />
      )}
    </section>
  );
}
