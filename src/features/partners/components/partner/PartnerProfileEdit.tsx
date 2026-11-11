"use client";

import StoredDocumentUpload from "components/ub/forms/uploads/StoredDocumentUpload";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Upload } from "lucide-react";
import { usePartnerProfile, useUpdatePartnerProfile } from "features/partners";
import Loading from "components/ub/feedback/states/Loading";
import EmptyData from "components/ub/feedback/states/EmptyTableData";
import InputField from "components/ub/forms/text/InputField";
import SelectField from "components/ub/forms/selection/SelectField";
import PhoneInputField from "components/ub/forms/text/PhoneInputField";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getPresignedUploads, uploadFilesToSpaces, ALLOWED_FILE_TYPES } from "services/uploadService";
import PresignedImage from "components/ub/data/media/PresignedImage";
import { COUNTRY_OPTIONS, isKnownCountry, NATIONALITIES, BACKGROUND_OPTIONS } from "constants/lists";
import { isValidWebsiteUrl } from "utils/socialMedia";
import Button from "components/ub/core/buttons/Button";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import SearchableDropdown from "components/ub/forms/selection/SearchableDropdown";

const NATIONALITY_OPTIONS = NATIONALITIES.map((n) => ({ value: n.name, label: n.name }));

const PROFILE_UPDATE_FIELD_MAP: Record<string, string> = {
  phone: "phone_number",
};

const PROFILE_PHOTO_UPLOAD_ENABLED = true;

type DocState = {
  file_key: string;
  file_url: string;
  uploading: boolean;
  progress: number;
  error: string;
};

function AvatarUpload({ doc, name, onUpload }: { doc: DocState; name: string; isActive: boolean; onUpload: (file: File) => void }) {
  return <StoredDocumentUpload id="profile-photo" label={`${name} photo`} document={doc} onUpload={onUpload} imageOnly />;
}


