// Application stages and tracker step presets (brief §4.3, §4.5, §11.1).
import { WORKFLOW } from "./workflow.generated";
//
// ⚠ PENDING CONFIRMATION — the final stage list has NOT been confirmed by
// product/backend (brief §11.1, a blocker). The guide shows three versions:
// 10 stage tags, a 5-step Student profile tracker and a 6-step Glass Box
// tracker. Every screen and component reads stages from this file, so once
// the list is confirmed, adding, removing, renaming or re-ordering a stage is
// a one-line edit here. Do not hard-code stage names anywhere else.

/** Tag hues from the guide (brief §2.1), plus the success role for closed-won stages. */
export type StageHue =
  | "grey"
  | "amber"
  | "indigo"
  | "sky"
  | "teal"
  | "plum"
  | "pink"
  | "success";

export interface ApplicationStage {
  /** Stable id, safe to persist and to map to backend values. */
  id: string;
  /** Sentence-case label shown on the stage tag. */
  label: string;
  /** Tag hue (functional only, never decorative). */
  hue: StageHue;
}

/** The 10 stage tags (brief §4.3; hues suggested by the guide's screenshots). */
export const APPLICATION_STAGES = [
  { id: "enquiry", label: "Enquiry", hue: "grey" },
  { id: "documents-pending", label: "Documents pending", hue: "amber" },
  { id: "submitted", label: "Submitted to Institution", hue: "indigo" },
  { id: "institution-review", label: "In Institution review", hue: "sky" },
  { id: "offer-received", label: "Offer received", hue: "teal" },
  { id: "visa-in-progress", label: "Visa in progress", hue: "plum" },
  { id: "arrival-logistics", label: "Arrival and Logistics", hue: "pink" },
  { id: "enrolled", label: "Enrolled", hue: "success" },
  { id: "commission-paid", label: "Commission paid", hue: "success" },
  { id: "withdrawn", label: "Withdrawn", hue: "grey" },
] as const satisfies readonly ApplicationStage[];

export type ApplicationStageId = (typeof APPLICATION_STAGES)[number]["id"];

export function getStage(id: string): ApplicationStage | undefined {
  return APPLICATION_STAGES.find((s) => s.id === id);
}

/** A step in an ApplicationTracker preset. */
export interface TrackerStepConfig {
  id: string;
  label: string;
  /** The stage tag this step corresponds to, when there is one. */
  stageId?: ApplicationStageId;
}

/** 5-step tracker on the Student profile (brief §6, §11.1). */
export const STUDENT_PROFILE_STEPS: readonly TrackerStepConfig[] = [
  { id: "enquiry", label: "Enquiry", stageId: "enquiry" },
  { id: "documents", label: "Documents", stageId: "documents-pending" },
  { id: "submitted", label: "Submitted", stageId: "submitted" },
  { id: "offer", label: "Offer", stageId: "offer-received" },
  { id: "visa", label: "Visa", stageId: "visa-in-progress" },
];

/** 6-step tracker in the student-facing Glass Box (brief §6, §11.1): the profile steps plus Arrival. */
export const GLASS_BOX_STEPS: readonly TrackerStepConfig[] = [
  ...STUDENT_PROFILE_STEPS,
  { id: "arrival", label: "Arrival", stageId: "arrival-logistics" },
];

/** 7-step tracker on the application page: the student's journey through arrival,
 *  then the Advisor's commission, which is where the application ends for them. */
export const APPLICATION_PAGE_STEPS: readonly TrackerStepConfig[] = [
  ...GLASS_BOX_STEPS,
  { id: "commission", label: "Commission", stageId: "commission-paid" },
];

/** Backend stage codes (config/workflow.generated.ts) mapped to the shared visual palette; API labels stay authoritative. */
const API_STAGE_TAGS: Record<string, ApplicationStageId> = {
  APPLICATION_REVIEW: "documents-pending",
  OFFER_LETTER: "offer-received",
  VISA_PROCESSING: "visa-in-progress",
  STUDENT_ARRIVAL_ENROLLMENT: "arrival-logistics",
  PARTNER_COMMISSION_INVOICING: "enrolled",
};
const key = (value: string) => value.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
export function getApiStageTagId(stage: {
  id: string;
  name: string;
  code?: string;
}): ApplicationStageId | undefined {
  // The detail response has no stage code, so fall back to the backend's stage name.
  const code =
    stage.code ??
    WORKFLOW.find((s) => key(s.name) === key(stage.name) || key(s.code) === key(stage.name))?.code;
  return (
    (code ? API_STAGE_TAGS[code] : undefined) ??
    APPLICATION_STAGES.find(
      (item) =>
        item.id === stage.id ||
        item.label.toLowerCase() === stage.name.toLowerCase()
    )?.id
  );
}
