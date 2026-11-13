import {
  MessageCircle,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FilePlus,
  FilePlus2,
  Send,
  RefreshCw,
  FileText,
  BadgeCheck,
  Globe,
  CreditCard,
  FolderOpen,
  MapPin,
  Plane,
  GraduationCap,
  Receipt,
  DollarSign,
  Trophy,
  Info,
  UploadCloud,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { Notification } from "../types";
import { advisorActorName } from "lib/unibexsVoice";

export type NotificationIconConfig = {
  icon: LucideIcon;
  bg: string;
  iconColor: string;
  badgeBg: string;
};

// Fallback for older notifications that carry only a status UUID; some of
// these statuses no longer exist in the backend.
const STATUS_ICON_MAP: Record<string, NotificationIconConfig> = {
  // Under Review by Account Manager
  "45cd8c15-fd9d-4903-9b41-8f89472505f3": { icon: Eye,            bg: "bg-ub-tone-warning-bg",   iconColor: "text-ub-tone-warning-text",   badgeBg: "bg-ub-tone-warning-dot"   },
  // Correction Requested by Account Manager
  "aa736b82-fd54-4e9b-8388-df72a3479969": { icon: AlertTriangle,  bg: "bg-ub-tone-attention-bg",  iconColor: "text-ub-tone-attention-text",  badgeBg: "bg-ub-tone-attention-dot"  },
  // Approved
  "0a73a9cc-0c69-4d67-8ee7-ebc9358f53c9": { icon: CheckCircle,    bg: "bg-ub-tone-success-bg",   iconColor: "text-ub-tone-success-text",   badgeBg: "bg-ub-tone-success-dot"   },
  // Rejected
  "f0fee94c-b1af-44f9-a7f3-49dbbca52c0e": { icon: XCircle,        bg: "bg-ub-tone-danger-bg",     iconColor: "text-ub-tone-danger-text",     badgeBg: "bg-ub-tone-danger-dot"     },
  // New Application
  "d4f9e0d7-503b-4d31-bf33-65c66fbdec12": { icon: FilePlus,       bg: "bg-ub-tone-brand-bg",    iconColor: "text-ub-tone-brand-text",    badgeBg: "bg-ub-tone-brand-dot"    },
  // Approved (from Stage 1)
  "9d0745e7-9628-447a-b890-d963498faaa5": { icon: CheckCircle,    bg: "bg-ub-tone-success-bg",   iconColor: "text-ub-tone-success-text",   badgeBg: "bg-ub-tone-success-dot"   },
  // Sent to University
  "3e917ca3-2808-442b-b6db-f249fd4265b7": { icon: Send,           bg: "bg-ub-tone-brand-bg",  iconColor: "text-ub-tone-brand-text",  badgeBg: "bg-ub-tone-brand-dot"  },
  // University Requested Corrections
  "3253ef4c-725c-4b7b-af1a-f8acb70d10e9": { icon: AlertTriangle,  bg: "bg-ub-tone-attention-bg",  iconColor: "text-ub-tone-attention-text",  badgeBg: "bg-ub-tone-attention-dot"  },
  // Program Change Suggested
  "b4155f57-36df-478c-b912-fd2d116fdbcb": { icon: RefreshCw,      bg: "bg-ub-tone-plum-bg",  iconColor: "text-ub-tone-plum-text",  badgeBg: "bg-ub-tone-plum-dot"  },
  // Rejected by University
  "48da1543-fc1f-4d51-bc8f-e457bfeb4721": { icon: XCircle,        bg: "bg-ub-tone-danger-bg",     iconColor: "text-ub-tone-danger-text",     badgeBg: "bg-ub-tone-danger-dot"     },
  // Offer Letter Issued (from Stage 2)
  "d17accbb-8b00-4dd4-a020-7a4b9a7774b1": { icon: FileText,       bg: "bg-ub-tone-teal-bg",    iconColor: "text-ub-tone-teal-text",    badgeBg: "bg-ub-tone-teal-dot"    },
  // University Approved
  "185931e6-4eac-45fa-a912-8eda2a145c86": { icon: BadgeCheck,     bg: "bg-ub-tone-success-bg",   iconColor: "text-ub-tone-success-text",   badgeBg: "bg-ub-tone-success-dot"   },
  // Visa Setup
  "3a701447-0a57-41a8-a9a4-319fafc9b9b6": { icon: Globe,          bg: "bg-ub-tone-brand-bg",    iconColor: "text-ub-tone-brand-text",    badgeBg: "bg-ub-tone-brand-dot"    },
  // Waiting for Payment
  "23723be3-697c-4d53-8234-42bc81562362": { icon: CreditCard,     bg: "bg-ub-tone-warning-bg",  iconColor: "text-ub-tone-warning-text",  badgeBg: "bg-ub-tone-warning-dot"  },
  // Payment Submitted
  "bf7e2bff-e956-42d0-88a9-95f90c708a03": { icon: CreditCard,     bg: "bg-ub-tone-success-bg",   iconColor: "text-ub-tone-success-text",   badgeBg: "bg-ub-tone-success-dot"   },
  // Payment Rejected
  "c98f4e50-0c07-4eb6-8b37-bca62ad0eac6": { icon: CreditCard,     bg: "bg-ub-tone-danger-bg",     iconColor: "text-ub-tone-danger-text",     badgeBg: "bg-ub-tone-danger-dot"     },
  // Submit application to EMGS
  "8b9d3f33-6e7e-4736-ac8c-a757554c6a24": { icon: Send,           bg: "bg-ub-tone-sky-bg",     iconColor: "text-ub-tone-sky-text",     badgeBg: "bg-ub-tone-sky-dot"     },
  // Immigration Requested Documents
  "ab04a9b8-d12a-42c1-a3b4-a4a55bc3640f": { icon: FolderOpen,     bg: "bg-ub-tone-attention-bg",  iconColor: "text-ub-tone-attention-text",  badgeBg: "bg-ub-tone-attention-dot"  },
  // Visa Issued
  "236251da-bcfe-495b-8234-2c8afdb7f3dc": { icon: CheckCircle,    bg: "bg-ub-tone-success-bg",   iconColor: "text-ub-tone-success-text",   badgeBg: "bg-ub-tone-success-dot"   },
  // Visa Rejected
  "1a0cc880-57c3-47ab-b800-e4687a9f01bd": { icon: XCircle,        bg: "bg-ub-tone-danger-bg",     iconColor: "text-ub-tone-danger-text",     badgeBg: "bg-ub-tone-danger-dot"     },
  // Waiting Partner to confirm arrival date
  "9807527d-7e22-4589-9bf6-77beaee5d990": { icon: MapPin,         bg: "bg-ub-tone-warning-bg",  iconColor: "text-ub-tone-warning-text",  badgeBg: "bg-ub-tone-warning-dot"  },
  // Awaiting Arrival
  "17b8e618-9aea-44ff-b95d-de00db8c2521": { icon: Plane,          bg: "bg-ub-tone-sky-bg",     iconColor: "text-ub-tone-sky-text",     badgeBg: "bg-ub-tone-sky-dot"     },
  // Arrival Confirmed
  "8af06784-6f0a-4dbe-b026-0d22065435d5": { icon: MapPin,         bg: "bg-ub-tone-success-bg",   iconColor: "text-ub-tone-success-text",   badgeBg: "bg-ub-tone-success-dot"   },
  // Enrollment Verified
  "61f15f9b-8193-400d-b96e-5f390d6f06f5": { icon: GraduationCap,  bg: "bg-ub-tone-success-bg",   iconColor: "text-ub-tone-success-text",   badgeBg: "bg-ub-tone-success-dot"   },
  // Enrollment Issue
  "55fd567b-3c68-4804-8d83-6a94b50fa3b9": { icon: GraduationCap,  bg: "bg-ub-tone-danger-bg",     iconColor: "text-ub-tone-danger-text",     badgeBg: "bg-ub-tone-danger-dot"     },
  // Invoicing Started
  "926b2e4f-5b9a-47b2-b7cf-2a81ecd09f62": { icon: Receipt,        bg: "bg-ub-tone-brand-bg",    iconColor: "text-ub-tone-brand-text",    badgeBg: "bg-ub-tone-brand-dot"    },
  // Commission Ready
  "39f2a833-7905-4762-852f-43c0579cee9e": { icon: DollarSign,     bg: "bg-ub-tone-success-bg", iconColor: "text-ub-tone-success-text", badgeBg: "bg-ub-tone-success-dot" },
  // Invoice Issue
  "3ddcb426-9bfb-4a09-b363-c9cc43f1c42d": { icon: Receipt,        bg: "bg-ub-tone-danger-bg",     iconColor: "text-ub-tone-danger-text",     badgeBg: "bg-ub-tone-danger-dot"     },
  // Issue Response Received
  "7578ab50-3882-4fc4-bd62-addac2cd467c": { icon: MessageCircle,  bg: "bg-ub-tone-brand-bg",    iconColor: "text-ub-tone-brand-text",    badgeBg: "bg-ub-tone-brand-dot"    },
  // Commission Paid
  "2abfcad2-7d98-42a6-8b57-ef25f16bae99": { icon: DollarSign,     bg: "bg-ub-tone-success-bg", iconColor: "text-ub-tone-success-text", badgeBg: "bg-ub-tone-success-dot" },
  // Commission Disputed
  "16df9f55-72d4-48c6-af48-e20b9df36f53": { icon: DollarSign,     bg: "bg-ub-tone-danger-bg",     iconColor: "text-ub-tone-danger-text",     badgeBg: "bg-ub-tone-danger-dot"     },
  // Application Complete
  "e65b7472-e484-449d-95ea-8eec6e116a4c": { icon: Trophy,         bg: "bg-ub-tone-plum-bg",  iconColor: "text-ub-tone-plum-text",  badgeBg: "bg-ub-tone-plum-dot"  },
};

// Icon by the destination status code, which every status-change notification
// carries. Specific codes first, then patterns that cover the rest of the
// backend workflow (config/workflow.generated.ts).
const STATUS_CODE_ICONS: Record<string, NotificationIconConfig> = {
  NEW: { icon: FilePlus, bg: "bg-ub-tone-brand-bg", iconColor: "text-ub-tone-brand-text", badgeBg: "bg-ub-tone-brand-dot" },
  PROGRAM_CHANGE_SUGGESTED: { icon: RefreshCw, bg: "bg-ub-tone-plum-bg", iconColor: "text-ub-tone-plum-text", badgeBg: "bg-ub-tone-plum-dot" },
  WAITING_FOR_PAYMENT: { icon: CreditCard, bg: "bg-ub-tone-warning-bg", iconColor: "text-ub-tone-warning-text", badgeBg: "bg-ub-tone-warning-dot" },
  WAITING_PARTNER_CONFIRM_ARRIVAL_DATE: { icon: Plane, bg: "bg-ub-tone-sky-bg", iconColor: "text-ub-tone-sky-text", badgeBg: "bg-ub-tone-sky-dot" },
  AWAITING_ARRIVAL: { icon: Plane, bg: "bg-ub-tone-sky-bg", iconColor: "text-ub-tone-sky-text", badgeBg: "bg-ub-tone-sky-dot" },
  E_VISA_REQUIRED: { icon: Globe, bg: "bg-ub-tone-sky-bg", iconColor: "text-ub-tone-sky-text", badgeBg: "bg-ub-tone-sky-dot" },
  AWAITING_COMMISSION: { icon: Receipt, bg: "bg-ub-tone-brand-bg", iconColor: "text-ub-tone-brand-text", badgeBg: "bg-ub-tone-brand-dot" },
  COMMISSION_READY: { icon: DollarSign, bg: "bg-ub-tone-success-bg", iconColor: "text-ub-tone-success-text", badgeBg: "bg-ub-tone-success-dot" },
  COMMISSION_PAID: { icon: DollarSign, bg: "bg-ub-tone-success-bg", iconColor: "text-ub-tone-success-text", badgeBg: "bg-ub-tone-success-dot" },
  DISPUTE_RESPONSE_RECEIVED: { icon: MessageCircle, bg: "bg-ub-tone-brand-bg", iconColor: "text-ub-tone-brand-text", badgeBg: "bg-ub-tone-brand-dot" },
  APPLICATION_COMPLETE: { icon: Trophy, bg: "bg-ub-tone-plum-bg", iconColor: "text-ub-tone-plum-text", badgeBg: "bg-ub-tone-plum-dot" },
};
const STATUS_CODE_PATTERNS: [RegExp, NotificationIconConfig][] = [
  [/REJECTED/, { icon: XCircle, bg: "bg-ub-tone-danger-bg", iconColor: "text-ub-tone-danger-text", badgeBg: "bg-ub-tone-danger-dot" }],
  [/CORRECTION|REUPLOAD|REQUIRED|REQUESTED|ISSUE/, { icon: AlertTriangle, bg: "bg-ub-tone-attention-bg", iconColor: "text-ub-tone-attention-text", badgeBg: "bg-ub-tone-attention-dot" }],
  [/UNDER_REVIEW/, { icon: Eye, bg: "bg-ub-tone-warning-bg", iconColor: "text-ub-tone-warning-text", badgeBg: "bg-ub-tone-warning-dot" }],
  [/APPROVED|VERIFIED|CONFIRMED|READY/, { icon: CheckCircle, bg: "bg-ub-tone-success-bg", iconColor: "text-ub-tone-success-text", badgeBg: "bg-ub-tone-success-dot" }],
  [/SENT|SUBMIT/, { icon: Send, bg: "bg-ub-tone-brand-bg", iconColor: "text-ub-tone-brand-text", badgeBg: "bg-ub-tone-brand-dot" }],
  [/UPLOAD/, { icon: UploadCloud, bg: "bg-ub-tone-brand-bg", iconColor: "text-ub-tone-brand-text", badgeBg: "bg-ub-tone-brand-dot" }],
];

function iconForStatusCode(code: string | undefined): NotificationIconConfig | undefined {
  if (!code) return undefined;
  return STATUS_CODE_ICONS[code] ?? STATUS_CODE_PATTERNS.find(([pattern]) => pattern.test(code))?.[1];
}

const FALLBACK: NotificationIconConfig = {
  icon: Info,
  bg: "bg-ub-tone-neutral-bg",
  iconColor: "text-ub-tone-neutral-text",
  badgeBg: "bg-ub-tone-neutral-dot",
};

export function getNotificationIconConfig(notification: Notification): NotificationIconConfig {
  // Messages → always blue chat bubble
  if (notification.type === "application_message_received") {
    return { icon: MessageCircle, bg: "bg-ub-tone-brand-bg", iconColor: "text-ub-tone-brand-text", badgeBg: "bg-ub-tone-brand-dot" };
  }

  // New application submitted by a partner
  if (notification.type === "new_application") {
    return { icon: FilePlus, bg: "bg-ub-tone-brand-bg", iconColor: "text-ub-tone-brand-text", badgeBg: "bg-ub-tone-brand-dot" };
  }

  // Account manager re-uploaded a document on behalf of the partner
  if (notification.type === "manager_file_reuploaded") {
    return { icon: UploadCloud, bg: "bg-ub-tone-plum-bg", iconColor: "text-ub-tone-plum-text", badgeBg: "bg-ub-tone-plum-dot" };
  }

  // A manager added more required documents to an open correction request
  if (notification.type === "correction_request_updated") {
    return { icon: FilePlus2, bg: "bg-ub-tone-attention-bg", iconColor: "text-ub-tone-attention-text", badgeBg: "bg-ub-tone-attention-dot" };
  }

  // Stage changes → the destination status code, then the old UUID table
  if (notification.type === "application_stage_changed") {
    const byCode = iconForStatusCode(notification.data?.to_status_code as string | undefined);
    if (byCode) return byCode;
    const statusId = notification.data?.to_status_id;
    return (statusId && STATUS_ICON_MAP[statusId]) || FALLBACK;
  }

  // A partner (individual or agency) just signed up
  if (notification.type === "partner_signed_up") {
    return { icon: UserPlus, bg: "bg-ub-tone-brand-bg", iconColor: "text-ub-tone-brand-text", badgeBg: "bg-ub-tone-brand-dot" };
  }

  return FALLBACK;
}

/** Who the notification is from. Advisors see every staff sender as Unibexs. */
export function getSenderName(notification: Notification, { forAdvisor = false }: { forAdvisor?: boolean } = {}): string {
  const data = notification.data as Record<string, unknown>;
  const staffSide = (data?.sender_name as string) || (data?.actor_name as string);
  if (forAdvisor && staffSide) return advisorActorName(staffSide, data?.actor_role as string | undefined);
  return (
    (data?.sender_name as string) ||
    (data?.actor_name as string) ||
    (data?.partner_name as string) ||
    (data?.student_name as string) ||
    "System"
  );
}

/**
 * The storage key for the photo/logo to show as the notification's avatar,
 * if any. The API also sends a `*_url` sibling field claimed to be
 * "ready-to-use" — checked against a real payload and that isn't true: it's
 * a bare bucket URL with no signature, and 403s directly. The `*_key` is
 * what actually works, resolved the same way as every other photo in this
 * app (NotificationAvatar → getDocumentDownloadUrl). Returns null when the
 * notification type carries no such image, or nothing's been uploaded yet.
 */
export function getNotificationPhotoKey(notification: Notification): string | null {
  const data = notification.data as Record<string, unknown>;
  if (notification.type === "partner_signed_up") {
    return (data?.partner_photo_key as string) || (data?.agency_logo_key as string) || null;
  }
  // application_stage_changed / new_application both carry the student's photo
  return (data?.student_photo_key as string) || null;
}

/** The "Stage" / "Status" display-label pair for a notification, if it has
 *  one — application_stage_changed and new_application each carry these
 *  under different field names for the same concept (current stage/status). */
export function getNotificationStageStatus(
  notification: Notification
): { stage?: string; status?: string } {
  const data = notification.data as Record<string, unknown>;
  if (notification.type === "application_stage_changed") {
    return { stage: data?.to_stage_name as string, status: data?.to_status_name as string };
  }
  if (notification.type === "new_application") {
    return { stage: data?.stage_name as string, status: data?.status_name as string };
  }
  return {};
}
