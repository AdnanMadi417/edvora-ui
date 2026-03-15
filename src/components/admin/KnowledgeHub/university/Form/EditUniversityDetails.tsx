"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  ChevronLeft,
  ArrowLeft,
  GraduationCap,
  Pencil,
  Trash2,
} from "lucide-react";

import { useUniversityDetails } from "hooks/knowledge-hub/universities/useUniversitiesDetails";
import { useUpdateUniversity } from "hooks/knowledge-hub/universities/useEditUniversitiesDetails";
import { useKnowledgeHubStates } from "hooks/knowledge-hub/programs/useProgramStates";
import { useDeleteBranch } from "hooks/knowledge-hub/universities/useDeleteBranch";
import { useAllPaymentMethods } from "hooks/knowledge-hub/payment-methods/usePaymentMethods";
import { useUniversityPaymentMethods } from "hooks/knowledge-hub/universities/payment-methods/useUniversityPaymentMethods";
import { useDeleteUniversityPaymentMethod } from "hooks/knowledge-hub/universities/payment-methods/useDeletePaymentMethod";
import { useAssignPaymentMethod } from "hooks/knowledge-hub/universities/payment-methods/useAssignUniversityPayment";

import InputField from "components/form/InputField";
import MultipleDateInput from "components/form/MultipleDateInput";
import SearchableDropdown from "components/form/search/SearchableDropdown";

import Button from "components/ui/buttons/Button";
import Loading from "components/loading/Loading";
import IconButton from "components/ui/buttons/IconButton";
import EmptyData from "components/emptyData/EmptyTableData";
import { useToast } from "components/context/ToastContext";

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
  const { showToast } = useToast();
  const router = useRouter();

  const { university, branches, universityLoading } = useUniversityDetails(id);
  const { universityPaymentMethods, loading } = useUniversityPaymentMethods(id);
  const { paymentMethods } = useAllPaymentMethods();

  const { assignPaymentMethod, loading: assigning } = useAssignPaymentMethod();
  const { deletePaymentMethod, } = useDeleteUniversityPaymentMethod();

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

        showToast("Branch deleted successfully." , "success");
      }

      setFormData((prev: any) => ({
        ...prev,
        branches: prev.branches.filter((_: any, i: number) => i !== index),
      }));
    }
    catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Please try again.";
      showToast(`Failed to delete branch. ${backendMessage}`, "error");
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

  const [selectedMethods, setSelectedMethods] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (!universityPaymentMethods) return;

    setSelectedMethods(
      universityPaymentMethods.map((p) => String(p.payment_method_id))
    );
  }, [universityPaymentMethods]);

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

    return (
      JSON.stringify(normalizePayload(formData)) !==
      JSON.stringify(normalizePayload(initialFormData))
    );
  }, [formData, initialFormData]);

  const updateBranchField = (index: number, field: string, value: any) => {
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

      showToast("University updated successfully.", "success");
      setTimeout(() => router.refresh(), 1500);
    }catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Please try again.";
      showToast(`Failed to assign payment method. ${backendMessage}`, "error");
    }
  };

  const handleAssignMethod = async (methodId: string) => {
    try {
      await assignPaymentMethod(id, { payment_method_id: methodId, is_active: true });
      showToast("Payment method assigned successfully.", "success");
      setTimeout(() => router.refresh(), 1500);
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Please try again.";
      showToast(`Failed to assign payment method. ${backendMessage}`, "error");
    }
  };

  const handleRemoveMethod = async (methodId: string) => {
    try {
      const assigned = universityPaymentMethods.find(
        (p) => String(p.payment_method_id) === methodId
      );
      if (!assigned) return;

      await deletePaymentMethod(id, assigned.id);
      showToast("Payment method removed successfully.", "success");
      router.refresh();
    }
    catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Please try again.";
      showToast(`Failed to delete payment method. ${backendMessage}`, "error");
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
            <h2 className="text-lg font-semibold">{university.name}</h2>
            <p className="text-sm text-slate-500">{university.country}</p>
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

      <div className="space-y-5 px-6 py-6">
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

                <SearchableDropdown
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

      <div className="border-t px-6 py-6">
        <h3 className="mb-4 text-sm font-semibold uppercase text-slate-500">
          Payment Methods
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paymentMethods.map((method) => {
            const isAssigned = universityPaymentMethods.some(
              (p) => String(p.payment_method_id) === String(method.id)
            );

            const toggleMethod = async () => {
              if (isAssigned) {
                await handleRemoveMethod(String(method.id));
              } else {
                await handleAssignMethod(String(method.id));
              }
            };

            return (
              <label
                key={method.id}
                className={`group relative flex cursor-pointer items-center justify-between rounded-md border px-4 py-4 transition-all
          ${isAssigned
                  ? "border-blue-600 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-800">{method.name}</span>
                  <span className="text-xs text-slate-400">
            {isAssigned ? "Enabled" : "Disabled"} – Click to toggle
          </span>
                </div>

                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isAssigned}
                    onChange={toggleMethod}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-blue-600" />
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </div>

                {isAssigned && (
                  <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-blue-600" />
                )}
              </label>
            );
          })}
        </div>

      </div>

      <div className="flex justify-end gap-2 border-t p-6">
        <Button
          onClick={handleBack}
          icon={<ArrowLeft className="h-5 w-5" />}
          text={"Back"}
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
