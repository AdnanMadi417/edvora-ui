"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ChevronLeft,
  Edit2,
  Plus,
  Trash2,
} from "lucide-react";

import { useLogisticServiceDetails } from "hooks/service-providers/useLogisticServiceDetails";

import EmptyData from "components/emptyData/EmptyData";
import { FormData, PackageOffered } from "./EditDetailsModal";

import { useLogisticServices } from "hooks/service-providers/useLogisticServicesList";
import { useLogisticServiceLocations } from "hooks/service-providers/uselogisticServiceLocationsList";
import { useLogisticLanguages } from "hooks/service-providers/useLogisticLanguages";
import { useLogisticUniversities } from "hooks/service-providers/useLogisticUniversitiesList";
import { useEditLogisticsProvider } from "hooks/service-providers/useEditLogisticsProvider";

import CheckSimpleBoxGroup from "components/form/CheckSimpleBoxGroup";
import InputField from "components/form/InputField";
import Button from "components/ui/buttons/Button";
import { useToast } from "components/context/ToastContext";
import SelectField from "components/form/SelectField";
import { COUNTRIES } from "constants/lists";
import { BiArrowBack } from 'react-icons/bi';

interface MarketplaceDetailsProps {
  id: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const MarketplaceDetails = ({ id }: MarketplaceDetailsProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.push("/admin/logistical-service/");
  };

  const { service, loadingService, errorService } =
    useLogisticServiceDetails(id);

