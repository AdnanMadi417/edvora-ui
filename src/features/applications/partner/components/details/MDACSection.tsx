"use client";

import React from "react";
import { Plane, ExternalLink } from "lucide-react";
import SectionIconBadge from "components/ub/icons/SectionIconBadge";
import Button from "components/ub/core/Button";

const MDAC_URL = "https://imigresen-online.imi.gov.my/mdac/main";

/**
 * Standalone section pointing students/partners to the official Malaysia
 * Digital Arrival Card portal. Deliberately independent of the Visa
 * section/OfferLetterDecision — no application state, no backend call, just
 * a static link out.
 */
export default function MDACSection() {
  return (
    <div className="flex flex-col items-start gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-start gap-3">
        <SectionIconBadge icon={Plane} color="blue" />
        <div>
          <h3 className="text-p3 font-semibold text-slate-900">
            Malaysia Digital Arrival Card (MDAC)
          </h3>
          <span className="text-sm text-slate-500">
            Complete your Malaysia Digital Arrival Card before travelling to Malaysia, if applicable.
          </span>
        </div>
      </div>

      <Button
        onClick={() => window.open(MDAC_URL, "_blank", "noopener,noreferrer")}
        icon={<ExternalLink className="h-4 w-4" />}
        text="Apply for MDAC"
        bgColor="bg-blue-50"
        textColor="text-blue-700"
        borderColor="border-blue-500"
        hoverTextColor="hover:text-blue-700"
        hoverBorderColor="hover:border-blue-600"
        className="w-full hover:bg-blue-100 sm:w-auto sm:shrink-0"
      />
    </div>
  );
}
