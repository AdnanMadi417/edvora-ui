"use client";

import { useState } from "react";
import { Plus, Download, Pencil, Trash2, Send, Eye, CheckCircle2, Clock, AlertTriangle, Info, XCircle, FileText, GraduationCap, Wallet, Bell, Users, Building2 } from "lucide-react";
import Button from "components/ub/core/Button";
import IconButton from "components/ub/core/IconButton";
import PillButton from "components/ub/core/PillButton";
import NextButton from "components/ub/core/NextButton";
import PrevButton from "components/ub/core/PrevButton";
import LinkBtn from "components/ub/core/LinkBtn";
import ApproveRejectToggle from "components/ub/core/ApproveRejectToggle";
import ActionsDropdown from "components/ub/navigation/ActionsDropdown";
import StatusBadge from "components/ub/data/StatusBadge";
import SolidBadge from "components/ub/data/SolidBadge";
import DetailStatusBadge from "components/ub/data/DetailStatusBadge";
import type { StatusBadgeVariant } from "components/ub/data/StatusBadge";
import SectionIconBadge from "components/ub/icons/SectionIconBadge";
import FilterChip from "components/ub/data/FilterChip";
import { useToast } from "components/ub/feedback/ToastContext";
import { Demo, ShowcaseSection, Variant } from "./Showcase";

const VARIANTS: StatusBadgeVariant[] = ["success", "danger", "warning", "attention", "info", "neutral"];
const VARIANT_ICON = { success: CheckCircle2, danger: XCircle, warning: AlertTriangle, attention: Clock, info: Info, neutral: FileText };
const VARIANT_LABEL = { success: "Offer received", danger: "Rejected", warning: "Documents pending", attention: "Action needed", info: "In review", neutral: "Draft" };

export function Buttons() {
  const { showToast } = useToast();
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);
  const clicked = (what: string) => () => showToast(`${what} clicked`, "info");

  return (
    <ShowcaseSection id="buttons" title="Buttons and links" description="Every button and link-button component in components/ui.">
      <Demo
        name="Button"
        path="components/ub/core/Button.tsx"
        description="variant: primary (one per view) · secondary (default) · tertiary · positive · destructive (confirmation dialogs only) · inverse (on dark or blue). size: sm 32 · md 40 · lg 48."
        className="space-y-6"
      >
        <div className="flex flex-wrap items-end gap-4">
          <Variant label="primary">
            <Button variant="primary" text="Submit application" onClick={clicked("Submit application")} />
          </Variant>
          <Variant label="secondary (default)">
            <Button text="Add student" icon={<Plus className="h-4 w-4" />} onClick={clicked("Add student")} />
          </Variant>
          <Variant label="tertiary">
            <Button variant="tertiary" text="View details" onClick={clicked("View details")} />
          </Variant>
          <Variant label="positive">
            <Button variant="positive" text="Approve document" onClick={clicked("Approve document")} />
          </Variant>
          <Variant label="destructive">
            <Button variant="destructive" text="Withdraw application" icon={<Trash2 className="h-4 w-4" />} onClick={clicked("Withdraw")} />
          </Variant>
          <Variant label="inverse" className="rounded-ub-lg bg-ub-navy p-3">
            <Button variant="inverse" text="Share with the Earners Circle" onClick={clicked("Share")} />
          </Variant>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <Variant label="size sm">
            <Button size="sm" text="Add note" />
          </Variant>
          <Variant label="size md">
            <Button size="md" text="Add note" />
          </Variant>
          <Variant label="size lg">
            <Button size="lg" text="Add note" />
          </Variant>
          <Variant label="disabled">
            <Button text="Export CSV" icon={<Download className="h-4 w-4" />} disabled />
          </Variant>
        </div>
      </Demo>

      <Demo name="IconButton" path="components/ub/core/IconButton.tsx" className="flex flex-wrap items-end gap-4">
        <IconButton icon={<Eye className="h-4 w-4" />} aria-label="View" title="View" onClick={clicked("View")} />
        <IconButton icon={<Pencil className="h-4 w-4" />} aria-label="Edit" title="Edit" onClick={clicked("Edit")} />
        <IconButton icon={<Trash2 className="h-4 w-4" />} aria-label="Delete" title="Delete" variant="destructive" onClick={clicked("Delete")} />
        <IconButton icon={<Send className="h-4 w-4" />} aria-label="Send" title="Send" disabled />
      </Demo>

      <Demo name="PillButton" path="components/ub/core/PillButton.tsx" className="flex flex-wrap items-end gap-4">
        <PillButton text="Book a call" onClick={clicked("Book a call")} />
        <PillButton text="Download brochure" icon={<Download className="h-4 w-4" />} onClick={clicked("Download")} />
        <PillButton text="Unavailable" disabled />
      </Demo>

      <Demo name="NextButton / PrevButton" path="components/ub/core/NextButton.tsx" className="flex flex-wrap items-end gap-4">
        <PrevButton text="Back" onClick={clicked("Back")} />
        <NextButton text="Continue" onClick={clicked("Continue")} />
        <NextButton text="Continue" disabled />
      </Demo>

      <Demo name="LinkBtn" path="components/ub/core/LinkBtn.tsx" className="flex flex-wrap items-end gap-4">
        <LinkBtn href="#buttons" icon={<Eye className="h-4 w-4" />} label="View application" />
        <LinkBtn href="#buttons" icon={<FileText className="h-4 w-4" />} title="Open document" />
      </Demo>

      <Demo name="ApproveRejectToggle" path="components/ub/core/ApproveRejectToggle.tsx">
        <ApproveRejectToggle value={decision} onChange={setDecision} companyName="Global Pathways Education" />
      </Demo>

      <Demo name="ActionsDropdown" path="components/ub/navigation/ActionsDropdown.tsx" className="flex min-h-[220px] items-start justify-end">
        <ActionsDropdown
          items={[
            { label: "Edit details", icon: Pencil, onClick: clicked("Edit details"), color: "blue" },
            { label: "Resend email", icon: Send, onClick: clicked("Resend email"), color: "amber" },
            { label: "Approve", icon: CheckCircle2, onClick: clicked("Approve"), color: "green" },
            { label: "Delete", icon: Trash2, onClick: clicked("Delete"), color: "red" },
          ]}
        />
      </Demo>
    </ShowcaseSection>
  );
}

