"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { usePartnerDetails } from "hooks/partners/usePartnerDetails";
import Loading from "components/loading/Loading";
import { MdCategory, MdPhone, MdPublic, MdSupervisorAccount, MdToggleOn, MdVerified } from 'react-icons/md';
import EmptyData from 'components/emptyData/EmptyTableData';

interface PartnerDetailsProps {
  id: string;
}

const PartnerDetails = ({ id }: PartnerDetailsProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.push("/admin/partners");
  };

  const { partner, isPartnerLoading } =
    usePartnerDetails(id);

  if (isPartnerLoading) {
    return <Loading text="Loading partner details..." />;
  }

  if (!partner) {
    return <EmptyData />;
  }

  return (
    <>

      <div className="mt-6">
        <div className="rounded-md border bg-card shadow-sm">
          <div className="flex justify-between border-b p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                  {partner.name
                    ? partner.name.slice(0, 2).toUpperCase()
                    : "NA"}
                </div>

                <span
                  className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                    partner.is_active
                      ? "bg-emerald-500"
                      : "bg-slate-300"
                  }`}
                  title={
                    partner.is_active ? "Active" : "Inactive"
                  }
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  {partner.name}
                </h2>
                <p className="text-sm text-slate-500">
                  {partner.country}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
              <button
                onClick={handleBack}
                className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Back to partners</span>
              </button>

            </div>
          </div>

          <div className="px-6 py-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Partner Overview
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
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
