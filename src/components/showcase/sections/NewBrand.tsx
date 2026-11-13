"use client";

import { useState } from "react";
import Button from "components/ub/core/buttons/Button";
import Logo, { type LogoBackground } from "components/ub/brand/Logo";
import GlassPanel from "components/ub/brand/GlassPanel";
import NotchedCard, { type NotchSize, type NotchedCardFill } from "components/ub/brand/NotchedCard";
import VerifiedBadge from "components/ub/brand/VerifiedBadge";
import VerificationStamp from "components/ub/brand/VerificationStamp";
import ApplicationTracker, { trackerStepsAt } from "components/ub/brand/ApplicationTracker";
import MilestoneMoment from "components/ub/brand/MilestoneMoment";
import { GLASS_BOX_STEPS, STUDENT_PROFILE_STEPS } from "config/applicationStages";
import { Demo, ShowcaseSection, StateSwitch, Variant } from "../Showcase";

const LOGO_BACKGROUNDS: { bg: LogoBackground; label: string; className: string }[] = [
  { bg: "white", label: "On white", className: "bg-ub-neutral-0 border border-ub-border" },
  { bg: "light-blue", label: "On Light Blue", className: "bg-ub-light-blue" },
  { bg: "navy", label: "On navy", className: "bg-ub-navy" },
  { bg: "primary-blue", label: "On Primary Blue", className: "bg-ub-blue-600" },
];

const NOTCH_SIZES: NotchSize[] = ["sm", "md", "lg"];
const NOTCH_FILLS: NotchedCardFill[] = ["surface", "brand", "navy"];
const NOTCH_COPY: Record<NotchSize, { title: string; body: string }> = {
  sm: { title: "Knowledge Hub", body: "Verified fees and intakes for every Institution." },
  md: { title: "Logistics Marketplace", body: "Book airport pickup and housing for your students." },
  lg: { title: "Earners Circle", body: "Every placed student is tracked through to commission paid." },
};

// Fixed "today" so the stamp demo always shows all three freshness states.
const STAMP_NOW = "2026-10-29";

const NEXT_STEP: Record<string, string> = {
  enquiry: "Book a counselling call with Nur Aisyah",
  documents: "Upload Nur Aisyah's passport and SPM results",
  submitted: "Wait for Sunway University to review the application",
  offer: "Upload the offer letter from Sunway University",
  visa: "Submit the EMGS visa application",
};

