"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import {
  Award,
  BadgeCheck,
  CheckCircle2,
  CircleHelp,
  Fingerprint,
  GraduationCap,
  Languages,
  Link2,
  MapPin,
  MessageCircle,
  PlayCircle,
  Send,
  ShieldCheck,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "components/ub/data/media/Avatar";
import Tag from "components/ub/data/badges/Tag";
import Faq from "components/ub/data/display/Faq";
import Tooltip from "components/ub/feedback/dialogs/Tooltip";
import Input from "components/ub/forms/text/Input";
import Textarea from "components/ub/forms/text/Textarea";
import Tabs from "components/ub/navigation/controls/Tabs";
import IconButton from "components/ub/core/buttons/IconButton";
import { TextButton } from "components/ub/core/buttons/TextButton";
import IconTile from "components/ub/dashboard/shared/IconTile";
import { buttonBase, buttonSizes, buttonVariants, card, cardPadding } from "components/ub/recipes";
import type { AdvisorContactChannel, PublicPartnerProfile } from "features/partners/types";
import {
  DEFAULT_CONTACT_LABEL,
  contactHref,
  placeName,
  youtubeEmbedUrl,
  type AdvisorProfileDraft,
} from "./profileModel";

export type AdvisorProfileErrors = Partial<Record<"display_name" | "intro_video_url" | "contact_value", string>>;

export interface AdvisorProfileProps {
  /** Read-only facts from the account: photo, languages, country, verification, stats. */
  profile: PublicPartnerProfile;
  /** What the page shows; in edit mode, what the Advisor is typing. */
  draft: AdvisorProfileDraft;
  /** Fields become inputs and every change goes to onChange. */
  editing?: boolean;
  /** Wider editorial layout for the full-page pattern. */
  spacious?: boolean;
  onChange?: (patch: Partial<AdvisorProfileDraft>) => void;
  errors?: AdvisorProfileErrors;
}

const VERIFIED_EXPLANATION =
  "Unibexs confirmed this advisor has supported at least one student through visa approval. Granted by Unibexs, never self-reported.";

const CHANNELS: { key: AdvisorContactChannel; label: string; icon: LucideIcon }[] = [
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "telegram", label: "Telegram", icon: Send },
  { key: "link", label: "Website or link", icon: Link2 },
];
export const channelIcon = (c: AdvisorContactChannel) => CHANNELS.find((x) => x.key === c)?.icon ?? MessageCircle;

function Section({ title, icon, children, className }: { title: string; icon?: LucideIcon; children: ReactNode; className?: string }) {
  const Icon = icon;
  return (
    <section className={clsx(card, cardPadding, className)} aria-label={title}>
      <h2 className="mb-4 flex items-center gap-2 text-ub-heading-sm text-ub-text-primary">
        {Icon && <Icon className="h-5 w-5 shrink-0 text-ub-text-link" aria-hidden="true" />}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Fact({ icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-3 border-b border-ub-border py-3 last:border-b-0">
      <IconTile icon={icon} tone="brand" size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-ub-label-sm text-ub-text-tertiary">{label}</p>
        <div className="mt-0.5 text-ub-body-sm font-medium text-ub-text-primary">{children}</div>
      </div>
    </div>
  );
}

/** Edit-only: a list of short lines with remove buttons and an add row. */
function EditableList({ items, onChange, itemLabel, addLabel, placeholder }: { items: string[]; onChange: (items: string[]) => void; itemLabel: string; addLabel: string; placeholder: string }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-ub-tone-success-text" aria-hidden="true" />
          <Input
            label={`${itemLabel} ${i + 1}`}
            hideLabel
            value={item}
            placeholder={placeholder}
            onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))}
            wrapperClassName="flex-1"
          />
          <IconButton variant="tertiary" size="sm" aria-label={`Remove ${itemLabel.toLowerCase()} ${i + 1}`} icon={<Trash2 className="h-4 w-4" aria-hidden="true" />} onClick={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      <TextButton leadingIcon="plus" onClick={() => onChange([...items, ""])}>
        {addLabel}
      </TextButton>
    </div>
  );
}

/**
 * The Advisor's public profile, in the order students read it: who they are,
 * how to reach them, a short video, what they help with and common questions.
 * Read-only on /p/[slug]; editable on /partner/public-profile, where Preview
 * shows this same component read-only.
 */
