import Cookies from "js-cookie";
import api from "lib/useApi";
import { isAdvisorAction } from "features/applications/stages";
import { unibexsVoice } from "lib/unibexsVoice";
import { programApi } from "features/programs/services/programApi";
import { universityApi } from "features/universities/services/universityApi";
import { languageCentersApi } from "features/universities/language-centers/api";
import { commissionsApi } from "features/applications/payouts/services/commissionsApi";
import { statementApi } from "features/partners/statement/services/statementApi";
import {
  completeCollection,
  groupPaidByMonth,
  groupUniversityCommission,
} from "../model/dashboardData";
import type {
  OverviewContext,
  OverviewItem,
  ResourcePlan,
} from "../model/types";
import { relabelText, statusLabel } from "config/statusLabels";
const staffActions = new Set([
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
const normalize = (text = "") => text.toLowerCase().trim().replace(/\s+/g, "_");
export function createDashboardPlans(context: OverviewContext): ResourcePlan[] {
  const plans: ResourcePlan[] = [];
  const base = `/${context.role.replace(/_/g, "-")}`;
  if (
    ["admin", "account_manager", "partner"].includes(context.role) &&
    (context.role !== "partner" || context.partnerId)
  ) {
    const endpoint =
      context.role === "admin"
        ? "/admin/applications"
        : context.role === "account_manager"
        ? "/account-managers/applications"
        : `/partners/${encodeURIComponent(context.partnerId!)}/applications`;
    plans.push({
      id: "actionRequired",
      title:
        context.role === "partner"
          ? "Your next steps"
          : context.role === "account_manager"
          ? "Follow-ups requiring action"
          : "Applications requiring action",
      subtitle:
        context.role === "partner"
          ? "Documents, payments and corrections waiting for you."
          : context.role === "account_manager"
          ? "Actionable applications from your assigned and shared advisors."
          : "Applications ready for your team’s next step.",
      href: `${base}/applications`,
      emptyMessage:
        "You’re caught up. No applications currently require your action.",
      load: async () => {
        const rows = await completeCollection((page) =>
          api.get(endpoint, {
            headers: Cookies.get("token")
              ? { Authorization: `Bearer ${Cookies.get("token")}` }
              : {},
            params: {
              status: "active",
              limit: 100,
              offset: (page - 1) * 100,
              ...(context.role === "partner" && context.agencyAdmin
                ? { include_members: true }
                : {}),
            },
          })
        );
        const actionable = rows.filter((item) =>
          context.role === "partner"
            ? isAdvisorAction(item.status) &&
              (context.canViewCommission ||
                normalize(item.status) !== "commission_ready")
            : staffActions.has(normalize(item.status))
        );
        // Every active application per university, for the home split (same scope as the pipeline).
        const perUniversity = new Map<string, number>();
        for (const row of rows) {
          const name = row.university_name?.trim() || "University unavailable";
          perUniversity.set(name, (perUniversity.get(name) ?? 0) + 1);
        }
        return {
          total: actionable.length,
          byUniversity: [...perUniversity].map(([label, value]) => ({ key: label, label, value })),
          items: actionable.slice(0, 6).map(
            (item): OverviewItem => ({
              id: item.id,
              title:
                context.role === "partner"
                  ? unibexsVoice(relabelText(item.next_action || "Review application"))
                  : relabelText(item.next_action || "Review application"),
              description: [item.student_name, item.university_name]
                .filter(Boolean)
                .join(" · "),
              href: `${base}/applications/${encodeURIComponent(item.id)}`,
              status: item.status,
              // The same status label as every other screen.
              statusLabel: statusLabel(item.status),
            })
          ),
        };
      },
    });
  }
  if (
    context.role === "admin" ||
    (context.role === "partner" &&
      context.partnerId &&
      context.canViewCommission)
  ) {
    plans.push({
      id: "universityCommission",
      title: "Commission by university",
      subtitle:
        "University processing, ready for payout and settled commissions. Currencies stay separate.",
      href:
        context.role === "admin"
          ? "/admin/finance-queue"
          : "/partner/commission-tracker",
      emptyMessage:
        "University commission will appear when applications reach the commission stage.",
      load: async () => {
        const admin = context.role === "admin";
        const [rows, universities] = await Promise.all([
          completeCollection((page) =>
            admin
              ? commissionsApi.list({ page, page_size: 100 })
              : statementApi.list({ page, page_size: 100 })
          ),
          completeCollection((page) =>
            universityApi.universities.list({
              page,
              page_size: 100,
              ...(admin
                ? { include_inactive_universities: true }
                : { is_hidden: false }),
            })
          ).catch(() => []),
        ]);
        return {
          total: rows.length,
          items: [],
          universityCommission: groupUniversityCommission(rows, admin),
          paidByMonth: groupPaidByMonth(rows, admin),
          universities: universities.map((item) => ({
            id: item.id,
            name: item.name,
            logo_file_key: item.logo_file_key,
          })),
        };
      },
    });
  }
  if (context.role === "data_entry") {
    plans.push({
      id: "catalogueQuality",
      title: "Catalogue records to complete",
      subtitle:
        "Checks required program fields and delivery mode. Optional information is not flagged.",
      href: `${base}/knowledge-hub`,
      emptyMessage: "All programs pass the required-field checks.",
      load: async () => {
        const lists = await Promise.all(
          [false, true].map((is_hidden) =>
            completeCollection((page) =>
              programApi.programs.list({
                page,
                page_size: 100,
                is_hidden,
                include_inactive_universities: true,
              })
            )
          )
        );
        const rows = [
          ...new Map(lists.flat().map((item) => [item.id, item])).values(),
        ];
        const checks = rows
          .map((item) => ({
            item,
            missing: [
              !item.name?.trim() ? "program name" : "",
              !item.university?.id ? "university" : "",
              !(item.qualification_id || item.qualification_level)
                ? "qualification"
                : "",
              !(item.field_of_study_id || item.field_of_study?.id)
                ? "field of study"
                : "",
              !(item.is_on_campus || item.is_online) ? "delivery mode" : "",
            ].filter(Boolean),
          }))
          .filter((row) => row.missing.length);
        return {
          total: checks.length,
          items: checks.slice(0, 6).map(({ item, missing }) => ({
            id: item.id,
            title: item.name || "Unnamed program",
            description: `Complete: ${missing.join(", ")}`,
            href: `${base}/knowledge-hub/${encodeURIComponent(item.id)}/edit`,
          })),
        };
      },
    });
    plans.push({
      id: "languageCenters",
      title: "Language centers",
      subtitle: "Centers available in the university catalogue.",
      href: `${base}/language-centers`,
      emptyMessage: "No language centers yet.",
      load: async () => {
        const { data } = await languageCentersApi.list();
        return {
          total: data.items.length,
          items: data.items.slice(0, 6).map((item) => ({
            id: item.id,
            title: item.name,
            description: item.location,
            href: `${base}/language-centers`,
          })),
        };
      },
    });
  }
  return plans;
}
