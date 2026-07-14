import {
  MessageCircle,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FilePlus,
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
  type LucideIcon,
} from "lucide-react";

export type NotificationIconConfig = {
  icon: LucideIcon;
  bg: string;
  iconColor: string;
  badgeBg: string;
};

// Maps each status UUID → icon + color config
const STATUS_ICON_MAP: Record<string, NotificationIconConfig> = {
  // Under Review by Account Manager
  "45cd8c15-fd9d-4903-9b41-8f89472505f3": { icon: Eye,            bg: "bg-amber-100",   iconColor: "text-amber-600",   badgeBg: "bg-amber-500"   },
  // Correction Requested by Account Manager
  "aa736b82-fd54-4e9b-8388-df72a3479969": { icon: AlertTriangle,  bg: "bg-orange-100",  iconColor: "text-orange-600",  badgeBg: "bg-orange-500"  },
  // Approved
  "0a73a9cc-0c69-4d67-8ee7-ebc9358f53c9": { icon: CheckCircle,    bg: "bg-green-100",   iconColor: "text-green-600",   badgeBg: "bg-green-500"   },
  // Rejected
  "f0fee94c-b1af-44f9-a7f3-49dbbca52c0e": { icon: XCircle,        bg: "bg-red-100",     iconColor: "text-red-600",     badgeBg: "bg-red-500"     },
  // New Application
  "d4f9e0d7-503b-4d31-bf33-65c66fbdec12": { icon: FilePlus,       bg: "bg-blue-100",    iconColor: "text-blue-600",    badgeBg: "bg-blue-500"    },
  // Approved (from Stage 1)
  "9d0745e7-9628-447a-b890-d963498faaa5": { icon: CheckCircle,    bg: "bg-green-100",   iconColor: "text-green-600",   badgeBg: "bg-green-500"   },
  // Sent to University
  "3e917ca3-2808-442b-b6db-f249fd4265b7": { icon: Send,           bg: "bg-indigo-100",  iconColor: "text-indigo-600",  badgeBg: "bg-indigo-500"  },
  // University Requested Corrections
  "3253ef4c-725c-4b7b-af1a-f8acb70d10e9": { icon: AlertTriangle,  bg: "bg-orange-100",  iconColor: "text-orange-600",  badgeBg: "bg-orange-500"  },
  // Program Change Suggested
  "b4155f57-36df-478c-b912-fd2d116fdbcb": { icon: RefreshCw,      bg: "bg-purple-100",  iconColor: "text-purple-600",  badgeBg: "bg-purple-500"  },
  // Rejected by University
  "48da1543-fc1f-4d51-bc8f-e457bfeb4721": { icon: XCircle,        bg: "bg-red-100",     iconColor: "text-red-600",     badgeBg: "bg-red-500"     },
  // Offer Letter Issued (from Stage 2)
  "d17accbb-8b00-4dd4-a020-7a4b9a7774b1": { icon: FileText,       bg: "bg-teal-100",    iconColor: "text-teal-600",    badgeBg: "bg-teal-500"    },
  // University Approved
  "185931e6-4eac-45fa-a912-8eda2a145c86": { icon: BadgeCheck,     bg: "bg-green-100",   iconColor: "text-green-600",   badgeBg: "bg-green-500"   },
  // Visa Setup
  "3a701447-0a57-41a8-a9a4-319fafc9b9b6": { icon: Globe,          bg: "bg-blue-100",    iconColor: "text-blue-600",    badgeBg: "bg-blue-500"    },
  // Waiting for Payment
  "23723be3-697c-4d53-8234-42bc81562362": { icon: CreditCard,     bg: "bg-yellow-100",  iconColor: "text-yellow-600",  badgeBg: "bg-yellow-500"  },
  // Payment Submitted
  "bf7e2bff-e956-42d0-88a9-95f90c708a03": { icon: CreditCard,     bg: "bg-green-100",   iconColor: "text-green-600",   badgeBg: "bg-green-500"   },
  // Payment Rejected
  "c98f4e50-0c07-4eb6-8b37-bca62ad0eac6": { icon: CreditCard,     bg: "bg-red-100",     iconColor: "text-red-600",     badgeBg: "bg-red-500"     },
  // Submit application to EMGS
  "8b9d3f33-6e7e-4736-ac8c-a757554c6a24": { icon: Send,           bg: "bg-sky-100",     iconColor: "text-sky-600",     badgeBg: "bg-sky-500"     },
  // Immigration Requested Documents
  "ab04a9b8-d12a-42c1-a3b4-a4a55bc3640f": { icon: FolderOpen,     bg: "bg-orange-100",  iconColor: "text-orange-600",  badgeBg: "bg-orange-500"  },
  // Visa Issued
  "236251da-bcfe-495b-8234-2c8afdb7f3dc": { icon: CheckCircle,    bg: "bg-green-100",   iconColor: "text-green-600",   badgeBg: "bg-green-500"   },
  // Visa Rejected
  "1a0cc880-57c3-47ab-b800-e4687a9f01bd": { icon: XCircle,        bg: "bg-red-100",     iconColor: "text-red-600",     badgeBg: "bg-red-500"     },
  // Waiting Partner to confirm arrival date
  "9807527d-7e22-4589-9bf6-77beaee5d990": { icon: MapPin,         bg: "bg-yellow-100",  iconColor: "text-yellow-600",  badgeBg: "bg-yellow-500"  },
  // Awaiting Arrival
  "17b8e618-9aea-44ff-b95d-de00db8c2521": { icon: Plane,          bg: "bg-sky-100",     iconColor: "text-sky-600",     badgeBg: "bg-sky-500"     },
  // Arrival Confirmed
  "8af06784-6f0a-4dbe-b026-0d22065435d5": { icon: MapPin,         bg: "bg-green-100",   iconColor: "text-green-600",   badgeBg: "bg-green-500"   },
  // Enrollment Verified
  "61f15f9b-8193-400d-b96e-5f390d6f06f5": { icon: GraduationCap,  bg: "bg-green-100",   iconColor: "text-green-600",   badgeBg: "bg-green-500"   },
  // Enrollment Issue
  "55fd567b-3c68-4804-8d83-6a94b50fa3b9": { icon: GraduationCap,  bg: "bg-red-100",     iconColor: "text-red-600",     badgeBg: "bg-red-500"     },
  // Invoicing Started
  "926b2e4f-5b9a-47b2-b7cf-2a81ecd09f62": { icon: Receipt,        bg: "bg-blue-100",    iconColor: "text-blue-600",    badgeBg: "bg-blue-500"    },
  // Commission Ready
  "39f2a833-7905-4762-852f-43c0579cee9e": { icon: DollarSign,     bg: "bg-emerald-100", iconColor: "text-emerald-600", badgeBg: "bg-emerald-500" },
  // Invoice Issue
  "3ddcb426-9bfb-4a09-b363-c9cc43f1c42d": { icon: Receipt,        bg: "bg-red-100",     iconColor: "text-red-600",     badgeBg: "bg-red-500"     },
  // Issue Response Received
  "7578ab50-3882-4fc4-bd62-addac2cd467c": { icon: MessageCircle,  bg: "bg-blue-100",    iconColor: "text-blue-600",    badgeBg: "bg-blue-500"    },
  // Commission Paid
  "2abfcad2-7d98-42a6-8b57-ef25f16bae99": { icon: DollarSign,     bg: "bg-emerald-100", iconColor: "text-emerald-600", badgeBg: "bg-emerald-500" },
  // Commission Disputed
  "16df9f55-72d4-48c6-af48-e20b9df36f53": { icon: DollarSign,     bg: "bg-red-100",     iconColor: "text-red-600",     badgeBg: "bg-red-500"     },
  // Application Complete
  "e65b7472-e484-449d-95ea-8eec6e116a4c": { icon: Trophy,         bg: "bg-purple-100",  iconColor: "text-purple-600",  badgeBg: "bg-purple-500"  },
};

