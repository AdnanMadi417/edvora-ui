"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Building2, AlertCircle, CheckCircle2, ChevronRight, Briefcase, Presentation, GraduationCap, UserRound } from "lucide-react";
import RadioCardGroup from "components/ub/forms/choices/RadioCardGroup";
import { FieldError } from "components/ub/forms/layout/FieldChrome";
import { usePartnerRegistration } from "features/partners/hooks";
import OtpStep from "./OtpStep";
import EnterVerificationCodeModal from "./EnterVerificationCodeModal";
import { AnimatePresence, motion } from "framer-motion";
import { COUNTRY_OPTIONS, isKnownCountry, NATIONALITIES, BACKGROUND_OPTIONS } from "constants/lists";
import InputField from "components/ub/forms/text/InputField";
import SelectField from "components/ub/forms/selection/SelectField";
import SearchableDropdown from "components/ub/forms/selection/SearchableDropdown";
import PhoneInputField from "components/ub/forms/text/PhoneInputField";
import { isValidWebsiteUrl } from "utils/socialMedia";
import PublicFileUploadField, { type PublicUploadResult } from "components/ub/forms/uploads/PublicFileUploadField";
import ImageUpload from "components/ub/forms/uploads/ImageUpload";
import { uploadPublicPartnerFile } from "services/publicUploadService";
import { parseApiError } from "utils/parseApiError";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import Button from "components/ub/core/buttons/Button";
import logoImg from "/public/img/brand/Primary-Logo-Blue.png";
import registrationIconImg from "/public/img/icons/registration-icon.png";
import crosshairIconImg from "/public/img/icons/crosshair-icon.png";
import PublicNavbar from "components/ub/navigation/layout/PublicNavbar";

type Step = "form" | "otp" | "success"; // "otp" rendered by OtpStep
type PartnerType = "individual" | "agency";

const NATIONALITY_OPTIONS = NATIONALITIES.map((n) => ({ value: n.name, label: n.name }));

// Maps this backend endpoint's field names (from a 422 validation error's
// `loc` path) to this form's own field/error keys, wherever they differ —
// derived directly from how the submit payload below is built.
const IND_FIELD_MAP: Record<string, string> = {
  full_name: "name",
  phone: "phone_number",
  passport_photo_file_url: "ind_passport_photo",
  passport_photo_file_key: "ind_passport_photo",
  profile_photo_file_url: "ind_profile_photo",
  profile_photo_file_key: "ind_profile_photo",
};

