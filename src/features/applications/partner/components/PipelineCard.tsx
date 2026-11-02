"use client";

import React from "react";
import { FileText, Mail, Send, GraduationCap, Wallet, Flag, ArrowUpRight } from "lucide-react";
import StatsFilterCards, { type CardColorScheme, type FilterCardItem } from "components/ub/navigation/StatsFilterCards";
import Button from "components/ub/core/Button";
import type { StageHue } from "config/applicationStages";
import { resolveStage } from "features/applications/stages";

interface Stage {
  id: string;
  name: string;
}

interface PipelineCardProps {
  stages: Stage[];
  stageCounts: Record<string, number>;
  stageActionRequired: Record<string, boolean>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  totalCount: number;
  totalActionRequired: number;
  onViewCommission: () => void;
  title?: string;
  subtitle?: string;
}

// Stage colour comes from features/applications/stages.ts (stage code → configured hue),
// shown through the card's theme-aware icon tints.
const HUE_SCHEME: Record<StageHue, CardColorScheme> = {
  grey: "slate",
  amber: "amber",
  indigo: "violet",
  sky: "blue",
  teal: "cyan",
  plum: "violet",
  pink: "rose",
  success: "emerald",
};
const schemeFor = (stage: Stage): CardColorScheme => {
  const hue = resolveStage({ stageCode: (stage as Stage & { code?: string }).code })?.stage?.hue;
  return hue ? HUE_SCHEME[hue] : "slate";
};

function stageIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("commission")) return Wallet;
  if (n.includes("arrival"))    return GraduationCap;
  if (n.includes("visa"))       return Send;
  if (n.includes("offer"))      return Mail;
  if (n.includes("review"))     return FileText;
  return Flag;
}

export default function PipelineCard({
  stages,
  stageCounts,
  stageActionRequired,
  selectedId,
  onSelect,
  totalCount,
  totalActionRequired,
  onViewCommission,
  title = "Your Pipeline",
  subtitle,
}: PipelineCardProps) {
  const totalStageCount = stages.reduce((sum, s) => sum + (stageCounts[s.id] ?? 0), 0);

  const cards: FilterCardItem[] = stages.map((stage) => {
    const count = stageCounts[stage.id] ?? 0;
    const isComm = stage.name.toLowerCase().includes("commission");
    const needsMove = !isComm && stageActionRequired[stage.id];
    return {
      id: stage.id,
      label: stage.name,
      count,
      icon: stageIcon(stage.name),
      colorScheme: schemeFor(stage),
      progress: totalStageCount > 0 ? Math.round((count / totalStageCount) * 100) : 0,
      badge: isComm ? { label: "Payout", tone: "success" } : needsMove ? { label: "Your move", tone: "attention" } : undefined,
    };
  });

  return (
    <section aria-labelledby="pipeline-title">
      <div className="mb-4">
        <h3 id="pipeline-title" className="text-ub-heading-sm text-ub-text-primary">{title}</h3>
        <p className="mt-0.5 truncate text-ub-body-sm text-ub-text-secondary">
          {subtitle ?? `${totalCount} active application${totalCount !== 1 ? "s" : ""} — move students right to unlock commission`}
        </p>
      </div>

      <StatsFilterCards cards={cards} selectedId={selectedId} onSelect={onSelect} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" />

      <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-ub-border pt-4 sm:flex-row sm:items-center">
        <p className="text-ub-body-sm text-ub-text-secondary">
          {totalActionRequired > 0 ? (
            <>
              <span className="font-semibold text-ub-tone-warning-text">{totalActionRequired} application{totalActionRequired !== 1 ? "s" : ""}</span>
              {" "}are waiting on you — clear them to push more students toward payout.
            </>
          ) : (
            <span className="text-ub-tone-success-text">All caught up — no actions required right now.</span>
          )}
        </p>
        <Button variant="secondary" onClick={onViewCommission} text="View commission ready" icon={<ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />} className="shrink-0" />
      </div>
    </section>
  );
}
