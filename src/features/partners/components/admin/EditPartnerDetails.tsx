"use client";

import StoredDocumentUpload from "components/ub/forms/uploads/StoredDocumentUpload";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Pencil,
  Upload,
  Globe2,
} from "lucide-react";
import {
  usePartnerDetails,
  useUpdatePartner,
  useAssignPartnerManager,
} from "features/partners/hooks";
import { useAccountManagers } from "features/account-managers/hooks";
import FormPage from "components/ub/forms/layout/FormPage";
import Loading from "components/ub/feedback/states/Loading";
import EmptyData from "components/ub/feedback/states/EmptyTableData";
import InputField from "components/ub/forms/text/InputField";
import TextareaField from "components/ub/forms/text/TextareaField";
import PhoneInputField from "components/ub/forms/text/PhoneInputField";
import ToggleInput from "components/ub/forms/choices/ToggleInput";
import SelectField from "components/ub/forms/selection/SelectField";
import SearchableDropdown from "components/ub/forms/selection/SearchableDropdown";
import MultiSelect from "components/ub/forms/selection/MultiSelect";
import Button from "components/ub/core/buttons/Button";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import {
  getPresignedUploads,
  uploadFilesToSpaces,
  ALLOWED_FILE_TYPES,
} from "services/uploadService";
import PresignedImage from "components/ub/data/media/PresignedImage";
import {
  COUNTRIES,
  COUNTRY_OPTIONS,
  isKnownCountry,
  NATIONALITIES,
  PARTNER_TYPE,
  BACKGROUND_OPTIONS,
  DIAL_CODES,
} from "constants/lists";
import { isValidWebsiteUrl } from "utils/socialMedia";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";

// PUT /admin/partners/{id} public_profile errors (UBX-317) — mapped to the
// slug field inline rather than the generic toast, since they're both
// actionable right where the admin is typing.
const PUBLIC_PROFILE_ERROR_MESSAGES: Record<string, string> = {
  invalid_slug: "Lowercase letters, digits, and hyphens only.",
  slug_already_exists: "That slug is already taken.",
};

// PUT /admin/partners/{id} type-conversion errors (UBX-344) — attached to
// the field the admin has to fix, showing the backend's own message rather
// than a generic toast.
const TYPE_CHANGE_ERROR_FIELDS: Record<string, string> = {
  type_change_not_allowed: "type",
  agency_member_type_change_not_allowed: "type",
  company_name_required: "company_name",
};

interface Props {
  id: string;
  /** Where "Back" and a successful save navigate to — defaults to the admin
   *  partner details route. Reviewer reuses this same form/component and
   *  passes its own base path so navigation doesn't dead-end on a route
   *  reviewers can't access. */
  basePath?: string;
}

const NATIONALITY_OPTIONS = NATIONALITIES.map((n) => ({
  value: n.name,
  label: n.name,
}));

// whatsapp_number comes back as raw digits with no "+" or separator (unlike
// `phone`, which is stored as "+<code> <number>"), so there's no exact
// delimiter to split on. Best-effort: match the longest known dial code
// that prefixes the digits. Falls back to the default dial code with the
// full value in the number field — visibly, so a bad guess is obvious and
// fixable before save rather than silently wrong.
function splitWhatsapp(raw: string | null | undefined): {
  code: string;
  number: string;
} {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return { code: "+60", number: "" };
  const match = [...DIAL_CODES]
    .sort((a, b) => b.code.length - a.code.length)
    .find((d) => digits.startsWith(d.code.slice(1)));
  return match
    ? { code: match.code, number: digits.slice(match.code.length - 1) }
    : { code: "+60", number: digits };
}

// Inverse of splitWhatsapp — raw digits only, matching the API's own
// no-formatting convention for this field.
function combineWhatsapp(code: string, number: string): string {
  return `${code}${number}`.replace(/\D/g, "");
}

const PARTNER_UPDATE_FIELD_MAP: Record<string, string> = {
  phone: "phone_number",
  assigned_manager_id: "manager_id",
};

type DocState = {
  file_key: string;
  file_url: string;
  uploading: boolean;
  progress: number;
  error: string;
};

const EMPTY_DOC: DocState = { file_key: "", file_url: "", uploading: false, progress: 0, error: "" };
const PROFILE_PHOTO_UPLOAD_ENABLED = true;

