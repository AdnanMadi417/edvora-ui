"use client";
import { useEffect, useRef, useState } from "react";
import { Save } from "lucide-react";
import Input from "components/ub/forms/text/Input";
import Textarea from "components/ub/forms/text/Textarea";
import Button from "components/ub/core/buttons/Button";
import DetailsSection from "components/ub/data/cards/DetailsSection";
import RepeatableSection from "features/universities/language-centers/components/RepeatableSection";
import CentreConfigurationFields from "features/universities/language-centers/components/CentreConfigurationFields";
import {
  configurationSchema,
  newId,
} from "features/universities/language-centers/configuration";
import { useAssignedCentre } from "./CentreAccessBoundary";
import LocalAssetUpload from "./LocalAssetUpload";
import { saveAssignedCentre } from "../services/centreWorkspace";
import type { ManagedCentre } from "../model/types";
const grid = "grid gap-4 sm:grid-cols-2";
export default function CentreEditor({
  section,
}: {
  section: "profile" | "branches" | "courses";
}) {
  const { actor, centre } = useAssignedCentre();
  const [draft, setDraft] = useState<ManagedCentre>(centre);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const [uploading, setUploading] = useState(false);
  const draftKey = `${centre.id}:${section}`;
  const previousKey = useRef(draftKey);
  useEffect(() => {
    if (previousKey.current === draftKey) return;
    previousKey.current = draftKey;
    setDraft(centre);
    setErrors({});
    setMessage("");
    setFailure("");
  }, [centre, draftKey]);
  const config = draft.configuration;
  const update = (patch: Partial<typeof config>) => {
    setDraft((previous) => ({
      ...previous,
      configuration: { ...previous.configuration, ...patch },
    }));
    setMessage("");
  };
  const field = (
    label: string,
    key: "name" | "location" | "website" | "email" | "phone",
    type = "text",
    required = false
  ) => (
    <Input
      wrapperClassName="mb-0"
      label={label}
      value={config[key]}
      onChange={(value) => update({ [key]: value })}
      type={type}
      required={required}
      error={errors[key]}
    />
  );
  return (
    <form
      noValidate
      className="mx-auto max-w-5xl space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (uploading) return;
        setFailure("");
        setMessage("");
        const validation = configurationSchema.safeParse(config);
        const next = validation.success
          ? {}
          : Object.fromEntries(
              validation.error.issues.map((issue) => [
                issue.path.join("."),
                issue.message,
              ])
            );
        draft.branches.forEach((branch, index) => {
          if (!branch.name.trim() || !branch.location.trim())
            next[`branches.${index}`] = "Enter the branch name and location.";
        });
        setErrors(next);
        if (Object.keys(next).length) {
          setFailure("Review the highlighted fields before saving.");
          return;
        }
        try {
          saveAssignedCentre(actor, centre.id, {
            configuration: config,
            branches: draft.branches,
            logo: draft.logo,
            images: draft.images,
          });
          setMessage("Centre information saved.");
        } catch (error) {
          setFailure(
            error instanceof Error
              ? error.message
              : "Unable to save. Try again."
          );
        }
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-ub-heading-lg">
            {section === "profile"
              ? "Centre Profile"
              : section === "branches"
              ? "Branches"
              : "Courses"}
          </h2>
          <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
            {centre.configuration.name}
          </p>
        </div>
        <Button
          type="submit"
          text="Save changes"
          icon={<Save className="h-4 w-4" />}
          disabled={uploading}
          variant="primary"
        />
      </div>
      {failure && (
        <p role="alert" className="text-ub-body-sm text-ub-tone-danger-text">
          {failure}
        </p>
      )}
      {message && (
        <p role="status" className="text-ub-body-sm text-ub-text-secondary">
          {message}
        </p>
      )}
      <fieldset disabled={uploading} className="min-w-0 space-y-5">
        {section === "profile" && (
          <>
            <DetailsSection
              title="Centre information"
              description="Centre type and university association are controlled by Unibexs Admins."
            >
              <div className="space-y-4">
                <p className="text-ub-label-sm text-ub-text-secondary">
                  {centre.type === "independent"
                    ? "Independent language centre"
                    : "University-linked language centre"}
                </p>
                {field("Centre name", "name", "text", true)}
                <Textarea
                  label="Description"
                  value={config.description}
                  onChange={(description) => update({ description })}
                  wrapperClassName="mb-0"
                />
                <div className={grid}>
                  {field("Location", "location")}
                  {field("Official website", "website", "url")}
                  {field("Contact email", "email", "email")}
                  {field("Contact phone", "phone", "tel")}
                </div>
              </div>
            </DetailsSection>
            <DetailsSection title="Logo and images">
              <div className="space-y-5">
                <LocalAssetUpload
                  label="Centre logo"
                  asset={draft.logo}
                  onBusy={setUploading}
                  onChange={(logo) =>
                    setDraft((previous) => ({ ...previous, logo }))
                  }
                />
                {draft.images.map((image) => (
                  <LocalAssetUpload
                    key={image.id}
                    label={image.name}
                    asset={image}
                    onBusy={setUploading}
                    onChange={(asset) =>
                      setDraft((previous) => ({
                        ...previous,
                        images: asset
                          ? previous.images.map((row) =>
                              row.id === image.id
                                ? { ...asset, id: image.id }
                                : row
                            )
                          : previous.images.filter(
                              (row) => row.id !== image.id
                            ),
                      }))
                    }
                  />
                ))}
                {draft.images.length < 4 && (
                  <LocalAssetUpload
                    label="Add centre image"
                    asset={null}
                    onBusy={setUploading}
                    onChange={(image) => {
                      if (image)
                        setDraft((previous) => ({
                          ...previous,
                          images: [
                            ...previous.images,
                            { ...image, id: newId() },
                          ],
                        }));
                    }}
                  />
                )}
              </div>
            </DetailsSection>
            <DetailsSection title="Brochure and official links">
              <div className="space-y-5">
                <LocalAssetUpload
                  label="Brochure"
                  pdf
                  asset={
                    config.brochure
                      ? {
                          name: config.brochure.name,
                          url: config.brochure.dataUrl,
                        }
                      : null
                  }
                  onBusy={setUploading}
                  onChange={(asset) =>
                    update({
                      brochure: asset
                        ? { name: asset.name, dataUrl: asset.url }
                        : null,
                    })
                  }
                />
                <RepeatableSection
                  title="Official links"
                  singular="official link"
                  items={config.sources}
                  create={() => ({ id: newId(), label: "", url: "" })}
                  onChange={(sources) => update({ sources })}
                >
                  {(source, change, i) => (
                    <div className={grid}>
                      <Input
                        label="Link label"
                        value={source.label}
                        onChange={(label) => change({ label })}
                        required
                        error={errors[`sources.${i}.label`]}
                      />
                      <Input
                        label="Official URL"
                        value={source.url}
                        type="url"
                        onChange={(url) => change({ url })}
                        required
                        error={errors[`sources.${i}.url`]}
                      />
                    </div>
                  )}
                </RepeatableSection>
              </div>
            </DetailsSection>
          </>
        )}
        {section === "branches" && (
          <DetailsSection title="Branches and locations">
            <RepeatableSection
              title="Branches"
              singular="branch"
              items={draft.branches}
              create={() => ({
                id: newId(),
                name: "",
                location: "",
                address: "",
              })}
              onChange={(branches) =>
                setDraft((previous) => ({ ...previous, branches }))
              }
            >
              {(branch, change, i) => (
                <div className="space-y-4">
                  {errors[`branches.${i}`] && (
                    <p role="alert" className="text-ub-tone-danger-text">
                      {errors[`branches.${i}`]}
                    </p>
                  )}
                  <div className={grid}>
                    <Input
                      label="Branch name"
                      required
                      value={branch.name}
                      onChange={(name) => change({ name })}
                    />
                    <Input
                      label="Location"
                      required
                      value={branch.location}
                      onChange={(location) => change({ location })}
                    />
                  </div>
                  <Textarea
                    label="Address"
                    value={branch.address}
                    onChange={(address) => change({ address })}
                  />
                </div>
              )}
            </RepeatableSection>
          </DetailsSection>
        )}
        {section === "courses" && (
          <>
            <CentreConfigurationFields
              coursesOnly
              value={config}
              errors={errors}
              onChange={(configuration) =>
                setDraft((previous) => ({ ...previous, configuration }))
              }
            />
            <DetailsSection
              title="Course intakes"
              description="Add available start dates for each course."
            >
              {config.courses.length ? (
                <div className="space-y-6">
                  {config.courses.map((course, ci) => (
                    <div key={course.id} className="space-y-3">
                      <h3 className="text-ub-heading-sm">
                        {course.name || `Course ${ci + 1}`}
                      </h3>
                      <RepeatableSection
                        title={`${course.name || "Course"} intakes`}
                        singular="intake"
                        items={course.intakes}
                        create={() => ({ id: newId(), date: "" })}
                        onChange={(intakes) =>
                          update({
                            courses: config.courses.map((row) =>
                              row.id === course.id ? { ...row, intakes } : row
                            ),
                          })
                        }
                      >
                        {(intake, change, i) => (
                          <Input
                            label="Start date"
                            type="date"
                            required
                            value={intake.date}
                            error={errors[`courses.${ci}.intakes.${i}.date`]}
                            onChange={(date) => change({ date })}
                          />
                        )}
                      </RepeatableSection>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-ub-body-sm text-ub-text-secondary">
                  Add a course before adding its intakes.
                </p>
              )}
            </DetailsSection>
          </>
        )}
      </fieldset>
    </form>
  );
}
