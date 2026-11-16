"use client";
import { useEffect, useRef } from "react";
import Input from "components/ub/forms/text/Input";
import Textarea from "components/ub/forms/text/Textarea";
import Combobox from "components/ub/forms/selection/Combobox";
import RepeatableSection from "./RepeatableSection";
import { emptyCourse, newId, type CentreConfiguration } from "../configuration";

const grid = "grid min-w-0 gap-4 sm:grid-cols-2";
export default function CentreConfigurationFields({
  value,
  onChange,
  errors = {},
}: {
  value: CentreConfiguration;
  onChange: (value: CentreConfiguration) => void;
  errors?: Record<string, string>;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const invalid = root.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]'
    );
    if (!invalid) return;
    let parent = invalid.parentElement;
    while (parent && parent !== root.current) {
      if (parent instanceof HTMLDetailsElement) parent.open = true;
      parent = parent.parentElement;
    }
    invalid.focus();
  }, [errors]);
  const update = (patch: Partial<CentreConfiguration>) =>
    onChange({ ...value, ...patch });
  const field = (
    label: string,
    current: string,
    change: (v: string) => void,
    path: string,
    type = "text",
    required = false
  ) => (
    <Input
      wrapperClassName="mb-0"
      label={label}
      value={current}
      onChange={change}
      type={type}
      required={required}
      error={errors[path]}
      min={type === "number" ? "0" : undefined}
      step={type === "number" ? "any" : undefined}
    />
  );
  return (
    <div
      ref={root}
      className="space-y-5"
      aria-label="Language Centre configuration"
    >
      <p className="text-ub-body-sm text-ub-text-secondary">
        Saved with this university in this browser. Add only confirmed
        information; leave unavailable details blank.
      </p>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="text-ub-body-sm text-ub-danger-600">
          Review the highlighted language centre fields. Expand the sections
          below to correct them.
        </p>
      )}
      <details open className="rounded-ub-lg border border-ub-border p-4">
        <summary className="cursor-pointer text-ub-heading-sm text-ub-text-primary">
          Centre overview
        </summary>
        <div className="mt-4 space-y-4">
          {field(
            "Centre name",
            value.name,
            (name) => update({ name }),
            "name",
            "text",
            true
          )}
          <Textarea
            wrapperClassName="mb-0"
            label="Centre description"
            value={value.description}
            onChange={(description) => update({ description })}
          />
          <div className={grid}>
            {field(
              "Centre location",
              value.location,
              (location) => update({ location }),
              "location"
            )}
          </div>
        </div>
      </details>
      <details open className="rounded-ub-lg border border-ub-border p-4">
        <summary className="cursor-pointer text-ub-heading-sm text-ub-text-primary">
          Courses, levels and pricing
        </summary>
        <div className="mt-4">
          <RepeatableSection
            title="Courses"
            singular="course"
            items={value.courses}
            create={emptyCourse}
            onChange={(courses) => update({ courses })}
          >
            {(course, change, ci) => {
              const path = `courses.${ci}`;
              const f = (
                label: string,
                key:
                  | "name"
                  | "language"
                  | "studyMode"
                  | "entryRequirements"
                  | "placementTest",
                required = false
              ) =>
                field(
                  label,
                  course[key],
                  (v) => change({ [key]: v }),
                  `${path}.${key}`,
                  "text",
                  required
                );
              const money = (
                row: { amount: string; currency: string },
                patch: (v: { amount?: string; currency?: string }) => void,
                prefix: string
              ) => (
                <>
                  {field(
                    "Amount",
                    row.amount,
                    (amount) => patch({ amount }),
                    `${prefix}.amount`,
                    "number",
                    true
                  )}
                  {field(
                    "Currency code",
                    row.currency,
                    (currency) => patch({ currency: currency.toUpperCase() }),
                    `${prefix}.currency`,
                    "text",
                    true
                  )}
                </>
              );
              return (
                <div className="space-y-5">
                  <div className={grid}>
                    {f("Course name", "name", true)}
                    {f("Language", "language", true)}
                    {f("Study mode", "studyMode")}
                  </div>
                  <Textarea
                    wrapperClassName="mb-0"
                    label="Entry requirements"
                    value={course.entryRequirements}
                    onChange={(entryRequirements) =>
                      change({ entryRequirements })
                    }
                  />
                  <Textarea
                    wrapperClassName="mb-0"
                    label="Placement test details"
                    value={course.placementTest}
                    onChange={(placementTest) => change({ placementTest })}
                  />
                  <details open>
                    <summary className="cursor-pointer text-ub-label-md">
                      Levels
                    </summary>
                    <div className="mt-4 space-y-5">
                      <RepeatableSection
                        title="Levels"
                        singular="level"
                        items={course.levels}
                        create={() => ({
                          id: newId(),
                          name: "",
                          order: "",
                          duration: "",
                          learningHours: "",
                        })}
                        onChange={(levels) =>
                          change({
                            levels,
                            fees: course.fees.map((fee) =>
                              levels.some((l) => l.id === fee.levelId)
                                ? fee
                                : { ...fee, levelId: "" }
                            ),
                          })
                        }
                      >
                        {(level, patch, i) => (
                          <div className={grid}>
                            {field(
                              "Level name",
                              level.name,
                              (name) => patch({ name }),
                              `${path}.levels.${i}.name`,
                              "text",
                              true
                            )}
                            {field(
                              "Level order",
                              level.order,
                              (order) => patch({ order }),
                              `${path}.levels.${i}.order`,
                              "number",
                              true
                            )}
                            {field(
                              "Level duration (e.g. 4 weeks)",
                              level.duration,
                              (duration) => patch({ duration }),
                              `${path}.levels.${i}.duration`,
                              "text",
                              true
                            )}
                            {field(
                              "Learning hours",
                              level.learningHours,
                              (learningHours) => patch({ learningHours }),
                              `${path}.levels.${i}.learningHours`,
                              "number"
                            )}
                          </div>
                        )}
                      </RepeatableSection>
                    </div>
                  </details>
                  <details open>
                    <summary className="cursor-pointer text-ub-label-md">
                      Tuition fees
                    </summary>
                    <div className="mt-4">
                      <RepeatableSection
                        title="Tuition fees"
                        singular="tuition fee"
                        items={course.fees}
                        create={() => ({
                          id: newId(),
                          amount: "",
                          currency: "",
                          basis: "course" as const,
                          levelId: "",
                        })}
                        onChange={(fees) => change({ fees })}
                      >
                        {(fee, patch, i) => (
                          <div className={grid}>
                            {money(fee, patch, `${path}.fees.${i}`)}
                            <Combobox
                              className="!mb-0"
                              label="Pricing basis"
                              value={fee.basis}
                              options={[
                                { value: "level", label: "Per level" },
                                { value: "month", label: "Per month" },
                                { value: "course", label: "Per course" },
                              ]}
                              onChange={(v) =>
                                patch({
                                  basis: v as typeof fee.basis,
                                  levelId: "",
                                })
                              }
                            />
                            {fee.basis === "level" && (
                              <Combobox
                                className="!mb-0"
                                label="Fee level"
                                value={fee.levelId}
                                options={course.levels.map((l) => ({
                                  value: l.id,
                                  label: l.name || "Unnamed level",
                                }))}
                                onChange={(v) => patch({ levelId: v || "" })}
                                error={errors[`${path}.fees.${i}.levelId`]}
                                required
                              />
                            )}
                          </div>
                        )}
                      </RepeatableSection>
                    </div>
                  </details>
                  <details>
                    <summary className="cursor-pointer text-ub-label-md">
                      Packages ({course.packages.length})
                    </summary>
                    <div className="mt-4">
                      <RepeatableSection
                        title="Packages"
                        singular="package"
                        items={course.packages}
                        create={() => ({
                          id: newId(),
                          name: "",
                          duration: "",
                          amount: "",
                          currency: "",
                          services: "",
                        })}
                        onChange={(packages) => change({ packages })}
                      >
                        {(pkg, patch, i) => (
                          <>
                            <div className={grid}>
                              {field(
                                "Package name",
                                pkg.name,
                                (name) => patch({ name }),
                                `${path}.packages.${i}.name`,
                                "text",
                                true
                              )}
                              {field(
                                "Package duration",
                                pkg.duration,
                                (duration) => patch({ duration }),
                                `${path}.packages.${i}.duration`
                              )}
                              {money(pkg, patch, `${path}.packages.${i}`)}
                            </div>
                            <Textarea
                              wrapperClassName="mb-0"
                              label="Included services (one per line)"
                              value={pkg.services}
                              onChange={(services) => patch({ services })}
                            />
                          </>
                        )}
                      </RepeatableSection>
                    </div>
                  </details>
                  <details>
                    <summary className="cursor-pointer text-ub-label-md">
                      Additional charges ({course.charges.length})
                    </summary>
                    <div className="mt-4">
                      <RepeatableSection
                        title="Additional charges"
                        singular="charge"
                        items={course.charges}
                        create={() => ({
                          id: newId(),
                          kind: "Visa" as const,
                          description: "",
                          amount: "",
                          currency: "",
                          refundable: false,
                        })}
                        onChange={(charges) => change({ charges })}
                      >
                        {(charge, patch, i) => (
                          <div className={grid}>
                            <Combobox
                              className="!mb-0"
                              label="Charge type"
                              value={charge.kind}
                              options={[
                                "Visa",
                                "Insurance",
                                "Accommodation",
                                "Refundable deposit",
                                "Other",
                              ].map((v) => ({ value: v, label: v }))}
                              onChange={(v) =>
                                patch({
                                  kind: v as typeof charge.kind,
                                  refundable: v === "Refundable deposit",
                                })
                              }
                            />
                            {field(
                              "Charge details",
                              charge.description,
                              (description) => patch({ description }),
                              `${path}.charges.${i}.description`
                            )}
                            {money(charge, patch, `${path}.charges.${i}`)}
                            {charge.kind !== "Refundable deposit" && (
                              <Combobox
                                className="!mb-0"
                                label="Refundability"
                                value={String(charge.refundable)}
                                options={[
                                  { value: "false", label: "Non-refundable" },
                                  { value: "true", label: "Refundable" },
                                ]}
                                onChange={(v) =>
                                  patch({ refundable: v === "true" })
                                }
                              />
                            )}
                          </div>
                        )}
                      </RepeatableSection>
                    </div>
                  </details>
                </div>
              );
            }}
          </RepeatableSection>
        </div>
      </details>
    </div>
  );
}
