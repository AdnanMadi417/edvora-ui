import { getApiErrorCode, getApiErrorDetails, parseApiError } from "utils/parseApiError";

/**
 * The backend's daily catalogue read quota for partner accounts (UBX-425).
 * When a partner has used up a day's budget, the programs list and the
 * program detail endpoints answer 429 with this code, a message, and
 * details `{ metric, limit, count, resets_at }`. Counts reset at midnight
 * Asia/Kuala_Lumpur. This module recognises that error so the UI can show
 * a calm notice instead of a generic failure. The parsed numbers are kept
 * for completeness but not shown to the partner; see CatalogueQuotaNotice.
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
