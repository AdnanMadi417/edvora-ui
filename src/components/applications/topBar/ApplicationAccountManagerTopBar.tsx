"use client";

import { applications } from "components/data/applications";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { ChevronLeft, MoreVertical, Clock, XCircle, ExternalLink } from 'lucide-react';
import HoldPopup from 'components/applications/popups/Hold';

interface ApplicationPageProps {
  params: {
    id: string;
  };
}

export default function ApplicationPage({ params }: ApplicationPageProps) {
  const application = applications.find((app) => app.id === params.id);
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showHoldPopup, setShowHoldPopup] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleHold = () => {
    setIsDropdownOpen(false);
    setShowHoldPopup(true);
  };

  const handleConfirmHold = () => {
    setShowHoldPopup(false);
    console.log('Application held', application?.applicationID);
  };

  const handleCancel = () => {
    setIsDropdownOpen(false);
    if (confirm('Are you sure you want to cancel this application?')) {
      console.log('Application cancelled');
    }
  };

  const handleOpen = () => {
    setIsDropdownOpen(false);
    router.push('/applications');
  };

  return (
    <section className="bg-gradient-to-br from-slate-50 to-slate-100">

      <div className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200 shadow-sm">

        <div className="max-w-7xl mx-auto">
          <div className="flex h-16 items-center justify-between px-6">

            <div className="flex items-center gap-6">
              <button
                onClick={handleOpen}
                className="group flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span>Applications</span>
              </button>

              <div className="h-8 w-px bg-slate-200" />

            </div>


            <div className="flex items-center gap-3">

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary rounded-full border border-default transition-all"
                >
                  <span>Actions</span>
                  <MoreVertical className="h-4 w-4" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      <button
                        onClick={handleHold}
                        className="group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all hover:bg-amber-50 hover:text-amber-900"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-200">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Hold</div>
                          <div className="text-xs text-slate-500">Pause this application</div>
                        </div>
                      </button>

                      <div className="my-1 h-px bg-slate-100" />

                      <button
                        onClick={handleCancel}
                        className="group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all hover:bg-red-50 hover:text-red-900"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors group-hover:bg-red-200">
                          <XCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Cancel</div>
                          <div className="text-xs text-slate-500">Reject application</div>
                        </div>
                      </button>

                      <div className="my-1 h-px bg-slate-100" />

                      <button
                        onClick={handleOpen}
                        className="group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all hover:bg-blue-50 hover:text-blue-900"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-200">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Open Applications</div>
                          <div className="text-xs text-slate-500">View all applications</div>
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
        applicationId={application?.applicationID}
      />
    </section>
  );
}