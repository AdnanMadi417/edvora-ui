"use client";

import Button from "components/ub/core/buttons/Button";
import ProgramDetailsView from "features/programs/components/shared/details/ProgramDetailsView";
import { sampleProgram, sampleProgramDocuments } from "../fixtures/program";
import { Demo } from "../Showcase";

export default function ProgramDetailsDemo() {
  return (
    <Demo
      name="Program details"
      path="features/programs/components/shared/details/ProgramDetailsView.tsx"
      description="Shared program detail page for all roles. Scroll to sections, switch fee currency, copy a summary and expand optional documents. Actions in this preview are disabled."
    >
      <ProgramDetailsView
        program={sampleProgram}
        commission={sampleProgram.commission}
        requiredDocuments={sampleProgramDocuments}
        exchangeRates={[{ to_currency: "USD", rate: 0.23 }]}
        actions={
          <>
            <Button variant="primary" text="Apply now" disabled />
            <Button variant="secondary" text="Back to programs" disabled />
          </>
        }
      />
    </Demo>
  );
}