const FALLBACK: NotificationIconConfig = {
  icon: Info,
  bg: "bg-slate-100",
  iconColor: "text-slate-500",
  badgeBg: "bg-slate-400",
};

export function getNotificationIconConfig(notification: any): NotificationIconConfig {
  // Messages → always blue chat bubble
  if (notification.type === "application_message_received") {
    return { icon: MessageCircle, bg: "bg-blue-100", iconColor: "text-blue-600", badgeBg: "bg-blue-500" };
  }

  // New application submitted by a partner
  if (notification.type === "new_application") {
    return { icon: FilePlus, bg: "bg-blue-100", iconColor: "text-blue-600", badgeBg: "bg-blue-500" };
  }

  // Account manager re-uploaded a document on behalf of the partner
  if (notification.type === "manager_file_reuploaded") {
    return { icon: UploadCloud, bg: "bg-violet-100", iconColor: "text-violet-600", badgeBg: "bg-violet-500" };
  }

  // Stage changes → look up the destination status UUID
  if (notification.type === "application_stage_changed") {
    const statusId = notification.data?.to_status_id;
    return STATUS_ICON_MAP[statusId] ?? FALLBACK;
  }

  return FALLBACK;
}

export function getSenderName(notification: any): string {
  return (
    notification.data?.sender_name ||
    notification.data?.actor_name ||
    notification.data?.partner_name ||
    notification.data?.student_name ||
    "System"
  );
}
