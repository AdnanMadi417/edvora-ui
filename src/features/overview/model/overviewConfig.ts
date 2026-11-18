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
        metrics: ["actionRequired", "stuck", "reviews", "disputes"],
        panels: ["actionRequired", "stuck", "reviews", "disputes", "commission", "amWorkload"],
        actions: [
          action(
            "Review applications",
            "/applications",
            "Manage application progress"
          ),
          action("Review advisors", "/advisors", "Verify advisor profiles"),
          action(
            "Record payouts",
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
        metrics: ["actionRequired", "waitingOnAdvisors", "hold", "advisorsAttention"],
        panels: ["actionRequired", "waitingOnAdvisors", "hold", "advisorsAttention"],
        actions: [
          action(
            "Review next application",
            "/applications",
            "Opens the oldest application waiting on you"
          ),
          action(
            "Application tracker",
            "/applications",
            "All your applications"
          ),
          action(
            "View your advisors",
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
        // The reviewer's work: profiles to verify and registrations to follow.
        metrics: ["reviews", "oldestWaiting", "registrations"],
        panels: ["reviews", "registrations"],
        actions: [
          action(
            "Review next advisor",
            "/advisors",
            "Check profiles and verification"
          ),
          action(
            "Follow up registrations",
            "/advisors?tab=pending-otps",
            "Follow registration progress"
          ),
          action(
            "View account managers",
            "/account-managers",
            "View the manager directory"
          ),
        ],
      };
    case "data_entry":
      return {
        title: "Catalogue overview",
        subtitle: "Maintain accurate program and university information.",
        // What needs doing in the catalogue, not inventory counts.
        metrics: ["catalogueQuality", "hiddenPrograms", "providerIssues", "intakesNotSet"],
        panels: ["catalogueQuality", "providerIssues", "intakesNotSet", "hiddenPrograms"],
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
            "Manage language centers",
            "/language-centers",
            "Maintain center information"
          ),
          action(
            "Manage programs",
            "/knowledge-hub",
            "Review and update catalogue entries"
          ),
          action(
            "Configure universities",
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
        metrics: ["actionRequired", "active", ...(context.canViewCommission ? ["expected"] : [])],
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
            "Track applications",
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
  suspended: Users,
  stuck: Clock3,
  disputes: Wallet,
  waitingOnAdvisors: Handshake,
  advisorsAttention: Users,
  oldestWaiting: Clock3,
  providerIssues: Building2,
  intakesNotSet: BookOpen,
  expected: Wallet,
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
  commission: "Payouts to record",
  suspended: "Suspended advisors",
  stuck: "Stuck applications",
  disputes: "Open disputes",
  waitingOnAdvisors: "Waiting on Advisors",
  advisorsAttention: "Advisors needing attention",
  oldestWaiting: "Oldest waiting",
  providerIssues: "Provider issues",
  intakesNotSet: "Intakes not set",
  expected: "Expected commission",
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
  suspended: "Accounts to follow up",
  stuck: "Past the stage's time limit",
  disputes: "Finance resolves them",
  waitingOnAdvisors: "Advisor has the next step",
  advisorsAttention: "Suspended or no applications",
  oldestWaiting: "Profile awaiting review",
  providerIssues: "Missing details",
  intakesNotSet: "No intake months",
  expected: "Before the commission stage",
  advisors: "In your directory",
  registrations: "Still in progress",
  managers: "In the directory",
  programs: "Visible to Advisors",
  hiddenPrograms: "Not visible to Advisors",
  institutions: "In the catalogue",
  unread: "For your account",
};
