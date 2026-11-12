"use client";

import { useState } from "react";
import PipelineCard from "features/applications/partner/components/PipelineCard";
import { Demo } from "../Showcase";

const stages = [
  {
    id: "submission",
    name: "Application submission",
    code: "APPLICATION_REVIEW",
  },
  { id: "review", name: "Institution review", code: "OFFER_LETTER" },
  { id: "offer", name: "Offer & visa payment", code: "OFFER_LETTER" },
  { id: "visa", name: "Visa processing", code: "VISA_PROCESSING" },
  {
    id: "arrival",
    name: "Arrival & enrollment",
    code: "STUDENT_ARRIVAL_ENROLLMENT",
  },
  {
    id: "commission",
    name: "Partner commission invoicing",
    code: "PARTNER_COMMISSION_INVOICING",
  },
];
export default function ApplicationPipelineDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <Demo
      name="Application pipeline & statistics"
      path="features/applications/partner/components/PipelineCard.tsx"
      description="Role-scoped application statistics built with StatCard, a stage distribution bar and selectable stage tiles. Counts include the entire selected application status, independent of the table page or search."
    >
      <PipelineCard
        stages={stages}
        stageCounts={{
          submission: 12,
          review: 9,
          offer: 6,
          visa: 5,
          arrival: 3,
          commission: 7,
        }}
        stageActionRequired={{ submission: true }}
        selectedId={selected}
        onSelect={setSelected}
        totalCount={42}
        onViewCommission={() => setSelected("commission")}
      />
    </Demo>
  );
}
