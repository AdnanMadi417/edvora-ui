"use client";

import { Hourglass } from "lucide-react";
import EmptyData from "components/emptyData/EmptyData";
import {
  CatalogueQuotaError,
  catalogueQuotaMetricLabel,
  describeCatalogueQuotaReset,
} from "features/programs/utils/catalogueQuota";

/**
 * Shown in place of the programs grid or a program page when the backend
 * answers with `catalogue_quota_exceeded` (UBX-425). It is a limit, not a
 * failure, so it is worded as one and offers no retry: the guard already
 * treats 429 as temporary and nothing navigates away.
 */
export default function CatalogueQuotaNotice({ quota }: { quota: CatalogueQuotaError }) {
  const what = catalogueQuotaMetricLabel(quota.metric);
  const usage = quota.limit
    ? `Partner accounts can view up to ${quota.limit.toLocaleString()} ${what} a day. `
    : "";
  return (
    <div data-testid="catalogue-quota-notice">
      <EmptyData
        icon={Hourglass}
        color="amber"
        title="You've reached today's catalogue limit"
        subtitle={
          <>
            {usage}
            {describeCatalogueQuotaReset(quota.resetsAt)}
            <br />
            If you need more for your work today, contact your account manager.
          </>
        }
      />
    </div>
  );
}
