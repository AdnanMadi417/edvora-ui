import { getApiStageTagId } from "config/applicationStages";
import Cookies from "js-cookie";
import api from "lib/useApi";
import { partnersApi } from "features/partners/services";
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
const PARTNER_ACTIONS = new Set([
  "correction_requested_by_account_manager",
  "university_requested_corrections",
  "program_change_suggested",
  "waiting_for_payment",
  "payment_rejected",
  "waiting_partner_to_confirm_arrival_date",
  "upload_emgs_eval",
  "eval_re-upload_required",
  "upload_e-visa",
  "e-visa_re-upload_required",
  "upload_visa_stage_documents",
  "visa_documents_re-upload_required",
  "upload_extra_arrival_documents",
  "extra_arrival_documents_re-upload_required",
  "commission_ready",
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

export function createOverviewPlan(context: OverviewContext): ResourcePlan[] {
  const { role, partnerId, agencyAdmin, canViewCommission } = context;
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
          const actions = role === "partner" ? PARTNER_ACTIONS : STAFF_ACTIONS;
          const items = data.items
            .filter(
              (item) =>
                status !== "active" ||
                (actions.has(normalize(item.status)) &&
                  (role !== "partner" ||
                    canViewCommission ||
                    normalize(item.status) !== "commission_ready"))
            )
            .slice(0, 6)
            .map(
              (item): OverviewItem => ({
                id: item.id,
                title: item.next_action || "Review application",
                description: [item.student_name, item.university_name]
                  .filter(Boolean)
                  .join(" · "),
                href: idPath(`${base}/applications`, item.id),
                status: item.status,
              })
            );
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
                label: stage.name,
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
        return {
          total: data.total,
          items: data.items.map((item) => ({
            id: item.id,
            title: item.name,
            description: [
              item.type === "agency" ? "Agency" : "Individual advisor",
              item.country,
            ]
              .filter(Boolean)
              .join(" · "),
            href: idPath(`${base}/advisors`, item.id),
            at: item.created_at,
          })),
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
            description: String(
              item.progress || "Registration in progress"
            ).replace(/_/g, " "),
            href: `${base}/advisors?tab=pending-otps`,
            at: item.created_at,
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
            description: [item.reference, item.university_name]
              .filter(Boolean)
              .join(" · "),
            href:
              role === "admin"
                ? "/admin/finance-queue"
                : "/partner/commission-tracker",
          })),
        };
      },
    });
  }
  if (role === "data_entry") {
    for (const hidden of [false, true])
      add({
        id: hidden ? "hiddenPrograms" : "programs",
        title: hidden ? "Hidden programmes to review" : "Visible programmes",
        subtitle: hidden
          ? "Review catalogue entries that are hidden from advisors."
          : "Programmes currently available in the catalogue.",
        href: `${base}/knowledge-hub`,
        emptyMessage: hidden
          ? "No programmes are hidden from advisors."
          : "No visible programmes yet.",
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
            })),
          };
        },
      });
    add({
      id: "institutions",
      title: "Institutions",
      subtitle: "Institutions in the catalogue",
      href: `${base}/universities`,
      emptyMessage: "No institutions yet.",
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
            title: item.title,
            description: item.body,
            at: item.created_at,
            href: `${base}/notifications`,
          }))
          .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
      };
    },
  });
  return plans;
}
