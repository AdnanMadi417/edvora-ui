"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "lib/useApi";
import Cookies from "js-cookie";
import EmptyData from "components/emptyData/EmptyData";
import ApplicationDetails from "../../../../components/applications/details/account-manager/ApplicationDetails";
import ApplicationDocuments from "../../../../components/applications/details/account-manager/ApplicationDocuments";
import ApplicationCommission from "../../../../components/applications/details/account-manager/ApplicationCommission";
import Loading from "components/loading/Loading";


export default function ApplicationPage() {
  const { id } = useParams();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = Cookies.get("token");
        const managerId = localStorage.getItem("managerId");
        if (!managerId || !id) return;

        const res = await api.get(
          `/account-managers/${managerId}/applications/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Fetched application:", res.data);
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
      <ApplicationDocuments application={application} />
      {/*<ApplicationCommission application={application} />*/}
    </>
  );
}
