import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { IconType } from "react-icons";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaGlobe } from "react-icons/fa";
import { SOCIAL_MEDIA_PLATFORMS } from "constants/lists";
import { buildSocialMediaUrl } from "utils/socialMedia";

const PLATFORM_ICONS: Record<string, IconType> = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  tiktok: FaTiktok,
  website: FaGlobe,
};

interface SocialMediaInputFieldProps {
  label?: string;
  platformField: string;
  usernameField: string;
  urlField: string;
  formData: Record<string, any>;
  errors?: Record<string, string>;
  updateFormData: (field: string, value: unknown) => void;
  required?: boolean;
  onBlur?: () => void;
}

export default function SocialMediaInputField({
  label = "Social Media",
  platformField,
  usernameField,
  urlField,
  formData,
  errors,
  updateFormData,
  required = true,
  onBlur,
}: SocialMediaInputFieldProps) {
  const platform = formData[platformField] ?? "";
  const username = formData[usernameField] ?? "";
  const error = errors?.[urlField];

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = SOCIAL_MEDIA_PLATFORMS.find((p) => p.value === platform);
  const SelectedIcon = selected ? PLATFORM_ICONS[selected.value] : undefined;

  const handlePlatformChange = (value: string) => {
    updateFormData(platformField, value);
    updateFormData(urlField, buildSocialMediaUrl(value, username));
    setOpen(false);
  };

  const handleUsernameChange = (value: string) => {
    updateFormData(usernameField, value);
    updateFormData(urlField, buildSocialMediaUrl(platform, value));
  };

  const placeholder = !selected
    ? "Select a platform first"
    : selected.value === "website"
    ? "https://yourwebsite.com"
    : `Enter your ${selected.label} username`;

  return (
    <div className="mb-4">
      <label className="block text-p2 font-medium text-slate-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <div className={`mt-2 flex overflow-visible rounded-lg border bg-white transition ${error ? "border-red-500" : "border-slate-200"}`}>
        <div className="relative shrink-0" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex h-11 w-16 items-center justify-center gap-1 rounded-l-lg border-r border-slate-200 bg-white px-2 text-slate-600 transition hover:bg-slate-50 sm:h-12"
          >
            {SelectedIcon ? <SelectedIcon className="h-5 w-5 shrink-0" /> : <span className="text-[10px] text-slate-400">Select</span>}
            <ChevronDown className={`h-3 w-3 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div
              role="listbox"
              className="absolute left-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
            >
              {SOCIAL_MEDIA_PLATFORMS.map((p) => {
                const Icon = PLATFORM_ICONS[p.value];
                const isSelected = platform === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handlePlatformChange(p.value)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                      isSelected ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {p.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <input
          type="text"
          value={username}
          disabled={!platform}
          onChange={(e) => handleUsernameChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className="h-11 min-w-0 flex-1 rounded-r-lg bg-white px-3 text-sm outline-none transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 sm:h-12"
        />
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