export default function AdvisorProfile({ profile, draft, editing = false, spacious = false, onChange = () => undefined, errors = {} }: AdvisorProfileProps) {
  const name = draft.display_name || profile.name;
  const content = profile.content;
  const students = content?.students_enrolled ?? 0;
  const country = placeName(profile.country);
  const basedIn = [draft.city, country].filter(Boolean).join(", ");
  const destinations = draft.countries_supported.map(placeName).filter(Boolean).join(", ");
  const embed = youtubeEmbedUrl(draft.intro_video_url);
  const href = contactHref(draft.contact_channel, draft.contact_value, name);
  const ContactIcon = channelIcon(draft.contact_channel);
  const helpPoints = draft.help_points.filter((p) => p.trim());
  const faqs = draft.faqs.filter((f) => f.question.trim() && f.answer.trim());

  const contactButton = (
    <a
      href={href ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={!href || undefined}
      onClick={(e) => !href && e.preventDefault()}
      className={clsx(buttonBase, buttonVariants.primary, buttonSizes.lg, "w-full", !href && "pointer-events-none opacity-60")}
    >
      <ContactIcon className="h-5 w-5" aria-hidden="true" />
      {draft.contact_label.trim() || DEFAULT_CONTACT_LABEL}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );

  return (
    <div className={clsx(spacious ? "grid items-start gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)] lg:gap-6" : "space-y-4")}>
      {/* Who they are + how to reach them */}
      <section className={clsx(card, "overflow-hidden", spacious && "lg:col-start-1 lg:row-span-4 lg:sticky lg:top-24")} aria-label="Advisor">

        <div className={cardPadding}>
        <div className={clsx("flex flex-col items-start gap-5 text-start", !spacious && "sm:flex-row")}>
          <Avatar name={name} src={profile.profile_photo_file_url} size={96} className="ring-4 ring-ub-tone-brand-bg rounded-ub-full" />
          <div className="min-w-0 flex-1 space-y-2">
            {editing ? (
              <div className={clsx("grid gap-3", !spacious && "sm:grid-cols-2")}>
                <Input label="Name" value={draft.display_name} onChange={(v) => onChange({ display_name: v })} error={errors.display_name} required />
                <Input label="Role" value={draft.role_title} placeholder="Education Advisor" onChange={(v) => onChange({ role_title: v })} />
              </div>
            ) : (
              <>
                <h1 className="text-ub-heading-xl text-ub-text-primary">{name}</h1>
                <p className="flex items-center justify-start gap-1.5 text-ub-body-sm text-ub-text-secondary sm:justify-start">
                  <GraduationCap className="h-4 w-4 shrink-0 text-ub-text-link" aria-hidden="true" />
                  {[draft.role_title, "Unibexs Network"].filter(Boolean).join(" · ")}
                </p>
              </>
            )}
            <div className="flex flex-wrap items-center justify-start gap-2">
              {profile.is_verified && (
                <Tooltip content={VERIFIED_EXPLANATION} position="bottom">
                  <Tag tone="success" icon={<BadgeCheck aria-hidden="true" />}>
                    Verified advisor
                  </Tag>
                </Tooltip>
              )}
              {students > 0 && (
                <Tag tone="brand" icon={<Award aria-hidden="true" />}>
                  {students} {students === 1 ? "student" : "students"} placed
                </Tag>
              )}
              {content?.identity_verified && (
                <Tag tone="neutral" icon={<Fingerprint aria-hidden="true" />}>
                  Identity verified
                </Tag>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5">
          {editing ? (
            <Input label="Headline" value={draft.headline} placeholder="Your trusted guide to studying in Malaysia" onChange={(v) => onChange({ headline: v })} helperText="One line students see under your name." maxLength={90} />
          ) : (
            draft.headline && <p className="text-ub-body-lg text-ub-text-primary">{draft.headline}</p>
          )}
        </div>

        <div className={clsx("mt-6 grid gap-3", !spacious && "sm:grid-cols-3")}>
          <Fact icon={MapPin} label="Based in">
            {editing ? (
              <Input label="City" hideLabel value={draft.city} placeholder="City" onChange={(v) => onChange({ city: v })} helperText={country ? `Country: ${country}` : undefined} />
            ) : (
              basedIn || "Not added yet"
            )}
          </Fact>
          <Fact icon={Languages} label="Languages">
            {profile.languages.length ? profile.languages.join(", ") : "Not added yet"}
            {editing && <p className="mt-1 text-ub-caption font-normal text-ub-text-tertiary">From your account details</p>}
          </Fact>
          <Fact icon={GraduationCap} label="Study destinations">
            {editing ? (
              <Input
                label="Study destinations"
                hideLabel
                value={draft.countries_supported.join(", ")}
                placeholder="Malaysia, Indonesia"
                onChange={(v) => onChange({ countries_supported: v.split(",").map((x) => x.trimStart()) })}
                helperText="Separate with commas"
              />
            ) : (
              destinations || "Not added yet"
            )}
          </Fact>
        </div>

        <div className={clsx("mt-6 space-y-3", spacious && !editing && "max-w-sm")}>
          {!editing && contactButton}
          {editing && (
            <div className="space-y-4 rounded-ub-md border border-ub-border bg-ub-surface-subtle p-4">
              <div className="space-y-2">
                <p className="text-ub-label-md text-ub-text-primary">Where the button goes</p>
                <Tabs
                  variant="segmented"
                  size="sm"
                  idPrefix="contact-channel"
                  tabs={CHANNELS.map(({ key, label, icon }) => ({ key, label, icon }))}
                  active={draft.contact_channel}
                  onChange={(key) => onChange({ contact_channel: key, contact_value: key === "link" ? "" : draft.contact_channel === "link" ? profile.whatsapp_number ?? "" : draft.contact_value })}
                />
              </div>
              <div className={clsx("grid gap-3", !spacious && "sm:grid-cols-2")}>
                <Input label="Button text" value={draft.contact_label} placeholder={DEFAULT_CONTACT_LABEL} onChange={(v) => onChange({ contact_label: v })} maxLength={30} />
                <Input
                  label={draft.contact_channel === "link" ? "Link" : "Phone number"}
                  value={draft.contact_value}
                  type={draft.contact_channel === "link" ? "url" : "tel"}
                  inputMode={draft.contact_channel === "link" ? "url" : "tel"}
                  placeholder={draft.contact_channel === "link" ? "https://" : "+60123456789"}
                  onChange={(v) => onChange({ contact_value: v })}
                  error={errors.contact_value}
                  required
                />
              </div>
            </div>
          )}
        </div>
        </div>
      </section>

      {/* Intro video */}
      {(editing || embed) && (
        <Section title="Meet your advisor" icon={PlayCircle} className={spacious ? "lg:col-start-2" : undefined}>
          {embed ? (
            <div className="aspect-video overflow-hidden rounded-ub-md border border-ub-border bg-ub-surface-subtle">
              <iframe
                src={embed}
                title={`Intro video from ${name}`}
                className="h-full w-full"
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-ub-md border border-dashed border-ub-border bg-ub-surface-subtle p-6 text-center">
              <PlayCircle className="h-8 w-8 text-ub-text-tertiary" aria-hidden="true" />
              <p className="text-ub-body-sm text-ub-text-secondary">Add a short YouTube video so students can meet you first.</p>
            </div>
          )}
          {editing && (
            <Input
              label="YouTube link"
              value={draft.intro_video_url}
              type="url"
              placeholder="https://youtube.com/watch?v=…"
              onChange={(v) => onChange({ intro_video_url: v })}
              error={errors.intro_video_url}
              wrapperClassName="mt-4"
            />
          )}
        </Section>
      )}

      {/* What they help with */}
      {(editing || draft.help_intro.trim() || helpPoints.length > 0) && (
        <Section title="How I can help you" className={spacious ? "lg:col-start-2" : undefined}>
          {editing ? (
            <div className="space-y-4">
              <Textarea label="Introduction" value={draft.help_intro} rows={3} placeholder="I help international students…" onChange={(v) => onChange({ help_intro: v })} maxLength={400} />
              <EditableList items={draft.help_points} onChange={(help_points) => onChange({ help_points })} itemLabel="Point" addLabel="Add point" placeholder="Student visa guidance" />
            </div>
          ) : (
            <>
              {draft.help_intro.trim() && <p className="whitespace-pre-line text-ub-body-md text-ub-text-secondary">{draft.help_intro}</p>}
              {helpPoints.length > 0 && (
                <ul className="mt-4 space-y-2.5">
                  {helpPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-ub-body-md text-ub-text-primary">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-ub-tone-success-text" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </Section>
      )}

      {/* Questions */}
      {(editing || faqs.length > 0) && (
        <Section title="Questions students ask me" icon={CircleHelp} className={spacious ? "lg:col-start-2" : undefined}>
          {editing ? (
            <div className="space-y-3">
              {draft.faqs.map((f, i) => (
                <div key={i} className="space-y-3 rounded-ub-md border border-ub-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-ub-label-sm text-ub-text-tertiary">Question {i + 1}</p>
                    <IconButton variant="tertiary" size="sm" aria-label={`Remove question ${i + 1}`} icon={<Trash2 className="h-4 w-4" aria-hidden="true" />} onClick={() => onChange({ faqs: draft.faqs.filter((_, j) => j !== i) })} />
                  </div>
                  <Input label="Question" value={f.question} placeholder="Do you charge students?" onChange={(v) => onChange({ faqs: draft.faqs.map((x, j) => (j === i ? { ...x, question: v } : x)) })} />
                  <Textarea label="Answer" value={f.answer} rows={2} onChange={(v) => onChange({ faqs: draft.faqs.map((x, j) => (j === i ? { ...x, answer: v } : x)) })} />
                </div>
              ))}
              <TextButton leadingIcon="plus" onClick={() => onChange({ faqs: [...draft.faqs, { question: "", answer: "" }] })}>
                Add question
              </TextButton>
            </div>
          ) : (
            <Faq items={faqs} />
          )}
        </Section>
      )}

      {/* Trust note */}
      <aside className={clsx("flex items-start gap-3 rounded-ub-lg border border-ub-border bg-ub-surface-subtle p-5", spacious && "lg:col-start-2")}>
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ub-tone-success-text" aria-hidden="true" />
        <p className="text-ub-body-sm text-ub-text-secondary">
          This page is run by an advisor in the Unibexs network. Applications are submitted and tracked through Unibexs. Always confirm details before making any payment.
        </p>
      </aside>
    </div>
  );
}
