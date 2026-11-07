"use client";

import { Trash2, Truck, Plus } from "lucide-react";
import React, { useState } from "react";

import {
  useLogisticServices,
  useLogisticLanguages,
  useLogisticUniversities,
  useCreateLogisticProvider,
} from "features/logistical-service/hooks";
import { useStates as useAllStates } from "features/programs/hooks";
import {
  getPresignedUploads,
  uploadFilesToSpaces,
} from "services/uploadService";

import { NATIONALITIES } from "constants/lists";
import SearchableDropdown from "components/ub/forms/selection/SearchableDropdown";
import SteppedFormPage from "components/ub/forms/layout/SteppedFormPage";
import DescriptionList from "components/ub/data/display/DescriptionList";
import Alert from "components/ub/feedback/notifications/Alert";
import Loading from "components/ub/feedback/states/Loading";
import CheckBoxGroup from "components/ub/forms/choices/CheckBoxGroup";
import CheckSimpleBoxGroup from "components/ub/forms/choices/CheckSimpleBoxGroup";
import InputField from "components/ub/forms/text/InputField";
import ImageUploadField from "components/ub/forms/uploads/ImageUploadField";
import Button from "components/ub/core/buttons/Button";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { useRouter } from "next/navigation";
import CreateLogisticsMarketplacePopup from "features/logistical-service/service-types/components/admin/popups/CreateServiceType";
import type {
  PackageOffered,
  ServiceEntry,
} from "features/logistical-service/types";

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

interface Props {
  basePath?: string;
}

