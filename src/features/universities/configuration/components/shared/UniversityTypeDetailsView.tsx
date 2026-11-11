"use client";

import Breadcrumbs from "components/ub/navigation/links/Breadcrumbs";
import { useState } from "react";
import { Layers, Pencil } from "lucide-react";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import Tag from "components/ub/data/badges/Tag";
import SectionCard from "components/ub/data/cards/SectionCard";
import StatCard from "components/ub/dashboard/cards/StatCard";
import SearchInput from "components/ub/forms/selection/SearchInput";
import SelectInput from "components/ub/forms/selection/SelectInput";
import type { UniversityTypeDetails } from "features/universities/configuration/types";

export default function UniversityTypeDetailsView({
  university,
  basePath = "/admin/config-universities",
}: {
  university: UniversityTypeDetails;
  basePath?: string;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const required = university.required_fields.filter(
    (field) => field.is_required
  ).length;
  const optional = university.required_fields.length - required;
  const fields = university.required_fields.filter(
    (field) =>
      field.field_name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "all" || field.is_required === (filter === "required"))
  );
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-5 pb-6">
      <header className="overflow-hidden rounded-ub-lg border border-ub-border bg-ub-surface shadow-ub-xs">
        <div className="h-1.5 bg-ub-action-primary" />
        <div className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-ub-md bg-ub-tone-brand-bg">
              <Layers
                className="h-6 w-6 text-ub-tone-brand-text"
                aria-hidden="true"
              />
            </span>
            <div className="min-w-0">
              <Breadcrumbs items={[{ label: "University types", href: basePath }, { label: university.name }]} />
              <h2 className="mt-1 break-words text-ub-heading-xl-mobile text-ub-text-primary sm:text-ub-heading-xl">
                {university.name}
              </h2>
              <p className="mt-2 max-w-2xl whitespace-pre-wrap break-words text-ub-body-sm text-ub-text-secondary">
                {university.description || "No description provided."}
              </p>
            </div>
          </div>
          <LinkBtn
            href={`${basePath}/${university.id}/edit`}
            label="Edit type"
            icon={<Pencil className="h-4 w-4" />}
            variant="primary"
            className="min-h-[44px] shrink-0"
          />
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Configured fields"
          value={university.required_fields.length}
          caption="Application submission rules"
          variant="highlighted"
          className="col-span-2 sm:col-span-1"
        />
        <StatCard
          label="Required"
          value={required}
          caption="Must be completed"
        />
        <StatCard
          label="Optional"
          value={optional}
          caption="Can be left blank"
        />
      </div>
      <SectionCard
        title="Application requirements"
        as="h2"
        description="Institutions assigned to this type use these field requirements when applications are submitted."
      >
        <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row">
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search field requirements..."
            className="min-w-0 flex-1"
          />
          <div className="sm:w-48">
            <SelectInput
              field="filter"
              aria-label="Requirement status"
              formData={{ filter }}
              options={[
                { value: "all", label: "All fields" },
                { value: "required", label: "Required only" },
                { value: "optional", label: "Optional only" },
              ]}
              updateFormData={(_, value) => setFilter(value)}
            />
          </div>
        </div>
        <p
          role="status"
          className="mb-3 text-ub-label-sm text-ub-text-tertiary"
        >
          {fields.length} {fields.length === 1 ? "field" : "fields"} shown
        </p>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {fields.length ? (
            fields.map((field) => (
              <div
                key={field.id}
                className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-ub-md border border-ub-border bg-ub-surface-subtle p-4"
              >
                <p className="min-w-0 flex-1 break-words text-ub-label-md text-ub-text-primary">
                  {field.field_name}
                </p>
                <Tag hue={field.is_required ? "amber" : "grey"} size="sm">
                  {field.is_required ? "Required" : "Optional"}
                </Tag>
              </div>
            ))
          ) : (
            <p className="text-ub-body-sm text-ub-text-secondary">
              {university.required_fields.length
                ? "No fields match your search."
                : "No field rules are configured for this type."}
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
