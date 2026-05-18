"use client";

import React, { useState } from "react";
import { GraduationCap, ChevronLeft, CalendarPlus, Trash2 } from 'lucide-react';

import { useToast } from "components/context/ToastContext";
import { useRouter } from "next/navigation";

import { useCreateUniversity, useUniversityTypes } from "features/universities/hooks";
import { useAllStates } from "hooks/knowledge-hub/programs/useStates";

import InputField from "components/form/InputField";
import MultipleDatePickerModal from "components/form/MultipleDatePickerModal";
import SearchableDropdown from 'components/form/search/SearchableDropdown';
import Button from "components/ui/buttons/Button";
import IconButton from 'components/ui/buttons/IconButton';
import SelectField from 'components/form/SelectField';
import ImageUploadField from 'components/form/images/ImageUploadField';
import { getPresignedUploads, uploadFilesToSpaces } from 'services/uploadService';


export default function RegisterUniversity() {
  const { createUniversity, loading } = useCreateUniversity();
  const { states } = useAllStates();
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

  const isFormValid =
    formData.name.trim() &&
    formData.branches.length > 0 &&
    formData.university_type_id.trim() &&
    formData.branches.every(
      (b) =>
        b.name.trim() &&
        b.location.trim() &&
        b.state_id
    );

  const stateOptions =
    states?.map((c) => ({
      value: String(c.id),
      label: c.name,
    })) || [];

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
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
      const code = error?.response?.data?.code;
      let message = "Please try again.";

      if (code === "university_name_exists") {
        message = "A university with this name already exists. Please use a different name.";
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
          />

          <InputField
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
                    errors={{}}
                    updateFormData={(field, value) =>
                      updateBranch(index, field, value)
                    }
                  />

                  <InputField
                    label="Location"
                    placeholder="e.g Location"
                    field="location"
                    formData={branch}
                    errors={{}}
                    updateFormData={(field, value) =>
                      updateBranch(index, field, value)
                    }
                  />

                  <SearchableDropdown
                    label="State"
                    field="state_id"
                    options={stateOptions}
                    formData={branch}
                    errors={{}}
                    updateFormData={(field, value) =>
                      updateBranch(index, field, value)
                    }
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
