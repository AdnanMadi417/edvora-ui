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
