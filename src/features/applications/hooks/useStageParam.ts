"use client";
import { useEffect, useRef } from "react";
import { stageCodeOf } from "features/applications/stages";

type Stage = { id: string; name: string; code?: string | null };

/** The stage a `?stage=` value names: a stage id, a backend stage code, or "commission". */
export function stageFromParam<T extends Stage>(stages: T[], value: string | null | undefined): T | undefined {
  if (!value) return undefined;
  const wanted = value.trim().toLowerCase();
  if (wanted === "commission")
    return stages.find((s) => stageCodeOf(s) === "PARTNER_COMMISSION_INVOICING" || /commission/i.test(s.name));
  return stages.find((s) => s.id.toLowerCase() === wanted || stageCodeOf(s)?.toLowerCase() === wanted);
}

/**
 * Applies `?stage=` from the URL once the stages have loaded, so a link
 * (the home pipeline, "Check commission") opens the list already filtered.
 * Reads window.location, so the page needs no Suspense boundary.
 */
export function useStageParam<T extends Stage>(stages: T[], onStage: (id: string) => void) {
  const applied = useRef(false);
  useEffect(() => {
    if (applied.current || !stages.length || typeof window === "undefined") return;
    applied.current = true;
    const stage = stageFromParam(stages, new URLSearchParams(window.location.search).get("stage"));
    if (stage) onStage(stage.id);
    // onStage is a setter wrapper; applying once per mount is the intent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages]);
}
