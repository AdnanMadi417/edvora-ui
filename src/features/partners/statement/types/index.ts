import type { WaitingOn } from "features/applications/payouts";

export type { WaitingOn };

/** A row in the partner's self-service Statement — the read-only
 *  equivalent of the admin commission queue, scoped to the logged-in
 *  partner (or their whole agency team). `commission_amount` is a single
 *  evolving figure (agreed -> pay-in amount -> paid amount as `waiting_on`
 *  progresses), not a three-way breakdown like the admin view, and
 *  `since_date` is a plain date never meant to be turned into a day-count
 *  or overdue cue. */
export interface PartnerStatementItem {
  application_commission_id: string;
  application_id: string;
  reference: string;
  student_name: string;
  partner_id: string;
  partner_name: string | null;
  university_name: string;
  program_name: string;
  created_at: string;
  /** Null when no amount was agreed on the program's commission. */
  commission_amount: number | null;
  commission_currency: string;
  waiting_on: WaitingOn;
  since_date: string;
  payout_reference: string | null;
}

export interface PartnerStatementResponse {
  items: PartnerStatementItem[];
  total: number;
  page: number;
  page_size: number;
}
