import { createDashboardPlans } from "./dashboardPlans";
import { getApiStageTagId } from "config/applicationStages";
import Cookies from "js-cookie";
import { isAdvisorAction } from "features/applications/stages";
import { unibexsVoice } from "lib/unibexsVoice";
import { relabelText, stageLabel, statusLabel, nextActionLabel } from "config/statusLabels";
import api from "lib/useApi";
import { partnersApi } from "features/partners/services";
import { byOldest, daysSince } from "../model/dashboardData";
import { getSenderName } from "features/notifications/utils/notificationIcons";
import { accountManagersApi } from "features/account-managers/services/accountManagersApi";
import { programApi } from "features/programs/services/programApi";
import { universityApi } from "features/universities/services/universityApi";
import { notificationsApi } from "features/notifications/services/notificationsApi";
import { commissionsApi } from "features/applications/payouts/services/commissionsApi";
import { statementApi } from "features/partners/statement/services/statementApi";
import type {
  OverviewContext,
  OverviewData,
  OverviewItem,
  ResourcePlan,
} from "../model/types";

const STAFF_ACTIONS = new Set([
  "new_application",
  "payment_submitted",
  "eval_under_review",
  "e-visa_under_review",
  "visa_documents_under_review",
  "arrival_confirmed",
  "extra_arrival_documents_under_review",
  "issue_response_received",
  "commission_disputed",
]);
const normalize = (value: string = "") =>
  value.toLowerCase().trim().replace(/\s+/g, "_");
const idPath = (base: string, id: string) =>
  `${base}/${encodeURIComponent(id)}`;

/** Totals come from the API, never from a partial page's length. Arrays represent unpaginated APIs. */
export function collection(response: unknown): { total: number; items: any[] } {
  if (Array.isArray(response))
    return { total: response.length, items: response };
  const data = response as { total?: number; items?: unknown[] };
  if (
    !data ||
    !Array.isArray(data.items) ||
    typeof data.total !== "number" ||
    !Number.isFinite(data.total) ||
    data.total < 0
  )
    throw new Error("The server returned an incomplete overview. Try again.");
  return { total: data.total, items: data.items };
}

const auth = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** "OTP pending" / "otp expired" → "Verification code pending" / "Verification code expired"; anything else sentence case. */
function sentenceCase(text: string): string {
  const t = text.trim().replace(/\botp\b/gi, "verification code");
  return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : t;
}

