"use client";
import { useCallback, useEffect, useState } from "react";
import { Languages } from "lucide-react";
import DetailsSection from "components/ub/data/cards/DetailsSection";
import Button from "components/ub/core/buttons/Button";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import Tag from "components/ub/data/badges/Tag";
import { parseApiError } from "utils/parseApiError";
import { languageCentersApi } from "./api";
import type { LanguageCenter } from "./types";
import { useCentreConfiguration } from "./hooks/useCentreConfiguration";
import type { CentreConfiguration } from "./configuration";

export default function UniversityLanguageCenters(props: {
  universityId: string;
  basePath: string;
  canManage?: boolean;
}) {
  const centre = useCentreConfiguration(props.universityId);
  if (centre.loading) return <p role="status">Loading Language Centre…</p>;
  if (centre.error)
    return (
      <div role="alert" className="space-y-3">
        <p>{centre.error}</p>
        <Button text="Try again" onClick={centre.retry} />
      </div>
    );
  if (!centre.exists) return <LegacyUniversityLanguageCenters {...props} />;
  return (
    <div className="space-y-4">
      {centre.value.enabled ? (
        <CentreSummary value={centre.value} {...props} />
      ) : (
        <DetailsSection title="Language Centre">
          <p className="text-ub-body-sm text-ub-text-secondary">
            No language centre is available at this university.
          </p>
        </DetailsSection>
      )}
    </div>
  );
}

/**
 * The university's language centre in one card: name, where, how many
 * courses, and a link. Courses, fees and packages live once, on the centre's
 * own page.
 */
function CentreSummary({ value, universityId, basePath }: { value: CentreConfiguration; universityId: string; basePath: string }) {
  const [centreId, setCentreId] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    languageCentersApi
      .list()
      .then((response) => {
        const match = response.data.items.find((c) => c.university_id === universityId);
        if (!cancelled && match) setCentreId(match.id);
      })
      .catch(() => {
        // The filtered list below still gets people there.
      });
    return () => {
      cancelled = true;
    };
  }, [universityId]);
  const courses = value.courses.length;
  const href = centreId
    ? `${basePath}/language-centers/${encodeURIComponent(centreId)}`
    : `${basePath}/language-centers?university_id=${encodeURIComponent(universityId)}`;
  return (
    <DetailsSection
      title="Language Centre"
      action={<LinkBtn size="sm" variant="secondary" icon={<Languages className="h-4 w-4" />} label="View language centre" href={href} />}
    >
      <p className="text-ub-label-md text-ub-text-primary">{value.name || "Language Centre"}</p>
      <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
        {[value.location, `${courses} ${courses === 1 ? "course" : "courses"}`].filter(Boolean).join(" · ")}
      </p>
    </DetailsSection>
  );
}

/** Readable university profile section; management remains in the directory. */
function LegacyUniversityLanguageCenters({
  universityId,
  basePath,
  canManage = false,
}: {
  universityId: string;
  basePath: string;
  canManage?: boolean;
}) {
  const [centers, setCenters] = useState<LanguageCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    languageCentersApi
      .list()
      .then((response) => {
        if (!cancelled)
          setCenters(
            response.data.items.filter(
              (center) =>
                center.university_id === universityId &&
                (canManage || center.is_active)
            )
          );
      })
      .catch((failure) => {
        if (!cancelled)
          setError(parseApiError(failure, "Unable to load language centers."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [universityId, canManage, attempt]);
  return (
    <DetailsSection
      title="Language centers"
      description="Language study and contact information at this university."
      action={
        canManage ? (
          <LinkBtn
            size="sm"
            icon={<Languages className="h-4 w-4" />}
            label="Manage centers"
            href={`${basePath}/language-centers?university_id=${encodeURIComponent(
              universityId
            )}`}
          />
        ) : undefined
      }
    >
      {loading ? (
        <p role="status" className="text-ub-body-sm text-ub-text-secondary">
          Loading language centers...
        </p>
      ) : error ? (
        <div role="alert" className="space-y-3">
          <p className="text-ub-body-sm text-ub-text-secondary">{error}</p>
          <Button text="Try again" onClick={retry} />
        </div>
      ) : !centers.length ? (
        <div className="space-y-1">
          <p className="text-ub-label-md text-ub-text-primary">
            No language centers available
          </p>
          <p className="text-ub-body-sm text-ub-text-secondary">
            Language center details have not been published for this university.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {centers.map((center) => (
            <article
              key={center.id}
              className="min-w-0 border-b border-ub-border pb-5 last:border-0 last:pb-0"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="min-w-0 break-words text-ub-heading-sm text-ub-text-primary">
                  {center.name}
                </h3>
                {canManage && (
                  <Tag size="sm" hue={center.is_active ? "teal" : "grey"}>
                    {center.is_active ? "Active" : "Inactive"}
                  </Tag>
                )}
              </div>
              {center.description && (
                <p className="mt-3 whitespace-pre-wrap break-words text-ub-body-sm text-ub-text-secondary">
                  {center.description}
                </p>
              )}
              <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {[["Location", center.location]]
                  .filter(([, value]) => !!value)
                  .map(([label, value]) => (
                    <div className="min-w-0" key={label}>
                      <dt className="text-ub-label-sm text-ub-text-tertiary">
                        {label}
                      </dt>
                      <dd className="mt-1 break-words text-ub-label-md text-ub-text-primary">
                        {value}
                      </dd>
                    </div>
                  ))}
              </dl>
            </article>
          ))}
        </div>
      )}
    </DetailsSection>
  );
}