function AvatarUpload({ doc, name, onUpload }: { doc: DocState; name: string; isActive: boolean; onUpload: (file: File) => void }) {
  return <StoredDocumentUpload id="profile-photo" label={`${name} photo`} document={doc} onUpload={onUpload} imageOnly />;
}


export default function EditPartnerDetails({
  id,
  basePath = "/admin/advisors",
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleApiError = useApiFormErrors({
    fieldMap: PARTNER_UPDATE_FIELD_MAP,
    emailField: "email",
    setErrors: (patch) => {
      setErrors((prev: any) => ({ ...prev, ...patch }));
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) => showToast(message, "error"),
  });

  const { partner, isPartnerLoading } = usePartnerDetails(id);
  const { updatePartner, isUpdatingPartner } = useUpdatePartner();
  const {
    assignManager,
    loading: assignLoading,
    error: assignError,
  } = useAssignPartnerManager();
  const { accountManagers } = useAccountManagers();

  const [formData, setFormData] = useState<any>({
    name: "",
    country: "",
    email: "",
    type: "",
    phone_code: "+60",
    phone_number: "",
    manager_id: "",
    assigned_manager_name: "",
    is_active: true,
    background: "",
    linkedin_url: "",
    social_media_url: "",
    company_name: "",
    website_url: "",
    nationality: "",
    date_of_birth: "",
    passport_number: "",
    pp_slug: "",
    pp_display_name: "",
    pp_bio: "",
    pp_whatsapp_code: "+60",
    pp_whatsapp_number: "",
    pp_countries_supported: [],
    pp_is_published: false,
  });

  const [profilePhoto, setProfilePhoto] = useState<DocState>(EMPTY_DOC);
  const [logo, setLogo] = useState<DocState>(EMPTY_DOC);
  const [passportPhoto, setPassportPhoto] = useState<DocState>(EMPTY_DOC);
  const [companyRegDoc, setCompanyRegDoc] = useState<DocState>(EMPTY_DOC);

  useEffect(() => {
    if (!partner) return;
    const rawPhone = (partner.phone ?? "").replace(/^undefined/, "").trim();
    const phoneMatch = rawPhone.match(/^(\+\d{1,3})\s+(.*)/);
    setFormData({
      name: partner.name || "",
      country: partner.country || "",
      email: partner.email || "",
      // Only trust partner.type if it's one of the values this form (and the
      // update endpoint) actually understands — a stale/legacy value like
      // "Business" would otherwise round-trip straight back to the API
      // untouched (see the type validation below) and get rejected with a
      // 422, with no indication to the admin of what's actually wrong.
      // Falling back to "" instead makes the dropdown honestly show
      // unselected, so "Partner type is required" fires and the admin picks
      // a real value, self-healing the record on save.
      type: PARTNER_TYPE.some((t) => t.value === partner.type)
        ? partner.type
        : "",
      phone_code: phoneMatch ? phoneMatch[1] : "+60",
      phone_number: phoneMatch ? phoneMatch[2] : rawPhone,
      manager_id: partner.assigned_manager_id || "",
      assigned_manager_name: partner.assigned_manager_name || "",
      is_active: partner.is_active,
      background: partner.individual_details?.background ?? "",
      linkedin_url: partner.individual_details?.linkedin_url ?? "",
      social_media_url: partner.individual_details?.social_media_url ?? "",
      company_name: partner.company_details?.company_name ?? "",
      website_url: partner.company_details?.website_url ?? "",
      nationality: partner.nationality ?? "",
      date_of_birth:
        partner.individual_details?.date_of_birth ??
        partner.company_details?.date_of_birth ??
        "",
      passport_number:
        partner.individual_details?.passport_number ??
        partner.company_details?.passport_number ??
        "",
      pp_slug: partner.public_profile?.slug ?? "",
      pp_display_name: partner.public_profile?.display_name ?? "",
      pp_bio: partner.public_profile?.bio ?? "",
      ...(() => {
        const { code, number } = splitWhatsapp(
          partner.public_profile?.whatsapp_number
        );
        return { pp_whatsapp_code: code, pp_whatsapp_number: number };
      })(),
      pp_countries_supported: partner.public_profile?.countries_supported ?? [],
      pp_is_published: partner.public_profile?.is_published ?? false,
    });
    if (partner.individual_details) {
      setProfilePhoto((p) => ({
        ...p,
        file_key: partner.individual_details!.profile_photo_file_key ?? "",
        file_url: partner.individual_details!.profile_photo_file_url ?? "",
      }));
      setPassportPhoto((p) => ({
        ...p,
        file_key: partner.individual_details!.passport_photo_file_key ?? "",
        file_url: partner.individual_details!.passport_photo_file_url ?? "",
      }));
    }
    if (partner.company_details) {
      setCompanyRegDoc((p) => ({
        ...p,
        file_key:
          partner.company_details!.company_registration_doc_file_key ?? "",
        file_url:
          partner.company_details!.company_registration_doc_file_url ?? "",
      }));
      setLogo((p) => ({
        ...p,
        file_key: partner.company_details!.logo_file_key ?? "",
        file_url: partner.company_details!.logo_file_url ?? "",
      }));
      setPassportPhoto((p) => ({
        ...p,
        file_key: partner.company_details!.passport_photo_file_key ?? "",
        file_url: partner.company_details!.passport_photo_file_url ?? "",
      }));
    }
  }, [partner]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: "" }));

    if (field === "type") {
      if (value === "individual") {
        setProfilePhoto((p) => ({
          ...p,
          file_key: partner?.individual_details?.profile_photo_file_key ?? "",
          file_url: partner?.individual_details?.profile_photo_file_url ?? "",
        }));
        setPassportPhoto((p) => ({
          ...p,
          file_key: partner?.individual_details?.passport_photo_file_key ?? "",
          file_url: partner?.individual_details?.passport_photo_file_url ?? "",
        }));
        setFormData((prev: any) => ({
          ...prev,
          type: value,
          background: partner?.individual_details?.background ?? "",
          linkedin_url: partner?.individual_details?.linkedin_url ?? "",
          social_media_url: partner?.individual_details?.social_media_url ?? "",
          date_of_birth: partner?.individual_details?.date_of_birth ?? "",
          passport_number: partner?.individual_details?.passport_number ?? "",
        }));
      } else if (value === "agency") {
        setCompanyRegDoc((p) => ({
          ...p,
          file_key:
            partner?.company_details?.company_registration_doc_file_key ?? "",
          file_url:
            partner?.company_details?.company_registration_doc_file_url ?? "",
        }));
        setLogo((p) => ({
          ...p,
          file_key: partner?.company_details?.logo_file_key ?? "",
          file_url: partner?.company_details?.logo_file_url ?? "",
        }));
        setPassportPhoto((p) => ({
          ...p,
          file_key: partner?.company_details?.passport_photo_file_key ?? "",
          file_url: partner?.company_details?.passport_photo_file_url ?? "",
        }));
        setFormData((prev: any) => ({
          ...prev,
          type: value,
          company_name: partner?.company_details?.company_name ?? "",
          website_url: partner?.company_details?.website_url ?? "",
          date_of_birth: partner?.company_details?.date_of_birth ?? "",
          passport_number: partner?.company_details?.passport_number ?? "",
        }));
      }
    }
  };

  const handleUpload = async (
    file: File,
    setDoc: React.Dispatch<React.SetStateAction<DocState>>
  ) => {
    setDoc((p) => ({ ...p, uploading: true, progress: 0, error: "" }));
    try {
      const presigned = await getPresignedUploads([file], "partners-files");
      const results = await uploadFilesToSpaces(
        [file],
        presigned,
        (_i, pct) => {
          setDoc((p) => ({ ...p, progress: pct }));
        }
      );
      setDoc({
        file_key: results[0].file_key,
        file_url: results[0].public_url,
        uploading: false,
        progress: 100,
        error: "",
      });
    } catch {
      setDoc((p) => ({
        ...p,
        uploading: false,
        progress: 0,
        error: "Upload failed. Please try again.",
      }));
    }
  };

  const isUploading =
    profilePhoto.uploading ||
    logo.uploading ||
    passportPhoto.uploading ||
    companyRegDoc.uploading;

  const isFormChanged = () => {
    if (!partner) return false;
    return (
      formData.name.trim() !== partner.name?.trim() ||
      formData.country.trim() !== partner.country?.trim() ||
      formData.email.trim() !== partner.email?.trim() ||
      formData.type !== partner.type ||
      (formData.manager_id || "") !== (partner.assigned_manager_id || "") ||
      `${formData.phone_code} ${formData.phone_number}`.trim() !==
        partner.phone?.trim() ||
      formData.is_active !== partner.is_active ||
      profilePhoto.file_key !==
        (partner.individual_details?.profile_photo_file_key ?? "") ||
      formData.background !== (partner.individual_details?.background ?? "") ||
      formData.linkedin_url !==
        (partner.individual_details?.linkedin_url ?? "") ||
      formData.social_media_url !==
        (partner.individual_details?.social_media_url ?? "") ||
      formData.company_name !== (partner.company_details?.company_name ?? "") ||
      formData.website_url !== (partner.company_details?.website_url ?? "") ||
      companyRegDoc.file_key !==
        (partner.company_details?.company_registration_doc_file_key ?? "") ||
      logo.file_key !== (partner.company_details?.logo_file_key ?? "") ||
      passportPhoto.file_key !==
        (partner.individual_details?.passport_photo_file_key ??
          partner.company_details?.passport_photo_file_key ??
          "") ||
      formData.nationality !== (partner.nationality ?? "") ||
      formData.date_of_birth !==
        (partner.individual_details?.date_of_birth ??
          partner.company_details?.date_of_birth ??
          "") ||
      formData.passport_number !==
        (partner.individual_details?.passport_number ??
          partner.company_details?.passport_number ??
          "") ||
      formData.pp_slug !== (partner.public_profile?.slug ?? "") ||
      formData.pp_display_name !==
        (partner.public_profile?.display_name ?? "") ||
      formData.pp_bio !== (partner.public_profile?.bio ?? "") ||
      combineWhatsapp(
        formData.pp_whatsapp_code,
        formData.pp_whatsapp_number
      ) !==
        (partner.public_profile?.whatsapp_number ?? "").replace(/\D/g, "") ||
      JSON.stringify(formData.pp_countries_supported) !==
        JSON.stringify(partner.public_profile?.countries_supported ?? []) ||
      formData.pp_is_published !==
        (partner.public_profile?.is_published ?? false)
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.trim().length < 3)
      newErrors.name = "Name must be at least 3 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter a valid email address";

    if (!formData.country) newErrors.country = "Country is required";
    else if (!isKnownCountry(formData.country))
      newErrors.country = "Select a country from the list";
    // Not just a truthiness check — a value that isn't "individual" or
    // "agency" (e.g. a stale/legacy value carried over from partner.type)
    // must also be rejected here, not silently sent to the update endpoint,
    // which only accepts those two and 422s on anything else.
    if (!PARTNER_TYPE.some((t) => t.value === formData.type))
      newErrors.type = "Advisor type is required";

    if (!formData.phone_number.trim())
      newErrors.phone_number = "Phone number is required";
    else if (formData.phone_number.trim().length < 5)
      newErrors.phone_number = "Phone number must be at least 5 digits";

    if (formData.type === "individual") {
      if (formData.linkedin_url && !isValidWebsiteUrl(formData.linkedin_url))
        newErrors.linkedin_url = "Enter a valid URL starting with https://";
      if (
        formData.social_media_url &&
        !isValidWebsiteUrl(formData.social_media_url)
      )
        newErrors.social_media_url = "Enter a valid URL starting with https://";
    }

    if (formData.type === "agency") {
      if (!formData.company_name.trim())
        newErrors.company_name = "Company name is required";
      else if (formData.company_name.trim().length < 3)
        newErrors.company_name = "Company name must be at least 3 characters";
      if (formData.website_url && !isValidWebsiteUrl(formData.website_url))
        newErrors.website_url = "Enter a valid URL starting with https://";
    }

    if (formData.type === "individual" && partner?.public_profile) {
      // Fail fast client-side — the backend rejects rather than
      // auto-cleaning an invalid slug, so catch the common case (spaces,
      // uppercase) before round-tripping to a 422.
      if (
        formData.pp_slug.trim() &&
        !/^[a-z0-9-]+$/.test(formData.pp_slug.trim())
      ) {
        newErrors.pp_slug = PUBLIC_PROFILE_ERROR_MESSAGES.invalid_slug;
      }
    }

    return newErrors;
  };

  const validateField = (field: string) => {
    const allErrors = validateForm();
    setErrors((prev: any) => ({ ...prev, [field]: allErrors[field] ?? "" }));
  };

  const formValidationErrors = validateForm();
  const isFormValid = Object.keys(formValidationErrors).length === 0;

  const handleUpdate = async () => {
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(newErrors);
      return;
    }

    const isIndividual = formData.type === "individual";
    const isCompany = formData.type === "agency";

    try {
      await updatePartner(id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        type: formData.type,
        country: formData.country,
        ...(formData.nationality ? { nationality: formData.nationality } : {}),
        phone: `${formData.phone_code || "+60"} ${formData.phone_number}`,
        is_active: formData.is_active,
        assigned_manager_id: formData.manager_id,
        ...(isIndividual
          ? {
              individual_details: {
                background: formData.background,
                linkedin_url: formData.linkedin_url,
                social_media_url: formData.social_media_url,
                ...(formData.date_of_birth
                  ? { date_of_birth: formData.date_of_birth }
                  : {}),
                ...(formData.passport_number
                  ? { passport_number: formData.passport_number }
                  : {}),
                ...(profilePhoto.file_key
                  ? {
                      profile_photo_file_key: profilePhoto.file_key,
                      profile_photo_file_url: profilePhoto.file_url,
                    }
                  : {}),
                ...(passportPhoto.file_key
                  ? {
                      passport_photo_file_key: passportPhoto.file_key,
                      passport_photo_file_url: passportPhoto.file_url,
                    }
                  : {}),
              },
            }
          : isCompany
          ? {
              company_details: {
                ...(formData.date_of_birth
                  ? { date_of_birth: formData.date_of_birth }
                  : {}),
                ...(formData.passport_number
                  ? { passport_number: formData.passport_number }
                  : {}),
                ...(formData.company_name
                  ? { company_name: formData.company_name }
                  : {}),
                ...(formData.website_url
                  ? { website_url: formData.website_url }
                  : {}),
                ...(companyRegDoc.file_key
                  ? {
                      company_registration_doc_file_key: companyRegDoc.file_key,
                      company_registration_doc_file_url: companyRegDoc.file_url,
                    }
                  : {}),
                ...(logo.file_key
                  ? {
                      logo_file_key: logo.file_key,
                      logo_file_url: logo.file_url,
                    }
                  : {}),
                ...(passportPhoto.file_key
                  ? {
                      passport_photo_file_key: passportPhoto.file_key,
                      passport_photo_file_url: passportPhoto.file_url,
                    }
                  : {}),
              },
            }
          : {}),
        ...(isIndividual && partner?.public_profile
          ? {
              public_profile: {
                slug: formData.pp_slug.trim(),
                display_name: formData.pp_display_name.trim(),
                bio: formData.pp_bio.trim(),
                whatsapp_number: combineWhatsapp(
                  formData.pp_whatsapp_code,
                  formData.pp_whatsapp_number
                ),
                countries_supported: formData.pp_countries_supported,
                is_published: formData.pp_is_published,
              },
            }
          : {}),
      });
      if (formData.manager_id) {
        await assignManager(id, { manager_id: formData.manager_id });
      }
      showToast("Advisor updated successfully", "success");
      router.push(`${basePath}/${id}`);
    } catch (error: unknown) {
      const code = getApiErrorCode(error);
      if (code && PUBLIC_PROFILE_ERROR_MESSAGES[code]) {
        setErrors((prev) => ({
          ...prev,
          pp_slug: PUBLIC_PROFILE_ERROR_MESSAGES[code],
        }));
        scrollToFirstError({ pp_slug: PUBLIC_PROFILE_ERROR_MESSAGES[code] });
        return;
      }
      if (code && TYPE_CHANGE_ERROR_FIELDS[code]) {
        const patch = {
          [TYPE_CHANGE_ERROR_FIELDS[code]]: parseApiError(
            error,
            "Update failed. Please try again."
          ),
        };
        setErrors((prev) => ({ ...prev, ...patch }));
        scrollToFirstError(patch);
        return;
      }
      if (code === "public_profile_not_found") {
        showToast(
          parseApiError(error, "This advisor has no public profile to update."),
          "error"
        );
        return;
      }
      handleApiError(error, "Update failed. Please try again.");
    }
  };

  if (isPartnerLoading || assignLoading)
    return <Loading text="Loading advisor details..." />;
  if (!partner || assignError) return <EmptyData />;

  const isIndividual = formData.type === "individual";
  const isCompany = formData.type === "agency";
  // UBX-344: an admin may convert an individual into an agency, never the
  // reverse — the backend refuses that (an agency's members would be
  // stranded), so don't offer it.
  const isTypeLocked = partner.type === "agency";
  const isConvertingToAgency =
    partner.type === "individual" && formData.type === "agency";

  const saveDisabledReason = isUpdatingPartner
    ? "Saving..."
    : isUploading
    ? "Please wait for the upload to finish"
    : !isFormValid
    ? Object.values(formValidationErrors)[0]
    : !isFormChanged()
    ? "No changes to save"
    : undefined;

  return (
    <FormPage
      title="Edit advisor details"
      description="Update account information, manager assignment, and supporting documents."
      icon={Pencil}
      onSubmit={handleUpdate}
      onCancel={() => router.push(`${basePath}/${id}`)}
      submitLabel="Save changes"
      submitting={isUpdatingPartner}
      submitDisabled={isUploading || !isFormChanged() || !isFormValid}
      cancelDisabled={isUploading}
      stickyActions
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-ub-lg border border-ub-border bg-ub-surface-subtle p-4">
        <div className="flex min-w-0 items-center gap-4">
          {PROFILE_PHOTO_UPLOAD_ENABLED ? (
            <AvatarUpload
              doc={isIndividual ? profilePhoto : logo}
              name={partner.name}
              isActive={partner.is_active}
              onUpload={(f) =>
                handleUpload(f, isIndividual ? setProfilePhoto : setLogo)
              }
            />
          ) : (
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-ub-tone-brand-bg text-sm font-semibold text-ub-text-link">
                <PresignedImage
                  fileKey={isIndividual ? profilePhoto.file_key : logo.file_key}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  fallback={
                    partner.name ? partner.name.slice(0, 2).toUpperCase() : "NA"
                  }
                />
              </div>
              <span
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-ub-surface ${
                  partner.is_active ? "bg-ub-tone-success-dot" : "bg-ub-tone-neutral-dot"
                }`}
              />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-ub-text-primary">
              {isCompany ? formData.company_name || partner.name : partner.name}
            </h2>
            <p className="truncate text-sm text-ub-text-secondary">
              {isCompany && formData.company_name ? `${partner.name} • ` : ""}
              {partner.email}
            </p>
          </div>
        </div>
      </div>

      {/* Partner Details */}
      <div className="rounded-ub-lg border border-ub-border p-4 sm:p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ub-text-secondary">
          Advisor Details
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Advisor Name"
            field="name"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            onBlur={() => validateField("name")}
          />
          <InputField
            label="Email Address"
            field="email"
            type="email"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            onBlur={() => validateField("email")}
          />
          <SearchableDropdown
            label="Country of Residence"
            field="country"
            options={COUNTRY_OPTIONS}
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            onBlur={() => validateField("country")}
          />
          <SearchableDropdown
            label="Nationality"
            field="nationality"
            options={NATIONALITY_OPTIONS}
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
          <div>
            <SelectField
              label="Advisor Type"
              field="type"
              options={PARTNER_TYPE.map((p) => ({
                value: p.value,
                label: p.label,
              }))}
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => validateField("type")}
              disabled={isTypeLocked}
            />
            {isTypeLocked && (
              <p className="-mt-3 mb-4 text-xs text-ub-text-secondary">
                A company can&apos;t be changed back to an individual partner.
              </p>
            )}
            {isConvertingToAgency && (
              <p className="-mt-3 mb-4 text-xs text-ub-tone-warning-text">
                Saving will convert this advisor into a company that can invite
                team members.
                {partner.public_profile
                  ? " Their public profile will be taken offline — the page and its link are kept, but it can't be published again while they're a company."
                  : ""}
              </p>
            )}
          </div>
          <PhoneInputField
            dialCodeField="phone_code"
            numberField="phone_number"
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            required
            onBlur={() => validateField("phone_number")}
          />
          <SelectField
            label="Assigned Manager"
            field="manager_id"
            required={false}
            options={accountManagers.map((m) => ({
              label: m.name,
              value: m.id,
            }))}
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        </div>
      </div>

      {/* Account Settings */}
      <div className="rounded-ub-lg border border-ub-border p-4 sm:p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ub-text-secondary">
          Account Settings
        </p>
        <ToggleInput
          label="Account Active"
          field="is_active"
          formData={formData}
          errors={{}}
          updateFormData={updateFormData}
          enabledText="Active"
          disabledText="Suspended"
          enabledDescription="This advisor can log in and access the platform."
          disabledDescription="This advisor cannot log in until reactivated."
        />
      </div>

      {/* Individual Details */}
      {isIndividual && (
        <div className="rounded-ub-lg border border-ub-border p-4 sm:p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ub-text-secondary">
            Individual Details
          </p>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectField
              label="Background"
              field="background"
              required={false}
              options={BACKGROUND_OPTIONS}
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
            <InputField
              label="LinkedIn URL"
              field="linkedin_url"
              type="url"
              required={false}
              placeholder="https://linkedin.com/in/yourname"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => validateField("linkedin_url")}
            />
            <InputField
              label="Social Media URL"
              field="social_media_url"
              type="url"
              required={false}
              placeholder="https://..."
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => validateField("social_media_url")}
            />
            <InputField
              label="Date of Birth"
              field="date_of_birth"
              type="date"
              required={false}
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
            <InputField
              label="Passport Number"
              field="passport_number"
              required={false}
              placeholder="A12345678"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
          </div>
          <StoredDocumentUpload
            label="Passport Photo"
            document={passportPhoto}
            id="passport-photo"
            onUpload={(f) => handleUpload(f, setPassportPhoto)}
          />
        </div>
      )}

      {/* Public Profile — individual only; V1 profiles don't exist for agencies */}
      {isIndividual && partner?.public_profile && (
        <div className="rounded-ub-lg border border-ub-border p-4 sm:p-6">
          <p className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ub-text-secondary">
            <Globe2 className="h-3.5 w-3.5" />
            Public Profile
          </p>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Slug"
              field="pp_slug"
              required={false}
              placeholder="jane-doe"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
            <InputField
              label="Public Display Name"
              field="pp_display_name"
              required={false}
              placeholder="Jane Doe"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
            <PhoneInputField
              label="Public WhatsApp Number"
              dialCodeField="pp_whatsapp_code"
              numberField="pp_whatsapp_number"
              required={false}
              placeholder="123456789"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
            <MultiSelect
              label="Countries Supported"
              field="pp_countries_supported"
              required={false}
              placeholder="Select countries..."
              options={COUNTRIES.map((c) => ({ value: c.name, label: c.name }))}
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
          </div>
          <TextareaField
            label="Bio"
            field="pp_bio"
            required={false}
            placeholder="A short introduction shown on the public page."
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
          <ToggleInput
            label="Publish Status"
            field="pp_is_published"
            formData={formData}
            errors={{}}
            updateFormData={updateFormData}
            enabledText="Published"
            disabledText="Unpublished"
            enabledDescription="This advisor's profile is live and publicly visible."
            disabledDescription="This advisor's profile is hidden from the public."
          />
          <p className="mt-4 text-xs text-ub-text-tertiary">
            Verification is granted automatically when a student this advisor
            supported gets their visa approved — there&apos;s no manual control
            for it.
          </p>
        </div>
      )}

      {/* Company Details */}
      {isCompany && (
        <div className="rounded-ub-lg border border-ub-border p-4 sm:p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ub-text-secondary">
            Company Details
          </p>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Company Name"
              field="company_name"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => validateField("company_name")}
            />
            <InputField
              label="Website URL"
              field="website_url"
              required={false}
              placeholder="https://..."
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => validateField("website_url")}
            />
            <InputField
              label="Date of Birth"
              field="date_of_birth"
              type="date"
              required={false}
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
            <InputField
              label="Passport Number"
              field="passport_number"
              required={false}
              placeholder="A12345678"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
          </div>
          <StoredDocumentUpload
            label="Company Registration Document"
            document={companyRegDoc}
            id="company-reg-doc"
            onUpload={(f) => handleUpload(f, setCompanyRegDoc)}
          />
          <StoredDocumentUpload
            label="Passport Photo"
            document={passportPhoto}
            id="comp-passport-photo"
            onUpload={(f) => handleUpload(f, setPassportPhoto)}
          />
        </div>
      )}
    </FormPage>
  );
}
