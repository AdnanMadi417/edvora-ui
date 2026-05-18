"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, Edit2, Pencil, Plus, Trash2, X } from "lucide-react";

import {
  useLogisticProviderDetails,
  useLogisticServices,
  useLogisticLanguages,
  useLogisticUniversities,
  useEditLogisticProvider,
  useEditLogisticService,
} from "features/logistical-service/hooks";
import { useAllStates } from "hooks/knowledge-hub/programs/useStates";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";
import { getDocumentDownloadUrl } from "services/documentService";
import type { PackageOffered, ServiceEntry } from "features/logistical-service/types";

import EmptyData from "components/emptyData/EmptyData";
import CheckSimpleBoxGroup from "components/form/CheckSimpleBoxGroup";
import InputField from "components/form/InputField";
import SelectField from "components/form/SelectField";
import SearchableDropdown from "components/form/search/SearchableDropdown";
import ImageUploadField from "components/form/images/ImageUploadField";
import Button from "components/ui/buttons/Button";
import { useToast } from "components/context/ToastContext";
import { NATIONALITIES } from "constants/lists";

interface Props {
  id: string;
}

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
  selectedLocations: string[];
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const EditMarketplaceDetails = ({ id }: Props) => {
  const router = useRouter();
  const { showToast } = useToast();

  const { service, errorService } = useLogisticProviderDetails(id);
  const { logisticServices } = useLogisticServices();
  const { states } = useAllStates();
  const { logisticLanguages } = useLogisticLanguages();
  const { logisticUniversities } = useLogisticUniversities();
  const { editLogisticsProvider, loadingEditLogisticsProvider, errorEditLogisticsProvider } = useEditLogisticProvider();
  const { editLogisticService, loadingEditLogisticService } = useEditLogisticService();

  const [initialFormData, setInitialFormData] = useState<FormData | null>(null);
  const [initialLogoKey, setInitialLogoKey] = useState("");
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingServiceName, setEditingServiceName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [logoFileKey, setLogoFileKey] = useState("");
  const [logoFileUrl, setLogoFileUrl] = useState("");
  const [existingLogoUrl, setExistingLogoUrl] = useState("");
  const [existingLogoKey, setExistingLogoKey] = useState("");

  const [formData, setFormData] = useState<FormData>({
    name: "", nationality: "", main_location: "", phone_number: "", whatsapp: "",
    is_active: true, packages_offered: [], selectedServices: [],
    selectedLanguages: [], selectedUniversities: [], selectedLocations: [],
  });

  useEffect(() => {
    if (!service || !logisticServices.length || !logisticLanguages.length || !logisticUniversities.length) return;

    setExistingLogoKey(service.picture_file_key || "");
    setInitialLogoKey(service.picture_file_key || "");
    if (service.picture_file_key) {
      getDocumentDownloadUrl(service.picture_file_key)
        .then(setExistingLogoUrl)
        .catch(() => setExistingLogoUrl(""));
    }

    const initial: FormData = {
      name: service.name || "",
      nationality: service.nationality || "",
      main_location: service.main_location || "",
      phone_number: service.phone_number || "",
      whatsapp: service.whatsapp || "",
      is_active: service.is_active ?? true,
      packages_offered: service.packages_offered || [],
      selectedServices: (service.services_offered || []).map((srv) => ({
        service_id: srv.id,
        price: srv.price ?? 0,
      })),
      selectedLanguages: service.languages
        .map((lang) => logisticLanguages.find((l) => l.name === lang)?.id)
        .filter(Boolean) as string[],
      selectedUniversities: service.universities_served
        .map((uni) => logisticUniversities.find((u) => u.name === uni)?.id)
        .filter(Boolean) as string[],
      selectedLocations: service.service_locations
        .map((loc) => states.find((l) => l.name === loc)?.id)
        .filter(Boolean) as string[],
    };

    setFormData(initial);
    setInitialFormData(initial);
  }, [service, logisticServices, logisticLanguages, logisticUniversities, states]);

  const isChanged =
    !initialFormData ||
    JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
    logoFile !== null ||
    existingLogoKey !== initialLogoKey;

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
      const results = await uploadFilesToSpaces([file], presigned, (_, pct) => setLogoProgress(pct));
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

  const startEditService = (id: string, name: string) => {
    setEditingServiceId(id);
    setEditingServiceName(name);
  };

  const cancelEditService = () => {
    setEditingServiceId(null);
    setEditingServiceName("");
  };

  const saveEditService = async (serviceId: string) => {
    if (!editingServiceName.trim()) return;
    try {
      await editLogisticService(serviceId, { name: editingServiceName.trim() });
      showToast("Service name updated.", "success");
      setEditingServiceId(null);
      setEditingServiceName("");
      setTimeout(() => location.reload(), 1500);
    } catch {
      showToast("Failed to update service name.", "error");
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

  const handleSubmit = async () => {
    if (!service) return;
    if (logoUploading) {
      showToast("Please wait for the picture to finish uploading.", "error");
      return;
    }

    const newErrors: FormErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.nationality) newErrors.nationality = "Nationality is required";
    if (!formData.main_location) newErrors.main_location = "Location is required";
    if (!formData.phone_number) newErrors.phone_number = "Phone number is required";
    if (!formData.selectedServices.length) newErrors.selectedServices = "Please select at least one service";
    if (!formData.selectedLanguages.length) newErrors.selectedLanguages = "Please select at least one language";
    if (!formData.selectedUniversities.length) newErrors.selectedUniversities = "Please select at least one university";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const picture_file_key = logoFile ? logoFileKey : existingLogoKey;
    const picture_file_url = logoFile ? logoFileUrl : existingLogoUrl;

    const payload = {
      name: formData.name,
      picture_file_key,
      picture_file_url,
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
      await editLogisticsProvider(service.id, payload);
      showToast("Logistics provider updated successfully", "success");
      setTimeout(() => { router.push("/admin/logistical-service/"); }, 1500);
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Please try again.";
      showToast(`Update failed. ${backendMessage}`, "error");
    }
  };

  if (errorService) return <EmptyData />;

  return (
    <div className="mt-6 max-w-5xl mx-auto">
      <div className="rounded-md border border-default bg-card shadow-sm">
        <div className="flex justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-4">
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
                existingUrl={existingLogoUrl}
                onExistingRemove={() => { setExistingLogoUrl(""); setExistingLogoKey(""); }}
                errors={{}}
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-900">Edit Logistical Service Provider</h3>
              <p className="mt-1 text-sm text-slate-500">Modify provider information and service coverage</p>
              {logoFile && !logoUploading && (
                <span className="mt-1 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                  Picture ready — click Update Service
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <button
              onClick={() => router.push("/admin/logistical-service/")}
              className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Back to services</span>
            </button>
          </div>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div className="grid grid-cols-1 gap-x-3">
            <InputField label="Provider Name" field="name" placeholder={service?.name} required formData={formData} errors={errors} updateFormData={updateFormData} />
            <SearchableDropdown label="Nationality" field="nationality" options={NATIONALITIES.map((c) => ({ label: c.name, value: c.name }))} formData={formData} errors={errors} updateFormData={updateFormData} />
            <SelectField label="Current Residence" field="main_location" options={states.map((u) => ({ value: u.name, label: u.name }))} formData={formData} errors={errors} updateFormData={updateFormData} />
            <InputField label="Primary Contact Number" field="phone_number" placeholder="e.g. +60 12 345 6789" required formData={formData} errors={errors} updateFormData={updateFormData} />
            <InputField label="WhatsApp Contact" field="whatsapp" placeholder="e.g. +60 12 345 6789" required formData={formData} errors={errors} updateFormData={updateFormData} />

            <label className={`group relative flex cursor-pointer items-center justify-between rounded-md border px-4 py-4 transition-all ${formData.is_active ? "border-blue-600 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-800">Active</span>
                <span className="text-xs text-slate-400">{formData.is_active ? "Active" : "Inactive"}</span>
              </div>
              <div className="relative">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => updateFormData("is_active", e.target.checked)} className="peer sr-only" />
                <div className="h-6 w-11 rounded-md bg-slate-300 transition-colors peer-checked:bg-blue-600" />
                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-md bg-white shadow transition-transform peer-checked:translate-x-5" />
              </div>
              {formData.is_active && <span className="absolute right-3 top-3 h-2 w-2 rounded-md bg-blue-600" />}
            </label>
          </div>

          <div>
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
                  <button type="button" onClick={() => removePackage(index)} className="flex items-center gap-2 rounded-md border border-red-600 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-700 hover:text-red-700">
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-x-3 md:grid-cols-2">
                  <InputField label="Package Name" field="name" required formData={{ name: pkg.name }} errors={{}} updateFormData={(_: string, value: string) => updatePackage(index, "name", value)} />
                  <InputField label="Price (RM)" field="price" type="number" formData={{ price: pkg.price }} errors={{}} updateFormData={(_: string, value: string) => updatePackage(index, "price", Number(value))} />
                </div>
                <InputField label="Description" field="description" formData={{ description: pkg.description }} errors={{}} updateFormData={(_: string, value: string) => updatePackage(index, "description", value)} />
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Includes</label>
                  <div className="space-y-2">
                    {pkg.includes.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
                        <input type="text" value={item} onChange={(e) => { const updated = [...pkg.includes]; updated[i] = e.target.value; updatePackage(index, "includes", updated); }} className="flex-1 px-2 py-1 text-sm focus:outline-none" placeholder={`Include item ${i + 1}`} />
                        <button type="button" onClick={() => updatePackage(index, "includes", pkg.includes.filter((_, idx) => idx !== i))} className="flex items-center justify-center rounded-md border border-red-600 p-1 text-red-600 transition hover:border-red-700">
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

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-slate-900">
                  Logistic Services <span className="text-red-600">*</span>
                </label>
                <p className="mt-0.5 text-xs text-slate-500">Select services, set prices, and rename types</p>
              </div>
            </div>
            {errors.selectedServices && <p className="mb-2 text-xs font-medium text-red-600">{errors.selectedServices}</p>}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {logisticServices.map((svc) => {
                const selected = formData.selectedServices.find((s) => s.service_id === svc.id);
                return (
                  <div key={svc.id} className={`rounded-xl border p-4 transition-all ${selected ? "border-amber-400 bg-amber-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <label htmlFor={`svc-${svc.id}`} className="flex cursor-pointer items-center gap-2.5">
                        <input type="checkbox" id={`svc-${svc.id}`} checked={!!selected} onChange={() => toggleService(svc.id)} className="h-4 w-4 shrink-0 rounded border-slate-300 text-amber-600" />
                        {editingServiceId === svc.id ? (
                          <div className="flex items-center gap-1.5">
                            <input type="text" value={editingServiceName} onChange={(e) => setEditingServiceName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") saveEditService(svc.id); if (e.key === "Escape") cancelEditService(); }} autoFocus className="w-32 rounded-md border border-blue-400 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <button onClick={() => saveEditService(svc.id)} disabled={loadingEditLogisticService} aria-label="Save" className="flex items-center justify-center rounded-md border border-green-500 p-1 text-green-600 transition hover:bg-green-50 disabled:opacity-50"><Check className="h-3.5 w-3.5" /></button>
                            <button onClick={cancelEditService} aria-label="Cancel" className="flex items-center justify-center rounded-md border border-slate-300 p-1 text-slate-500 transition hover:bg-slate-50"><X className="h-3.5 w-3.5" /></button>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-slate-800">{svc.name}</span>
                        )}
                      </label>
                      {editingServiceId !== svc.id && (
                        <button onClick={() => startEditService(svc.id, svc.name)} aria-label="Rename" className="shrink-0 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    {selected && (
                      <div className="mt-3 flex items-center overflow-hidden rounded-lg border border-amber-200 focus-within:border-amber-400">
                        <span className="border-r border-amber-200 bg-amber-100 px-2.5 py-1.5 text-xs font-semibold text-amber-700">RM</span>
                        <input type="number" min={0} value={selected.price} onChange={(e) => updateServicePrice(svc.id, Number(e.target.value))} className="flex-1 bg-transparent px-2.5 py-1.5 text-sm focus:outline-none" placeholder="0.00" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-3">
            <CheckSimpleBoxGroup label="Languages" field="selectedLanguages" options={logisticLanguages} formData={formData} updateFormData={updateFormData} errors={errors} required />
            <CheckSimpleBoxGroup label="Universities" field="selectedUniversities" options={logisticUniversities} formData={formData} updateFormData={updateFormData} errors={errors} required />
          </div>

          {errorEditLogisticsProvider && <p className="text-sm text-red-600">{errorEditLogisticsProvider}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-5">
          <Button onClick={() => router.push("/admin/logistical-service/")} icon={<X className="h-5 w-5" />} text="Cancel" bgColor="bg-slate-50" textColor="text-slate-700" borderColor="border-slate-600" hoverTextColor="hover:text-slate-800" hoverBorderColor="hover:border-slate-700" />
          <Button icon={<Edit2 className="h-5 w-5" />} text={loadingEditLogisticsProvider ? "Updating..." : "Update Service"} bgColor="bg-amber-50" textColor="text-amber-700" borderColor="border-amber-600" hoverTextColor="hover:text-amber-800" hoverBorderColor="hover:border-amber-700" onClick={handleSubmit} disabled={loadingEditLogisticsProvider || logoUploading || !isChanged} />
        </div>
      </div>
    </div>
  );
};

export default EditMarketplaceDetails;
