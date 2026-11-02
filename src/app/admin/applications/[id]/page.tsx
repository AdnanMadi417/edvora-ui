"use client";

import { useParams } from "next/navigation";
import EmptyData from "components/ub/feedback/EmptyData";
import ApplicationDetails from "features/applications/admin/components/details/ApplicationDetails";
import Loading from "components/ub/feedback/Loading";
import Alert from "components/ub/feedback/Alert";
import { useApplicationDetails } from "features/applications/hooks";


export default function ApplicationPage() {
  const { id: applicationId } = useParams<{ id: string }>();
  const { applications: applicationData, loading, error, refetch } = useApplicationDetails(applicationId);

  if (loading) return <Loading text="Fetching application data..." />;
  if (error) return <Alert tone="danger" title="This application couldn't load">{error}</Alert>;
  if (!applicationData) return <EmptyData />;

  return (
    <ApplicationDetails application={applicationData} onRefetch={refetch} />
  );
}
