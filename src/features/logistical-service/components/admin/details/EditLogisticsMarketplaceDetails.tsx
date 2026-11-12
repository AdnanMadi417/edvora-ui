"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Globe, ListChecks, Package, Pencil, Plus, Trash2, Truck, X } from "lucide-react";

import {
  useLogisticProviderDetails,
  useLogisticServices,
  useLogisticLanguages,
  useLogisticUniversities,
  useEditLogisticProvider,
  useEditLogisticService,
} from "features/logistical-service/hooks";
import { useStates as useAllStates } from "features/programs/hooks";
import {
  getPresignedUploads,
  uploadFilesToSpaces,
} from "services/uploadService";
import { getDocumentDownloadUrl } from "services/documentService";
import type {
  PackageOffered,
  ServiceEntry,
} from "features/logistical-service/types";

import FormPage from "components/ub/forms/layout/FormPage";
import Loading from "components/ub/feedback/states/Loading";
import ToggleInput from "components/ub/forms/choices/ToggleInput";
import CheckSimpleBoxGroup from "components/ub/forms/choices/CheckSimpleBoxGroup";
import InputField from "components/ub/forms/text/InputField";
import SelectField from "components/ub/forms/selection/SelectField";
import SearchableDropdown from "components/ub/forms/selection/SearchableDropdown";
import ImageUpload from "components/ub/forms/uploads/ImageUpload";
import Button from "components/ub/core/buttons/Button";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { NATIONALITIES } from "constants/lists";
import { fieldGroup } from "components/ub/recipes";
import CollapsibleSection from "components/ub/forms/layout/CollapsibleSection";
import { fieldControl } from "components/ub/recipes";
import Checkbox from "components/ub/forms/choices/Checkbox";

type SectionKey = "details" | "packages" | "services" | "coverage";
/** Which section holds a validation error key. */
const sectionOf = (key: string): SectionKey =>
  key.startsWith("packages_offered") ? "packages"
  : key === "selectedServices" ? "services"
  : key === "selectedLanguages" || key === "selectedUniversities" ? "coverage"
  : "details";

