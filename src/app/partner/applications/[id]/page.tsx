"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "lib/useApi";
import Cookies from "js-cookie";

import EmptyData from "components/ub/feedback/EmptyData";
import Loading from "components/ub/feedback/Loading";
import Alert from "components/ub/feedback/Alert";

import { useSession } from "components/context/SessionContext";
import ApplicationDetails from "features/applications/partner/components/details/ApplicationDetails";
import type { ApplicationDetail } from "features/applications/shared/applicationTypes";


export default function ApplicationPage() {
  const { id: applicationId } = useParams<{ id: string }>();
  // localStorage is only set by the list page; a deep link falls back to the session's partner.
  const session = useSession();
  const sessionPartnerId = session?.partner?.id ?? session?.user?.partner_id ?? null;

  const [application, setApplication] = useState<ApplicationDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = async () => {
    try {
      setError(null);
      const token = Cookies.get("token");
      let partnerId: string | null = null;
      try {
        partnerId = localStorage.getItem("partnerId");
      } catch {
        /* storage blocked */
      }
      partnerId = partnerId || sessionPartnerId;
      if (!token || !partnerId) return;

      const res = await api.get<ApplicationDetail>(
        `/partners/${partnerId}/applications/${applicationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplication(res.data);
    } catch (err: any) {
      console.error("Error fetching application:", err);
      setError(err?.response?.data?.message || "Failed to fetch application details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [applicationId, sessionPartnerId]);

  if (loading) return <Loading text="Fetching application data..." />;
  if (error) return <Alert tone="danger" title="This application couldn't load">{error}</Alert>;
  if (!application) return <EmptyData />;

  return (
    <ApplicationDetails application={application} onRefetch={fetchApplication} />
  );
}
