"use client";

import React, { useState, useEffect } from "react";
import { Plus, PlusCircle, Trash2, Edit2 } from "lucide-react";
import ModalHeader from "components/ui/modal/ModalHeader";

import {
  useLogisticServices,
  useLogisticServiceLocations,
  useLogisticLanguages,
  useLogisticUniversities,
  useEditLogisticProvider,
} from "features/logistical-service/hooks";

import CheckSimpleBoxGroup from "components/form/CheckSimpleBoxGroup";
import InputField from "components/form/InputField";
import Button from "components/ui/buttons/Button";
import { useToast } from "components/context/ToastContext";
import SelectField from "components/form/SelectField";
import { COUNTRIES } from "constants/lists";
import type { PackageOffered, ServiceEntry } from "features/logistical-service/types";

interface FormData {
  name: string;
  nationality: string;
  main_location: string;
  phone_number: string;
  whatsapp: string;
  is_active: boolean;
  packages_offered: PackageOffered[];
  selectedServices: ServiceEntry[];
  selectedLanguages: string[];
  selectedUniversities: string[];
}

interface EditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: any;
}

type FormErrors = Partial<Record<keyof FormData | "selectedServices", string>>;

export default function EditDetailsModal({
  isOpen,
  onClose,
  provider,
}: EditDetailsModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const { showToast } = useToast();
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    name: provider?.name || "",
    nationality: provider?.nationality || "",
    main_location: provider?.main_location || "",
    phone_number: provider?.phone_number || "",
    whatsapp: provider?.whatsapp || "",
    is_active: provider?.is_active ?? true,
    packages_offered: provider?.packages_offered || [],
    selectedServices: [],
    selectedLanguages: provider?.languages || [],
    selectedUniversities: provider?.universities_served || [],
  });

  const { logisticServices } = useLogisticServices();
  const { logisticServiceLocations } = useLogisticServiceLocations();
  const { logisticLanguages } = useLogisticLanguages();
  const { logisticUniversities } = useLogisticUniversities();
  const { editLogisticsProvider, loadingEditLogisticsProvider, errorEditLogisticsProvider } = useEditLogisticProvider();

  const updateFormData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const addPackage = () => {
    setFormData((prev) => ({
      ...prev,
      packages_offered: [...prev.packages_offered, { name: "", description: "", price: 0, includes: [] }],
    }));
  };

  const updatePackage = (index: number, field: keyof PackageOffered, value: any) => {
    const updated = [...formData.packages_offered];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, packages_offered: updated }));
  };

  const removePackage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      packages_offered: prev.packages_offered.filter((_, i) => i !== index),
    }));
  };

  const toggleService = (serviceId: string) => {
    setFormData((prev) => {
      const exists = prev.selectedServices.find((s) => s.service_id === serviceId);
      if (exists) {
        return { ...prev, selectedServices: prev.selectedServices.filter((s) => s.service_id !== serviceId) };
      }
      return { ...prev, selectedServices: [...prev.selectedServices, { service_id: serviceId, price: 0 }] };
    });
  };

  const updateServicePrice = (serviceId: string, price: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.map((s) =>
        s.service_id === serviceId ? { ...s, price } : s
      ),
    }));
  };

  useEffect(() => {
    if (provider && logisticLanguages.length && logisticUniversities.length) {
      setFormData({
        name: provider.name || "",
        nationality: provider.nationality || "",
        main_location: provider.main_location || "",
        phone_number: provider.phone_number || "",
        whatsapp: provider.whatsapp || "",
        is_active: provider.is_active ?? true,
        packages_offered: provider.packages_offered || [],
        selectedServices: (provider.services_offered || []).map(
          (srv: { id: string; price?: number }) => ({
            service_id: srv.id,
            price: srv.price ?? 0,
          })
        ),
        selectedLanguages: provider.languages
          .map((lang: string) => logisticLanguages.find((l) => l.name === lang)?.id)
          .filter(Boolean) as string[],
        selectedUniversities: provider.universities_served
          .map((uni: string) => logisticUniversities.find((u) => u.name === uni)?.id)
          .filter(Boolean) as string[],
      });
    }
  }, [provider, logisticLanguages, logisticUniversities]);

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.nationality) newErrors.nationality = "Nationality is required";
    if (!formData.main_location) newErrors.main_location = "Main Location is required";
    if (!formData.phone_number) newErrors.phone_number = "Phone number is required";
    if (!formData.selectedServices.length) newErrors.selectedServices = "Please select at least one service";
    if (!formData.selectedLanguages.length) newErrors.selectedLanguages = "Please select at least one language";
    if (!formData.selectedUniversities.length) newErrors.selectedUniversities = "Please select at least one university";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      name: formData.name,
      nationality: formData.nationality,
      main_location: formData.main_location,
      phone_number: formData.phone_number,
      whatsapp: formData.whatsapp,
      is_active: formData.is_active,
      packages_offered: formData.packages_offered,
      services: formData.selectedServices,
      language_ids: formData.selectedLanguages,
      university_ids: formData.selectedUniversities,
    };

    try {
      await editLogisticsProvider(provider.id, payload);
      showToast("Logistics provider updated successfully", "success");
      setTimeout(() => location.reload(), 1500);
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Please try again.";
      showToast(`Update failed. ${backendMessage}`, "error");
    }
  };

  if (!isVisible) return <section className=""></section>;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl bg-white text-sm shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Edit Logistical Service Provider"
            description="Modify provider information and service coverage"
            icon={Edit2}
            iconBg="bg-amber-50"
            iconColor="text-amber-700"
            iconBorder="border-amber-300"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-4 py-5">
            <div className="grid grid-cols-1 gap-x-3">
              <InputField label="Provider Name" field="name" placeholder={provider?.name} required formData={formData} errors={errors} updateFormData={updateFormData} />
              <SelectField label="Nationality" field="nationality" options={COUNTRIES.map((c) => ({ label: c.name, value: c.code }))} formData={formData} errors={errors} updateFormData={updateFormData} />
              <SelectField label="Current Residence" field="main_location" options={logisticServiceLocations.map((u) => ({ value: u.name, label: u.name }))} formData={formData} errors={errors} updateFormData={updateFormData} />
              <InputField label="Primary Contact Number" field="phone_number" placeholder="e.g. +60 12 345 6789" required formData={formData} errors={errors} updateFormData={updateFormData} />
              <InputField label="WhatsApp Contact" field="whatsapp" placeholder="e.g. +60 12 345 6789" formData={formData} errors={errors} required updateFormData={updateFormData} />

              <label className={`group relative flex cursor-pointer items-center justify-between rounded-md border px-4 py-4 transition-all ${formData.is_active ? "border-blue-600 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"}`}>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-800">Active</span>
                  <span className="text-xs text-slate-400">{formData.is_active ? "Active" : "Inactive"}</span>
                </div>
                <div className="relative">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => updateFormData("is_active", e.target.checked)} className="peer sr-only" aria-checked={formData.is_active} />
                  <div className="h-6 w-11 rounded-md bg-slate-300 transition-colors peer-checked:bg-blue-600" />
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-md bg-white shadow transition-transform peer-checked:translate-x-5" />
                </div>
                {formData.is_active && <span className="absolute right-3 top-3 h-2 w-2 rounded-md bg-blue-600" />}
              </label>
            </div>

            <div className="block">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-lg font-semibold text-slate-900">Packages Offered</h4>
                <Button icon={<Plus className="h-5 w-5" />} text="Add Package" bgColor="bg-amber-50" textColor="text-amber-700" borderColor="border-amber-600" hoverTextColor="hover:text-amber-800" hoverBorderColor="hover:border-amber-700" onClick={addPackage} />
              </div>

              {formData.packages_offered.length === 0 && (
                <div className="mb-3 rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-medium text-slate-700">No packages added yet</p>
                  <p className="mt-1 text-xs text-slate-400">Add a package to get started</p>
                </div>
              )}

              {formData.packages_offered.map((pkg, index) => (
                <div key={index} className="mb-6 rounded-md border bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h5 className="font-medium text-slate-800">Package {index + 1}</h5>
                    <button type="button" onClick={() => removePackage(index)} className="flex items-center justify-center gap-2 rounded-md border border-red-600 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-700 hover:text-red-700 disabled:opacity-50">
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-x-3">
                    <InputField label="Package Name" field="name" required formData={{ name: pkg.name }} errors={{}} updateFormData={(_, value) => updatePackage(index, "name", value)} />
                    <InputField label="Price" field="price" type="number" formData={{ price: pkg.price }} errors={{}} updateFormData={(_, value) => updatePackage(index, "price", Number(value))} />
                  </div>
                  <InputField label="Description" field="description" formData={{ description: pkg.description }} errors={{}} updateFormData={(_, value) => updatePackage(index, "description", value)} />
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Includes</label>
                    <div className="space-y-2">
                      {pkg.includes.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
                          <input type="text" value={item} onChange={(e) => { const updated = [...pkg.includes]; updated[i] = e.target.value; updatePackage(index, "includes", updated); }} className="flex-1 px-2 py-1 text-sm focus:outline-none" placeholder={`Include item ${i + 1}`} />
                          <button type="button" onClick={() => updatePackage(index, "includes", pkg.includes.filter((_, idx) => idx !== i))} className="flex items-center justify-center rounded-md border border-red-600 p-1 text-red-600 transition hover:border-red-700 hover:text-red-700" aria-label="Remove item">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button icon={<Plus className="h-4 w-4" />} text="Add Item" bgColor="bg-amber-50" textColor="text-amber-700" borderColor="border-amber-600" hoverTextColor="hover:text-amber-800" hoverBorderColor="hover:border-amber-700" onClick={() => updatePackage(index, "includes", [...pkg.includes, ""])} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-x-3">
              <CheckSimpleBoxGroup label="Languages" field="selectedLanguages" options={logisticLanguages} formData={formData} updateFormData={updateFormData} errors={errors} required />

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Logistic Services <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {logisticServices.map((svc) => {
                    const selected = formData.selectedServices.find((s) => s.service_id === svc.id);
                    return (
                      <div key={svc.id} className="rounded-md border border-slate-200 px-3 py-2">
                        <label className="flex cursor-pointer items-center gap-2">
                          <input type="checkbox" checked={!!selected} onChange={() => toggleService(svc.id)} className="h-4 w-4 rounded border-slate-300 accent-amber-600" />
                          <span className="text-sm text-slate-700">{svc.name}</span>
                        </label>
                        {selected && (
                          <div className="mt-2 flex items-center gap-2 pl-6">
                            <span className="text-xs text-slate-500">Price (RM)</span>
                            <input type="number" min={0} value={selected.price} onChange={(e) => updateServicePrice(svc.id, Number(e.target.value))} className="w-28 rounded border border-slate-200 px-2 py-1 text-sm focus:border-amber-400 focus:outline-none" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {errors.selectedServices && <p className="mt-1 text-xs text-red-500">{errors.selectedServices}</p>}
              </div>

              <CheckSimpleBoxGroup label="Universities" field="selectedUniversities" options={logisticUniversities} formData={formData} updateFormData={updateFormData} errors={errors} required />
            </div>

            {errorEditLogisticsProvider && (
              <p className="mt-3 text-sm text-red-600">{errorEditLogisticsProvider}</p>
            )}
          </div>

          <div className="flex justify-end border-t border-gray-200 px-6 py-4">
            <Button
              icon={<PlusCircle className="h-5 w-5" />}
              text={loadingEditLogisticsProvider ? "Updating..." : "Update Service"}
              bgColor="bg-amber-50"
              textColor="text-amber-700"
              borderColor="border-amber-600"
              hoverTextColor="hover:text-amber-800"
              hoverBorderColor="hover:border-amber-700"
              onClick={handleSubmit}
              disabled={loadingEditLogisticsProvider}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
