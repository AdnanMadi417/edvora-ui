"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Check, Copy, ExternalLink, Eye, PencilLine } from "lucide-react";
import Button from "components/ub/core/Button";
import Tag from "components/ub/data/Tag";
import Alert from "components/ub/feedback/Alert";
import Skeleton from "components/ub/feedback/Skeleton";
import Toggle from "components/ub/forms/Toggle";
import IconTile from "components/ub/dashboard/IconTile";
import { useToast } from "components/ub/feedback/ToastContext";
import { card } from "components/ub/recipes";
import { parseApiError } from "utils/parseApiError";
import { useMyPublicProfile } from "features/partners/hooks/useMyPublicProfile";
import type { PublicPartnerProfile, UpdateMyPublicProfilePayload } from "features/partners/types";
import AdvisorProfile, { type AdvisorProfileErrors } from "./AdvisorProfile";
import { draftFromProfile, draftToPayload, validateDraft, type AdvisorProfileDraft } from "./profileModel";

/**
 * The Advisor's own profile page (/partner/public-profile): loads the profile,
 * then hands it to the workspace below.
 */
export default function AdvisorProfileEditor() {
  const { profile, loading, error, saving, save, reload } = useMyPublicProfile();

  if (loading && !profile) {
    return (
      <div className="mx-auto mt-6 max-w-3xl space-y-4" aria-busy="true" aria-label="Loading your profile">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto mt-6 max-w-3xl">
        <Alert tone="danger" title="Couldn't load your profile" action={{ label: "Try again", onClick: reload }}>
          {error ?? "Your public profile isn't set up yet. Ask your account manager to create it."}
        </Alert>
      </div>
    );
  }

  return <AdvisorProfileWorkspace profile={profile} saving={saving} onSave={save} />;
}

export interface AdvisorProfileWorkspaceProps {
  profile: PublicPartnerProfile;
  /** Persists the edits; resolve with the saved profile, throw to show an error. */
  onSave: (payload: UpdateMyPublicProfilePayload) => Promise<unknown>;
  saving?: boolean;
  spacious?: boolean;
  /** Where "View public profile" goes; defaults to the live /p/[slug] page in a new tab. */
  onViewPublic?: () => void;
}

/**
 * Edit the page in place, flip Preview to see exactly what students see,
 * then save. Data comes in as props so the style guide can run it on mock data.
 */
export function AdvisorProfileWorkspace({ profile, onSave, saving = false, onViewPublic, spacious = false }: AdvisorProfileWorkspaceProps) {
  const { showToast } = useToast();
  const [draft, setDraft] = useState<AdvisorProfileDraft>(() => draftFromProfile(profile));
  const [saved, setSaved] = useState<AdvisorProfileDraft>(() => draftFromProfile(profile));
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<AdvisorProfileErrors>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const d = draftFromProfile(profile);
    setDraft(d);
    setSaved(d);
  }, [profile]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  // Leaving with unsaved edits asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const livePath = `/p/${profile.slug}`;
  const published = profile.is_published ?? true;

  const update = (patch: Partial<AdvisorProfileDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      (Object.keys(patch) as (keyof AdvisorProfileErrors)[]).forEach((k) => delete next[k]);
      if ("contact_channel" in patch) delete next.contact_value;
      return next;
    });
  };

  const handleSave = async () => {
    const problems = validateDraft(draft);
    setErrors(problems);
    if (Object.keys(problems).length) {
      setPreview(false);
      showToast("Fix the highlighted fields before saving.", "error");
      return;
    }
    try {
      await onSave(draftToPayload(draft));
      setSaved(draft);
      showToast("Profile saved.", "success");
    } catch (err) {
      showToast(parseApiError(err, "Couldn't save your profile."), "error");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${livePath}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Couldn't copy the link.", "error");
    }
  };

  return (
    <div className={clsx("mx-auto mt-6 pb-24", spacious ? "max-w-6xl" : "max-w-3xl")}>
      {spacious ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-ub-border pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <Tag tone={published ? "success" : "warning"} size="sm">{published ? "Published" : "Not published"}</Tag>
            <span role="status" className="text-ub-body-sm text-ub-text-tertiary">{dirty ? "You have unsaved changes" : "Your profile is up to date"}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Toggle checked={preview} onChange={setPreview} label="Preview" switchPosition="end" />
            <Button variant="tertiary" size="sm" icon={<ExternalLink className="h-4 w-4" aria-hidden="true" />} text="View public page" onClick={onViewPublic ?? (() => window.open(livePath, "_blank", "noopener,noreferrer"))} />
            <Button variant="primary" text="Save changes" disabled={!dirty} loading={saving} onClick={handleSave} />
          </div>
        </div>
      ) : (
        <>
      <div className={clsx(card, "mb-4 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between")}>
        <div className="flex min-w-0 items-center gap-3">
          <IconTile icon={preview ? Eye : PencilLine} tone="brand" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-ub-heading-sm text-ub-text-primary">Profile workspace</h2>
              <Tag tone={published ? "success" : "warning"} size="sm">
                {published ? "Published" : "Not published"}
              </Tag>
            </div>
            <p className="text-ub-body-sm text-ub-text-secondary">{preview ? "This is what students see." : "Edit any section, then save your changes."}</p>
          </div>
        </div>
        <Toggle checked={preview} onChange={setPreview} label="Preview" switchPosition="end" className="shrink-0" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          icon={<ExternalLink className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />}
          text="View public profile"
          onClick={onViewPublic ?? (() => window.open(livePath, "_blank", "noopener,noreferrer"))}
          title={dirty ? "Shows your last saved version" : undefined}
        />
        <Button variant="secondary" icon={copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />} text={copied ? "Copied" : "Copy link"} onClick={handleCopy} />
      </div>

        </>
      )}

      {!published && (
        <Alert tone="info" className="mb-4">
          Your page isn't public yet. Your account manager publishes it once it's ready. You can still edit and preview it.
        </Alert>
      )}

      <AdvisorProfile spacious={spacious} profile={profile} draft={draft} editing={!preview} onChange={update} errors={errors} />

      {dirty && (
        <div
          role="region"
          aria-label="Unsaved changes"
          className={clsx(card, "sticky bottom-20 z-20 mt-4 flex items-center justify-between gap-3 p-3 shadow-ub-md md:bottom-4")}
        >
          <p className="ps-1 text-ub-body-sm text-ub-text-secondary">You have unsaved changes</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" text="Discard" disabled={saving} onClick={() => {
                setDraft(saved);
                setErrors({});
              }} />
            {!spacious && <Button variant="primary" size="sm" text="Save changes" loading={saving} onClick={handleSave} />}
          </div>
        </div>
      )}
    </div>
  );
}
