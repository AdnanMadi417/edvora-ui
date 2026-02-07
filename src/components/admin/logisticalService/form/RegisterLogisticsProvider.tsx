"use client";

import { Truck } from "lucide-react";
import React, { useState } from "react";
import { useLogisticServices } from "../../../../hooks/serviceProviders/useLogisticServicesList";
import { useLogisticServiceLocations } from "../../../../hooks/serviceProviders/uselogisticServiceLocationsList";
import { useLogisticLanguages } from "../../../../hooks/serviceProviders/useLogisticLanguages";
import { useLogisticUniversities } from "../../../../hooks/serviceProviders/useLogisticUniversitiesList";
import Loading from "../../../loading/Loading";
import CheckBoxGroup from "../../../form/CheckBoxGroup";

type FormData = {
  selectedServices: string[];
  selectedLanguages: string[];
  selectedUniversities: string[];
  selectedLocations: string[];
};

type FormErrors = {
  selectedServices?: string;
  selectedLanguages?: string;
  selectedUniversities?: string;
  selectedLocations?: string;
};


export default function RegisterLogisticsProvider() {
  const [formData, setFormData] = useState<FormData>({
    selectedServices: [],
    selectedLanguages: [],
    selectedUniversities: [],
    selectedLocations: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined })); // clear error on change
  };

  const {
    logisticServices,
    loadingLogisticServices,
    errorLogisticServices,
  } = useLogisticServices();
  const {
    logisticServiceLocations,
    loadingServiceLocations,
    errorServiceLocations,
  } = useLogisticServiceLocations();
  const {
    logisticLanguages,
    loadingLogisticLanguage,
    errorLogisticLanguage,
  } = useLogisticLanguages();
  const {
    logisticUniversities,
    loadingLogisticUniversity,
    errorLogisticUniversity,
  } = useLogisticUniversities();

  const handleSubmit = () => {
    const newErrors: FormErrors = {};

    if (!formData.selectedServices.length) {
      newErrors.selectedServices = "Please select at least one service.";
    }
    if (!formData.selectedLanguages.length) {
      newErrors.selectedLanguages = "Please select at least one language.";
    }
    if (!formData.selectedUniversities.length) {
      newErrors.selectedUniversities = "Please select at least one university.";
    }
    if (!formData.selectedLocations.length) {
      newErrors.selectedLocations = "Please select at least one location.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Form submitted!", formData);
      // send to API here
    }
  };

  if (
    loadingLogisticServices ||
    loadingServiceLocations ||
    loadingLogisticLanguage ||
    loadingLogisticUniversity
  ) {
    return (
      <section className="mx-auto mt-5 max-w-5xl">
        <div className="rounded-lg border border-gray-200 bg-card p-6">
          <Loading text="Fetching Logistic Services data..." />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-5">
      <div className="rounded-lg border border-gray-200 bg-card p-6">
        <div className="mb-6 flex items-start gap-x-3 border-b-2 border-gray-100 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Truck className="text-blue-700" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Register Logistics Provider
            </h3>
            <p className="text-sm text-slate-500">
              Fill in the required details to register a new logistics service provider
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-md border bg-gray-50 p-6">

          <CheckBoxGroup
            label="Logistic Services"
            field="selectedServices"
            options={logisticServices}
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            required
          />

          <CheckBoxGroup
            label="Languages"
            field="selectedLanguages"
            options={logisticLanguages}
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            required
          />

          <CheckBoxGroup
            label="Universities"
            field="selectedUniversities"
            options={logisticUniversities}
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            required
          />

          <CheckBoxGroup
            label="Locations"
            field="selectedLocations"
            options={logisticServiceLocations}
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            required
          />

          <div className="mt-4">
            <button
              onClick={handleSubmit}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
