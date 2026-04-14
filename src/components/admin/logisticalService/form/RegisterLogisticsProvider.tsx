"use client";

import { Trash2, Truck, Plus } from 'lucide-react';
import React, { useState } from "react";

import { useLogisticServices } from "hooks/service-providers/useLogisticServicesList";
import { useLogisticLanguages } from "hooks/service-providers/useLogisticLanguages";
import { useLogisticUniversities } from "hooks/service-providers/useLogisticUniversitiesList";
import { useCreateLogisticsProvider } from "hooks/service-providers/useCreateLogisticsProvider";
import { useAllStates } from "hooks/knowledge-hub/programs/useStates";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

import { NATIONALITIES } from "constants/lists"
import SearchableDropdown from "components/form/search/SearchableDropdown";
import Loading from "components/loading/Loading";
import CheckBoxGroup from "components/form/CheckBoxGroup";
import CheckSimpleBoxGroup from "components/form/CheckSimpleBoxGroup";
import InputField from "components/form/InputField";
import ImageUploadField from "components/form/images/ImageUploadField";
import Button from "components/ui/buttons/Button";
import { useToast } from "components/context/ToastContext";
import { useRouter } from "next/navigation"
import CreateLogisticServicePopup from "components/admin/logisticalService/CreateLogisticServicePopup";

export interface PackageOffered {
  name: string;
  description: string;
  price: number;
  includes: string[];
}

export interface ServiceEntry {
  service_id: string;
  price: number;
}

