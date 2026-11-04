"use client";

import { Building2, Landmark } from "lucide-react";
import RadioCardGroup from "./RadioCardGroup";

interface Props {
  value: boolean;
  onChange: (value: boolean) => void;
}

/** Institution ownership is an explicit choice, rather than an on/off setting. */
export default function InstitutionTypeField({ value, onChange }: Props) {
  return (
    <section data-field="is_public" className="mb-4 space-y-2">
      <h3 className="text-ub-label-md text-ub-text-primary">
        Institution type
      </h3>
      <RadioCardGroup
        ariaLabel="Institution type"
        value={value ? "public" : "private"}
        onChange={(next) => onChange(next === "public")}
        options={[
          {
            value: "public",
            label: "Public",
            hint: "Public institution",
            icon: Landmark,
          },
          {
            value: "private",
            label: "Private",
            hint: "Private institution",
            icon: Building2,
          },
        ]}
      />
    </section>
  );
}
