import {
  Bell,
  BookOpen,
  Building2,
  ClipboardList,
  Clock3,
  Handshake,
  Users,
  Wallet,
} from "lucide-react";
import type { OverviewContext } from "./types";

export function overviewConfig(context: OverviewContext) {
  const base = `/${context.role.replace(/_/g, "-")}`;
  const action = (label: string, path: string, description: string) => ({
    label,
    href: `${base}${path}`,
    description,
  });
  switch (context.role) {
    case "admin":
      return {
        title: "Operations overview",
        subtitle: "Keep applications, advisor reviews and payouts moving.",
        metrics: ["active", "hold", "reviews", "commission"],
        panels: ["active", "reviews", "commission"],
        actions: [
          action(
            "Review applications",
            "/applications",
            "Manage application progress"
          ),
          action("Review advisors", "/advisors", "Verify advisor profiles"),
          action(
            "Finance queue",
            "/finance-queue",
            "Review outstanding payouts"
          ),
          action(
            "Manage institutions",
            "/universities",
            "Maintain university records"
          ),
        ],
      };
    case "account_manager":
      return {
        title: "Your work overview",
        subtitle:
          "Follow up on applications and support your assigned advisors.",
        metrics: ["active", "hold", "advisors", "unread"],
        panels: ["active", "advisors"],
        actions: [
          action(
            "Application tracker",
            "/applications",
            "Move your applications forward"
          ),
          action(
            "Your advisors",
            "/advisors",
            "Support assigned and shared advisors"
          ),
          action(
            "Explore programmes",
            "/knowledge-hub",
            "Find suitable study options"
          ),
        ],
      };
    case "reviewer":
      return {
        title: "Review overview",
        subtitle: "Review advisor profiles and monitor registration progress.",
        metrics: ["reviews", "registrations", "advisors", "managers"],
        panels: ["reviews", "registrations"],
        actions: [
          action(
            "Review advisors",
            "/advisors",
            "Check profiles and verification"
          ),
          action(
            "Pending registrations",
            "/advisors?tab=pending-otps",
            "Follow registration progress"
          ),
          action(
            "Account managers",
            "/account-managers",
            "View the manager directory"
          ),
        ],
      };
    case "data_entry":
      return {
        title: "Catalogue overview",
        subtitle: "Maintain accurate programmes and institution information.",
        metrics: ["programs", "hiddenPrograms", "institutions", "unread"],
        panels: ["hiddenPrograms", "programs"],
        actions: [
          action(
            "Create programme",
            "/knowledge-hub/create",
            "Add a new study option"
          ),
          action(
            "Add institution",
            "/universities/create",
            "Register a university"
          ),
          action(
            "Manage programmes",
            "/knowledge-hub",
            "Review and update catalogue entries"
          ),
          action(
            "University configuration",
            "/university-configuration",
            "Maintain types and required fields"
          ),
        ],
      };
    case "partner":
      return {
        title: "Your advisor overview",
        subtitle: "Stay on top of your students, applications and next steps.",
        metrics: [
          "active",
          "hold",
          "unread",
          ...(context.canViewCommission ? ["commission"] : []),
        ],
        panels: [
          "active",
          ...(context.canViewCommission ? ["commission"] : []),
        ],
        actions: [
          ...(context.canCreateApplication
            ? [
                action(
                  "Start application",
                  "/applications/apply-now",
                  "Apply for a student"
                ),
              ]
            : []),
          action(
            "Application tracker",
            "/applications",
            "Review progress and next steps"
          ),
          action(
            "Explore programmes",
            "/knowledge-hub",
            "Find the right course"
          ),
          ...(context.agencyAdmin
            ? [
                action(
                  "Manage your team",
                  "/team-members",
                  "Support your agency members"
                ),
              ]
            : []),
        ],
      };
  }
}
export const metricIcons = {
  active: ClipboardList,
  hold: Clock3,
  reviews: Handshake,
  commission: Wallet,
  advisors: Users,
  registrations: Users,
  managers: Users,
  programs: BookOpen,
  hiddenPrograms: BookOpen,
  institutions: Building2,
  unread: Bell,
};
export const metricLabels: Record<string, string> = {
  active: "Active applications",
  hold: "Applications on hold",
  reviews: "Advisors awaiting review",
  commission: "Awaiting payout",
  advisors: "Active advisors",
  registrations: "Pending registrations",
  managers: "Account managers",
  programs: "Visible programmes",
  hiddenPrograms: "Hidden programmes",
  institutions: "Institutions",
  unread: "Unread updates",
};

export const metricCaptions: Record<string, string> = {
  active: "Applications currently in progress",
  hold: "Paused applications to follow up",
  reviews: "Unverified advisor profiles",
  commission: "Commissions waiting on Unibexs",
  advisors: "Advisors available in your directory",
  registrations: "Registrations still in progress",
  managers: "Account manager directory",
  programs: "Available in the catalogue",
  hiddenPrograms: "Not visible to advisors",
  institutions: "Institutions in the catalogue",
  unread: "Notifications for your account",
};
