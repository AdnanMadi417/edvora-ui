"use client";

import React, { useState, useEffect } from "react";
import { Ban, Power, XCircle } from "lucide-react";
import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  partnerName: string;
  /** Current is_active value — the modal offers to flip it. */
  isActive: boolean;
}

export default function SuspendActivatePartner({ isOpen, onClose, onConfirm, isSubmitting, partnerName, isActive }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const action = isActive ? "Suspend" : "Activate";
  const icon = isActive ? Ban : Power;
  const colorClasses = isActive
    ? { bg: "bg-red-50", text: "text-red-700", border: "border-red-600", hoverText: "hover:text-red-800", hoverBorder: "hover:border-red-700", iconBg: "bg-red-50", iconColor: "text-red-600", iconBorder: "border-red-200" }
    : { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-600", hoverText: "hover:text-emerald-800", hoverBorder: "hover:border-emerald-700", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", iconBorder: "border-emerald-200" };
  const Icon = icon;

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
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title={`${action} Account`}
            description={isActive ? "Suspend this advisor's account access." : "Restore this advisor's account access."}
            icon={Icon}
            iconBg={colorClasses.iconBg}
            iconColor={colorClasses.iconColor}
            iconBorder={colorClasses.iconBorder}
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="space-y-4 px-7 py-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Confirm {action}</h3>
              <p className="text-sm text-slate-500">
                {isActive ? (
                  <>Are you sure you want to suspend <strong>{partnerName}</strong>'s account? They will lose access until reactivated.</>
                ) : (
                  <>Are you sure you want to activate <strong>{partnerName}</strong>'s account? They will regain full access immediately.</>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              onClick={onClose}
              disabled={isSubmitting}
              icon={<XCircle className="h-5 w-5" />}
              text="Cancel"
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              className="w-full sm:w-auto"
              icon={<Icon className="h-5 w-5" />}
              text={isSubmitting ? `${action === "Suspend" ? "Suspending" : "Activating"}...` : `${action} Account`}
              bgColor={colorClasses.bg}
              textColor={colorClasses.text}
              borderColor={colorClasses.border}
              hoverTextColor={colorClasses.hoverText}
              hoverBorderColor={colorClasses.hoverBorder}
              onClick={onConfirm}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
