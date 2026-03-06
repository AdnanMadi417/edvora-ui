"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, ChevronLeft,ArrowLeft, GraduationCap, Pencil, Trash2 } from 'lucide-react';

import { useUniversityDetails } from "hooks/knowledge-hub/universities/useUniversitiesDetails";
import { useUpdateUniversity } from "hooks/knowledge-hub/universities/useEditUniversitiesDetails";
import { useKnowledgeHubStates } from "hooks/knowledge-hub/programs/useProgramStates";
import { useDeleteBranch } from "hooks/knowledge-hub/universities/useDeleteBranch";

import InputField from "../../../../../form/InputField";
import MultipleDateInput from "../../../../../form/MultipleDateInput";
import SelectField from "../../../../../form/SelectField";

import Button from '../../../../../ui/buttons/Button';
import Loading from "../../../../../loading/Loading";
import IconButton from '../../../../../ui/buttons/IconButton';
import EmptyData from '../../../../../emptyData/EmptyTableData';
import { useToast } from '../../../../../context/ToastContext';

const normalizePayload = (formData: any) => {
  return {
    name: formData.name?.trim() || "",
    country: formData.country?.trim() || "",
    description: formData.description || "",
    intake_months: [...(formData.intake_months || [])],
    is_active: formData.is_active ?? true,

    branches: (formData.branches || [])
      .filter((b: any) => b.name && b.location && b.state_id)
      .map((b: any) => ({
        id: typeof b.id === "string" ? b.id : undefined,
        name: b.name.trim(),
        location: b.location.trim(),
        state_id: b.state_id,
      })),
  };
};

interface Props {
  id: string;
}

const UniversityEdit = ({ id }: Props) => {
  const router = useRouter();
  const { showToast } = useToast();

  const { university, branches, universityLoading } =
    useUniversityDetails(id);

  const { deleteBranch, deleteLoading } = useDeleteBranch();
  const [initialFormData, setInitialFormData] = React.useState<any>(null);

  const { states } = useKnowledgeHubStates();

  const stateOptions =
    states?.map((c) => ({
      value: String(c.id),
      label: c.name,
    })) || [];

  const { updateUniversity, updateLoading } = useUpdateUniversity(id);

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

  const handleRemoveBranch = async (index: number) => {
    const branch = formData.branches[index];

    if (!branch) return;

    try {

      if (branch.id) {
        await deleteBranch(id, branch.id);

        showToast("Branch deleted successfully.");
      }

      setFormData((prev: any) => ({
        ...prev,
        branches: prev.branches.filter((_: any, i: number) => i !== index),
      }));

    } catch (err) {
      console.error(err);
      showToast("Failed to delete branch.", "error");
    }
  };

  const [formData, setFormData] = React.useState<any>({
    name: "",
    country: "",
    description: "",
    intake_months: [],
    branches: [],
    is_active: true,
  });

  React.useEffect(() => {
    if (!university) return;

    const data = {
      name: university.name || "",
      country: university.country || "",
      description: university.description || "",
      intake_months: [...(university.intake_months || [])],
      branches: (branches || []).map((b: any) => ({
        id: b.id,
        name: b.name || "",
        location: b.location || "",
        state_id: b.state_id ? String(b.state_id) : "",
      })),
      is_active: university.is_active ?? true,
    };

    setFormData(data);
    setInitialFormData(data);

  }, [university, branches]);
  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormChanged = React.useMemo(() => {
    if (!initialFormData) return false;

    return JSON.stringify(normalizePayload(formData)) !==
      JSON.stringify(normalizePayload(initialFormData));

  }, [formData, initialFormData]);

  const updateBranchField = (
    index: number,
    field: string,
    value: any
  ) => {
    setFormData((prev: any) => {
      const branchesCopy = JSON.parse(JSON.stringify(prev.branches));

      branchesCopy[index][field] = value;

      return {
        ...prev,
        branches: branchesCopy,
      };
    });
  };

  const handleBack = () => {
    router.push("/admin/universities");
  };

  const handleUpdate = async () => {
    try {
      const payload = normalizePayload(formData);

      await updateUniversity(payload);

      showToast("University created successfully.");

      setTimeout(() => router.refresh(), 1500);

    } catch (err) {
      console.error(err);
    }
  };

  if (universityLoading) {
    return <Loading text="Loading university details..." />;
  }

  if (!university) {
    return <EmptyData />;
  }

  return (
    <div className="mt-6 rounded-md border bg-white">

      <div className="flex justify-between border-b p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              {university.name}
            </h2>
            <p className="text-sm text-slate-500">
              {university.country}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <button
            onClick={handleBack}
            className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back to universities</span>
          </button>

        </div>

      </div>

      <div className="px-6 py-6 space-y-5">

        <h3 className="text-sm font-semibold uppercase text-slate-500">
          Edit University
        </h3>

        <InputField
          label="University Name"
          field="name"
          required
          formData={formData}
          errors={{}}
          updateFormData={updateFormData}
        />

        <InputField
          label="Country"
          field="country"
          required
          formData={formData}
          errors={{}}
          updateFormData={updateFormData}
        />

        <InputField
          label="Description"
          field="description"
          formData={formData}
          errors={{}}
          updateFormData={updateFormData}
        />

        <MultipleDateInput
          label="Intake Months"
          field="intake_months"
          required
          formData={formData}
          errors={{}}
          updateFormData={updateFormData}
        />

      </div>

      <div className="border-t px-6 py-6">

        <div className="flex justify-between items-center mb-4">
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

        <div className="grid gap-4 grid-cols-1">
          {formData.branches.map((branch: any, index: number) => (
            <div
              key={branch.id || index}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5"
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


              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">

                <InputField
                  label="Branch Name"
                  placeholder="e.g Branch Name"
                  field="name"
                  formData={branch}
                  errors={{}}
                  updateFormData={(f: string, v: any) =>
                    updateBranchField(index, f, v)
                  }
                />

                <InputField
                  label="Location"
                  placeholder="e.g Location"
                  field="location"
                  formData={branch}
                  errors={{}}
                  updateFormData={(f: string, v: any) =>
                    updateBranchField(index, f, v)
                  }
                />

                <SelectField
                  label="State"
                  field="state_id"
                  options={stateOptions}
                  formData={{ state_id: branch.state_id }}
                  errors={{}}
                  updateFormData={(f: string, v: any) =>
                    updateBranchField(index, f, v)
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
          icon={<ArrowLeft className="h-5 w-5" />}
          text={ "Back"}
          bgColor="bg-slate-50"
          textColor="text-slate-700"
          borderColor="border-slate-600"
          hoverTextColor="hover:text-slate-800"
          hoverBorderColor="hover:border-slate-700"
        />

        <Button
          onClick={handleUpdate}
          disabled={updateLoading || !isFormChanged}
          icon={<Pencil className="h-5 w-5" />}
          text={updateLoading ? "Updating..." : "Save Changes"}
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          borderColor="border-blue-600"
          hoverTextColor="hover:text-blue-800"
          hoverBorderColor="hover:border-blue-700"
        />

      </div>

    </div>
  );
};

export default UniversityEdit;