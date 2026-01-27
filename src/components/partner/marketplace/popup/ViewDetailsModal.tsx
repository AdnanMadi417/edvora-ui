"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, Truck, XCircle } from 'lucide-react';
import ModalHeader from '../../../ui/modal/ModalHeader';

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  docId: string;
}

export default function ViewDetailsModal({
                                    isOpen,
                                    onClose,
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
        className={`w-full max-w-lg md:max-w-xl transform transition-all duration-300 ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl bg-white text-sm shadow-2xl ring-1 ring-black/5">

          <ModalHeader
            title="Logistical Service Providers"
            description="Browse and view available service providers"
            icon={Truck}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={closeModal}
          />

          <div className="py-5 px-4 ">
            Welcome to aiu
          </div>


          <div className="py-5 px-4 ">
            Footer
          </div>


          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="flex items-center justify-center gap-2 rounded-full border border-gray-600 text-gray-600  px-4 py-2 text-sm font-medium transition hover:border-gray-700 hover:text-gray-700 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
              <button
                // disabled={!formData.arrival_date || isSubmitting}
                // onClick={handleConfirm}
                className="flex items-center justify-center gap-2 rounded-full border border-blue-600 bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium transition hover:border-blue-700 hover:bg-blue-200 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                Submitting
              </button>
            </div>
          </div>



        </div>
      </div>
    </div>

  );
}
