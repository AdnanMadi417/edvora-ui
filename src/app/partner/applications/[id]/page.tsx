"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "lib/useApi";
import Cookies from "js-cookie";
import EmptyData from "components/emptyData/EmptyData";
import ApplicationDetails from "../../../../components/applications/details/partner/ApplicationDetails";
import ApplicationDocuments from "../../../../components/applications/details/partner/ApplicationDocuments";
import OfferLetterDecision from "../../../../components/applications/details/partner/OfferLetterDecision";
import VisaTrackingTimeline from "../../../../components/applications/details/partner/VisaTrackingTimeline";
import Loading from "components/loading/Loading";

export default function ApplicationPage() {
  const { id } = useParams();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = Cookies.get("token");
        const partnerId = localStorage.getItem("partnerId");

        if (!token || !partnerId) {
          console.error("Missing token or partnerId", { token, partnerId });
          return;
        }

        const res = await api.get(
          `/partners/${partnerId}/applications/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setApplication(res.data);
      } catch (error) {
        console.error("Error fetching application:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  if (loading) return <Loading text="Fetching application data..." />;
  if (!application) return <EmptyData />;

  return (
    <>
      <ApplicationDetails application={application} />
      <OfferLetterDecision application={application} />
      <ApplicationDocuments application={application} />
      <VisaTrackingTimeline application={application} />
    </>
  );
}