export function Badges() {
  const [chips, setChips] = useState(["Stage: Visa processing", "Institution: Sunway University", "Intake: Sep 2026"]);

  return (
    <ShowcaseSection id="badges" title="Badges and chips" description="Status variants share one StatusBadgeVariant type across the three badge styles.">
      <Demo name="StatusBadge" path="components/ub/data/StatusBadge.tsx" className="flex flex-wrap gap-3">
        {VARIANTS.map((v) => {
          const Icon = VARIANT_ICON[v];
          return (
            <StatusBadge key={v} variant={v} icon={<Icon className="h-3.5 w-3.5" />}>
              {VARIANT_LABEL[v]}
            </StatusBadge>
          );
        })}
      </Demo>
      <Demo name="SolidBadge" path="components/ub/data/SolidBadge.tsx" className="flex flex-wrap gap-3">
        {VARIANTS.map((v) => (
          <SolidBadge key={v} variant={v}>
            {VARIANT_LABEL[v]}
          </SolidBadge>
        ))}
      </Demo>
      <Demo name="DetailStatusBadge" path="components/ub/data/DetailStatusBadge.tsx" className="flex flex-wrap gap-3">
        {VARIANTS.map((v) => (
          <DetailStatusBadge key={v} variant={v}>
            {VARIANT_LABEL[v]}
          </DetailStatusBadge>
        ))}
      </Demo>
      <Demo name="SectionIconBadge" path="components/ub/icons/SectionIconBadge.tsx" className="flex flex-wrap gap-6">
        {(
          [
            ["blue", GraduationCap],
            ["green", Wallet],
            ["amber", Bell],
            ["red", AlertTriangle],
            ["violet", Users],
            ["slate", Building2],
          ] as const
        ).map(([color, Icon]) => (
          <Variant key={color} label={color}>
            <SectionIconBadge icon={Icon} color={color} />
          </Variant>
        ))}
      </Demo>
      <Demo name="FilterChip" path="components/ub/data/FilterChip.tsx" className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <FilterChip key={c} label={c} onRemove={() => setChips((all) => all.filter((x) => x !== c))} />
        ))}
        {chips.length === 0 && (
          <button type="button" className="text-ub-label-md text-ub-text-link hover:underline" onClick={() => setChips(["Stage: Visa processing", "Institution: Sunway University", "Intake: Sep 2026"])}>
            Reset chips
          </button>
        )}
      </Demo>
    </ShowcaseSection>
  );
}
