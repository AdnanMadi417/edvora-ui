"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Briefcase, CircleCheck, Clock, GraduationCap, Link2Off, Presentation, UserCheck, UserRound } from "lucide-react";

import { useSubmitAgencyMemberProfile } from "features/agency-members/hooks";
import { COUNTRY_OPTIONS, isKnownCountry, NATIONALITIES, BACKGROUND_OPTIONS } from "constants/lists";
import InputField from "components/ub/forms/text/InputField";
import SelectField from "components/ub/forms/selection/SelectField";
import SearchableDropdown from "components/ub/forms/selection/SearchableDropdown";
import PhoneInputField from "components/ub/forms/text/PhoneInputField";
import RadioCardGroup from "components/ub/forms/choices/RadioCardGroup";
import { FieldError } from "components/ub/forms/layout/FieldChrome";
import PublicFileUploadField, { type PublicUploadResult } from "components/ub/forms/uploads/PublicFileUploadField";
import ImageUpload from "components/ub/forms/uploads/ImageUpload";
import Button from "components/ub/core/buttons/Button";
import Alert from "components/ub/feedback/notifications/Alert";
import { isValidWebsiteUrl } from "utils/socialMedia";
import { uploadPublicPartnerFile } from "services/publicUploadService";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import { fieldWrapper } from "components/ub/recipes";
import { InviteShell, LinkButton, StatusView } from "./InviteLayout";

const NATIONALITY_OPTIONS = NATIONALITIES.map((n) => ({ value: n.name, label: n.name }));

const BACKGROUND_ICONS: Record<string, typeof UserRound> = {
  agent: Briefcase,
  teacher: Presentation,
  student: GraduationCap,
  other: UserRound,
};

const SUBMIT_PROFILE_FIELD_MAP: Record<string, string> = {
  phone: "phone_number",
  passport_photo_file_key: "passport_photo",
  passport_photo_file_url: "passport_photo",
  profile_photo_file_key: "profile_photo",
  profile_photo_file_url: "profile_photo",
};

type View = "form" | "done" | "link_invalid" | "link_expired" | "already_submitted" | "has_account";