export default function NewBrand() {
  const [currentId, setCurrentId] = useState<string>("submitted");
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const stepIds = STUDENT_PROFILE_STEPS.map((s) => s.id);

  const allStates = trackerStepsAt(GLASS_BOX_STEPS, "submitted", {
    enquiry: { date: "02 Mar 2026" },
    documents: { state: "attention", caption: "Bank statement needs replacing" },
    submitted: { date: "14 Oct 2026" },
    arrival: { state: "skipped" },
  });

  return (
    <ShowcaseSection id="brand" title="Brand" description="Logo, glass, the notch, verification and the Application Tracker. The notch is for brand and marketing cards only.">
      <Demo name="Logo" path="components/ub/brand/Logo.tsx" description={`Full-colour on white and Light Blue, light artwork on navy and Primary Blue. background="auto" follows the theme.`} className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LOGO_BACKGROUNDS.map(({ bg, label, className }) => (
            <Variant key={bg} label={label}>
              <div className={`flex h-28 items-center justify-center gap-6 rounded-ub-lg ${className}`}>
                <Logo background={bg} />
                <Logo background={bg} symbolOnly />
              </div>
            </Variant>
          ))}
        </div>
        <Variant label="Sizes (auto background): sm 24 · md 32 · lg 48 · xl 64">
          <div className="flex flex-wrap items-center gap-8">
            <Logo size="sm" />
            <Logo size="md" />
            <Logo size="lg" />
            <Logo size="xl" symbolOnly />
          </div>
        </Variant>
      </Demo>

      <Demo name="GlassPanel" path="components/ub/brand/GlassPanel.tsx" description="Chrome and summaries only. Data tables, forms and long text stay on solid white." className="grid gap-4">
        <div className="ub-canvas-light grid gap-4 rounded-ub-lg p-6 sm:grid-cols-2">
          <Variant label="Light (default)">
            <GlassPanel>
              <p className="text-ub-label-md text-ub-text-secondary">Active applications</p>
              <p className="ub-tabular text-ub-data-lg">42</p>
            </GlassPanel>
          </Variant>
          <Variant label="Light strong">
            <GlassPanel variant="light-strong">
              <p className="text-ub-label-md text-ub-text-secondary">Commission pending</p>
              <p className="ub-tabular text-ub-data-lg">RM4,200</p>
            </GlassPanel>
          </Variant>
        </div>
        <div data-ub-theme="dark" className="rounded-ub-lg bg-ub-navy p-6">
          <Variant label="Dark (dark sections only)">
            <GlassPanel variant="dark" as="section" aria-label="Placed this year">
              <p className="text-ub-label-md text-ub-blue-200">Placed this year</p>
              <p className="ub-tabular text-ub-data-lg">18</p>
            </GlassPanel>
          </Variant>
        </div>
      </Demo>

      <Demo name="NotchedCard" path="components/ub/brand/NotchedCard.tsx" description="Notch sm 12 · md 24 · lg 40 at the bottom-end corner (mirrors in RTL). Never on product cards, tables, inputs or modals." className="grid gap-6">
        {NOTCH_FILLS.map((fill) => (
          <Variant key={fill} label={`Fill: ${fill}`}>
            <div className="grid gap-6 md:grid-cols-3">
              {NOTCH_SIZES.map((size) => (
                <NotchedCard key={size} size={size} fill={fill} symbol={size === "lg" ? <Logo symbolOnly size={18} alt="" /> : undefined}>
                  <p className="text-ub-label-sm opacity-80">Notch {size}</p>
                  <h4 className="mt-1 text-ub-heading-md">{NOTCH_COPY[size].title}</h4>
                  <p className="mt-2 text-ub-body-sm opacity-90">{NOTCH_COPY[size].body}</p>
                </NotchedCard>
              ))}
            </div>
          </Variant>
        ))}
      </Demo>

      <Demo name="VerifiedBadge" path="components/ub/brand/VerifiedBadge.tsx" description="Only for verified entities, never decorative. The label text is pending (brief §11.4)." className="flex flex-wrap items-end gap-8">
        <Variant label="16 inline">
          <p className="flex items-center gap-1.5 text-ub-label-md text-ub-text-primary">
            Farid Hakimi <VerifiedBadge />
          </p>
        </Variant>
        <Variant label="Label">
          <VerifiedBadge size="label" />
        </Variant>
        <Variant label="Credential 64">
          <VerifiedBadge size={64} />
        </Variant>
        <Variant label="Credential 96">
          <VerifiedBadge size={96} />
        </Variant>
      </Demo>

      <Demo name="VerificationStamp" path="components/ub/brand/VerificationStamp.tsx" description="Fresh ≤90 days, due for review 91–180, expired after 180 (today fixed at 29 Oct 2026 for this demo)." className="flex flex-wrap items-start gap-8">
        <Variant label="Fresh">
          <VerificationStamp date="2026-09-12" now={STAMP_NOW} />
        </Variant>
        <Variant label="Due for review">
          <VerificationStamp date="2026-06-12" now={STAMP_NOW} />
        </Variant>
        <Variant label="Expired">
          <VerificationStamp date="2026-03-02" now={STAMP_NOW} />
        </Variant>
      </Demo>

      <Demo name="ApplicationTracker" path="components/ub/brand/ApplicationTracker.tsx" description="Steps come from src/config/applicationStages.ts (pending confirmation). Horizontal from 768px, vertical below; the responsive orientation shows a short summary below 768px instead." className="grid gap-8">
        <Variant label="Student profile (5 steps): pick the current step to see the connector fill and pulse">
          <StateSwitch<string> label="Current step" value={currentId} options={stepIds} onChange={setCurrentId} />
          <div className="rounded-ub-lg border border-ub-border p-4 md:p-6">
            <p className="mb-4 text-ub-body-sm text-ub-text-secondary">
              Nur Aisyah Binti Kamal · <span className="ub-ref">UBX-2026-0412</span> · Sunway University
            </p>
            <ApplicationTracker steps={trackerStepsAt(STUDENT_PROFILE_STEPS, currentId)} nextStep={NEXT_STEP[currentId]} />
          </div>
        </Variant>
        <Variant label="All five states, horizontal (Glass Box steps)">
          <div className="overflow-x-auto rounded-ub-lg border border-ub-border p-4 md:p-6">
            <div className="min-w-[640px]">
              <ApplicationTracker orientation="horizontal" steps={allStates} nextStep="Sunway University replies within 10 working days" />
            </div>
          </div>
        </Variant>
        <Variant label='Responsive (application details): below 768px a summary, segmented bar and "Show all steps"; resize to compare'>
          <div className="max-w-sm rounded-ub-lg border border-ub-border p-4 md:max-w-none md:p-6">
            <ApplicationTracker orientation="responsive" steps={allStates} />
          </div>
        </Variant>
        <Variant label="All five states, vertical (Glass Box, mobile)">
          <div className="max-w-sm rounded-ub-lg border border-ub-border p-4">
            <ApplicationTracker orientation="vertical" steps={allStates} nextStep="Sunway University replies within 10 working days" />
          </div>
        </Variant>
      </Demo>

      <Demo name="MilestoneMoment" path="components/ub/brand/MilestoneMoment.tsx" description="Shown once (pass storageKey to remember dismissal). Full-screen sheet on mobile. Esc closes it.">
        <Button variant="primary" text="Show milestone" onClick={() => setMilestoneOpen(true)} />
        <MilestoneMoment
          open={milestoneOpen}
          onClose={() => setMilestoneOpen(false)}
          eyebrow="Milestone · UBX-2026-0412"
          title="Nur Aisyah is placed at Sunway University"
          description="Her offer for the Bachelor of Computer Science (Hons) is accepted and her visa is approved. Your commission is tracked automatically."
          symbol={<Logo background="navy" symbolOnly size={18} alt="" />}
        />
      </Demo>
    </ShowcaseSection>
  );
}
