"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  useUniversityTypeDetails,
  useUpdateUniversityType,
} from "features/universities/configuration/hooks";
import UniversityTypeEditor, {
  type UniversityTypeEditorData,
} from "features/universities/configuration/components/shared/UniversityTypeEditor";
import Loading from "components/ub/feedback/states/Loading";
import EmptyData from "components/ub/feedback/states/EmptyData";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";

interface Props {
  id: string;
  redirectPath?: string;
  listPath?: string;
}
const validateName = (value: string) =>
  !value.trim()
    ? "Name is required"
    : value.trim().length < 3
    ? "Name must be at least 3 characters"
    : value.trim().length > 100
    ? "Name must not exceed 100 characters"
    : "";
const validateDescription = (value: string) =>
  !value.trim()
    ? "Description is required"
    : value.trim().length < 10
    ? "Description must be at least 10 characters"
    : "";

export default function EditUniversityForm({
  id,
  redirectPath = `/admin/config-universities/${id}`,
  listPath = "/admin/config-universities",
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    university,
    loading: detailsLoading,
    error,
  } = useUniversityTypeDetails(id);
  const { updateUniversityType, loading } = useUpdateUniversityType(id);
  const [formData, setFormData] = useState<UniversityTypeEditorData>({
    name: "",
    description: "",
    required_fields_map: {},
  });
  const [initial, setInitial] = useState<UniversityTypeEditorData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const handleApiError = useApiFormErrors({
    fieldMap: (field, loc) => {
      const index = loc.indexOf("required_fields");
      if (index >= 0) {
        const rule = university?.required_fields[Number(loc[index + 1])];
        if (rule) return `required_fields_map.${rule.id}`;
      }
      return field;
    },
    setErrors: (patch) => {
      setErrors((previous) => ({ ...previous, ...patch }));
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) =>
      showToast(`Update failed. ${message}`, "error"),
  });
  useEffect(() => {
    if (!university) return;
    const data = {
      name: university.name || "",
      description: university.description || "",
      required_fields_map: Object.fromEntries(
        university.required_fields.map((field) => [
          field.id,
          !!field.is_required,
        ])
      ),
    };
    setFormData(data);
    setInitial(data);
  }, [university]);
  const update = (field: string, value: any) => {
    setErrors((previous) => ({ ...previous, [field]: "" }));
    if (field.startsWith("required_fields_map."))
      setFormData((previous) => ({
        ...previous,
        required_fields_map: {
          ...previous.required_fields_map,
          [field.slice("required_fields_map.".length)]: value,
        },
      }));
    else setFormData((previous) => ({ ...previous, [field]: value }));
  };
  const save = async () => {
    const next = {
      name: validateName(formData.name),
      description: validateDescription(formData.description),
    };
    if (next.name || next.description) {
      setErrors(next);
      scrollToFirstError(next);
      return;
    }
    if (!university) return;
    try {
      await updateUniversityType({
        name: formData.name.trim(),
        description: formData.description.trim(),
        required_fields: university.required_fields.map((field) => ({
          id: field.id,
          is_required: formData.required_fields_map[field.id] === true,
        })),
      });
      showToast("University type updated successfully", "success");
      router.push(redirectPath);
    } catch (error: unknown) {
      handleApiError(error, "Please try again.");
    }
  };
  if (detailsLoading || (university && !initial))
    return <Loading text="Loading university type..." />;
  if (error || !university)
    return (
      <EmptyData
        title="University type unavailable"
        subtitle={error || "This configuration could not be found."}
        action={
          <LinkBtn
            href={listPath}
            label="Back to types"
            icon={<ArrowLeft className="h-4 w-4" />}
          />
        }
      />
    );
  return (
    <UniversityTypeEditor
      mode="edit"
      formData={formData}
      errors={errors}
      submissionFields={university.required_fields}
      updateFormData={update}
      onValidate={(field) =>
        setErrors((previous) => ({
          ...previous,
          [field]:
            field === "name"
              ? validateName(formData.name)
              : validateDescription(formData.description),
        }))
      }
      onSubmit={save}
      onCancel={() => router.push(listPath)}
      loading={loading}
      isFormValid={
        !validateName(formData.name) &&
        !validateDescription(formData.description)
      }
      dirty={
        !!initial &&
        JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          description: formData.description.trim(),
        }) !==
          JSON.stringify({
            ...initial,
            name: initial.name.trim(),
            description: initial.description.trim(),
          })
      }
    />
  );
}