const COMP_FIELD_MAP: Record<string, string> = {
  full_name: "contact_full_name",
  email: "contact_email",
  phone: "contact_phone_number",
  company_registration_doc_file_url: "comp_reg_doc",
  company_registration_doc_file_key: "comp_reg_doc",
  passport_photo_file_url: "comp_passport_photo",
  passport_photo_file_key: "comp_passport_photo",
  logo_file_url: "comp_logo",
  logo_file_key: "comp_logo",
};

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-ub-border p-6 last:border-b-0">
      <h3 className="text-base font-semibold text-ub-text-primary">{title}</h3>
      {subtitle && <p className="mt-0.5 text-sm text-ub-text-secondary">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function usePublicPhotoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleSelect = async (selected: File) => {
    setFile(selected);
    setUploading(true);
    setProgress(0);
    setFileKey("");
    setFileUrl("");
    setError("");
    try {
      const result = await uploadPublicPartnerFile(selected, setProgress);
      setFileKey(result.file_key);
      setFileUrl(result.file_url);
    } catch (err: unknown) {
      setFile(null);
      setError(parseApiError(err, "Upload failed. Please try again."));
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setFileKey("");
    setFileUrl("");
    setProgress(0);
    setError("");
  };

  return { file, fileKey, fileUrl, uploading, progress, error, handleSelect, handleRemove };
}

// One icon per "Which best describes you?" option.
const BACKGROUND_ICONS: Record<string, typeof UserRound> = {
  agent: Briefcase,
  teacher: Presentation,
  student: GraduationCap,
  other: UserRound,
};

export default function PartnerRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initiateRegistration, loading: submitting, error: apiError } = usePartnerRegistration();

  const [step, setStep] = useState<Step>(() => {
    const urlStep = searchParams.get("step");
    const urlEmail = searchParams.get("email");
    if (urlStep === "otp" && urlEmail) return "otp";
    if (urlStep === "success") return "success";
    return "form";
  });
  const [partnerType, setPartnerType] = useState<PartnerType | null>(null);
  const [registrationEmail, setRegistrationEmail] = useState(() => searchParams.get("email") || "");
  const [showCodeEntry, setShowCodeEntry] = useState(() => searchParams.get("showCodeEntry") === "1");

  const goToOtpStep = (email: string) => {
    setRegistrationEmail(email);
    setStep("otp");
    router.replace(`/apply-as-adviser?step=otp&email=${encodeURIComponent(email)}`);
    setShowCodeEntry(false);
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasFieldLevelApiError, setHasFieldLevelApiError] = useState(false);

  const handleApiError = useApiFormErrors({
    fieldMap: partnerType === "agency" ? COMP_FIELD_MAP : IND_FIELD_MAP,
    emailField: partnerType === "agency" ? "contact_email" : "email",
    setErrors: (patch) => {
      setErrors((p) => ({ ...p, ...patch }));
      setHasFieldLevelApiError(true);
      scrollToFirstError(patch);
    },
    onUnmappedError: () => setHasFieldLevelApiError(false),
  });

  // Individual form
  const [indForm, setIndForm] = useState({
    name: "", email: "",
    phone_code: "+60", phone_number: "",
    country: "", nationality: "", background: "",
    date_of_birth: "", passport_number: "",
    social_media_url: "",
    linkedin_url: "",
    agreed: false,
  });
  const [indPassportPhoto, setIndPassportPhoto] = useState<PublicUploadResult | null>(null);
  const [indPassportPhotoName, setIndPassportPhotoName] = useState("");
  const indProfilePhoto = usePublicPhotoUpload();

  // Company form
  const [compForm, setCompForm] = useState({
    company_name: "", country: "",
    website_url: "",
    contact_full_name: "", contact_email: "",
    contact_phone_code: "+60", contact_phone_number: "",
    nationality: "", date_of_birth: "", passport_number: "",
    agreed: false,
  });
  const [compRegDoc, setCompRegDoc] = useState<PublicUploadResult | null>(null);
  const [compRegDocName, setCompRegDocName] = useState("");
  const [compPassportPhoto, setCompPassportPhoto] = useState<PublicUploadResult | null>(null);
  const [compPassportPhotoName, setCompPassportPhotoName] = useState("");
  const compLogo = usePublicPhotoUpload();

  const updateInd = (field: string, value: unknown) => {
    setIndForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const updateComp = (field: string, value: unknown) => {
    setCompForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const computeIndErrors = () => {
    const e: Record<string, string> = {};
    if (!indForm.name.trim()) e.name = "Name is required";
    else if (indForm.name.trim().length < 3) e.name = "Name must be at least 3 characters";
    if (!indForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(indForm.email)) e.email = "Enter a valid email";
    if (!indForm.phone_number.trim()) e.phone_number = "Phone number is required";
    if (!indForm.country) e.country = "Country is required";
    else if (!isKnownCountry(indForm.country)) e.country = "Select a country from the list";
    if (!indForm.nationality) e.nationality = "Nationality is required";
    if (!indForm.background) e.background = "Please select your background";
    if (!indForm.date_of_birth) e.date_of_birth = "Date of birth is required";
    if (!indForm.passport_number.trim()) e.passport_number = "Passport number is required";
    if (!indProfilePhoto.fileKey) e.ind_profile_photo = "Profile photo is required";
    if (!indPassportPhoto) e.ind_passport_photo = "Please upload your passport photo";
    if (!indForm.social_media_url.trim()) e.social_media_url = "Social media URL is required";
    else if (!isValidWebsiteUrl(indForm.social_media_url)) e.social_media_url = "Enter a valid URL starting with https://";
    if (indForm.linkedin_url && !isValidWebsiteUrl(indForm.linkedin_url))
      e.linkedin_url = "Enter a valid URL starting with https://";
    if (!indForm.agreed) e.agreed = "You must agree to the Terms and Conditions";
    return e;
  };

  const validateInd = () => {
    const e = computeIndErrors();
    setErrors(e);
    if (Object.keys(e).length > 0) scrollToFirstError(e);
    return Object.keys(e).length === 0;
  };

  const validateIndField = (field: string) => {
    const e = computeIndErrors();
    setErrors((prev) => ({ ...prev, [field]: e[field] ?? "" }));
  };

  const computeCompErrors = () => {
    const e: Record<string, string> = {};
    if (!compForm.company_name.trim()) e.company_name = "Agency name is required";
    else if (compForm.company_name.trim().length < 3) e.company_name = "Agency name must be at least 3 characters";
    if (!compForm.country) e.country = "Country is required";
    else if (!isKnownCountry(compForm.country)) e.country = "Select a country from the list";
    if (!compLogo.fileKey) e.comp_logo = "Agency logo is required";
    if (!compForm.website_url.trim()) e.website_url = "Website URL is required";
    else if (!isValidWebsiteUrl(compForm.website_url)) e.website_url = "Enter a valid URL starting with https://";
    if (!compRegDoc) e.comp_reg_doc = "Please upload your agency registration document";
    if (!compForm.contact_full_name.trim()) e.contact_full_name = "Full name is required";
    else if (compForm.contact_full_name.trim().length < 3) e.contact_full_name = "Full name must be at least 3 characters";
    if (!compForm.contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(compForm.contact_email)) e.contact_email = "Enter a valid email";
    if (!compForm.contact_phone_number.trim()) e.contact_phone_number = "Phone number is required";
    if (!compForm.nationality) e.nationality = "Nationality is required";
    if (!compForm.date_of_birth) e.date_of_birth = "Date of birth is required";
    if (!compForm.passport_number.trim()) e.passport_number = "Passport number is required";
    if (!compPassportPhoto) e.comp_passport_photo = "Please upload a passport photo";
    if (!compForm.agreed) e.agreed = "You must agree to the Terms and Conditions";
    return e;
  };

  const validateComp = () => {
    const e = computeCompErrors();
    setErrors(e);
    if (Object.keys(e).length > 0) scrollToFirstError(e);
    return Object.keys(e).length === 0;
  };

  const validateCompField = (field: string) => {
    const e = computeCompErrors();
    setErrors((prev) => ({ ...prev, [field]: e[field] ?? "" }));
  };

  const isFormComplete = partnerType === "individual"
    ? Object.keys(computeIndErrors()).length === 0
    : partnerType === "agency"
    ? Object.keys(computeCompErrors()).length === 0
    : false;

  const handleSubmit = async () => {
    if (partnerType === "individual" ? !validateInd() : !validateComp()) return;
    setHasFieldLevelApiError(false);

    const payload = partnerType === "individual"
      ? {
          partner_type: "individual",
          full_name: indForm.name.trim(),
          email: indForm.email,
          phone: `${indForm.phone_code} ${indForm.phone_number}`,
          country: indForm.country,
          nationality: indForm.nationality,
          background: indForm.background,
          date_of_birth: indForm.date_of_birth,
          passport_number: indForm.passport_number.trim(),
          ...(indPassportPhoto && { passport_photo_file_key: indPassportPhoto.file_key, passport_photo_file_url: indPassportPhoto.file_url }),
          ...(indProfilePhoto.fileKey && { profile_photo_file_key: indProfilePhoto.fileKey, profile_photo_file_url: indProfilePhoto.fileUrl }),
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
          nationality: compForm.nationality,
          date_of_birth: compForm.date_of_birth,
          passport_number: compForm.passport_number.trim(),
          ...(compRegDoc      && { company_registration_doc_file_key: compRegDoc.file_key,      company_registration_doc_file_url: compRegDoc.file_url }),
          ...(compPassportPhoto && { passport_photo_file_key: compPassportPhoto.file_key, passport_photo_file_url: compPassportPhoto.file_url }),
          ...(compLogo.fileKey && { logo_file_key: compLogo.fileKey, logo_file_url: compLogo.fileUrl }),
        };
    try {
      await initiateRegistration(payload);
      goToOtpStep(partnerType === "individual" ? indForm.email : compForm.contact_email);
    } catch (err: unknown) {
      handleApiError(err, "");
    }
  };

  if (step === "otp") {
    return (
      <OtpStep
        email={registrationEmail}
        onSuccess={() => { setStep("success"); router.replace("/apply-as-adviser?step=success"); }}
        onRestart={() => { setStep("form"); router.replace("/apply-as-adviser"); }}
      />
    );
  }

  if (step === "success") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ub-surface-subtle px-4">
        <div className="w-full max-w-sm overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface px-7 py-10 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <Image src={logoImg} alt="Unibexs" width={110} height={36} className="object-contain" priority />
          </div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ub-tone-success-bg">
            <CheckCircle2 className="h-8 w-8 text-ub-tone-success-text" />
          </div>
          <h2 className="text-xl font-bold text-ub-text-primary">Application Submitted!</h2>
          <p className="mt-2 text-sm text-ub-text-secondary">
            Your application has been received. Our team will review it and get back to you shortly.
          </p>
          <Link href="/"
            className="mt-6 block w-full rounded-lg bg-ub-action-primary py-3 text-center text-sm font-semibold text-white transition hover:bg-ub-action-primary-hover">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ub-surface-subtle pb-16">
      <PublicNavbar />

      {/* Hero */}
      <div className="relative mx-auto max-w-5xl overflow-hidden px-4 py-12 sm:py-20">
        <Image src={registrationIconImg} alt="" width={250} height={250}
          className="pointer-events-none absolute left-0 top-0 opacity-60" />
        <Image src={registrationIconImg} alt="" width={250} height={250}
          className="pointer-events-none absolute right-0 top-0 opacity-60" />
        <div className="relative flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl text-ub-text-primary sm:text-6xl">
            Become a Unibexs <span className="text-ub-text-link">Advisor</span>
          </h1>
          <Image src={crosshairIconImg} alt="" width={80} height={80} className="mx-auto" />
          <p className="max-w-xl text-base text-ub-text-secondary">
            Help students apply to universities through Unibexs, and track every application and commission in one place.
          </p>
          {/* What applying involves, before the individual / agency choice below. */}
          <ul className="grid w-full max-w-3xl gap-3 text-left sm:grid-cols-3">
            {[
              { title: "What you earn", text: "Commission on every student you place, with each payment tracked in your portal." },
              { title: "What you need", text: "Individuals: passport and a profile photo. Agencies: registration document, logo and website." },
              { title: "What happens next", text: "We check your email, our team reviews your details, and we email you the decision." },
            ].map((point) => (
              <li key={point.title} className="rounded-ub-lg border border-ub-border bg-ub-surface p-4">
                <p className="text-ub-label-md text-ub-text-primary">{point.title}</p>
                <p className="mt-1 text-ub-body-sm text-ub-text-secondary">{point.text}</p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setShowCodeEntry(true)}
            className="text-sm font-medium text-ub-text-link underline-offset-2 transition hover:text-ub-text-link hover:underline"
          >
            Already have a verification code?
          </button>
        </div>
      </div>

      <EnterVerificationCodeModal
        isOpen={showCodeEntry}
        onClose={() => setShowCodeEntry(false)}
        onContinue={goToOtpStep}
      />

      <div className="mx-auto max-w-3xl px-4">
      <div className="overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface shadow-sm">
        {/* Type switcher */}
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          {([
            { type: "individual" as const, icon: User,     title: "Individual Advisor", desc: "You work on your own" },
            { type: "agency"    as const, icon: Building2, title: "Company / Agency",  desc: "You apply for a registered agency" },
          ]).map(({ type, icon: Icon, title, desc }) => (
            <button key={type} type="button"
              onClick={() => { setPartnerType(type); setErrors({}); }}
              className={`group flex items-center gap-4 rounded-xl border p-5 text-left transition ${
                partnerType === type
                  ? "border-ub-action-primary bg-ub-tone-brand-bg shadow-sm"
                  : "border-ub-border bg-ub-surface hover:border-ub-tone-brand-border hover:bg-ub-tone-brand-bg"
              }`}
            >
              <div className={`rounded-lg p-2.5 transition-colors ${partnerType === type ? "bg-ub-tone-brand-bg" : "bg-ub-surface-subtle group-hover:bg-ub-tone-brand-bg"}`}>
                <Icon className={`h-5 w-5 transition-colors ${partnerType === type ? "text-ub-text-link" : "text-ub-text-secondary group-hover:text-ub-text-link"}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold transition-colors ${partnerType === type ? "text-ub-text-link" : "text-ub-text-primary group-hover:text-ub-text-link"}`}>{title}</p>
                <p className="mt-0.5 text-xs text-ub-text-secondary">{desc}</p>
              </div>
              <ChevronRight className={`h-4 w-4 shrink-0 transition-all duration-200 ${partnerType === type ? "rotate-90 text-ub-icon-interactive" : "text-ub-text-tertiary group-hover:text-ub-icon-interactive"}`} />
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
              <div className="border-y border-ub-border p-6">
                <h2 className="text-xl font-bold text-ub-text-link">
                  {partnerType === "individual" ? "Individual Advisor" : "Company / Agency"}
                </h2>
                <p className="mt-1 text-sm text-ub-text-secondary">
                  {partnerType === "individual"
                    ? "Apply as an independent education advisor"
                    : "Apply as an education agency or company"}
                </p>
              </div>

              {partnerType === "individual" ? (
                <>
                  <SectionCard title="Basic Information">
                    <ImageUpload
                      label="Profile Photo"
                      id="ind_profile_photo"
                      required
                      file={indProfilePhoto.file}
                      onFileChange={indProfilePhoto.handleSelect}
                      onRemove={indProfilePhoto.handleRemove}
                      uploading={indProfilePhoto.uploading}
                      progress={indProfilePhoto.progress}
                      error={indProfilePhoto.error || errors.ind_profile_photo}
                    />
                    <InputField label="Name (as per Passport)" field="name" placeholder="Ahmed Ali"
                      formData={indForm} errors={errors} updateFormData={updateInd}
                      onBlur={() => validateIndField("name")} />
                    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                      <InputField label="Email Address" field="email" type="email" placeholder="name@mail.com"
                        formData={indForm} errors={errors} updateFormData={updateInd}
                        onBlur={() => validateIndField("email")} />
                      <PhoneInputField dialCodeField="phone_code" numberField="phone_number"
                        formData={indForm} errors={errors} updateFormData={updateInd}
                        onBlur={() => validateIndField("phone_number")} />
                    </div>
                    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                      <SelectField label="Country of Residence" field="country" options={COUNTRY_OPTIONS}
                        formData={indForm} errors={errors} updateFormData={updateInd}
                        onBlur={() => validateIndField("country")} />
                      <SearchableDropdown label="Nationality" field="nationality" options={NATIONALITY_OPTIONS}
                        formData={indForm} errors={errors} updateFormData={updateInd}
                        onBlur={() => validateIndField("nationality")} />
                    </div>
                    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                      <InputField label="Date of Birth" field="date_of_birth" type="date"
                        formData={indForm} errors={errors} updateFormData={updateInd}
                        onBlur={() => validateIndField("date_of_birth")} />
                      <InputField label="Passport Number" field="passport_number" placeholder="A12345678"
                        formData={indForm} errors={errors} updateFormData={updateInd}
                        onBlur={() => validateIndField("passport_number")} />
                    </div>
                  </SectionCard>

                  <SectionCard title="Background" subtitle="Which best describes you?">
                    <div data-field="background">
                      <RadioCardGroup
                        ariaLabel="Which best describes you?"
                        compact
                        options={BACKGROUND_OPTIONS.map((opt) => ({
                          value: opt.value,
                          label: opt.label,
                          hint: "",
                          icon: BACKGROUND_ICONS[opt.value] ?? UserRound,
                        }))}
                        value={indForm.background}
                        onChange={(value) => updateInd("background", value)}
                      />
                      <FieldError>{errors.background}</FieldError>
                    </div>
                  </SectionCard>

                  <SectionCard title="Identity Verification"
                    subtitle="To ensure trust and authenticity, all advisors must verify their identity.">
                    <PublicFileUploadField
                      label="Passport Photo"
                      fieldId="ind-passport-photo"
                      field="ind_passport_photo"
                      required
                      result={indPassportPhoto}
                      fileName={indPassportPhotoName}
                      onUpload={(res, name) => { setIndPassportPhoto(res); setIndPassportPhotoName(name); }}
                      onRemove={() => { setIndPassportPhoto(null); setIndPassportPhotoName(""); }}
                      error={errors.ind_passport_photo}
                    />
                    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                      <InputField label="Social Media Account" field="social_media_url" type="url"
                        placeholder="https://..."
                        formData={indForm} errors={errors} updateFormData={updateInd}
                        onBlur={() => validateIndField("social_media_url")} />
                      <InputField label="LinkedIn Profile" field="linkedin_url" type="url"
                        required={false} placeholder="https://linkedin.com/in/yourname"
                        formData={indForm} errors={errors} updateFormData={updateInd}
                        onBlur={() => validateIndField("linkedin_url")} />
                    </div>
                  </SectionCard>
                </>
              ) : (
                <>
                  <SectionCard title="Agency Information">
                    <ImageUpload
                      label="Agency Logo"
                      id="comp_logo"
                      required
                      file={compLogo.file}
                      onFileChange={compLogo.handleSelect}
                      onRemove={compLogo.handleRemove}
                      uploading={compLogo.uploading}
                      progress={compLogo.progress}
                      error={compLogo.error || errors.comp_logo}
                    />
                    <InputField label="Agency Name" field="company_name" placeholder="Enter agency name."
                      formData={compForm} errors={errors} updateFormData={updateComp}
                      onBlur={() => validateCompField("company_name")} />
                    <SelectField label="Country of Registration" field="country" options={COUNTRY_OPTIONS}
                      formData={compForm} errors={errors} updateFormData={updateComp}
                      onBlur={() => validateCompField("country")} />
                    <InputField label="Website or Social Media Page" field="website_url" type="url"
                      placeholder="https://..."
                      formData={compForm} errors={errors} updateFormData={updateComp}
                      onBlur={() => validateCompField("website_url")} />
                  </SectionCard>

                  <SectionCard title="Agency Documents">
                    <PublicFileUploadField
                      label="Agency Registration Document"
                      fieldId="comp-reg-doc"
                      field="comp_reg_doc"
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
                        formData={compForm} errors={errors} updateFormData={updateComp}
                        onBlur={() => validateCompField("contact_full_name")} />
                      <InputField label="Email Address" field="contact_email" type="email"
                        placeholder="contact@agency.com"
                        formData={compForm} errors={errors} updateFormData={updateComp}
                        onBlur={() => validateCompField("contact_email")} />
                    </div>
                    <PhoneInputField dialCodeField="contact_phone_code" numberField="contact_phone_number"
                      formData={compForm} errors={errors} updateFormData={updateComp}
                      onBlur={() => validateCompField("contact_phone_number")} />
                    <SearchableDropdown label="Nationality" field="nationality" options={NATIONALITY_OPTIONS}
                      formData={compForm} errors={errors} updateFormData={updateComp}
                      onBlur={() => validateCompField("nationality")} />
                    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                      <InputField label="Date of Birth" field="date_of_birth" type="date"
                        formData={compForm} errors={errors} updateFormData={updateComp}
                        onBlur={() => validateCompField("date_of_birth")} />
                      <InputField label="Passport Number" field="passport_number" placeholder="A12345678"
                        formData={compForm} errors={errors} updateFormData={updateComp}
                        onBlur={() => validateCompField("passport_number")} />
                    </div>
                    <PublicFileUploadField
                      label="Passport Photo"
                      fieldId="comp-passport-photo"
                      field="comp_passport_photo"
                      required
                      result={compPassportPhoto}
                      fileName={compPassportPhotoName}
                      onUpload={(res, name) => { setCompPassportPhoto(res); setCompPassportPhotoName(name); }}
                      onRemove={() => { setCompPassportPhoto(null); setCompPassportPhotoName(""); }}
                      error={errors.comp_passport_photo}
                    />
                  </SectionCard>
                </>
              )}

              {/* T&C */}
              <div className="border-y border-ub-border p-6" data-field="agreed">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={partnerType === "individual" ? indForm.agreed : compForm.agreed}
                    onChange={(e) => partnerType === "individual"
                      ? updateInd("agreed", e.target.checked)
                      : updateComp("agreed", e.target.checked)}
                    className="h-4 w-4 rounded border-ub-border accent-blue-600"
                  />
                  <span className="text-sm text-ub-text-secondary">
                    I have read and agree to the{" "}
                    <a href="https://www.unibexs.com/terms-of-service" target="_blank" rel="noopener noreferrer"
                      className="font-medium text-ub-text-link underline">
                      Terms and Conditions
                    </a>
                  </span>
                </label>
                {errors.agreed && <p className="mt-2 text-xs text-ub-tone-danger-text">{errors.agreed}</p>}
              </div>

              <div className="flex flex-col gap-2 p-6">
                {apiError && !hasFieldLevelApiError && (
                  <div className="flex items-center gap-2 rounded-lg border border-ub-tone-danger-border bg-ub-tone-danger-bg px-4 py-3 text-sm text-ub-tone-danger-text">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {apiError}
                  </div>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !isFormComplete}
                  text={submitting ? "Submitting..." : "Submit Application"}
                  variant="primary"
                  className="w-full py-3 hover:bg-ub-action-primary-hover"
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
