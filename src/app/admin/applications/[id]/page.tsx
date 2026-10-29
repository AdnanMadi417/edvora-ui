"use client";

import { useParams } from "next/navigation";
import EmptyData from "components/ub/feedback/EmptyData";
import ApplicationDetails from "features/applications/admin/components/details/ApplicationDetails";
import Loading from "components/ub/feedback/Loading";
import { FaWhatsapp } from "react-icons/fa";
import { useApplicationDetails } from "features/applications/hooks";

// WhatsApp number is Unibexs' official Respond.io support line — same
// number across all three application detail pages (admin, account
// manager, partner). Replaces the in-app chat button (previously
// features/chat's ApplicationChat) per partner-support request: inquiries
// should go through one centrally-tracked channel instead of being split
// across the in-app chat and other channels.
const WHATSAPP_URL = "https://wa.me/601172591101";

export default function ApplicationPage() {
  const { id: applicationId } = useParams<{ id: string }>();
  const { applications: applicationData, loading, error, refetch } = useApplicationDetails(applicationId);

  if (loading) return <Loading text="Fetching application data..." />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!applicationData) return <EmptyData />;

  return (
    <>
      <ApplicationDetails application={applicationData} onRefetch={refetch} />

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
