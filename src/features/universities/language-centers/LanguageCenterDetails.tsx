"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Languages,
  Pencil,
  Trash2,
  University as UniversityIcon,
} from "lucide-react";
import Breadcrumbs from "components/ub/navigation/links/Breadcrumbs";
import ActionsDropdown from "components/ub/navigation/menus/ActionsDropdown";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import Button from "components/ub/core/buttons/Button";
import Loading from "components/ub/feedback/states/Loading";
import DetailsSection from "components/ub/data/cards/DetailsSection";
import { ConfirmDialog } from "components/ub/feedback/dialogs/Modal";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { useUniversities } from "features/universities/hooks/institutions/useUniversities";
import { parseApiError } from "utils/parseApiError";
import UniversityIdentity from "./UniversityIdentity";
import CentreRecordDetails from "./components/CentreRecordDetails";
import LanguageCenterForm from "./LanguageCenterForm";
import { languageCentersApi } from "./api";
import type { LanguageCenter } from "./types";

export default function LanguageCenterDetails({
  id,
  basePath = "/admin",
  readOnly = false,
  allowDelete = true,
}: {
  id: string;
  basePath?: string;
  readOnly?: boolean;
  allowDelete?: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    universities,
    loading: universitiesLoading,
    error: universitiesError,
    refetch,
  } = useUniversities({
    includeInactive: !readOnly,
    ...(readOnly ? { isHidden: false } : {}),
  });
  const [center, setCenter] = useState<LanguageCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const retry = useCallback(() => {
    setAttempt((v) => v + 1);
    void refetch();
  }, [refetch]);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setCenter(null);
    languageCentersApi
      .list()
      .then((response) => {
        if (!cancelled)
          setCenter(response.data.items.find((item) => item.id === id) || null);
      })
      .catch((failure) => {
        if (!cancelled)
          setError(
            parseApiError(failure, "Unable to load language centre details.")
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);
  const back = (
    <LinkBtn
      href={`${basePath}/language-centers`}
      label="Back to language centres"
      icon={<ArrowLeft className="h-4 w-4" />}
    />
  );
  if (loading || (universitiesLoading && center?.centre_type !== "independent"))
    return <Loading text="Loading language centre details…" />;
  if (error || (universitiesError && center?.centre_type !== "independent"))
    return (
      <div className="space-y-4">
        <DetailsSection title="Unable to load language centre">
          <div role="alert" className="space-y-3">
            <p>{error || universitiesError}</p>
            <Button text="Try again" onClick={retry} />
          </div>
        </DetailsSection>
        {back}
      </div>
    );
  const university = universities.find(
    (item) => item.id === center?.university_id
  );
  if (
    !center ||
    (readOnly &&
      (!center.is_active ||
        (center.centre_type !== "independent" &&
          (!university || !university.is_active || university.is_hidden))))
  )
    return (
      <div className="space-y-4">
        <DetailsSection title="Language centre unavailable">
          <p>This language centre could not be found or is unavailable.</p>
        </DetailsSection>
        {back}
      </div>
    );
  const universityHref = `${basePath}/universities/${encodeURIComponent(
    center.university_id
  )}`;
  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-5 break-words pb-6">
      <header className="relative z-10 rounded-ub-lg border border-ub-border bg-ub-surface shadow-ub-xs">
        <div className="h-1.5 rounded-t-ub-lg bg-ub-action-primary" />
        <div className="space-y-4 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            {center.centre_type === "independent" ? (
              <p className="text-ub-label-md text-ub-text-secondary">
                Independent language centre
              </p>
            ) : (
              <UniversityIdentity
                university={university}
                href={universityHref}
              />
            )}
            {!readOnly && center.centre_type !== "independent" && (
              <ActionsDropdown
                items={[
                  {
                    label: "Edit centre",
                    icon: Pencil,
                    onClick: () => setEditing(true),
                  },
                  {
                    label: "Edit university",
                    icon: UniversityIcon,
                    onClick: () => router.push(`${universityHref}/edit`),
                  },
                  ...(allowDelete
                    ? [
                        {
                          label: "Delete",
                          icon: Trash2,
                          color: "red" as const,
                          onClick: () => setDeleting(true),
                        },
                      ]
                    : []),
                ]}
              />
            )}
          </div>
          <Breadcrumbs
            items={[
              {
                label: "Language Centres",
                href: `${basePath}/language-centers`,
              },
              { label: center.name },
            ]}
          />
          <h2 className="flex items-start gap-3 text-ub-heading-xl-mobile text-ub-text-primary sm:text-ub-heading-xl">
            {center.logo_url ? (
              <Image
                src={center.logo_url}
                alt={`${center.name} logo`}
                width={48}
                height={48}
                unoptimized
                className="h-12 w-12 shrink-0 rounded-ub-md object-contain"
              />
            ) : (
              <Languages className="mt-1 h-7 w-7 shrink-0 text-ub-text-link" />
            )}
            {center.name}
          </h2>
        </div>
      </header>
      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <CentreRecordDetails
            centreId={center.id}
            universityId={center.university_id || center.id}
          >
            <DetailsSection title="Centre overview">
              <dl className="space-y-4">
                {[
                  ["Description", center.description],
                  ["Location", center.location],
                ]
                  .filter(([, value]) => !!value)
                  .map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-ub-label-sm text-ub-text-tertiary">
                        {label}
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap text-ub-body-md text-ub-text-primary">
                        {value}
                      </dd>
                    </div>
                  ))}
              </dl>
            </DetailsSection>
          </CentreRecordDetails>
          {!!center.branches?.length && (
            <DetailsSection title="Branches">
              <div className="grid gap-4 sm:grid-cols-2">
                {center.branches.map((branch) => (
                  <article
                    key={branch.id}
                    className="space-y-2 rounded-ub-md border border-ub-border p-4"
                  >
                    <h3 className="text-ub-heading-sm">{branch.name}</h3>
                    <p className="text-ub-body-sm text-ub-text-secondary">
                      {branch.location}
                    </p>
                    {branch.address && (
                      <p className="whitespace-pre-wrap text-ub-body-sm text-ub-text-secondary">
                        {branch.address}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </DetailsSection>
          )}
          {!!center.images?.length && (
            <DetailsSection title="Centre images">
              <div className="grid gap-4 sm:grid-cols-2">
                {center.images.map((image) => (
                  <Image
                    key={image.id}
                    src={image.url}
                    alt={image.name}
                    width={640}
                    height={400}
                    unoptimized
                    className="aspect-video w-full rounded-ub-md object-cover"
                  />
                ))}
              </div>
            </DetailsSection>
          )}
        </div>
        <aside
          aria-label="Language centre summary"
          className="space-y-4 xl:sticky xl:top-24"
        >
          <DetailsSection
            title={
              center.centre_type === "independent" ? "Centre" : "University"
            }
          >
            <p className="mb-4 text-ub-body-sm text-ub-text-secondary">
              {center.centre_type === "independent"
                ? "Independent language centre"
                : university?.name || "University unavailable"}
            </p>
            <div className="flex flex-col gap-3">
              {center.centre_type !== "independent" && (
                <LinkBtn
                  href={universityHref}
                  label="View university"
                  icon={<UniversityIcon className="h-4 w-4" />}
                />
              )}
              {back}
            </div>
          </DetailsSection>
        </aside>
      </div>
      {!readOnly && editing && (
        <LanguageCenterForm
          initial={center}
          editing
          universities={universities}
          onClose={() => setEditing(false)}
          onSave={async (data) => {
            const response = await languageCentersApi.update(center.id, data);
            setCenter(response.data);
            setEditing(false);
            showToast("Language centre updated.", "success");
          }}
        />
      )}
      <ConfirmDialog
        open={!readOnly && allowDelete && deleting}
        onClose={() => {
          if (!busy) setDeleting(false);
        }}
        title="Delete language centre?"
        tone="danger"
        consequence={`Remove ${center.name}? Its university will remain available.`}
        confirmLabel="Delete centre"
        loading={busy}
        onConfirm={async () => {
          if (busy || readOnly || !allowDelete) return;
          setBusy(true);
          try {
            await languageCentersApi.remove(center.id);
            showToast("Language centre deleted.", "success");
            router.push(`${basePath}/language-centers`);
          } catch (failure) {
            showToast(
              parseApiError(failure, "Unable to delete language centre."),
              "error"
            );
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
