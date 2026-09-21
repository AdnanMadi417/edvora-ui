export type ReadStatus = "all" | "read" | "unread";

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  application_id: string;
  data: {
    // message notifications
    snippet?: string;
    sender_id?: string;
    message_id?: string;
    sender_name?: string;
    // stage-change notifications (application_stage_changed)
    actor_id?: string;
    actor_name?: string;
    actor_role?: string;
    to_stage_id?: string;
    to_status_id?: string;
    from_stage_id?: string;
    to_stage_code?: string;
    application_id?: string;
    from_status_id?: string;
    to_status_code?: string;
    from_stage_code?: string;
    from_status_code?: string;
    /** Display label for the current/new status, e.g. "Under Review by Account Manager". */
    to_status_name?: string;
    /** Display label for the current/new stage, e.g. "Application Review". */
    to_stage_name?: string;
    // correction_request_updated — only the newly added document types, not
    // the full merged list on the correction.
    status_id?: string;
    status_code?: string;
    newly_required_document_type_ids?: string[];
    reason_updated?: boolean;
    // student/university context — present on application_stage_changed and
    // new_application; *_url is a ready-to-render image URL, *_key is the
    // raw storage key (ignored for display, kept for parity with the rest
    // of the app's file-reference pattern).
    student_id?: string;
    student_name?: string;
    student_photo_key?: string | null;
    student_photo_url?: string | null;
    university_name?: string;
    // new_application
    /** Status at submission time — currently the real workflow status ("New
     *  Application"), not yet relabeled; see notificationIcons.ts comment. */
    status_name?: string;
    stage_name?: string;
    partner_id?: string;
    partner_name?: string;
    // partner_signed_up — exactly one of the two photo/logo pairs below is
    // present, based on partner_type.
    partner_type?: "individual" | "agency";
    country?: string;
    nationality?: string;
    partner_photo_key?: string | null;
    partner_photo_url?: string | null;
    agency_logo_key?: string | null;
    agency_logo_url?: string | null;
  };
  created_at: string;
  read_at: string | null;
}

export interface PaginatedNotifications {
  items: Notification[];
  total: number;
  page: number;
  page_size: number;
}

export interface ListNotificationsParams {
  read_status?: ReadStatus;
  page?: number;
  page_size?: number;
  /** ISO datetime — only return notifications created after this (for polling). */
  since?: string;
}
