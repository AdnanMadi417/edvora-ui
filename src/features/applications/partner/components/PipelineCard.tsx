"use client";

import React from "react";
import { FileText, Mail, Send, GraduationCap, Wallet, Flag, ArrowUpRight } from "lucide-react";
import Button from "components/ub/core/Button";
import SolidBadge from "components/ub/data/SolidBadge";

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

type StageColor = {
  inactive: string;
  active: string;
  iconBgInactive: string;
  iconBgActive: string;
  iconColor: string;
  progressFill: string;
  progressTrack: string;
};

const STAGE_COLOR_MAP: Record<string, StageColor> = {
  review:     { inactive: "border-slate-200 bg-white hover:bg-blue-50",              active: "border-blue-300 bg-blue-50 shadow-sm",          iconBgInactive: "bg-slate-100",   iconBgActive: "bg-blue-200",    iconColor: "text-blue-600",    progressFill: "bg-blue-400",    progressTrack: "bg-slate-100" },
  offer:      { inactive: "border-slate-200 bg-white hover:bg-slate-50",             active: "border-violet-300 bg-violet-50 shadow-sm",      iconBgInactive: "bg-slate-100",   iconBgActive: "bg-violet-200",  iconColor: "text-violet-600",  progressFill: "bg-violet-400",  progressTrack: "bg-slate-100" },
  visa:       { inactive: "border-slate-200 bg-white hover:bg-slate-50",             active: "border-amber-300 bg-amber-50 shadow-sm",        iconBgInactive: "bg-slate-100",   iconBgActive: "bg-amber-200",   iconColor: "text-amber-600",   progressFill: "bg-amber-400",   progressTrack: "bg-slate-100" },
  arrival:    { inactive: "border-slate-200 bg-white hover:bg-slate-50",             active: "border-cyan-300 bg-cyan-50 shadow-sm",          iconBgInactive: "bg-slate-100",   iconBgActive: "bg-cyan-200",    iconColor: "text-cyan-600",    progressFill: "bg-cyan-400",    progressTrack: "bg-slate-100" },
  commission: { inactive: "border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50", active: "border-emerald-300 bg-emerald-50 shadow-sm",    iconBgInactive: "bg-emerald-100", iconBgActive: "bg-emerald-200", iconColor: "text-emerald-600", progressFill: "bg-emerald-500", progressTrack: "bg-emerald-100" },
  default:    { inactive: "border-slate-200 bg-white hover:bg-slate-50",             active: "border-slate-400 bg-slate-100 shadow-sm",       iconBgInactive: "bg-slate-100",   iconBgActive: "bg-slate-200",   iconColor: "text-slate-600",   progressFill: "bg-slate-400",   progressTrack: "bg-slate-100" },
};

function resolveColor(name: string): StageColor {
  const n = name.toLowerCase();
  for (const key of Object.keys(STAGE_COLOR_MAP)) {
    if (n.includes(key)) return STAGE_COLOR_MAP[key];
  }
  return STAGE_COLOR_MAP.default;
}

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

  return (
    <div className="bg-white">

      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-slate-900">{title}</p>
          <p className="mt-0.5 truncate text-sm text-slate-500">
            {subtitle ?? `${totalCount} active application${totalCount !== 1 ? "s" : ""} — move students right to unlock commission`}
          </p>
        </div>
      </div>

      {/* Stage cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:gap-3">
        {stages.map((stage) => {
          const count      = stageCounts[stage.id] ?? 0;
          const isComm     = stage.name.toLowerCase().includes("commission");
          const needsMove  = !isComm && stageActionRequired[stage.id];
          const Icon       = stageIcon(stage.name);
          const colors     = resolveColor(stage.name);
          const progress   = totalStageCount > 0 ? Math.round((count / totalStageCount) * 100) : 0;
          const isSelected = selectedId === stage.id;

          return (
            <button
              key={stage.id}
              onClick={() => onSelect(isSelected ? null : stage.id)}
              className={`flex flex-col rounded-xl border p-4 text-left transition-all lg:flex-1 ${
                isSelected ? colors.active : colors.inactive
              }`}
            >
              {/* Icon + badge row */}
              <div className="mb-3 flex items-center justify-between">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isSelected ? colors.iconBgActive : colors.iconBgInactive}`}>
                  <Icon className={`h-5 w-5 ${colors.iconColor}`} />
                </div>
                {isComm && (
                  <SolidBadge variant="success" className="rounded-full px-2 py-0.5 text-[10px]">
                    Payout
                  </SolidBadge>
                )}
                {needsMove && (
                  <SolidBadge variant="warning" className="rounded-full px-2 py-0.5 text-[10px]">
                    Your move
                  </SolidBadge>
                )}
              </div>

              {/* Count + label */}
              <p className={`text-xl font-bold ${count === 0 ? "text-slate-300" : "text-slate-900"}`}>{count}</p>
              <p className="truncate text-xs text-slate-500">{stage.name}</p>

              {/* Progress bar */}
              <div className={`mt-3 h-1 w-full overflow-hidden rounded-full ${colors.progressTrack}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors.progressFill}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-500">
          {totalActionRequired > 0 ? (
            <>
              <span className="font-semibold text-amber-600">{totalActionRequired} application{totalActionRequired !== 1 ? "s" : ""}</span>
              {" "}are waiting on you — clear them to push more students toward payout.
            </>
          ) : (
            <span className="text-emerald-600">All caught up — no actions required right now.</span>
          )}
        </p>
        <Button
          onClick={onViewCommission}
          text="View commission ready"
          icon={<ArrowUpRight className="h-4 w-4" />}
          bgColor="bg-blue-600"
          textColor="text-white"
          borderColor="border-blue-600"
          hoverTextColor="hover:text-white"
          hoverBorderColor="hover:border-blue-700"
          className="shrink-0 !bg-blue-600 hover:!bg-blue-700"
        />
      </div>
    </div>
  );
}
