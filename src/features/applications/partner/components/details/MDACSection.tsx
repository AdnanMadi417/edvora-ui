"use client";

import { ExternalLink } from "lucide-react";
import { buttonBase, buttonSizes, buttonVariants } from "components/ub/recipes";
import SectionCard from "components/ub/data/cards/SectionCard";

const MDAC_URL = "https://imigresen-online.imi.gov.my/mdac/main";

/**
 * Points Advisors to the official Malaysia Digital Arrival Card portal.
 * Deliberately independent of the visa section: no application state, no
 * backend call, just a link out.
 */
export default function MDACSection() {
  return (
    <SectionCard
      title="Malaysia Digital Arrival Card (MDAC)"
      description="Complete the Malaysia Digital Arrival Card before travelling to Malaysia, if applicable."
      action={
        <a href={MDAC_URL} target="_blank" rel="noopener noreferrer" className={`${buttonBase} ${buttonSizes.sm} ${buttonVariants.secondary}`}>
          Apply for MDAC
          <ExternalLink className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      }
    />
  );
}
