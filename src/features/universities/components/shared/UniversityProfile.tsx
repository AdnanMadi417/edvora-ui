"use client";

import {
  useUniversityDetails,
  useUniversityPaymentMethods,
} from "features/universities/hooks";
import Loading from "components/ub/feedback/states/Loading";
import EmptyData from "components/ub/feedback/states/EmptyData";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import { ArrowLeft } from "lucide-react";
import UniversityProfileView from "./UniversityProfileView";

export default function UniversityProfile({
  id,
  basePath,
  canManage = false,
}: {
  id: string;
  basePath: string;
  canManage?: boolean;
}) {
  const { university, branches, universityLoading, universityError } =
    useUniversityDetails(id);
  const { universityPaymentMethods, loading, error, refetch } =
    useUniversityPaymentMethods(canManage ? id : undefined);
  if (universityLoading)
    return <Loading text="Loading university details..." />;
  if (!university || (!canManage && university.is_hidden) || universityError)
    return (
      <EmptyData
        title="University unavailable"
        subtitle="This institution could not be found or is unavailable."
        action={
          <LinkBtn
            href={basePath}
            label="Back to universities"
            icon={<ArrowLeft className="h-4 w-4" />}
          />
        }
      />
    );
  return (
    <UniversityProfileView
      university={university}
      branches={branches}
      basePath={basePath}
      canManage={canManage}
      paymentMethods={universityPaymentMethods}
      paymentsLoading={loading}
      paymentsError={error}
      onRetryPayments={refetch}
    />
  );
}
