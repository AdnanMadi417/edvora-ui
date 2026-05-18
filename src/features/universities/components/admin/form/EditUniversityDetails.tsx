"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  ChevronLeft,
  ArrowLeft,
  Pencil,
  Landmark,
  Trash2,
} from "lucide-react";

import { useToast } from "components/context/ToastContext";
import { CURRENCY } from "constants/lists";

import {
  useAssignUniversityType,
  useUniversityDetails,
  useUpdateUniversity,
  useDeleteBranch,
  useUniversityPaymentMethods,
  useUpdateUniversityPaymentMethod,
  useAssignUniversityPaymentMethod,
  useDeleteUniversityPaymentMethod,
  useUniversityTypes,
} from "features/universities/hooks";

import { useAllPaymentMethods } from "hooks/knowledge-hub/payment-methods/usePaymentMethods";
import { useAllStates } from "hooks/knowledge-hub/programs/useStates";

import InputField from "components/form/InputField";
import SelectField from "components/form/SelectField";
import MultipleDatePickerModal from "components/form/MultipleDatePickerModal";
import ToggleInput from "components/form/toggle/ToggleInput";
import SearchableDropdown from "components/form/search/SearchableDropdown";
import ImageUploadField from "components/form/images/ImageUploadField";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";
import { getDocumentDownloadUrl } from "services/documentService";

import Button from "components/ui/buttons/Button";
import Loading from "components/loading/Loading";
import IconButton from "components/ui/buttons/IconButton";
import EmptyData from "components/emptyData/EmptyTableData";
import NoMessagesFound from "components/emptyData/NoMessagesFound";

