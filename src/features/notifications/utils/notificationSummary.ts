import type { Notification } from "../types";
import { getNotificationStageStatus, getSenderName } from "./notificationIcons";
import { unibexsVoice } from "lib/unibexsVoice";
import { relabelText } from "config/statusLabels";

/** One subject/event and one useful message, shared by the inbox and bell preview. */
export function getNotificationSummary(notification: Notification, { forAdvisor = false }: { forAdvisor?: boolean } = {}) {
  // Status and stage names read as everywhere else; Advisors also get the Unibexs voice.
  const say = (text: string) => (forAdvisor ? unibexsVoice(relabelText(text)) : relabelText(text));
  const subject = notification.data?.student_name || getSenderName(notification, { forAdvisor });
  const events: Record<string, string> = {
    new_application: "New application",
    application_message_received: "New message",
    correction_request_updated: "Documents requested",
    manager_file_reuploaded: "Document updated",
    partner_signed_up: "New advisor registration",
    application_stage_changed: getNotificationStageStatus(notification).status || "Application updated",
  };
  const event = events[notification.type];
  const heading = say(event ? `${subject} — ${event}` : notification.title || subject);
  const message = say((notification.type === "application_message_received" ? notification.data?.snippet : undefined) || notification.body || "");
  return { heading, message: message === heading ? "" : message };
}
