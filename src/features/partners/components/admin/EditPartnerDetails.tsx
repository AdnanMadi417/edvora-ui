"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronLeft, ExternalLink, FileText, Pencil, Upload } from "lucide-react";
import { usePartnerDetails, useUpdatePartner, useAssignPartnerManager } from "features/partners/hooks";
import { useAccountManagers } from "features/account-managers/hooks";
import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";
import InputField from "components/form/fields/InputField";
import PhoneInputField from "components/form/fields/PhoneInputField";
import ToggleInput from "components/form/toggle/ToggleInput";
import SelectField from "components/form/fields/SelectField";
import SearchableDropdown from "components/form/search/SearchableDropdown";
import SocialMediaInputField from "components/form/fields/SocialMediaInputField";
import Button from "components/ui/buttons/Button";
import IconButton from "components/ui/buttons/IconButton";
import { useToast } from "components/context/ToastContext";
import { getPresignedUploads, uploadFilesToSpaces, ALLOWED_FILE_TYPES } from "services/uploadService";
import { getDocumentDownloadUrl } from "services/documentService";
import PresignedImage from "components/ui/PresignedImage";
import { COUNTRIES, PARTNER_TYPE, BACKGROUND_OPTIONS } from "constants/lists";
import { parseSocialMediaUrl, validateSocialMediaField } from "utils/socialMedia";
import { parseApiError } from "utils/parseApiError";

interface Props {
  id: string;
}

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
}: {
  label: string;
  doc: DocState;
  fieldId: string;
  onUpload: (file: File) => void;
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
        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <FileText className="h-5 w-5" />
            </div>
            <p className="truncate text-sm font-semibold text-slate-800">{label}</p>
          </div>
          <div className="ml-4 flex shrink-0 items-center gap-2">
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
            <label htmlFor={fieldId} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">
              <Upload className="h-3.5 w-3.5" /> Replace
              <input id={fieldId} type="file" accept={ALLOWED_FILE_TYPES.extensions.join(",")} className="hidden" onChange={handleChange} />
            </label>
          </div>
        </div>
      ) : (
        <label htmlFor={fieldId} className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500 transition-colors hover:border-blue-400 hover:bg-blue-50/40">
          <Upload className="h-4 w-4" /> Upload {label}
          <input id={fieldId} type="file" accept={ALLOWED_FILE_TYPES.extensions.join(",")} className="hidden" onChange={handleChange} />
        </label>
      )}
      {doc.error && <p className="mt-1 text-xs text-red-600">{doc.error}</p>}
    </div>
  );
}

const EMPTY_DOC: DocState = { file_key: "", file_url: "", uploading: false, progress: 0, error: "" };

const PROFILE_PHOTO_UPLOAD_ENABLED = true;

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

