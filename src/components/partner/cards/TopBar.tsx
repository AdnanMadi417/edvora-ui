"use client";

import { applications } from "components/data/applications";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MoreVertical,
  Clock,
  CheckCircle,
  Users,
} from "lucide-react";
import HoldPopup from "components/partner/popups/Hold";
import CancelPopup from "components/partner/popups/Approve";
import Link from "next/link";

interface PartnerPageProps {
  params: {
    id: string;
  };
}

export default function PartnerPage({ params }: PartnerPageProps) {
  const partner = applications.find((app) => app.id === params.id);
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showHoldPopup, setShowHoldPopup] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
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
    router.push("/account-manager/partners");
  };

  const handleHold = () => {
    setIsDropdownOpen(false);
    setShowHoldPopup(true);
  };

  const handleConfirmHold = (reason: string) => {
    setShowHoldPopup(false);
    console.log(
      "Partner placed on hold:",
      partner?.partnerID,
      reason
    );
  };

  const handleApprove = () => {
    setIsDropdownOpen(false);
    setShowCancelPopup(true);
  };

  const handleConfirmCancel = (reason: string) => {
    setShowCancelPopup(false);
    console.log("Partner cancelled:", partner?.partnerID, reason);
  };

  return (
    <section className="w-full">
      <div className="backdrop-blur-md border-b border-default rounded-t-xl">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 sm:h-16 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-6">
              <Link
                href="/account-manager/partners"
                className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span>Back to Partners</span>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-default bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-all hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  Actions
                  <MoreVertical className="h-4 w-4" />
                </button>

                {isDropdownOpen && (

                  <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5">
                    <div className="p-2 space-y-1">

                      <button
                        onClick={handleApprove}
                        className="group flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-green-50 hover:text-green-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-200"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600 transition-colors group-hover:bg-green-200">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium leading-tight">Approve Partner</p>
                          <p className="text-xs text-slate-500">Confirm and activate this partner</p>
                        </div>
                      </button>

                      <div className="h-px bg-slate-100" />

                      <button
                        onClick={handleHold}
                        className="group flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-amber-50 hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-200">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium leading-tight">Hold Partner</p>
                          <p className="text-xs text-slate-500">Temporarily pause this partner</p>
                        </div>
                      </button>

                      <div className="h-px bg-slate-100" />

                      <button
                        onClick={handleBack}
                        className="group flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-green-50 hover:text-green-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-200"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600 transition-colors group-hover:bg-green-200">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium leading-tight">Open Partners</p>
                          <p className="text-xs text-slate-500">View all registered partners</p>
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
        partnerId={partner?.partnerID}
      />

      <CancelPopup
        isOpen={showCancelPopup}
        onClose={() => setShowCancelPopup(false)}
        onConfirm={handleConfirmCancel}
        partnerId={partner?.partnerID}
      />

    </section>
  );
}
