"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Building2, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { usePartnerRegistration } from "features/partners/hooks";
import OtpStep from "./OtpStep";
import EnterVerificationCodeModal from "./EnterVerificationCodeModal";
import { AnimatePresence, motion } from "framer-motion";
import { COUNTRIES, NATIONALITIES, BACKGROUND_OPTIONS } from "constants/lists";
import InputField from "components/form/fields/InputField";
import SelectField from "components/form/fields/SelectField";
import SearchableDropdown from "components/form/search/SearchableDropdown";
import PhoneInputField from "components/form/fields/PhoneInputField";
import SocialMediaInputField from "components/form/fields/SocialMediaInputField";
import { validateSocialMediaField, isValidPlatformUrl } from "utils/socialMedia";
import PublicFileUploadField, { type PublicUploadResult } from "components/form/upload/PublicFileUploadField";
import ImageUploadField from "components/form/upload/ImageUploadField";
import { uploadPublicPartnerFile } from "services/publicUploadService";
import { parseApiError } from "utils/parseApiError";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import Button from "components/ui/buttons/Button";
import logoImg from "/public/img/brand/Primary-Logo-Blue.png";
import registrationIconImg from "/public/img/icons/registration-icon.png";
import crosshairIconImg from "/public/img/icons/crosshair-icon.png";
import PublicNavbar from "components/navbar/PublicNavbar";

type Step = "form" | "otp" | "success"; // "otp" rendered by OtpStep
type PartnerType = "individual" | "agency";

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.name, label: c.name }));
const NATIONALITY_OPTIONS = NATIONALITIES.map((n) => ({ value: n.name, label: n.name }));

