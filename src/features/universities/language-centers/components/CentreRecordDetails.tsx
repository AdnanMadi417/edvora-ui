"use client";
import type { ReactNode } from "react";
import Button from "components/ub/core/buttons/Button";
import { useCentreConfiguration } from "../hooks/useCentreConfiguration";
import CentreConfigurationView from "./CentreConfigurationView";

/** Use the same course and price presentation in row details and university profiles. */
export default function CentreRecordDetails({
  universityId,
  centreId,
  children,
}: {
  universityId: string;
  centreId?: string;
  children: ReactNode;
}) {
  const centre = useCentreConfiguration(universityId, centreId);
  if (centre.loading)
    return <p role="status">Loading language centre details…</p>;
  if (centre.error)
    return (
      <div role="alert" className="space-y-3">
        <p>{centre.error}</p>
        <Button text="Try again" onClick={centre.retry} />
      </div>
    );
  return centre.exists && centre.value.enabled ? (
    <CentreConfigurationView value={centre.value} />
  ) : (
    <>{children}</>
  );
}
