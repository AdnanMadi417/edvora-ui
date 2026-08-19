"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronLeft, ExternalLink, FileText, Save, Upload } from "lucide-react";
import { usePartnerProfile, useUpdatePartnerProfile } from "features/partners";
import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";
import InputField from "components/form/fields/InputField";
import SelectField from "components/form/fields/SelectField";
import PhoneInputField from "components/form/fields/PhoneInputField";
import SocialMediaInputField from "components/form/fields/SocialMediaInputField";
import { useToast } from "components/context/ToastContext";
import { getPresignedUploads, uploadFilesToSpaces, ALLOWED_FILE_TYPES } from "services/uploadService";
import { getDocumentDownloadUrl } from "services/documentService";
import PresignedImage from "components/ui/PresignedImage";
import { COUNTRIES, NATIONALITIES, BACKGROUND_OPTIONS } from "constants/lists";
import { parseSocialMediaUrl, validateSocialMediaField, isValidPlatformUrl } from "utils/socialMedia";
import Button from "components/ui/buttons/Button";
import IconButton from "components/ui/buttons/IconButton";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import SearchableDropdown from "components/form/search/SearchableDropdown";

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.name, label: c.name }));
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

function DocUploadField({
  label,
  doc,
  fieldId,
  onUpload,
  locked = false,
}: {
  label: string;
  doc: DocState;
  fieldId: string;
  onUpload: (file: File) => void;
  locked?: boolean;
}) {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  const handleView = async () => {
    if (!doc.file_key || downloading) return;
    setDownloading(true);
    try {
      const url = await getDocumentDownloadUrl(doc.file_key);
      window.open(url, "_blank");
    } catch {
      showToast("Failed to load document.", "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm font-medium text-slate-900">{label}</label>
      {doc.uploading ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Uploading…</span>
            <span className="font-medium text-blue-600">{doc.progress}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${doc.progress}%` }} />
          </div>
        </div>
      ) : doc.file_key ? (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <FileText className="h-5 w-5" />
            </div>
            <p className="truncate text-sm font-semibold text-slate-800">{label}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:ml-4">
            <IconButton
              onClick={handleView}
              disabled={downloading}
              title="View document"
              icon={<ExternalLink className={`h-4 w-4 ${downloading ? "animate-pulse" : ""}`} />}
              bgColor="bg-green-50"
              textColor="text-green-600"
              borderColor="border-transparent"
              hoverTextColor="hover:text-green-600"
              hoverBorderColor="hover:border-green-200"
              className="hover:bg-green-100"
            />
            {!locked && (
              <label htmlFor={fieldId} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">
                <Upload className="h-3.5 w-3.5" /> Replace
                <input id={fieldId} type="file" accept={ALLOWED_FILE_TYPES.extensions.join(",")} className="hidden" onChange={handleChange} />
              </label>
            )}
          </div>
        </div>
      ) : (
        <label htmlFor={fieldId} className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500 transition-colors hover:border-blue-400 hover:bg-blue-50/40">
          <Upload className="h-4 w-4" /> Upload {label}
          <input id={fieldId} type="file" accept={ALLOWED_FILE_TYPES.extensions.join(",")} className="hidden" onChange={handleChange} />
        </label>
      )}
      {doc.error && <p className="mt-1 text-xs text-red-600">{doc.error}</p>}
      {locked && doc.file_key && (
        <p className="mt-1 text-xs text-slate-400">Contact support to change your passport photo.</p>
      )}
    </div>
  );
}

function AvatarUpload({
  doc,
  name,
  isActive,
  onUpload,
}: {
  doc: DocState;
  name: string;
  isActive: boolean;
  onUpload: (file: File) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  return (
    <div className="relative shrink-0">
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
        <PresignedImage
          fileKey={doc.file_key}
          alt="Profile"
          className="h-full w-full object-cover"
          fallback={name?.slice(0, 2).toUpperCase() || "NA"}
        />
        {doc.uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-[10px] font-medium text-white">
            {doc.progress}%
          </div>
        )}
      </div>
      <span className={`absolute -bottom-0.5 left-0 h-3.5 w-3.5 rounded-full border-2 border-white ${isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
      <label
        htmlFor="profile-photo"
        className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white transition-colors hover:bg-blue-700"
        title="Change photo"
      >
        <Camera className="h-3 w-3" />
        <input id="profile-photo" type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleChange} />
      </label>
    </div>
  );
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
    social_platform: "",
    social_username: "",
    linkedin_url: "",
    linkedin_platform: "linkedin",
    linkedin_username: "",
    company_name: "",
    website_url: "",
    nationality: "",
    date_of_birth: "",
    passport_number: "",
  });

  const [profilePhoto, setProfilePhoto] = useState<DocState>({ file_key: "", file_url: "", uploading: false, progress: 0, error: "" });
  const [logo, setLogo] = useState<DocState>({ file_key: "", file_url: "", uploading: false, progress: 0, error: "" });
  const [passportPhoto, setPassportPhoto] = useState<DocState>({ file_key: "", file_url: "", uploading: false, progress: 0, error: "" });
  const [idDoc, setIdDoc] = useState<DocState>({ file_key: "", file_url: "", uploading: false, progress: 0, error: "" });
  const [companyRegDoc, setCompanyRegDoc] = useState<DocState>({ file_key: "", file_url: "", uploading: false, progress: 0, error: "" });
  const [contactIdDoc, setContactIdDoc] = useState<DocState>({ file_key: "", file_url: "", uploading: false, progress: 0, error: "" });

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
    const { platform: socialPlatform, username: socialUsername } = parseSocialMediaUrl(partner.individual_details?.social_media_url ?? "");
    const { username: linkedinUsername } = parseSocialMediaUrl(partner.individual_details?.linkedin_url ?? "");
    setFormData({
      name: partner.name ?? "",
      country: partner.country ?? "",
      phone_code: phoneMatch ? phoneMatch[1] : "+60",
      phone_number: phoneMatch ? phoneMatch[2] : rawPhone,
      background: partner.individual_details?.background ?? "",
      social_media_url: partner.individual_details?.social_media_url ?? "",
      social_platform: socialPlatform,
      social_username: socialUsername,
      linkedin_url: partner.individual_details?.linkedin_url ?? "",
      linkedin_platform: "linkedin",
      linkedin_username: linkedinUsername,
      company_name: partner.company_details?.company_name ?? "",
      website_url: partner.company_details?.website_url ?? "",
      nationality: partner.nationality ?? "",
      date_of_birth: (partner.individual_details?.date_of_birth ?? partner.company_details?.date_of_birth) ?? "",
      passport_number: (partner.individual_details?.passport_number ?? partner.company_details?.passport_number) ?? "",
    });
    if (partner.type === "individual" && partner.individual_details) {
      setIdDoc((p) => ({ ...p, file_key: partner.individual_details!.id_document_file_key ?? "", file_url: partner.individual_details!.id_document_file_url ?? "" }));
      setProfilePhoto((p) => ({ ...p, file_key: partner.individual_details!.profile_photo_file_key ?? "", file_url: partner.individual_details!.profile_photo_file_url ?? "" }));
      setPassportPhoto((p) => ({ ...p, file_key: partner.individual_details!.passport_photo_file_key ?? "", file_url: partner.individual_details!.passport_photo_file_url ?? "" }));
    }
    if (partner.type === "agency" && partner.company_details) {
      setCompanyRegDoc((p) => ({ ...p, file_key: partner.company_details!.company_registration_doc_file_key ?? "", file_url: partner.company_details!.company_registration_doc_file_url ?? "" }));
      setContactIdDoc((p) => ({ ...p, file_key: partner.company_details!.contact_id_document_file_key ?? "", file_url: partner.company_details!.contact_id_document_file_url ?? "" }));
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

  const isUploading = profilePhoto.uploading || logo.uploading || passportPhoto.uploading || idDoc.uploading || companyRegDoc.uploading || contactIdDoc.uploading;

  const isFormChanged = () => {
    if (!partner) return false;
    return (
      formData.name.trim() !== partner.name?.trim() ||
      formData.country.trim() !== partner.country?.trim() ||
      `${formData.phone_code} ${formData.phone_number}`.trim() !== partner.phone?.trim() ||
      idDoc.file_key !== (partner.individual_details?.id_document_file_key ?? "") ||
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
      contactIdDoc.file_key !== (partner.company_details?.contact_id_document_file_key ?? "") ||
      logo.file_key !== (partner.company_details?.logo_file_key ?? "")
    );
  };

  const isValidUrl = (val: string) => {
    try {
      const url = new URL(val);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch { return false; }
  };

  const computeErrors = () => {
    const e: Record<string, string> = {};
    const type = partner?.type;

    if (!formData.name.trim()) e.name = "Name is required";
    else if (formData.name.trim().length < 3) e.name = "Name must be at least 3 characters";

    if (!formData.country) e.country = "Country is required";

    if (!formData.phone_number.trim()) e.phone_number = "Phone number is required";
    else if (formData.phone_number.trim().length < 5) e.phone_number = "Phone number must be at least 5 digits";

    if (type === "individual") {
      if (formData.linkedin_url && !isValidPlatformUrl("linkedin", formData.linkedin_url))
        e.linkedin_url = "Enter a valid LinkedIn URL (e.g. https://linkedin.com/in/yourname)";
      if (formData.social_platform || formData.social_username) {
        const socialError = validateSocialMediaField(formData, { platformField: "social_platform", usernameField: "social_username" });
        if (socialError) e.social_media_url = socialError;
      }
    }

    if (type === "agency") {
      if (!formData.company_name.trim()) e.company_name = "Company name is required";
      else if (formData.company_name.trim().length < 3) e.company_name = "Company name must be at least 3 characters";
      if (formData.website_url && !isValidUrl(formData.website_url))
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
          id_document_file_key: idDoc.file_key,
          id_document_file_url: idDoc.file_url,
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
          contact_id_document_file_key: contactIdDoc.file_key,
          contact_id_document_file_url: contactIdDoc.file_url,
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
      <div className="rounded-lg border border-slate-200 bg-white">

        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-200 px-6 py-5">
          {PROFILE_PHOTO_UPLOAD_ENABLED ? (
            <AvatarUpload
              doc={isIndividual ? profilePhoto : logo}
              name={partner.name}
              isActive={partner.is_active}
              onUpload={(f) => handleUpload(f, isIndividual ? setProfilePhoto : setLogo, isIndividual ? "profile_photo" : "logo")}
            />
          ) : (
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                <PresignedImage
                  fileKey={isIndividual ? profilePhoto.file_key : logo.file_key}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  fallback={partner.name?.slice(0, 2).toUpperCase() || "NA"}
                />
              </div>
              <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${partner.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isCompany ? formData.company_name || partner.name : partner.name}
            </h2>
            <p className="text-sm text-slate-500">
              {isCompany && formData.company_name ? `${partner.name} • ` : ""}
              {isIndividual ? "Individual Advisor" : "Agency / Company"}
            </p>
          </div>
        </div>

        {/* Base fields */}
        <div className="border-b border-slate-200 p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Account Details</p>
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
          <div className="border-b border-slate-200 p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Individual Details</p>
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
              <SocialMediaInputField
                label="LinkedIn URL"
                platformField="linkedin_platform"
                usernameField="linkedin_username"
                urlField="linkedin_url"
                lockedPlatform="linkedin"
                required={false}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                onBlur={() => validateField("linkedin_url")}
              />
              <SocialMediaInputField
                label="Social Media URL"
                platformField="social_platform"
                usernameField="social_username"
                urlField="social_media_url"
                required={false}
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
            <DocUploadField
              label="Identity Document"
              doc={idDoc}
              fieldId="id-doc"
              onUpload={(f) => handleUpload(f, setIdDoc, "id_document")}
            />
            <DocUploadField
              label="Passport Photo"
              doc={passportPhoto}
              fieldId="passport-photo"
              onUpload={(f) => handleUpload(f, setPassportPhoto, "passport_photo")}
              locked={passportPhotoLocked}
            />
          </div>
        )}

        {/* Company details */}
        {isCompany && (
          <div className="border-b border-slate-200 p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Company Details</p>
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
              <DocUploadField
                label="Company Registration Document"
                doc={companyRegDoc}
                fieldId="company-reg-doc"
                onUpload={(f) => handleUpload(f, setCompanyRegDoc, "company_registration_doc")}
              />
              <DocUploadField
                label="Contact Identity Document"
                doc={contactIdDoc}
                fieldId="contact-id-doc"
                onUpload={(f) => handleUpload(f, setContactIdDoc, "contact_id_document")}
              />
              <DocUploadField
                label="Passport Photo"
                doc={passportPhoto}
                fieldId="comp-passport-photo"
                onUpload={(f) => handleUpload(f, setPassportPhoto, "passport_photo")}
                locked={passportPhotoLocked}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-5">
          <Button
            type="button"
            onClick={() => router.push("/partner/profile")}
            disabled={isUpdating}
            icon={<ChevronLeft className="h-4 w-4" />}
            text="Back"
            bgColor="bg-white"
            textColor="text-slate-700"
            borderColor="border-slate-200"
            hoverTextColor="hover:text-slate-700"
            hoverBorderColor="hover:border-slate-200"
            className="hover:bg-slate-50"
          />
          <Button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating || isUploading || !isFormChanged()}
            title={saveDisabledReason}
            icon={<Save className="h-4 w-4" />}
            text={isUpdating ? "Saving…" : "Save Changes"}
            bgColor="bg-blue-600"
            textColor="text-white"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-white"
            hoverBorderColor="hover:border-blue-600"
            className="font-semibold hover:bg-blue-700"
          />
        </div>
      </div>
    </div>
  );
}
