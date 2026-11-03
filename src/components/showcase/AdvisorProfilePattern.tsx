"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe2, PencilLine } from "lucide-react";
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
          <div className="mx-auto flex max-w-ub-dashboard flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
            <Link
              href="/design-system#content"
              className="inline-flex items-center gap-2 text-ub-label-md text-ub-text-link hover:underline"
            >
              <ArrowLeft
                className="h-4 w-4 rtl:-scale-x-100"
                aria-hidden="true"
              />
              Design system
            </Link>
            <Tabs<View>
              variant="segmented"
              size="sm"
              idPrefix="advisor-profile-view"
              tabs={VIEWS}
              active={view}
              onChange={setView}
            />
            <ThemeSwitcher className="hidden w-64 lg:grid" />
          </div>
        </div>

        <div
          role="tabpanel"
          id={`advisor-profile-view-panel-${view}`}
          aria-labelledby={`advisor-profile-view-tab-${view}`}
        >
          {view === "editor" ? (
            <main className="px-4 pb-10 md:px-6">
              <AdvisorProfileWorkspace
                profile={profile}
                saving={saving}
                onSave={save}
                onViewPublic={() => setView("public")}
              />
            </main>
          ) : (
            <PartnerPublicProfile profile={profile} />
          )}
        </div>
      </div>
    </ToastProvider>
  );
}
