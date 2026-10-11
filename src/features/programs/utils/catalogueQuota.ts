import { getApiErrorCode, getApiErrorDetails, parseApiError } from "utils/parseApiError";

/**
 * The backend's daily catalogue read quota for partner accounts (UBX-425).
 * When a partner has used up a day's budget, the programs list and the
 * program detail endpoints answer 429 with this code, a message, and
 * details `{ metric, limit, count, resets_at }`. Counts reset at midnight
 * Asia/Kuala_Lumpur. This module turns that error into something the UI
 * can show calmly instead of a generic failure.
 */
export const CATALOGUE_QUOTA_ERROR_CODE = "catalogue_quota_exceeded";

export const CATALOGUE_QUOTA_METRIC_DETAIL_VIEWS = "program_detail_views";
export const CATALOGUE_QUOTA_METRIC_LIST_ROWS = "program_list_rows";

export interface CatalogueQuotaError {
  metric: string;
  limit: number | null;
  count: number | null;
  resetsAt: Date | null;
  /** The backend's own sentence, as a fallback for copy. */
  message: string;
}

const HOUR_MS = 3_600_000;

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** The quota error carried by a caught request error, or null for anything else. */
export function getCatalogueQuotaError(err: unknown): CatalogueQuotaError | null {
  if (getApiErrorCode(err) !== CATALOGUE_QUOTA_ERROR_CODE) return null;
  const details = getApiErrorDetails(err) ?? {};
  const parsed = typeof details.resets_at === "string" ? new Date(details.resets_at) : null;
  return {
    metric: typeof details.metric === "string" ? details.metric : "unknown",
    limit: asNumber(details.limit),
    count: asNumber(details.count),
    resetsAt: parsed && !Number.isNaN(parsed.getTime()) ? parsed : null,
    message: parseApiError(err, "Daily catalogue limit reached."),
  };
}

/** What the metric counts, in the user's words. */
export function catalogueQuotaMetricLabel(metric: string): string {
  if (metric === CATALOGUE_QUOTA_METRIC_DETAIL_VIEWS) return "program pages";
  if (metric === CATALOGUE_QUOTA_METRIC_LIST_ROWS) return "catalogue results";
  return "catalogue views";
}

/** "It resets at midnight, Malaysia time, in about 5 hours." */
export function describeCatalogueQuotaReset(resetsAt: Date | null, now: Date = new Date()): string {
  if (!resetsAt) return "It resets at midnight, Malaysia time.";
  const remaining = resetsAt.getTime() - now.getTime();
  if (remaining <= 0) return "It resets any moment now.";
  const when =
    remaining < HOUR_MS
      ? "in less than an hour"
      : remaining < 2 * HOUR_MS
        ? "in about an hour"
        : `in about ${Math.ceil(remaining / HOUR_MS)} hours`;
  return `It resets at midnight, Malaysia time, ${when}.`;
}
