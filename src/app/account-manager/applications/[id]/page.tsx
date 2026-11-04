"use client";

import { useParams } from "next/navigation";
import EmptyData from "components/ub/feedback/states/EmptyData";
import ApplicationDetails from "features/applications/account-manager/components/details/ApplicationDetails";
import Loading from "components/ub/feedback/states/Loading";
import Alert from "components/ub/feedback/notifications/Alert";
import { useAccountManagerApplication } from 'features/applications/hooks';


export default function ApplicationPage() {
  const { id: applicationId } = useParams<{ id: string }>();

  const { data: application, loading, error, refetch } = useAccountManagerApplication({
    applicationId: applicationId || "",
  });

  if (loading) return <Loading text="Fetching application data..." />;
  if (error) return <Alert tone="danger" title="This application couldn't load">{error}</Alert>;
  if (!application) return <EmptyData />;

  return (
    <ApplicationDetails application={application} onRefetch={refetch} />
  );
}
