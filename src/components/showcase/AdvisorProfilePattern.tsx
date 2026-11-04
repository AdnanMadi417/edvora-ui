"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe2, PencilLine } from "lucide-react";
import Logo from "components/ub/brand/Logo";
import { focusRing } from "components/ub/recipes";
import Tabs from "components/ub/navigation/Tabs";
import ThemeSwitcher from "components/theme/ThemeSwitcher";
import { ToastProvider } from "components/ub/feedback/ToastContext";
import { AdvisorProfileWorkspace } from "features/partners/components/profile/AdvisorProfileEditor";
import PartnerPublicProfile from "features/partners/components/public/PartnerPublicProfile";
import type {
  PublicPartnerProfile,
  UpdateMyPublicProfilePayload,
} from "features/partners/types";
import { SAMPLE_ADVISOR_PROFILE } from "./AdvisorProfileDemo";

type View = "editor" | "public";

const VIEWS = [
  { key: "editor" as const, label: "Advisor editor", icon: PencilLine },
  { key: "public" as const, label: "Public page", icon: Globe2 },
];

/** Applies a save to the sample, the way PUT /partners/profile/public would. */
function applySave(
  p: PublicPartnerProfile,
  payload: UpdateMyPublicProfilePayload
): PublicPartnerProfile {
  return {
    ...p,
    display_name: payload.display_name ?? p.display_name,
    countries_supported: payload.countries_supported ?? p.countries_supported,
    content: p.content ? { ...p.content, ...payload.content } : p.content,
  };
}

/**
 * Full-page route: the Advisor profile on mock data. Switch between the
 * Advisor's editor and the public page; saving in the editor updates the
 * public page, so the whole flow can be checked without a backend.
 */
export default function AdvisorProfilePattern() {
  const [view, setView] = useState<View>("editor");
  const [profile, setProfile] = useState<PublicPartnerProfile>({
    ...SAMPLE_ADVISOR_PROFILE,
    is_published: true,
  });
  const [saving, setSaving] = useState(false);

  const save = async (payload: UpdateMyPublicProfilePayload) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setProfile((p) => applySave(p, payload));
    setSaving(false);
  };

  return (
    <ToastProvider>
      <div className="ub-canvas-light min-h-screen">
        <div className="sticky top-0 z-40 border-b border-ub-border bg-ub-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
            <Link
              href="/design-system#content"
              className={`inline-flex items-center gap-3 text-ub-label-md text-ub-text-secondary hover:text-ub-text-link ${focusRing}`}
            >
              <ArrowLeft
                className="h-4 w-4 rtl:-scale-x-100"
                aria-hidden="true"
              />
              <Logo size="sm" />
              <span className="hidden border-s border-ub-border ps-3 sm:inline">Design system</span>
            </Link>
            <Tabs<View>
              variant="segmented"
              size="sm"
              idPrefix="advisor-profile-view"
              tabs={VIEWS}
              active={view}
              onChange={setView}
            />
            <ThemeSwitcher className="hidden w-56 xl:grid" />
          </div>
        </div>

        <section className="mx-auto max-w-6xl px-4 pb-2 pt-8 md:px-6 md:pt-10" aria-labelledby="profile-pattern-title">
          <p className="mb-3 text-ub-body-sm text-ub-text-tertiary">Advisor workspace <span aria-hidden="true" className="px-2">/</span> Public profile</p>
          <h1 id="profile-pattern-title" className="text-ub-heading-xl text-ub-text-primary">My public profile</h1>
          <p className="mt-2 max-w-ub-reading text-ub-body-md text-ub-text-secondary">Help students get to know you before their first conversation.</p>
        </section>

        <div
          role="tabpanel"
          id={`advisor-profile-view-panel-${view}`}
          aria-labelledby={`advisor-profile-view-tab-${view}`}
        >
          {view === "editor" ? (
            <main className="px-4 pb-10 md:px-6">
              <AdvisorProfileWorkspace
                spacious
                profile={profile}
                saving={saving}
                onSave={save}
                onViewPublic={() => setView("public")}
              />
            </main>
          ) : (
            <PartnerPublicProfile spacious embedded profile={profile} />
          )}
        </div>
      </div>
    </ToastProvider>
  );
}