const normalizePayload = (formData: any) => {
  return {
    name: formData.name?.trim() || "",
    country: formData.country?.trim() || "",
    description: formData.description || "",
    intake_months: (formData.intake_months || []).filter((m: string) => m.trim() !== ""),
    is_active: formData.is_active ?? true,
    university_type_id: formData.university_type_id || "",
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
  const { universityPaymentMethods } = useUniversityPaymentMethods(id);
  const { paymentMethods } = useAllPaymentMethods();
  const { assignUniversityType } = useAssignUniversityType(id);
  const { universities: universityTypes } = useUniversityTypes();
  const { updateUniversityPaymentMethod, loading } =
    useUpdateUniversityPaymentMethod();

  const [initialFormData, setInitialFormData] = React.useState<any>(null);
  const { assignPaymentMethod } = useAssignUniversityPaymentMethod();
  const { deleteUniversityPaymentMethod } = useDeleteUniversityPaymentMethod();
  const { deleteBranch } = useDeleteBranch();
  const { states } = useAllStates();
  const { updateUniversity, updateLoading } = useUpdateUniversity(id);
  const [showAddPayment, setShowAddPayment] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [logoFileKey, setLogoFileKey] = useState("");
  const [logoFileUrl, setLogoFileUrl] = useState("");
  const [existingLogoUrl, setExistingLogoUrl] = useState("");
  const [existingLogoKey, setExistingLogoKey] = useState("");

  const [paymentFormData, setPaymentFormData] = useState<any[]>([]);

  const updatePaymentFormData = (id: string, field: string, value: any) => {
    setPaymentFormData((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const stateOptions =
    states?.map((c) => ({
      value: String(c.id),
      label: c.name,
    })) || [];

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

  const [formData, setFormData] = React.useState<any>({
    name: "",
    country: "",
    description: "",
    intake_months: [],
    branches: [],
    is_active: true,
    university_type_id: "",
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

      university_type_id: university.university_type_id
        ? String(university.university_type_id)
        : "",
    };

    setFormData(data);
    setInitialFormData(data);
    setExistingLogoKey(university.logo_file_key || "");
    if (university.logo_file_key) {
      getDocumentDownloadUrl(university.logo_file_key)
        .then(setExistingLogoUrl)
        .catch(() => setExistingLogoUrl(""));
    }
  }, [university, branches]);

  React.useEffect(() => {
    if (!universityPaymentMethods) return;

    setPaymentFormData(
      universityPaymentMethods.map((method) => ({
        id: method.id,
        university_id: method.university_id,
        payment_method_id: method.payment_method_id,
        instructions: method.instructions,
        currency: method.currency,
        is_active: method.is_active,
      }))
    );
  }, [universityPaymentMethods]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = React.useMemo(() => {
    return (
      formData.name?.trim() !== "" &&
      formData.country?.trim() !== "" &&
      formData.university_type_id !== "" &&
      formData.branches.every(
        (b: any) => b.name?.trim() && b.location?.trim() && b.state_id
      )
    );
  }, [formData]);

  const isFormChanged = React.useMemo(() => {
    if (!initialFormData) return false;

    const universityChanged =
      JSON.stringify(normalizePayload(formData)) !==
      JSON.stringify(normalizePayload(initialFormData));

    const logoChanged =
      logoFile !== null ||
      existingLogoUrl !== (university?.logo_file_url || "");

    const paymentChanged =
      paymentFormData.some((p, index) => {
        const initial = universityPaymentMethods?.[index];
        if (!initial) return true;
        return (
          p.payment_method_id !== initial.payment_method_id ||
          p.currency !== initial.currency ||
          p.instructions !== initial.instructions ||
          p.is_active !== initial.is_active
        );
      }) ?? false;

    return universityChanged || logoChanged || paymentChanged;
  }, [formData, initialFormData, logoFile, existingLogoUrl, university, paymentFormData, universityPaymentMethods]);

  const handleRemoveBranch = async (index: number) => {
    const branch = formData.branches[index];

    if (!branch) return;

    try {
      if (branch.id) {
        await deleteBranch(id, branch.id);

        showToast("Branch deleted successfully.", "success");
      }

      setFormData((prev: any) => ({
        ...prev,
        branches: prev.branches.filter((_: any, i: number) => i !== index),
      }));

      setTimeout(() => {
        router.refresh()
      })

    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message || "Please try again.";
      showToast(`Failed to delete branch. ${backendMessage}`, "error");
    }
  };

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
        setLogoUploading(false);
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

  const handleSavePaymentMethod = async (method: any) => {
    try {
      const payload = {
        payment_method_id: method.payment_method_id,
        instructions: method.instructions || "",
        currency: method.currency || "",
        is_active: method.is_active ?? true,
      };

      await updateUniversityPaymentMethod(method.university_id, method.id, payload);

      setPaymentFormData((prev) =>
        prev.map((p) => (p.id === method.id ? { ...p, ...payload } : p))
      );

    } catch {
      // hook already shows the error toast
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    try {
      await deleteUniversityPaymentMethod(id, methodId);

      setPaymentFormData((prev) => prev.filter((p) => p.id !== methodId));

      showToast("Payment method deleted successfully", "success");

      setTimeout(() => {
        router.refresh()
      })

    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message || "Please try again.";

      showToast(`Failed to delete payment method. ${backendMessage}`, "error");
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAssign = async () => {
    if (!formData.payment_method_id) return;

    try {
      await assignPaymentMethod(id, {
        payment_method_id: formData.payment_method_id,
        instructions: formData.instructions?.trim() || undefined,
        currency: formData.currency?.trim() || undefined,
        is_active: formData.is_active,
      });

      showToast("Payment method assigned successfully.", "success");

      setTimeout(() => {
        router.refresh()
      })

    } catch (err: any) {
      const apiErrors = err?.response?.data?.detail;

      if (Array.isArray(apiErrors)) {
        const newErrors: Record<string, string> = {};

        apiErrors.forEach((e: any) => {
          if (e?.loc?.[1]) newErrors[e.loc[1]] = e.msg;
        });

        setErrors(newErrors);
      }

      showToast("Failed to assign payment method.", "error");
    }
  };

  const handleUpdate = async () => {
    if (logoUploading) {
      showToast("Please wait for the logo to finish uploading.", "error");
      return;
    }

    try {
      const logo_file_key = logoFile ? logoFileKey : existingLogoKey;
      const logo_file_url = logoFile ? logoFileUrl : existingLogoUrl;

      const payload = { ...normalizePayload(formData), logo_file_key, logo_file_url };

      await updateUniversity(payload);

      if (formData.university_type_id) {
        await assignUniversityType({
          university_type_id: formData.university_type_id || null,
        });
      }

      if (paymentFormData.length && universityPaymentMethods) {
        for (let i = 0; i < paymentFormData.length; i++) {
          const method = paymentFormData[i];
          const initial = universityPaymentMethods[i];
          if (
            !initial ||
            method.payment_method_id !== initial.payment_method_id ||
            method.currency !== initial.currency ||
            method.instructions !== initial.instructions ||
            method.is_active !== initial.is_active
          ) {
            await handleSavePaymentMethod(method);
          }
        }
      }

      showToast("University updated successfully.", "success");

      setTimeout(() => {
        router.refresh()
      })

    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message || "Please try again.";
      showToast(`Update failed. ${backendMessage}`, "error");
    }
  };

  const handleBack = () => {
    router.refresh();
  };

  if (universityLoading) {
    return <Loading text="Loading university details..." />;
  }

  if (!university) {
    return <EmptyData />;
  }

  return (
    <div className="mt-6 max-w-5xl mx-auto rounded-md border bg-white">
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
              existingUrl={existingLogoUrl}
              onExistingRemove={() => { setExistingLogoUrl(""); setExistingLogoKey(""); }}
              errors={errors}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold">{university.name}</h2>
            <p className="text-sm text-slate-500">{university.country}</p>
            {logoFile && !logoUploading && (
              <span className="mt-1 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                Logo ready — click Save Changes
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">

          <button
            onClick={handleBack}
            className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
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

        <div className="block">

          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">

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
              required={false}
            />

          </div>

          <MultipleDatePickerModal
            label="Intake Dates"
            field="intake_months"
            required={false}
            formData={formData}
            errors={{}}
            updateFormData={updateFormData}
          />

          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">

            <SelectField
              label="University Type"
              field="university_type_id"
              required
              options={universityTypes.map((type) => ({
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

          <ToggleInput
            label="University Status"
            field="is_active"
            formData={formData}
            errors={{}}
            updateFormData={updateFormData}
          />

        </div>

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

      <div className=" space-y-6 border-t px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="mb-4 text-sm font-semibold uppercase text-slate-500">
            Payment Methods
          </h3>

          <IconButton
            icon={<Landmark className="h-4 w-4" />}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
            onClick={() => setShowAddPayment((prev) => !prev)}
          />
        </div>

        <div className="grid grid-cols-1 space-y-6 ">
          {paymentFormData.map((method, index: number) => (
            <div
              key={method.id || index}
              className="space-y-4 rounded-md border bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-semibold text-slate-700">
                  {`Payment Method ${index + 1}`}
                </h4>

                <IconButton
                  icon={<Trash2 className="h-4 w-4" />}
                  bgColor="bg-red-50"
                  textColor="text-red-700"
                  borderColor="border-red-200"
                  hoverTextColor="hover:text-red-800"
                  hoverBorderColor="hover:border-red-300"
                  onClick={() => handleDeletePaymentMethod(method.id)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <SelectField
                  label="Payment Method"
                  field="payment_method_id"
                  required
                  options={paymentMethods.map((m) => ({
                    value: String(m.id),
                    label: m.name,
                  }))}
                  formData={method}
                  errors={{}}
                  updateFormData={(field, value) =>
                    updatePaymentFormData(method.id, field, value)
                  }
                />

                <SelectField
                  label="Currency"
                  field="currency"
                  formData={method}
                  errors={{}}
                  options={(CURRENCY.map((c) => ({
                    value: c.value,
                    label: c.label,
                  })))}
                  updateFormData={(field, value) =>
                    updatePaymentFormData(method.id, field, value)
                  }
                  required={false}
                />

                <InputField
                  label="Instructions"
                  field="instructions"
                  formData={method}
                  errors={{}}
                  updateFormData={(field, value) =>
                    updatePaymentFormData(method.id, field, value)
                  }
                  required={false}
                />

              </div>

              <ToggleInput
                label="Payment Method Status"
                field="is_active"
                formData={method}
                errors={{}}
                updateFormData={(field, value) => {
                  updatePaymentFormData(method.id, field, value);
                }}
              />

            </div>
          ))}

          {paymentFormData.length === 0 && (
            <NoMessagesFound
              title="No payment methods assigned"
              subtitle="Assign a payment method to allow universities to accept payments."
            />
          )}
        </div>

        {showAddPayment && (
          <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SearchableDropdown
                label="Payment Method"
                field="payment_method_id"
                required
                options={paymentMethods.map((p) => ({
                  value: String(p.id),
                  label: p.name,
                }))}
                disabledOptions={universityPaymentMethods.map((p) =>
                  String(p.payment_method_id)
                )}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <SelectField
                label="Currency"
                field="currency"
                options={(CURRENCY.map((c) => ({
                  value: c.value,
                  label: c.label,
                })))}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InputField
                label="Instructions"
                field="instructions"
                placeholder="Optional payment instructions..."
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            </div>
          </div>
        )}

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
          onClick={async () => {
            if (isFormChanged) {
              await handleUpdate();
            }

            if (formData.payment_method_id) {
              await handleAssign();
            }
          }}
          disabled={logoUploading || updateLoading || !isFormValid || (!isFormChanged && !formData.payment_method_id)}
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
