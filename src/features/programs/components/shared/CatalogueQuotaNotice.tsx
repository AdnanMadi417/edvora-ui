"use client";

import { Hourglass } from "lucide-react";
import EmptyData from "components/ub/feedback/EmptyData";
import type { CatalogueQuotaError } from "features/programs/utils/catalogueQuota";

/**
 * Shown in place of the programs grid or a program page when the backend
 * answers with `catalogue_quota_exceeded` (UBX-425). It is a limit, not a
 * failure, so it is worded as one and offers no retry: the guard already
 * treats 429 as temporary and nothing navigates away.
 *
 * Deliberately vague. The numbers (limit, count, reset time) stay in the
 * backend's logs: telling a partner exactly where the line is only helps
 * someone pacing a scrape under it, and a legitimate partner just needs to
 * know it is a daily limit and who to talk to.
 */
export default function CatalogueQuotaNotice(_props: { quota: CatalogueQuotaError }) {
  return (
    <div data-testid="catalogue-quota-notice">
      <EmptyData
        icon={Hourglass}
        color="amber"
        title="You've reached today's limit for browsing the catalogue"
        subtitle={
          <>
            Please try again tomorrow.
            <br />
            If you need more for your work, contact your account manager.
          </>
        }
      />
    </div>
  );
}
