"use client";

import { ReactNode } from "react";
import clsx from "clsx";
import { Award, BadgeDollarSign, Check, FileText, GraduationCap, Plus, ShieldCheck } from "lucide-react";
import Button from "components/ub/core/buttons/Button";
import TextButton from "components/ub/core/buttons/TextButton";
import Amount from "components/ub/core/typography/Amount";
import RefId from "components/ub/core/typography/RefId";
import StatCard from "components/ub/data/cards/StatCard";
import DaysTag from "components/ub/data/badges/DaysTag";
import CountBadge from "components/ub/data/badges/CountBadge";
import PipelineBar from "components/ub/data/display/PipelineBar";
import { Avatar } from "components/ub/data/media/Avatar";
import { List, ListItem } from "components/ub/data/display/List";
import ProgressBar from "components/ub/feedback/states/ProgressBar";
import { card, cardPadding } from "components/ub/recipes";
import { ACTIVITY, ADVISOR, DEADLINES, NEXT_ACTIONS, ONBOARDING, PIPELINE, STATS } from "./advisorHome.data";

/** Solid panel: data and lists stay on a solid surface in both themes (guide §3). */
function Panel({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section aria-label={title} className={clsx(card, cardPadding, "min-w-0", className)}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-ub-heading-md text-ub-text-primary">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * Advisor home (brief §6, dark guide reference screen). Glass chrome and
 * four glass stat cards, then next actions, deadlines, pipeline, onboarding
 * and recent activity on solid surfaces. One Primary action: Add student.
 */
export default function AdvisorHome({ headingLevel = 1 }: { headingLevel?: 1 | 2 }) {
  const done = ONBOARDING.filter((s) => s.done).length;
  const Title = headingLevel === 1 ? "h1" : "h2";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-ub-body-sm text-ub-text-tertiary">{ADVISOR.today}</p>
          <Title className="text-ub-display-md-mobile text-ub-text-primary sm:text-ub-display-md">Good morning, {ADVISOR.firstName}</Title>
          <p className="mt-1 text-ub-body-lg text-ub-text-secondary">
            <span className="ub-tabular font-semibold text-ub-text-primary">{NEXT_ACTIONS.length}</span> applications need your action today.
          </p>
        </div>
        <Button variant="primary" text="Add student" icon={<Plus className="h-4 w-4" />} />
      </header>

      {/* Glass stat cards (dark guide §3: glass on summaries only) */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active applications" icon={<FileText className="h-5 w-5" />} value={STATS.active.value} delta={{ value: STATS.active.delta, unit: "" }} context={STATS.active.context} sparkline={STATS.active.sparkline} />
        <StatCard label="Offers this intake" icon={<Award className="h-5 w-5" />} value={STATS.offers.value} delta={{ value: STATS.offers.delta }} context={STATS.offers.context} />
        <StatCard label="Commission pending" icon={<BadgeDollarSign className="h-5 w-5" />} value={<Amount value={STATS.commission.value} />} delta={{ value: STATS.commission.delta }} context={STATS.commission.context} />
        <StatCard label="Placed this year" icon={<GraduationCap className="h-5 w-5" />} value={STATS.placed.value} delta={{ value: STATS.placed.delta }} context={STATS.placed.context} sparkline={STATS.placed.sparkline} />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <Panel title="Next actions" className="xl:col-span-2" action={<CountBadge count={NEXT_ACTIONS.length} tone="danger" label={(n) => `${n} actions due`} />}>
          <List aria-label="Next actions">
            {NEXT_ACTIONS.map((a) => (
              <ListItem
                key={a.reference}
                leading={<Avatar name={a.student} size={40} />}
                title={a.task}
                description={
                  <span>
                    {a.student} · <RefId value={a.reference} />
                  </span>
                }
                meta={<DaysTag mode={a.mode} days={a.days} />}
                trailing={<Button size="sm" text={a.action} />}
              />
            ))}
          </List>
        </Panel>

        <Panel title="Upcoming deadlines">
          <List aria-label="Upcoming deadlines" dense>
            {DEADLINES.map((d) => (
              <ListItem key={d.title} title={d.title} description={d.detail} meta={<DaysTag mode="deadline" days={d.days} />} />
            ))}
          </List>
        </Panel>

        <Panel title="Pipeline" className="xl:col-span-2" action={<TextButton size="sm" href="/partner/applications">Open Application Tracker</TextButton>}>
          <PipelineBar counts={PIPELINE} label="Your applications by stage" />
        </Panel>

        <Panel title="Finish setting up" action={<span className="ub-tabular text-ub-label-md text-ub-text-secondary">{done} of {ONBOARDING.length}</span>}>
          <ProgressBar value={done} max={ONBOARDING.length} label="Onboarding progress" />
          <ul className="mt-4 space-y-2">
            {ONBOARDING.map((s) => (
              <li key={s.label} className="flex items-center gap-3 text-ub-body-sm">
                <span className={clsx("grid h-5 w-5 shrink-0 place-items-center rounded-ub-full", s.done ? "bg-ub-action-primary text-ub-action-primary-text" : "border border-ub-border-control")}>
                  {s.done && <Check className="h-3 w-3" aria-hidden />}
                </span>
                <span className={s.done ? "text-ub-text-tertiary" : "text-ub-text-primary"}>
                  {s.label}
                  <span className="sr-only">{s.done ? " (done)" : " (to do)"}</span>
                </span>
              </li>
            ))}
          </ul>
          {/* Callout (dark guide §4): the covenant is required and never skipped (brief §6). */}
          <div className="mt-4 rounded-ub-lg border border-ub-callout-border bg-ub-brand-subtle-bg p-3">
            <p className="flex items-center gap-2 text-ub-label-md text-ub-brand-subtle-text">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden /> Non-Compete Covenant signed
            </p>
            <p className="mt-1 text-ub-body-sm text-ub-text-secondary">Required for every Advisor. You can review it any time in Profile settings.</p>
          </div>
          <TextButton className="mt-4" trailingIcon="arrow-right">
            Continue setup
          </TextButton>
        </Panel>

        <Panel title="Recent activity" className="xl:col-span-3">
          <List aria-label="Recent activity" dense>
            {ACTIVITY.map((a) => (
              <ListItem
                key={a.what}
                leading={<Avatar name={a.who} size={32} />}
                title={
                  <span>
                    <span className="font-semibold">{a.who}</span> {a.what}
                  </span>
                }
                meta={<span className="text-ub-caption text-ub-text-tertiary">{a.when}</span>}
              />
            ))}
          </List>
        </Panel>
      </div>
    </div>
  );
}
