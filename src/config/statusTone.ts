import type { TagTone } from "components/ub/recipes";
import { isAdvisorAction, isStaffAction } from "features/applications/stages";

/**
 * One status colour map for every role (home lists, tags):
 * success: done or good (Active, Verified, Paid)
 * info: moving, nobody here has to act (Under review, With the university)
 * warning: the viewer must do something, or it's pending (eVAL to upload, Awaiting review)
 * danger: a problem (Suspended, Rejected, Disputed, Expired, Overdue)
 * neutral: parked (Hidden, Draft, On hold)
 */
export type StatusTone = Extract<TagTone, "success" | "info" | "warning" | "danger" | "neutral">;
export type StatusViewer = "advisor" | "staff";

const norm = (s: string) => s.trim().toLowerCase().replace(/[_-]+/g, " ");

const DANGER = /\b(suspended|rejected|disput\w*|expired|exhausted|overdue|cancel|failed|issue)\b/;
const NEUTRAL = /\b(hidden|draft|on hold|hold|inactive)\b/;
const SUCCESS = /\b(active|verified|paid|approved|complete|completed|confirmed|enrolled|issued)\b/;
const PENDING = /\b(pending|awaiting review|unverified|otp|no applications)\b/;

export function statusTone(status: string | null | undefined, viewer: StatusViewer = "staff"): StatusTone {
  if (!status) return "neutral";
  // The viewer's own to-do is always warning, whatever the words say.
  if (viewer === "advisor" ? isAdvisorAction(status) : isStaffAction(status)) return "warning";
  const s = norm(status);
  if (DANGER.test(s)) return "danger";
  if (NEUTRAL.test(s)) return "neutral";
  if (PENDING.test(s)) return "warning";
  if (SUCCESS.test(s)) return "success";
  return "info";
}
