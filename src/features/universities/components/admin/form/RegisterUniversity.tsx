"use client";

import React, { useState } from "react";
import { GraduationCap, ChevronLeft, CalendarPlus, Trash2 } from 'lucide-react';

const FIELD_LABELS: Record<string, string> = {
  name: "University Name",
  description: "Description",
  intake_months: "Intake Dates",
  country: "Country",
  university_type_id: "University Type",
  branches: "Branches",
};

import { useToast } from "components/context/ToastContext";
import { useRouter } from "next/navigation";

import { useCreateUniversity, useUniversityTypes } from "features/universities/hooks";
import { useStates } from "features/programs/hooks";

import InputField from "components/form/fields/InputField";
import TextareaField from "components/form/fields/TextareaField";
import MultipleDatePickerModal from "components/form/date/MultipleDatePickerModal";
import SearchableDropdown from 'components/form/search/SearchableDropdown';
import Button from "components/ui/buttons/Button";
import IconButton from 'components/ui/buttons/IconButton';
import SelectField from 'components/form/fields/SelectField';
import ImageUploadField from 'components/form/upload/ImageUploadField';
import { getPresignedUploads, uploadFilesToSpaces } from 'services/uploadService';
import { validateUniversity, isUniversityComplete } from './validateUniversity';


export default function RegisterUniversity() {
  const { createUniversity, loading } = useCreateUniversity();
  const { states } = useStates();
  const { universities } = useUniversityTypes();

  const { showToast } = useToast();
  const router = useRouter();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [logoFileKey, setLogoFileKey] = useState("");
  const [logoFileUrl, setLogoFileUrl] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    country: "Malaysia",
    is_active: true,
    university_type_id: "",
    description: "",
    intake_months: [] as string[],

    branches: [
      {
        name: "",
        location: "",
        state_id: "",
      }
    ]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFormValid = React.useMemo(() => isUniversityComplete(formData), [formData]);

  const validateField = React.useCallback(
    (field: string) => {
      const { errors: allErrors } = validateUniversity(formData);
      setErrors((prev) => ({ ...prev, [field]: allErrors[field] ?? "" }));
    },
    [formData]
  );

  const stateOptions =
    states?.map((c) => ({
      value: String(c.id),
      label: c.name,
    })) || [];

  const updateFormData = (field: string, value: any) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateBranch = (
    index: number,
    field: string,
    value: string
  ) => {
    setFormData(prev => {
      const updated = [...prev.branches];
      updated[index] = {
        ...updated[index],
        [field]: value
      };

      return {
        ...prev,
        branches: updated
      };
    });
  };

  const handleLogoSelect = async (file: File) => {
    setLogoFile(file);
    setLogoUploading(true);
    setLogoProgress(0);
    setLogoFileKey("");
    setLogoFileUrl("");

    try {
      const presigned = await getPresignedUploads([file], "university-logos");
      const results = await uploadFilesToSpaces([file], presigned, (_, pct) => {
        setLogoProgress(pct);
      });
      const uploaded = results?.[0];

      if (!uploaded?.file_key || !uploaded?.public_url) {
        showToast("Logo upload failed. Please try again.", "error");
        setLogoFile(null);
        return;
      }

      setLogoFileKey(uploaded.file_key);
      setLogoFileUrl(uploaded.public_url);
      setLogoProgress(100);
      showToast("Logo uploaded successfully.", "success");
    } catch (err: any) {
      showToast(err?.message || "Logo upload failed.", "error");
      setLogoFile(null);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleCreate = async () => {
    if (logoUploading) {
      showToast("Please wait for the logo to finish uploading.", "error");
      return;
    }

    const { isValid, errors: validationErrors } = validateUniversity(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      await createUniversity({
        ...formData,
        logo_file_key: logoFileKey,
        logo_file_url: logoFileUrl,
      });

      showToast("University created successfully.", "success");

      setTimeout(() => {
        router.push("/admin/universities");
      }, 2000);

    } catch (error: any) {
      const details = error?.response?.data?.details;
      const code = error?.response?.data?.code;

      if (Array.isArray(details)) {
        const newErrors: Record<string, string> = {};
        details.forEach((e: any) => {
          const field = e?.loc?.[1];
          if (field) newErrors[field] = e.msg;
        });
        setErrors(newErrors);
      }

      let message = "Please try again.";
      if (code === "university_name_exists") {
        message = "A university with this name already exists. Please use a different name.";
      } else if (Array.isArray(details) && details.length > 0) {
        const first = details[0];
        const field = first?.loc?.[1];
        const label = field ? (FIELD_LABELS[field] ?? field) : null;
        message = label ? `${label}: ${first.msg}` : first.msg;
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      }

      showToast(`Failed to create university. ${message}`, "error");
    }
  };

  const handleRemoveBranch = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      branches: prev.branches.filter((_, i) => i !== index),
    }));
  };

  const handleAddBranch = () => {
    setFormData((prev: any) => ({
      ...prev,
      branches: [
        ...prev.branches,
        {
          name: "",
          location: "",
          state_id: "",
        },
      ],
    }));
  };

  const handleBack = () => {
    router.push("/admin/universities");
  };

  return (
    <section className="mx-auto mt-5 max-w-5xl">
      <div className="mt-6 rounded-md border bg-white">
        <div className="flex justify-between border-b p-6">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <ImageUploadField
                label=""
                field="logo"
                imageOnly
                simpleFile={logoFile}
                onSimpleFileChange={handleLogoSelect}
                onSimpleRemove={() => { setLogoFile(null); setLogoFileKey(""); setLogoFileUrl(""); }}
                simpleUploading={logoUploading}
                simpleProgress={logoProgress}
                errors={errors}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Register a new university
              </h2>
              <p className="text-sm text-slate-500">
                Complete the required information to register a new knowledge
                hub university
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <InputField
            label="University Name"
            field="name"
            placeholder="e.g. Universiti Malaya"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            onBlur={() => validateField('name')}
          />

          <TextareaField
            label="Description"
            field="description"
            placeholder="Brief university description..."
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            required={false}
          />

          <MultipleDatePickerModal
            label="Intake Dates"
            field="intake_months"
            required={false}
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <SelectField
            label="University Type"
            field="university_type_id"
            required
            options={universities.map((type) => ({
              value: String(type.id),
              label: type.name,
            }))}
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            onBlur={() => validateField('university_type_id')}
          />

        </div>

        <div className="border-t px-6 py-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase text-slate-500">
              Branches
            </h3>

            <IconButton
              icon={<CalendarPlus className="h-4 w-4" />}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
              onClick={handleAddBranch}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {formData.branches.map((branch: any, index: number) => (
              <div
                key={branch.id || index}
                className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-semibold text-slate-700">
                    Branch {index + 1}
                  </h4>

                  <IconButton
                    icon={<Trash2 className="h-4 w-4" />}
                    disabled={formData.branches.length === 1}
                    bgColor="bg-red-50"
                    textColor="text-red-700"
                    borderColor="border-red-200"
                    hoverTextColor="hover:text-red-800"
                    hoverBorderColor="hover:border-red-300"
                    onClick={() => handleRemoveBranch(index)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                  <InputField
                    label="Branch Name"
                    placeholder="e.g Branch Name"
                    field="name"
                    formData={branch}
                    errors={{ name: errors[`branches[${index}].name`] }}
                    updateFormData={(field, value) => {
                      setErrors((prev) => { const n = { ...prev }; delete n[`branches[${index}].name`]; return n; });
                      updateBranch(index, field, value);
                    }}
                    onBlur={() => validateField(`branches[${index}].name`)}
                  />

                  <InputField
                    label="Location"
                    placeholder="e.g Location"
                    field="location"
                    formData={branch}
                    errors={{ location: errors[`branches[${index}].location`] }}
                    updateFormData={(field, value) => {
                      setErrors((prev) => { const n = { ...prev }; delete n[`branches[${index}].location`]; return n; });
                      updateBranch(index, field, value);
                    }}
                    onBlur={() => validateField(`branches[${index}].location`)}
                  />

                  <SearchableDropdown
                    label="State"
                    field="state_id"
                    options={stateOptions}
                    formData={branch}
                    errors={{ state_id: errors[`branches[${index}].state_id`] }}
                    updateFormData={(field, value) => {
                      setErrors((prev) => { const n = { ...prev }; delete n[`branches[${index}].state_id`]; return n; });
                      updateBranch(index, field, value);
                    }}
                  />

                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t p-6">
          <Button
            onClick={handleBack}
            disabled={loading || logoUploading}
            icon={<ChevronLeft className="h-5 w-5" />}
            text={"Back"}
            bgColor="bg-slate-50"
            textColor="text-slate-700"
            borderColor="border-slate-600"
            hoverTextColor="hover:text-slate-800"
            hoverBorderColor="hover:border-slate-700"
          />

          <Button
            onClick={handleCreate}
            disabled={loading || logoUploading || !isFormValid}
            icon={<GraduationCap className="h-5 w-5" />}
            text={loading ? "Creating..." : "Create University"}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
          />
        </div>
      </div>
    </section>
  );
}
