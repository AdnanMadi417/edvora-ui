import { getNotificationSummary } from "./notificationSummary";
import type { Notification } from "../types";

const notification: Notification = {
  id: "notification-1", type: "new_application", title: "submitted a new application",
  body: "Review the documents and assign it for checking.", application_id: "app-1",
  created_at: "2026-11-01T00:00:00Z", read_at: null,
  data: { student_name: "Ruqayyah Zhang", university_name: "Limkokwing University", actor_name: "Fatima Yusuf", actor_role: "partner", stage_name: "Application Review", status_name: "New Application" },
};

it("summarizes the subject and action without university or actor metadata", () => {
  expect(getNotificationSummary(notification)).toEqual({
    heading: "Ruqayyah Zhang — New application",
    message: "Review the documents and assign it for checking.",
  });
});

it("keeps a status change meaningful and uses the advisor voice", () => {
  expect(getNotificationSummary({ ...notification, type: "application_stage_changed", body: "Review Account Manager feedback.", data: { ...notification.data, to_status_name: "Under Review by Account Manager" } }, { forAdvisor: true })).toEqual({
    heading: "Ruqayyah Zhang — Under Review by Unibexs",
    message: "Review Unibexs feedback.",
  });
});

it("retains message previews and unknown notification content", () => {
  expect(getNotificationSummary({ ...notification, type: "application_message_received", data: { ...notification.data, snippet: "Please send the updated passport." } }).message).toBe("Please send the updated passport.");
  expect(getNotificationSummary({ ...notification, type: "unknown_event", title: "Scheduled maintenance" }).heading).toBe("Scheduled maintenance");
});