// Maps this backend endpoint's field names (from a 422 validation error's
// `loc` path) to this form's own field/error keys, wherever they differ —
// derived directly from how the submit payload below is built.
const IND_FIELD_MAP: Record<string, string> = {
  full_name: "name",
  phone: "phone_number",
  id_document_file_url: "ind_id_doc",
  id_document_file_key: "ind_id_doc",
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
  contact_id_document_file_url: "comp_contact_id_doc",
  contact_id_document_file_key: "comp_contact_id_doc",
  passport_photo_file_url: "comp_passport_photo",
  passport_photo_file_key: "comp_passport_photo",
  logo_file_url: "comp_logo",
  logo_file_key: "comp_logo",
};

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-200 p-6 last:border-b-0">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>}
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
    router.replace(`/auth/register?step=otp&email=${encodeURIComponent(email)}`);
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
    social_platform: "instagram", social_username: "", social_media_url: "",
    linkedin_platform: "linkedin", linkedin_username: "", linkedin_url: "",
    agreed: false,
  });
  const [indIdDoc, setIndIdDoc] = useState<PublicUploadResult | null>(null);
  const [indIdDocName, setIndIdDocName] = useState("");
  const [indPassportPhoto, setIndPassportPhoto] = useState<PublicUploadResult | null>(null);
  const [indPassportPhotoName, setIndPassportPhotoName] = useState("");
  const indProfilePhoto = usePublicPhotoUpload();

  // Company form
  const [compForm, setCompForm] = useState({
    company_name: "", country: "",
    social_platform: "instagram", social_username: "", website_url: "",
    contact_full_name: "", contact_email: "",
    contact_phone_code: "+60", contact_phone_number: "",
    nationality: "", date_of_birth: "", passport_number: "",
    agreed: false,
  });
  const [compRegDoc, setCompRegDoc] = useState<PublicUploadResult | null>(null);
  const [compRegDocName, setCompRegDocName] = useState("");
  const [compContactIdDoc, setCompContactIdDoc] = useState<PublicUploadResult | null>(null);
  const [compContactIdDocName, setCompContactIdDocName] = useState("");
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
    if (!indForm.nationality) e.nationality = "Nationality is required";
    if (!indForm.background) e.background = "Please select your background";
    if (!indForm.date_of_birth) e.date_of_birth = "Date of birth is required";
    if (!indForm.passport_number.trim()) e.passport_number = "Passport number is required";
    if (!indProfilePhoto.fileKey) e.ind_profile_photo = "Profile photo is required";
    if (!indIdDoc) e.ind_id_doc = "Please upload your identity document";
    if (!indPassportPhoto) e.ind_passport_photo = "Please upload your passport photo";
    const socialError = validateSocialMediaField(indForm, { platformField: "social_platform", usernameField: "social_username" });
    if (socialError) e.social_media_url = socialError;
    if (indForm.linkedin_url && !isValidPlatformUrl("linkedin", indForm.linkedin_url))
      e.linkedin_url = "Enter a valid LinkedIn URL (e.g. https://www.linkedin.com/in/yourname)";
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
    if (!compLogo.fileKey) e.comp_logo = "Agency logo is required";
    const socialError = validateSocialMediaField(compForm, { platformField: "social_platform", usernameField: "social_username" });
    if (socialError) e.website_url = socialError;
    if (!compRegDoc) e.comp_reg_doc = "Please upload your agency registration document";
    if (!compForm.contact_full_name.trim()) e.contact_full_name = "Full name is required";
    else if (compForm.contact_full_name.trim().length < 3) e.contact_full_name = "Full name must be at least 3 characters";
    if (!compForm.contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(compForm.contact_email)) e.contact_email = "Enter a valid email";
    if (!compForm.contact_phone_number.trim()) e.contact_phone_number = "Phone number is required";
    if (!compForm.nationality) e.nationality = "Nationality is required";
    if (!compForm.date_of_birth) e.date_of_birth = "Date of birth is required";
    if (!compForm.passport_number.trim()) e.passport_number = "Passport number is required";
    if (!compContactIdDoc) e.comp_contact_id_doc = "Please upload an identity document";
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
    ? Boolean(
        indForm.name.trim().length >= 3 &&
        indForm.email && indForm.phone_number.trim() &&
        indForm.country && indForm.nationality && indForm.background &&
        indForm.date_of_birth && indForm.passport_number.trim() &&
        indProfilePhoto.fileKey &&
        indIdDoc && indPassportPhoto &&
        !validateSocialMediaField(indForm, { platformField: "social_platform", usernameField: "social_username" }) &&
        (!indForm.linkedin_url || isValidPlatformUrl("linkedin", indForm.linkedin_url)) &&
        indForm.agreed,
      )
    : partnerType === "agency"
    ? Boolean(
        compForm.company_name.trim() && compForm.country &&
        compLogo.fileKey &&
        !validateSocialMediaField(compForm, { platformField: "social_platform", usernameField: "social_username" }) &&
        compRegDoc && compForm.contact_full_name.trim() && compForm.contact_email &&
        compForm.contact_phone_number.trim() && compForm.nationality &&
        compForm.date_of_birth && compForm.passport_number.trim() &&
        compContactIdDoc && compPassportPhoto &&
        compForm.agreed,
      )
    : false;

  const handleSubmit = async () => {
    if (partnerType === "individual" ? !validateInd() : !validateComp()) return;
    setHasFieldLevelApiError(false);

    const indSocialField = indForm.social_platform === "linkedin" ? "linkedin_url" : "social_media_url";

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
          ...(indIdDoc && { id_document_file_key: indIdDoc.file_key, id_document_file_url: indIdDoc.file_url }),
          ...(indPassportPhoto && { passport_photo_file_key: indPassportPhoto.file_key, passport_photo_file_url: indPassportPhoto.file_url }),
          ...(indProfilePhoto.fileKey && { profile_photo_file_key: indProfilePhoto.fileKey, profile_photo_file_url: indProfilePhoto.fileUrl }),
          ...(indForm.social_media_url && { [indSocialField]: indForm.social_media_url }),
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
          ...(compContactIdDoc && { contact_id_document_file_key: compContactIdDoc.file_key, contact_id_document_file_url: compContactIdDoc.file_url }),
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
        onSuccess={() => { setStep("success"); router.replace("/auth/register?step=success"); }}
        onRestart={() => { setStep("form"); router.replace("/auth/register"); }}
      />
    );
  }

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
          <button
            type="button"
            onClick={() => setShowCodeEntry(true)}
            className="mt-3 text-sm font-medium text-blue-600 underline-offset-2 transition hover:text-blue-700 hover:underline"
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
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Type switcher */}
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          {([
            { type: "individual" as const, icon: User,     title: "Individual Advisor", desc: "Apply as an independent education advisor" },
            { type: "agency"    as const, icon: Building2, title: "Company / Agency",  desc: "Apply as an education agency" },
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
                    <ImageUploadField
                      label="Profile Photo"
                      field="ind_profile_photo"
                      required
                      imageOnly
                      simpleFile={indProfilePhoto.file}
                      onSimpleFileChange={indProfilePhoto.handleSelect}
                      onSimpleRemove={indProfilePhoto.handleRemove}
                      simpleUploading={indProfilePhoto.uploading}
                      simpleProgress={indProfilePhoto.progress}
                      errors={{ ind_profile_photo: indProfilePhoto.error || errors.ind_profile_photo }}
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
                    <div className="space-y-2" data-field="background">
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
                      label="Identity Document"
                      fieldId="ind-id-doc"
                      field="ind_id_doc"
                      required
                      result={indIdDoc}
                      fileName={indIdDocName}
                      onUpload={(res, name) => { setIndIdDoc(res); setIndIdDocName(name); }}
                      onRemove={() => { setIndIdDoc(null); setIndIdDocName(""); }}
                      error={errors.ind_id_doc}
                    />
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
                      <SocialMediaInputField label="Social Media Account"
                        platformField="social_platform" usernameField="social_username" urlField="social_media_url"
                        formData={indForm} errors={errors} updateFormData={updateInd}
                        onBlur={() => validateIndField("social_media_url")} />
                      <SocialMediaInputField label="LinkedIn Profile"
                        platformField="linkedin_platform" usernameField="linkedin_username" urlField="linkedin_url"
                        lockedPlatform="linkedin" required={false}
                        formData={indForm} errors={errors} updateFormData={updateInd}
                        onBlur={() => validateIndField("linkedin_url")} />
                    </div>
                  </SectionCard>
                </>
              ) : (
                <>
                  <SectionCard title="Agency Information">
                    <ImageUploadField
                      label="Agency Logo"
                      field="comp_logo"
                      required
                      imageOnly
                      simpleFile={compLogo.file}
                      onSimpleFileChange={compLogo.handleSelect}
                      onSimpleRemove={compLogo.handleRemove}
                      simpleUploading={compLogo.uploading}
                      simpleProgress={compLogo.progress}
                      errors={{ comp_logo: compLogo.error || errors.comp_logo }}
                    />
                    <InputField label="Agency Name" field="company_name" placeholder="Enter agency name."
                      formData={compForm} errors={errors} updateFormData={updateComp}
                      onBlur={() => validateCompField("company_name")} />
                    <SelectField label="Country of Registration" field="country" options={COUNTRY_OPTIONS}
                      formData={compForm} errors={errors} updateFormData={updateComp}
                      onBlur={() => validateCompField("country")} />
                    <SocialMediaInputField label="Website or Social Media Page"
                      platformField="social_platform" usernameField="social_username" urlField="website_url"
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
                      label="Identity Document"
                      fieldId="comp-contact-id-doc"
                      field="comp_contact_id_doc"
                      required
                      result={compContactIdDoc}
                      fileName={compContactIdDocName}
                      onUpload={(res, name) => { setCompContactIdDoc(res); setCompContactIdDocName(name); }}
                      onRemove={() => { setCompContactIdDoc(null); setCompContactIdDocName(""); }}
                      error={errors.comp_contact_id_doc}
                    />
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
              <div className="border-y border-slate-200 p-6" data-field="agreed">
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
                {apiError && !hasFieldLevelApiError && (
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
