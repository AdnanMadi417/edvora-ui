import type { VoidPayoutPayload } from "features/applications/payouts";

export interface RaiseDisputePayload {
  justification: string;
}

export interface ResolveNoIssuePayload {
  report: string;
}

/** Byte-for-byte identical shape to VoidPayoutPayload -- resolving a
 *  dispute via correction voids the current payout and records a
 *  corrected one, the exact same operation as a plain void. */
export type ResolveCorrectionPayload = VoidPayoutPayload;