export default function RegisterLogisticsMarketplaceProvider({
  basePath = "/admin/logistics-marketplace",
}: Props = {}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
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
  const { logisticServices, loadingLogisticServices, refetchLogisticServices } =
    useLogisticServices();
  const { states } = useAllStates();
  const { logisticLanguages, loadingLogisticLanguage } = useLogisticLanguages();
  const { logisticUniversities, loadingLogisticUniversity } =
    useLogisticUniversities();
  const {
    createLogisticsProvider,
    loadingCreateLogisticsProvider,
    errorCreateLogisticsProvider,
  } = useCreateLogisticProvider();

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

  const validationErrors = () => {
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

    return newErrors;
  };

  const stepForField = (key: string) =>
    key.startsWith("packages_offered")
      ? 2
      : key === "selectedServices"
      ? 1
      : key === "selectedLanguages" || key === "selectedUniversities"
      ? 3
      : 0;
  const validateStep = (step: number) => {
    const stepErrors = Object.fromEntries(
      Object.entries(validationErrors()).filter(
        ([key]) => stepForField(key) === step
      )
    );
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (logoUploading) return;
    const newErrors = validationErrors();
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
      setTimeout(() => {
        router.push(basePath);
      }, 1500);
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(
        `Failed to create logistics provider. ${backendMessage}`,
        "error"
      );
    }
  };

  if (
    loadingLogisticServices ||
    loadingLogisticLanguage ||
    loadingLogisticUniversity
  ) {
    return (
      <section className="mx-auto mt-5 max-w-5xl">
        <div className="overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface p-6">
          <Loading text="Fetching Logistic Services data..." />
        </div>
      </section>
    );
  }

  return (
    <>
      <SteppedFormPage
        title="Register logistics provider"
        description="Build the provider profile, define services, and choose who they support."
        icon={Truck}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onCancel={() => router.push(basePath)}
        onSubmit={handleSubmit}
        submitLabel="Create provider"
        submitting={loadingCreateLogisticsProvider}
        navigationDisabled={logoUploading || isCreateServiceOpen}
        steps={[
          {
            id: "provider",
            label: "Provider",
            description: "Profile and contact details",
            validate: () => validateStep(0),
            content: (
              <div className="space-y-4">
                <ImageUploadField
                  label=""
                  field="picture"
                  imageOnly
                  simpleFile={logoFile}
                  onSimpleFileChange={handleLogoSelect}
                  onSimpleRemove={() => {
                    setLogoFile(null);
                    setLogoFileKey("");
                    setLogoFileUrl("");
                  }}
                  simpleUploading={logoUploading}
                  simpleProgress={logoProgress}
                  errors={{}}
                />{" "}
                <div className="grid gap-x-4 sm:grid-cols-2">
                  <InputField
                    label="Provider Name"
                    field="name"
                    placeholder="e.g. FastTrack Logistics"
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
                  <SearchableDropdown
                    label="State of Residence"
                    field="main_location"
                    options={states.map((u) => ({
                      value: u.name,
                      label: u.name,
                    }))}
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
                    onBlur={() =>
                      validateField("phone_number", formData.phone_number)
                    }
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
                </div>
              </div>
            ),
          },
          {
            id: "services",
            label: "Services",
            description: "Services and pricing",
            validate: () => validateStep(1),
            content: (
              <div className="space-y-4">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-semibold text-ub-text-primary">
                    Logistic Services{" "}
                    <span className="text-ub-tone-danger-text">*</span>
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
                        className={`rounded-lg border p-4 transition ${
                          selected
                            ? "border-blue-400 bg-blue-50"
                            : "border-ub-border bg-ub-surface"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`svc-${svc.id}`}
                            checked={!!selected}
                            onChange={() => toggleService(svc.id)}
                            className="h-4 w-4 rounded border-ub-border-control text-blue-600"
                          />
                          <label
                            htmlFor={`svc-${svc.id}`}
                            className="flex-1 cursor-pointer text-sm font-medium text-ub-text-primary"
                          >
                            {svc.name}
                          </label>
                        </div>
                        {selected && (
                          <div className="mt-3">
                            <label className="mb-1 block text-xs font-medium text-ub-text-secondary">
                              Price (RM)
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={selected.price}
                              onChange={(e) =>
                                updateServicePrice(
                                  svc.id,
                                  Number(e.target.value)
                                )
                              }
                              className="w-full rounded-md border border-ub-border px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
                              placeholder="0"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
          },
          {
            id: "packages",
            label: "Packages",
            description: "Optional bundled offers",
            validate: () => validateStep(2),
            content: (
              <div className="space-y-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-ub-text-primary">
                    Packages Offered
                  </h4>
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
                  <div className="mb-3 rounded-md border border-dashed border-ub-border-control bg-ub-surface-subtle p-6 text-center">
                    <p className="text-sm font-medium text-ub-text-secondary">
                      No packages added yet
                    </p>
                    <p className="mt-1 text-xs text-ub-text-tertiary">
                      Add a package to get started
                    </p>
                  </div>
                )}

                {formData.packages_offered.map((pkg, index) => (
                  <div
                    key={index}
                    className="mb-6 rounded-ub-lg border border-ub-border bg-ub-surface p-5"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h5 className="font-medium text-ub-text-primary">
                        Package {index + 1}
                      </h5>
                      <Button
                        type="button"
                        onClick={() => removePackage(index)}
                        icon={<Trash2 className="h-4 w-4" />}
                        text="Remove"
                        bgColor="bg-ub-surface"
                        textColor="text-ub-tone-danger-text"
                        borderColor="border-red-600"
                        hoverTextColor="hover:text-red-700"
                        hoverBorderColor="hover:border-red-700"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-x-3 md:grid-cols-2">
                      <InputField
                        label="Package Name"
                        field="name"
                        placeholder="e.g. Basic Package"
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
                      placeholder="e.g. description"
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
                            className="flex items-center gap-2 rounded-md border border-ub-border px-3 py-2"
                          >
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
                              onClick={() =>
                                updatePackage(
                                  index,
                                  "includes",
                                  pkg.includes.filter((_, idx) => idx !== i)
                                )
                              }
                              className="flex items-center justify-center rounded-md border border-red-600 p-1 text-ub-tone-danger-text transition hover:border-red-700 hover:text-red-700"
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
                          onClick={() =>
                            updatePackage(index, "includes", [
                              ...pkg.includes,
                              "",
                            ])
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ),
          },
          {
            id: "coverage",
            label: "Coverage",
            description: "Languages and institutions",
            validate: () => validateStep(3),
            content: (
              <div className="grid gap-6">
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
            ),
          },
        ]}
        review={
          <div className="space-y-6">
            <Alert tone="info" title="Ready to create">
              Check the provider details and pricing. Use Back or a completed
              step to make changes.
            </Alert>
            {errorCreateLogisticsProvider && (
              <Alert tone="danger">{errorCreateLogisticsProvider}</Alert>
            )}
            <DescriptionList
              columns={2}
              fallback="Not provided"
              items={[
                { label: "Provider", value: formData.name },
                { label: "Nationality", value: formData.nationality },
                { label: "Location", value: formData.main_location },
                { label: "Phone", value: formData.phone_number },
                { label: "WhatsApp", value: formData.whatsapp },
                {
                  label: "Picture",
                  value: logoFileKey ? "Uploaded" : "Not uploaded",
                },
                {
                  label: "Languages",
                  value: logisticLanguages
                    .filter((item) =>
                      formData.selectedLanguages.includes(String(item.id))
                    )
                    .map((item) => item.name)
                    .join(", "),
                },
                {
                  label: "Universities",
                  value: logisticUniversities
                    .filter((item) =>
                      formData.selectedUniversities.includes(String(item.id))
                    )
                    .map((item) => item.name)
                    .join(", "),
                },
              ]}
            />
            <DescriptionList
              columns={2}
              items={formData.selectedServices.map((service) => ({
                label:
                  logisticServices.find(
                    (item) => item.id === service.service_id
                  )?.name || "Service",
                value: `RM ${service.price.toLocaleString("en-MY")}`,
              }))}
            />
            {formData.packages_offered.length ? (
              formData.packages_offered.map((pkg, index) => (
                <DescriptionList
                  key={index}
                  columns={2}
                  items={[
                    { label: `Package ${index + 1}`, value: pkg.name },
                    {
                      label: "Price",
                      value: `RM ${pkg.price.toLocaleString("en-MY")}`,
                    },
                    { label: "Description", value: pkg.description },
                    { label: "Includes", value: pkg.includes.join(", ") },
                  ]}
                />
              ))
            ) : (
              <p className="text-ub-body-sm text-ub-text-secondary">
                No optional packages added.
              </p>
            )}
          </div>
        }
      />
      <CreateLogisticsMarketplacePopup
        isOpen={isCreateServiceOpen}
        onClose={() => setIsCreateServiceOpen(false)}
        onCreated={refetchLogisticServices}
      />
    </>
  );
}