export default function EditPartnerDetails({ id }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { partner, isPartnerLoading } = usePartnerDetails(id);
  const { updatePartner, isUpdatingPartner } = useUpdatePartner();
  const { assignManager, loading: assignLoading, error: assignError } = useAssignPartnerManager();
  const { accountManagers } = useAccountManagers();

  const [formData, setFormData] = useState<any>({
    name: "", country: "", email: "", type: "",
    phone_code: "+60", phone_number: "",
    manager_id: "", assigned_manager_name: "",
    is_active: true,
    background: "", linkedin_url: "", linkedin_platform: "linkedin", linkedin_username: "", social_media_url: "", social_platform: "", social_username: "",
    company_name: "", website_url: "",
    date_of_birth: "", passport_number: "",
  });

  const [profilePhoto, setProfilePhoto] = useState<DocState>(EMPTY_DOC);
  const [logo, setLogo] = useState<DocState>(EMPTY_DOC);
  const [passportPhoto, setPassportPhoto] = useState<DocState>(EMPTY_DOC);
  const [idDoc, setIdDoc] = useState<DocState>(EMPTY_DOC);
  const [companyRegDoc, setCompanyRegDoc] = useState<DocState>(EMPTY_DOC);
  const [contactIdDoc, setContactIdDoc] = useState<DocState>(EMPTY_DOC);

  useEffect(() => {
    if (!partner) return;
    const rawPhone = (partner.phone ?? "").replace(/^undefined/, "").trim();
    const phoneMatch = rawPhone.match(/^(\+\d{1,3})\s+(.*)/);
    const { platform: socialPlatform, username: socialUsername } = parseSocialMediaUrl(partner.individual_details?.social_media_url ?? "");
    const { username: linkedinUsername } = parseSocialMediaUrl(partner.individual_details?.linkedin_url ?? "");
    setFormData({
      name: partner.name || "",
      country: partner.country || "",
      email: partner.email || "",
      type: partner.type || "",
      phone_code: phoneMatch ? phoneMatch[1] : "+60",
      phone_number: phoneMatch ? phoneMatch[2] : rawPhone,
      manager_id: partner.assigned_manager_id || "",
      assigned_manager_name: partner.assigned_manager_name || "",
      is_active: partner.is_active,
      background: partner.individual_details?.background ?? "",
      linkedin_url: partner.individual_details?.linkedin_url ?? "",
      linkedin_platform: "linkedin",
      linkedin_username: linkedinUsername,
      social_media_url: partner.individual_details?.social_media_url ?? "",
      social_platform: socialPlatform,
      social_username: socialUsername,
      company_name: partner.company_details?.company_name ?? "",
      website_url: partner.company_details?.website_url ?? "",
      date_of_birth: (partner.individual_details?.date_of_birth ?? partner.company_details?.date_of_birth) ?? "",
      passport_number: (partner.individual_details?.passport_number ?? partner.company_details?.passport_number) ?? "",
    });
    if (partner.individual_details) {
      setIdDoc((p) => ({ ...p, file_key: partner.individual_details!.id_document_file_key ?? "", file_url: partner.individual_details!.id_document_file_url ?? "" }));
      setProfilePhoto((p) => ({ ...p, file_key: partner.individual_details!.profile_photo_file_key ?? "", file_url: partner.individual_details!.profile_photo_file_url ?? "" }));
      setPassportPhoto((p) => ({ ...p, file_key: partner.individual_details!.passport_photo_file_key ?? "", file_url: partner.individual_details!.passport_photo_file_url ?? "" }));
    }
    if (partner.company_details) {
      setCompanyRegDoc((p) => ({ ...p, file_key: partner.company_details!.company_registration_doc_file_key ?? "", file_url: partner.company_details!.company_registration_doc_file_url ?? "" }));
      setContactIdDoc((p) => ({ ...p, file_key: partner.company_details!.contact_id_document_file_key ?? "", file_url: partner.company_details!.contact_id_document_file_url ?? "" }));
      setLogo((p) => ({ ...p, file_key: partner.company_details!.logo_file_key ?? "", file_url: partner.company_details!.logo_file_url ?? "" }));
      setPassportPhoto((p) => ({ ...p, file_key: partner.company_details!.passport_photo_file_key ?? "", file_url: partner.company_details!.passport_photo_file_url ?? "" }));
    }
  }, [partner]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: "" }));

    if (field === "type") {
      if (value === "individual") {
        setIdDoc((p) => ({ ...p, file_key: partner?.individual_details?.id_document_file_key ?? "", file_url: partner?.individual_details?.id_document_file_url ?? "" }));
        setProfilePhoto((p) => ({ ...p, file_key: partner?.individual_details?.profile_photo_file_key ?? "", file_url: partner?.individual_details?.profile_photo_file_url ?? "" }));
        setPassportPhoto((p) => ({ ...p, file_key: partner?.individual_details?.passport_photo_file_key ?? "", file_url: partner?.individual_details?.passport_photo_file_url ?? "" }));
        const { platform: socialPlatform, username: socialUsername } = parseSocialMediaUrl(partner?.individual_details?.social_media_url ?? "");
        const { username: linkedinUsername } = parseSocialMediaUrl(partner?.individual_details?.linkedin_url ?? "");
        setFormData((prev: any) => ({
          ...prev,
          type: value,
          background: partner?.individual_details?.background ?? "",
          linkedin_url: partner?.individual_details?.linkedin_url ?? "",
          linkedin_platform: "linkedin",
          linkedin_username: linkedinUsername,
          social_media_url: partner?.individual_details?.social_media_url ?? "",
          social_platform: socialPlatform,
          social_username: socialUsername,
          date_of_birth: partner?.individual_details?.date_of_birth ?? "",
          passport_number: partner?.individual_details?.passport_number ?? "",
        }));
      } else if (value === "agency") {
        setCompanyRegDoc((p) => ({ ...p, file_key: partner?.company_details?.company_registration_doc_file_key ?? "", file_url: partner?.company_details?.company_registration_doc_file_url ?? "" }));
        setContactIdDoc((p) => ({ ...p, file_key: partner?.company_details?.contact_id_document_file_key ?? "", file_url: partner?.company_details?.contact_id_document_file_url ?? "" }));
        setLogo((p) => ({ ...p, file_key: partner?.company_details?.logo_file_key ?? "", file_url: partner?.company_details?.logo_file_url ?? "" }));
        setPassportPhoto((p) => ({ ...p, file_key: partner?.company_details?.passport_photo_file_key ?? "", file_url: partner?.company_details?.passport_photo_file_url ?? "" }));
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
    setDoc: React.Dispatch<React.SetStateAction<DocState>>,
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
      formData.email.trim() !== partner.email?.trim() ||
      formData.type !== partner.type ||
      (formData.manager_id || "") !== (partner.assigned_manager_id || "") ||
      `${formData.phone_code} ${formData.phone_number}`.trim() !== partner.phone?.trim() ||
      formData.is_active !== partner.is_active ||
      idDoc.file_key !== (partner.individual_details?.id_document_file_key ?? "") ||
      profilePhoto.file_key !== (partner.individual_details?.profile_photo_file_key ?? "") ||
      formData.background !== (partner.individual_details?.background ?? "") ||
      formData.linkedin_url !== (partner.individual_details?.linkedin_url ?? "") ||
      formData.social_media_url !== (partner.individual_details?.social_media_url ?? "") ||
      formData.company_name !== (partner.company_details?.company_name ?? "") ||
      formData.website_url !== (partner.company_details?.website_url ?? "") ||
      companyRegDoc.file_key !== (partner.company_details?.company_registration_doc_file_key ?? "") ||
      contactIdDoc.file_key !== (partner.company_details?.contact_id_document_file_key ?? "") ||
      logo.file_key !== (partner.company_details?.logo_file_key ?? "") ||
      passportPhoto.file_key !== ((partner.individual_details?.passport_photo_file_key ?? partner.company_details?.passport_photo_file_key) ?? "") ||
      formData.date_of_birth !== ((partner.individual_details?.date_of_birth ?? partner.company_details?.date_of_birth) ?? "") ||
      formData.passport_number !== ((partner.individual_details?.passport_number ?? partner.company_details?.passport_number) ?? "")
    );
  };

  const isValidUrl = (val: string) => {
    try {
      const url = new URL(val);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch { return false; }
  };

  const isLinkedInUrl = (val: string) => {
    try {
      const url = new URL(val);
      return (url.protocol === "https:" || url.protocol === "http:") && url.hostname.includes("linkedin.com");
    } catch { return false; }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.trim().length < 3) newErrors.name = "Name must be at least 3 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Enter a valid email address";

    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.type) newErrors.type = "Partner type is required";

    if (!formData.phone_number.trim()) newErrors.phone_number = "Phone number is required";
    else if (formData.phone_number.trim().length < 5) newErrors.phone_number = "Enter a valid phone number";

    if (formData.type === "individual") {
      if (formData.linkedin_url && !isLinkedInUrl(formData.linkedin_url))
        newErrors.linkedin_url = "Enter a valid LinkedIn URL (e.g. https://linkedin.com/in/yourname)";
      if (formData.social_platform || formData.social_username) {
        const socialError = validateSocialMediaField(formData, { platformField: "social_platform", usernameField: "social_username" });
        if (socialError) newErrors.social_media_url = socialError;
      }
    }

    if (formData.type === "agency") {
      if (!formData.company_name.trim()) newErrors.company_name = "Company name is required";
      else if (formData.company_name.trim().length < 3) newErrors.company_name = "Company name must be at least 3 characters";
      if (formData.website_url && !isValidUrl(formData.website_url))
        newErrors.website_url = "Enter a valid URL starting with https://";
    }

    return newErrors;
  };

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.country.trim() !== "" &&
    formData.type.trim() !== "" &&
    formData.phone_number.trim() !== "" &&
    true;

  const handleUpdate = async () => {
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const isIndividual = formData.type === "individual";
    const isCompany = formData.type === "agency";

    try {
      await updatePartner(id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        type: formData.type,
        country: formData.country,
        phone: `${formData.phone_code || "+60"} ${formData.phone_number}`,
        is_active: formData.is_active,
        assigned_manager_id: formData.manager_id,
        ...(isIndividual
          ? {
              individual_details: {
                background: formData.background,
                linkedin_url: formData.linkedin_url,
                social_media_url: formData.social_media_url,
                ...(formData.date_of_birth ? { date_of_birth: formData.date_of_birth } : {}),
                ...(formData.passport_number ? { passport_number: formData.passport_number } : {}),
                ...(idDoc.file_key
                  ? { id_document_file_key: idDoc.file_key, id_document_file_url: idDoc.file_url }
                  : {}),
                ...(profilePhoto.file_key
                  ? { profile_photo_file_key: profilePhoto.file_key, profile_photo_file_url: profilePhoto.file_url }
                  : {}),
                ...(passportPhoto.file_key
                  ? { passport_photo_file_key: passportPhoto.file_key, passport_photo_file_url: passportPhoto.file_url }
                  : {}),
              },
            }
          : isCompany
          ? {
              company_details: {
                ...(formData.date_of_birth ? { date_of_birth: formData.date_of_birth } : {}),
                ...(formData.passport_number ? { passport_number: formData.passport_number } : {}),
                ...(formData.company_name ? { company_name: formData.company_name } : {}),
                ...(formData.website_url ? { website_url: formData.website_url } : {}),
                ...(companyRegDoc.file_key
                  ? { company_registration_doc_file_key: companyRegDoc.file_key, company_registration_doc_file_url: companyRegDoc.file_url }
                  : {}),
                ...(contactIdDoc.file_key
                  ? { contact_id_document_file_key: contactIdDoc.file_key, contact_id_document_file_url: contactIdDoc.file_url }
                  : {}),
                ...(logo.file_key
                  ? { logo_file_key: logo.file_key, logo_file_url: logo.file_url }
                  : {}),
                ...(passportPhoto.file_key
                  ? { passport_photo_file_key: passportPhoto.file_key, passport_photo_file_url: passportPhoto.file_url }
                  : {}),
              },
            }
          : {}),
      });
      if (formData.manager_id) {
        await assignManager(id, { manager_id: formData.manager_id });
      }
      showToast("Partner updated successfully", "success");
      router.push(`/admin/partners/${id}`);
    } catch (error: unknown) {
      showToast(parseApiError(error, "Update failed. Please try again."), "error");
    }
  };

  if (isPartnerLoading || assignLoading) return <Loading text="Loading partner details..." />;
  if (!partner || assignError) return <EmptyData />;

  const isIndividual = formData.type === "individual";
  const isCompany = formData.type === "agency";

  const saveDisabledReason = isUpdatingPartner
    ? "Saving..."
    : isUploading
    ? "Please wait for the upload to finish"
    : !isFormValid
    ? "Fill in all required fields before saving"
    : !isFormChanged()
    ? "No changes to save"
    : undefined;

  return (
    <div className="mt-6 max-w-5xl mx-auto">
      <div className="rounded-lg border border-slate-200 bg-white">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-4">
            {PROFILE_PHOTO_UPLOAD_ENABLED ? (
              <AvatarUpload
                doc={isIndividual ? profilePhoto : logo}
                name={partner.name}
                isActive={partner.is_active}
                onUpload={(f) => handleUpload(f, isIndividual ? setProfilePhoto : setLogo)}
              />
            ) : (
              <div className="relative flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                  <PresignedImage
                    fileKey={isIndividual ? profilePhoto.file_key : logo.file_key}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    fallback={partner.name ? partner.name.slice(0, 2).toUpperCase() : "NA"}
                  />
                </div>
                <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${partner.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{partner.name}</h2>
              <p className="text-sm text-slate-500">{partner.email}</p>
            </div>
          </div>
        </div>

        {/* Partner Details */}
        <div className="border-b border-slate-200 p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Partner Details</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField label="Partner Name" field="name" required formData={formData} errors={errors} updateFormData={updateFormData} />
            <InputField label="Email Address" field="email" type="email" required formData={formData} errors={errors} updateFormData={updateFormData} />
            <SearchableDropdown label="Country" field="country" options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))} formData={formData} errors={errors} updateFormData={updateFormData} />
            <SelectField label="Partner Type" field="type" options={PARTNER_TYPE.map((p) => ({ value: p.value, label: p.label }))} formData={formData} errors={errors} updateFormData={updateFormData} />
            <PhoneInputField dialCodeField="phone_code" numberField="phone_number" formData={formData} errors={errors} updateFormData={updateFormData} required />
            <SelectField label="Assigned Manager" field="manager_id" required={false} options={accountManagers.map((m) => ({ label: m.name, value: m.id }))} formData={formData} errors={errors} updateFormData={updateFormData} />
          </div>
        </div>

        {/* Account Settings */}
        <div className="border-b border-slate-200 p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Account Settings</p>
          <ToggleInput label="Account Active" field="is_active" formData={formData} errors={{}} updateFormData={updateFormData} />
        </div>

        {/* Individual Details */}
        {isIndividual && (
          <div className="border-b border-slate-200 p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Individual Details</p>
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
            <DocUploadField
              label="Identity Document"
              doc={idDoc}
              fieldId="id-doc"
              onUpload={(f) => handleUpload(f, setIdDoc)}
            />
            <DocUploadField
              label="Passport Photo"
              doc={passportPhoto}
              fieldId="passport-photo"
              onUpload={(f) => handleUpload(f, setPassportPhoto)}
            />
          </div>
        )}

        {/* Company Details */}
        {isCompany && (
          <div className="border-b border-slate-200 p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Company Details</p>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Company Name"
                field="company_name"
                required={false}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
              <InputField
                label="Website URL"
                field="website_url"
                required={false}
                placeholder="https://..."
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
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
            <DocUploadField
              label="Company Registration Document"
              doc={companyRegDoc}
              fieldId="company-reg-doc"
              onUpload={(f) => handleUpload(f, setCompanyRegDoc)}
            />
            <DocUploadField
              label="Contact Identity Document"
              doc={contactIdDoc}
              fieldId="contact-id-doc"
              onUpload={(f) => handleUpload(f, setContactIdDoc)}
            />
            <DocUploadField
              label="Passport Photo"
              doc={passportPhoto}
              fieldId="comp-passport-photo"
              onUpload={(f) => handleUpload(f, setPassportPhoto)}
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-5">
          <Button
            onClick={() => router.push(`/admin/partners/${id}`)}
            icon={<ChevronLeft className="h-4 w-4" />}
            text="Back"
            bgColor="bg-white"
            textColor="text-slate-700"
            borderColor="border-slate-200"
            hoverTextColor="hover:text-slate-900"
            hoverBorderColor="hover:border-slate-300"
          />
          <Button
            icon={<Pencil className="h-4 w-4" />}
            text={isUpdatingPartner ? "Saving..." : "Save Changes"}
            bgColor="bg-blue-600"
            textColor="text-white"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-white"
            hoverBorderColor="hover:border-blue-700"
            className="hover:bg-blue-700"
            onClick={handleUpdate}
            disabled={isUpdatingPartner || isUploading || !isFormChanged() || !isFormValid}
            title={saveDisabledReason}
          />
        </div>
      </div>
    </div>
  );
}
