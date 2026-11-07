"use client";

import InstitutionTypeField from "components/ub/forms/choices/InstitutionTypeField";
import React, { useState } from "react";
import { GraduationCap, CalendarPlus, Trash2 } from "lucide-react";

import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import { useRouter } from "next/navigation";

import {
  useCreateUniversity,
  useUniversityTypes,
} from "features/universities/hooks";
import { useStates } from "features/programs/hooks";

import InputField from "components/ub/forms/text/InputField";
import TextareaField from "components/ub/forms/text/TextareaField";
import IntakeMonthsField from "features/programs/components/shared/form/IntakeMonthsField";
import SearchableDropdown from "components/ub/forms/selection/SearchableDropdown";
import SteppedFormPage from "components/ub/forms/layout/SteppedFormPage";
import DescriptionList from "components/ub/data/display/DescriptionList";
import Alert from "components/ub/feedback/notifications/Alert";
import IconButton from "components/ub/core/buttons/IconButton";
import SelectField from "components/ub/forms/selection/SelectField";
import ToggleInput from "components/ub/forms/choices/ToggleInput";
import ImageUpload from "components/ub/forms/uploads/ImageUpload";
import {
  getPresignedUploads,
  uploadFilesToSpaces,
} from "services/uploadService";
import { validateUniversity, universityFieldMap } from "./validateUniversity";

interface Props {
  basePath?: string;
}