export function createOverviewPlan(context: OverviewContext): ResourcePlan[] {
  const { role, partnerId, agencyAdmin, canViewCommission } = context;
  // Advisors hear one voice: backend copy that names a staff role reads as Unibexs.
  const say = (text: string) => (role === "partner" ? unibexsVoice(relabelText(text)) : relabelText(text));
  if (
    !["admin", "account_manager", "reviewer", "data_entry", "partner"].includes(
      role
    ) ||
    (role === "partner" && !partnerId)
  )
    return [];
  const base =
    role === "account_manager"
      ? "/account-manager"
      : role === "data_entry"
      ? "/data-entry"
      : `/${role}`;
  const plans: ResourcePlan[] = [];
  const add = (plan: ResourcePlan) => plans.push(plan);
  if (
    role === "admin" ||
    role === "account_manager" ||
    (role === "partner" && partnerId)
  ) {
    const endpoint =
      role === "admin"
        ? "/admin/applications"
        : role === "account_manager"
        ? "/account-managers/applications"
        : `/partners/${encodeURIComponent(partnerId!)}/applications`;
    for (const status of ["active", "hold"] as const) {
      add({
        id: status,
        title:
          status === "active"
            ? "Application work queue"
            : "Applications on hold",
        subtitle:
          status === "active"
            ? "Actionable items from the first 20 active applications. Open the tracker for the full queue."
            : "Follow up on paused applications with your team.",
        href: `${base}/applications`,
        emptyMessage:
          status === "active"
            ? "No actions in the current application page. Check the tracker for your complete list."
            : "No applications are currently on hold.",
        load: async () => {
          const response = await api.get(endpoint, {
            headers: auth(),
            params: {
              status,
              limit: status === "active" ? 20 : 1,
              offset: 0,
              ...(role === "partner" && agencyAdmin
                ? { include_members: true }
                : {}),
            },
          });
          const data = collection(response.data);
          const needsAction = (status: string) =>
            role === "partner" ? isAdvisorAction(status) : STAFF_ACTIONS.has(normalize(status));
          const items = data.items
            .filter(
              (item) =>
                status !== "active" ||
                (needsAction(item.status) &&
                  (role !== "partner" ||
                    canViewCommission ||
                    normalize(item.status) !== "commission_ready"))
            )
            .map(
              (item): OverviewItem => ({
                id: item.id,
                title: item.student_name || "Student",
                description: item.university_name || "",
                avatar: { name: item.student_name || "Student", src: item.student_photo_file_url },
                waitingDays: daysSince(item.updated_at),
                actionLabel: status === "hold" ? "Open application" : nextActionLabel(item.status),
                href: idPath(`${base}/applications`, item.id),
                // A held application says it's on hold (the reason isn't in the list response),
                // not the workflow status it was paused at.
                status: status === "hold" ? "On hold" : item.status,
                statusLabel:
                  status === "hold"
                    ? "On hold"
                    : item.status
                    ? say(statusLabel(item.status))
                    : undefined,
              })
            )
            .sort(byOldest)
            .slice(0, 6);
          return { total: data.total, items };
        },
      });
    }
  }
  if (
    role === "admin" ||
    role === "account_manager" ||
    (role === "partner" && partnerId)
  ) {
    const endpoint =
      role === "admin"
        ? "/admin/applications"
        : role === "account_manager"
        ? "/account-managers/applications"
        : `/partners/${encodeURIComponent(partnerId!)}/applications`;
    add({
      id: "pipeline",
      title: "Application pipeline",
      subtitle: "All active applications, grouped by their current stage.",
      href: `${base}/applications`,
      emptyMessage: "No active applications in your pipeline yet.",
      load: async () => {
        const response = await api.get("/applications/stages", {
          headers: auth(),
        });
        const stages = Array.isArray(response.data)
          ? response.data
          : collection(response.data).items;
        if (
          stages.some(
            (stage) =>
              typeof stage.id !== "string" || typeof stage.name !== "string"
          )
        )
          throw new Error("Invalid application stages");
        const distribution = await Promise.all(
          [...stages]
            .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
            .map(async (stage) => {
              const result = await api.get(endpoint, {
                headers: auth(),
                params: {
                  status: "active",
                  stage_id: stage.id,
                  limit: 1,
                  offset: 0,
                  ...(role === "partner" && agencyAdmin
                    ? { include_members: true }
                    : {}),
                },
              });
              return {
                key: stage.id,
                label: stageLabel(stage.name),
                value: collection(result.data).total,
                stageId: getApiStageTagId(stage),
              };
            })
        );
        return {
          total: distribution.reduce((sum, stage) => sum + stage.value, 0),
          items: [],
          distribution,
        };
      },
    });
  }
  if (role === "admin" || role === "reviewer") {
    add({
      id: "reviews",
      title: "Advisors awaiting review",
      subtitle:
        "Unverified advisor profiles. Open a profile to review its details.",
      href: `${base}/advisors`,
      emptyMessage: "No advisor profiles are awaiting review.",
      load: async () => {
        const response = await partnersApi.list({
          is_verified: false,
          page: 1,
          page_size: 6,
        });
        const data = collection(response.data);
        // The same response carries counts over every advisor: the home's advisor rings.
        const stats = (response.data as { stats?: Record<string, number> })?.stats;
        return {
          total: data.total,
          advisorStats: stats
            ? {
                active: stats.active ?? 0,
                inactive: stats.inactive ?? 0,
                agency: stats.agency ?? 0,
                individual: stats.individual ?? 0,
                verified: stats.verified ?? 0,
                unverified: stats.unverified ?? 0,
              }
            : undefined,
          items: data.items.map((item) => ({
            id: item.id,
            title: item.name,
            description: [
              // Same words as the Advisors list and its filters.
              item.type === "agency" ? "Company" : "Individual",
              item.country,
            ]
              .filter(Boolean)
              .join(" · "),
            href: idPath(`${base}/advisors`, item.id),
            at: item.created_at,
            avatar: { name: item.name },
            status: "unverified",
            statusLabel: "Awaiting review",
            waitingDays: daysSince(item.created_at),
            actionLabel: "Review profile",
          })).sort(byOldest),
        };
      },
    });
  }
  if (role === "reviewer") {
    add({
      id: "verified",
      title: "Verified advisors",
      subtitle: "Verified advisor profiles",
      href: `${base}/advisors`,
      emptyMessage: "No verified advisors yet.",
      load: async () => {
        const response = await partnersApi.list({
          is_verified: true,
          page: 1,
          page_size: 1,
        });
        return { total: collection(response.data).total, items: [] };
      },
    });
  }
  if (role === "reviewer") {
    add({
      id: "registrations",
      title: "Pending registrations",
      subtitle:
        "Registration progress before an advisor profile is ready for review.",
      href: `${base}/advisors?tab=pending-otps`,
      emptyMessage: "No pending registrations.",
      load: async () => {
        const response = await partnersApi.getPendingRegistrationOtps({
          page: 1,
          page_size: 6,
        });
        const data = collection(response.data);
        return {
          total: data.total,
          items: data.items.map((item) => ({
            id: item.email,
            title: item.full_name || item.company_name || item.email,
            // Sentence case, and "OTP" spelled out: "otp_pending" → "Verification code pending".
            description: sentenceCase(
              String(item.progress || "Registration in progress").replace(/_/g, " ")
            ),
            href: `${base}/advisors?tab=pending-otps`,
            at: item.created_at,
            avatar: { name: item.full_name || item.company_name || item.email },
            waitingDays: daysSince(item.created_at),
            actionLabel: "Follow up",
          })),
        };
      },
    });
    add({
      id: "advisors",
      title: "Active advisors",
      subtitle: "Advisor directory",
      href: `${base}/advisors`,
      emptyMessage: "No active advisors.",
      load: async () => {
        const response = await partnersApi.list({
          is_active: true,
          page: 1,
          page_size: 1,
        });
        return { total: collection(response.data).total, items: [] };
      },
    });
    add({
      id: "managers",
      title: "Account managers",
      subtitle: "Account manager directory",
      href: `${base}/account-managers`,
      emptyMessage: "No account managers.",
      load: async () => {
        const response = await accountManagersApi.list({
          page: 1,
          page_size: 1,
        });
        return { total: collection(response.data).total, items: [] };
      },
    });
  }
  if (role === "account_manager") {
    add({
      id: "advisors",
      title: "Your advisors",
      subtitle: "Advisors assigned or shared with you.",
      href: `${base}/advisors`,
      emptyMessage: "No advisors are assigned to you yet.",
      load: async () => {
        const response = await partnersApi.listForAccountManager({
          limit: 6,
          offset: 0,
        });
        const data = collection(response.data);
        return {
          total: data.total,
          items: data.items.map((item) => ({
            id: item.id,
            title: item.name,
            description: [
              item.country,
              item.is_shared ? "Shared advisor" : "Assigned advisor",
            ]
              .filter(Boolean)
              .join(" · "),
            href: idPath(`${base}/advisors`, item.id),
            avatar: { name: item.name },
            status: item.is_active === false ? "suspended" : "active",
            statusLabel: item.is_active === false ? "Suspended" : "Active",
            actionLabel: "Open advisor",
          })),
        };
      },
    });
  }
  if (role === "admin" || (role === "partner" && canViewCommission)) {
    add({
      id: "commission",
      title:
        role === "admin"
          ? "Payouts awaiting action"
          : "Commission awaiting payout",
      subtitle:
        "Commissions marked as waiting on Unibexs. Open the queue for amounts and payment details.",
      href:
        role === "admin"
          ? "/admin/finance-queue"
          : "/partner/commission-tracker",
      emptyMessage: "No commissions are waiting on payout.",
      load: async () => {
        const response =
          role === "admin"
            ? await commissionsApi.list({
                waiting_on: "us",
                page: 1,
                page_size: 6,
              })
            : await statementApi.list({
                waiting_on: "us",
                page: 1,
                page_size: 6,
              });
        const data = collection(response.data);
        return {
          total: data.total,
          items: data.items.map((item) => ({
            id: item.application_commission_id,
            title: item.student_name,
            // The amount, so the row agrees with the commission card in its own currency.
            description: [
              item.reference,
              item.university_name,
              typeof item.commission_amount === "number"
                ? `${item.commission_currency ?? ""} ${item.commission_amount.toLocaleString("en-MY")}`.trim()
                : null,
            ]
              .filter(Boolean)
              .join(" · "),
            href:
              role === "admin"
                ? "/admin/finance-queue"
                : "/partner/commission-tracker",
            avatar: { name: item.student_name },
            waitingDays: typeof item.days_waiting === "number" ? item.days_waiting : daysSince(item.since_date),
            actionLabel: role === "admin" ? "Record payout" : "Open commission",
          })),
        };
      },
    });
  }
  if (role === "data_entry") {
    for (const hidden of [false, true])
      add({
        id: hidden ? "hiddenPrograms" : "programs",
        title: hidden ? "Hidden programs" : "Visible programs",
        subtitle: hidden
          ? "Review catalogue entries that are hidden from advisors."
          : "Programs currently available in the catalogue.",
        // "View all" opens the catalogue already filtered to hidden or visible programs.
        href: `${base}/knowledge-hub?is_hidden=${hidden}`,
        emptyMessage: hidden
          ? "No programs are hidden from advisors."
          : "No visible programs yet.",
        load: async () => {
          const response = await programApi.programs.list({
            page: 1,
            page_size: 6,
            is_hidden: hidden,
            include_inactive_universities: true,
          });
          const data = collection(response.data);
          return {
            total: data.total,
            items: data.items.map((item) => ({
              id: item.id,
              title: item.name,
              description: [item.university?.name, item.branch?.name]
                .filter(Boolean)
                .join(" · "),
              href: idPath(`${base}/knowledge-hub`, item.id),
              actionLabel: hidden ? "Review program" : "Open program",
            })),
          };
        },
      });
    add({
      id: "institutions",
      title: "Universities",
      subtitle: "Universities in the catalogue",
      href: `${base}/universities`,
      emptyMessage: "No universities yet.",
      load: async () => {
        const response = await universityApi.universities.list({
          page: 1,
          page_size: 1,
          include_inactive_universities: true,
        });
        return { total: collection(response.data).total, items: [] };
      },
    });
  }
  add({
    id: "unread",
    title: "Unread updates",
    subtitle: "Your notifications",
    href: `${base}/notifications`,
    emptyMessage: "No unread updates.",
    load: async () => {
      const response = await notificationsApi.unreadCount();
      if (
        typeof response.data.count !== "number" ||
        !Number.isFinite(response.data.count) ||
        response.data.count < 0
      )
        throw new Error("Unread updates couldn't be loaded.");
      return { total: response.data.count, items: [] };
    },
  });
  add({
    id: "updates",
    title: "Recent activity",
    subtitle: "The latest notifications for your account.",
    href: `${base}/notifications`,
    emptyMessage: "No updates yet. New activity will appear here.",
    load: async () => {
      const response = await notificationsApi.list({
        page: 1,
        page_size: 6,
        read_status: "all",
      });
      const data = collection(response.data);
      return {
        total: data.total,
        items: data.items
          .map((item) => ({
            id: item.id,
            // Every item names who did it ("Unibexs moved…"), the same sender as the Notifications page.
            title: say(`${getSenderName(item, { forAdvisor: role === "partner" })} ${item.title}`),
            description: say(item.body),
            at: item.created_at,
            // The application the update is about, where the role has application pages.
            href:
              item.application_id && ["admin", "account_manager", "partner"].includes(role)
                ? idPath(`${base}/applications`, item.application_id)
                : item.type === "partner_signed_up" && item.data?.partner_id && (role === "admin" || role === "reviewer")
                ? idPath(`${base}/advisors`, String(item.data.partner_id))
                : `${base}/notifications`,
          }))
          .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
      };
    },
  });
  return [...plans, ...createDashboardPlans(context)];
}