const ASK_FOR_NEW_LINK = "Ask your agency admin to resend your profile link. You won't need a new code.";

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-ub-border p-5 last:border-b-0 sm:p-6">
      <h2 className="text-ub-heading-sm text-ub-text-primary">{title}</h2>
      {subtitle && <p className="mt-0.5 text-ub-body-sm text-ub-text-secondary">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
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
  const submissionToken = (searchParams.get("token") ?? "").trim();

  const { submitProfile, loading: submitting } = useSubmitAgencyMemberProfile();

  const [view, setView] = useState<View>("form");
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
    phone_code: "+60",
    phone_number: "",
    country: "",
    nationality: "",
    background: "",
    date_of_birth: "",
    passport_number: "",
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
    if (!profilePhoto.fileKey) e.profile_photo = "Add a profile photo";
    if (!formData.phone_number.trim()) e.phone_number = "Enter your phone number";
    if (!formData.country) e.country = "Choose your country of residence";
    else if (!isKnownCountry(formData.country)) e.country = "Choose a country from the list";
    if (!formData.nationality) e.nationality = "Choose your nationality";
    if (!formData.date_of_birth) e.date_of_birth = "Enter your date of birth";
    if (!formData.passport_number.trim()) e.passport_number = "Enter your passport number";
    if (!formData.background) e.background = "Choose the option that best describes you";
    if (!passportPhoto) e.passport_photo = "Upload a photo of your passport";
    if (!formData.social_media_url.trim()) e.social_media_url = "Enter a link to one of your social media accounts";
    else if (!isValidWebsiteUrl(formData.social_media_url)) e.social_media_url = "Enter a full link starting with https://";
    if (formData.linkedin_url && !isValidWebsiteUrl(formData.linkedin_url))
      e.linkedin_url = "Enter a full link starting with https://";
    return e;
  };

  const validateField = (field: string) => {
    const e = computeErrors();
    setErrors((p) => ({ ...p, [field]: e[field] ?? "" }));
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const e = computeErrors();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      scrollToFirstError(e);
      return;
    }
    setApiError("");

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
      setView("done");
    } catch (err: unknown) {
      switch (getApiErrorCode(err)) {
        case "submission_link_invalid":
          setView("link_invalid");
          return;
        case "submission_link_expired":
          setView("link_expired");
          return;
        case "already_submitted":
          setView("already_submitted");
          return;
        case "email_already_registered":
          setView("has_account");
          return;
        default:
          handleApiError(err, "We couldn't save your profile. Please try again.");
      }
    }
  };

  if (!submissionToken) {
    return (
      <InviteShell>
        <StatusView icon={Link2Off} tint="amber" title="This link is incomplete" support>
          <p>The link you opened is missing part of its address, so we can&apos;t tell whose profile this is.</p>
          <p>Open the link from your invite email again. If it still doesn&apos;t work, ask your agency admin to resend your profile link.</p>
        </StatusView>
      </InviteShell>
    );
  }

  if (view !== "form") {
    const status = {
      done: (
        <StatusView icon={CircleCheck} tint="green" title="You're all set" actions={<LinkButton href="/">Go to sign in</LinkButton>}>
          <p>Your account is ready. We&apos;ve emailed you your sign-in details.</p>
        </StatusView>
      ),
      link_invalid: (
        <StatusView icon={Link2Off} tint="amber" title="This link doesn't work" support>
          <p>It may have been replaced by a newer link. Open the latest email from Unibexs about your invite.</p>
          <p>If that doesn&apos;t work either, {ASK_FOR_NEW_LINK.charAt(0).toLowerCase() + ASK_FOR_NEW_LINK.slice(1)}</p>
        </StatusView>
      ),
      link_expired: (
        <StatusView icon={Clock} tint="amber" title="This link has expired" support>
          <p>Profile links work for 48 hours, and this one has run out. Nothing you entered was saved.</p>
          <p>{ASK_FOR_NEW_LINK}</p>
        </StatusView>
      ),
      already_submitted: (
        <StatusView icon={CircleCheck} tint="green" title="Your profile is already complete" actions={<LinkButton href="/">Go to sign in</LinkButton>} support>
          <p>This invite has already been used to set up your account. Check your email for your sign-in details.</p>
        </StatusView>
      ),
      has_account: (
        <StatusView icon={UserCheck} tint="blue" title="You already have an account" actions={<LinkButton href="/">Go to sign in</LinkButton>} support>
          <p>This email address already has a Unibexs account. Sign in with it instead.</p>
        </StatusView>
      ),
    }[view];
    return <InviteShell>{status}</InviteShell>;
  }

  return (
    <InviteShell wide>
      <form noValidate onSubmit={handleSubmit}>
        <div className="border-b border-ub-border p-5 sm:p-6">
          <h1 className="text-ub-heading-md text-ub-text-primary">Complete your profile</h1>
          <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
            Your email is verified. Add a few details and we&apos;ll create your Unibexs account. Every field is required unless it says optional.
          </p>
        </div>

        <Section title="Basic information">
          <div className={fieldWrapper}>
            <ImageUpload
              label="Profile photo"
              id="profile_photo"
              required
              file={profilePhoto.file}
              onFileChange={profilePhoto.handleSelect}
              onRemove={profilePhoto.handleRemove}
              uploading={profilePhoto.uploading}
              progress={profilePhoto.progress}
              error={profilePhoto.error || errors.profile_photo}
            />
          </div>
          <PhoneInputField
            dialCodeField="phone_code"
            numberField="phone_number"
            formData={formData}
            errors={errors}
            updateFormData={updateForm}
            onBlur={() => validateField("phone_number")}
          />
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <SelectField
              label="Country of residence"
              field="country"
              options={COUNTRY_OPTIONS}
              formData={formData}
              errors={errors}
              updateFormData={updateForm}
              onBlur={() => validateField("country")}
            />
            <SearchableDropdown
              label="Nationality"
              field="nationality"
              options={NATIONALITY_OPTIONS}
              formData={formData}
              errors={errors}
              updateFormData={updateForm}
              onBlur={() => validateField("nationality")}
            />
          </div>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <InputField
              label="Date of birth"
              field="date_of_birth"
              type="date"
              formData={formData}
              errors={errors}
              updateFormData={updateForm}
              onBlur={() => validateField("date_of_birth")}
            />
            <InputField
              label="Passport number"
              field="passport_number"
              placeholder="A12345678"
              formData={formData}
              errors={errors}
              updateFormData={updateForm}
              onBlur={() => validateField("passport_number")}
            />
          </div>
        </Section>

        <Section title="Background" subtitle="Which best describes you?">
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
              value={formData.background}
              onChange={(value) => updateForm("background", value)}
            />
            <FieldError>{errors.background}</FieldError>
          </div>
        </Section>

        <Section title="Identity check" subtitle="Unibexs checks every account holder's identity to keep students safe.">
          <div className={fieldWrapper}>
            <PublicFileUploadField
              label="Passport photo"
              fieldId="member-passport-photo"
              field="passport_photo"
              required
              result={passportPhoto}
              fileName={passportPhotoName}
              onUpload={(res, name) => {
                setPassportPhoto(res);
                setPassportPhotoName(name);
                setErrors((p) => ({ ...p, passport_photo: "" }));
              }}
              onRemove={() => {
                setPassportPhoto(null);
                setPassportPhotoName("");
              }}
              error={errors.passport_photo}
            />
          </div>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <InputField
              label="Social media account"
              field="social_media_url"
              type="url"
              placeholder="https://..."
              formData={formData}
              errors={errors}
              updateFormData={updateForm}
              onBlur={() => validateField("social_media_url")}
            />
            <InputField
              label="LinkedIn profile"
              field="linkedin_url"
              type="url"
              required={false}
              placeholder="https://linkedin.com/in/yourname"
              formData={formData}
              errors={errors}
              updateFormData={updateForm}
              onBlur={() => validateField("linkedin_url")}
            />
          </div>
        </Section>

        <div className="flex flex-col gap-3 p-5 sm:p-6">
          {apiError && <Alert tone="danger">{apiError}</Alert>}
          <Button type="submit" loading={submitting} text="Create my account" variant="primary" className="w-full" />
        </div>
      </form>
    </InviteShell>
  );
}
