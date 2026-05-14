"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { MdCategory, MdPhone, MdPublic, MdSupervisorAccount, MdToggleOn, MdVerified } from "react-icons/md";
import { usePartnerDetails } from "../hooks";
import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";

interface Props {
  id: string;
}

export default function PartnerDetails({ id }: Props) {
  const router = useRouter();
  const { partner, isPartnerLoading } = usePartnerDetails(id);

  if (isPartnerLoading) return <Loading text="Loading partner details..." />;
  if (!partner) return <EmptyData />;

  return (
    <div className="mt-6 max-w-5xl mx-auto">
      <div className="rounded-md border bg-card shadow-sm">
        <div className="flex justify-between border-b p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
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

          <button
            onClick={() => router.push("/admin/partners")}
            className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back to partners</span>
          </button>
        </div>

        <div className="px-6 py-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Partner Overview
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { icon: MdPublic, label: "Country", value: partner.country },
              { icon: MdPhone, label: "Phone Number", value: partner.phone },
              { icon: MdCategory, label: "Partner Type", value: partner.type },
              { icon: MdSupervisorAccount, label: "Assigned Manager", value: partner.assigned_manager_name || "Not Assigned" },
              { icon: MdVerified, label: "Verification Status", value: partner.is_verified ? "Verified" : "Not Verified" },
              { icon: MdToggleOn, label: "Account Status", value: partner.is_active ? "Active" : "Inactive" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-0.5 truncate text-sm font-medium capitalize text-slate-900">
                    {value || "Not Provided"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
