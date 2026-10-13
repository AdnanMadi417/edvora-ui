// Banks reference list — GET /banks (anyone authenticated), POST/PATCH
// /banks (admin/data-entry only). See the integration guide: this is a
// small, deliberately curated list (Malaysia today), not a general bank
// directory — no pagination/search-as-you-type on the API side.
export interface Bank {
  id: string;
  /** ISO 3166-1 alpha-2, e.g. "MY". */
  country: string;
  code: string;
  swift_code: string | null;
  name: string;
  is_active: boolean;
}

export interface CreateBankPayload {
  country: string;
  code: string;
  swift_code?: string;
  name: string;
  is_active?: boolean;
}

/** True partial update — only send the fields being changed. */
export interface UpdateBankPayload {
  country?: string;
  code?: string;
  swift_code?: string | null;
  name?: string;
  is_active?: boolean;
}

export interface BanksListParams {
  country?: string;
  /** Defaults to false on the backend — omit to get active banks only. */
  include_inactive?: boolean;
}
