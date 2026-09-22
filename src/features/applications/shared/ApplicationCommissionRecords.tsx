"use client";

import React from "react";
// `Clock` is only used by the hidden payout-timeline line below.
// import { Clock, Calendar } from "lucide-react";
import { Calendar } from "lucide-react";
import { DetailStatusBadge } from "components/ui/badges";
import AppDate from "components/ui/date/AppDate";
import { getStatusVariant } from "utils/getStatusVariant";
import {
  type ApplicationCommissionItem,
  formatCommissionAmount,
  // formatCommissionTimeline,
} from "features/applications/shared/commissionTypes";

interface ApplicationCommissionRecordsProps {
  commissions: ApplicationCommissionItem[];
}

export default function ApplicationCommissionRecords({
  commissions,
}: ApplicationCommissionRecordsProps) {
  if (commissions.length === 0) return null;

  return (
    <div className="space-y-3 border-b border-slate-200 p-6">
      {commissions.map((c) => {
        // Payout timeline intentionally hidden: the window is set by the
        // university, not by us, so we must not present it as a commitment.
        // Backend still sends expected_commission_from/to; left in the type.
        // const timeline = formatCommissionTimeline(c.expected_commission_from, c.expected_commission_to);
        return (
          <div key={c.id} className="flex flex-wrap items-start justify-between gap-3">
            <div>
              {c.amount != null && (
                <p className="text-lg font-bold text-slate-900">
                  {formatCommissionAmount(c.amount, c.currency)}
                  {c.commission_type && (
                    <span className="ml-2 text-xs font-normal text-slate-400">{c.commission_type}</span>
                  )}
                </p>
              )}
              {c.notes && <p className="mt-1 text-sm text-slate-500">{c.notes}</p>}
              {/* Hidden — see note above.
              {timeline && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  {timeline}
                </p>
              )}
              */}
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                Added on <AppDate value={c.created_at} format="short" />
              </p>
            </div>
            <DetailStatusBadge variant={getStatusVariant(c.status)}>{c.status}</DetailStatusBadge>
          </div>
        );
      })}
    </div>
  );
}
