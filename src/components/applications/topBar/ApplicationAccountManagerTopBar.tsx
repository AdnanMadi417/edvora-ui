"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MoreVertical,
  Clock,
  XCircle,
  ExternalLink,
} from "lucide-react";
import HoldPopup from "../popups/accountmanager/Hold";
import UpdateStatus from "../popups/accountmanager/UpdateStatus";

interface Props {
  application: any;
}

export default function ApplicationAccountManagerTopBar({ application }: Props) {

  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showHoldPopup, setShowHoldPopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleBack = () => {
    setIsDropdownOpen(false);
    router.push("/account-manager/applications");
  };

  const handleHold = () => {
    setIsDropdownOpen(false);
    setShowHoldPopup(true);
  };

  const handleConfirmHold = (reason: string) => {
    setShowHoldPopup(false);
  };

  const handleUpdateStatus = () => {
    setShowUpdatePopup(true);
  };

  const handleConfirmUpdate = () => {
    setShowUpdatePopup(false);
  };

  return (
    <section className="w-full">
      <div className="border-b border-default bg-white/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 sm:h-16 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-6">
              <button
                onClick={handleBack}
                className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Back to Applications</span>
              </button>
              <div className="hidden h-8 border-l border-default sm:block" />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleUpdateStatus}
                className="flex items-center gap-2 rounded-full border border-default bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-all hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                Update Status
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-default bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-all hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  Actions
                  <MoreVertical className="h-4 w-4" />
                </button>

                {isDropdownOpen && (
                  <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-default bg-white ring-1 ring-black/5">
                    <div className="p-2">
                      <button
                        onClick={handleHold}
                        className="group flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all hover:bg-amber-50 hover:text-amber-900"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 group-hover:bg-amber-200">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Update Application Status</div>
                          <div className="text-xs text-slate-500">
                            Manage the application’s status
                          </div>
                        </div>
                      </button>

                      <div className="my-1 h-px bg-slate-100" />

                      <div className="my-1 h-px bg-slate-100" />

                      <button
                        onClick={handleBack}
                        className="group flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all hover:bg-blue-50 hover:text-blue-900"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Open Applications</div>
                          <div className="text-xs text-slate-500">
                            View all applications
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <HoldPopup
        isOpen={showHoldPopup}
        onClose={() => setShowHoldPopup(false)}
        onConfirm={handleConfirmHold}
        applicationId={application?.id}
        currentStatus={application.lifecycle_status}
      />

      {application && showUpdatePopup && (
        <UpdateStatus
          isOpen={showUpdatePopup}
          onClose={() => setShowUpdatePopup(false)}
          onConfirm={handleConfirmUpdate}
          application={application}
        />
      )}

    </section>
  );
}
