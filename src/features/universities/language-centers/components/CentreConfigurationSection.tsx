"use client";
import SectionCard from "components/ub/data/cards/SectionCard";
import Button from "components/ub/core/buttons/Button";
import Toggle from "components/ub/forms/choices/Toggle";
import CentreConfigurationFields from "./CentreConfigurationFields";
import type { CentreConfiguration } from "../configuration";

/** Shared university form section for Admin and Data Entry. */
export default function CentreConfigurationSection({
  enabled,
  onEnabledChange,
  value,
  onChange,
  loading = false,
  error,
  onRetry,
  errors,
}: {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  value: CentreConfiguration;
  onChange: (value: CentreConfiguration) => void;
  loading?: boolean;
  error?: string | null;
  onRetry: () => void;
  errors?: Record<string, string>;
}) {
  return (
    <SectionCard
      title="Language Centre"
      description="Courses, levels and pricing at this university."
      as="h3"
    >
      <div className="space-y-5">
        <Toggle
          label="Has Language Centre"
          checked={enabled}
          onChange={onEnabledChange}
          description={
            enabled
              ? "Configure the centre and its available courses."
              : "Enable to add a language centre."
          }
          switchPosition="end"
        />
        {enabled &&
          (loading ? (
            <p role="status">Loading Language Centre…</p>
          ) : error ? (
            <div role="alert" className="space-y-3">
              <p>{error}</p>
              <Button text="Try again" onClick={onRetry} />
            </div>
          ) : (
            <CentreConfigurationFields
              value={{ ...value, enabled: true }}
              onChange={onChange}
              errors={errors}
            />
          ))}
      </div>
    </SectionCard>
  );
}
