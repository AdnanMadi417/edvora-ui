// Shared response shape for the three "get one application, all details" endpoints
// (partners/{partner_id}/applications/{id}, account-managers/applications/{id},
// admin/applications/{id}) — confirmed field-for-field identical against their
// live Swagger schemas.
import type { ApplicationCommissionItem } from "features/applications/shared/commissionTypes";

export interface ApplicationDetail {
  id: string;
  is_draft: boolean;
  lifecycle_status: string;
  intake_date: string;
  arrival_date: string | null;
  is_e_visa_required: boolean;
  is_arrival_extra_docs_required: boolean;
  created_at: string;
  updated_at: string;
  partner: { id: string; name: string };
  program: any;
  student: any;
  student_photo_file_key: string | null;
  student_photo_file_url: string | null;
  stage: any;
  documents: any[];
  commissions: ApplicationCommissionItem[];
  payment_documents: any[];
  arrival_documents: any[];
  offer_letter_document: any;
  visa_document: any;
  emgs_evaluation_document: any;
  commission_documents: Record<string, any>;
}

export interface TimelineDocumentTypeRef {
  id: string;
  // display name, e.g. "Passport" — null if the document type was later deleted
  type: string | null;
  // stable code, e.g. "passport" — null under the same condition
  code: string | null;
}

// GET /applications/{id}/timeline — newest first. `status_transition` items
// populate the top-level from/to/reason/notes fields; every other entry_type
// populates only `detail`, whose shape varies by type (and for
// document_upload, by call site) — read it defensively.
//
// required_document_types populates on status_transition (from the
// transition's required_document_type_ids) and correction_request_updated
// (from detail.required_document_type_ids). requested_document_types and
// uploaded_document_types populate together on the bulk document_upload
// variant (from detail.requested_document_type_ids / .uploaded_document_type_ids).
// All three are null for every other entry_type.
export interface ApplicationTimelineItem {
  id: string;
  application_id: string;
  entry_type: string;
  actor_id: string | null;
  actor_name: string | null;
  from_stage: string | null;
  from_status: string | null;
  to_stage: string | null;
  to_status: string | null;
  reason_text: string | null;
  notes: string | null;
  detail: Record<string, unknown> | null;
  required_document_types: TimelineDocumentTypeRef[] | null;
  requested_document_types: TimelineDocumentTypeRef[] | null;
  uploaded_document_types: TimelineDocumentTypeRef[] | null;
  created_at: string;
}

export interface PaginatedApplicationTimeline {
  items: ApplicationTimelineItem[];
  total: number;
  page: number;
  page_size: number;
}
