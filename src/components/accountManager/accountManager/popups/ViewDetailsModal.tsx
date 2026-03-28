"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, CheckCircle, XCircle } from "lucide-react";
import ModalHeader from "../../../ui/modal/ModalHeader";

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  manager: any;
}

export default function ViewDetailsModal({
  isOpen,
  onClose,
  manager,
}: ViewDetailsModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const closeModal = () => {
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={closeModal}
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
            title="Account Manager Details"
            description="View account manager information"
            icon={User}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            iconBorder="border-indigo-200"
            titleColor="text-gray-900"
            onClose={closeModal}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-4 py-5">

            <div className="divide-y divide-slate-200 text-sm">
                <div className="flex justify-between py-3">
    <span className="flex items-center gap-2 text-slate-600">
      <User className="h-4 w-4" />
      Name
    </span>
                  <span className="font-medium text-slate-900">
      {manager.name}
    </span>
                </div>

                <div className="flex justify-between py-3">
    <span className="flex items-center gap-2 text-slate-600">
      <Mail className="h-4 w-4" />
      Email
    </span>
                  <span className="font-medium text-slate-900">
      {manager.email}
    </span>
                </div>

                <div className="flex justify-between py-3">
    <span className="flex items-center gap-2 text-slate-600">
      <CheckCircle className="h-4 w-4" />
      Status
    </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      manager.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
      {manager.is_active ? "Active" : "Inactive"}
    </span>
                </div>
            </div>

          </div>

          <div className="flex justify-end border-t border-gray-200 px-6 py-4">
            <button
              onClick={closeModal}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-600 px-4  py-2 text-sm font-medium text-gray-600 transition hover:border-gray-700 hover:text-gray-700 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
