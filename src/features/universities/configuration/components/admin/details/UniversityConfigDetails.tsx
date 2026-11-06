"use client";

import { ArrowLeft } from "lucide-react";
import { useUniversityTypeDetails } from "features/universities/configuration/hooks";
import UniversityTypeDetailsView from "features/universities/configuration/components/shared/UniversityTypeDetailsView";
import Loading from "components/ub/feedback/states/Loading";
import EmptyData from "components/ub/feedback/states/EmptyData";
import LinkBtn from "components/ub/core/buttons/LinkBtn";

export default function UniversityConfigDetails({
  id,
  basePath = "/admin/config-universities",
}: {
  id: string;
  basePath?: string;
}) {
  const { university, loading, error } = useUniversityTypeDetails(id);
  if (loading) return <Loading text="Loading university type..." />;
  if (error || !university)
    return (
      <EmptyData
        title="University type unavailable"
        subtitle={error || "This configuration could not be found."}
        action={
          <LinkBtn
            href={basePath}
            label="Back to types"
            icon={<ArrowLeft className="h-4 w-4" />}
          />
        }
      />
    );
  return (
    <UniversityTypeDetailsView university={university} basePath={basePath} />
  );
}
