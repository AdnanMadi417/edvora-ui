import { partners } from "components/data/applications";
import React from "react";
import EmptyData from "components/emptyData/EmptyData";
import {
  FaHandshake,
  FaBuilding,
  FaRegAddressCard,
  FaUserTie,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobeAsia,
  FaIdBadge,
} from "react-icons/fa";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import PartnerSummaryCards from "components/partner/cards/PartnerSummaryCards"

interface PartnerPageProps {
  params: {
    id: string;
  };
}

export default function PartnerPage({ params }: PartnerPageProps) {
  const { id } = params;

  const partner = partners.find((p) => p.id === id);

  if (!partner) {
    return <EmptyData />;
  }

  return (
    <section className="min-h-screen">


      <div className="mb-6 mt-6 rounded-xl border border-default bg-card shadow-sm">
        <div className="rounded-t-xl border-b border-default bg-white/60 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-6">
                <Link
                  href="/account-manager/partners"
                  className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span>Back to Partners</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-6 px-6 py-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <FaHandshake className="text-xl text-blue-700" />
            </span>

            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-800">
                {partner.businessName}
              </h2>
              <p className="text-sm text-text-muted">
                <span className="font-medium text-text-secondary">
                  Partner Type :
                </span>{" "}
                {partner.type}
                <span
                  className={`ml-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    partner.status === "registered"
                      ? "bg-green-100 text-green-700"
                      : partner.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {partner.status.charAt(0).toUpperCase() +
                    partner.status.slice(1)}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-1 text-right">
            <p className="text-xs text-text-muted">Registered on</p>
            <p className="text-sm font-medium text-text-secondary">
              {new Date(partner.registeredAt).toLocaleDateString("en-MY")}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-0 mt-0">
        <PartnerSummaryCards />
      </div>

      <div className="mb-5 mt-5 block space-y-4 rounded-lg border border-default bg-card p-6 shadow-sm">
        <h3 className="text-p3 mb-6 flex items-center gap-3 font-semibold text-text-primary">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <FaBuilding className="text-xl text-blue-700" />
          </span>
          Business Information
        </h3>

        <div className="grid grid-cols-1 gap-4 text-p2 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          <div className="block">
            <span className="mb-1 font-medium text-text-primary">
              Business Name
            </span>
            <span className="flex items-center gap-2 text-text-muted">
              <FaRegAddressCard />
              {partner.businessName?.trim() || "Not provided"}
            </span>
          </div>

          <div className="block">
            <span className="mb-1 font-medium text-text-primary">
              Registration Number
            </span>
            <span className="flex items-center gap-2 text-text-muted">
              <FaIdBadge />
              {partner.registrationNumber?.trim() || "Not provided"}
            </span>
          </div>

          <div className="block">
            <span className="mb-1 font-medium text-text-primary">
              Contact Person
            </span>
            <span className="flex items-center gap-2 text-text-muted">
              <FaUserTie />
              {partner.contactPerson?.trim() || "Not provided"}
            </span>
          </div>

          <div className="block">
            <span className="mb-1 font-medium text-text-primary">
              Business Address
            </span>
            <span className="flex items-center gap-2 text-text-muted">
              <FaMapMarkerAlt />
              {partner.businessAddress?.trim() || "Not provided"}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-5 mt-5 block space-y-4 rounded-lg border border-default bg-card p-6 shadow-sm">
        <h3 className="text-p3 mb-6 flex items-center gap-3 font-semibold text-text-primary">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <FaEnvelope className="text-xl text-blue-700" />
          </span>
          Contact Information
        </h3>

        <div className="grid grid-cols-1 gap-4 text-p2 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          <div className="block">
            <span className="mb-1 font-medium text-text-primary">Phone</span>
            <span className="flex items-center gap-2 text-text-muted">
              <FaPhoneAlt />
              {partner.phoneContact?.trim() || "Not provided"}
            </span>
          </div>

          <div className="block">
            <span className="mb-1 font-medium text-text-primary">Email</span>
            <span className="flex items-center gap-2 text-text-muted">
              <FaEnvelope />
              {partner.emailContact?.trim() || "Not provided"}
            </span>
          </div>

          <div className="block">
            <span className="mb-1 font-medium text-text-primary">
              Contact Person
            </span>
            <span className="flex items-center gap-2 text-text-muted">
              <FaUserTie />
              {partner.contactPerson?.trim() || "Not provided"}
            </span>
          </div>

          <div className="block">
            <span className="mb-1 font-medium text-text-primary">Country</span>
            <span className="flex items-center gap-2 text-text-muted">
              <FaGlobeAsia />
              {partner.country?.trim() || "Not provided"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
