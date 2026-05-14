"use client";

import { Trash2, Truck, Plus, PlusCircle } from 'lucide-react';
import React, { useState } from "react";

import { useLogisticServices } from "hooks/service-providers/useLogisticServicesList";
import { useLogisticServiceLocations } from "hooks/service-providers/uselogisticServiceLocationsList";
import { useLogisticLanguages } from "hooks/service-providers/useLogisticLanguages";
import { useLogisticUniversities } from "hooks/service-providers/useLogisticUniversitiesList";
import { useCreateLogisticsProvider } from "hooks/service-providers/useCreateLogisticsProvider";

import Loading from "../../../loading/Loading";
import CheckBoxGroup from "../../../form/CheckBoxGroup";
import CheckSimpleBoxGroup from "../../../form/CheckSimpleBoxGroup";
import InputField from "../../../form/InputField";
import SelectField from "../../../form/SelectField";
import { COUNTRIES } from "../../../../constants/lists"
import AddInclude from "../../../ui/buttons/Button";
import { useToast } from "components/context/ToastContext";
import { useRouter } from "next/navigation"

export interface PackageOffered {
  name: string;
  description: string;
  price: number;
  includes: string[];
}

export interface FormData {
  name: string;
  nationality: string;
  main_location: string;
  phone_number: string;
  whatsapp: string;
  is_active: boolean;

  packages_offered: PackageOffered[];

  selectedServices: string[];
  selectedLanguages: string[];
  selectedUniversities: string[];
  selectedLocations: string[];
}

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function RegisterLogisticsProvider() {
  const { showToast } = useToast();
  const router = useRouter()
  const [errors, setErrors] = useState<FormErrors>({});
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

  const {
    logisticServices,
    loadingLogisticServices,
  } = useLogisticServices();

  const {
    logisticServiceLocations,
    loadingServiceLocations,
  } = useLogisticServiceLocations();

  const {
    logisticLanguages,
    loadingLogisticLanguage,
  } = useLogisticLanguages();

  const {
    logisticUniversities,
    loadingLogisticUniversity,
  } = useLogisticUniversities();

  const {
    createLogisticsProvider,
    loadingCreateLogisticsProvider,
    errorCreateLogisticsProvider,
  } = useCreateLogisticsProvider()


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

  const handleSubmit = async () => {
    const newErrors: FormErrors = {}

    if (!formData.name) newErrors.name = "Name is required"
    if (!formData.nationality) newErrors.nationality = "Nationality is required"
    if (!formData.phone_number)
      newErrors.phone_number = "Phone number is required"
    if (!formData.selectedServices.length)
      newErrors.selectedServices = "Please select at least one service"
    if (!formData.main_location)
      newErrors.main_location = "Please your location is required"
    if (!formData.selectedLanguages.length)
      newErrors.selectedLanguages = "Please select at least one language"
    if (!formData.selectedUniversities.length)
      newErrors.selectedUniversities = "Please select at least one university"
    if (!formData.selectedLocations.length)
      newErrors.selectedLocations = "Please select at least one location"

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

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
    }

    try {
      await createLogisticsProvider(payload)

      showToast("success" + "Logistics provider created successfully")

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
      })

      setErrors({})

      setTimeout(() => {
        router.push("/account-manager/logistical-service")
      }, 1500)

    } catch (error) {
      showToast("error" + "Failed to create logistics provider")
    }
  }

  if (
    loadingLogisticServices ||
    loadingServiceLocations ||
    loadingLogisticLanguage ||
    loadingLogisticUniversity
  ) {
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
      <div className="rounded-md border bg-slate-50 shadow-sm">

        <div className="flex items-start gap-x-4 rounded-t-xl border-b px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
            <Truck className="text-blue-700" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Register Logistics Provider
            </h3>
            <p className="text-sm text-slate-500">
              Fill in the required details to register a new logistics service
              provider
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 px-6 py-5">
          <InputField
            label="Provider Name"
            field="name"
            placeholder="e.g. FastTrack Logistics"
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <SelectField
            label="Country"
            field="nationality"
            options={COUNTRIES.map(c => ({ label: c.name, value: c.code }))}
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <SelectField
            label="Current Address"
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
        </div>

        <div className="px-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-900">
              Packages Offered
            </h4>

            <AddInclude
              icon={<Plus className="h-5 w-5" />}
              text="Add Package"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
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
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium text-slate-800">Package {index + 1}</h5>

                <button
                  type="button"
                  onClick={() => removePackage(index)}
                  className="flex items-center justify-center gap-2 rounded-md border border-red-600 text-red-600  px-4 py-2 text-sm font-medium transition hover:border-red-700 hover:text-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">
                <InputField
                  label="Package Name"
                  field="name"
                  placeholder="e.g. FastTrack Logistics"
                  required
                  formData={{ name: pkg.name }}
                  errors={{}}
                  updateFormData={(_, value) => updatePackage(index, "name", value)}
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
                placeholder="e.g. description"
                formData={{ description: pkg.description }}
                errors={{}}
                updateFormData={(_, value) =>
                  updatePackage(index, "description", value)
                }
              />
              <div className="mt-4">
                <label className="block mb-2 text-sm font-medium text-slate-700">
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
                          const updated = pkg.includes.filter((_, idx) => idx !== i);
                          updatePackage(index, "includes", updated);
                        }}
                        className="flex items-center justify-center rounded-md border border-red-600 text-red-600 p-1 transition hover:border-red-700 hover:text-red-700"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-3">
                  <AddInclude
                    icon={<Plus className="h-4 w-4" />}
                    text="Add Item"
                    bgColor="bg-green-50"
                    textColor="text-green-700"
                    borderColor="border-green-600"
                    hoverTextColor="hover:text-green-800"
                    hoverBorderColor="hover:border-green-700"
                    onClick={() =>
                      updatePackage(index, "includes", [...pkg.includes, ""])
                    }
                  />
                </div>
              </div>

            </div>
          ))}
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

        {errorCreateLogisticsProvider && (
          <p className="mt-3 text-sm text-red-600">
            {errorCreateLogisticsProvider}
          </p>
        )}

        <div className="flex justify-end border-t rounded-b-xl px-6 py-5">

          <AddInclude
            icon={<PlusCircle className="h-5 w-5" />}
            text={loadingCreateLogisticsProvider ? "Creating..." : "Create Service"}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
            onClick={handleSubmit}
            disabled={
              loadingCreateLogisticsProvider
          }
          />

        </div>
      </div>
    </section>
  );
}
