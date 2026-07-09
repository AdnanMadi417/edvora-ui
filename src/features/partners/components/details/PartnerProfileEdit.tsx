"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ExternalLink, FileText, Save, Upload } from "lucide-react";
import { usePartnerProfile, useUpdatePartnerProfile } from "features/partners";
import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";
import InputField from "components/form/fields/InputField";
import SelectField from "components/form/fields/SelectField";
import PhoneInputField from "components/form/fields/PhoneInputField";
import { useToast } from "components/context/ToastContext";
import { getPresignedUploads, uploadFilesToSpaces, ALLOWED_FILE_TYPES } from "services/uploadService";
import { getDocumentDownloadUrl } from "services/documentService";
import { COUNTRIES, BACKGROUND_OPTIONS } from "constants/lists";

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.name, label: c.name }));

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
            <button
              type="button"
              onClick={handleView}
              disabled={downloading}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent bg-green-50 text-green-600 transition hover:border-green-200 hover:bg-green-100 disabled:opacity-50"
              title="View document"
            >
              <ExternalLink className={`h-4 w-4 ${downloading ? "animate-pulse" : ""}`} />
            </button>
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
  });

  const [idDoc, setIdDoc] = useState<DocState>({ file_key: "", file_url: "", uploading: false, progress: 0, error: "" });
  const [companyRegDoc, setCompanyRegDoc] = useState<DocState>({ file_key: "", file_url: "", uploading: false, progress: 0, error: "" });
  const [contactIdDoc, setContactIdDoc] = useState<DocState>({ file_key: "", file_url: "", uploading: false, progress: 0, error: "" });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    });
    if (partner.individual_details) {
      setIdDoc((p) => ({ ...p, file_key: partner.individual_details!.id_document_file_key ?? "", file_url: partner.individual_details!.id_document_file_url ?? "" }));
    }
    if (partner.company_details) {
      setCompanyRegDoc((p) => ({ ...p, file_key: partner.company_details!.company_registration_doc_file_key ?? "", file_url: partner.company_details!.company_registration_doc_file_url ?? "" }));
      setContactIdDoc((p) => ({ ...p, file_key: partner.company_details!.contact_id_document_file_key ?? "", file_url: partner.company_details!.contact_id_document_file_url ?? "" }));
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

  const isUploading = idDoc.uploading || companyRegDoc.uploading || contactIdDoc.uploading;

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

  const validate = () => {
    const e: Record<string, string> = {};
    const type = partner?.type;

    if (!formData.name.trim()) e.name = "Name is required";
    else if (formData.name.trim().length < 3) e.name = "Name must be at least 3 characters";

    if (!formData.country) e.country = "Country is required";

    if (!formData.phone_number.trim()) e.phone_number = "Phone number is required";
    else if (formData.phone_number.trim().length < 5) e.phone_number = "Enter a valid phone number";

    if (type === "individual") {
      if (formData.linkedin_url && !isLinkedInUrl(formData.linkedin_url))
        e.linkedin_url = "Enter a valid LinkedIn URL (e.g. https://linkedin.com/in/yourname)";
      if (formData.social_media_url && !isValidUrl(formData.social_media_url))
        e.social_media_url = "Enter a valid URL starting with https://";
    }

    if (type === "agency") {
      if (!formData.company_name.trim()) e.company_name = "Company name is required";
      else if (formData.company_name.trim().length < 3) e.company_name = "Company name must be at least 3 characters";
      if (formData.website_url && !isValidUrl(formData.website_url))
        e.website_url = "Enter a valid URL starting with https://";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate() || !partner) return;
    try {
      const payload: any = {
        name: formData.name.trim(),
        type: partner.type,
        country: formData.country,
        phone: `${formData.phone_code || "+60"} ${formData.phone_number}`,
      };
      if (partner.type === "individual") {
        payload.individual_details = {
          id_document_file_key: idDoc.file_key,
          id_document_file_url: idDoc.file_url,
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
        };
      }
      await updateProfile(payload);
      showToast("Profile updated successfully", "success");
      router.push("/partner/profile");
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? "Please try again.";
      showToast(typeof msg === "string" ? msg : "Update failed.", "error");
    }
  };

  if (isPartnerLoading) return <Loading text="Loading profile..." />;
  if (partnerError || !partner) return <EmptyData />;

  const isIndividual = partner.type === "individual";
  const isCompany = partner.type === "agency";

  return (
    <div className="mx-auto mt-6 max-w-5xl">
      <div className="rounded-lg border border-slate-200 bg-white">

        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-200 px-6 py-5">
          <div className="relative shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
              {partner.name?.slice(0, 2).toUpperCase() || "NA"}
            </div>
            <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${partner.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{partner.name}</h2>
            <p className="text-sm text-slate-500">{isIndividual ? "Individual Advisor" : "Agency / Company"}</p>
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
            />
            <SelectField
              label="Country"
              field="country"
              options={COUNTRY_OPTIONS}
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
              <InputField
                label="LinkedIn URL"
                field="linkedin_url"
                required={false}
                placeholder="https://linkedin.com/in/..."
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
              <InputField
                label="Social Media URL"
                field="social_media_url"
                required={false}
                placeholder="https://..."
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            </div>
            <DocUploadField
              label="Identity Document"
              doc={idDoc}
              fieldId="id-doc"
              onUpload={(f) => handleUpload(f, setIdDoc, "id_document")}
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
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-5">
          <button
            type="button"
            onClick={() => router.push("/partner/profile")}
            disabled={isUpdating}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating || isUploading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isUpdating ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