export default function EditPartnerProfile() {
  const router = useRouter();
  const { showToast } = useToast();
  const { partner, isPartnerLoading, partnerError } = usePartnerProfile();
  const { updateProfile, loading: isUpdating } = useUpdatePartnerProfile();

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    phone_code: "+60",
    phone_number: "",
    background: "",
    social_media_url: "",
    linkedin_url: "",
    company_name: "",
    website_url: "",
    nationality: "",
    date_of_birth: "",
    passport_number: "",
  });

  const [profilePhoto, setProfilePhoto] = useState<DocState>({ file_key: "", file_url: "", uploading: false, progress: 0, error: "" });
  const [logo, setLogo] = useState<DocState>({ file_key: "", file_url: "", uploading: false, progress: 0, error: "" });
  const [passportPhoto, setPassportPhoto] = useState<DocState>({ file_key: "", file_url: "", uploading: false, progress: 0, error: "" });
  const [companyRegDoc, setCompanyRegDoc] = useState<DocState>({ file_key: "", file_url: "", uploading: false, progress: 0, error: "" });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleApiError = useApiFormErrors({
    fieldMap: PROFILE_UPDATE_FIELD_MAP,
    setErrors: (patch) => {
      setErrors((prev) => ({ ...prev, ...patch }));
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) => showToast(message, "error"),
  });

  useEffect(() => {
    if (!partner) return;
    const rawPhone = (partner.phone ?? "").replace(/^undefined/, "").trim();
    const phoneMatch = rawPhone.match(/^(\+\d{1,3})\s+(.*)/);
    setFormData({
      name: partner.name ?? "",
      country: partner.country ?? "",
      phone_code: phoneMatch ? phoneMatch[1] : "+60",
      phone_number: phoneMatch ? phoneMatch[2] : rawPhone,
      background: partner.individual_details?.background ?? "",
      social_media_url: partner.individual_details?.social_media_url ?? "",
      linkedin_url: partner.individual_details?.linkedin_url ?? "",
      company_name: partner.company_details?.company_name ?? "",
      website_url: partner.company_details?.website_url ?? "",
      nationality: partner.nationality ?? "",
      date_of_birth: (partner.individual_details?.date_of_birth ?? partner.company_details?.date_of_birth) ?? "",
      passport_number: (partner.individual_details?.passport_number ?? partner.company_details?.passport_number) ?? "",
    });
    if (partner.type === "individual" && partner.individual_details) {
      setProfilePhoto((p) => ({ ...p, file_key: partner.individual_details!.profile_photo_file_key ?? "", file_url: partner.individual_details!.profile_photo_file_url ?? "" }));
      setPassportPhoto((p) => ({ ...p, file_key: partner.individual_details!.passport_photo_file_key ?? "", file_url: partner.individual_details!.passport_photo_file_url ?? "" }));
    }
    if (partner.type === "agency" && partner.company_details) {
      setCompanyRegDoc((p) => ({ ...p, file_key: partner.company_details!.company_registration_doc_file_key ?? "", file_url: partner.company_details!.company_registration_doc_file_url ?? "" }));
      setLogo((p) => ({ ...p, file_key: partner.company_details!.logo_file_key ?? "", file_url: partner.company_details!.logo_file_url ?? "" }));
      setPassportPhoto((p) => ({ ...p, file_key: partner.company_details!.passport_photo_file_key ?? "", file_url: partner.company_details!.passport_photo_file_url ?? "" }));
    }
  }, [partner]);

  const updateFormData = (field: string, value: unknown) => {
    setFormData((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleUpload = async (
    file: File,
    setDoc: React.Dispatch<React.SetStateAction<DocState>>,
    docField: string
  ) => {
    setDoc((p) => ({ ...p, uploading: true, progress: 0, error: "" }));
    try {
      const presigned = await getPresignedUploads([file], "partners-files");
      const results = await uploadFilesToSpaces([file], presigned, (_i, pct) => {
        setDoc((p) => ({ ...p, progress: pct }));
      });
      setDoc({ file_key: results[0].file_key, file_url: results[0].public_url, uploading: false, progress: 100, error: "" });
    } catch {
      setDoc((p) => ({ ...p, uploading: false, progress: 0, error: "Upload failed. Please try again." }));
    }
  };

  const isUploading = profilePhoto.uploading || logo.uploading || passportPhoto.uploading || companyRegDoc.uploading;

  const isFormChanged = () => {
    if (!partner) return false;
    return (
      formData.name.trim() !== partner.name?.trim() ||
      formData.country.trim() !== partner.country?.trim() ||
      `${formData.phone_code} ${formData.phone_number}`.trim() !== partner.phone?.trim() ||
      profilePhoto.file_key !== (partner.individual_details?.profile_photo_file_key ?? "") ||
      passportPhoto.file_key !== ((partner.individual_details?.passport_photo_file_key ?? partner.company_details?.passport_photo_file_key) ?? "") ||
      formData.background !== (partner.individual_details?.background ?? "") ||
      formData.linkedin_url !== (partner.individual_details?.linkedin_url ?? "") ||
      formData.social_media_url !== (partner.individual_details?.social_media_url ?? "") ||
      formData.company_name !== (partner.company_details?.company_name ?? "") ||
      formData.website_url !== (partner.company_details?.website_url ?? "") ||
      formData.nationality !== (partner.nationality ?? "") ||
      formData.date_of_birth !== ((partner.individual_details?.date_of_birth ?? partner.company_details?.date_of_birth) ?? "") ||
      formData.passport_number !== ((partner.individual_details?.passport_number ?? partner.company_details?.passport_number) ?? "") ||
      companyRegDoc.file_key !== (partner.company_details?.company_registration_doc_file_key ?? "") ||
      logo.file_key !== (partner.company_details?.logo_file_key ?? "")
    );
  };

  const computeErrors = () => {
    const e: Record<string, string> = {};
    const type = partner?.type;

    if (!formData.name.trim()) e.name = "Name is required";
    else if (formData.name.trim().length < 3) e.name = "Name must be at least 3 characters";

    if (!formData.country) e.country = "Country is required";
    else if (!isKnownCountry(formData.country)) e.country = "Select a country from the list";

    if (!formData.phone_number.trim()) e.phone_number = "Phone number is required";
    else if (formData.phone_number.trim().length < 5) e.phone_number = "Phone number must be at least 5 digits";

    if (type === "individual") {
      if (formData.linkedin_url && !isValidWebsiteUrl(formData.linkedin_url))
        e.linkedin_url = "Enter a valid URL starting with https://";
      if (formData.social_media_url && !isValidWebsiteUrl(formData.social_media_url))
        e.social_media_url = "Enter a valid URL starting with https://";
    }

    if (type === "agency") {
      if (!formData.company_name.trim()) e.company_name = "Company name is required";
      else if (formData.company_name.trim().length < 3) e.company_name = "Company name must be at least 3 characters";
      if (formData.website_url && !isValidWebsiteUrl(formData.website_url))
        e.website_url = "Enter a valid URL starting with https://";
    }

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
    setErrors((prev) => ({ ...prev, [field]: e[field] ?? "" }));
  };

  const handleUpdate = async () => {
    if (!validate() || !partner) return;
    try {
      const payload: any = {
        name: formData.name.trim(),
        type: partner.type,
        country: formData.country,
        ...(formData.nationality ? { nationality: formData.nationality } : {}),
        phone: `${formData.phone_code || "+60"} ${formData.phone_number}`,
      };
      if (partner.type === "individual") {
        payload.individual_details = {
          profile_photo_file_key: profilePhoto.file_key,
          profile_photo_file_url: profilePhoto.file_url,
          passport_photo_file_key: passportPhoto.file_key,
          passport_photo_file_url: passportPhoto.file_url,
          ...(formData.date_of_birth ? { date_of_birth: formData.date_of_birth } : {}),
          ...(formData.passport_number ? { passport_number: formData.passport_number } : {}),
          background: formData.background,
          social_media_url: formData.social_media_url,
          linkedin_url: formData.linkedin_url,
        };
      } else {
        payload.company_details = {
          company_name: formData.company_name,
          website_url: formData.website_url,
          company_registration_doc_file_key: companyRegDoc.file_key,
          company_registration_doc_file_url: companyRegDoc.file_url,
          logo_file_key: logo.file_key,
          logo_file_url: logo.file_url,
          passport_photo_file_key: passportPhoto.file_key,
          passport_photo_file_url: passportPhoto.file_url,
          ...(formData.date_of_birth ? { date_of_birth: formData.date_of_birth } : {}),
          ...(formData.passport_number ? { passport_number: formData.passport_number } : {}),
        };
      }
      await updateProfile(payload);
      showToast("Profile updated successfully", "success");
      router.push("/partner/profile");
    } catch (err: unknown) {
      handleApiError(err, "Update failed. Please try again.");
    }
  };

  if (isPartnerLoading) return <Loading text="Loading profile..." />;
  if (partnerError || !partner) return <EmptyData />;

  const isIndividual = partner.type === "individual";
  const isCompany = partner.type === "agency";

  const passportNumberLocked = !!(partner.individual_details?.passport_number || partner.company_details?.passport_number);
  const passportPhotoLocked = !!(partner.individual_details?.passport_photo_file_key || partner.company_details?.passport_photo_file_key);

  const saveDisabledReason = isUpdating
    ? "Saving..."
    : isUploading
    ? "Please wait for the upload to finish"
    : !isFormChanged()
    ? "No changes to save"
    : undefined;

  return (
    <div className="mx-auto mt-6 max-w-5xl">
      <div className="min-w-0 overflow-clip rounded-ub-xl border border-ub-border bg-ub-surface">

        {/* Header */}
        <div className="flex items-center gap-4 border-b border-ub-border px-6 py-5">
          {PROFILE_PHOTO_UPLOAD_ENABLED ? (
            <AvatarUpload
              doc={isIndividual ? profilePhoto : logo}
              name={partner.name}
              isActive={partner.is_active}
              onUpload={(f) => handleUpload(f, isIndividual ? setProfilePhoto : setLogo, isIndividual ? "profile_photo" : "logo")}
            />
          ) : (
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-ub-tone-brand-bg text-sm font-semibold text-ub-text-link">
                <PresignedImage
                  fileKey={isIndividual ? profilePhoto.file_key : logo.file_key}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  fallback={partner.name?.slice(0, 2).toUpperCase() || "NA"}
                />
              </div>
              <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-ub-surface ${partner.is_active ? "bg-ub-tone-success-dot" : "bg-ub-tone-neutral-dot"}`} />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-ub-text-primary">
              {isCompany ? formData.company_name || partner.name : partner.name}
            </h2>
            <p className="text-sm text-ub-text-secondary">
              {isCompany && formData.company_name ? `${partner.name} • ` : ""}
              {isIndividual ? "Individual Advisor" : "Agency / Company"}
            </p>
          </div>
        </div>

        {/* Base fields */}
        <div className="border-b border-ub-border p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ub-text-secondary">Account Details</p>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <InputField
              label="Full Name"
              field="name"
              required
              placeholder="Enter your full name"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => validateField("name")}
            />
            <SelectField
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
            <PhoneInputField
              dialCodeField="phone_code"
              numberField="phone_number"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => validateField("phone_number")}
            />
          </div>
        </div>

        {/* Individual details */}
        {isIndividual && (
          <div className="border-b border-ub-border p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ub-text-secondary">Individual Details</p>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
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
                disabled={passportNumberLocked}
                helperText="Contact support to change your passport number."
              />
            </div>
            <StoredDocumentUpload
              label="Passport Photo"
              document={passportPhoto}
              id="passport-photo"
              onUpload={(f) => handleUpload(f, setPassportPhoto, "passport_photo")}
              locked={passportPhotoLocked}
            />
          </div>
        )}

        {/* Company details */}
        {isCompany && (
          <div className="border-b border-ub-border p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ub-text-secondary">Company Details</p>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <InputField
                label="Company Name"
                field="company_name"
                required={false}
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
                disabled={passportNumberLocked}
                helperText="Contact support to change your passport number."
              />
            </div>
            <div className="space-y-4">
              <StoredDocumentUpload
                label="Company Registration Document"
                document={companyRegDoc}
                id="company-reg-doc"
                onUpload={(f) => handleUpload(f, setCompanyRegDoc, "company_registration_doc")}
              />
              <StoredDocumentUpload
                label="Passport Photo"
                document={passportPhoto}
                id="comp-passport-photo"
                onUpload={(f) => handleUpload(f, setPassportPhoto, "passport_photo")}
                locked={passportPhotoLocked}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-5">
          <Button
            type="button"
            onClick={() => router.push("/partner/profile")}
            disabled={isUpdating}
            icon={<ChevronLeft className="h-4 w-4" />}
            text="Back"
            variant="secondary"
            className="hover:bg-ub-surface-subtle"
          />
          <Button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating || isUploading || !isFormChanged()}
            title={saveDisabledReason}
            icon={<Save className="h-4 w-4" />}
            text={isUpdating ? "Saving…" : "Save Changes"}
            variant="primary"
            className="font-semibold hover:bg-ub-action-primary-hover"
          />
        </div>
      </div>
    </div>
  );
}
