"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MdCategory,
  MdPhone,
  MdPublic,
  MdSupervisorAccount,
  MdToggleOn,
  MdVerified,
} from "react-icons/md";
import { usePartnerProfile } from "hooks/partners/usePartnerProfile";
import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";
import { ChevronLeft, Clock, MoreVertical } from "lucide-react";

interface PartnerDetailsProps {
  id: string;
}

const PartnerDetails = ({ id }: PartnerDetailsProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const { partner, isPartnerLoading } = usePartnerProfile();

  const handleUpdate = () => router.push("/partner/profile/edit");
  const handleBack = () => router.push("/partner/applications");

  if (isPartnerLoading) {
    return <Loading text="Loading partner profile details..." />;
  }

  if (!partner) {
    return <EmptyData />;
  }

  return (
    <>
      <div className="mt-6 max-w-5xl mx-auto">
        <div className="rounded-md border bg-card shadow-sm">
          <div className="flex justify-between border-b p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-sm font-semibold text-blue-700">
                  {partner.name ? partner.name.slice(0, 2).toUpperCase() : "NA"}
                </div>

                <span
                  className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-md border-2 border-white ${
                    partner.is_active ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                  title={partner.is_active ? "Active" : "Inactive"}
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold">{partner.name}</h2>
                <p className="text-sm text-slate-500">{partner.country}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition-all hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  Actions
                  <MoreVertical className="h-4 w-4" />
                </button>

                {isDropdownOpen && (
                  <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white ring-1 ring-black/5">
                    <div className="space-y-2 p-2">
                      <button
                        aria-label="Update Program Details"
                        className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-amber-200 hover:bg-amber-50 hover:shadow-sm"
                        onClick={handleUpdate}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-200">
                          <Clock className="h-4 w-4" />
                        </div>

                        <span className="font-semibold text-slate-900">
                          Update Details
                        </span>
                      </button>

                      <button
                        aria-label="Back to Programs"
                        className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                        onClick={handleBack}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-200">
                          <ChevronLeft className="h-4 w-4" />
                        </div>

                        <span className="font-semibold text-slate-900">
                          Back to applications
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Partner Overview
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">
                  <MdPublic className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Country</p>
                  <p className="mt-0.5 text-sm font-medium capitalize text-slate-900">
                    {partner.country || "Not Provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">
                  <MdPhone className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Phone Number</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-900">
                    {partner.phone || "Not Provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">
                  <MdCategory className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Partner Type</p>
                  <p className="mt-0.5 text-sm font-medium capitalize text-slate-900">
                    {partner.type}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">
                  <MdSupervisorAccount className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Assigned Manager</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-900">
                    {partner.assigned_manager_name || "Not Assigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">
                  <MdVerified className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Verification Status</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-900">
                    {partner.is_verified ? "Verified" : "Not Verified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">
                  <MdToggleOn className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Account Status</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-900">
                    {partner.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerDetails;
