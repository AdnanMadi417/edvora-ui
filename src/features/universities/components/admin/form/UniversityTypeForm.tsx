"use client";

import React, { useState } from "react";
import { ArrowRight, Check, Layers, SlidersHorizontal } from "lucide-react";
import {
  useApplicationSubmissionFields,
  useCreateUniversityType,
} from "features/universities/hooks";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import FormPage from "components/ub/forms/layout/FormPage";
import InputField from "components/ub/forms/text/InputField";
import TextareaField from "components/ub/forms/text/TextareaField";
import RequirementSelector from "components/ub/forms/choices/RequirementSelector";
import Alert from "components/ub/feedback/notifications/Alert";
import Skeleton from "components/ub/feedback/states/Skeleton";
import Button from "components/ub/core/buttons/Button";
import Tag from "components/ub/data/badges/Tag";
import { useRouter } from "next/navigation";

interface Props {
  basePath?: string;
}

export default function UniversityTypeForm({
  basePath = "/admin/config-universities",
}: Props = {}) {
  const { createUniversityType, loading } = useCreateUniversityType();
  const { showToast } = useToast();
  const {
    submissionFields,
    loading: fieldsLoading,
    error: fieldsError,
    refetch: refetchFields,
  } = useApplicationSubmissionFields();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    required_fields_map: {} as Record<string, boolean>,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleApiError = useApiFormErrors({
    setErrors: (patch) => {
      setErrors((prev) => ({ ...prev, ...patch }));
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) =>
      showToast(`Failed to create university type. ${message}`, "error"),
  });

  const validateName = (value: string): string => {
    if (!value.trim()) return "Name is required";
    if (value.trim().length < 3) return "Name must be at least 3 characters";
    if (value.trim().length > 100) return "Name must not exceed 100 characters";
    return "";
  };

  const validateDescription = (value: string): string => {
    if (!value.trim()) return "Description is required";
    if (value.trim().length < 10)
      return "Description must be at least 10 characters";
    return "";
  };

  const isFormValid =
    !validateName(formData.name) && !validateDescription(formData.description);

  const updateFormData = (field: string, value: any) => {
    if (field.startsWith("required_fields_map.")) {
      const fieldId = field.split(".")[1];

      setFormData((prev) => ({
        ...prev,
        required_fields_map: {
          ...prev.required_fields_map,
          [fieldId]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    const nameErr = validateName(formData.name);
    if (nameErr) newErrors.name = nameErr;
    const descErr = validateDescription(formData.description);
    if (descErr) newErrors.description = descErr;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      scrollToFirstError(newErrors);
      return;
    }

    try {
      const required_fields = Object.entries(formData.required_fields_map).map(
        ([id, is_required]) => ({
          application_submission_field_id: id,
          is_required: Boolean(is_required),
        })
      );

      await createUniversityType({
        name: formData.name.trim(),
        description: formData.description.trim(),
        required_fields,
      });

      showToast("University type created successfully.", "success");

      router.push(basePath);
    } catch (error: unknown) {
      handleApiError(error, "Please try again.");
    }
  };

  const handleBack = () => {
    router.push(basePath);
  };

  const requiredFields = submissionFields.filter(
    (field) => formData.required_fields_map[field.id]
  );
  const optionalCount = submissionFields.length - requiredFields.length;

  return (
    <FormPage
      title="Create university type"
      description="Define an institution category and the information advisors need to submit an application."
      icon={Layers}
      onSubmit={handleCreate}
      onCancel={handleBack}
      submitLabel="Create type"
      submitting={loading}
      submitDisabled={!isFormValid || fieldsLoading || !!fieldsError}
    >
      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_17rem] 2xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="type-details-title">
            <div className="mb-5 flex items-start gap-3">
              <span
                className="ub-tabular grid h-7 w-7 shrink-0 place-items-center rounded-ub-full bg-ub-tone-brand-bg text-ub-label-sm text-ub-tone-brand-text"
                aria-hidden="true"
              >
                1
              </span>
              <div>
                <h2
                  id="type-details-title"
                  className="text-ub-heading-sm text-ub-text-primary"
                >
                  Type details
                </h2>
                <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
                  Give this category a clear name and explain when it should be
                  used.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <InputField
                label="Category type"
                field="name"
                placeholder="e.g. Standard application"
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                hint="Use 3–100 characters."
                onBlur={() => {
                  const error = validateName(formData.name);
                  setErrors((prev) => ({ ...prev, name: error }));
                }}
              />
              <TextareaField
                label="Description"
                field="description"
                placeholder="Explain which institutions use this category and what makes their application requirements different."
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                hint="At least 10 characters. This helps your team choose the right type."
                onBlur={() => {
                  const error = validateDescription(formData.description);
                  setErrors((prev) => ({ ...prev, description: error }));
                }}
              />
            </div>
          </section>

          <section
            aria-labelledby="requirements-title"
            className="border-t border-ub-border pt-7"
          >
            <div className="mb-5 flex items-start gap-3">
              <span
                className="ub-tabular grid h-7 w-7 shrink-0 place-items-center rounded-ub-full bg-ub-tone-brand-bg text-ub-label-sm text-ub-tone-brand-text"
                aria-hidden="true"
              >
                2
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="requirements-title"
                    className="text-ub-heading-sm text-ub-text-primary"
                  >
                    Application requirements
                  </h2>
                  {!fieldsLoading && !fieldsError && (
                    <Tag tone="neutral" size="sm">
                      {requiredFields.length} required
                    </Tag>
                  )}
                </div>
                <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
                  Choose which fields must be completed. Fields left off stay
                  optional.
                </p>
              </div>
            </div>
            {fieldsLoading ? (
              <div
                role="status"
                aria-label="Loading application fields"
                className="grid gap-3 sm:grid-cols-2"
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-24 rounded-ub-md" />
                ))}
              </div>
            ) : fieldsError ? (
              <Alert tone="danger" title="Application fields couldn't load">
                <p>{fieldsError}</p>
                {refetchFields && (
                  <div className="mt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      text="Try again"
                      onClick={() => {
                        void refetchFields();
                      }}
                    />
                  </div>
                )}
              </Alert>
            ) : submissionFields.length ? (
              <RequirementSelector
                fields={submissionFields.map((field) => ({
                  id: field.id,
                  label: field.field_name,
                }))}
                value={formData.required_fields_map}
                onChange={(id, required) =>
                  updateFormData(`required_fields_map.${id}`, required)
                }
                errors={Object.fromEntries(
                  Object.entries(errors)
                    .filter(([key]) => key.startsWith("required_fields_map."))
                    .map(([key, message]) => [
                      key.slice("required_fields_map.".length),
                      message,
                    ])
                )}
                disabled={loading}
              />
            ) : (
              <Alert tone="info" title="No submission fields available">
                You can create this type without additional field requirements.
              </Alert>
            )}
          </section>
        </div>

        <aside
          aria-labelledby="type-summary-title"
          className="space-y-5 rounded-ub-lg border border-ub-border bg-ub-surface-subtle p-5 xl:sticky xl:top-24"
        >
          <div className="flex items-center gap-2 text-ub-text-secondary">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            <h2 id="type-summary-title" className="text-ub-label-md">
              At a glance
            </h2>
          </div>
          <div>
            <p className="break-words text-ub-heading-sm text-ub-text-primary">
              {formData.name.trim() || "Your university type"}
            </p>
            <p className="mt-2 line-clamp-4 whitespace-pre-wrap break-words text-ub-body-sm text-ub-text-secondary">
              {formData.description.trim() ||
                "Add a description to give your team context."}
            </p>
          </div>
          <div
            className="grid grid-cols-2 gap-3 border-y border-ub-border py-4"
            aria-live="polite"
          >
            <div>
              <p className="ub-tabular text-ub-heading-lg text-ub-text-primary">
                {fieldsLoading || fieldsError ? "—" : requiredFields.length}
              </p>
              <p className="text-ub-caption text-ub-text-secondary">
                Required fields
              </p>
            </div>
            <div>
              <p className="ub-tabular text-ub-heading-lg text-ub-text-primary">
                {fieldsLoading || fieldsError ? "—" : optionalCount}
              </p>
              <p className="text-ub-caption text-ub-text-secondary">
                Optional fields
              </p>
            </div>
          </div>
          {requiredFields.length > 0 && (
            <div>
              <h3 className="mb-3 text-ub-label-sm text-ub-text-secondary">
                Required at submission
              </h3>
              <ul className="space-y-2">
                {requiredFields.map((field) => (
                  <li
                    key={field.id}
                    className="flex items-start gap-2 text-ub-body-sm text-ub-text-primary"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-ub-text-link"
                      aria-hidden="true"
                    />
                    <span>{field.field_name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="flex items-start gap-2 text-ub-body-sm text-ub-text-secondary">
            <ArrowRight
              className="mt-0.5 h-4 w-4 shrink-0 text-ub-icon-default"
              aria-hidden="true"
            />
            <span>
              Institutions assigned to this type use these application
              requirements.
            </span>
          </p>
        </aside>
      </div>
    </FormPage>
  );
}
