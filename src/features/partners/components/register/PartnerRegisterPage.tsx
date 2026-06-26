"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Building2, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { usePartnerRegistration, useVerifyRegistrationOtp, useResendRegistrationOtp } from "features/partners/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { COUNTRIES, BACKGROUND_OPTIONS } from "constants/lists";
import InputField from "components/form/fields/InputField";
import SelectField from "components/form/fields/SelectField";
import PhoneInputField from "components/form/fields/PhoneInputField";
import PublicFileUploadField, { type PublicUploadResult } from "components/form/upload/PublicFileUploadField";
import Button from "components/ui/buttons/Button";
import logoImg from "/public/img/brand/Primary-Logo-Blue.png";
import registrationIconImg from "/public/img/icons/registration-icon.png";
import crosshairIconImg from "/public/img/icons/crosshair-icon.png";
import PublicNavbar from "components/navbar/PublicNavbar";

type Step = "form" | "otp" | "success";
type PartnerType = "individual" | "company";

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.name, label: c.name }));

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-200 p-6 last:border-b-0">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function PartnerRegisterPage() {
  const { initiateRegistration, loading: submitting, error: apiError } = usePartnerRegistration();
  const { verifyOtp, loading: verifyLoading, error: otpError } = useVerifyRegistrationOtp();
  const { resendOtp, loading: resendLoading, error: resendError } = useResendRegistrationOtp();

  const [step, setStep] = useState<Step>("form");
  const [partnerType, setPartnerType] = useState<PartnerType | null>(null);
  const [registrationEmail, setRegistrationEmail] = useState("");

  const [otp, setOtp] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Individual form
  const [indForm, setIndForm] = useState({
    first_name: "", last_name: "", email: "",
    phone_code: "+60", phone_number: "",
    country: "", background: "",
    social_media_url: "", linkedin_url: "",
    agreed: false,
  });
  const [indIdDoc, setIndIdDoc] = useState<PublicUploadResult | null>(null);
  const [indIdDocName, setIndIdDocName] = useState("");

  // Company form
  const [compForm, setCompForm] = useState({
    company_name: "", country: "", website_url: "",
    contact_full_name: "", contact_email: "",
    contact_phone_code: "+60", contact_phone_number: "",
    agreed: false,
  });
  const [compRegDoc, setCompRegDoc] = useState<PublicUploadResult | null>(null);
  const [compRegDocName, setCompRegDocName] = useState("");
  const [compContactIdDoc, setCompContactIdDoc] = useState<PublicUploadResult | null>(null);
  const [compContactIdDocName, setCompContactIdDocName] = useState("");

  const updateInd = (field: string, value: unknown) => {
    setIndForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const updateComp = (field: string, value: unknown) => {
    setCompForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validateInd = () => {
    const e: Record<string, string> = {};
    if (!indForm.first_name.trim()) e.first_name = "First name is required";
    else if (indForm.first_name.trim().length < 5) e.first_name = "First name must be at least 5 characters";
    if (!indForm.last_name.trim()) e.last_name = "Last name is required";
    else if (indForm.last_name.trim().length < 5) e.last_name = "Last name must be at least 5 characters";
    if (!indForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(indForm.email)) e.email = "Enter a valid email";
    if (!indForm.phone_number.trim()) e.phone_number = "Phone number is required";
    if (!indForm.country) e.country = "Country is required";
    if (!indForm.background) e.background = "Please select your background";
    if (!indIdDoc) e.ind_id_doc = "Please upload your passport or national ID";
    if (!indForm.agreed) e.agreed = "You must agree to the Terms and Conditions";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateComp = () => {
    const e: Record<string, string> = {};
    if (!compForm.company_name.trim()) e.company_name = "Company name is required";
    else if (compForm.company_name.trim().length < 5) e.company_name = "Company name must be at least 5 characters";
    if (!compForm.country) e.country = "Country is required";
    if (!compForm.website_url.trim()) e.website_url = "Website or social media URL is required";
    if (!compRegDoc) e.comp_reg_doc = "Please upload your company registration document";
    if (!compForm.contact_full_name.trim()) e.contact_full_name = "Full name is required";
    else if (compForm.contact_full_name.trim().length < 5) e.contact_full_name = "Full name must be at least 5 characters";
    if (!compForm.contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(compForm.contact_email)) e.contact_email = "Enter a valid email";
    if (!compForm.contact_phone_number.trim()) e.contact_phone_number = "Phone number is required";
    if (!compContactIdDoc) e.comp_contact_id_doc = "Please upload a passport or national ID";
    if (!compForm.agreed) e.agreed = "You must agree to the Terms and Conditions";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isFormComplete = partnerType === "individual"
    ? Boolean(
        indForm.first_name.trim() && indForm.last_name.trim() &&
        indForm.email && indForm.phone_number.trim() &&
        indForm.country && indForm.background &&
        indIdDoc && indForm.agreed,
      )
    : partnerType === "company"
    ? Boolean(
        compForm.company_name.trim() && compForm.country &&
        compForm.website_url.trim() && compRegDoc &&
        compForm.contact_full_name.trim() && compForm.contact_email &&
        compForm.contact_phone_number.trim() && compContactIdDoc &&
        compForm.agreed,
      )
    : false;

  const handleSubmit = async () => {
    if (partnerType === "individual" ? !validateInd() : !validateComp()) return;

    const payload = partnerType === "individual"
      ? {
          partner_type: "individual",
          full_name: `${indForm.first_name.trim()} ${indForm.last_name.trim()}`,
          email: indForm.email,
          phone: `${indForm.phone_code} ${indForm.phone_number}`,
          country: indForm.country,
          background: indForm.background,
          ...(indIdDoc && { id_document_file_key: indIdDoc.file_key, id_document_file_url: indIdDoc.file_url }),
          ...(indForm.social_media_url && { social_media_url: indForm.social_media_url }),
          ...(indForm.linkedin_url && { linkedin_url: indForm.linkedin_url }),
        }
      : {
          partner_type: "agency",
          full_name: compForm.contact_full_name.trim(),
          email: compForm.contact_email,
          phone: `${compForm.contact_phone_code} ${compForm.contact_phone_number}`,
          country: compForm.country,
          company_name: compForm.company_name.trim(),
          website_url: compForm.website_url,
          ...(compRegDoc      && { company_registration_doc_file_key: compRegDoc.file_key,      company_registration_doc_file_url: compRegDoc.file_url }),
          ...(compContactIdDoc && { contact_id_document_file_key: compContactIdDoc.file_key, contact_id_document_file_url: compContactIdDoc.file_url }),
        };
    try {
      await initiateRegistration(payload);
      setRegistrationEmail(partnerType === "individual" ? indForm.email : compForm.contact_email);
      setResendCooldown(60);
      setStep("otp");
    } catch { /* error shown via hook */ }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    try {
      await verifyOtp(registrationEmail, otp);
      setStep("success");
    } catch { /* error shown via hook */ }
  };

  const handleResendOtp = async () => {
    setResendSuccess(false);
    try {
      await resendOtp(registrationEmail);
      setResendSuccess(true);
      setResendCooldown(60);
    } catch { /* error shown via hook */ }
  };

  // ── Success ──────────────────────────────────────────────────────────────

  if (step === "success") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-7 py-10 text-center shadow-sm">
          <div className="mb-5 flex justify-center">
            <Image src={logoImg} alt="Unibexs" width={110} height={36} className="object-contain" priority />
          </div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Application Submitted!</h2>
          <p className="mt-2 text-sm text-slate-500">
            Your application has been received. Our team will review it and get back to you shortly.
          </p>
          <Link href="/auth/sign-in"
            className="mt-6 block w-full rounded-lg bg-blue-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // ── OTP ──────────────────────────────────────────────────────────────────

  if (step === "otp") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-7 py-10 shadow-sm">
          <div className="mb-6 flex justify-center">
            <Image src={logoImg} alt="Unibexs" width={110} height={36} className="object-contain" priority />
          </div>
          <h2 className="text-center text-xl font-bold text-slate-900">Verify your email</h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            We sent a 6-digit verification code to{" "}
            <span className="font-medium text-slate-700">{registrationEmail}</span>
          </p>
          <div className="mt-6">
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="• • • • • •"
              className={`w-full rounded-lg border px-4 py-3 text-center text-lg font-semibold tracking-widest outline-none transition focus:ring-1 focus:ring-blue-500 ${
                otpError ? "border-red-400 bg-red-50" : "border-slate-200"
              }`}
            />
            {otpError && <p className="mt-1.5 text-center text-sm text-red-600">{otpError}</p>}
          </div>
          <Button
            onClick={handleVerifyOtp}
            disabled={verifyLoading || otp.length < 6}
            text={verifyLoading ? "Verifying..." : "Verify OTP"}
            bgColor="bg-blue-600"
            textColor="text-white"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-white"
            hoverBorderColor="hover:border-blue-700"
            className="mt-4 w-full py-3 hover:bg-blue-700"
          />
          <div className="mt-4 space-y-2 text-center">
            {resendSuccess && (
              <p className="text-sm text-green-600">Code resent — check your inbox.</p>
            )}
            {resendError && (
              <p className="text-sm text-red-600">{resendError}</p>
            )}
            {resendCooldown > 0 ? (
              <p className="text-sm text-slate-400">
                Resend available in <span className="font-medium text-slate-600">{resendCooldown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="text-sm text-slate-500 transition hover:text-blue-600 disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Didn't receive it? Resend code"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <PublicNavbar />

      {/* Hero */}
      <div className="relative mx-auto max-w-5xl overflow-hidden px-4 py-12 sm:py-20">
        <Image src={registrationIconImg} alt="" width={250} height={250}
          className="pointer-events-none absolute left-0 top-0 opacity-60" />
        <Image src={registrationIconImg} alt="" width={250} height={250}
          className="pointer-events-none absolute right-0 top-0 opacity-60" />
        <div className="relative text-center">
          <h1 className="text-5xl text-slate-900 sm:text-6xl">
            Ready to <span className="text-blue-600">connect?</span>
          </h1>
          <Image src={crosshairIconImg} alt="" width={80} height={80} className="mx-auto my-3" />
          <p className="text-base text-slate-500">
            Ready to connect? Drop us a message and we'll get back fast.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Type switcher */}
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          {([
            { type: "individual" as const, icon: User,     title: "Individual Advisor", desc: "Apply as an independent education advisor" },
            { type: "company"    as const, icon: Building2, title: "Company / Agency",  desc: "Apply as an education agency or company" },
          ]).map(({ type, icon: Icon, title, desc }) => (
            <button key={type} type="button"
              onClick={() => { setPartnerType(type); setErrors({}); }}
              className={`group flex items-center gap-4 rounded-xl border p-5 text-left transition ${
                partnerType === type
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <div className={`rounded-lg p-2.5 transition-colors ${partnerType === type ? "bg-blue-100" : "bg-slate-100 group-hover:bg-blue-100"}`}>
                <Icon className={`h-5 w-5 transition-colors ${partnerType === type ? "text-blue-600" : "text-slate-500 group-hover:text-blue-600"}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold transition-colors ${partnerType === type ? "text-blue-700" : "text-slate-800 group-hover:text-blue-700"}`}>{title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
              </div>
              <ChevronRight className={`h-4 w-4 shrink-0 transition-all duration-200 ${partnerType === type ? "rotate-90 text-blue-500" : "text-slate-300 group-hover:text-blue-400"}`} />
            </button>
          ))}
        </div>

        <AnimatePresence>
          {partnerType !== null && (
            <motion.div
              key={partnerType}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="border-y border-slate-200 p-6">
                <h2 className="text-xl font-bold text-blue-600">
                  {partnerType === "individual" ? "Individual Advisor" : "Company / Agency"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {partnerType === "individual"
                    ? "Apply as an independent education advisor"
                    : "Apply as an education agency or company"}
                </p>
              </div>

              {partnerType === "individual" ? (
                <>
                  <SectionCard title="Basic Information">
                    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                      <InputField label="First Name" field="first_name" placeholder="Ahmed"
                        formData={indForm} errors={errors} updateFormData={updateInd} />
                      <InputField label="Last Name" field="last_name" placeholder="Ali"
                        formData={indForm} errors={errors} updateFormData={updateInd} />
                    </div>
                    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                      <InputField label="Email Address" field="email" type="email" placeholder="name@mail.com"
                        formData={indForm} errors={errors} updateFormData={updateInd} />
                      <PhoneInputField dialCodeField="phone_code" numberField="phone_number"
                        formData={indForm} errors={errors} updateFormData={updateInd} />
                    </div>
                    <SelectField label="Country of Residence" field="country" options={COUNTRY_OPTIONS}
                      formData={indForm} errors={errors} updateFormData={updateInd} />
                  </SectionCard>

                  <SectionCard title="Background" subtitle="Which best describes you?">
                    <div className="space-y-2">
                      {BACKGROUND_OPTIONS.map((opt) => (
                        <label key={opt.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
                            indForm.background === opt.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}>
                          <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                            indForm.background === opt.value ? "border-blue-500" : "border-slate-300"
                          }`}>
                            {indForm.background === opt.value && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                          </div>
                          <input type="radio" name="background" value={opt.value} className="hidden"
                            checked={indForm.background === opt.value}
                            onChange={() => updateInd("background", opt.value)} />
                          <span className="text-sm text-slate-700">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.background && <p className="mt-2 text-xs text-red-600">{errors.background}</p>}
                  </SectionCard>

                  <SectionCard title="Identity Verification"
                    subtitle="To ensure trust and authenticity, all advisors must verify their identity.">
                    <PublicFileUploadField
                      label="Passport or National ID"
                      fieldId="ind-id-doc"
                      required
                      result={indIdDoc}
                      fileName={indIdDocName}
                      onUpload={(res, name) => { setIndIdDoc(res); setIndIdDocName(name); }}
                      onRemove={() => { setIndIdDoc(null); setIndIdDocName(""); }}
                      error={errors.ind_id_doc}
                    />
                    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                      <InputField label="Social Media Profile" field="social_media_url" required={false}
                        placeholder="instagram.com/username"
                        formData={indForm} errors={errors} updateFormData={updateInd} />
                      <InputField label="LinkedIn Profile" field="linkedin_url" required={false}
                        placeholder="linkedin.com/in/yourprofile"
                        formData={indForm} errors={errors} updateFormData={updateInd} />
                    </div>
                  </SectionCard>
                </>
              ) : (
                <>
                  <SectionCard title="Company Information">
                    <InputField label="Company Name" field="company_name" placeholder="Enter company name."
                      formData={compForm} errors={errors} updateFormData={updateComp} />
                    <SelectField label="Country of Registration" field="country" options={COUNTRY_OPTIONS}
                      formData={compForm} errors={errors} updateFormData={updateComp} />
                    <InputField label="Website or Social Media Page" field="website_url"
                      placeholder="https://yourcompany.com"
                      formData={compForm} errors={errors} updateFormData={updateComp} />
                  </SectionCard>

                  <SectionCard title="Company Documents">
                    <PublicFileUploadField
                      label="Company Registration Document"
                      fieldId="comp-reg-doc"
                      required
                      result={compRegDoc}
                      fileName={compRegDocName}
                      onUpload={(res, name) => { setCompRegDoc(res); setCompRegDocName(name); }}
                      onRemove={() => { setCompRegDoc(null); setCompRegDocName(""); }}
                      error={errors.comp_reg_doc}
                    />
                  </SectionCard>

                  <SectionCard title="Person in Charge">
                    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                      <InputField label="Full Name" field="contact_full_name" placeholder="Enter full name."
                        formData={compForm} errors={errors} updateFormData={updateComp} />
                      <InputField label="Email Address" field="contact_email" type="email"
                        placeholder="contact@company.com"
                        formData={compForm} errors={errors} updateFormData={updateComp} />
                    </div>
                    <PhoneInputField dialCodeField="contact_phone_code" numberField="contact_phone_number"
                      formData={compForm} errors={errors} updateFormData={updateComp} />
                    <PublicFileUploadField
                      label="Passport or National ID"
                      fieldId="comp-contact-id-doc"
                      required
                      result={compContactIdDoc}
                      fileName={compContactIdDocName}
                      onUpload={(res, name) => { setCompContactIdDoc(res); setCompContactIdDocName(name); }}
                      onRemove={() => { setCompContactIdDoc(null); setCompContactIdDocName(""); }}
                      error={errors.comp_contact_id_doc}
                    />
                  </SectionCard>
                </>
              )}

              {/* T&C */}
              <div className="border-y border-slate-200 p-6">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={partnerType === "individual" ? indForm.agreed : compForm.agreed}
                    onChange={(e) => partnerType === "individual"
                      ? updateInd("agreed", e.target.checked)
                      : updateComp("agreed", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                  />
                  <span className="text-sm text-slate-600">
                    I have read and agree to the{" "}
                    <a href="https://www.unibexs.com/terms-of-service" target="_blank" rel="noopener noreferrer"
                      className="font-medium text-blue-600 underline">
                      Terms and Conditions
                    </a>
                  </span>
                </label>
                {errors.agreed && <p className="mt-2 text-xs text-red-600">{errors.agreed}</p>}
              </div>

              <div className="space-y-3 p-6">
                {apiError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {apiError}
                  </div>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !isFormComplete}
                  text={submitting ? "Submitting..." : "Submit Application"}
                  bgColor="bg-blue-600"
                  textColor="text-white"
                  borderColor="border-blue-600"
                  hoverTextColor="hover:text-white"
                  hoverBorderColor="hover:border-blue-700"
                  className="w-full py-3 hover:bg-blue-700"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
