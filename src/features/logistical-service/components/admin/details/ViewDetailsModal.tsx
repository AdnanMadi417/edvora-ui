"use client";

import React, { useState, useEffect } from "react";
import { Globe, MapPin, Truck } from 'lucide-react';
import ModalHeader from "components/ub/feedback/dialogs/ModalHeader";
import Button from "components/ub/core/buttons/Button";
import {
  MdKeyboardArrowDown,
  MdLocalAirport,
  MdContentCopy,
  MdPublic,
  MdSchool,
  MdTranslate,
} from "react-icons/md";

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: any;
}

export default function ViewDetailsModal({
  isOpen,
  onClose,
  provider,
}: ViewDetailsModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [openPackage, setOpenPackage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl bg-white text-sm shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Logistics Marketplace"
            description="Browse and view available service providers"
            icon={Truck}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-4 py-5">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-5 shadow-md">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-md bg-white/10 blur-2xl" />
              <div className="relative space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-white">
                      {provider?.name}
                    </h3>
                    <p className="text-xs text-emerald-100">
                      Nationality · {provider?.nationality || "Not provided"}
                    </p>
                  </div>
                  <div className="rounded-md bg-white/20 p-3 backdrop-blur">
                    <MdLocalAirport className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="h-px w-full bg-white/20" />
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
                    Price Range
                  </p>
                  <p className="text-lg font-bold text-white">
                    {provider?.price_range
                      ? `RM ${provider.price_range.min_price} - ${provider.price_range.max_price}`
                      : "Not available"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>Current Residence</span>
                </div>
                {provider.main_location ? (
                  <span className="truncate rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {provider.main_location}
                  </span>
                ) : (
                  <span className="text-xs italic text-slate-400">Not provided</span>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <span>Nationality</span>
                </div>
                {provider.nationality ? (
                  <span className="truncate rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {provider.nationality}
                  </span>
                ) : (
                  <span className="text-xs italic text-slate-400">Not provided</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MdTranslate className="h-4 w-4 text-slate-500" />
                Languages
              </div>
              <div className="flex flex-wrap gap-2">
                {provider?.languages?.length ? (
                  provider.languages.map((lang) => (
                    <span key={lang} className="rounded-md border border-slate-100 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                      {lang}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Not provided</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MdPublic className="h-4 w-4 text-slate-500" />
                Locations
              </div>
              <div className="flex flex-wrap gap-2">
                {provider?.service_locations?.length ? (
                  provider.service_locations.map((loc) => (
                    <span key={loc} className="rounded-md border border-slate-100 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                      {loc}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Not provided</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MdSchool className="h-5 w-5 text-blue-600" />
                Universities Served
              </div>
              <ul className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                {provider?.universities_served?.length ? (
                  provider.universities_served.map((uni) => (
                    <li key={uni} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-md bg-blue-500" />
                      {uni}
                    </li>
                  ))
                ) : (
                  <li>Not provided</li>
                )}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MdLocalAirport className="h-5 w-5 text-emerald-600" />
                Services Offered
              </div>
              <div className="flex flex-wrap gap-3">
                {provider?.services_offered?.length ? (
                  provider.services_offered.map((service) => (
                    <span key={service.id} className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      {service.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Not provided</span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-800">Packages</p>
              {provider?.packages_offered?.map((pkg) => (
                <div key={pkg.name} className="rounded-xl border border-slate-200 bg-slate-50">
                  <button
                    onClick={() => setOpenPackage(openPackage === pkg.name ? null : pkg.name)}
                    className="flex w-full items-center justify-between px-5 py-4"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{pkg.name}</p>
                      <p className="text-xs text-slate-500">RM {pkg.price}</p>
                    </div>
                    <MdKeyboardArrowDown
                      className={`h-5 w-5 transition ${openPackage === pkg.name ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openPackage === pkg.name && (
                    <div className="space-y-2 border-t px-5 py-4 text-sm text-slate-600">
                      <p>{pkg.description}</p>
                      <ul className="space-y-1">
                        {pkg.includes.map((i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-md bg-emerald-500" />
                            {i}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between px-5">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{provider?.phone_number}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(provider.phone_number);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="rounded p-1 hover:bg-slate-100"
                >
                  <MdContentCopy className="h-4 w-4" />
                </button>
                {copied && <span className="text-xs text-emerald-600">Copied</span>}
              </div>
              <Button
                onClick={() => window.open(`https://wa.me/${provider.whatsapp}`, "_blank")}
                text="Contact on WhatsApp"
                bgColor="bg-emerald-600"
                textColor="text-white"
                borderColor="border-emerald-600"
                hoverTextColor="hover:text-white"
                hoverBorderColor="hover:border-emerald-700"
                className="hover:bg-emerald-700"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