interface Props {
  id: string;
  /** Where a successful save navigates to. Defaults to this provider's admin details page. */
  redirectPath?: string;
  /** Where "Back" and "Cancel" navigate to. Defaults to the admin logistics marketplace list. */
  listPath?: string;
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

type FormErrors = Record<string, string>;

const EditLogisticsMarketplaceDetails = ({
  id,
  redirectPath = `/admin/logistics-marketplace/${id}`,
  listPath = "/admin/logistics-marketplace",
}: Props) => {
  const router = useRouter();
  const { showToast } = useToast();

  const { service, loadingService, errorService } =
    useLogisticProviderDetails(id);
  const {
    logisticServices,
    loadingLogisticServices,
    errorLogisticServices,
    refetchLogisticServices,
  } = useLogisticServices();
  const { states, stateLoading, stateError } = useAllStates();
  const { logisticLanguages, loadingLogisticLanguage, errorLogisticLanguage } =
    useLogisticLanguages();
  const {
    logisticUniversities,
    loadingLogisticUniversity,
    errorLogisticUniversity,
  } = useLogisticUniversities();
  const {
    editLogisticsProvider,
    loadingEditLogisticsProvider,
    errorEditLogisticsProvider,
  } = useEditLogisticProvider();
  const { editLogisticService, loadingEditLogisticService } =
    useEditLogisticService();

  const [initialFormData, setInitialFormData] = useState<FormData | null>(null);
  const [initialLogoKey, setInitialLogoKey] = useState("");
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingServiceName, setEditingServiceName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  // Only the first section starts open; the rest show a summary and open on click or on error.
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    details: true, packages: false, services: false, coverage: false,
  });
  const toggleSection = (key: SectionKey) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  const sectionHasError = (key: SectionKey) => Object.entries(errors).some(([k, v]) => v && sectionOf(k) === key);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [logoFileKey, setLogoFileKey] = useState("");
  const [logoFileUrl, setLogoFileUrl] = useState("");
  const [existingLogoUrl, setExistingLogoUrl] = useState("");
  const [existingLogoKey, setExistingLogoKey] = useState("");

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

  const initializedProvider = useRef<string | null>(null);

  useEffect(() => {
    if (
      !service ||
      loadingLogisticServices ||
      loadingLogisticLanguage ||
      loadingLogisticUniversity ||
      stateLoading
    )
      return;

    if (initializedProvider.current === service.id) return;
    initializedProvider.current = service.id;
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
  }, [
    service,
    logisticServices,
    logisticLanguages,
    logisticUniversities,
    states,
    loadingLogisticServices,
    loadingLogisticLanguage,
    loadingLogisticUniversity,
    stateLoading,
  ]);

  const isChanged =
    !initialFormData ||
    JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
    logoFile !== null ||
    existingLogoKey !== initialLogoKey;

  const validateField = (field: string, value: string) => {
    let error = "";
    if (field === "name") {
      if (!value.trim()) error = "Name is required";
      else if (value.trim().length < 5)
        error = "Name must be at least 5 characters";
      else if (value.trim().length > 255)
        error = "Name must not exceed 255 characters";
    } else if (field === "phone_number") {
      if (!value.trim()) error = "Phone number is required";
      else if (value.trim().length > 50)
        error = "Phone number must not exceed 50 characters";
    } else if (field === "whatsapp") {
      if (value.trim().length > 50)
        error = "WhatsApp number must not exceed 50 characters";
    } else if (field.endsWith(".name")) {
      if (!value.trim()) error = "Package name is required";
      else if (value.trim().length < 5)
        error = "Package name must be at least 5 characters";
      else if (value.trim().length > 255)
        error = "Package name must not exceed 255 characters";
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const updateFormData = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleLogoSelect = async (file: File) => {
    setLogoFile(file);
    setLogoUploading(true);
    setLogoProgress(0);
    setLogoFileKey("");
    setLogoFileUrl("");

    try {
      const presigned = await getPresignedUploads(
        [file],
        "logistic-provider-pictures"
      );
      const results = await uploadFilesToSpaces([file], presigned, (_, pct) =>
        setLogoProgress(pct)
      );
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
    } catch (err: unknown) {
      showToast(parseApiError(err, "Picture upload failed."), "error");
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
      refetchLogisticServices();
    } catch (err: unknown) {
      showToast(parseApiError(err, "Failed to update service name."), "error");
    }
  };

  const toggleService = (serviceId: string) => {
    setFormData((prev) => {
      const exists = prev.selectedServices.find(
        (s) => s.service_id === serviceId
      );
      if (exists) {
        return {
          ...prev,
          selectedServices: prev.selectedServices.filter(
            (s) => s.service_id !== serviceId
          ),
        };
      }
      return {
        ...prev,
        selectedServices: [
          ...prev.selectedServices,
          { service_id: serviceId, price: 0 },
        ],
      };
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
      packages_offered: [
        ...prev.packages_offered,
        { name: "", description: "", price: 0, includes: [] },
      ],
    }));
  };

  const updatePackage = (
    index: number,
    field: keyof PackageOffered,
    value: any
  ) => {
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

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 5) {
      newErrors.name = "Name must be at least 5 characters";
    } else if (formData.name.trim().length > 255) {
      newErrors.name = "Name must not exceed 255 characters";
    }
    if (!formData.nationality.trim()) {
      newErrors.nationality = "Nationality is required";
    } else if (formData.nationality.trim().length > 100) {
      newErrors.nationality = "Nationality must not exceed 100 characters";
    }
    if (!formData.main_location.trim()) {
      newErrors.main_location = "Location is required";
    } else if (formData.main_location.trim().length > 255) {
      newErrors.main_location = "Location must not exceed 255 characters";
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (formData.phone_number.trim().length > 50) {
      newErrors.phone_number = "Phone number must not exceed 50 characters";
    }
    if (formData.whatsapp.trim().length > 50) {
      newErrors.whatsapp = "WhatsApp number must not exceed 50 characters";
    }
    formData.packages_offered.forEach((pkg, i) => {
      if (!pkg.name.trim()) {
        newErrors[`packages_offered[${i}].name`] = "Package name is required";
      } else if (pkg.name.trim().length < 5) {
        newErrors[`packages_offered[${i}].name`] =
          "Package name must be at least 5 characters";
      } else if (pkg.name.trim().length > 255) {
        newErrors[`packages_offered[${i}].name`] =
          "Package name must not exceed 255 characters";
      }
    });
    if (!formData.selectedServices.length)
      newErrors.selectedServices = "Please select at least one service";
    if (!formData.selectedLanguages.length)
      newErrors.selectedLanguages = "Please select at least one language";
    if (!formData.selectedUniversities.length)
      newErrors.selectedUniversities = "Please select at least one university";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const withErrors = Object.keys(newErrors).map(sectionOf);
      setOpenSections((prev) => ({ ...prev, ...Object.fromEntries(withErrors.map((k) => [k, true])) }));
      return;
    }

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
      router.push(redirectPath);
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Update failed. ${backendMessage}`, "error");
    }
  };

  const loading =
    loadingService ||
    loadingLogisticServices ||
    loadingLogisticLanguage ||
    loadingLogisticUniversity ||
    stateLoading;
  const loadError =
    errorService ||
    errorLogisticServices ||
    errorLogisticLanguage ||
    errorLogisticUniversity ||
    stateError;
  if (loading)
    return <Loading text="Loading provider and service options..." />;
  if (loadError)
    return (
      <p role="alert" className="p-6">
        {loadError}
      </p>
    );
  if (!service) return <p className="p-6">Provider not found.</p>;
  return (
    <FormPage
      title="Edit logistics provider"
      description="Update contact details, services, coverage, and packages."
      icon={Truck}
      onSubmit={handleSubmit}
      onCancel={() => router.push(listPath)}
      submitLabel="Save changes"
      submitting={loadingEditLogisticsProvider}
      submitDisabled={logoUploading || !isChanged || !initialFormData}
      cancelDisabled={logoUploading}
      stickyActions
    >
      <div className="min-w-0 space-y-4">
        <CollapsibleSection
          icon={Truck}
          title="Provider details"
          summary={[formData.name, formData.main_location].filter(Boolean).join(" · ") || "Not started"}
          hasError={sectionHasError("details")}
          open={openSections.details}
          onToggle={() => toggleSection("details")}
        >
        <ImageUpload
          label="Provider picture"
          id="picture"
          file={logoFile}
          onFileChange={handleLogoSelect}
          onRemove={() => {
            setLogoFile(null);
            setLogoFileKey("");
            setLogoFileUrl("");
          }}
          uploading={logoUploading}
          progress={logoProgress}
          existingUrl={existingLogoUrl}
          onExistingRemove={() => {
            setExistingLogoUrl("");
            setExistingLogoKey("");
          }}

        />
        <div className="grid grid-cols-1 gap-x-3">
          <InputField
            label="Provider name"
            field="name"
            placeholder={service?.name}
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            onBlur={() => validateField("name", formData.name)}
          />
          <SearchableDropdown
            label="Nationality"
            field="nationality"
            options={NATIONALITIES.map((c) => ({
              label: c.name,
              value: c.name,
            }))}
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
          <SelectField
            label="Current residence"
            field="main_location"
            options={states.map((u) => ({ value: u.name, label: u.name }))}
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
          <InputField
            label="Primary contact number"
            field="phone_number"
            placeholder="e.g. +60 12 345 6789"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            onBlur={() => validateField("phone_number", formData.phone_number)}
          />
          <InputField
            label="WhatsApp Contact"
            field="whatsapp"
            placeholder="e.g. +60 12 345 6789"
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            onBlur={() => validateField("whatsapp", formData.whatsapp)}
          />

          <ToggleInput
            label="Provider status"
            field="is_active"
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            enabledText="Active"
            disabledText="Inactive"
            enabledDescription="This provider is available in the marketplace."
            disabledDescription="This provider is inactive."
          />
        </div>

        </CollapsibleSection>

        <CollapsibleSection
          icon={Package}
          title="Packages"
          summary={formData.packages_offered.length ? `${formData.packages_offered.length} package${formData.packages_offered.length === 1 ? "" : "s"}` : "No packages"}
          hasError={sectionHasError("packages")}
          open={openSections.packages}
          onToggle={() => toggleSection("packages")}
        >
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-ub-body-sm text-ub-text-secondary">
              Services sold together for one price.
            </p>
            <Button
              icon={<Plus className="h-5 w-5" />}
              text="Add package"
              variant="secondary"
              onClick={addPackage}
            />
          </div>

          {formData.packages_offered.length === 0 && (
            <div className="mb-3 rounded-md border border-dashed border-ub-border bg-ub-surface-subtle p-6 text-center">
              <p className="text-sm font-medium text-ub-text-secondary">
                No packages added yet
              </p>
              <p className="mt-1 text-xs text-ub-text-tertiary">
                Add a package to get started
              </p>
            </div>
          )}

          {formData.packages_offered.map((pkg, index) => (
            <div key={index} className="mb-6 rounded-md border border-ub-border bg-ub-surface p-5">
              <div className="mb-4 flex items-center justify-between">
                <h5 className="font-medium text-ub-text-primary">
                  Package {index + 1}
                </h5>
                <Button
                  type="button"
                  onClick={() => removePackage(index)}
                  icon={<Trash2 className="h-4 w-4" />}
                  text="Remove"
                  variant="secondary"
                />
              </div>
              <div className="grid grid-cols-1 gap-x-3 md:grid-cols-2">
                <InputField
                  label="Package name"
                  field="name"
                  required
                  formData={{ name: pkg.name }}
                  errors={{
                    name: errors[`packages_offered[${index}].name`] || "",
                  }}
                  updateFormData={(_: string, value: string) => {
                    updatePackage(index, "name", value);
                    setErrors((prev) => ({
                      ...prev,
                      [`packages_offered[${index}].name`]: "",
                    }));
                  }}
                  onBlur={() =>
                    validateField(
                      `packages_offered[${index}].name`,
                      formData.packages_offered[index].name
                    )
                  }
                />
                <InputField
                  label="Price (RM)"
                  field="price"
                  type="number"
                  formData={{ price: pkg.price }}
                  errors={{}}
                  updateFormData={(_: string, value: string) =>
                    updatePackage(index, "price", Number(value))
                  }
                />
              </div>
              <InputField
                label="Description"
                field="description"
                formData={{ description: pkg.description }}
                errors={{}}
                updateFormData={(_: string, value: string) =>
                  updatePackage(index, "description", value)
                }
              />
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-ub-text-secondary">
                  Includes
                </label>
                <div className="space-y-2">
                  {pkg.includes.map((item, i) => (
                    <div
                      key={i}
                      className={`${fieldGroup} flex min-h-[50px] items-center gap-2 ps-[17px] pe-2`}
                    >
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...pkg.includes];
                          updated[i] = e.target.value;
                          updatePackage(index, "includes", updated);
                        }}
                        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--ub-field-placeholder)]"
                        placeholder={`Include item ${i + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updatePackage(
                            index,
                            "includes",
                            pkg.includes.filter((_, idx) => idx !== i)
                          )
                        }
                        aria-label={`Remove included item ${i + 1}`}
                                  className="flex items-center justify-center rounded-ub-full border border-ub-tone-danger-border p-1 text-ub-tone-danger-text transition hover:border-ub-tone-danger-text"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    icon={<Plus className="h-4 w-4" />}
                    text="Add item"
                    variant="secondary"
                    onClick={() =>
                      updatePackage(index, "includes", [...pkg.includes, ""])
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        </CollapsibleSection>

        <CollapsibleSection
          icon={ListChecks}
          title="Services and prices"
          summary={`${formData.selectedServices.length} service${formData.selectedServices.length === 1 ? "" : "s"} selected`}
          hasError={sectionHasError("services")}
          open={openSections.services}
          onToggle={() => toggleSection("services")}
        >
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-ub-text-primary">
                Logistic services <span className="text-ub-tone-danger-text">*</span>
              </label>
              <p className="mt-0.5 text-xs text-ub-text-secondary">
                Select services, set prices, and rename types
              </p>
            </div>
          </div>
          {errors.selectedServices && (
            <p className="mb-2 text-xs font-medium text-ub-tone-danger-text">
              {errors.selectedServices}
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {logisticServices.map((svc) => {
              const selected = formData.selectedServices.find(
                (s) => s.service_id === svc.id
              );
              return (
                <div
                  key={svc.id}
                  className={`rounded-xl border p-4 transition-all ${
                    selected
                      ? "border-ub-tone-warning-border bg-ub-tone-warning-bg shadow-sm"
                      : "border-ub-border bg-ub-surface hover:border-ub-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <label
                      htmlFor={`svc-${svc.id}`}
                      className="-my-1 flex cursor-pointer items-center gap-2.5 py-1"
                    >
                      <Checkbox
                        id={`svc-${svc.id}`}
                        checked={!!selected}
                        onChange={() => toggleService(svc.id)}
                      />
                      {editingServiceId === svc.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingServiceName}
                            onChange={(e) =>
                              setEditingServiceName(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEditService(svc.id);
                              if (e.key === "Escape") cancelEditService();
                            }}
                            autoFocus
                            aria-label="Service name"
                            className={`${fieldControl} h-8 w-40 !px-3`}
                          />
                          <button
                            type="button"
                            onClick={() => saveEditService(svc.id)}
                            disabled={loadingEditLogisticService}
                            aria-label="Save"
                            className="flex items-center justify-center rounded-md border border-ub-tone-success-border p-1 text-ub-tone-success-text transition hover:bg-ub-tone-success-bg disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditService}
                            aria-label="Cancel"
                            className="flex items-center justify-center rounded-md border border-ub-border p-1 text-ub-text-secondary transition hover:bg-ub-surface-subtle"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-ub-text-primary">
                          {svc.name}
                        </span>
                      )}
                    </label>
                    {editingServiceId !== svc.id && (
                      <button
                        type="button"
                        onClick={() => startEditService(svc.id, svc.name)}
                        aria-label="Rename"
                        className="shrink-0 rounded-md p-1.5 text-ub-text-tertiary transition hover:bg-ub-surface-subtle hover:text-ub-text-secondary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {selected && (
                    <div className={`${fieldGroup} mt-3 flex h-10 items-center`}>
                      <span className="ps-4 pe-3 font-semibold text-ub-text-secondary">
                        RM
                      </span>
                      <span aria-hidden="true" className="h-5 w-px shrink-0 bg-[var(--ub-field-ring)]" />
                      <input
                        type="number"
                        min={0}
                        value={selected.price}
                        onChange={(e) =>
                          updateServicePrice(svc.id, Number(e.target.value))
                        }
                        className="min-w-0 flex-1 rounded-e-[33px] bg-transparent ps-3 pe-4 outline-none placeholder:text-[var(--ub-field-placeholder)]"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        </CollapsibleSection>

        <CollapsibleSection
          icon={Globe}
          title="Languages and universities"
          summary={`${formData.selectedLanguages.length} language${formData.selectedLanguages.length === 1 ? "" : "s"} · ${formData.selectedUniversities.length} universit${formData.selectedUniversities.length === 1 ? "y" : "ies"}`}
          hasError={sectionHasError("coverage")}
          open={openSections.coverage}
          onToggle={() => toggleSection("coverage")}
        >
        <div className="grid grid-cols-1 gap-x-3">
          <CheckSimpleBoxGroup
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

        </CollapsibleSection>

        {errorEditLogisticsProvider && (
          <p className="text-sm text-ub-tone-danger-text">{errorEditLogisticsProvider}</p>
        )}
      </div>
    </FormPage>
  );
};
export default EditLogisticsMarketplaceDetails;
