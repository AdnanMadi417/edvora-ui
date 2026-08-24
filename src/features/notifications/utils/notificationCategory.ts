import type { Notification } from "../types";

export type NotificationCategory = "action_required" | "info";

// Maps each application-stage status UUID → whether it needs the recipient
// to do something, or is purely informational. Mirrors the UUIDs in
// notificationIcons.ts's STATUS_ICON_MAP.
const STATUS_CATEGORY_MAP: Record<string, NotificationCategory> = {
  "45cd8c15-fd9d-4903-9b41-8f89472505f3": "info",            // Under Review by Account Manager
  "aa736b82-fd54-4e9b-8388-df72a3479969": "action_required", // Correction Requested by Account Manager
  "0a73a9cc-0c69-4d67-8ee7-ebc9358f53c9": "info",            // Approved
  "f0fee94c-b1af-44f9-a7f3-49dbbca52c0e": "action_required", // Rejected
  "d4f9e0d7-503b-4d31-bf33-65c66fbdec12": "action_required", // New Application
  "9d0745e7-9628-447a-b890-d963498faaa5": "info",            // Approved (from Stage 1)
  "3e917ca3-2808-442b-b6db-f249fd4265b7": "info",            // Sent to University
  "3253ef4c-725c-4b7b-af1a-f8acb70d10e9": "action_required", // University Requested Corrections
  "b4155f57-36df-478c-b912-fd2d116fdbcb": "action_required", // Program Change Suggested
  "48da1543-fc1f-4d51-bc8f-e457bfeb4721": "action_required", // Rejected by University
  "d17accbb-8b00-4dd4-a020-7a4b9a7774b1": "info",            // Offer Letter Issued
  "185931e6-4eac-45fa-a912-8eda2a145c86": "info",            // University Approved
  "3a701447-0a57-41a8-a9a4-319fafc9b9b6": "info",            // Visa Setup
  "23723be3-697c-4d53-8234-42bc81562362": "action_required", // Waiting for Payment
  "bf7e2bff-e956-42d0-88a9-95f90c708a03": "info",            // Payment Submitted
  "c98f4e50-0c07-4eb6-8b37-bca62ad0eac6": "action_required", // Payment Rejected
  "8b9d3f33-6e7e-4736-ac8c-a757554c6a24": "info",            // Submit application to EMGS
  "ab04a9b8-d12a-42c1-a3b4-a4a55bc3640f": "action_required", // Immigration Requested Documents
  "236251da-bcfe-495b-8234-2c8afdb7f3dc": "info",            // Visa Issued
  "1a0cc880-57c3-47ab-b800-e4687a9f01bd": "action_required", // Visa Rejected
  "9807527d-7e22-4589-9bf6-77beaee5d990": "action_required", // Waiting Partner to confirm arrival date
  "17b8e618-9aea-44ff-b95d-de00db8c2521": "info",            // Awaiting Arrival
  "8af06784-6f0a-4dbe-b026-0d22065435d5": "info",            // Arrival Confirmed
  "61f15f9b-8193-400d-b96e-5f390d6f06f5": "info",            // Enrollment Verified
  "55fd567b-3c68-4804-8d83-6a94b50fa3b9": "action_required", // Enrollment Issue
  "926b2e4f-5b9a-47b2-b7cf-2a81ecd09f62": "info",            // Invoicing Started
  "39f2a833-7905-4762-852f-43c0579cee9e": "info",            // Commission Ready
  "3ddcb426-9bfb-4a09-b363-c9cc43f1c42d": "action_required", // Invoice Issue
  "7578ab50-3882-4fc4-bd62-addac2cd467c": "info",            // Issue Response Received
  "2abfcad2-7d98-42a6-8b57-ef25f16bae99": "info",            // Commission Paid
  "16df9f55-72d4-48c6-af48-e20b9df36f53": "action_required", // Commission Disputed
  "e65b7472-e484-449d-95ea-8eec6e116a4c": "info",            // Application Complete
};

// Unrecognized statuses default to action_required so nothing actionable is
// silently buried under "System Info" while this map is out of date.
const FALLBACK: NotificationCategory = "action_required";

export function getNotificationCategory(notification: Notification): NotificationCategory {
  if (notification.type === "application_message_received") return "action_required";
  if (notification.type === "new_application") return "action_required";
  if (notification.type === "manager_file_reuploaded") return "info";

  if (notification.type === "application_stage_changed") {
    const statusId = notification.data?.to_status_id as string | undefined;
    return (statusId && STATUS_CATEGORY_MAP[statusId]) || FALLBACK;
  }

  return FALLBACK;
}
