/**
 * How long an application may sit in a stage without an update before it
 * counts as stuck. The API has no per-stage SLA timestamps, so the home uses
 * the application's last update (`updated_at`) against these limits.
 */
export const STUCK_AFTER_DAYS: Record<string, number> = {
  APPLICATION_REVIEW: 3,
  OFFER_LETTER: 14,
  VISA_PROCESSING: 21,
  STUDENT_ARRIVAL_ENROLLMENT: 14,
  PARTNER_COMMISSION_INVOICING: 30,
};
const DEFAULT_STUCK_AFTER_DAYS = 14;

export function isStuck(stageCode: string | null | undefined, daysSinceUpdate: number | undefined): boolean {
  if (daysSinceUpdate == null) return false;
  return daysSinceUpdate > (stageCode ? STUCK_AFTER_DAYS[stageCode] ?? DEFAULT_STUCK_AFTER_DAYS : DEFAULT_STUCK_AFTER_DAYS);
}