  const { showToast } = useToast();
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    name: service?.name || "",
    nationality: service?.nationality || "",
    main_location: service?.main_location || "",
    phone_number: service?.phone_number || "",
    whatsapp: service?.whatsapp || "",
    is_active: service?.is_active ?? true,
    packages_offered: service?.packages_offered || [],
    selectedServices: service?.services_offered || [],
    selectedLanguages: service?.languages || [],
    selectedUniversities: service?.universities_served || [],
    selectedLocations: service?.service_locations || [],
  });

  const { logisticServices } = useLogisticServices();
  const { logisticServiceLocations } = useLogisticServiceLocations();
  const { logisticLanguages } = useLogisticLanguages();
  const { logisticUniversities } = useLogisticUniversities();

  const {
    editLogisticsProvider,
    loadingEditLogisticsProvider,
    errorEditLogisticsProvider,
  } = useEditLogisticsProvider();

  const updateFormData = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
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

  useEffect(() => {
    if (
      service &&
      logisticServices.length &&
      logisticLanguages.length &&
      logisticUniversities.length &&
      logisticServiceLocations.length
    ) {
      setFormData({
        name: service.name || "",
        nationality: service.nationality || "",
        main_location: service.main_location || "",
        phone_number: service.phone_number || "",
        whatsapp: service.whatsapp || "",
        is_active: service.is_active ?? true,
        packages_offered: service.packages_offered || [],
        selectedServices: service.services_offered
          .map(
            (service) => logisticServices.find((s) => s.name === service)?.id
          )
          .filter(Boolean) as string[],
        selectedLanguages: service.languages
          .map((lang) => logisticLanguages.find((l) => l.name === lang)?.id)
          .filter(Boolean) as string[],
        selectedUniversities: service.universities_served
          .map((uni) => logisticUniversities.find((u) => u.name === uni)?.id)
          .filter(Boolean) as string[],
        selectedLocations: service.service_locations
          .map(
            (loc) => logisticServiceLocations.find((l) => l.name === loc)?.id
          )
          .filter(Boolean) as string[],
      });
    }
  }, [
    service,
    logisticServices,
    logisticLanguages,
    logisticUniversities,
    logisticServiceLocations,
  ]);

  const isFormChanged = () => {
    if (!service) return false;

    const basicChanged =
      formData.name !== service.name ||
      formData.nationality !== service.nationality ||
      formData.main_location !== service.main_location ||
      formData.phone_number !== service.phone_number ||
      formData.whatsapp !== service.whatsapp ||
      formData.is_active !== (service.is_active ?? true);

    const servicesChanged =
      formData.selectedServices.length !==
        (service.services_offered || []).length ||
      formData.selectedServices.some(
        (id) =>
          !logisticServices.find((s) => s.id === id)?.name ||
          !service.services_offered.includes(
            logisticServices.find((s) => s.id === id)?.name!
          )
      );

    const languagesChanged =
      formData.selectedLanguages.length !== (service.languages || []).length ||
      formData.selectedLanguages.some(
        (id) =>
          !logisticLanguages.find((l) => l.id === id)?.name ||
          !service.languages.includes(
            logisticLanguages.find((l) => l.id === id)?.name!
          )
      );

    const universitiesChanged =
      formData.selectedUniversities.length !==
        (service.universities_served || []).length ||
      formData.selectedUniversities.some(
        (id) =>
          !logisticUniversities.find((u) => u.id === id)?.name ||
          !service.universities_served.includes(
            logisticUniversities.find((u) => u.id === id)?.name!
          )
      );

    const locationsChanged =
      formData.selectedLocations.length !==
        (service.service_locations || []).length ||
      formData.selectedLocations.some(
        (id) =>
          !logisticServiceLocations.find((l) => l.id === id)?.name ||
          !service.service_locations.includes(
            logisticServiceLocations.find((l) => l.id === id)?.name!
          )
      );

    const packagesChanged =
      formData.packages_offered.length !==
        (service.packages_offered || []).length ||
      formData.packages_offered.some((pkg, i) => {
        const original = service.packages_offered[i];
        if (!original) return true;
        return (
          pkg.name !== original.name ||
          pkg.description !== original.description ||
          pkg.price !== original.price ||
          pkg.includes.join(",") !== (original.includes || []).join(",")
        );
      });

    return (
      basicChanged ||
      servicesChanged ||
      languagesChanged ||
      universitiesChanged ||
      locationsChanged ||
      packagesChanged
    );
  };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.nationality)
      newErrors.nationality = "Nationality is required";
    if (!formData.main_location)
      newErrors.main_location = "Main Location is required";
    if (!formData.phone_number)
      newErrors.phone_number = "Phone number is required";
    if (!formData.selectedServices.length)
      newErrors.selectedServices = "Please select at least one service";
    if (!formData.selectedLanguages.length)
      newErrors.selectedLanguages = "Please select at least one language";
    if (!formData.selectedUniversities.length)
      newErrors.selectedUniversities = "Please select at least one university";
    if (!formData.selectedLocations.length)
      newErrors.selectedLocations = "Please select at least one location";

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
      service_ids: formData.selectedServices,
      language_ids: formData.selectedLanguages,
      university_ids: formData.selectedUniversities,
      service_location_ids: formData.selectedLocations,
    };

    try {
      await editLogisticsProvider(service.id, payload);

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

      setErrors({});

      showToast("Logistics provider updated successfully", "success");

      setTimeout(() => {
        router.push("/admin/logistical-service/");
      }, 1500);
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message || "Please try again.";
      showToast(`Update failed. ${backendMessage}`, "error");
    }
  };

  if (errorService) return <EmptyData />;

  return (
    <>
      <div className="mt-6">
        <div className="rounded-md border border-default bg-card shadow-sm">

          <div className="flex justify-between border-b border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="flex  h-10 w-10 items-center justify-center rounded-full bg-amber-100 md:h-14 md:w-14">
                  <Edit2 className="h-5 w-5 text-amber-700 md:h-8 md:w-8" />
                </div>

              </div>

              <div className="min-w-0">
                <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
                  Edit Logistical Service Provider
                </h3>
                <p className="mt-1 break-words text-sm text-slate-500">
                  Modify provider information and service coverage
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
              <button
                onClick={handleBack}
                className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Back to services</span>
              </button>
            </div>
          </div>

          <div className="space-y-6 py-5 px-6 ">
            <div className="grid grid-cols-1 gap-x-3">
              <InputField
                label="Provider Name"
                field="name"
                placeholder={service?.name}
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <SelectField
                label="Nationality"
                field="nationality"
                options={COUNTRIES.map((c) => ({
                  label: c.name,
                  value: c.code,
                }))}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <SelectField
                label="Current Residence"
                field="main_location"
                options={logisticServiceLocations.map((u) => ({
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
              />

              <InputField
                label="WhatsApp Contact"
                field="whatsapp"
                placeholder="e.g. +60 12 345 6789"
                formData={formData}
                errors={errors}
                required
                updateFormData={updateFormData}
              />

              <label
                className={`group relative flex cursor-pointer items-center justify-between rounded-md border px-4 py-4 transition-all
    ${
      formData.is_active
        ? "border-blue-600 bg-blue-50 shadow-sm"
        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
    }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-800">
                    Active
                  </span>
                  <span className="text-xs text-slate-400">
                    {formData.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      updateFormData("is_active", e.target.checked)
                    }
                    className="peer sr-only"
                    aria-checked={formData.is_active}
                  />

                  <div className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-blue-600" />

                  <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </div>

                {formData.is_active && (
                  <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-blue-600" />
                )}
              </label>
            </div>

            <div className="block">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-lg font-semibold text-slate-900">
                  Packages Offered
                </h4>

                <Button
                  icon={<Plus className="h-5 w-5" />}
                  text="Add Package"
                  bgColor="bg-amber-50"
                  textColor="text-amber-700"
                  borderColor="border-amber-600"
                  hoverTextColor="hover:text-amber-800"
                  hoverBorderColor="hover:border-amber-700"
                  onClick={() => addPackage()}
                />
              </div>

              {formData.packages_offered.length === 0 && (
                <div className="mb-3 rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No packages added yet
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Add a package to get started
                  </p>
                </div>
              )}

              {formData.packages_offered.map((pkg, index) => (
                <div
                  key={index}
                  className="mb-6 rounded-md border bg-white p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h5 className="font-medium text-slate-800">
                      Package {index + 1}
                    </h5>

                    <button
                      type="button"
                      onClick={() => removePackage(index)}
                      className="flex items-center justify-center gap-2 rounded-full border border-red-600 px-4  py-2 text-sm font-medium text-red-600 transition hover:border-red-700 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-x-3">
                    <InputField
                      label="Package Name"
                      field="name"
                      required
                      formData={{ name: pkg.name }}
                      errors={{}}
                      updateFormData={(_, value) =>
                        updatePackage(index, "name", value)
                      }
                    />

                    <InputField
                      label="Price"
                      field="price"
                      type="number"
                      formData={{ price: pkg.price }}
                      errors={{}}
                      updateFormData={(_, value) =>
                        updatePackage(index, "price", Number(value))
                      }
                    />
                  </div>

                  <InputField
                    label="Description"
                    field="description"
                    formData={{ description: pkg.description }}
                    errors={{}}
                    updateFormData={(_, value) =>
                      updatePackage(index, "description", value)
                    }
                  />
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Includes
                    </label>

                    <div className="space-y-2">
                      {pkg.includes.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2"
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
                            onClick={() => {
                              const updated = pkg.includes.filter(
                                (_, idx) => idx !== i
                              );
                              updatePackage(index, "includes", updated);
                            }}
                            className="flex items-center justify-center rounded-full border border-red-600 p-1 text-red-600 transition hover:border-red-700 hover:text-red-700"
                            aria-label="Remove item"
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
                        bgColor="bg-amber-50"
                        textColor="text-amber-700"
                        borderColor="border-amber-600"
                        hoverTextColor="hover:text-amber-800"
                        hoverBorderColor="hover:border-amber-700"
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
                label="Logistic Services"
                field="selectedServices"
                options={logisticServices}
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

              <CheckSimpleBoxGroup
                label="Locations"
                field="selectedLocations"
                options={logisticServiceLocations}
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
                required
              />
            </div>

            {errorEditLogisticsProvider && (
              <p className="mt-3 text-sm text-red-600">
                {errorEditLogisticsProvider}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-200 py-5 px-6">
            <Button
              onClick={handleBack}
              icon={<BiArrowBack className="h-5 w-5" />}
              text={"Cancel"}
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              icon={<Edit2 className="h-5 w-5" />}
              text={
                loadingEditLogisticsProvider ? "updating..." : "Update Service"
              }
              bgColor="bg-amber-50"
              textColor="text-amber-700"
              borderColor="border-amber-600"
              hoverTextColor="hover:text-amber-800"
              hoverBorderColor="hover:border-amber-700"
              onClick={handleSubmit}
              disabled={loadingEditLogisticsProvider || !isFormChanged()}
            />
          </div>

        </div>
      </div>
    </>
  );
};

export default MarketplaceDetails;