export interface FormData {
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
  selectedLocations: string[];
}

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function RegisterLogisticsProvider() {
  const { showToast } = useToast();
  const router = useRouter()
  const [errors, setErrors] = useState<FormErrors>({});

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [logoFileKey, setLogoFileKey] = useState("");
  const [logoFileUrl, setLogoFileUrl] = useState("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    nationality: "",
    main_location: "",
    phone_number: "",
    whatsapp: "",
    is_active: true,
    packages_offered: [],
    selectedServices: [],
    selectedLanguages: [],
    selectedUniversities: [],
    selectedLocations: [],
  });

  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const { logisticServices, loadingLogisticServices, refetchLogisticServices } = useLogisticServices();
  const { states } = useAllStates();
  const { logisticLanguages, loadingLogisticLanguage } = useLogisticLanguages();
  const { logisticUniversities, loadingLogisticUniversity } = useLogisticUniversities();
  const { createLogisticsProvider, loadingCreateLogisticsProvider, errorCreateLogisticsProvider } = useCreateLogisticsProvider();

  const updateFormData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleLogoSelect = async (file: File) => {
    setLogoFile(file);
    setLogoUploading(true);
    setLogoProgress(0);
    setLogoFileKey("");
    setLogoFileUrl("");

    try {
      const presigned = await getPresignedUploads([file], "logistic-provider-pictures");
      const results = await uploadFilesToSpaces([file], presigned, (_, pct) => {
        setLogoProgress(pct);
      });
      const uploaded = results?.[0];

      if (!uploaded?.file_key || !uploaded?.public_url) {
        showToast("Picture upload failed. Please try again.", "error");
        setLogoFile(null);
        return;
      }

      setLogoFileKey(uploaded.file_key);
      setLogoFileUrl(uploaded.public_url);
      setLogoProgress(100);
      showToast("Picture uploaded successfully.", "success");
    } catch (err: any) {
      showToast(err?.message || "Picture upload failed.", "error");
      setLogoFile(null);
    } finally {
      setLogoUploading(false);
    }
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

  const isFormValid = () =>
    formData.name.trim() !== "" &&
    formData.nationality.trim() !== "" &&
    formData.main_location.trim() !== "" &&
    formData.phone_number.trim() !== "" &&
    formData.selectedServices.length > 0 &&
    formData.selectedLanguages.length > 0 &&
    formData.selectedUniversities.length > 0 &&
    !logoUploading;

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.nationality) newErrors.nationality = "Nationality is required";
    if (!formData.phone_number) newErrors.phone_number = "Phone number is required";
    if (!formData.main_location) newErrors.main_location = "Location is required";
    if (!formData.selectedServices.length) newErrors.selectedServices = "Please select at least one service";
    if (!formData.selectedLanguages.length) newErrors.selectedLanguages = "Please select at least one language";
    if (!formData.selectedUniversities.length) newErrors.selectedUniversities = "Please select at least one university";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      name: formData.name,
      picture_file_key: logoFileKey,
      picture_file_url: logoFileUrl,
      nationality: formData.nationality,
      main_location: formData.main_location,
      phone_number: formData.phone_number,
      whatsapp: formData.whatsapp,
      is_active: formData.is_active,
      packages_offered: formData.packages_offered,
      university_ids: formData.selectedUniversities,
      services: formData.selectedServices,
      language_ids: formData.selectedLanguages,
    };

    try {
      await createLogisticsProvider(payload);
      showToast("Logistics provider created successfully", "success");

      setFormData({
        name: "",
        nationality: "",
        main_location: "",
        phone_number: "",
        whatsapp: "",
        is_active: true,
        packages_offered: [],
        selectedServices: [],
        selectedLanguages: [],
        selectedUniversities: [],
        selectedLocations: [],
      });
      setLogoFile(null);
      setLogoFileKey("");
      setLogoFileUrl("");
      setErrors({});

      setTimeout(() => { router.push("/admin/logistical-service"); }, 1500);
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Please try again.";
      showToast(`Failed to create logistics provider. ${backendMessage}`, "error");
    }
  };

  if (loadingLogisticServices || loadingLogisticLanguage || loadingLogisticUniversity) {
    return (
      <section className="mx-auto mt-5 max-w-5xl">
        <div className="rounded-lg border border-slate-200 bg-card p-6">
          <Loading text="Fetching Logistic Services data..." />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-5 max-w-5xl">
      <div className="mt-6 rounded-md border bg-white">

        <div className="flex items-center gap-4 rounded-t-xl border-b px-6 py-5">
          <div className="shrink-0">
            <ImageUploadField
              label=""
              field="picture"
              imageOnly
              simpleFile={logoFile}
              onSimpleFileChange={handleLogoSelect}
              onSimpleRemove={() => { setLogoFile(null); setLogoFileKey(""); setLogoFileUrl(""); }}
              simpleUploading={logoUploading}
              simpleProgress={logoProgress}
              errors={{}}
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Register Logistics Provider</h3>
            <p className="text-sm text-slate-500">Fill in the required details to register a new logistics service provider</p>
            {logoFile && !logoUploading && (
              <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                Picture ready — save to apply
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-3 px-6 py-5 md:grid-cols-2">
          <InputField
            label="Provider Name"
            field="name"
            placeholder="e.g. FastTrack Logistics"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <SearchableDropdown
            label="Nationality"
            field="nationality"
            options={NATIONALITIES.map(c => ({ label: c.name, value: c.name }))}
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <SearchableDropdown
            label="Current Address"
            field="main_location"
            options={states.map((u) => ({ value: u.name, label: u.name }))}
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <InputField
            label="Primary Contact Number"
            field="phone_number"
            placeholder="e.g. +60 12 345 6789"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <InputField
            label="WhatsApp Contact"
            field="whatsapp"
            placeholder="e.g. +60 12 345 6789"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        </div>

        <div className="px-6 pb-5">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-900">Packages Offered</h4>
            <Button
              icon={<Plus className="h-5 w-5" />}
              text="Add Package"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
              onClick={addPackage}
            />
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
                <button
                  type="button"
                  onClick={() => removePackage(index)}
                  className="flex items-center gap-2 rounded-full border border-red-600 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-700 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-x-3 md:grid-cols-2">
                <InputField
                  label="Package Name"
                  field="name"
                  placeholder="e.g. Basic Package"
                  required
                  formData={{ name: pkg.name }}
                  errors={{}}
                  updateFormData={(_: string, value: string) => updatePackage(index, "name", value)}
                />
                <InputField
                  label="Price (RM)"
                  field="price"
                  type="number"
                  formData={{ price: pkg.price }}
                  errors={{}}
                  updateFormData={(_: string, value: string) => updatePackage(index, "price", Number(value))}
                />
              </div>

              <InputField
                label="Description"
                field="description"
                placeholder="e.g. description"
                formData={{ description: pkg.description }}
                errors={{}}
                updateFormData={(_: string, value: string) => updatePackage(index, "description", value)}
              />

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">Includes</label>
                <div className="space-y-2">
                  {pkg.includes.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...pkg.includes];
                          updated[i] = e.target.value;
                          updatePackage(index, "includes", updated);
                        }}
                        className="flex-1 px-2 py-1 text-sm focus:outline-none"
                        placeholder={`Include item ${i + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = pkg.includes.filter((_, idx) => idx !== i);
                          updatePackage(index, "includes", updated);
                        }}
                        className="flex items-center justify-center rounded-full border border-red-600 p-1 text-red-600 transition hover:border-red-700 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    icon={<Plus className="h-4 w-4" />}
                    text="Add Item"
                    bgColor="bg-green-50"
                    textColor="text-green-700"
                    borderColor="border-green-600"
                    hoverTextColor="hover:text-green-800"
                    hoverBorderColor="hover:border-green-700"
                    onClick={() => updatePackage(index, "includes", [...pkg.includes, ""])}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t px-6 py-5">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-900">
              Logistic Services <span className="text-red-600">*</span>
            </label>
            <Button
              icon={<Plus className="h-4 w-4" />}
              text="New Service"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
              onClick={() => setIsCreateServiceOpen(true)}
            />
          </div>

          {errors.selectedServices && (
            <p className="mb-2 text-xs font-medium text-red-600">{errors.selectedServices}</p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {logisticServices.map((svc) => {
              const selected = formData.selectedServices.find((s) => s.service_id === svc.id);
              return (
                <div
                  key={svc.id}
                  className={`rounded-lg border p-4 transition ${selected ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white"}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`svc-${svc.id}`}
                      checked={!!selected}
                      onChange={() => toggleService(svc.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <label htmlFor={`svc-${svc.id}`} className="flex-1 cursor-pointer text-sm font-medium text-slate-800">
                      {svc.name}
                    </label>
                  </div>

                  {selected && (
                    <div className="mt-3">
                      <label className="mb-1 block text-xs font-medium text-slate-600">Price (RM)</label>
                      <input
                        type="number"
                        min={0}
                        value={selected.price}
                        onChange={(e) => updateServicePrice(svc.id, Number(e.target.value))}
                        className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-3 px-6 py-5">
          <CheckBoxGroup
            label="Languages"
            field="selectedLanguages"
            options={logisticLanguages}
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            required
          />

          <CheckSimpleBoxGroup
            label="Universities"
            field="selectedUniversities"
            options={logisticUniversities}
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            required
          />

        </div>

        {errorCreateLogisticsProvider && (
          <p className="px-6 text-sm text-red-600">{errorCreateLogisticsProvider}</p>
        )}

        <div className="flex justify-end rounded-b-xl border-t px-6 py-5">
          <Button
            icon={<Truck className="h-5 w-5" />}
            text={loadingCreateLogisticsProvider ? "Creating..." : "Create Service"}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
            onClick={handleSubmit}
            disabled={loadingCreateLogisticsProvider || !isFormValid()}
          />
        </div>

      </div>

      <CreateLogisticServicePopup
        isOpen={isCreateServiceOpen}
        onClose={() => setIsCreateServiceOpen(false)}
        onCreated={refetchLogisticServices}
      />

    </section>
  );
}
