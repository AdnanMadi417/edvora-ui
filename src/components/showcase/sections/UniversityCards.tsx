"use client";

import UniversityCard from "components/ub/data/cards/UniversityCard";
import { sampleUniversities } from "../fixtures/universities";
import { Demo } from "../Showcase";

export default function UniversityCards() {
  return (
    <Demo
      name="UniversityCard"
      path="components/ub/data/cards/UniversityCard.tsx"
      description="Adviser university directory card. Shows the institution, country, public/private status, intake months and language support, with links to its profile and programs."
      code={
        "<UniversityCard university={university} href={`/partner/universities/${university.id}`} programsHref={`/partner/knowledge-hub?university_id=${university.id}`} />"
      }
      props={[
        {
          name: "university",
          type: "University",
          description:
            "Institution data. Missing logo and intakes have explicit fallback states.",
        },
        {
          name: "href",
          type: "string",
          description: "University details route.",
        },
        {
          name: "programsHref",
          type: "string",
          description: "Knowledge Hub filtered to this university.",
        },
      ]}
    >
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        {sampleUniversities.map((university) => (
          <UniversityCard
            key={university.id}
            university={university}
            href="#c-university-profile"
            programsHref="#c-programcard"
          />
        ))}
      </div>
    </Demo>
  );
}
