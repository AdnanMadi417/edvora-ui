"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import api from "lib/useApi";
import Cookies from "js-cookie";

import EmptyData from "components/emptyData/EmptyData";
import Loading from "components/loading/Loading";

import ApplicationDetails from "features/applications/partner/components/details/ApplicationDetails";
import type { ApplicationDetail } from "features/applications/shared/applicationTypes";

// WhatsApp number is Unibexs' official Respond.io support line — same
// number across all three application detail pages (admin, account
// manager, partner). Replaces the in-app chat button (previously
// features/chat's ApplicationChat) per partner-support request: inquiries
// should go through one centrally-tracked channel instead of being split
// across the in-app chat and other channels.
const WHATSAPP_URL = "https://wa.me/601172591101";

export default function ApplicationPage() {
  const { id: applicationId } = useParams<{ id: string }>();

  const [application, setApplication] = useState<ApplicationDetail | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchApplication = async () => {
    try {
      const token = Cookies.get("token");
      const partnerId = localStorage.getItem("partnerId");
      if (!token || !partnerId) return;

      const res = await api.get<ApplicationDetail>(
        `/partners/${partnerId}/applications/${applicationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplication(res.data);
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  if (loading) return <Loading text="Fetching application data..." />;
  if (!application) return <EmptyData />;

  return (
    <>
      <ApplicationDetails application={application} onRefetch={fetchApplication} />
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition hover:scale-105 hover:bg-whatsapp-dark"
      >
        <FaWhatsapp size={28} />
      </a>
    </>
  );
}
