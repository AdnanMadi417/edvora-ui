"use client";

import React, {  useState } from 'react';
import { Truck, PlusCircle} from 'lucide-react';

import InputField from "../../../../form/InputField";
import MultipleDatePickerModal from '../../../../form/MultipleDatePickerModal';

import { useToast } from "components/context/ToastContext";
import Button from '../../../../ui/buttons/Button';
import { useCreateUniversity } from '../../../../../hooks/knowledge-hub/universities/useCreateKnowledgeHubUniversity';

export default function RegisterUniversity() {
  const { createUniversity, loading } = useCreateUniversity();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    intake_months: [] as string[],
    country: "Malaysia",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleCreate = async () => {
    try {
      await createUniversity(formData);

      showToast("University created successfully.");

    } catch (err: any) {
      const apiErrors = err?.response?.data?.detail;

      if (Array.isArray(apiErrors)) {
        const newErrors: Record<string, string> = {};

        apiErrors.forEach((e: any) => {
          if (e?.loc?.[1]) {
            newErrors[e.loc[1]] = e.msg;
          }
        });

        setErrors(newErrors);
      }
      showToast("Failed to create university.");
    }
  };

  return (
    <section className="mx-auto mt-5">
      <div className="rounded-md border bg-slate-50 shadow-sm">

        <div className="flex items-start gap-x-4 rounded-t-xl border-b px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Truck className="text-blue-700" size={24} />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Register a new university
            </h3>
            <p className="text-sm text-slate-500">
              Complete the required information to register a new knowledge hub university
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-3 px-6 py-5">
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
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <MultipleDatePickerModal
            label="Intake Dates"
            field="intake_months"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        </div>

        <div className="flex justify-end border-t rounded-b-xl px-6 py-5">

          <Button
            onClick={handleCreate}
            disabled={loading}
            icon={<PlusCircle className="h-5 w-5" />}
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
