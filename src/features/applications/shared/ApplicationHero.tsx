import React from "react";
import { GraduationCap, Building2, Clock, Globe, Calendar, ArrowRight, AlertCircle } from "lucide-react";
import PresignedImage from "components/ub/data/PresignedImage";
import AppDate from "components/ub/data/AppDate";
import DetailStatusBadge from "components/ub/data/DetailStatusBadge";
import { getStatusVariant } from "utils/getStatusVariant";
import { daysSince } from "utils/applicationFormatting";

// A status can carry a different next_actions entry per actor (e.g. partner
// "upload a corrected version" vs manager "review after re-upload") -- "2"
// consistently means partner and "3" consistently means manager/admin in
// every example observed from the real API so far.
type ApplicationHeroActor = "2" | "3";

interface ApplicationHeroProps {
  application: any;
  children?: React.ReactNode;
  /** Which actor's next_actions entry to show; falls back to the first entry if no match. */
  viewerActor?: ApplicationHeroActor;
  /** The specific reason an admin/manager typed when rejecting the current form, if any. */
  correctionReason?: string | null;
}

export default function ApplicationHero({ application, children, viewerActor, correctionReason }: ApplicationHeroProps) {
  const student = application.student || {};
  const program = application.program || {};
  const university = program.university || {};
  const stage = application.stage || {};
  const currentStatus = stage.statuses?.[0] || {};
  const nextActions = currentStatus.next_actions || [];
  const nextAction = viewerActor
    ? nextActions.find((a: any) => a.actor === viewerActor) ?? nextActions[0]
    : nextActions[0];

  return (
    <div className="p-6 border-b border-slate-200">
      {/* Top row: avatar + info | intake date */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <PresignedImage
            fileKey={application.student_photo_file_key}
            alt={student.name}
            className="h-16 w-16 shrink-0 rounded-full object-cover border-2 border-blue-200"
            fallback={
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-700 border-2 border-blue-200 text-xl font-bold text-white">
                {student.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            }
          />
          <div>
            <h2 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-slate-900">
              {student.name}
            </h2>
            {application.intake_date && (
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 sm:hidden">
                <Clock className="h-3 w-3" />
                <span>Intake: <AppDate value={application.intake_date} format="month" fallback="Not provided" /></span>
              </div>
            )}
            <div className="mt-1 block md:flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              {program.name && (
                <span className="items-center gap-1.5 hidden md:flex">
                  <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
                  {program.name}
                </span>
              )}
              {university.name && (
                <>
                  <span className="text-slate-300 hidden md:block">|</span>
                  <span className="items-center gap-1.5 hidden md:flex">
                    <Building2 className="h-3.5 w-3.5 text-blue-400" />
                    {university.name}
                  </span>
                </>
              )}
              {university.country && (
                <>
                  <span className="text-slate-300 hidden md:block">|</span>
                  <span className="items-center gap-1.5 hidden md:flex">
                    <Globe className="h-3.5 w-3.5 text-blue-400" />
                    {university.country}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-1 block md:flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          {program.name && (
            <span className="flex items-center gap-1.5 md:hidden">
              <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
              {program.name}
            </span>
          )}
          {university.name && (
            <span className="flex items-center gap-1.5 md:hidden">
              <Building2 className="h-3.5 w-3.5 text-blue-400" />
              {university.name}
            </span>
          )}
          {university.country && (
            <span className="flex items-center gap-1.5 md:hidden">
              <Globe className="h-3.5 w-3.5 text-blue-400" />
              {university.country}
            </span>
          )}
        </div>

        <div className="hidden sm:block shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-start">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Intake Date</p>
          <p className="mt-1 flex items-center justify-start gap-2 text-lg font-bold text-slate-900">
            <Calendar className="h-4 w-4 text-blue-400" />
            <AppDate value={application.intake_date} format="month" fallback="Not provided" />
          </p>
        </div>
      </div>

      {/* Bottom row: current status | next action */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Current Status</p>
          <div className="flex flex-wrap gap-2">
            {currentStatus.name && (
              <DetailStatusBadge variant={getStatusVariant(currentStatus.name)} className="min-w-0 max-w-full">
                <span className="truncate" title={currentStatus.name}>{currentStatus.name}</span>
              </DetailStatusBadge>
            )}
            {stage.name && (
              <DetailStatusBadge variant="neutral" className="min-w-0 max-w-full">
                <span className="truncate" title={stage.name}>{stage.name}</span>
              </DetailStatusBadge>
            )}
            <p className="inline-flex items-center text-xs font-normal text-slate-600">
              <span className="sm:hidden rounded-md border border-slate-200 bg-white px-3 py-1">{daysSince(application.updated_at)} d</span>
              <span className="hidden sm:inline">{daysSince(application.updated_at)} days in stage</span>
            </p>
          </div>
        </div>

        <div className="rounded-lg border-[2px] border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <ArrowRight className="h-4 w-4 text-blue-700" />
            </div>
            <div className="block space-y-1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-500">Next Action</p>
              <p className="text-sm font-medium text-slate-800">
                {nextAction?.name ?? "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {correctionReason && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Reason for rejection</p>
            <p className="mt-0.5 text-sm text-amber-800">{correctionReason}</p>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
