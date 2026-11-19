"use client";
import DetailsSection from "components/ub/data/cards/DetailsSection";
import Tag from "components/ub/data/badges/Tag";
import { formatPrice, type CentreConfiguration } from "../configuration";

function Facts({ values }: { values: [string, string | undefined][] }) {
  const available = values.filter(([, value]) => value?.trim());
  if (!available.length) return null;
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {available.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-ub-label-sm text-ub-text-tertiary">{label}</dt>
          <dd className="mt-1 whitespace-pre-wrap break-words text-ub-body-sm text-ub-text-primary">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
export default function CentreConfigurationView({
  value,
}: {
  value: CentreConfiguration;
}) {
  return (
    <DetailsSection title="Language Centre">
      <div className="space-y-5">
        <div className="space-y-2">
          {/* The centre name is the page title. */}
          {value.description && (
            <p className="whitespace-pre-wrap text-ub-body-sm text-ub-text-secondary">
              {value.description}
            </p>
          )}
          {value.location && (
            <p className="text-ub-body-sm text-ub-text-tertiary">
              {value.location}
            </p>
          )}
        </div>
        {!value.courses.length && (
          <p className="text-ub-body-sm text-ub-text-secondary">
            Course information has not been added yet.
          </p>
        )}
        {value.courses.map((course) => (
          <details
            key={course.id}
            open
            className="rounded-ub-md border border-ub-border"
          >
            <summary className="cursor-pointer px-4 py-3 text-ub-label-md text-ub-text-primary">
              {course.name}
              <span className="ms-2 text-ub-body-sm text-ub-text-tertiary">
                {[course.language, course.studyMode]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </summary>
            <div className="space-y-5 border-t border-ub-border p-4">
              <Facts
                values={[
                  ["Entry requirements", course.entryRequirements],
                  ["Placement test", course.placementTest],
                ]}
              />
              {!!course.levels.length && (
                <section
                  className="space-y-3"
                  aria-label={`${course.name} levels`}
                >
                  <h4 className="text-ub-heading-sm">Levels</h4>
                  <div className="divide-y divide-ub-border">
                    {[...course.levels]
                      .sort((a, b) => Number(a.order) - Number(b.order))
                      .map((level) => (
                        <div
                          key={level.id}
                          className="grid gap-2 py-3 sm:grid-cols-2"
                        >
                          <p className="text-ub-label-md">
                            {level.order}. {level.name}
                          </p>
                          <Facts
                            values={[
                              ["Duration", level.duration],
                              ["Learning hours", level.learningHours],
                            ]}
                          />
                        </div>
                      ))}
                  </div>
                </section>
              )}
              {!!course.fees.length && (
                <section className="space-y-3">
                  <h4 className="text-ub-heading-sm">Tuition fees</h4>
                  <ul className="divide-y divide-ub-border">
                    {course.fees.map((fee) => (
                      <li
                        key={fee.id}
                        className="flex flex-wrap justify-between gap-2 py-3"
                      >
                        <span>
                          {fee.basis === "level"
                            ? course.levels.find(
                                (level) => level.id === fee.levelId
                              )?.name
                            : course.name}
                        </span>
                        <span className="ub-tabular font-medium">
                          {formatPrice(fee)} / {fee.basis}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {!!course.packages.length && (
                <section className="space-y-3">
                  <h4 className="text-ub-heading-sm">Packages</h4>
                  <div className="divide-y divide-ub-border">
                    {course.packages.map((pkg) => (
                      <article key={pkg.id} className="space-y-2 py-3">
                        <h5 className="text-ub-label-md">{pkg.name}</h5>
                        <p className="ub-tabular text-ub-heading-sm">
                          {formatPrice(pkg)}
                        </p>
                        {pkg.duration && (
                          <p className="text-ub-body-sm">{pkg.duration}</p>
                        )}
                        {pkg.services.trim() && (
                          <div>
                            <p className="text-ub-label-sm text-ub-text-secondary">
                              Included services
                            </p>
                            <ul className="mt-2 list-disc space-y-1 ps-5 text-ub-body-sm">
                              {pkg.services
                                .split("\n")
                                .filter((v) => v.trim())
                                .map((service, i) => (
                                  <li key={i}>{service}</li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}
              {!!course.charges.length && (
                <section className="space-y-3">
                  <h4 className="text-ub-heading-sm">
                    Additional charges and deposits
                  </h4>
                  <ul className="divide-y divide-ub-border">
                    {course.charges.map((charge) => (
                      <li
                        key={charge.id}
                        className="flex flex-wrap items-start justify-between gap-3 py-3"
                      >
                        <div className="min-w-0 space-y-1">
                          <p className="text-ub-label-md">{charge.kind}</p>
                          {charge.description && (
                            <p className="whitespace-pre-wrap break-words text-ub-body-sm text-ub-text-secondary">
                              {charge.description}
                            </p>
                          )}
                          <Tag
                            hue={
                              charge.refundable ||
                              charge.kind === "Refundable deposit"
                                ? "teal"
                                : "grey"
                            }
                          >
                            {charge.refundable ||
                            charge.kind === "Refundable deposit"
                              ? "Refundable"
                              : "Non-refundable"}
                          </Tag>
                        </div>
                        <span className="ub-tabular font-medium">
                          {formatPrice(charge)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </details>
        ))}
      </div>
    </DetailsSection>
  );
}
