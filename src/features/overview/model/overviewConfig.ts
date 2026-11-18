import {
  Bell,
  BookOpen,
  Building2,
  ClipboardList,
  Clock3,
  Handshake,
  Plus,
  Search,
  Settings,
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
    icon: /create|apply-now/.test(path)
      ? Plus
      : /knowledge-hub$/.test(path)
      ? Search
      : /universit/.test(path)
      ? Building2
      : /advisors|team|account-managers/.test(path)
      ? Users
      : /finance|commission/.test(path)
      ? Wallet
      : /configuration/.test(path)
      ? Settings
      : ClipboardList,
  });
  switch (context.role) {
    case "admin":
      return {
        title: "Operations overview",
        subtitle: "Keep applications, advisor reviews and payouts moving.",
        // Active and payouts live in the pipeline and commission cards; KPIs carry only numbers shown nowhere else.
        metrics: ["actionRequired", "reviews", "hold", "unread"],
        panels: ["actionRequired", "reviews", "commission"],
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
            "Manage universities",
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
        metrics: ["actionRequired", "advisors", "hold", "unread"],
        panels: ["actionRequired", "hold", "advisors"],
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
            "Explore programs",
            "/knowledge-hub",
            "Find suitable study options"
          ),
        ],
      };
    case "reviewer":
      return {
        title: "Review overview",
        subtitle: "Review advisor profiles and monitor registration progress.",
        // Verified and awaiting review are in the verification gauge.
        metrics: ["registrations", "managers", "unread"],
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
        subtitle: "Maintain accurate program and university information.",
        // Records to complete is in the catalogue completeness gauge.
        metrics: ["programs", "institutions", "languageCenters"],
        panels: ["catalogueQuality", "hiddenPrograms", "languageCenters"],
        actions: [
          action(
            "Create program",
            "/knowledge-hub/create",
            "Add a new study option"
          ),
          action(
            "Add university",
            "/universities/create",
            "Register a university"
          ),
          action(
            "Language centers",
            "/language-centers",
            "Maintain center information"
          ),
          action(
            "Manage programs",
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
        // Active, offer and payout figures are in the pipeline and commission cards.
        metrics: ["actionRequired", "hold", "unread"],
        panels: ["actionRequired", "hold"],
        actions: [
          ...(context.canCreateApplication
            ? [
                action(
                  "New application",
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
            "Explore programs",
            "/knowledge-hub",
            "Find the right course"
          ),
          action(
            "Explore language centers",
            "/language-centers",
            "Find university language pathways"
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
  offers: ClipboardList,
  actionRequired: ClipboardList,
  catalogueQuality: BookOpen,
  languageCenters: Building2,
  verified: Handshake,
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
  offers: "In offer stage",
  actionRequired: "Action needed",
  catalogueQuality: "Records to complete",
  languageCenters: "Language centers",
  verified: "Verified advisors",
  active: "Active applications",
  hold: "On hold",
  reviews: "Advisors awaiting review",
  commission: "Awaiting payout",
  advisors: "Active advisors",
  registrations: "Pending registrations",
  managers: "Account managers",
  programs: "Visible programs",
  hiddenPrograms: "Hidden programs",
  institutions: "Universities",
  unread: "Unread updates",
};

/** The KPI tile's footer line: a few words on what the number counts (it truncates on narrow tiles). */
export const metricCaptions: Record<string, string> = {
  offers: "In the offer stage",
  actionRequired: "Waiting for you",
  catalogueQuality: "Missing required info",
  languageCenters: "In the catalogue",
  verified: "Completed verification",
  active: "In progress now",
  hold: "Paused, to follow up",
  reviews: "Profiles to verify",
  commission: "Ready for payout",
  advisors: "In your directory",
  registrations: "Still in progress",
  managers: "In the directory",
  programs: "Visible to Advisors",
  hiddenPrograms: "Not visible to Advisors",
  institutions: "In the catalogue",
  unread: "For your account",
};
