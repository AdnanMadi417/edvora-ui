"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { useSubmitAgencyMemberProfile } from "features/agency-members/hooks";
import { COUNTRIES, NATIONALITIES, BACKGROUND_OPTIONS } from "constants/lists";
import InputField from "components/form/fields/InputField";
import SelectField from "components/form/fields/SelectField";
import SearchableDropdown from "components/form/search/SearchableDropdown";
import PhoneInputField from "components/form/fields/PhoneInputField";
import { isValidWebsiteUrl } from "utils/socialMedia";
import PublicFileUploadField, { type PublicUploadResult } from "components/form/upload/PublicFileUploadField";
import ImageUploadField from "components/form/upload/ImageUploadField";
import { uploadPublicPartnerFile } from "services/publicUploadService";
import { parseApiError } from "utils/parseApiError";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import Button from "components/ui/buttons/Button";
import logoImg from "/public/img/brand/Primary-Logo-Blue.png";

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.name, label: c.name }));
const NATIONALITY_OPTIONS = NATIONALITIES.map((n) => ({ value: n.name, label: n.name }));

const SUBMIT_PROFILE_FIELD_MAP: Record<string, string> = {
  phone: "phone_number",
  passport_photo_file_key: "passport_photo",
  passport_photo_file_url: "passport_photo",
  profile_photo_file_key: "profile_photo",
  profile_photo_file_url: "profile_photo",
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

export default function AgencyMemberSubmitProfile() {
  const searchParams = useSearchParams();
  const submissionToken = searchParams.get("token") ?? "";

  const { submitProfile, loading: submitting } = useSubmitAgencyMemberProfile();

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  const handleApiError = useApiFormErrors({
    fieldMap: SUBMIT_PROFILE_FIELD_MAP,
    setErrors: (patch) => {
      setErrors((p) => ({ ...p, ...patch }));
      setApiError("");
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) => setApiError(message),
  });

  const [formData, setFormData] = useState({
    phone_code: "+60", phone_number: "",
    country: "", nationality: "", background: "",
    date_of_birth: "", passport_number: "",
    social_media_url: "",
    linkedin_url: "",
  });
  const [passportPhoto, setPassportPhoto] = useState<PublicUploadResult | null>(null);
  const [passportPhotoName, setPassportPhotoName] = useState("");
  const profilePhoto = usePublicPhotoUpload();

  const updateForm = (field: string, value: unknown) => {
    setFormData((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const computeErrors = () => {
    const e: Record<string, string> = {};
    if (!formData.phone_number.trim()) e.phone_number = "Phone number is required";
    if (!formData.country) e.country = "Country is required";
    if (!formData.nationality) e.nationality = "Nationality is required";
    if (!formData.background) e.background = "Please select your background";
    if (!formData.date_of_birth) e.date_of_birth = "Date of birth is required";
    if (!formData.passport_number.trim()) e.passport_number = "Passport number is required";
    if (!profilePhoto.fileKey) e.profile_photo = "Profile photo is required";
    if (!passportPhoto) e.passport_photo = "Please upload your passport photo";
    if (!formData.social_media_url.trim()) e.social_media_url = "Social media URL is required";
    else if (!isValidWebsiteUrl(formData.social_media_url)) e.social_media_url = "Enter a valid URL starting with https://";
    if (formData.linkedin_url && !isValidWebsiteUrl(formData.linkedin_url))
      e.linkedin_url = "Enter a valid URL starting with https://";
    return e;
  };

  const validate = () => {
    const e = computeErrors();
    setErrors(e);
    if (Object.keys(e).length > 0) scrollToFirstError(e);
    return Object.keys(e).length === 0;
  };

  const validateField = (field: string) => {
    const e = computeErrors();
    setErrors((p) => ({ ...p, [field]: e[field] ?? "" }));
  };

  const isFormComplete = Object.keys(computeErrors()).length === 0;

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await submitProfile({
        submission_token: submissionToken,
        phone: `${formData.phone_code} ${formData.phone_number}`,
        country: formData.country,
        nationality: formData.nationality,
        date_of_birth: formData.date_of_birth,
        passport_number: formData.passport_number.trim(),
        ...(passportPhoto && { passport_photo_file_key: passportPhoto.file_key, passport_photo_file_url: passportPhoto.file_url }),
        ...(profilePhoto.fileKey && { profile_photo_file_key: profilePhoto.fileKey, profile_photo_file_url: profilePhoto.fileUrl }),
        background: formData.background,
        ...(formData.social_media_url && { social_media_url: formData.social_media_url }),
        ...(formData.linkedin_url && { linkedin_url: formData.linkedin_url }),
      });
      setSubmitted(true);
    } catch (err: unknown) {
      handleApiError(err, "Failed to submit your profile. Please try again.");
    }
  };

  if (!submissionToken) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-7 py-10 text-center shadow-sm">
          <div className="mb-6 flex justify-center">
            <Image src={logoImg} alt="Unibexs" width={110} height={36} className="object-contain" priority />
          </div>
          <AlertCircle className="mx-auto mb-4 h-8 w-8 text-red-500" />
          <h2 className="text-xl font-bold text-slate-900">Invalid Link</h2>
          <p className="mt-2 text-sm text-slate-500">
            This link is missing or invalid. Please use the link from your invitation email.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-7 py-10 text-center shadow-sm">
          <div className="mb-5 flex justify-center">
            <Image src={logoImg} alt="Unibexs" width={110} height={36} className="object-contain" priority />
          </div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Profile Submitted!</h2>
          <p className="mt-2 text-sm text-slate-500">
            Your account has been created. Check your email for your login details.
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
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-6 flex justify-center">
          <Image src={logoImg} alt="Unibexs" width={110} height={36} className="object-contain" priority />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold text-blue-600">Complete Your Profile</h2>
            <p className="mt-1 text-sm text-slate-500">
              Just a few more details to finish setting up your account.
            </p>
          </div>

          <SectionCard title="Basic Information">
            <ImageUploadField
              label="Profile Photo"
              field="profile_photo"
              required
              imageOnly
              simpleFile={profilePhoto.file}
              onSimpleFileChange={profilePhoto.handleSelect}
              onSimpleRemove={profilePhoto.handleRemove}
              simpleUploading={profilePhoto.uploading}
              simpleProgress={profilePhoto.progress}
              errors={{ profile_photo: profilePhoto.error || errors.profile_photo }}
            />
            <PhoneInputField dialCodeField="phone_code" numberField="phone_number"
              formData={formData} errors={errors} updateFormData={updateForm}
              onBlur={() => validateField("phone_number")} />
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <SelectField label="Country of Residence" field="country" options={COUNTRY_OPTIONS}
                formData={formData} errors={errors} updateFormData={updateForm}
                onBlur={() => validateField("country")} />
              <SearchableDropdown label="Nationality" field="nationality" options={NATIONALITY_OPTIONS}
                formData={formData} errors={errors} updateFormData={updateForm}
                onBlur={() => validateField("nationality")} />
            </div>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <InputField label="Date of Birth" field="date_of_birth" type="date"
                formData={formData} errors={errors} updateFormData={updateForm}
                onBlur={() => validateField("date_of_birth")} />
              <InputField label="Passport Number" field="passport_number" placeholder="A12345678"
                formData={formData} errors={errors} updateFormData={updateForm}
                onBlur={() => validateField("passport_number")} />
            </div>
          </SectionCard>

          <SectionCard title="Background" subtitle="Which best describes you?">
            <div className="space-y-2" data-field="background">
              {BACKGROUND_OPTIONS.map((opt) => (
                <label key={opt.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
                    formData.background === opt.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}>
                  <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    formData.background === opt.value ? "border-blue-500" : "border-slate-300"
                  }`}>
                    {formData.background === opt.value && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                  </div>
                  <input type="radio" name="background" value={opt.value} className="hidden"
                    checked={formData.background === opt.value}
                    onChange={() => updateForm("background", opt.value)} />
                  <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.background && <p className="mt-2 text-xs text-red-600">{errors.background}</p>}
          </SectionCard>

          <SectionCard title="Identity Verification"
            subtitle="To ensure trust and authenticity, all members must verify their identity.">
            <PublicFileUploadField
              label="Passport Photo"
              fieldId="member-passport-photo"
              field="passport_photo"
              required
              result={passportPhoto}
              fileName={passportPhotoName}
              onUpload={(res, name) => { setPassportPhoto(res); setPassportPhotoName(name); }}
              onRemove={() => { setPassportPhoto(null); setPassportPhotoName(""); }}
              error={errors.passport_photo}
            />
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <InputField label="Social Media Account" field="social_media_url" type="url"
                placeholder="https://..."
                formData={formData} errors={errors} updateFormData={updateForm}
                onBlur={() => validateField("social_media_url")} />
              <InputField label="LinkedIn Profile" field="linkedin_url" type="url"
                required={false} placeholder="https://linkedin.com/in/yourname"
                formData={formData} errors={errors} updateFormData={updateForm}
                onBlur={() => validateField("linkedin_url")} />
            </div>
          </SectionCard>

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
              text={submitting ? "Submitting..." : "Complete Profile"}
              bgColor="bg-blue-600"
              textColor="text-white"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-white"
              hoverBorderColor="hover:border-blue-700"
              className="w-full py-3 hover:bg-blue-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
