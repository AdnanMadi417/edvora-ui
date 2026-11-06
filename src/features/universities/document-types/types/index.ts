export type DocumentType = {
  id: string;
  type: string;
  code: string;
  description: string;
  is_init_app_doc: boolean;
  is_required_init_app_doc: boolean;
  is_required_for_init: boolean;
  is_required_for_current_upload?: boolean;
  has_static_template: boolean;
  static_template_file_key: string | null;
  static_template_file_url: string | null;
};

export type DocumentTypeParams = {
  initOnly?: boolean;
  programId?: string;
  qualificationId?: string;
  applicationStageId?: string;
  nationality?: string;
};

export interface SetStaticTemplatePayload {
  file_key: string;
  file_url: string;
}
