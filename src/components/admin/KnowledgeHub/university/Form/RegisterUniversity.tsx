"use client";

import React, { useState } from "react";
import { GraduationCap, School, ChevronLeft, CalendarPlus } from 'lucide-react';

import { useToast } from "components/context/ToastContext";
import { useRouter } from "next/navigation";

import { useCreateUniversity } from "hooks/knowledge-hub/universities/useCreateUniversity";
import { useAllStates } from "hooks/knowledge-hub/programs/useStates";
import { useUniversityTypes } from "hooks/knowledge-hub/config-universities/useUniversityTypesQuery";

import InputField from "components/form/InputField";
import MultipleDatePickerModal from "components/form/MultipleDatePickerModal";
import SearchableDropdown from 'components/form/search/SearchableDropdown';
import Button from "components/ui/buttons/Button";
import IconButton from 'components/ui/buttons/IconButton';
import SelectField from 'components/form/SelectField';

export default function RegisterUniversity() {
  const { createUniversity, loading } = useCreateUniversity();
  const { states } = useAllStates();
  const { universities } = useUniversityTypes();

  const { showToast } = useToast();
  const router = useRouter();

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
    formData.intake_months.length > 0 &&
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

  const handleCreate = async () => {
    try {
      await createUniversity(formData);
      showToast("University created successfully.", "success");

      setTimeout(() => {
        router.push("/admin/universities");
      }, 2000);

    } catch (error: any) {
      const code = error?.response?.data?.code;
      let message = "Please try again.";

      if (code === "university_name_exists") {
        message =
          "A university with this name already exists. Please use a different name.";
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      }

      showToast(`Failed to create university. ${message}`, "error");
    }
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
    <section className="mx-auto mt-5">
      <div className="mt-6 rounded-md border bg-white">
        <div className="flex justify-between border-b p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700">
              <School className="h-6 w-6 text-white" />
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
            required
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
            errors={{}}
            updateFormData={(field, value) => {
              updateFormData(field, value);
            }}
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
            disabled={loading}
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
            disabled={loading || !isFormValid}
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