export default function RegisterUniversity({
  basePath = "/admin/universities",
}: Props = {}) {
  const { createUniversity, loading } = useCreateUniversity();
  const { states } = useStates();
  const { universities } = useUniversityTypes();

  const { showToast } = useToast();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);

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
    intake_months: [] as number[],
    is_public: false,
    has_language_center: false,
    is_hidden: false,

    branches: [
      {
        name: "",
        location: "",
        state_id: "",
      },
    ],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleApiError = useApiFormErrors({
    fieldMap: universityFieldMap,
    setErrors: (patch) => {
      setErrors((prev) => ({ ...prev, ...patch }));
      setCurrentStep(
        Object.keys(patch).some((key) => key.startsWith("branches")) ? 2 : 0
      );
      requestAnimationFrame(() => scrollToFirstError(patch));
    },
    onUnmappedError: (message) =>
      showToast(`Failed to create university. ${message}`, "error"),
  });

  const validateStep = (branchStep: boolean) => {
    const stepErrors = Object.fromEntries(
      Object.entries(validateUniversity(formData).errors).filter(
        ([key]) => key.startsWith("branches") === branchStep
      )
    );
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

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

  const updateBranch = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.branches];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        branches: updated,
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
    } catch (err: unknown) {
      showToast(parseApiError(err, "Logo upload failed."), "error");
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
      scrollToFirstError(validationErrors);
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
        router.push(basePath);
      }, 2000);
    } catch (error: unknown) {
      const code = (error as { response?: { data?: { code?: string } } })
        ?.response?.data?.code;
      if (code === "university_name_exists") {
        const msg = parseApiError(
          error,
          "A university with this name already exists. Please use a different name."
        );
        setErrors((prev) => ({ ...prev, name: msg }));
        setCurrentStep(0);
        requestAnimationFrame(() => scrollToFirstError({ name: msg }));
        return;
      }
      handleApiError(error, "Please try again.");
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
    router.push(basePath);
  };

  return (
    <SteppedFormPage
      title="Create university"
      description="Build the institution profile, set its availability, then add its campuses."
      className="mx-auto max-w-5xl"
      icon={GraduationCap}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onSubmit={handleCreate}
      onCancel={handleBack}
      submitLabel="Create university"
      submitting={loading}
      navigationDisabled={logoUploading}
      steps={[
        {
          id: "profile",
          label: "Institution",
          description: "Name, category and profile",
          validate: () => validateStep(false),
          content: (
            <div className="space-y-4">
              <ImageUpload
                label="University logo"
                id="logo"
                file={logoFile}
                onFileChange={handleLogoSelect}
                onRemove={() => {
                  setLogoFile(null);
                  setLogoFileKey("");
                  setLogoFileUrl("");
                }}
                uploading={logoUploading}
                progress={logoProgress}
                error={errors.logo}
              />{" "}
              <InputField
                label="University Name"
                field="name"
                placeholder="e.g. Universiti Malaya"
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                onBlur={() => validateField("name")}
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
                onBlur={() => validateField("university_type_id")}
              />
            </div>
          ),
        },
        {
          id: "settings",
          label: "Availability",
          description: "Intakes and visibility",
          content: (
            <div className="space-y-4">
              <IntakeMonthsField
                field="intake_months"
                label="Intake Months"
                required={false}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InstitutionTypeField value={formData.is_public} onChange={(value) => updateFormData("is_public", value)} />

              <ToggleInput
                label="Language Center"
                field="has_language_center"
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
                enabledText="Yes"
                disabledText="No"
                enabledDescription="This university has a language center."
                disabledDescription="This university does not have a language center."
              />

              <ToggleInput
                label="Visibility"
                field="is_hidden"
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
                enabledText="Hidden"
                disabledText="Visible"
                enabledDescription="Hidden from advisors — only visible to data-entry and admin."
                disabledDescription="Visible to advisors."
              />
            </div>
          ),
        },
        {
          id: "branches",
          label: "Branches",
          description: "Campuses and locations",
          validate: () => validateStep(true),
          content: (
            <div className="space-y-4" data-field="branches">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-ub-label-md text-ub-text-primary">
                  Branches
                </h3>

                <IconButton
                  title="Add branch"
                  icon={<CalendarPlus className="h-4 w-4" />}
                  bgColor="bg-blue-50"
                  textColor="text-blue-700"
                  borderColor="border-blue-600"
                  hoverTextColor="hover:text-blue-800"
                  hoverBorderColor="hover:border-blue-700"
                  onClick={handleAddBranch}
                />
              </div>

              {errors.branches && (
                <p className="mb-3 text-ub-body-sm text-ub-tone-danger-text">
                  {errors.branches}
                </p>
              )}

              <div className="grid grid-cols-1 gap-4">
                {formData.branches.map((branch: any, index: number) => (
                  <div
                    key={branch.id || index}
                    className="space-y-4 rounded-ub-lg border border-ub-border bg-ub-surface p-4"
                  >
                    <div className="flex items-center justify-between border-b border-ub-border pb-3">
                      <h4 className="text-ub-label-md text-ub-text-primary">
                        Branch {index + 1}
                      </h4>

                      <IconButton
                        title={`Remove branch ${index + 1}`}
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
                        dataField={`branches[${index}].name`}
                        formData={branch}
                        errors={{ name: errors[`branches[${index}].name`] }}
                        updateFormData={(field, value) => {
                          setErrors((prev) => {
                            const n = { ...prev };
                            delete n[`branches[${index}].name`];
                            return n;
                          });
                          updateBranch(index, field, value);
                        }}
                        onBlur={() => validateField(`branches[${index}].name`)}
                      />

                      <InputField
                        label="Location"
                        placeholder="e.g Location"
                        field="location"
                        dataField={`branches[${index}].location`}
                        formData={branch}
                        errors={{
                          location: errors[`branches[${index}].location`],
                        }}
                        updateFormData={(field, value) => {
                          setErrors((prev) => {
                            const n = { ...prev };
                            delete n[`branches[${index}].location`];
                            return n;
                          });
                          updateBranch(index, field, value);
                        }}
                        onBlur={() =>
                          validateField(`branches[${index}].location`)
                        }
                      />

                      <SearchableDropdown
                        label="State"
                        field="state_id"
                        dataField={`branches[${index}].state_id`}
                        options={stateOptions}
                        formData={branch}
                        errors={{
                          state_id: errors[`branches[${index}].state_id`],
                        }}
                        updateFormData={(field, value) => {
                          setErrors((prev) => {
                            const n = { ...prev };
                            delete n[`branches[${index}].state_id`];
                            return n;
                          });
                          updateBranch(index, field, value);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
        },
      ]}
      review={
        <div className="space-y-6">
          <Alert tone="info" title="Ready to create">
            Check the institution and branch details. Use Back or a completed
            step to make changes.
          </Alert>
          <DescriptionList
            columns={2}
            fallback="Not provided"
            items={[
              { label: "University", value: formData.name },
              {
                label: "University type",
                value: universities.find(
                  (type) => String(type.id) === formData.university_type_id
                )?.name,
              },
              {
                label: "Description",
                value: formData.description,
                fullWidth: true,
              },
              {
                label: "Institution type",
                value: formData.is_public ? "Public" : "Private",
              },
              {
                label: "Language center",
                value: formData.has_language_center ? "Yes" : "No",
              },
              {
                label: "Visibility",
                value: formData.is_hidden
                  ? "Hidden from advisors"
                  : "Visible to advisors",
              },
              {
                label: "Intake months",
                value:
                  formData.intake_months
                    .map((month) =>
                      new Date(2026, month - 1, 1).toLocaleString("en", {
                        month: "long",
                      })
                    )
                    .join(", ") || "Not set",
              },
              {
                label: "Logo",
                value: logoFileKey ? "Uploaded" : "Not uploaded",
              },
            ]}
          />
          {formData.branches.map((branch, index) => (
            <DescriptionList
              key={index}
              columns={2}
              items={[
                { label: `Branch ${index + 1}`, value: branch.name },
                { label: "Location", value: branch.location },
                {
                  label: "State",
                  value: states.find(
                    (state) => String(state.id) === branch.state_id
                  )?.name,
                },
              ]}
            />
          ))}
        </div>
      }
    />
  );
}
