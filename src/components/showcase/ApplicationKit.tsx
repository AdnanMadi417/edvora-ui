"use client";

import { useState } from "react";
import { Download, FileText, RefreshCw, Upload } from "lucide-react";
import Amount from "components/ub/core/Amount";
import Button from "components/ub/core/Button";
import IconButton from "components/ub/core/IconButton";
import DaysTag from "components/ub/data/DaysTag";
import FileRow, { type FileRowState } from "components/ub/data/FileRow";
import KeyValueGrid from "components/ub/data/KeyValueGrid";
import SectionCard, { type SectionCardState } from "components/ub/data/SectionCard";
import Tag from "components/ub/data/Tag";
import Timeline, { type TimelineEvent } from "components/ub/data/Timeline";
import { Demo, ShowcaseSection, StateSwitch, ThemePreviews, Variant } from "./Showcase";

// Fixed reference time so relative labels ("2 hours ago") stay stable.
const NOW = new Date("2026-11-02T10:00:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString();

const EVENTS: TimelineEvent[] = [
  { id: "e1", title: "Offer received from Sunway University", description: "Next step: accept the offer.", at: hoursAgo(2), tone: "success" },
  { id: "e2", title: "Farid Hakimi uploaded the passport", at: hoursAgo(5), tone: "brand" },
  { id: "e3", title: "Academic transcript needs replacing", description: "Not certified. Upload a certified true copy.", at: hoursAgo(50), tone: "danger" },
  { id: "e4", title: "Submitted to Institution", at: hoursAgo(24 * 12), tone: "neutral" },
];

const CARD_STATES = ["ready", "loading", "empty", "error"] as const;
const FILE_STATES: FileRowState[] = ["missing", "uploading", "uploaded", "verified", "needs-replacing"];

export default function ApplicationKit() {
  const [cardState, setCardState] = useState<SectionCardState>("ready");
  const [fileState, setFileState] = useState<FileRowState>("needs-replacing");

  return (
    <ShowcaseSection id="application-kit" title="Detail page kit" description="Generic building blocks for detail pages such as Application Details: cards with data states, figure tiles, document rows, timelines and the mobile action bar.">
      <Demo
        name="SectionCard"
        path="components/ub/data/SectionCard.tsx"
        description="Radius 12, 1px border, no resting shadow, padding 24 (16 on mobile). One header, and the same loading, empty and error states on every card."
        className="grid gap-6"
        code={`<SectionCard
  title="Application summary"
  action={<Tag tone="success">Verified</Tag>}
  state={loading ? "loading" : error ? "error" : "ready"}
  empty={{ icon: FileText, title: "No documents yet" }}
  onRetry={refetch}
>
  <DescriptionList items={items} />
</SectionCard>`}
        props={[
          { name: "title", type: "ReactNode", description: "Card heading (heading-md)." },
          { name: "description", type: "ReactNode", description: "One line under the heading." },
          { name: "action", type: "ReactNode", description: "End-side header content: TextButton, IconButton or Tag." },
          { name: "state", type: '"ready" | "loading" | "empty" | "error"', default: '"ready"', description: "Replaces the body with a skeleton, empty note or error." },
          { name: "empty", type: "{ icon?, title, description? }", description: "Content for the empty state." },
          { name: "errorMessage / onRetry", type: "string / () => void", description: "Error text and a Try again button." },
          { name: "footer", type: "ReactNode", description: "Row under the body, e.g. Tracked automatically." },
          { name: "flush", type: "boolean", default: "false", description: "No body padding, for edge-to-edge lists." },
          { name: "as", type: '"h2" | "h3" | "h4"', default: '"h3"', description: "Heading level." },
        ]}
      >
        <StateSwitch<SectionCardState> value={cardState} options={CARD_STATES} onChange={setCardState} label="Card state" />
        <ThemePreviews>
          <SectionCard
            title="Commission"
            action={<Tag tone="info">Invoiced</Tag>}
            state={cardState}
            empty={{ icon: FileText, title: "No commission yet", description: "Commission appears here once the student is placed." }}
            onRetry={() => setCardState("ready")}
            footer="Tracked automatically"
          >
            <p className="text-ub-body-sm text-ub-text-secondary">
              <Amount value={4200} /> for UBX-2026-0412.
            </p>
          </SectionCard>
        </ThemePreviews>
      </Demo>

      <Demo
        name="KeyValueGrid"
        path="components/ub/data/KeyValueGrid.tsx"
        description="The few figures a card leads with, tabular. Missing values read Not available, never a made-up number."
        code={`<KeyValueGrid
  columns={2}
  items={[
    { label: "Amount", value: <Amount value={4200} />, hint: "Flat fee per student" },
    { label: "Due", value: <DaysTag mode="deadline" days={5} /> },
  ]}
/>`}
        props={[
          { name: "items", type: "{ label, value?, hint? }[]", description: "Tiles in order." },
          { name: "columns", type: "1 | 2 | 3 | 4", default: "2", description: "Tiles per row from 576px up; one column on mobile." },
          { name: "fallback", type: "ReactNode", default: '"Not available"', description: "Shown for null, undefined or empty values." },
        ]}
      >
        <ThemePreviews>
          <KeyValueGrid
            items={[
              { label: "Amount", value: <Amount value={4200} />, hint: "Flat fee per student" },
              { label: "Due", value: <DaysTag mode="deadline" days={5} /> },
              { label: "Tuition", value: null },
            ]}
          />
        </ThemePreviews>
      </Demo>

      <Demo
        name="FileRow"
        path="components/ub/data/FileRow.tsx"
        description="One file with its state as a tag with text: Missing, Uploading, Uploaded, Verified, Needs replacing (with the reason). State changes are announced politely."
        className="grid gap-6"
        code={`<FileRow
  name="Academic transcript"
  state="needs-replacing"
  reason="Not certified. Upload a certified true copy."
  meta="Uploaded 12 Jun 2026"
  actions={<Button size="sm" variant="secondary" text="Replace file" icon={<RefreshCw className="h-4 w-4" />} />}
/>`}
        props={[
          { name: "name", type: "string", description: "Document name." },
          { name: "state", type: '"missing" | "uploading" | "uploaded" | "verified" | "needs-replacing"', description: "Drives the icon, tag and colour." },
          { name: "stateLabel", type: "string", description: 'Overrides the tag text, e.g. "In review".' },
          { name: "reason", type: "ReactNode", description: "Shown under Needs replacing." },
          { name: "progress", type: "number", description: "0–100 while uploading; omit for indeterminate." },
          { name: "meta", type: "ReactNode", description: "Date, size or uploader (caption, tabular)." },
          { name: "actions", type: "ReactNode", description: "End-side buttons." },
          { name: "asListItem", type: "boolean", default: "true", description: "Renders an <li>; wrap rows in a <ul>." },
        ]}
      >
        <StateSwitch<FileRowState> value={fileState} options={FILE_STATES} onChange={setFileState} label="File state" />
        <ThemePreviews>
          <ul className="divide-y divide-ub-border">
            <FileRow
              name="Academic transcript"
              state={fileState}
              progress={fileState === "uploading" ? 64 : undefined}
              reason="Not certified. Upload a certified true copy."
              meta="Uploaded 12 Jun 2026"
              actions={
                fileState === "needs-replacing" || fileState === "missing" ? (
                  <Button size="sm" variant="secondary" text={fileState === "missing" ? "Upload file" : "Replace file"} icon={fileState === "missing" ? <Upload className="h-4 w-4" aria-hidden /> : <RefreshCw className="h-4 w-4" aria-hidden />} />
                ) : (
                  <IconButton size="sm" variant="tertiary" title="Download academic transcript" icon={<Download className="h-4 w-4" aria-hidden />} />
                )
              }
            />
          </ul>
        </ThemePreviews>
      </Demo>

      <Demo
        name="Timeline"
        path="components/ub/data/Timeline.tsx"
        description="Newest first, grouped Today / This week / Earlier. Under 7 days the time is relative; after that it's a date (12 Jun 2026)."
        code={`<Timeline
  events={[{ id: "e1", title: "Offer received", at: "2026-11-02T08:00:00Z", tone: "success" }]}
/>`}
        props={[
          { name: "events", type: "{ id, title, description?, at, icon?, tone? }[]", description: "at is an ISO date-time." },
          { name: "grouped", type: "boolean", default: "true", description: "Group under Today / This week / Earlier." },
          { name: "now", type: "Date", default: "new Date()", description: "Reference time for tests and previews." },
          { name: "aria-label", type: "string", default: '"Activity"', description: "Name of the list." },
        ]}
      >
        <ThemePreviews>
          <Timeline events={EVENTS} now={NOW} />
        </ThemePreviews>
      </Demo>

      <Demo
        name="StickyActionBar"
        path="components/ub/navigation/StickyActionBar.tsx"
        description="Below 768px only: keeps the view's one Primary action in reach, above the bottom navigation. Give the page pb-20 so it never covers content."
        code={`<StickyActionBar aria-label="Next action">
  <Button variant="primary" text="Upload documents" className="flex-1" />
</StickyActionBar>`}
        props={[
          { name: "children", type: "ReactNode", description: "The Primary action (flex-1), optionally an IconButton." },
          { name: "aboveBottomNav", type: "boolean", default: "true", description: "Sit above the 64px NavbarBottom." },
          { name: "aria-label", type: "string", default: '"Page actions"', description: "Name of the region." },
        ]}
      >
        <Variant label="Static preview (the real bar is fixed and hidden from 768px up)">
          <div className="relative overflow-hidden rounded-ub-lg border border-ub-border bg-ub-canvas">
            <div className="flex items-center gap-3 border-t border-ub-border bg-ub-surface px-4 py-3">
              <Button variant="primary" text="Upload documents" icon={<Upload className="h-4 w-4" aria-hidden />} className="flex-1" />
            </div>
          </div>
        </Variant>
      </Demo>
    </ShowcaseSection>
  );
}
