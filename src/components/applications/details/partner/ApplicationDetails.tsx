import React, { useState } from "react";

import { GraduationCap, Building2,  Globe, Calendar, ArrowRight, Wallet } from "lucide-react";
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
import { MdAssignmentTurnedIn } from "react-icons/md";
import { Clock, Upload, ClipboardCheck, CreditCard, Plane, CheckCircle, XCircle, FileUp } from 'lucide-react';
import Button from 'components/ui/buttons/Button';
import { useApplicationActions } from "hooks/applications/stages/useApplicationActions";

import ApplicationPartnerTopBar from "components/applications/topBar/PartnerTopBar";
import RequiredAction from "components/applications/popups/partner/RequiredAction";
import ProgramDecision from "components/applications/popups/partner/ProgramDecision";
import OfferLetterDecision from './OfferLetter';
import VisaTrackingTimeline from "./VisaTrackingTimeline";
import VisaPaymentConfirmation from "components/applications/popups/partner/VisaPaymentConfirmation";
import ArrivalDate from "components/applications/popups/partner/ArrivalDate";
import EmgsEvalUpload from "components/applications/popups/partner/EmgsEvaluationUpload";
import ApplicationCommission from './ApplicationCommission';
import { useToast } from '../../../context/ToastContext';
import Dispute from 'components/applications/popups/partner/UpdatedDispute';
import api from 'lib/useApi';
import ApplicationTimeline from '../ApplicationTimeline';
import { useVisaPaymentMethods } from "hooks/usePaymentMethods";

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

  const { methods, loading: paymentLoading } = useVisaPaymentMethods(application?.id);
  
  const { showToast } = useToast();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const { partner_actions } = actions || {};
  const confirmAction = partner_actions?.find(
    (a: any) => a.target_status_code === "APPLICATION_COMPLETE"
  );
  const disputeAction = partner_actions?.find(
    (a: any) => a.target_status_code === "COMMISSION_DISPUTED"
  );

  const handleCommissionConfirm = async () => {
    if (!confirmAction) return;
    try {
      setConfirmLoading(true);
      await api.post(`/applications/${application.id}/status`, {
        status_id: confirmAction.target_status_id,
        reason_text: null,
        notes: "Partner commission confirmed successfully",
      });
      showToast("Commission confirmed successfully", "success");
      setTimeout(() => window.location.reload(), 2000);
    } catch {
      showToast("Failed to confirm commission", "error");
    } finally {
      setConfirmLoading(false);
    }
  };

  const [showProgramDecisionPopup, setShowProgramDecisionPopup] =
    useState(false);
  const openProgramDecisionPopup = () => setShowProgramDecisionPopup(true);
  const closeProgramDecisionPopup = () => setShowProgramDecisionPopup(false);

  const [showVisaPaymentPopup, setShowVisaPaymentPopup] = useState(false);

  const stageName = stage?.name;
  const currentStatusCode =
    application?.status_code ||
    stage?.statuses?.[0]?.code;
  const currentStatusName = application?.status || stage?.statuses?.[0]?.name;

  const showVisaPayment =
    stageName === "Visa Processing" &&
    currentStatusCode === "WAITING_FOR_PAYMENT";

  const [showArrivalPopup, setShowArrivalPopup] = useState(false);
  const [showEmgsUploadPopup, setShowEmgsUploadPopup] = useState(false);

  const showArrivalConfirmation =
    stageName === "Student Arrival & Enrollment" &&
    currentStatusName === "Waiting Partner to confirm arrival date";

  const showEmgsUpload =
    stageName === "Visa Processing" &&
    (
      actions?.status_code === "EVAL_READY" ||
      actions?.status_code === "EVAL_PARTNER_UPLOAD" ||
      actions?.status_code === "EVAL_REUPLOAD_REQUIRED"
    );

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

      <div className="mb-5 mt-5 block space-y-2">

        <ApplicationPartnerTopBar application={application} />

          <div className=" block space-y-4 rounded-lg border border-slate-200 bg-card p-4 shadow-sm sm:p-6">
  
          {/* Top row: avatar + info | intake date */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-700 border-2 border-blue-200 text-xl font-bold text-white">
                {student.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <h2 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-slate-900">
                  {student.name}
                </h2>
                {application.intake_date && (
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 sm:hidden">
                    <Clock className="h-3 w-3" />
                    <span>Intake: {formatDate(application.intake_date)}</span>
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
  
  
            <div className="hidden sm:block shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-start shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Intake Date</p>
              <p className="mt-1 flex items-center justify-start gap-2 text-lg font-bold text-slate-900">
                <Calendar className="h-4 w-4 text-blue-400" />
                {formatDate(application.intake_date)}
              </p>
            </div>
          </div>
  
          {/* Bottom row: current status | next action */}
  
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 shadow-sm">
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
  
            <div className="grid grid-cols-1 gap-2 rounded-xl border-[2px] border-blue-200 bg-blue-50 p-5 shadow-sm">
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
          
          <div className="space-y-2">
                  {actions && (
                    <>
                      {actions.document_types?.length > 0 ? (
                        <button
                          onClick={openRequiredActionPopup}
                          className="flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-amber-600"
                        >
                          <Upload className="h-4 w-4" />
                          Upload Required Documents
                        </button>
                      ) : actions.stage_statuses?.some((status) => status.is_requires_reason) ? (
                        <button
                          onClick={openProgramDecisionPopup}
                          className="flex w-full items-center justify-center gap-2 rounded-md bg-violet-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-violet-600"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                          Submit Program Decision
                        </button>
                      ) : null}
                    </>
                  )}

                  {showVisaPayment && (

                    <div className="block space-y-4">

                      {showVisaPayment && (
                        <div className=" block space-y-4">

              {paymentLoading ? (
              <div className="border-gray-200">
                <p className="text-sm text-slate-500">Loading payment methods...</p>
              </div>
            ) : methods.length > 0 && (
              <div className="">
                <div className="mb-4 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Payment Methods</h4>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {methods.map((method: any) => (
                    <div
                      key={method.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-gray-900">{method.name}</span>
                        </div>
                        {method.currency && (
                          <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium uppercase text-blue-700">
                            {method.currency}
                          </span>
                        )}
                      </div>
                      {method.instructions && (
                        <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
                          {method.instructions}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="">
              <div className="" /></div>
            </div>
            )}

                    <button
                      type="button"
                      onClick={() => setShowVisaPaymentPopup(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-green-700"
                    >
                      <CreditCard className="h-4 w-4" />
                      Proceed to Payment
                    </button>

                  </div>

                  )}

                  {showArrivalConfirmation && (
                    <button
                      type="button"
                      onClick={() => setShowArrivalPopup(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-700"
                    >
                      <Plane className="h-4 w-4" />
                      Confirm Arrival
                    </button>
                  )}

                  {showEmgsUpload && (

                    <div className="block space-y-4">

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                
                      <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                          <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="mb-1 text-sm font-semibold text-slate-800">Download Your Eval</p>
                          <p className="mb-2 text-xs text-slate-500">Your evaluation is ready. Download it directly from the EMGS app.</p>
                          <a
                            href="https://www.youtube.com/shorts/fT4Wmm4eWwI"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                          >
                            View EMGS app instructions
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                
                      <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
                          <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="mb-1 text-sm font-semibold text-slate-800">Check Entry Requirements</p>
                          <p className="mb-2 text-xs text-slate-500">Verify whether you need an eVISA or Visa on Arrival before travelling to Malaysia.</p>
                          <a
                            href="https://educationmalaysia.gov.my/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:underline"
                          >
                            Visit Education Malaysia
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                        
                        </div>
                           
                      <button
                      type="button"
                      onClick={() => setShowEmgsUploadPopup(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700"
                    >
                      <FileUp className="h-4 w-4" />
                      Upload EMGS Eval
                    </button>

                    </div>
                    
                  )}

                  {!actionsLoading && (confirmAction || disputeAction) && (
                    <div className="flex flex-row gap-2">
                      {confirmAction && (
                        <Button
                          icon={<CheckCircle className="h-4 w-4" />}
                          text={confirmLoading ? "Processing..." : "Confirm"}
                          bgColor="bg-green-50"
                          textColor="text-green-700"
                          borderColor="border-green-600"
                          hoverTextColor="hover:text-green-800"
                          hoverBorderColor="hover:border-green-700"
                          className="w-full"
                          onClick={handleCommissionConfirm}
                          disabled={confirmLoading}
                        />
                      )}
                      {disputeAction && (
                        <Button
                          icon={<XCircle className="h-4 w-4" />}
                          text="Dispute"
                          bgColor="bg-red-50"
                          textColor="text-red-700"
                          borderColor="border-red-600"
                          hoverTextColor="hover:text-red-800"
                          hoverBorderColor="hover:border-red-700"
                          className="w-full"
                          onClick={() => setShowDispute(true)}
                        />
                      )}
                    </div>
                  )}
            </div>

        </div>


      </div>
      
      <ApplicationTimeline application={application} />
      <ApplicationCommission application={application} />
      <VisaTrackingTimeline application={application} />
      <OfferLetterDecision application={application} />

      <div className="mb-5 mt-5 block space-y-4 rounded-lg border border-gray-200 bg-card p-6 shadow-sm">
        <h3 className="text-p3 mb-6 flex items-center gap-3 font-semibold text-slate-900">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
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

      {showEmgsUploadPopup && (
        <EmgsEvalUpload
          isOpen={showEmgsUploadPopup}
          onClose={() => setShowEmgsUploadPopup(false)}
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

      {showDispute && disputeAction && (
        <Dispute
          isOpen={showDispute}
          onClose={() => setShowDispute(false)}
          applicationId={application.id}
          statusId={disputeAction.target_status_id}
        />
      )}
    </section>
  );
}
