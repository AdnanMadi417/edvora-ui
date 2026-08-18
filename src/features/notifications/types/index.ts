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
    // stage-change notifications
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
